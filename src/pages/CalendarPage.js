import React from 'react';
import Header from '../components/Header';
import '../styles/CalendarPage.css';

const CalendarPage = () => {
  return (
    <div>
      <Header />
      <div className="calendar-container">
        <h1>캘린더 페이지</h1>
        <p>여기에 캘린더 컴포넌트를 추가할 수 있습니다.</p>
      </div>
    </div>
  );
};

export default CalendarPage;
