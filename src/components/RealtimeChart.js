import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

const RealtimeChart = () => {
  const [stockData, setStockData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      console.log("WebSocket 연결 성공");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const newTime = data.timestamp;
      const newPrice = data.price;

      setStockData((prevState) => ({
        labels: [...prevState.labels, newTime],
        datasets: [
          {
            label: "주식 가격",
            data: [...(prevState.datasets[0]?.data || []), newPrice],
            borderColor: "#4a90e2",
            fill: false,
          },
        ],
      }));
    };

    return () => socket.close();
  }, []);

  return (
    <div>
      <h1>실시간 주식 그래프</h1>
      <Line data={stockData} />
    </div>
  );
};

export default RealtimeChart;