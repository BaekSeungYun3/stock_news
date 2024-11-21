import React from 'react';
import '../styles/NewsDetail.css'; // 세부 뉴스 스타일 연결

const NewsDetail = ({ article, onBack }) => {
    return (
        <div className="news-detail">
            <button className="back-button" onClick={onBack}>뒤로가기</button>
            <h1>{article.title}</h1>
            <p>{article.content}</p> {/* 기사 본문 */}
            <p className="sentiment">
                감정 점수: {article.sentimentScore.toFixed(2)}
            </p>
            <a href={article.url} target="_blank" rel="noopener noreferrer">
                원문 읽기
            </a>
        </div>
    );
};

export default NewsDetail;
