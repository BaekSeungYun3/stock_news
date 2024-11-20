const express = require('express');
const mysql = require('mysql2'); // MySQL/MariaDB 클라이언트
const bcrypt = require('bcrypt'); // 비밀번호 해싱
const cors = require('cors');
const jwt = require('jsonwebtoken'); // JWT 토큰

const app = express();
const PORT = 3001; // Express 서버 포트

// JWT 시크릿 키
const JWT_SECRET = 'your_jwt_secret';

// CORS 설정
app.use(cors({
    origin: 'http://localhost:3000' // 클라이언트 URL 추가
}));

// JSON 파싱을 위한 미들웨어
app.use(express.json());

// MariaDB 연결 설정
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'news_db',
    port: 3306, // MariaDB 포트
});

// 데이터베이스 연결
connection.connect((err) => {
    if (err) {
        console.error('데이터베이스에 연결할 수 없습니다: ', err);
        return;
    }
    console.log('데이터베이스에 연결되었습니다.');
});

// 회원가입 엔드포인트
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: '사용자 이름과 비밀번호를 입력하세요.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        connection.query(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hashedPassword],
            (err, results) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ message: '이미 존재하는 사용자 이름입니다.' });
                    }
                    console.error('쿼리 실행 중 오류 발생: ', err);
                    return res.status(500).json({ message: '서버 오류' });
                }
                res.status(201).json({ message: '회원가입 성공!' });
            }
        );
    } catch (err) {
        res.status(500).json({ message: '서버 오류', error: err.message });
    }
});

// 로그인 엔드포인트
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: '사용자 이름과 비밀번호를 입력하세요.' });
    }

    connection.query(
        'SELECT * FROM users WHERE username = ?',
        [username],
        async (err, results) => {
            if (err) {
                console.error('쿼리 실행 중 오류 발생: ', err);
                return res.status(500).json({ message: '서버 오류' });
            }

            if (results.length === 0) {
                return res.status(401).json({ message: '사용자를 찾을 수 없습니다.' });
            }

            const user = results[0];
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
            }

            const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

            res.json({ token, message: '로그인 성공!' });
        }
    );
});

// 인증 엔드포인트 (보호된 라우트)
app.get('/api/protected', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: '토큰이 없습니다.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ message: '인증 성공!', user: decoded });
    } catch (err) {
        res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    }
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT}에서 실행 중입니다.`);
});
