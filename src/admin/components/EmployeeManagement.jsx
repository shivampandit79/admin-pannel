import React, { useEffect, useState } from "react";
import "../page/EmployeeManagement.css";

const EmployeeManagement = () => {
  const [executives, setExecutives] = useState([]);
  const [roles, setRoles] = useState([
    "Manager",
    "Supervisor",
    "Team Lead",
    "Coordinator",
  ]);
  const [selectedRole, setSelectedRole] = useState({});
  const [selectedPermission, setSelectedPermission] = useState({});
  const [userRole, setUserRole] = useState("");

  // ✅ Base URL from environment variable
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchUserRole();
    fetchExecutives();
  }, []);

  // 🔍 Get logged-in user's role
  const fetchUserRole = async () => {
    try {
      const token =
        localStorage.getItem("adminToken") ||
        localStorage.getItem("executiveToken");
      if (!token) return;

      const res = await fetch(`${BASE_URL}/admin/me`, {
        headers: { "Content-Type": "application/json", "auth-token": token },
      });
      const data = await res.json();

      if (data.success) setUserRole(data.admin.role);
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  // 🧩 Fetch all executives
  const fetchExecutives = async () => {
    try {
      const token =
        localStorage.getItem("adminToken") ||
        localStorage.getItem("executiveToken");
      if (!token) {
        alert("Please login first");
        window.location.href = "/login";
        return;
      }

      const res = await fetch(`${BASE_URL}/admin/executives`, {
        headers: { "Content-Type": "application/json", "auth-token": token },
      });

      const data = await res.json();
      if (data.success) {
        setExecutives(data.executives || []);
      } else {
        alert(data.message || "Authentication failed");
      }
    } catch (error) {
      console.error("Error fetching executives:", error);
    }
  };

  // 🎯 Handle role/permission updates
  const handleRoleChange = (id, value) => {
    setSelectedRole({ ...selectedRole, [id]: value });
  };

  const handlePermissionChange = (id, value) => {
    setSelectedPermission({ ...selectedPermission, [id]: value });
  };

  // ✅ Approve / Block logic
  const handleStatusChange = async (id, action) => {
    if (userRole !== "admin" && !selectedPermission[id]) {
      alert("Please select a permission");
      return;
    }

    try {
      const token =
        localStorage.getItem("adminToken") ||
        localStorage.getItem("executiveToken");
      if (!token) {
        alert("Please login first");
        window.location.href = "/login";
        return;
      }

      const res = await fetch(`${BASE_URL}/admin/executive/status/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "auth-token": token },
        body: JSON.stringify({
          action,
          designation: selectedRole[id] || "Executive",
          permission: userRole === "admin" ? "Write" : selectedPermission[id],
        }),
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Something went wrong");
        return;
      }

      alert("Status updated successfully ✅");
      fetchExecutives();
    } catch (error) {
      console.error("Error changing status:", error);
      alert("Error updating status");
    }
  };

  return (
    <div className="employee-management">
      <h2>Employee Management</h2>
      <table className="employee-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>DOJ</th>
            <th>Role</th>
            <th>Permission</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {executives.map((exec) => {
            const canEdit =
              userRole === "admin" ||
              exec.permission === "Write" ||
              exec.permission === "Both" ||
              !exec.isApproved;

            return (
              <tr key={exec._id}>
                <td>{exec.name}</td>
                <td>{exec.email}</td>
                <td>{exec.mobile}</td>
                <td>{new Date(exec.createdAt).toLocaleDateString()}</td>

                <td>
                  <select
                    value={selectedRole[exec._id] ?? exec.designation ?? ""}
                    onChange={(e) => handleRoleChange(exec._id, e.target.value)}
                    disabled={exec.isApproved && userRole !== "admin"}
                  >
                    <option value="">Select Role</option>
                    {roles.map((role, idx) => (
                      <option key={idx} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>

                <td>
                  {userRole === "admin" ? (
                    <span>Write</span>
                  ) : (
                    <select
                      value={selectedPermission[exec._id] ?? ""}
                      onChange={(e) =>
                        handlePermissionChange(exec._id, e.target.value)
                      }
                      disabled={exec.isApproved}
                    >
                      <option value="">Select Permission</option>
                      <option value="Read">Read</option>
                      <option value="Write">Write</option>
                      <option value="Both">Read & Write</option>
                    </select>
                  )}
                </td>

                <td>
                  <button
                    className="approve-btn"
                    onClick={() => handleStatusChange(exec._id, "approve")}
                    disabled={exec.isApproved}
                  >
                    {exec.isApproved ? "Approved" : "Approve"}
                  </button>

                  <button
                    className="block-btn"
                    onClick={() => handleStatusChange(exec._id, "block")}
                  >
                    {exec.blocked ? "Blocked" : "Block"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeManagement;
