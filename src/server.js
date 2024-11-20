const express = require('express');
const bodyParser = require('body-parser');
const mariadb = require('mariadb');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 5000;

// Middleware 설정
app.use(bodyParser.json());
app.use(cors());

// MariaDB 연결
const pool = mariadb.createPool({
  host: 'localhost',         // MariaDB 호스트
  user: 'root',              // MariaDB 사용자
  password: 'root', // MariaDB 비밀번호
  database: 'news_db',       // 데이터베이스 이름
  connectionLimit: 5,        // 연결 제한
});

// JWT 시크릿 키
const JWT_SECRET = 'your_jwt_secret';

// API: 회원가입
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // 비밀번호 해싱
    const conn = await pool.getConnection();
    await conn.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
    conn.release();

    res.status(201).json({ message: '회원가입 성공!' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: '이미 존재하는 사용자 이름입니다.' });
    } else {
      res.status(500).json({ message: '서버 오류', error: err });
    }
  }
});

// API: 로그인
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM users WHERE username = ?', [username]);
    conn.release();

    if (rows.length === 0) {
      return res.status(401).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    // JWT 토큰 생성
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err });
  }
});

// API: 인증 확인 (예: 보호된 대시보드)
app.get('/api/protected', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer 토큰에서 실제 토큰만 추출

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

// 서버 실행
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
