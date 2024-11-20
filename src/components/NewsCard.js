import React from 'react';
import '../styles/NewsCard.css';

const NewsCard = ({ title }) => {
  return (
    <div className="news-card">
      <h4>{title}</h4>
    </div>
  );
};

export default NewsCard;
