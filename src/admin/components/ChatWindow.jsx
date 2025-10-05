import React, { useState, useEffect } from "react";
import "../page/ChatPage.css";

const ChatWindow = ({ user, refreshChat }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(user.messages || []);
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    setMessages(user.messages || []);
  }, [user]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        console.error("No token found, please login as admin.");
        return;
      }

      const res = await fetch(`${BASE_URL}/chat/reply/${user.id || user._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: message }),
      });

      const data = await res.json();

      if (data.success) {
        setMessages(data.chat.messages || []);
        setMessage("");
        refreshChat();
      } else {
        console.error("Error sending message:", data.message);
      }
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>{user.name}</h3>
        <span>{user.phone}</span>
      </div>

      <div className="chat-messages">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.sender}`}>
              {msg.text}
            </div>
          ))
        ) : (
          <div className="chat-message">No messages yet</div>
        )}
      </div>

      <div className="chat-input">
        <input
          type="text"
          autoComplete="off"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <button onClick={sendMessage} disabled={!message.trim()}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
