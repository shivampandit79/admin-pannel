import React, { useEffect, useMemo, useState } from "react";
import "../page/BetHistory.css";

const RANGE = {
  LAST_HOUR: "Last 1 Hour",
  TODAY: "Today",
  WEEK: "Weekly",
  MONTH: "Monthly",
  ALL: "All",
};

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function startOfMonth(date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

const formatDateTime = (isoStr) => {
  const d = new Date(isoStr);
  return d.toLocaleString();
};

export default function BetHistory() {
  const [range, setRange] = useState(RANGE.LAST_HOUR);
  const [query, setQuery] = useState("");
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Use .env BASE_URL
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("adminToken");

        const res = await fetch(`${BASE_URL}/admin/spinhistory`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const raw = await res.json();
        const data = Array.isArray(raw.bets) ? raw.bets : [];

        const formatted = data.map((item) => ({
          id: item._id || `bet-${Math.random()}`,
          userId: item.userId || "N/A",
          userName: item.userName || "Unknown",
          mobile: item.mobile || "N/A",
          betAmount: item.spinAmount || 0,
          result: (item.result || "PENDING").toUpperCase(),
          multiplier: item.multiplier || "N/A",
          multiplierIndex: item.multiplierIndex || 0,
          winAmount: item.winAmount || 0,
          walletAfterSpin: item.walletAfterSpin || 0,
          timestamp: item.createdAt || new Date().toISOString(),
        }));

        setBets(formatted);
      } catch (err) {
        console.error("Error fetching admin bet history:", err);
        setBets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [BASE_URL]);

  const filtered = useMemo(() => {
    let startDate;
    const now = new Date();

    switch (range) {
      case RANGE.LAST_HOUR:
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case RANGE.TODAY:
        startDate = startOfDay(now);
        break;
      case RANGE.WEEK:
        startDate = startOfWeek(now);
        break;
      case RANGE.MONTH:
        startDate = startOfMonth(now);
        break;
      case RANGE.ALL:
      default:
        startDate = new Date(0);
        break;
    }

    const q = query.trim().toLowerCase();

    return bets
      .filter((b) => {
        const betTime = new Date(b.timestamp);
        if (betTime < startDate) return false;

        if (!q) return true;

        return (
          (b.userName && b.userName.toLowerCase().includes(q)) ||
          (b.userId && b.userId.toLowerCase().includes(q)) ||
          (b.mobile && b.mobile.toLowerCase().includes(q)) ||
          (b.id && b.id.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [bets, range, query]);

  const summary = useMemo(() => {
    const totalCount = filtered.length;
    const totalAmount = filtered.reduce(
      (s, item) => s + Number(item.betAmount || 0),
      0
    );
    return { totalCount, totalAmount };
  }, [filtered]);

  return (
    <div className="bet-history-wrap">
      <header className="bh-header">
        <div className="bh-title">
          <h1>Admin Spin History</h1>
          <p className="subtitle">
            View all spin records for selected time ranges
          </p>
        </div>

        <div className="bh-controls">
          <div className="filters">
            {Object.values(RANGE).map((r) => (
              <button
                key={r}
                className={`filter-btn ${r === range ? "active" : ""}`}
                onClick={() => setRange(r)}
                aria-pressed={r === range}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="search-area">
            <input
              type="search"
              placeholder="Search name, user id, mobile or bet id..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {loading ? (
        <p style={{ textAlign: "center", padding: "20px" }}>
          Loading spin history...
        </p>
      ) : (
        <>
          <section className="summary-row">
            <div className="summary-card">
              <div className="s-label">Total Spins</div>
              <div className="s-value">{summary.totalCount}</div>
            </div>
            <div className="summary-card">
              <div className="s-label">Total Spin Amount</div>
              <div className="s-value">
                ₹ {summary.totalAmount.toLocaleString()}
              </div>
            </div>
            <div className="summary-card">
              <div className="s-label">Selected Range</div>
              <div className="s-value">{range}</div>
            </div>
          </section>

          <section className="table-wrap">
            <table className="bet-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Spin Amount</th>
                  <th>Multiplier</th>
                  <th>Win Amount</th>
                  <th>Result</th>
                  <th>Wallet After Spin</th>
                  <th>Date / Time</th>
                  <th>Spin ID</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="empty">
                      No spins found for this range.
                    </td>
                  </tr>
                ) : (
                  filtered.map((b) => (
                    <tr key={b.id}>
                      <td>{b.userId}</td>
                      <td className="amount">
                        ₹ {Number(b.betAmount).toLocaleString()}
                      </td>
                      <td>{b.multiplier}</td>
                      <td className="amount">
                        ₹ {Number(b.winAmount).toLocaleString()}
                      </td>
                      <td>
                        <span className={`badge ${b.result.toLowerCase()}`}>
                          {b.result}
                        </span>
                      </td>
                      <td className="amount">
                        ₹ {Number(b.walletAfterSpin).toLocaleString()}
                      </td>
                      <td>{formatDateTime(b.timestamp)}</td>
                      <td className="muted">{b.id}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        </>
      )}

      <footer className="bh-footer">
        <small>
          Tip: This data is fetched directly from backend admin spin history API.
        </small>
      </footer>
    </div>
  );
}
