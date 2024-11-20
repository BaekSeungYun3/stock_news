import React from 'react';
import Header from '../components/Header';
import { useParams } from 'react-router-dom';

const NewsDetail = () => {
  const { id } = useParams();

  return (
    <div>
      <Header />
      <div className="news-detail">
        <h1>뉴스 {id} 상세 정보</h1>
        <p>여기에 뉴스 상세 내용이 표시됩니다.</p>
      </div>
    </div>
  );
};

export default NewsDetail;
