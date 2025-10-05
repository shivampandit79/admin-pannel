import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./admin/components/Sidebar";
import Dashboard from "./admin/components/Dashboard";
import UserPage from "./admin/components/UserPage";
import DepositPage from "./admin/components/DepositPage";
import AnalyticsPage from "./admin/components/AnalyticsPage";
import ChatPage from "./admin/components/ChatPage";
import BetHistory from "./admin/components/BetHistory";
import UpiManagement from "./admin/components/UpiManagement";
import Login from "./admin/components/Login";
import EmployeeManagement from "./admin/components/EmployeeManagement";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken") || localStorage.getItem("executiveToken");
    if (token) setIsAuthenticated(true);
  }, []);

  if (!isAuthenticated) {
    return <Login setIsAuthenticated={setIsAuthenticated} />;
  }

  return (
    <div className="App">
      <Sidebar setIsAuthenticated={setIsAuthenticated}>
        <Routes>
          <Route path="/" element={<Dashboard setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/user" element={<UserPage />} />
          <Route path="/deposit" element={<DepositPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/bethistory" element={<BetHistory />} />
          <Route path="/upimanagement" element={<UpiManagement />} />
          <Route path="/employee" element={<EmployeeManagement />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Sidebar>
    </div>
  );
}

export default App;
