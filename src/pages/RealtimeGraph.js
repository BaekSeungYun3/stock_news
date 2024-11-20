import React from 'react';
import Header from '../components/Header';
import '../styles/RealtimeGraph.css';

const RealtimeGraph = () => {
  return (
    <div>
      <Header />
      <div className="graph-container">
        <h1>실시간 주식 그래프</h1>
        <p>여기에 그래프가 표시됩니다.</p>
      </div>
    </div>
  );
};

export default RealtimeGraph;
