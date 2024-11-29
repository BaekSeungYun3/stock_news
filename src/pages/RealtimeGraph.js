import React from "react";
import Header from "../components/Header";
import RealtimeChart from "../components/RealtimeChart";
import "../styles/RealtimeGraph.css";

const RealtimeGraph = () => {
  return (
    <div>
      <Header />
      <div className="graph-container">
        <RealtimeChart />
      </div>
    </div>
  );
};

export default RealtimeGraph;