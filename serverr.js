require("dotenv").config(); // .env 파일 로드
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3001;

// MariaDB 연결 설정
const dbConnection = mysql.createConnection({
  host: process.env.STOCK_DB_HOST, // .env 파일에서 읽어오기
  user: process.env.STOCK_DB_USER,
  password: process.env.STOCK_DB_PASSWORD,
  database: process.env.STOCK_DB_NAME,
  port: process.env.STOCK_DB_PORT,
});

// 데이터베이스 연결 확인
dbConnection.connect((err) => {
  if (err) {
    console.error("❌ 데이터베이스에 연결할 수 없습니다: ", err);
    process.exit(1); // 연결 실패 시 서버 종료
  }
  console.log("✅ 데이터베이스에 연결되었습니다.");
});

// CORS 설정
app.use(
  cors({
    origin: "http://localhost:3000", // 프론트엔드 URL
  })
);

// JSON 파싱 미들웨어
app.use(express.json());

// ---- [1] 뉴스 API 엔드포인트 ----
app.get("/news", async (req, res) => {
  const API_KEY = process.env.DEEPSEARCH_API_KEY; // .env에서 API 키 읽기
  const url = `https://api-v2.deepsearch.com/v1/articles?company_name=삼성전자&date_from=2024-01-01&date_to=2024-12-31&page_size=50`;

  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${API_KEY}` }, // API 인증 헤더 설정
    });

    const articles = response.data.data || []; // 데이터가 없을 경우 빈 배열 반환
    const formattedArticles = articles.map((article) => ({
      id: article.id || null,
      title: article.title || "제목 없음",
      summary: article.summary || "요약 없음",
      published_at: article.published_at || "발행일 없음",
      sentimentScore: article.esg?.polarity?.score || 0, // 감정 점수 기본값 설정
      url: article.content_url || null,
      image_url: article.image_url || null,
    }));

    res.json(formattedArticles);
  } catch (error) {
    console.error("❌ 뉴스 데이터 로드 오류:", error.message);
    res.status(500).json({ error: "뉴스 데이터를 불러오는 중 오류가 발생했습니다." });
  }
});

// ---- [2] 실시간 주식 데이터 API 엔드포인트 ----
app.get("/stocks", (req, res) => {
  const query = `
        SELECT 
            매매처리시각 AS time,
            체결가격 AS price
        FROM stock_data_20241104
        ORDER BY id DESC
        LIMIT 10
    `;

  dbConnection.query(query, (err, results) => {
    if (err) {
      console.error("❌ 주식 데이터 쿼리 실행 오류:", err);
      return res.status(500).json({ error: "서버 오류" });
    }

    // 시간 데이터 포맷팅 및 결과 반환
    const formattedResults = results.map((row) => ({
      time: row.time.slice(0, 4) + ":" + row.time.slice(4, 6), // HH:MM 형식 변환
      price: row.price,
    }));

    res.json(formattedResults);
  });
});

// ---- [3] 서버 시작 ----
app.listen(PORT, () => {
  console.log(`✅ 서버가 http://localhost:${PORT}에서 실행 중입니다.`);
});
