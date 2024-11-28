import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
<<<<<<< HEAD
import "react-circular-progressbar/dist/styles.css";
import "../styles/Dashboard.css";

=======
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

>>>>>>> d4e0776154795b863125d6863841dba6f6e12a10
const Dashboard = () => {
  const navigate = useNavigate();
  const [positivePercentage, setPositivePercentage] = useState(0);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD

  useEffect(() => {
    // 서버에서 데이터 가져오기
=======
  const [stockData, setStockData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    // 뉴스 데이터 가져오기
>>>>>>> d4e0776154795b863125d6863841dba6f6e12a10
    fetch("http://localhost:3001/news")
      .then((response) => response.json())
      .then((data) => {
        setArticles(data);
<<<<<<< HEAD
        // 긍정 비율 계산
=======
>>>>>>> d4e0776154795b863125d6863841dba6f6e12a10
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
<<<<<<< HEAD
=======

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
>>>>>>> d4e0776154795b863125d6863841dba6f6e12a10
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
<<<<<<< HEAD
          {/* 시장 분석 결과 박스 */}
=======
>>>>>>> d4e0776154795b863125d6863841dba6f6e12a10
          <div
            className="card sentiment-card"
            onClick={() =>
              navigate("/sentiment", { state: { positivePercentage, articles } })
            }
          >
            <div className="sentiment-content">
<<<<<<< HEAD
              {/* 왼쪽 텍스트 */}
=======
>>>>>>> d4e0776154795b863125d6863841dba6f6e12a10
              <div className="sentiment-text">
                <h3>시장, 투자자 감정 분석 결과</h3>
                <p>{positivePercentage}% 긍정</p>
              </div>
<<<<<<< HEAD
              {/* 오른쪽 원형 그래프 */}
=======
>>>>>>> d4e0776154795b863125d6863841dba6f6e12a10
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
<<<<<<< HEAD
          </div>  

          {/* 실시간 주식 그래프 박스 */}
=======
          </div>

>>>>>>> d4e0776154795b863125d6863841dba6f6e12a10
          <div
            className="card graph-card"
            onClick={() => navigate("/realtime")}
          >
            <h3>실시간 주식 그래프</h3>
<<<<<<< HEAD
            <div className="graph-placeholder">[실시간 그래프]</div>
          </div>
        </div>

        {/* 카드 뉴스 섹션 */}
=======
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

>>>>>>> d4e0776154795b863125d6863841dba6f6e12a10
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
<<<<<<< HEAD
                {/* 기사 이미지 */}
=======
>>>>>>> d4e0776154795b863125d6863841dba6f6e12a10
                {article.image_url && (
                  <img
                    src={article.image_url}
                    alt="기사 이미지"
                    className="news-image"
                  />
                )}
<<<<<<< HEAD
                {/* 기사 제목 */}
                <h2 className="news-title">{article.title}</h2>

=======
                <h2 className="news-title">{article.title}</h2>
>>>>>>> d4e0776154795b863125d6863841dba6f6e12a10
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
