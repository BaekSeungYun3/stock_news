require('dotenv').config();
const express = require('express');
const axios = require('axios');
const moment = require('moment');
const app = express();
const port = 3000;

// 환경 변수로부터 API 키 가져오기
const apiKey = process.env.DEEPSEARCH_API_KEY;
if (!apiKey) {
    console.error("API Key가 설정되지 않았습니다.");
    process.exit(1); // API 키가 없을 경우 서버 종료
}

// 뉴스 데이터를 API에서 가져오는 함수
const fetchSamsungNews = async () => {
    const url = `https://api-v2.deepsearch.com/v1/articles?company_name=삼성전자&date_from=2024-01-01&date_to=2024-12-31&page_size=50`;

    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        console.log("Fetched data:", response.data); // 데이터 출력 확인
        const articles = response.data.data;

        // 감정 점수 설정
        articles.forEach(article => {
            if (article.esg && article.esg.polarity && typeof article.esg.polarity.score !== 'undefined') {
                article.sentimentScore = article.esg.polarity.score;
            } else {
                article.sentimentScore = 0;
            }
        });

        return articles;
    } catch (error) {
        console.error("API 요청 오류:", error);
        return [];
    }
};

// 뉴스 데이터를 제공하는 API 엔드포인트
app.get('/news', async (req, res) => {
    try {
        const articles = await fetchSamsungNews(); // 뉴스 데이터 가져오기
        res.json(articles);  // 클라이언트에 JSON으로 데이터 전송
    } catch (error) {
        res.status(500).json({ error: "뉴스 데이터를 불러오는 중 오류가 발생했습니다." });
    }
});

// 서버 시작
app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
