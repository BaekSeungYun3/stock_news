import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import Header from "../components/Header";
import CalendarControls from "../components/CalendarControls";
import "../styles/CalendarPage.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  const [viewDate, setViewDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState("month");
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "공식일정 1",
      start: new Date(2024, 10, 22),
      end: new Date(2024, 10, 22),
      description: "일정1의 세부 내용입니다.",
    },
    {
      id: 2,
      title: "공식일정 2",
      start: new Date(2024, 10, 27),
      end: new Date(2024, 10, 27),
      description: "일정2의 세부 내용입니다.",
    },
    {
      id: 3,
      title: "공식일정 3",
      start: new Date(2024, 10, 28),
      end: new Date(2024, 10, 28),
      description: "일정3의 세부 내용입니다.",
    },
  ]);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNavigate = (action) => {
    const newDate = new Date(viewDate);
    if (action === "PREV") {
      if (calendarView === "month") newDate.setMonth(newDate.getMonth() - 1);
      else if (calendarView === "week") newDate.setDate(newDate.getDate() - 7);
      else if (calendarView === "day") newDate.setDate(newDate.getDate() - 1);
    } else if (action === "NEXT") {
      if (calendarView === "month") newDate.setMonth(newDate.getMonth() + 1);
      else if (calendarView === "week") newDate.setDate(newDate.getDate() + 7);
      else if (calendarView === "day") newDate.setDate(newDate.getDate() + 1);
    } else if (action === "TODAY") {
      setViewDate(new Date());
      return;
    }
    setViewDate(newDate);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleAddNew = () => {
    const title = prompt("새로운 일정의 제목을 입력하세요:");
    if (!title) return;

    const start = prompt("일정 시작일을 입력하세요 (형식: YYYY-MM-DD):");
    const end = prompt("일정 종료일을 입력하세요 (형식: YYYY-MM-DD):");

    if (!moment(start, "YYYY-MM-DD", true).isValid() || !moment(end, "YYYY-MM-DD", true).isValid()) {
      alert("날짜 형식이 잘못되었습니다. 'YYYY-MM-DD' 형식으로 다시 입력해주세요.");
      return;
    }

    const newEvent = {
      id: events.length + 1,
      title,
      start: new Date(start),
      end: new Date(end),
      description: "사용자가 추가한 일정입니다.",
    };

    setEvents([...events, newEvent]);
  };

  return (
    <div className="calendar-page">
      <Header />
      <CalendarControls
        viewDate={viewDate}
        setViewDate={setViewDate}
        calendarView={calendarView}
        setCalendarView={setCalendarView}
        onNavigate={handleNavigate}
      />
      <div className="calendar-body">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          date={viewDate}
          view={calendarView}
          onNavigate={(date) => setViewDate(date)}
          onView={(view) => setCalendarView(view)}
          views={["month", "week", "day"]}
          toolbar={false}
          style={{ height: "calc(100vh - 250px)" }}
          onSelectEvent={handleEventClick}
        />
      </div>
      <div className="add-new-button">
        <button onClick={handleAddNew}>Add New</button>
      </div>

      {/* 모달 */}
      {isModalOpen && selectedEvent && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedEvent.title}</h2>
            <p><strong>시작일:</strong> {selectedEvent.start.toDateString()}</p>
            <p><strong>종료일:</strong> {selectedEvent.end.toDateString()}</p>
            <p><strong>상세 내용:</strong> {selectedEvent.description}</p>
            <button onClick={handleCloseModal}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
