import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  FaBars,
  FaUser,
  FaInbox,
  FaFile,
  FaSave,
  FaAssistiveListeningSystems,
  FaHome,
  FaComments,
} from "react-icons/fa";
import { FaChartBar } from "react-icons/fa6";
import { NavLink } from "react-router-dom";
import "../page/Sidebar.css";

const Sidebar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [userRole, setUserRole] = useState("");

  const toggle = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsOpen(!(window.innerWidth <= 768));
    };
    window.addEventListener("resize", handleResize);

    // ✅ Get role from localStorage
    const role = localStorage.getItem("userRole") || "Admin";
    setUserRole(role);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const routes = [
    { path: "/", name: "Dashboard", icon: <FaHome /> },
    { path: "/user", name: "User", icon: <FaUser /> },
    { path: "/deposit", name: "Deposit", icon: <FaInbox /> },
    { path: "/analytics", name: "Analytics", icon: <FaChartBar /> },
    { path: "/chat", name: "Chat", icon: <FaComments /> },
    { path: "/bethistory", name: "BetHistory", icon: <FaSave /> },
    { path: "/upimanagement", name: "Upi Management", icon: <FaAssistiveListeningSystems /> },
    // ✅ Show Employee only for Admin
    ...(userRole === "Admin"
      ? [{ path: "/employee", name: "Employee", icon: <FaFile /> }]
      : []),
  ];

  return (
    <div style={{ display: "flex" }}>
      <motion.div
        animate={{ width: isOpen ? "200px" : "60px" }}
        className="sidebar"
      >
        <div className="top_section">
          {isOpen && <h1 className="logo">Spin Admin</h1>}
          <div className="bars" onClick={toggle}>
            <FaBars />
          </div>
        </div>

        <section className="routes">
          {routes.map((route) => (
            <NavLink to={route.path} key={route.name} className="link">
              <div className="icon">{route.icon}</div>
              <AnimatePresence>
                {isOpen && (
                  <motion.span
                    className="link_text"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {route.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </section>
      </motion.div>

      <main
        className={`main-content ${isOpen ? "with-sidebar" : "collapsed-sidebar"}`}
      >
        {children}
      </main>
    </div>
  );
};

export default Sidebar;
