// src/components/NewsCard.js
import React from 'react';
import '../styles/NewsCard.css';

const NewsCard = ({ title, url }) => {
  return (
    <div className="news-card">
      <h4>{title}</h4>
      <a href={url} target="_blank" rel="noopener noreferrer">
        더보기
      </a>
    </div>
  );
};

export default NewsCard;
