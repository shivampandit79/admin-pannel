// src/admin/components/ui/Card.jsx
import React from "react";

// Card wrapper
export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow ${className}`}>
      {children}
    </div>
  );
}

// Card Content wrapper
export function CardContent({ children, className = "" }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
