import React, { useState, useEffect } from "react";
import { FaHome } from "react-icons/fa"; // react-icons 사용
import { useNavigate } from "react-router-dom"; // useNavigate 사용
import axios from "axios";
import "../styles/MyPage.css";

const MyPage = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState("stockView"); // 기본 화면: 주식 데이터 조회
  const [stockData, setStockData] = useState([]);
  const [editStock, setEditStock] = useState(null); // 수정할 주식 데이터
  const [newStock, setNewStock] = useState({
    stockName: "",
    transactionType: "Buy",
    price: "",
    date: "",
    memo: "",
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false); // 토스트 메시지 표시 여부
  const [token] = useState(localStorage.getItem("token"));

  // 날짜 형식 변환 함수 (ISO to yyyy-MM-dd)
  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toISOString().split("T")[0];
  };

  // 주식 데이터 가져오기
  useEffect(() => {
    if (!token) {
      showToast("로그인이 필요합니다.");
      return;
    }
    refreshStockData();
  }, [token]);

  // 데이터 새로고침
  const refreshStockData = () => {
    axios
      .get("http://localhost:3001/api/stocks", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) =>
        setStockData(
          response.data.map((stock) => ({
            ...stock,
            date: formatDate(stock.date), // 날짜 형식 변환
          }))
        )
      )
      .catch((error) => {
        console.error("주식 데이터 로드 실패:", error.response?.data || error.message);
        showToast("주식 데이터를 불러오는 중 오류가 발생했습니다.");
      });
  };

  // 토스트 메시지 표시
  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000); // 3초 후 자동으로 숨김
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      showToast("비밀번호가 일치하지 않습니다.");
      return;
    }

    axios
      .post(
        "http://localhost:3001/api/change-password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        showToast(response.data.message || "비밀번호가 성공적으로 변경되었습니다.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      })
      .catch((error) => {
        console.error("비밀번호 변경 실패:", error.response?.data || error.message);
        showToast("비밀번호 변경 중 오류가 발생했습니다.");
      });
  };

  const handleAddStock = () => {
    if (!newStock.stockName || !newStock.transactionType || !newStock.price || !newStock.date) {
      showToast("모든 필드를 입력하세요.");
      return;
    }

    axios
      .post(
        "http://localhost:3001/api/stock",
        {
          stockName: newStock.stockName,
          transactionType: newStock.transactionType,
          price: newStock.price,
          date: newStock.date,
          memo: newStock.memo,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        showToast(response.data.message || "주식 데이터가 성공적으로 추가되었습니다.");
        setNewStock({ stockName: "", transactionType: "Buy", price: "", date: "", memo: "" });
        refreshStockData();
      })
      .catch((error) => {
        console.error("주식 데이터 추가 실패:", error.response?.data || error.message);
        showToast("주식 데이터 추가 실패.");
      });
  };

  const handleEditStock = (stock) => {
    setEditStock({ ...stock, date: formatDate(stock.date) }); // 수정할 데이터와 날짜 형식 변환
    setCurrentView("editStock"); // 수정 화면으로 전환
  };

  const handleUpdateStock = () => {
    if (!editStock || !editStock.stockName || !editStock.transactionType || !editStock.price || !editStock.date) {
      showToast("모든 필드를 입력하세요.");
      return;
    }

    axios
      .put(
        `http://localhost:3001/api/stocks/${editStock.id}`,
        {
          stockName: editStock.stockName,
          transactionType: editStock.transactionType,
          price: editStock.price,
          date: editStock.date,
          memo: editStock.memo,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        showToast(response.data.message || "주식 데이터가 성공적으로 수정되었습니다.");
        setEditStock(null); // 수정 데이터 초기화
        setCurrentView("stockView"); // 조회 화면으로 전환
        refreshStockData();
      })
      .catch((error) => {
        console.error("주식 데이터 수정 실패:", error.response?.data || error.message);
        showToast("주식 데이터 수정 실패.");
      });
  };

  const handleDeleteStock = (id) => {
    axios
      .delete(`http://localhost:3001/api/stocks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        showToast("주식 데이터가 성공적으로 삭제되었습니다.");
        refreshStockData();
      })
      .catch((error) => {
        console.error("주식 데이터 삭제 실패:", error.response?.data || error.message);
        showToast("주식 데이터 삭제 실패.");
      });
  };

  const renderContent = () => {
    switch (currentView) {
      case "passwordChange":
        return (
          <div className="password-change">
            <h3>비밀번호 변경</h3>
            <input
              type="password"
              placeholder="현재 비밀번호"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="새 비밀번호"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button onClick={handlePasswordChange}>비밀번호 변경</button>
          </div>
        );
      case "stockView":
        return (
          <div className="stock-view">
            <h3>등록된 주식 데이터</h3>
            <ul>
              {stockData.map((stock) => (
                <li
                  key={stock.id}
                  className="stock-item"
                  onClick={() => handleEditStock(stock)} // 항목 클릭 시 수정 화면으로 이동
                  style={{ cursor: "pointer" }}
                >
                  <p>
                    <strong>{stock.stockName}</strong> ({stock.transactionType}) -{" "}
                    {stock.price}원 ({stock.date})
                  </p>
                </li>
              ))}
            </ul>
          </div>
        );
      case "editStock":
        return (
          <div className="edit-stock-form">
            <h3>주식 데이터 수정</h3>
            <input
              type="text"
              value={editStock.stockName}
              onChange={(e) => setEditStock({ ...editStock, stockName: e.target.value })}
              placeholder="종목명"
            />
            <select
              value={editStock.transactionType}
              onChange={(e) => setEditStock({ ...editStock, transactionType: e.target.value })}
            >
              <option value="Buy">매수</option>
              <option value="Sell">매도</option>
            </select>
            <input
              type="number"
              value={editStock.price}
              onChange={(e) => setEditStock({ ...editStock, price: e.target.value })}
              placeholder="가격"
            />
            <input
              type="date"
              value={editStock.date}
              onChange={(e) => setEditStock({ ...editStock, date: e.target.value })}
            />
            <textarea
              value={editStock.memo}
              onChange={(e) => setEditStock({ ...editStock, memo: e.target.value })}
              placeholder="메모"
            />
            <div>
              <button onClick={handleUpdateStock}>수정 완료</button>
              <button
                style={{ marginLeft: "10px", background: "red", color: "white" }}
                onClick={() => handleDeleteStock(editStock.id)}
              >
                삭제
              </button>
            </div>
          </div>
        );
      case "addStock":
        return (
          <div className="add-stock-form">
            <h3>주식 데이터 추가</h3>
            <input
              type="text"
              value={newStock.stockName}
              onChange={(e) => setNewStock({ ...newStock, stockName: e.target.value })}
              placeholder="종목명"
            />
            <select
              value={newStock.transactionType}
              onChange={(e) => setNewStock({ ...newStock, transactionType: e.target.value })}
            >
              <option value="Buy">매수</option>
              <option value="Sell">매도</option>
            </select>
            <input
              type="number"
              value={newStock.price}
              onChange={(e) => setNewStock({ ...newStock, price: e.target.value })}
              placeholder="가격"
            />
            <input
              type="date"
              value={newStock.date}
              onChange={(e) => setNewStock({ ...newStock, date: e.target.value })}
            />
            <textarea
              value={newStock.memo}
              onChange={(e) => setNewStock({ ...newStock, memo: e.target.value })}
              placeholder="메모"
            />
            <button onClick={handleAddStock}>추가</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mypage-container">
      <div className="sidebar">
        <div className="home-button" onClick={() => navigate("/")}>
          <FaHome size={24} color="white" />
        </div>
        <button onClick={() => setCurrentView("stockView")}>주식 데이터 조회</button>
        <button onClick={() => setCurrentView("addStock")}>주식 데이터 추가</button>
        <button onClick={() => setCurrentView("passwordChange")}>비밀번호 변경</button>
      </div>
      <div className="content">{renderContent()}</div>

      {/* 토스트 메시지 */}
      {toastVisible && (
        <div className="toast-message">
          <p>{toastMessage}</p>
        </div>
      )}
    </div>
  );
};

export default MyPage;
