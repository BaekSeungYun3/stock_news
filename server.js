require("dotenv").config(); // .env 파일 로드
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;

// MariaDB 연결 설정
const DB_CONFIG = {
    host: process.env.STOCK_DB_HOST || process.env.DB_HOST,
    user: process.env.STOCK_DB_USER || process.env.DB_USER,
    password: process.env.STOCK_DB_PASSWORD || process.env.DB_PASSWORD,
    database: process.env.STOCK_DB_NAME || process.env.DB_NAME,
    port: process.env.STOCK_DB_PORT || process.env.DB_PORT,
};

// 데이터베이스 연결
const connection = mysql.createConnection(DB_CONFIG);
connection.connect((err) => {
    if (err) {
        console.error("❌ 데이터베이스 연결 실패:", err);
        process.exit(1);
    }
    console.log("✅ 데이터베이스 연결 성공");
});

// 미들웨어 설정
app.use(cors({ origin: "http://localhost:3000" })); // 프론트엔드 URL
app.use(express.json()); // JSON 파싱

// JWT 인증 미들웨어
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "인증 토큰이 없습니다." });
    }
    try {
        req.user = jwt.verify(token, JWT_SECRET); // 디코딩된 사용자 정보 저장
        next();
    } catch (err) {
        console.error("JWT 인증 실패:", err.message);
        return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
    }
};

// ---- [1] 사용자 인증 및 회원 관리 ----

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
                    console.error("회원가입 오류:", err);
                    return res.status(500).json({ message: "서버 오류" });
                }

                // 회원가입 성공 시 JWT 토큰 생성
                const userId = results.insertId; // 생성된 사용자의 ID 가져오기
                const token = jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: "1h" });

                res.status(201).json({ message: "회원가입 성공!", token });
            }
        );
    } catch (err) {
        console.error("회원가입 처리 중 오류:", err);
        res.status(500).json({ message: "서버 오류" });
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
                console.error("로그인 오류:", err);
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

// 인증된 사용자만 접근 가능한 엔드포인트
app.get("/api/protected", authenticateToken, (req, res) => {
    res.json({ message: "인증 성공!", user: req.user });
});

//비밀번호 변경
app.post("/api/change-password", authenticateToken, (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "현재 비밀번호와 새 비밀번호를 입력하세요." });
    }
    connection.query(
        "SELECT * FROM users WHERE id = ?",
        [req.user.id],
        async (err, results) => {
            if (err) {
                console.error("사용자 조회 오류:", err);
                return res.status(500).json({ message: "서버 오류" });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
            }
            const user = results[0];
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: "현재 비밀번호가 일치하지 않습니다." });
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            connection.query(
                "UPDATE users SET password = ? WHERE id = ?",
                [hashedPassword, req.user.id],
                (err) => {
                    if (err) {
                        console.error("비밀번호 변경 오류:", err);
                        return res.status(500).json({ message: "서버 오류" });
                    }
                    res.json({ message: "비밀번호가 성공적으로 변경되었습니다." });
                }
            );
        }
    );
});

// ---- [2] 뉴스 데이터 관리 ----

// 뉴스 데이터 가져오기
const fetchSamsungNews = async () => {
    const API_KEY = process.env.DEEPSEARCH_API_KEY;
    const url = `https://api-v2.deepsearch.com/v1/articles?company_name=삼성전자&date_from=2024-01-01&date_to=2024-12-31&page_size=50`;

    try {
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${API_KEY}` },
        });
        return response.data.data.map((article) => ({
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
        res.status(500).json({ error: "뉴스 데이터를 불러오는 중 오류 발생" });
    }
});

// ---- [3] 주식 데이터 관리 ----

// 주식 데이터 조회
app.get("/api/stocks", authenticateToken, (req, res) => {
    const query = `
        SELECT id, stockName, transactionType, price, date, memo
        FROM stocks
        WHERE user_id = ?
        ORDER BY date DESC;
    `;

    connection.query(query, [req.user.id], (err, results) => {
        if (err) {
            console.error("주식 데이터 조회 오류:", err);
            return res.status(500).json({ error: "서버 오류" });
        }

        res.json(results);
    });
});

// 주식 데이터 저장
app.post("/api/stock", authenticateToken, (req, res) => {
    const { stockName, transactionType, price, date, memo } = req.body;

    if (!stockName || !transactionType || !price || !date) {
        return res.status(400).json({ message: "모든 필드를 입력하세요." });
    }

    const query = `
        INSERT INTO stocks (stockName, transactionType, price, date, memo, user_id)
        VALUES (?, ?, ?, ?, ?, ?);
    `;

    connection.query(
        query,
        [stockName, transactionType, price, date, memo, req.user.id],
        (err) => {
            if (err) {
                console.error("주식 데이터 저장 오류:", err);
                return res.status(500).json({ message: "서버 오류" });
            }
            res.status(201).json({ message: "주식 데이터가 성공적으로 저장되었습니다." });
        }
    );
});

// 주식 데이터 수정
app.put("/api/stocks/:id", authenticateToken, (req, res) => {
    const { id } = req.params;
    const { stockName, transactionType, price, date, memo } = req.body;

    // 디버깅용 로그 추가
    console.log("수정 요청 데이터:", { id, stockName, transactionType, price, date, memo });
    console.log("사용자 ID:", req.user.id);

    if (!id || !stockName || !transactionType || !price || !date) {
        return res.status(400).json({ message: "모든 필드를 입력하세요." });
    }

    connection.query(
        "UPDATE stocks SET stockName = ?, transactionType = ?, price = ?, date = ?, memo = ? WHERE id = ? AND user_id = ?",
        [stockName, transactionType, price, date, memo, id, req.user.id],
        (err, results) => {
            if (err) {
                console.error("주식 데이터 수정 오류:", err);
                return res.status(500).json({ message: "서버 오류" });
            }

            // SQL 실행 결과 로그 추가
            console.log("수정 결과:", results);
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "수정할 데이터를 찾을 수 없습니다." });
            }

            res.json({ message: "주식 데이터가 성공적으로 수정되었습니다." });
        }
    );
});

// 주식 데이터 삭제
app.delete("/api/stocks/:id", authenticateToken, (req, res) => {
    const { id } = req.params;

    // 디버깅용 로그 추가
    console.log("삭제 요청 데이터 ID:", id);
    console.log("사용자 ID:", req.user.id);

    if (!id) {
        return res.status(400).json({ message: "삭제할 데이터의 ID를 제공해야 합니다." });
    }

    connection.query(
        "DELETE FROM stocks WHERE id = ? AND user_id = ?",
        [id, req.user.id],
        (err, results) => {
            if (err) {
                console.error("주식 데이터 삭제 오류:", err);
                return res.status(500).json({ message: "서버 오류" });
            }

            // SQL 실행 결과 로그 추가
            console.log("삭제 결과:", results);
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "삭제할 데이터를 찾을 수 없습니다." });
            }

            res.json({ message: "주식 데이터가 성공적으로 삭제되었습니다." });
        }
    );
});

  

// ---- [4] 서버 실행 ----
app.listen(PORT, () => {
    console.log(`✅ 서버가 http://localhost:${PORT}에서 실행 중입니다.`);
});
