import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import CalendarControls from "../components/CalendarControls";
import "../styles/CalendarPage.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  const [viewDate, setViewDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState("month");
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  // 일정 데이터 가져오기
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/events");
        if (!response.ok) {
          throw new Error("일정 데이터를 가져오는 중 오류가 발생했습니다.");
        }
        const data = await response.json();
        const formattedEvents = data.map((event) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }));
        setEvents(formattedEvents);
      } catch (error) {
        console.error("일정 불러오기 실패:", error);
      }
    };

    fetchEvents();
  }, []);

  // 주식 뉴스 일정을 가져와 캘린더에 추가
  const fetchStockEvents = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/stock-events", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("주식 일정 데이터를 가져오는 중 오류가 발생했습니다.");
      }

      // 모든 일정 가져오기
      const updatedResponse = await fetch("http://localhost:3001/api/events");
      if (!updatedResponse.ok) {
        throw new Error("일정 데이터를 업데이트하는 중 오류가 발생했습니다.");
      }
      const updatedData = await updatedResponse.json();
      const formattedEvents = updatedData.map((event) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error("주식 일정 추가 실패:", error);
    }
  };

  // Alpha Vantage 일정 데이터를 가져와 캘린더에 추가
  const fetchStockSchedules = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/stock-schedules", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Alpha Vantage 일정 데이터를 가져오는 중 오류가 발생했습니다.");
      }

      // 모든 일정 가져오기
      const updatedResponse = await fetch("http://localhost:3001/api/events");
      if (!updatedResponse.ok) {
        throw new Error("일정 데이터를 업데이트하는 중 오류가 발생했습니다.");
      }
      const updatedData = await updatedResponse.json();
      const formattedEvents = updatedData.map((event) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Alpha Vantage 일정 추가 실패:", error);
    }
  };

  // 이전, 오늘, 다음 네비게이션
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

  // 새 일정 추가
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

    fetch("http://localhost:3001/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvent),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("일정을 저장하는 중 오류가 발생했습니다.");
        }
        return response.json();
      })
      .then((savedEvent) => {
        setEvents((prevEvents) => [
          ...prevEvents,
          { ...newEvent, id: savedEvent.id, start: new Date(savedEvent.start), end: new Date(savedEvent.end) },
        ]);
      })
      .catch((error) => console.error("일정 저장 실패:", error));
  };

  return (
    <div className="calendar-page">
      <Header onTitleClick={() => navigate("/")} />
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

        {isModalOpen && selectedEvent && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{selectedEvent.title}</h2>
              <p>
                <strong>시작일:</strong> {selectedEvent.start.toDateString()}
              </p>
              <p>
                <strong>종료일:</strong> {selectedEvent.end.toDateString()}
              </p>
              <p> 
                <strong>상세 내용:</strong> {selectedEvent.description}
              </p>
              <button onClick={handleCloseModal}>닫기</button>
            </div>
          </div>
        )}
      </div>
      <div className="add-new-button">
        <button onClick={handleAddNew}>Add New</button>
        
        <button onClick={fetchStockSchedules}>Load Alpha Vantage Events</button> {/* Alpha Vantage 일정 로드 버튼 */}
      </div>
    </div>
  );
};

export default CalendarPage;