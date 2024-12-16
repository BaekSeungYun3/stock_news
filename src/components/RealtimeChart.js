import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import "./LightWeight.css";

const RealtimeChart = () => {
  const priceChartRef = useRef(null);
  const volumeChartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const movingAverageSeriesRef = useRef(null);
  const userPriceSeriesRef = useRef(null); // 사용자 주식 데이터를 위한 라인 시리즈

  const [candlestickData, setCandlestickData] = useState([]);
  const [totalVolume, setTotalVolume] = useState(0); // 전체 누적 거래량
  const [lastClosePrice, setLastClosePrice] = useState(null); // 이전 분의 종가 저장

  // 이동 평균 계산 함수
  const calculateMovingAverage = (data, period) => {
    const movingAverageData = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data
        .slice(i - period + 1, i + 1)
        .reduce((acc, item) => acc + item.close, 0);
      const average = sum / period;
      movingAverageData.push({ time: data[i].time, value: average });
    }
    return movingAverageData;
  };

  // 차트 동기화 함수
  const synchronizeCharts = (sourceChart, targetChart) => {
    // TimeScale 동기화
    sourceChart.timeScale().subscribeVisibleTimeRangeChange((newVisibleRange) => {
      if (newVisibleRange) {
        targetChart.timeScale().setVisibleRange(newVisibleRange);
      }
    });

    // LogicalRange 동기화 (줌/스크롤 동작)
    sourceChart.timeScale().subscribeVisibleLogicalRangeChange((logicalRange) => {
      if (logicalRange) {
        targetChart.timeScale().setVisibleLogicalRange(logicalRange);
      }
    });
  };

  useEffect(() => {
    if (!priceChartRef.current && !volumeChartRef.current) {
      const priceChart = createChart(document.getElementById("price-chart"), {
        layout: { textColor: "#D9D9D9", background: { type: "solid", color: "#1E1E1E" } },
        grid: { vertLines: { color: "#444" }, horzLines: { color: "#444" } },
        timeScale: { timeVisible: true, secondsVisible: false },
        height: 400,
      });

      const volumeChart = createChart(document.getElementById("volume-chart"), {
        layout: { textColor: "#D9D9D9", background: { type: "solid", color: "#1E1E1E" } },
        grid: { vertLines: { color: "#444" }, horzLines: { color: "#444" } },
        timeScale: { timeVisible: true, secondsVisible: false },
        height: 150,
      });

      candlestickSeriesRef.current = priceChart.addCandlestickSeries({
        upColor: "rgb(225, 50, 85)",
        downColor: "rgb(54, 116, 217)",
        borderUpColor: "rgb(225, 50, 85)",
        borderDownColor: "rgb(54, 116, 217)",
        wickUpColor: "rgb(225, 50, 85)",
        wickDownColor: "rgb(54, 116, 217)",
      });

      volumeSeriesRef.current = volumeChart.addHistogramSeries({
        priceFormat: { type: "volume" },
        scaleMargins: { top: 0.1, bottom: 0 },
      });

      movingAverageSeriesRef.current = priceChart.addLineSeries({
        color: "rgba(255, 165, 0, 1)",
        lineWidth: 2,
      });

      userPriceSeriesRef.current = priceChart.addLineSeries({
        color: "rgba(0, 255, 0, 1)", // 사용자 주식 데이터는 녹색 라인으로 표시
        lineWidth: 2,
        
      });

      priceChartRef.current = priceChart;
      volumeChartRef.current = volumeChart;

      // 차트 동기화 호출
      synchronizeCharts(priceChart, volumeChart);
      synchronizeCharts(volumeChart, priceChart);
    }

    const fetchInitialData = async () => {
      try {
        const response = await fetch("http://localhost:3001/stocks");
        if (!response.ok) throw new Error("데이터 로드 실패");
        const data = await response.json();

        const formattedCandlestickData = data.map((item, index) => ({
          time: Math.floor(new Date(`${item.time_group}:00Z`).getTime() / 1000),
          open: index === 0 ? (item.openingPrice || item.closingPrice) : Number(item.openingPrice), // 첫 데이터는 이전 종가를 대체하거나 기본값으로 대체
          high: Number(item.highPrice),
          low: Number(item.lowPrice),
          close: Number(item.closingPrice),
          volume: Number(item.totalVolume),
        }));

        console.log("Formatted Data: ", formattedCandlestickData);

        setCandlestickData(formattedCandlestickData);

        if (formattedCandlestickData.length > 0) {
          setLastClosePrice(
            formattedCandlestickData[formattedCandlestickData.length - 1].close
          );
        }

        candlestickSeriesRef.current.setData(formattedCandlestickData);
        volumeSeriesRef.current.setData(
          formattedCandlestickData.map((item) => ({
            time: item.time,
            value: item.volume,
            color: item.close > item.open ? "rgba(225, 50, 85, 1)" : "rgba(54, 116, 217, 1)",
          }))
        );

        if (formattedCandlestickData.length > 0) {
          const movingAverageData = calculateMovingAverage(formattedCandlestickData, 5);
          movingAverageSeriesRef.current.setData(movingAverageData);

          const initialTotalVolume = formattedCandlestickData.reduce(
            (acc, item) => acc + item.volume,
            0
          );
          setTotalVolume(initialTotalVolume);
        }

        // 사용자 매수 평균 표시
      const userResponse = await fetch("http://localhost:3001/api/stocks", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const userData = await userResponse.json();

      const userPrices = userData.map((item) => Number(item.price));
      const averagePrice =
        userPrices.reduce((acc, price) => acc + price, 0) / userPrices.length;

      userPriceSeriesRef.current.setData(
        formattedCandlestickData.map((item) => ({
          time: item.time,
          value: averagePrice,
        }))
      );

    } catch (error) {
      console.error("데이터 로드 오류:", error);
    }
  };

  fetchInitialData();

    fetchInitialData();

    const socket = new WebSocket("ws://localhost:8080");

    socket.onmessage = (event) => {
      try {
        const rawData = JSON.parse(event.data);

        const websocketTime = Math.floor(
          new Date(`${rawData.transactionDate}T${rawData.timestamp.slice(0, 2)}:${rawData.timestamp.slice(2, 4)}:00Z`).getTime() / 1000
        );

        const candlestickPoint = {
          time: websocketTime,
          open: lastClosePrice || Number(rawData.price),
          high: Number(rawData.highPrice),
          low: Number(rawData.lowPrice),
          close: Number(rawData.price),
          volume: Number(rawData.volume),
        };

        setCandlestickData((prev) => {
          const updatedData = prev.map((item) =>
            item.time === candlestickPoint.time
              ? {
                  ...item,
                  high: Math.max(item.high, candlestickPoint.high),
                  low: Math.min(item.low, candlestickPoint.low),
                  close: candlestickPoint.close,
                  volume: item.volume + candlestickPoint.volume,
                }
              : item
          );

          if (!updatedData.find((item) => item.time === candlestickPoint.time)) {
            updatedData.push(candlestickPoint);
          }

          updatedData.sort((a, b) => a.time - b.time);

          setLastClosePrice(candlestickPoint.close);
          setTotalVolume((prevTotalVolume) => prevTotalVolume + candlestickPoint.volume);

          candlestickSeriesRef.current.setData(updatedData);
          volumeSeriesRef.current.setData(
            updatedData.map((item) => ({
              time: item.time,
              value: item.volume,
              color: item.close > item.open ? "rgba(225, 50, 85, 1)" : "rgba(54, 116, 217, 1)",
            }))
          );

          const movingAverageData = calculateMovingAverage(updatedData, 5);
          movingAverageSeriesRef.current.setData(movingAverageData);

          return updatedData;
        });
      } catch (error) {
        console.error("WebSocket 데이터 처리 오류:", error);
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div>
      <div id="price-chart" className="price-chart-container"></div>
      <div id="volume-chart" className="volume-chart-container"></div>
      <div className="legend-container">
        <div className="legend-item" style={{ color: "rgba(0, 255, 0, 1)" }}>
          ● 초록선: 매수금액
        </div>
        <div className="legend-item" style={{ color: "rgba(255, 165, 0, 1)" }}>
          ● 주황선: 평균가
        </div>
        <div className="legend-item">
          <span style={{ color: "rgba(225, 50, 85, 1)" }}>● 빨강</span>/<span style={{ color: "rgba(54, 116, 217, 1)" }}>파랑</span>
          <span style={{ color: "rgba(0, 0, 0, 1)" }}>: 현재가</span>
        </div>
      </div>
    </div>
  );
};

export default RealtimeChart;
