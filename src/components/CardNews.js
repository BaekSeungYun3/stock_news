import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/CardNews.css'; // 스타일 연결
import NewsDetail from '../pages/NewsDetail'; // 세부 뉴스 컴포넌트 임포트

const CardNews = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedArticle, setSelectedArticle] = useState(null); // 선택된 기사

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await axios.get('http://localhost:3001/news'); // 서버 API 호출
                setArticles(response.data);
            } catch (error) {
                console.error('뉴스 데이터를 불러오는 중 오류 발생:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    if (loading) return <p>로딩 중입니다...</p>;

    if (selectedArticle) {
        // 선택된 기사가 있으면 NewsDetail 컴포넌트를 렌더링
        return <NewsDetail article={selectedArticle} onBack={() => setSelectedArticle(null)} />;
    }

    return (
        <div className="news-container">
            {articles.map((article, index) => (
                <div className="news-card" key={index} onClick={() => setSelectedArticle(article)}>
                    <h3>{article.title}</h3>
                    <p>{article.summary}</p>
                    <p className="sentiment">
                        감정 점수: {article.sentimentScore.toFixed(2)}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default CardNews;
