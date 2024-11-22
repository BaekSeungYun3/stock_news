import React from 'react';
import Header from '../components/Header';
import '../styles/Sentiment.css';

const Sentiment = () => {
  return (
    <div>
      <Header />
      <div className="sentiment-container">
        <h1>시장 분석 결과</h1>
        <p>감정 분석 결과는 기사 10개를 기반으로 계산되었습니다.</p>
      </div>
    </div>
  );
};

export default Sentiment;
