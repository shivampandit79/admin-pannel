import React, { useState, useEffect } from "react";
import "../page/DepositPage.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const APP_TITLE = import.meta.env.VITE_TITLE || "Admin Dashboard";

const DepositPage = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [copyingUpi, setCopyingUpi] = useState(false); // ✅ Track copy UPI loading

  useEffect(() => {
    document.title = `${APP_TITLE} - Deposits`;
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("executiveToken");

      const res = await fetch(`${BASE_URL}/admin/deposithistory`, {
        headers: { "auth-token": token },
      });
      const data = await res.json();

      if (data.success) {
        const sorted = data.deposits
          .map((item) => ({
            id: item._id,
            transectionID: item.transectionID?.toString() || "-",
            name: item.userName,
            status: item.status,
            depositAmount: item.amount,
            totalDeposits: item.totalDeposits || 0,
            lifetime: item.cumulativeDeposit || 0,
            mobile: item.mobile,
            createdAt: item.createdAt,
          }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setDeposits(sorted);
      } else {
        console.error("Error fetching deposits:", data.error);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (depositId) => {
    setApprovingId(depositId);
    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("executiveToken");

      const res = await fetch(`${BASE_URL}/deposit/approve-deposit/${depositId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
      });
      const data = await res.json();

      if (data.success) {
        setDeposits((prev) =>
          prev.map((dep) =>
            dep.id === depositId ? { ...dep, status: "Success" } : dep
          )
        );
      } else {
        console.error("Error approving deposit:", data.message);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setApprovingId(null);
    }
  };

  // ✅ NEW: Copy random UPI function
  const handleCopyRandomUpi = async () => {
    setCopyingUpi(true);
    try {
      const res = await fetch(`${BASE_URL}/upi/random`);
      const data = await res.json();

      if (data.success && data.upi && data.upi.upi) {
        await navigator.clipboard.writeText(data.upi.upi);
        alert(`📋 UPI ID "${data.upi.upi}" copied to clipboard!`);
      } else {
        alert("No UPI ID found.");
      }
    } catch (err) {
      console.error("Error copying UPI:", err);
      alert("Error fetching UPI.");
    } finally {
      setCopyingUpi(false);
    }
  };

  let filteredDeposits =
    statusFilter === "all"
      ? deposits
      : deposits.filter((d) => d.status === statusFilter);

  if (searchTerm.trim() !== "") {
    const lower = searchTerm.toLowerCase();
    filteredDeposits = filteredDeposits.filter(
      (d) =>
        d.transectionID.toLowerCase().includes(lower) ||
        (d.mobile && d.mobile.toLowerCase().includes(lower))
    );
  }

  return (
    <div className="deposit-page-container">
      <h2>User Deposits Management</h2>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={handleCopyRandomUpi}
          disabled={copyingUpi}
          style={{
            padding: "8px 15px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#007bff",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {copyingUpi ? "Copying UPI..." : "Copy Random UPI"}
        </button>
      </div>

      <div className="filter-section" style={{ flexWrap: "wrap", gap: "15px" }}>
        <label>Status Filter: </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="Pending">Pending</option>
          <option value="Success">Success</option>
        </select>

        <label style={{ marginLeft: "10px" }}>Search (Txn ID or Mobile):</label>
        <input
          type="text"
          placeholder="Enter Txn ID or Mobile"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "10px 14px",
            borderRadius: "10px",
            border: "1px solid #444",
            backgroundColor: "#1f1f33",
            color: "#e0e0e0",
            fontSize: "15px",
            minWidth: "250px",
          }}
        />
      </div>

      {loading ? (
        <p style={{ textAlign: "center", marginTop: "20px" }}>
          Loading deposits...
        </p>
      ) : (
        <div className="table-wrapper">
          <table className="deposit-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Name</th>
                <th>Status</th>
                <th>Deposit Amount</th>
                <th>Total Deposits</th>
                <th>Lifetime Amount</th>
                <th>Mobile No</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeposits.length > 0 ? (
                filteredDeposits.map((deposit) => (
                  <tr key={deposit.id}>
                    <td>{deposit.transectionID}</td>
                    <td>{deposit.name}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          deposit.status === "Pending" ? "pending" : "success"
                        }`}
                      >
                        {deposit.status}
                      </span>
                    </td>
                    <td>₹{deposit.depositAmount.toLocaleString()}</td>
                    <td>{deposit.totalDeposits}</td>
                    <td>₹{deposit.lifetime.toLocaleString()}</td>
                    <td>{deposit.mobile}</td>
                    <td>
                      {deposit.status === "Pending" && (
                        <button
                          className="status-change-btn"
                          onClick={() => handleStatusChange(deposit.id)}
                          disabled={approvingId === deposit.id}
                        >
                          {approvingId === deposit.id ? "Approving..." : "Approve"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                    No deposits found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DepositPage;
