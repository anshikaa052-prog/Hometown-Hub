import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import socket from "../socket";

function CommunityChat() {
  const { communityId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);

  useEffect(() => {
    let active = true;

    const fetchMessages = async () => {
      try {
        const response = await API.get(`/chat/${communityId}`);

        if (active) {
          setMessages(response.data.messages || []);
        }
      } catch (error) {
        if (active) {
          alert(
            error.response?.data?.message ||
              "Failed to load chat messages"
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    const joinCommunityRoom = () => {
      socket.emit("joinCommunityRoom", communityId);
    };

    if (socket.connected) {
      joinCommunityRoom();
    } else {
      socket.on("connect", joinCommunityRoom);
    }

    const handleNewMessage = (newMessage) => {
      const messageCommunity =
        typeof newMessage.community === "object"
          ? newMessage.community?._id
          : newMessage.community;

      if (String(messageCommunity) !== String(communityId)) {
        return;
      }

      setMessages((current) => {
        if (current.some((item) => item._id === newMessage._id)) {
          return current;
        }

        return [...current, newMessage];
      });
    };

    socket.on("newChatMessage", handleNewMessage);

    fetchMessages();

    return () => {
      active = false;

      socket.off("connect", joinCommunityRoom);
      socket.off("newChatMessage", handleNewMessage);

      if (socket.connected) {
        socket.emit("leaveCommunityRoom", communityId);
      }
    };
  }, [communityId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();

    const text = message.trim();

    if (!text || sending) return;

    try {
      setSending(true);

      const response = await API.post(`/chat/${communityId}`, {
        message: text,
      });

      const sentMessage = response.data.chatMessage;

      setMessages((current) => {
        if (current.some((item) => item._id === sentMessage._id)) {
          return current;
        }

        return [...current, sentMessage];
      });

      setMessage("");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to send message"
      );
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <p>Loading community chat...</p>;
  }

  return (
    <div
      style={{
        maxWidth: "750px",
        margin: "30px auto",
        padding: "15px",
      }}
    >
      <button
        type="button"
        onClick={() => navigate(`/communities/${communityId}`)}
      >
        Back to Community
      </button>

      <h1>Community Group Chat 💬</h1>

      <div
        style={{
          height: "400px",
          overflowY: "auto",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "15px",
          marginBottom: "15px",
        }}
      >
        {messages.length === 0 ? (
          <p>No messages yet. Start the conversation!</p>
        ) : (
          messages.map((item) => (
            <div
              key={item._id}
              style={{
                background: "#f3f6fa",
                padding: "10px",
                borderRadius: "8px",
                marginBottom: "10px",
              }}
            >
              <strong>
                {item.sender?.name || "Unknown User"}
              </strong>

              <p style={{ margin: "6px 0" }}>
                {item.message}
              </p>

              <small>
                {new Date(item.createdAt).toLocaleString()}
              </small>
            </div>
          ))
        )}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        style={{
          display: "flex",
          gap: "10px",
        }}
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          maxLength={2000}
          style={{
            flex: 1,
            padding: "12px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />

        <button
          type="submit"
          disabled={sending || !message.trim()}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}

export default CommunityChat;