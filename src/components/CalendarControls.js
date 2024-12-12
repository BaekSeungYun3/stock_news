import React, { useState, useEffect } from "react";
import "../styles/CalendarControls.css";

const CalendarControls = ({ calendarView, setCalendarView, onNavigate }) => {
  // 현재 날짜 상태 추가
  const [currentDate, setCurrentDate] = useState(new Date());

  // 달 변경 핸들러
  const handleNavigate = (direction) => {
    let newDate = new Date(currentDate);

    if (direction === "PREV") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (direction === "NEXT") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (direction === "TODAY") {
      newDate = new Date();
    }

    setCurrentDate(newDate);
    onNavigate(direction); // 기존 네비게이션 호출
  };

  // 현재 월과 연도 계산
  const getCurrentMonth = () => {
    const options = { month: "long", year: "numeric" };
    return currentDate.toLocaleDateString("en-US", options);
  };

  return (
    <div className="calendar-controls">
      {/* 이전, 오늘, 다음 버튼 */}
      <div className="btn-group">
        <button className="btn btn-primary" onClick={() => handleNavigate("PREV")}>
          Previous
        </button>
        <button className="btn btn-default" onClick={() => handleNavigate("TODAY")}>
          Today
        </button>
        <button className="btn btn-primary" onClick={() => handleNavigate("NEXT")}>
          Next
        </button>
      </div>
      {/* 현재 월 표시 버튼 */}
      <div className="btn-group">
        <button className="btn btn-info current-month-button">
          {getCurrentMonth()}
        </button>
      </div>
      {/* 뷰 변경 버튼 */}
      <div className="btn-group">
        {["month", "week", "day"].map((view) => (
          <button
            key={view}
            className={`btn ${calendarView === view ? "btn-selected" : "btn-primary"}`}
            onClick={() => setCalendarView(view)}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}; //뭐지?2

export default CalendarControls;
