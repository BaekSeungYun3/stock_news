import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-top">
          {/* 시장 분석 결과 박스 */}
          <div
            className="card sentiment-card"
            onClick={() => navigate('/sentiment')} // 박스 클릭 시 이동
          >
            <h3>시장 분석 결과</h3>
            <p className="sentiment-score">70% 긍정</p>
          </div>
          {/* 실시간 주식 그래프 박스 */}
          <div
            className="card graph-card"
            onClick={() => navigate('/realtime')} // 박스 클릭 시 이동
          >
            <h3>실시간 주식 그래프</h3>
            <div className="graph-placeholder">[실시간 그래프]</div>
          </div>
        </div>

        {/* 카드 뉴스 섹션 */}
        <div className="dashboard-bottom">
          <h3>관련 뉴스 제공</h3>
          <div className="news-scroll-container">
            <div
              className="news-card"
              onClick={() => navigate('/news/1')} // 뉴스 1로 이동
            >
              뉴스 1
            </div>
            <div
              className="news-card"
              onClick={() => navigate('/news/2')} // 뉴스 2로 이동
            >
              뉴스 2
            </div>
            <div
              className="news-card"
              onClick={() => navigate('/news/3')} // 뉴스 3로 이동
            >
              뉴스 3
            </div>
            <div
              className="news-card"
              onClick={() => navigate('/news/4')} // 뉴스 4로 이동
            >
              뉴스 4
            </div>
            <div
              className="news-card"
              onClick={() => navigate('/news/5')} // 뉴스 5로 이동
            >
              뉴스 5
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
