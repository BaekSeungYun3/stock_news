require("dotenv").config(); // .env 파일 로드
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const axios = require("axios");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3001; // .env에서 포트 가져오기
const JWT_SECRET = process.env.JWT_SECRET;

// MariaDB 연결 설정
const DB_CONFIG = {
    host: process.env.STOCK_DB_HOST || process.env.DB_HOST, // 환경변수에 따라 호스트 선택
    user: process.env.STOCK_DB_USER || process.env.DB_USER,
    password: process.env.STOCK_DB_PASSWORD || process.env.DB_PASSWORD,
    database: process.env.STOCK_DB_NAME || process.env.DB_NAME,
    port: process.env.STOCK_DB_PORT || process.env.DB_PORT,
};

// 데이터베이스 연결
const connection = mysql.createConnection(DB_CONFIG);
connection.connect((err) => {
    if (err) {
        console.error("❌ 데이터베이스에 연결할 수 없습니다: ", err);
        process.exit(1); // 연결 실패 시 서버 종료
    }
    console.log("✅ 데이터베이스에 연결되었습니다.");
});

// CORS 설정
app.use(cors({
    origin: "http://localhost:3000", // 프론트엔드 URL
}));

// JSON 파싱을 위한 미들웨어
app.use(express.json());

// ---- [1] 뉴스 API 관련 기능 ----
const fetchSamsungNews = async () => {
    const API_KEY = process.env.DEEPSEARCH_API_KEY;
    const url = `https://api-v2.deepsearch.com/v1/articles?company_name=삼성전자&date_from=2024-01-01&date_to=2024-12-31&page_size=50`;

    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${API_KEY}`,
            },
        });

        const articles = response.data.data || [];
        return articles.map(article => ({
            id: article.id || null,
            title: article.title || "제목 없음",
            summary: article.summary || "요약 없음",
            published_at: article.published_at || "발행일 없음",
            sentimentScore: article.esg?.polarity?.score || 0,
            url: article.content_url || null,
            image_url: article.image_url || null,
        }));
    } catch (error) {
        console.error("뉴스 API 요청 오류:", error.message || error);
        return [];
    }
};

app.get("/news", async (req, res) => {
    try {
        const articles = await fetchSamsungNews();
        res.json(articles);
    } catch (error) {
        res.status(500).json({ error: "뉴스 데이터를 불러오는 중 오류가 발생했습니다." });
    }
});

// ---- [2] 데이터베이스 관련 기능 ----

// 회원가입
app.post("/api/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "사용자 이름과 비밀번호를 입력하세요." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        connection.query(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            [username, hashedPassword],
            (err, results) => {
                if (err) {
                    if (err.code === "ER_DUP_ENTRY") {
                        return res.status(400).json({ message: "이미 존재하는 사용자 이름입니다." });
                    }
                    console.error("쿼리 실행 오류:", err);
                    return res.status(500).json({ message: "서버 오류" });
                }
                res.status(201).json({ message: "회원가입 성공!" });
            }
        );
    } catch (err) {
        res.status(500).json({ message: "서버 오류", error: err.message });
    }
});

// 로그인
app.post("/api/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "사용자 이름과 비밀번호를 입력하세요." });
    }

    connection.query(
        "SELECT * FROM users WHERE username = ?",
        [username],
        async (err, results) => {
            if (err) {
                console.error("쿼리 실행 오류:", err);
                return res.status(500).json({ message: "서버 오류" });
            }

            if (results.length === 0) {
                return res.status(401).json({ message: "사용자를 찾을 수 없습니다." });
            }

            const user = results[0];
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
            }

            const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "1h" });

            res.json({ token, message: "로그인 성공!" });
        }
    );
});

// 인증된 사용자 전용 엔드포인트
app.get("/api/protected", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "토큰이 없습니다." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ message: "인증 성공!", user: decoded });
    } catch (err) {
        res.status(401).json({ message: "유효하지 않은 토큰입니다." });
    }
});

// 주식 데이터 조회
app.get("/stocks", (req, res) => {
    const query = `
        SELECT 
            매매처리시각 AS time,
            체결가격 AS price
        FROM stock_data_20241104
        ORDER BY 매매처리시각 DESC
        LIMIT 10;
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error("주식 데이터 쿼리 실행 오류:", err);
            return res.status(500).json({ error: "서버 오류" });
        }

        res.json(results);
    });
});

// ---- [3] 서버 시작 ----
app.listen(PORT, () => {
    console.log(`✅ 서버가 http://localhost:${PORT}에서 실행 중입니다.`);
});
