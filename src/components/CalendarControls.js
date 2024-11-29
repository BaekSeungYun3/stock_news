import React from "react";
import "../styles/CalendarControls.css";

const CalendarControls = ({ viewDate, calendarView, setCalendarView, onNavigate }) => {
  return (
    <div className="calendar-controls">
      {/* 이전, 오늘, 다음 버튼 */}
      <div className="btn-group">
        <button className="btn btn-primary" onClick={() => onNavigate("PREV")}>
          Previous
        </button>
        <button className="btn btn-default" onClick={() => onNavigate("TODAY")}>
          Today
        </button>
        <button className="btn btn-primary" onClick={() => onNavigate("NEXT")}>
          Next
        </button>
      </div>
      {/* 뷰 변경 버튼 */}
      <div className="btn-group">
        {["month", "week", "day"].map((view) => (
          <button
            key={view}
            className={`btn ${calendarView === view ? "btn-selected" : "btn-primary"}`}
            onClick={() => setCalendarView(view)} // 버튼 클릭 시 캘린더 뷰 변경
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CalendarControls;
