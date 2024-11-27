import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { Line } from "react-chartjs-2";
import "react-circular-progressbar/dist/styles.css";
import "../styles/Dashboard.css";

// Chart.js 스케일과 플러그인 등록
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [positivePercentage, setPositivePercentage] = useState(0);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    // 뉴스 데이터 가져오기
    fetch("http://localhost:3001/news")
      .then((response) => response.json())
      .then((data) => {
        setArticles(data);
        const positiveCount = data.filter(
          (article) => article.sentimentScore === 1
        ).length;
        const percentage = Math.round((positiveCount / data.length) * 100);
        setPositivePercentage(percentage);
        setLoading(false);
      })
      .catch((error) => {
        console.error("뉴스 데이터 로드 실패:", error);
        setLoading(false);
      });

    // 실시간 주식 데이터 가져오기
    const fetchStockData = () => {
      fetch("http://localhost:3001/stocks")
        .then((response) => response.json())
        .then((data) => {
          const labels = data.map((point) => point.time);
          const prices = data.map((point) => point.price);
          setStockData({
            labels,
            datasets: [
              {
                label: "주식 가격",
                data: prices,
                borderColor: "#4a90e2",
                borderWidth: 2,
                tension: 0.1,
              },
            ],
          });
        })
        .catch((error) => console.error("주식 데이터 로드 실패:", error));
    };

    // 주기적으로 데이터 갱신
    const interval = setInterval(fetchStockData, 5000);
    fetchStockData();
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div>
        <Header />
        <div className="dashboard-container">
          <h1>데이터 로드 중...</h1>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-top">
          <div
            className="card sentiment-card"
            onClick={() =>
              navigate("/sentiment", { state: { positivePercentage, articles } })
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
            <Line
              data={stockData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: true,
                    position: "top",
                  },
                  tooltip: {
                    enabled: true,
                  },
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: "시간",
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: "가격",
                    },
                  },
                },
              }}
            />
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
