import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/CalendarPage';
import Sentiment from './pages/Sentiment';
import RealtimeGraph from './pages/RealtimeGraph';
import NewsDetail from './pages/NewsDetail';
import CardNews from './components/CardNews'; // 카드 뉴스 컴포넌트 추가
import Login from './pages/Login';
import Signup from './pages/Signup';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 관리

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('token'); // 로그아웃 시 토큰 삭제
  };

  return (
    <Router>
      <div>
        {/* 라우팅 */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/sentiment" element={<Sentiment />} />
          <Route path="/realtime" element={<RealtimeGraph />} />
          <Route path="/news" element={<CardNews />} /> {/* 카드 뉴스 라우트 */}
          <Route path="/news/:id" element={<NewsDetail />} /> {/* 세부 뉴스 라우트 */}
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
//바뀜//바뀜