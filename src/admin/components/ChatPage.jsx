import React, { useState, useEffect } from "react";
import UserList from "../components/UserList";
import ChatWindow from "../components/ChatWindow";
import "../page/ChatPage.css";

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const fetchChatHistory = async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin/chat-history`);
      const data = await res.json();

      if (data.success) {
        const formattedUsers = data.chatHistory.map((chat) => ({
          id: chat.userId,
          name: chat.userName,
          phone: chat.mobile,
          unread: false,
          lastMessage:
            chat.messages.length > 0
              ? chat.messages[chat.messages.length - 1].text
              : "",
          messages: chat.messages || [],
        }));

        setUsers(formattedUsers.reverse());
      } else {
        console.error("Error fetching chat history:", data.error);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const refreshChat = () => {
    fetchChatHistory();
    if (selectedUser) {
      const updatedUser = users.find((u) => u.id === selectedUser.id);
      if (updatedUser) setSelectedUser(updatedUser);
    }
  };

  return (
    <div className="chat-page-container">
      <div className="user-list-section">
        {loading ? (
          <p style={{ padding: "10px" }}>Loading chat history...</p>
        ) : (
          <UserList
            users={users}
            onSelectUser={handleUserSelect}
            selectedUser={selectedUser}
          />
        )}
      </div>

      <div className="chat-window-section">
        {selectedUser ? (
          <ChatWindow user={selectedUser} refreshChat={refreshChat} />
        ) : (
          <div style={{ padding: "20px" }}>Select a user to start chatting</div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
