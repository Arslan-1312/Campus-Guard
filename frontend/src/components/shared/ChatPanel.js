import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../utils/api';

const ChatPanel = ({ complaintId, assignedTo, submittedBy }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [chatAvailable, setChatAvailable] = useState(false);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  const fetchMessages = useCallback(async () => {
    try {
      const { data } = await api.get(`/chat/${complaintId}`);
      setMessages(data.messages || []);
      setChatAvailable(data.chatAvailable);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [complaintId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Socket events
  useEffect(() => {
    if (!socket || !complaintId) return;
    socket.emit('join_chat', complaintId);

    const handleMsg = (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    const handleTyping = ({ userName }) => {
      setTypingUser(userName);
    };

    const handleStopTyping = () => setTypingUser(null);

    socket.on('chat_message', handleMsg);
    socket.on('chat_user_typing', handleTyping);
    socket.on('chat_user_stop_typing', handleStopTyping);

    return () => {
      socket.emit('leave_chat', complaintId);
      socket.off('chat_message', handleMsg);
      socket.off('chat_user_typing', handleTyping);
      socket.off('chat_user_stop_typing', handleStopTyping);
    };
  }, [socket, complaintId]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  const handleTyping = () => {
    if (!socket) return;
    socket.emit('chat_typing', { complaintId, userName: user?.name });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('chat_stop_typing', { complaintId });
    }, 1800);
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      if (socket) socket.emit('chat_stop_typing', { complaintId });
      const { data } = await api.post(`/chat/${complaintId}`, { text: text.trim() });
      setText('');
      if (data?.message) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === data.message._id)) return prev;
          return [...prev, data.message];
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const fmtTime = (d) => {
    const dt = new Date(d);
    return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const fmtDate = (d) => {
    const dt = new Date(d);
    const today = new Date();
    if (dt.toDateString() === today.toDateString()) return 'Today';
    return dt.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const avatarColor = (role) => {
    if (role === 'student') return 'linear-gradient(135deg,#06b6d4,#6366f1)';
    if (role === 'proctor') return 'linear-gradient(135deg,#10b981,#06b6d4)';
    return 'linear-gradient(135deg,#7c3aed,#f59e0b)';
  };

  if (!chatAvailable) {
    return (
      <div className="cg-card" style={{ textAlign: 'center', padding: '32px 24px' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
        <h6 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 6 }}>Chat Unavailable</h6>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>
          The chat channel opens once this complaint is assigned to a proctor.
        </p>
      </div>
    );
  }

  // Group messages by date
  const groupedMessages = messages.reduce((acc, msg) => {
    const dateKey = fmtDate(msg.createdAt);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(msg);
    return acc;
  }, {});

  return (
    <div className="cg-card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div className="cg-chat-header">
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16,
        }}>💬</div>
        <div>
          <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 14 }}>
            Complaint Chat
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 11 }}>
            Private channel — Student & Proctor only
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span style={{
            background: 'rgba(16,185,129,0.15)', color: '#34d399',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600,
          }}>
            ● Live
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="cg-chat-messages">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#475569' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
            Loading messages…
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#475569' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>👋</div>
            <div style={{ fontSize: 14 }}>No messages yet. Start the conversation!</div>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, msgs]) => (
            <React.Fragment key={date}>
              <div style={{ textAlign: 'center', margin: '8px 0' }}>
                <span style={{
                  background: 'rgba(255,255,255,0.06)', color: '#64748b',
                  borderRadius: 20, padding: '3px 12px', fontSize: 11,
                }}>
                  {date}
                </span>
              </div>
              {msgs.map((msg) => {
                const isOwn = msg.sender?._id === user?._id || msg.sender === user?._id;
                return (
                  <div key={msg._id} className={`cg-msg ${isOwn ? 'own' : ''}`}>
                    {!isOwn && (
                      <div className="cg-msg-avatar" style={{ background: avatarColor(msg.senderRole) }}>
                        {msg.sender?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                    <div>
                      {!isOwn && (
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 3, paddingLeft: 2 }}>
                          {msg.sender?.name}
                          <span style={{ marginLeft: 6, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                            ({msg.senderRole?.replace('_', ' ')})
                          </span>
                        </div>
                      )}
                      <div className="cg-msg-bubble">{msg.text}</div>
                      <div className="cg-msg-time" style={{ textAlign: isOwn ? 'right' : 'left' }}>
                        {fmtTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))
        )}

        {/* Typing indicator */}
        {typingUser && (
          <div className="cg-msg" style={{ alignItems: 'center' }}>
            <div className="cg-msg-avatar" style={{ background: 'rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: 12 }}>
              {typingUser.charAt(0)}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '4px 16px 16px 16px', padding: '10px 14px' }}>
              <div className="typing-indicator">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="cg-chat-footer">
        <input
          type="text"
          className="cg-chat-input"
          placeholder="Type a message… (Enter to send)"
          value={text}
          onChange={(e) => { setText(e.target.value); handleTyping(); }}
          onKeyDown={handleKeyDown}
          maxLength={1000}
        />
        <button
          className="cg-chat-send"
          onClick={sendMessage}
          disabled={!text.trim() || sending}
          title="Send"
        >
          <i className="bi bi-send-fill" style={{ fontSize: 14 }} />
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;
