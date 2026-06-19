const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');
const Complaint = require('../models/Complaint');

// @desc   Get messages for a complaint chat room
// @route  GET /api/chat/:complaintId
// @access Private (student who submitted, proctor assigned, chief_proctor)
const getMessages = asyncHandler(async (req, res) => {
  const { complaintId } = req.params;

  const complaint = await Complaint.findById(complaintId).select(
    'submittedBy assignedTo isAnonymous'
  );
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  // Access control
  if (req.user.role === 'student') {
    const isOwner =
      complaint.submittedBy?.toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
  }
  if (req.user.role === 'proctor') {
    const isAssigned =
      complaint.assignedTo?.toString() === req.user._id.toString();
    if (!isAssigned) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
  }

  // Chat is only available once complaint is assigned
  if (!complaint.assignedTo) {
    return res.json({ success: true, messages: [], chatAvailable: false });
  }

  const messages = await Message.find({ complaintId })
    .populate('sender', 'name role avatar')
    .sort({ createdAt: 1 })
    .limit(100);

  res.json({ success: true, messages, chatAvailable: true });
});

// @desc   Send a message in complaint chat
// @route  POST /api/chat/:complaintId
// @access Private
const sendMessage = asyncHandler(async (req, res) => {
  const { complaintId } = req.params;
  const { text } = req.body;
  const io = req.app.get('io');

  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, message: 'Message text is required' });
  }

  const complaint = await Complaint.findById(complaintId).select(
    'submittedBy assignedTo'
  );
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  // Only the student who submitted and the assigned proctor (+ chief) can chat
  if (req.user.role === 'student') {
    const isOwner =
      complaint.submittedBy?.toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
  }
  if (req.user.role === 'proctor') {
    const isAssigned =
      complaint.assignedTo?.toString() === req.user._id.toString();
    if (!isAssigned) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
  }

  if (!complaint.assignedTo) {
    return res
      .status(400)
      .json({ success: false, message: 'Chat is only available after complaint is assigned' });
  }

  const message = await Message.create({
    complaintId,
    sender: req.user._id,
    senderRole: req.user.role,
    text: text.trim(),
    readBy: [req.user._id],
  });

  await message.populate('sender', 'name role avatar');

  // Emit to the complaint chat room
  if (io) {
    io.to(`chat_${complaintId}`).emit('chat_message', message);
  }

  res.status(201).json({ success: true, message });
});

module.exports = { getMessages, sendMessage };
