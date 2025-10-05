import React from "react";
import "../page/ChatPage.css";

const UserList = ({ users, onSelectUser, selectedUser }) => {
  const sortedUsers = [...users].sort((a, b) => b.id - a.id); // last chat top

  return (
    <div className="user-list">
      {sortedUsers.map((user) => (
        <div
          key={user.id}
          className={`user-card ${selectedUser?.id === user.id ? "active" : ""}`}
          onClick={() => onSelectUser(user)}
        >
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-phone">{user.phone}</span>
            <span className="user-wallet">₹{user.wallet}</span> {/* Added wallet */}
          </div>
          <div className="last-message">
            {user.lastMessage}
            {user.unread && <span className="unread-dot"></span>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserList;
