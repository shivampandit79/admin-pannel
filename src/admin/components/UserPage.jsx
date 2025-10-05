import React, { useEffect, useState } from "react";
import "../page/UserPage.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const APP_TITLE = import.meta.env.VITE_TITLE || "Admin Dashboard";

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = `${APP_TITLE} - Users`;
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("executiveToken");

      const res = await fetch(`${BASE_URL}/admin/allusers`, {
        headers: { "auth-token": token },
      });
      const data = await res.json();

      if (data.success) {
        const sortedUsers = data.users.sort(
          (a, b) =>
            parseInt(b._id.toString().substring(0, 8), 16) -
            parseInt(a._id.toString().substring(0, 8), 16)
        );
        setUsers(sortedUsers);
      } else {
        console.error("Error fetching users:", data.error);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockToggle = (id) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user._id === id ? { ...user, blocked: !user.blocked } : user
      )
    );
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="user-page-container">
      <h2>Users Management</h2>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p style={{ padding: "10px" }}>Loading users...</p>
      ) : (
        <div className="table-wrapper">
          <div className="table-inner">
            <table className="user-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Gender</th>
                  <th>Wallet</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>{user._id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.mobile}</td>
                      <td>{user.gender || "N/A"}</td>
                      <td>
                        ₹
                        {user.wallet != null
                          ? Number(user.wallet).toLocaleString()
                          : "0"}
                      </td>
                      <td>{user.blocked ? "Blocked" : "Active"}</td>
                      <td>
                        <button
                          className={`block-btn ${
                            user.blocked ? "unblock" : "block"
                          }`}
                          onClick={() => handleBlockToggle(user._id)}
                        >
                          {user.blocked ? "Unblock" : "Block"}
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(user._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center" }}>
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPage;
