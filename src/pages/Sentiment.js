import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/Sentiment.css';

const Sentiment = () => {
  const location = useLocation();
  const { positivePercentage, articles } = location.state || { positivePercentage: 0, articles: [] };

  return (
    <div>
      <Header />
      <div className="sentiment-container">
        <h1>시장 분석 결과</h1>
        <p>감정 분석 결과는 기사 {articles.length}개를 기반으로 계산되었습니다.</p>
        <p className="positive-percentage">긍정 비율: {positivePercentage}%</p>
      </div>
      <div className="articles-list">
        {articles.map((article, index) => (
          <div key={index} className="article-item">
            {/* 이미지 렌더링 */}
            {article.image_url && (
              <img
                src={article.image_url}
                alt="기사 이미지"
                className="article-image"
              />
            )}
            <div className="article-content">
              <h2 className="article-title">{article.title}</h2>
              <p className="article-summary">
                <strong>요약:</strong> {article.summary}
              </p>
              <p className="article-published">
                <strong>발행일:</strong> {new Date(article.published_at).toLocaleString()}
              </p>
              <p className="article-sentiment">
                <strong>감정 점수:</strong> {article.sentimentScore}
              </p>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="article-link"
              >
                원문 보기
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sentiment;
