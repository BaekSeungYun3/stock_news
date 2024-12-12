import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createChart } from "lightweight-charts";
import Header from "../components/Header";
import "../styles/Dashboard.css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const movingAverageSeriesRef = useRef(null);

  const [positivePercentage, setPositivePercentage] = useState(0);
  const [articles, setArticles] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [lastClosePrice, setLastClosePrice] = useState(null);

  const calculateMovingAverage = (data, period) => {
    const movingAverageData = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, item) => acc + item.close, 0);
      const average = sum / period;
      movingAverageData.push({ time: data[i].time, value: average });
    }
    return movingAverageData;
  };

  const validateAndSortData = (data) => {
    return data
      .filter((item) => item.time && !isNaN(item.time))
      .sort((a, b) => a.time - b.time);
  };

  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        const response = await fetch("http://localhost:3001/news");
        if (!response.ok) throw new Error("뉴스 데이터 로드 실패");
        const data = await response.json();
        setArticles(data);
        const positiveCount = data.filter((article) => article.sentimentScore === 1).length;
        const percentage = Math.round((positiveCount / data.length) * 100);
        setPositivePercentage(percentage);
      } catch (error) {
        console.error("뉴스 데이터 로드 오류:", error);
      }
    };

    fetchNewsData();

    if (chartContainerRef.current) {
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.offsetWidth || 300,
        height: 150,
        layout: {
          textColor: "#D9D9D9",
          background: { type: "solid", color: "#1E1E1E" },
        },
        grid: {
          vertLines: { color: "#444" },
          horzLines: { color: "#444" },
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },
      });

      candlestickSeriesRef.current = chart.addCandlestickSeries({
        upColor: "rgb(225, 50, 85)",
        downColor: "rgb(54, 116, 217)",
        borderUpColor: "rgb(225, 50, 85)",
        borderDownColor: "rgb(54, 116, 217)",
        wickUpColor: "rgb(225, 50, 85)",
        wickDownColor: "rgb(54, 116, 217)",
      });

      movingAverageSeriesRef.current = chart.addLineSeries({
        color: "rgba(255, 165, 0, 1)",
        lineWidth: 2,
      });

      chartRef.current = chart;

      const fetchInitialData = async () => {
        try {
          const response = await fetch("http://localhost:3001/stocks");
          if (!response.ok) throw new Error("데이터 로드 실패");
          const data = await response.json();

          const candlestickData = validateAndSortData(
            data.map((item) => ({
              time: Math.floor(new Date(`${item.time_group}Z`).getTime() / 1000),
              open: Number(item.openingPrice),
              high: Number(item.highPrice),
              low: Number(item.lowPrice),
              close: Number(item.closingPrice),
            }))
          );

          setChartData(candlestickData);
          candlestickSeriesRef.current.setData(candlestickData);

          const movingAverageData = calculateMovingAverage(candlestickData, 5);
          movingAverageSeriesRef.current.setData(movingAverageData);

          if (candlestickData.length > 0) {
            setLastClosePrice(candlestickData[candlestickData.length - 1].close);
          }
        } catch (error) {
          console.error("초기 데이터 로드 오류:", error);
        }
      };

      fetchInitialData();

      const socket = new WebSocket("ws://localhost:8080");

      socket.onopen = () => {
        console.log("WebSocket 연결 성공");
      };

      socket.onerror = (error) => {
        console.error("WebSocket 오류:", error);
      };

      socket.onmessage = (event) => {
        try {
          const rawData = JSON.parse(event.data);

          const websocketTime = Math.floor(
            new Date(`${rawData.transactionDate}T${rawData.timestamp.slice(0, 2)}:${rawData.timestamp.slice(2, 4)}:00Z`).getTime() / 1000
          );

          if (isNaN(websocketTime)) {
            console.error("잘못된 시간 데이터:", rawData.timestamp);
            return;
          }

          const candlestickPoint = {
            time: websocketTime,
            open: lastClosePrice || Number(rawData.price),
            high: Number(rawData.highPrice),
            low: Number(rawData.lowPrice),
            close: Number(rawData.price),
            volume: Number(rawData.volume),
          };

          setChartData((prevData) => {
            const updatedData = [...prevData];
            const existingPoint = updatedData.find((item) => item.time === candlestickPoint.time);
          
            if (existingPoint) {
              existingPoint.high = Math.max(existingPoint.high, candlestickPoint.high);
              existingPoint.low = Math.min(existingPoint.low, candlestickPoint.low);
              existingPoint.close = candlestickPoint.close;
              existingPoint.volume += candlestickPoint.volume;
            } else {
              updatedData.push(candlestickPoint);
            }
          
            // 배열 길이 제한을 제거했습니다.
            candlestickSeriesRef.current.setData(updatedData);
          
            const movingAverageData = calculateMovingAverage(updatedData, 5);
            movingAverageSeriesRef.current.setData(movingAverageData);
          
            return updatedData;
          });
          

          setLastClosePrice(candlestickPoint.close);
        } catch (error) {
          console.error("WebSocket 데이터 처리 오류:", error);
        }
      };

      socket.onclose = () => {
        console.log("WebSocket 연결 종료");
      };

      return () => {
        chart.remove();
        socket.close();
      };
    }
  }, []);

  return (
    <div>
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-top">
          <div
            className="card sentiment-card"
            onClick={() =>
              navigate("/sentiment", {
                state: { positivePercentage, articles },
              })
            }
          >
            <div className="sentiment-content">
              <div className="sentiment-text">
                <h3>시장, 투자자 감정 분석 결과</h3>
                <p>{positivePercentage}% 긍정</p>
              </div>
              <div className="sentiment-graph">
                <CircularProgressbar
                  value={positivePercentage}
                  text={`${positivePercentage}%`}
                  styles={buildStyles({
                    pathColor: "#4a3b8b",
                    textColor: "#4a3b8b",
                    trailColor: "#eef2f7",
                    textSize: "18px",
                  })}
                />
              </div>
            </div>
          </div>

          <div
            className="card graph-card"
            onClick={() => navigate("/realtime")}
          >
            <h3>실시간 주식 그래프</h3>
            <div ref={chartContainerRef} className="chart-preview">
              {!chartData.length && (
                <div className="graph-placeholder">차트 데이터 로드 중...</div>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-bottom">
          <h3>관련 뉴스 제공</h3>
          <div className="articles-container">
            {articles.map((article, index) => (
              <div
                key={index}
                className="news-card"
                onClick={() =>
                  window.open(article.url, "_blank", "noopener,noreferrer")
                }
              >
                {article.image_url && (
                  <img
                    src={article.image_url}
                    alt="기사 이미지"
                    className="news-image"
                  />
                )}
                <h2 className="news-title">{article.title}</h2>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
