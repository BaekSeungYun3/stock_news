import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Header.css';
import { FaUserCircle } from 'react-icons/fa'; // React Icons에서 사용자 아이콘 가져오기

const Header = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token'); // JWT 토큰 여부로 로그인 상태 확인

  const handleLogout = () => {
    localStorage.removeItem('token'); // JWT 토큰 삭제
    navigate('/'); // 로그아웃 후 대시보드로 이동
  };

  return (
    <header className="header">
      <h1 className="header-title">페이지 이름</h1>
      <div className="header-actions">
        {isLoggedIn ? (
          <>
            <button onClick={() => navigate('/calendar')}>캘린더</button>
            <button onClick={handleLogout}>로그아웃</button>
            {/* 마이페이지 아이콘 */}
            <FaUserCircle
              className="user-icon"
              onClick={() => navigate('/my-page')}
              title="마이페이지"
            />
          </>
        ) : (
          <>
            <Link to="/signup">
              <button>회원가입</button>
            </Link>
            <Link to="/login">
              <button>로그인</button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
