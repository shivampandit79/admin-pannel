import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../page/Dashboard.css";
import { FiRefreshCw, FiLogOut } from "react-icons/fi";

// ✅ Use VITE_ variables (Vite syntax)
const CACHE_KEY = import.meta.env.VITE_CACHE_KEY;
const CACHE_TIME_KEY = import.meta.env.VITE_CACHE_TIME_KEY;
const CACHE_DURATION = Number(import.meta.env.VITE_CACHE_DURATION) || 10 * 60 * 1000;
const BASE_URL = import.meta.env.VITE_BASE_URL;
const APP_TITLE = import.meta.env.VITE_TITLE;

const Dashboard = ({ setIsAuthenticated }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposits: 0,
    totalSpins: 0,
    totalWinnings: 0,
  });
  const [recentSpins, setRecentSpins] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = APP_TITLE || "Dashboard";
    const token = localStorage.getItem("adminToken") || localStorage.getItem("executiveToken");
    if (!token) navigate("/login");
    else loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      const cachedData = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
      const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

      if (cachedData.stats && cachedData.recentSpins && cachedTime && Date.now() - cachedTime < CACHE_DURATION) {
        setStats(cachedData.stats);
        setRecentSpins(cachedData.recentSpins);
      } else {
        await fetchDashboardData();
      }
    } catch (error) {
      console.error("Error loading cached dashboard data:", error);
      await fetchDashboardData();
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken") || localStorage.getItem("executiveToken");

      // 🔹 Fetch all users
      const resUsers = await fetch(`${BASE_URL}/admin/allusers`, { headers: { "auth-token": token } });
      const usersData = await resUsers.json();

      // 🔹 Fetch all deposits
      const resDeposits = await fetch(`${BASE_URL}/admin/deposithistory`, { headers: { "auth-token": token } });
      const depositsData = await resDeposits.json();

      // ✅ Only sum deposits with status "Approved"
      const totalApprovedDeposits = depositsData.deposits?.reduce(
        (acc, deposit) => deposit.status === "Approved" ? acc + (deposit.amount || 0) : acc,
        0
      ) || 0;

      // 🔹 Fetch all spins
      const resSpins = await fetch(`${BASE_URL}/admin/spinhistory`, { headers: { "auth-token": token } });
      const spinsData = await resSpins.json();

      const sortedBets = (spinsData.bets || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const newStats = {
        totalUsers: usersData.users?.length || 0,
        totalDeposits: totalApprovedDeposits, // ✅ updated
        totalSpins: sortedBets.length,
        totalWinnings: sortedBets.reduce((a, b) => a + (b.winAmount || 0), 0) || 0,
      };

      const newRecentSpins = sortedBets.slice(0, 20);
      setStats(newStats);
      setRecentSpins(newRecentSpins);

      localStorage.setItem(CACHE_KEY, JSON.stringify({ stats: newStats, recentSpins: newRecentSpins }));
      localStorage.setItem(CACHE_TIME_KEY, Date.now());
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  const handleRefresh = () => fetchDashboardData();

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="header">
        <h1>{APP_TITLE}</h1>
        <div className="header-actions">
          <FiRefreshCw size={24} className={`refresh-icon ${loading ? "rotating" : ""}`} onClick={handleRefresh} />
          <FiLogOut size={24} className="logout-icon" onClick={handleLogout} title="Logout" />
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><h3>Total Users</h3><p>{stats.totalUsers}</p></div>
        <div className="stat-card"><h3>Total Deposits</h3><p>₹{stats.totalDeposits}</p></div>
        <div className="stat-card"><h3>Total Spins</h3><p>{stats.totalSpins}</p></div>
        <div className="stat-card"><h3>Total Winnings</h3><p>₹{stats.totalWinnings}</p></div>
      </div>

      <div className="recent-spins">
        <h2>Recent Spins</h2>
        <table>
          <thead>
            <tr>
              <th>User</th><th>Mobile</th><th>Spin Amount</th><th>Multiplier</th><th>Win Amount</th><th>Result</th>
            </tr>
          </thead>
          <tbody>
            {recentSpins.length > 0 ? recentSpins.map((spin) => (
              <tr key={spin._id}>
                <td>{spin.userName || "-"}</td>
                <td>{spin.mobile || "-"}</td>
                <td>₹{spin.spinAmount || 0}</td>
                <td>{spin.multiplier || "-"}</td>
                <td>₹{spin.winAmount || 0}</td>
                <td>{spin.result || "-"}</td>
              </tr>
            )) : (
              <tr><td colSpan="6" style={{ textAlign: "center" }}>No Data Found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
