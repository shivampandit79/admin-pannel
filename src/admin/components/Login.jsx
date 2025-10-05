import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../page/Login.css";

const Login = ({ setIsAuthenticated }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState("Admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    department: "",
    designation: "",
  });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // 🔒 Use environment variable for BASE_URL
  const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000/api";

  const navigate = useNavigate();

  // ✅ Persist login state on refresh
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    const executiveToken = localStorage.getItem("executiveToken");

    if (adminToken || executiveToken) {
      setIsAuthenticated(true);
      navigate("/dashboard"); // redirect if already logged in
    }
  }, [setIsAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const route =
        role === "Executive"
          ? `${BASE_URL}/admin/executive/login`
          : `${BASE_URL}/admin/login`;

      const res = await fetch(route, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Login Failed ❌");
        return;
      }

      // ✅ Save token
      localStorage.setItem(
        role === "Executive" ? "executiveToken" : "adminToken",
        data.token
      );

      // ✅ Save role for sidebar usage
      localStorage.setItem("userRole", role);

      setIsAuthenticated(true);
      setError("");
      setSuccessMsg("Login Successful ✅");

      // Direct redirect to dashboard
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError("Server Error ❌");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (
      !signupData.name ||
      !signupData.email ||
      !signupData.mobile ||
      !signupData.password
    ) {
      setError("All fields are required ❌");
      return;
    }

    try {
      const route =
        role === "Executive"
          ? `${BASE_URL}/admin/executive/signup`
          : `${BASE_URL}/admin/signup`;

      const res = await fetch(route, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...signupData, role }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Signup Failed ❌");
        return;
      }

      setError("");
      setSuccessMsg("Signup Successful ✅ Please Login!");
      setIsSignup(false);
    } catch (err) {
      console.error("Signup error:", err);
      setError("Server Error ❌");
    }
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (newRole === "Executive") {
      setSignupData({ ...signupData, department: "Executive", designation: "" });
    } else {
      setSignupData({ ...signupData, department: "", designation: "" });
    }
  };

  return (
    <div className="login-container">
      <div className="login-box animate-fade">
        <div className="toggle-container" style={{ gap: "15px" }}>
          <button
            className={`toggle-btn ${role === "Admin" ? "active" : ""}`}
            onClick={() => handleRoleChange("Admin")}
          >
            Admin
          </button>
          <button
            className={`toggle-btn ${role === "Executive" ? "active" : ""}`}
            onClick={() => handleRoleChange("Executive")}
          >
            Executive
          </button>
        </div>

        <h2 className="login-title">
          {isSignup ? `${role} Signup` : `${role} Login`}
        </h2>

        {!isSignup ? (
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Enter Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
              required
              autoComplete="email"
            />
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
              autoComplete="current-password"
            />
            {error && <p className="error-text">{error}</p>}
            {successMsg && <p className="success-text">{successMsg}</p>}
            <button type="submit" className="login-btn">
              Login
            </button>
            <p className="toggle-text">
              Don’t have an account?{" "}
              <span
                onClick={() => {
                  setIsSignup(true);
                  setError("");
                  setSuccessMsg("");
                }}
              >
                Signup
              </span>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <input
              type="text"
              placeholder="Full Name"
              value={signupData.name}
              onChange={(e) =>
                setSignupData({ ...signupData, name: e.target.value })
              }
              className="login-input"
              required
              autoComplete="name"
            />
            <input
              type="email"
              placeholder="Email ID"
              value={signupData.email}
              onChange={(e) =>
                setSignupData({ ...signupData, email: e.target.value })
              }
              className="login-input"
              required
              autoComplete="email"
            />
            <input
              type="text"
              placeholder="Mobile Number"
              value={signupData.mobile}
              onChange={(e) =>
                setSignupData({ ...signupData, mobile: e.target.value })
              }
              className="login-input"
              required
              autoComplete="tel"
            />

            {role === "Executive" && (
              <input
                type="text"
                placeholder="Department"
                value="Executive"
                disabled
                className="login-input"
              />
            )}

            {role !== "Executive" && role === "Admin" && null}

            {role !== "Executive" && role !== "Admin" && (
              <input
                type="text"
                placeholder="Designation"
                value={signupData.designation}
                onChange={(e) =>
                  setSignupData({ ...signupData, designation: e.target.value })
                }
                className="login-input"
                autoComplete="organization-title"
              />
            )}

            <input
              type="password"
              placeholder="Password"
              value={signupData.password}
              onChange={(e) =>
                setSignupData({ ...signupData, password: e.target.value })
              }
              className="login-input"
              required
              autoComplete="new-password"
            />
            {error && <p className="error-text">{error}</p>}
            {successMsg && <p className="success-text">{successMsg}</p>}
            <button type="submit" className="login-btn">
              Signup
            </button>
            <p className="toggle-text">
              Already have an account?{" "}
              <span
                onClick={() => {
                  setIsSignup(false);
                  setError("");
                  setSuccessMsg("");
                }}
              >
                Login
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
