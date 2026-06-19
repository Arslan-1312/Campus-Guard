const User = require('../models/User');

const onlineUsers = new Map(); // userId -> socketId

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // User joins with their userId
    socket.on('user_join', async (userId) => {
      if (!userId) return;
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;

      try {
        await User.findByIdAndUpdate(userId, { isOnline: true, socketId: socket.id, lastSeen: new Date() });
      } catch (e) {}

      io.emit('online_users', Array.from(onlineUsers.keys()));
      console.log(`👤 User ${userId} is online`);
    });

    // Join a complaint detail room (for status updates)
    socket.on('join_complaint', (complaintId) => {
      socket.join(`complaint_${complaintId}`);
    });

    socket.on('leave_complaint', (complaintId) => {
      socket.leave(`complaint_${complaintId}`);
    });

    // ─── Chat room (student <-> proctor) ─────────────────────────────────
    socket.on('join_chat', (complaintId) => {
      socket.join(`chat_${complaintId}`);
      console.log(`💬 Socket ${socket.id} joined chat_${complaintId}`);
    });

    socket.on('leave_chat', (complaintId) => {
      socket.leave(`chat_${complaintId}`);
    });

    // Typing indicator for chat
    socket.on('chat_typing', ({ complaintId, userName }) => {
      socket.to(`chat_${complaintId}`).emit('chat_user_typing', { userName });
    });

    socket.on('chat_stop_typing', ({ complaintId }) => {
      socket.to(`chat_${complaintId}`).emit('chat_user_stop_typing');
    });

    // Typing indicator for complaint comment (legacy)
    socket.on('typing', ({ complaintId, userName }) => {
      socket.to(`complaint_${complaintId}`).emit('user_typing', { userName });
    });

    socket.on('stop_typing', ({ complaintId }) => {
      socket.to(`complaint_${complaintId}`).emit('user_stop_typing');
    });

    socket.on('disconnect', async () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        try {
          await User.findByIdAndUpdate(socket.userId, { isOnline: false, lastSeen: new Date(), socketId: null });
        } catch (e) {}
        io.emit('online_users', Array.from(onlineUsers.keys()));
        console.log(`👤 User ${socket.userId} went offline`);
      }
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

// Helper: emit notification to a specific user
const emitToUser = (io, userId, event, data) => {
  const socketId = onlineUsers.get(userId?.toString());
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
};

// Helper: emit to all chief proctors
const emitToAdmins = async (io, event, data) => {
  try {
    const admins = await User.find({ role: { $in: ['chief_proctor', 'proctor'] } }).select('_id');
    admins.forEach((admin) => emitToUser(io, admin._id.toString(), event, data));
  } catch (e) {}
};

module.exports = { socketHandler, emitToUser, emitToAdmins, onlineUsers };
