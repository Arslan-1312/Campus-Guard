import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    const s = io(process.env.REACT_APP_SOCKET_URL || '', {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = s;
    setSocket(s);

    s.on('connect', () => {
      s.emit('user_join', user._id);
    });

    s.on('online_users', (users) => setOnlineUsers(users));

    s.on('new_notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((c) => c + 1);

      toast.custom(
        (t) => (
          <div className={`cg-toast ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
            {/* Bell icon */}
            <div className="cg-toast-icon">🔔</div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="cg-toast-title">
                {notification.title || 'New Notification'}
              </div>
              <div className="cg-toast-msg">
                {notification.message}
              </div>
              <div className="cg-toast-time">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* Close */}
            <button
              className="cg-toast-close"
              onClick={() => toast.dismiss(t.id)}
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        ),
        { duration: 5000, position: 'top-right' }
      );
    });


    s.on('disconnect', () => console.log('Socket disconnected'));

    return () => {
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [user]);

  const joinComplaint  = (id) => socketRef.current?.emit('join_complaint', id);
  const leaveComplaint = (id) => socketRef.current?.emit('leave_complaint', id);
  const emitTyping     = (id, name) => socketRef.current?.emit('typing', { complaintId: id, userName: name });
  const emitStopTyping = (id) => socketRef.current?.emit('stop_typing', { complaintId: id });
  const clearUnread    = () => setUnreadCount(0);

  return (
    <SocketContext.Provider value={{
      socket,
      onlineUsers,
      notifications,
      unreadCount,
      clearUnread,
      joinComplaint,
      leaveComplaint,
      emitTyping,
      emitStopTyping,
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
