import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Signup.css';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    // 비밀번호 확인
    if (password !== confirmPassword) {
      setMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      // 서버로 회원가입 요청
      const response = await axios.post('http://localhost:3001/api/register', {
        username,
        password,
      });

      if (response.status === 201) {
        const { token } = response.data; // 서버에서 받은 토큰
        setMessage('회원가입 성공!');

        // 토큰을 localStorage에 저장
        localStorage.setItem('token', token);

        // StockInput 페이지로 이동
        navigate('/stock-input', { state: { token } }); // token을 함께 전달
      } else {
        setMessage('회원가입 실패');
      }
    } catch (error) {
      setMessage('서버 오류 발생');
      console.error(error);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>회원가입</h2>
        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="ID"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit">회원가입</button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default Signup;
