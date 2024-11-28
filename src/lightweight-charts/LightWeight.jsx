import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import './LightWeight.css';

const LightWeight = () => {
    const chartContainerRef = useRef();
    const chartInstanceRef = useRef();
    const candlestickSeriesRef = useRef();
    const volumeSeriesRef = useRef();
    const maSeriesRef = useRef();
    const [interval, setInterval] = useState(60);

    useEffect(() => {
        const chart = createChart(chartContainerRef.current, {
            layout: { textColor: '#DDD', background: { type: 'solid', color: '#222' } },
            crosshair: {
                mode: 1,
                horzLine: { visible: true, labelVisible: true, labelBackgroundColor: '#9B7DFF' },
                vertLine: { visible: true, labelVisible: true, labelBackgroundColor: '#9B7DFF' },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
                borderColor: '#71649C',
            },
            grid: {
                vertLines: { color: '#444' },
                horzLines: { color: '#444' },
            },
        });
        chartInstanceRef.current = chart;

        candlestickSeriesRef.current = chart.addCandlestickSeries({
            upColor: 'rgb(225, 50, 85)',
            downColor: 'rgb(54, 116, 217)',
            borderVisible: false,
            wickUpColor: 'rgb(225, 50, 85)',
            wickDownColor: 'rgb(54, 116, 217)',
        });

        candlestickSeriesRef.current.applyOptions({
            lastValueVisible: true,
            priceLineVisible: true,
        });

        volumeSeriesRef.current = chart.addHistogramSeries({
            priceFormat: { type: 'volume' },
            priceScaleId: '',
            upColor: 'rgb(225, 50, 85)',
            downColor: 'rgb(54, 116, 217)',
            visible: true,
        });

        volumeSeriesRef.current.applyOptions({
            lastValueVisible: true,
            priceLineVisible: true,
        });

        volumeSeriesRef.current.priceScale().applyOptions({
            borderColor: '#71649C',
            scaleMargins: { top: 0.9, bottom: 0 },
        });

        maSeriesRef.current = chart.addLineSeries({
            color: '#FF9800',
            lineWidth: 2,
            lastValueVisible: false,
            priceLineVisible: false,
        });

        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/stock-data');
                const data = await response.json();
                const processedData = processData(data);
                updateChartData(processedData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();

        const handleResize = () => {
            chart.resize(chartContainerRef.current.clientWidth, chartContainerRef.current.clientHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            chart.remove();
            window.removeEventListener('resize', handleResize);
        };
    }, [interval]);

    const processData = (data) => {
        const priceDataMap = {};

        data.forEach(item => {
            const { 거래일, 매매처리시각, price, volume } = item; // 거래일과 매매처리시각 가져오기
            const year = 거래일.slice(0, 4); // YYYY
            const month = 거래일.slice(4, 6); // MM
            const day = 거래일.slice(6, 8); // DD
            const hours = 매매처리시각.slice(0, 2); // HH
            const minutes = 매매처리시각.slice(2, 4); // MM

            // 타임스탬프 생성 (UTC)
            const timeStamp = new Date(Date.UTC(
                Number(year),
                Number(month) - 1, // 0-based index
                Number(day),
                Number(hours),
                Number(minutes)
            )).getTime() / 1000;

            // 가격 데이터 집계
            const minute = Math.floor(timeStamp / interval) * interval;
            if (!priceDataMap[minute]) {
                priceDataMap[minute] = { open: price, high: price, low: price, close: price, volume };
            } else {
                priceDataMap[minute].high = Math.max(priceDataMap[minute].high, price);
                priceDataMap[minute].low = Math.min(priceDataMap[minute].low, price);
                priceDataMap[minute].close = price;
                priceDataMap[minute].volume += volume;
            }
        });

        return Object.entries(priceDataMap).map(([minute, { open, high, low, close, volume }]) => ({
            time: Number(minute),
            open,
            high,
            low,
            close,
            volume,
        }));
    };

    const calculateMovingAverage = (data, maLength) => {
        const maData = [];

        for (let i = 0; i < data.length; i++) {
            if (i < maLength) {
                maData.push({ time: data[i].time });
            } else {
                let sum = 0;
                for (let j = 0; j < maLength; j++) {
                    sum += data[i - j].close;
                }
                const maValue = sum / maLength;
                maData.push({ time: data[i].time, value: maValue });
            }
        }

        return maData;
    };

    const updateChartData = (data) => {
        const candlestickSeries = candlestickSeriesRef.current;
        const volumeSeries = volumeSeriesRef.current;
        const maSeries = maSeriesRef.current;

        if (!candlestickSeries || !volumeSeries || !maSeries) return;

        candlestickSeries.setData(data);

        const volumeData = data.map((item, index) => {
            const previousVolume = index > 0 ? data[index - 1].volume : 0; // 이전 거래량

            return {
                time: item.time,
                value: item.volume,
                color: item.volume > previousVolume ? 'rgb(225, 50, 85)' : 'rgb(54, 116, 217)', // 이전 거래량과 비교
            };
        });

        volumeSeries.setData(volumeData);

        // 1분 간격일 때만 이동 평균을 업데이트
        if (interval === 60) {
            const maData = calculateMovingAverage(data, 20);
            maSeries.setData(maData);
        } else {
            maSeries.setData([]); // 다른 간격에서는 이동 평균 데이터를 비움
        }

        // x축 레이블 포맷
        const timeScale = chartInstanceRef.current.timeScale();
        timeScale.fitContent(); // 차트에 맞게 x축 시간 조정

        // Custom label formatting
        const labelFormatter = (timestamp) => {
            const date = new Date(timestamp * 1000);
            const yy = String(date.getUTCFullYear()).slice(2); // YY
            const mm = String(date.getUTCMonth() + 1).padStart(2, '0'); // MM
            const dd = String(date.getUTCDate()).padStart(2, '0'); // DD
            const hh = String(date.getUTCHours()).padStart(2, '0'); // HH
            const min = String(date.getUTCMinutes()).padStart(2, '0'); // MM
            return `${yy}${mm}${dd} ${hh}${min}`; // 'YYMMDD HHMM'
        };

        // 시간 포맷팅을 위한 설정을 추가합니다.
        timeScale.setVisibleRange(timeScale.getVisibleRange());
    };

    const handleIntervalChange = (event) => {
        setInterval(Number(event.target.value));
    };

    return (
        <div className="chart-container">
            <select onChange={handleIntervalChange} className="dropdown">
                <option value={60}>1분</option>
                <option value={1800}>30분</option>
                <option value={3600}>1시간</option>
            </select>
            <div ref={chartContainerRef} className="chart" />
        </div>
    );    
};

export default LightWeight;
