import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/StockInput.css';

const StockInput = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [stockName, setStockName] = useState('');
  const [transactionType, setTransactionType] = useState('Buy');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState('');
  const [memo, setMemo] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setMessage('로그인이 필요합니다.');
    }
  }, [token]);

  const handleStockSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setMessage('로그인이 필요합니다.');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:3001/api/stock',
        { stockName, transactionType, price, date, memo },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        setMessage('주식 데이터가 성공적으로 저장되었습니다.');
        setStockName('');
        setTransactionType('Buy');
        setPrice('');
        setDate('');
        setMemo('');

        
        setTimeout(() => {
          navigate('/'); 
        }, 1000);
      } else {
        setMessage('주식 데이터 저장 실패');
      }
    } catch (error) {
      setMessage('서버 오류 발생');
      console.error(error);
    }
  };

  return (
    <div className="stock-input-container">
      <div className="stock-input-box">
        <h2>주식 데이터 입력</h2>
        <form onSubmit={handleStockSubmit}>
          <input
            type="text"
            placeholder="종목명"
            value={stockName}
            onChange={(e) => setStockName(e.target.value)}
            required
          />
          <select
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
          >
            <option value="Buy">매수</option>
            <option value="Sell">매도</option>
          </select>
          <input
            type="number"
            placeholder="가격"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <textarea
            placeholder="메모"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
          <button type="submit">저장</button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default StockInput;
