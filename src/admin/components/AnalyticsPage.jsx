import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import "../page/Dashboard.css";

const AnalyticsPage = () => {
  const [dateFilter, setDateFilter] = useState("last7days");

  const summaryData = {
    totalUsers: 1250,
    activeUsers: 980,
    newUsers: 120,
    totalDeposits: 85000,
    totalWithdrawals: 42000,
    revenue: 43000,
    pendingTransactions: 15,
    successTransactions: 320,
  };

  const userGrowthData = [
    { date: "01 Sep", users: 50 },
    { date: "02 Sep", users: 65 },
    { date: "03 Sep", users: 80 },
    { date: "04 Sep", users: 75 },
    { date: "05 Sep", users: 90 },
    { date: "06 Sep", users: 120 },
    { date: "07 Sep", users: 150 },
  ];

  const depositWithdrawalData = [
    { date: "01 Sep", deposit: 8000, withdrawal: 3000 },
    { date: "02 Sep", deposit: 9000, withdrawal: 4000 },
    { date: "03 Sep", deposit: 7500, withdrawal: 2500 },
    { date: "04 Sep", deposit: 10000, withdrawal: 5000 },
    { date: "05 Sep", deposit: 11000, withdrawal: 4500 },
    { date: "06 Sep", deposit: 9500, withdrawal: 4000 },
    { date: "07 Sep", deposit: 12000, withdrawal: 6000 },
  ];

  const transactionStatusData = [
    { name: "Success", value: 320 },
    { name: "Pending", value: 15 },
    { name: "Failed", value: 5 },
  ];

  const topUsersData = [
    { name: "John Doe", amount: 12000 },
    { name: "Jane Smith", amount: 9500 },
    { name: "Mark Johnson", amount: 8000 },
    { name: "Emily Davis", amount: 7000 },
    { name: "Alex Brown", amount: 6000 },
  ];

  const COLORS = ["#2ecc71", "#f1c40f", "#e74c3c"];

  const createCharts = () => {
    return (
      <>
        {/* User Growth Chart */}
        <div className="chart card">
          <h3>User Growth (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#007bff"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Deposit vs Withdrawal Chart */}
        <div className="chart card">
          <h3>Deposit vs Withdrawal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={depositWithdrawalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="deposit" fill="#2ecc71" />
              <Bar dataKey="withdrawal" fill="#e74c3c" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Transaction Status Pie Chart */}
        <div className="chart card">
          <h3>Transaction Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={transactionStatusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {transactionStatusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Users Chart */}
        <div className="chart card">
          <h3>Top Users by Deposit</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart layout="vertical" data={topUsersData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="#007bff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </>
    );
  };

  return (
    <div className="analytics-container">
      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card total-users">
          <h3>Total Users</h3>
          <p>{summaryData.totalUsers}</p>
        </div>
        <div className="card active-users">
          <h3>Active Users</h3>
          <p>{summaryData.activeUsers}</p>
        </div>
        <div className="card new-users">
          <h3>New Users</h3>
          <p>{summaryData.newUsers}</p>
        </div>
        <div className="card total-deposits">
          <h3>Total Deposits</h3>
          <p>₹{summaryData.totalDeposits}</p>
        </div>
        <div className="card total-withdrawals">
          <h3>Total Withdrawals</h3>
          <p>₹{summaryData.totalWithdrawals}</p>
        </div>
        <div className="card revenue">
          <h3>Revenue</h3>
          <p>₹{summaryData.revenue}</p>
        </div>
        <div className="card pending-transactions">
          <h3>Pending Transactions</h3>
          <p>{summaryData.pendingTransactions}</p>
        </div>
        <div className="card success-transactions">
          <h3>Success Transactions</h3>
          <p>{summaryData.successTransactions}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">{createCharts()}</div>
    </div>
  );
};

export default AnalyticsPage;
