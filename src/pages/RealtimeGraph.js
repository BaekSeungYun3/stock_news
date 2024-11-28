<<<<<<< HEAD
import React from 'react';
import Header from '../components/Header';
import '../styles/RealtimeGraph.css';
=======
import React from "react";
import Header from "../components/Header";
import RealtimeChart from "../components/RealtimeChart";
import "../styles/RealtimeGraph.css";
>>>>>>> d4e0776154795b863125d6863841dba6f6e12a10

const RealtimeGraph = () => {
  return (
    <div>
      <Header />
      <div className="graph-container">
<<<<<<< HEAD
        <h1>실시간 주식 그래프</h1>
        <p>여기에 그래프가 표시됩니다.</p>
=======
        <RealtimeChart />
>>>>>>> d4e0776154795b863125d6863841dba6f6e12a10
      </div>
    </div>
  );
};

export default RealtimeGraph;
