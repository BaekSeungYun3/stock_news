import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/CalendarPage';
import Sentiment from './pages/Sentiment';
import RealtimeGraph from './pages/RealtimeGraph';
import NewsDetail from './pages/NewsDetail';
import CardNews from './components/CardNews'; 
import Login from './pages/Login';
import Signup from './pages/Signup';
import StockInput from './pages/StockInput'; 
import MyPage from './pages/MyPage'; 

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); 

 
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); 
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('token'); 
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
          <Route path="/news" element={<CardNews />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/stock-input"
            element={
              isLoggedIn ? (
                <StockInput />
              ) : (
                <Navigate to="/login" replace /> 
              )
            }
          />
          <Route
            path="/my-page"
            element={
              isLoggedIn ? (
                <MyPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
