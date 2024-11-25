import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [positivePercentage, setPositivePercentage] = useState(0);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 서버에서 데이터 가져오기
    fetch("http://localhost:3001/news")
      .then((response) => response.json())
      .then((data) => {
        setArticles(data);
        // 긍정 비율 계산
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
          {/* 시장 분석 결과 박스 */}
          <div
            className="card sentiment-card"
            onClick={() =>
              navigate("/sentiment", { state: { positivePercentage, articles } })
            }
          >
            <div className="sentiment-content">
              {/* 왼쪽 텍스트 */}
              <div className="sentiment-text">
                <h3>시장, 투자자 감정 분석 결과</h3>
                <p>{positivePercentage}% 긍정</p>
              </div>
              {/* 오른쪽 원형 그래프 */}
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

          {/* 실시간 주식 그래프 박스 */}
          <div
            className="card graph-card"
            onClick={() => navigate("/realtime")}
          >
            <h3>실시간 주식 그래프</h3>
            <div className="graph-placeholder">[실시간 그래프]</div>
          </div>
        </div>

        {/* 카드 뉴스 섹션 */}
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
                {/* 기사 이미지 */}
                {article.image_url && (
                  <img
                    src={article.image_url}
                    alt="기사 이미지"
                    className="news-image"
                  />
                )}
                {/* 기사 제목 */}
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
