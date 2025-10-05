import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // ✅ import BrowserRouter
import App from "./App"; // your main App component
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter> {/* ✅ Wrap your App here */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
