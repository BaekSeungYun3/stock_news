// src/StockTable.js
import React from 'react';
import './StockTable.css';

const StockTable = ({ stockData, cumulativeVolume }) => {
    const formatNumber = (number) => number.toLocaleString();

    const formatTime = (time) => {
        const hours = time.slice(0, 2);
        const minutes = time.slice(2, 4);
        const seconds = time.slice(4, 6);
        return `${hours}:${minutes}:${seconds}`;
    };

    const formatPriceDifference = (priceDifference, comparisonCode) => {
        const code = parseInt(comparisonCode, 10); // 문자열을 정수로 변환
        switch (code) {
            case 1: // 상한
            case 2: // 상승
                return `+${formatNumber(priceDifference)}`;
            case 3: // 보합
                return `${formatNumber(priceDifference)}`; // 0일 경우
            case 4: // 하한
            case 5: // 하락
                return `-${formatNumber(Math.abs(priceDifference))}`; // 절대값 사용
            default: // 초기값
                return `${formatNumber(priceDifference)}`; // 0일 경우
        }
    };

    return (
        <div className="App">
            <table className="stock-table">
                <thead>
                    <tr>
                        <th>거래시간</th>
                        <th>거래금액</th>
                        <th>전일대비가격</th>
                        <th>거래량</th>
                        <th>누적거래량</th>
                    </tr>
                </thead>
                <tbody>
                    {stockData.map((stock, index) => (
                        <tr key={index}>
                            <td>{formatTime(stock.timestamp)}</td>
                            <td>{formatNumber(stock.price)}</td>
                            <td>{formatPriceDifference(stock.priceDifference, stock.comparisonCode)}</td>
                            <td>{formatNumber(stock.volume)}</td>
                            <td>{formatNumber(stock.cumulativeVolume)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StockTable;
