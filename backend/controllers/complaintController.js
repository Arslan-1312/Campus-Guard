const asyncHandler = require('express-async-handler');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');
const { createNotification } = require('../utils/notificationHelper');
const { emitToAdmins } = require('../utils/socketHandler');

// ─── STUDENT: Submit complaint ──────────────────────────────────────────
const submitComplaint = asyncHandler(async (req, res) => {
  const {
    title, description, category, priority, isAnonymous,
    location, incidentDate, anonymousEmail,
  } = req.body;

  const io = req.app.get('io');
  const evidenceFiles = req.files || [];

  const evidence = evidenceFiles.map((file) => ({
    url: file.path && file.path.startsWith('http') ? file.path : `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
    publicId: file.filename,
    resourceType: file.resource_type || 'image',
    originalName: file.originalname,
  }));

  const complaintData = {
    title,
    description,
    category,
    priority: priority || 'medium',
    isAnonymous: isAnonymous === 'true' || isAnonymous === true,
    location,
    incidentDate,
    evidence,
    submittedBy: req.user._id, // Save the submitter in all cases (anonymous or identified)
    statusHistory: [{ status: 'pending', changedBy: req.user?._id, note: 'Complaint submitted' }],
  };

  if (complaintData.isAnonymous && anonymousEmail) {
    complaintData.anonymousEmail = anonymousEmail;
  }

  const complaint = await Complaint.create(complaintData);

  // Notify chief proctors
  const chiefProctors = await User.find({ role: 'chief_proctor' });
  for (const cp of chiefProctors) {
    await createNotification(io, {
      recipient: cp._id,
      title: 'New Complaint Submitted',
      message: `A new ${category} complaint has been submitted: "${title}"`,
      type: 'complaint_submitted',
      complaint: complaint._id,
      link: `/complaints/${complaint._id}`,
    });
  }

  // Emit real-time to admins
  emitToAdmins(io, 'new_complaint', { complaint });

  // Email confirmation
  if (!complaint.isAnonymous) {
    sendEmail({
      to: req.user.email,
      templateName: 'complaintSubmitted',
      templateData: [req.user.name, complaint.referenceNumber, complaint.title],
    });
  } else if (complaint.anonymousEmail) {
    sendEmail({
      to: complaint.anonymousEmail,
      templateName: 'complaintSubmitted',
      templateData: ['Anonymous', complaint.referenceNumber, complaint.title],
    });
  }

  res.status(201).json({
    success: true,
    message: 'Complaint submitted successfully',
    complaint: {
      _id: complaint._id,
      referenceNumber: complaint.referenceNumber,
      title: complaint.title,
      status: complaint.status,
      isAnonymous: complaint.isAnonymous,
      createdAt: complaint.createdAt,
    },
  });
});

// ─── Get complaints (role-based) ─────────────────────────────────────────
const getComplaints = asyncHandler(async (req, res) => {
  const { status, category, priority, page = 1, limit = 10, search, sortBy = 'createdAt', order = 'desc' } = req.query;

  const query = {};
  if (status) query.status = status;
  if (category) query.category = category;
  if (priority) query.priority = priority;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { referenceNumber: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // Students only see their own
  if (req.user.role === 'student') {
    query.submittedBy = req.user._id;
  }

  // Proctors see only assigned to them
  if (req.user.role === 'proctor') {
    query.assignedTo = req.user._id;
  }

  // Chief sees all

  const total = await Complaint.countDocuments(query);
  const complaints = await Complaint.find(query)
    .populate('submittedBy', 'name email rollNumber department')
    .populate('assignedTo', 'name email')
    .populate('assignedBy', 'name')
    .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const isChief = req.user.role === 'chief_proctor';
  const processedComplaints = complaints.map((complaint) => {
    const cObj = complaint.toObject();
    if (cObj.isAnonymous && !isChief) {
      cObj.submittedBy = null;
    }
    return cObj;
  });

  res.json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    complaints: processedComplaints,
  });
});

// ─── Get single complaint ─────────────────────────────────────────────────
const getComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('submittedBy', 'name email rollNumber department phone')
    .populate('assignedTo', 'name email phone department')
    .populate('assignedBy', 'name email')
    .populate('resolvedBy', 'name email')
    .populate('comments.author', 'name role')
    .populate('statusHistory.changedBy', 'name role');

  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  // Access control
  if (req.user.role === 'student') {
    const isOwner = complaint.submittedBy?._id?.toString() === req.user._id.toString();
    if (!isOwner && !complaint.isAnonymous) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
  }

  // Build response — chief_proctor can always see real submitter identity
  const complaintObj = complaint.toObject();
  const isChief = req.user.role === 'chief_proctor';

  // For anonymous complaints: non-chief roles see no submitter info
  if (complaint.isAnonymous && !isChief) {
    complaintObj.submittedBy = null;
  }

  // Attach a flag so frontend knows if identity was revealed
  complaintObj._identityRevealed = isChief && complaint.isAnonymous && !!complaint.submittedBy;

  res.json({ success: true, complaint: complaintObj });
});

// ─── Track anonymous complaint ─────────────────────────────────────────────
const trackAnonymous = asyncHandler(async (req, res) => {
  const { referenceNumber } = req.params;

  const complaint = await Complaint.findOne({ referenceNumber, isAnonymous: true })
    .select('referenceNumber title status category priority createdAt statusHistory comments')
    .populate('comments.author', 'name role');

  if (!complaint) {
    return res.status(404).json({ success: false, message: 'No anonymous complaint found with this reference number' });
  }

  // Filter internal comments
  const publicComments = complaint.comments.filter((c) => !c.isInternal);

  res.json({
    success: true,
    complaint: {
      referenceNumber: complaint.referenceNumber,
      title: complaint.title,
      status: complaint.status,
      category: complaint.category,
      priority: complaint.priority,
      createdAt: complaint.createdAt,
      statusHistory: complaint.statusHistory,
      comments: publicComments,
    },
  });
});

// ─── CHIEF PROCTOR: Assign complaint ─────────────────────────────────────
const assignComplaint = asyncHandler(async (req, res) => {
  const { proctorId, priority, note } = req.body;
  const io = req.app.get('io');

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

  const proctor = await User.findById(proctorId);
  if (!proctor || proctor.role !== 'proctor') {
    return res.status(400).json({ success: false, message: 'Invalid proctor' });
  }

  const oldStatus = complaint.status;
  complaint.assignedTo = proctorId;
  complaint.assignedBy = req.user._id;
  complaint.assignedAt = new Date();
  complaint.status = 'under_review';
  if (priority) complaint.priority = priority;

  complaint.statusHistory.push({
    status: 'under_review',
    changedBy: req.user._id,
    note: note || `Assigned to ${proctor.name}`,
  });

  await complaint.save();

  const populated = await complaint.populate([
    { path: 'submittedBy', select: 'name email' },
    { path: 'assignedTo', select: 'name email' },
  ]);

  // Notify proctor
  await createNotification(io, {
    recipient: proctorId,
    title: 'Complaint Assigned to You',
    message: `Complaint "${complaint.title}" has been assigned to you`,
    type: 'complaint_assigned',
    complaint: complaint._id,
    link: `/complaints/${complaint._id}`,
  });

  // Notify student
  if (complaint.submittedBy) {
    await createNotification(io, {
      recipient: complaint.submittedBy._id,
      title: 'Your Complaint is Under Review',
      message: `Your complaint "${complaint.title}" is now being reviewed`,
      type: 'status_update',
      complaint: complaint._id,
      link: `/my-complaints/${complaint._id}`,
    });

    sendEmail({
      to: complaint.submittedBy.email,
      templateName: 'statusUpdate',
      templateData: [complaint.submittedBy.name, complaint.referenceNumber, oldStatus, 'under_review', `Assigned to ${proctor.name}`],
    });
  }

  // Email proctor
  sendEmail({
    to: proctor.email,
    templateName: 'complaintAssigned',
    templateData: [proctor.name, complaint.referenceNumber, complaint.title],
  });

  // Emit real-time
  io.to(`complaint_${complaint._id}`).emit('complaint_updated', populated);

  res.json({ success: true, message: 'Complaint assigned successfully', complaint: populated });
});

// ─── PROCTOR: Update status ───────────────────────────────────────────────
const updateStatus = asyncHandler(async (req, res) => {
  const { status, note, resolution } = req.body;
  const io = req.app.get('io');

  const validStatuses = ['under_review', 'in_progress', 'resolved', 'rejected', 'closed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const complaint = await Complaint.findById(req.params.id).populate('submittedBy', 'name email');
  if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

  // Proctors can only update their assigned complaints
  if (req.user.role === 'proctor' && complaint.assignedTo?.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized to update this complaint' });
  }

  const oldStatus = complaint.status;
  complaint.status = status;

  if (resolution) complaint.resolution = resolution;
  if (status === 'resolved' || status === 'closed') {
    complaint.resolvedAt = new Date();
    complaint.resolvedBy = req.user._id;
  }

  complaint.statusHistory.push({ status, changedBy: req.user._id, note });
  await complaint.save();

  // Notify student
  if (complaint.submittedBy) {
    await createNotification(io, {
      recipient: complaint.submittedBy._id,
      title: `Complaint Status: ${status.replace('_', ' ').toUpperCase()}`,
      message: `Your complaint "${complaint.title}" status updated to ${status}`,
      type: 'status_update',
      complaint: complaint._id,
    });

    sendEmail({
      to: complaint.submittedBy.email,
      templateName: 'statusUpdate',
      templateData: [complaint.submittedBy.name, complaint.referenceNumber, oldStatus, status, note],
    });
  }

  // Real-time emit
  io.to(`complaint_${complaint._id}`).emit('status_changed', { complaintId: complaint._id, status, changedBy: req.user.name });

  res.json({ success: true, message: 'Status updated successfully', complaint });
});

// ─── Add comment ─────────────────────────────────────────────────────────
const addComment = asyncHandler(async (req, res) => {
  const { text, isInternal } = req.body;
  const io = req.app.get('io');

  const complaint = await Complaint.findById(req.params.id).populate('submittedBy', 'name email _id');
  if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

  // Students can't add internal comments
  const internal = req.user.role !== 'student' && (isInternal === true || isInternal === 'true');

  // Students can only comment on their own
  if (req.user.role === 'student') {
    const isOwner = complaint.submittedBy?._id?.toString() === req.user._id.toString();
    if (!isOwner) return res.status(403).json({ success: false, message: 'Access denied' });
  }

  complaint.comments.push({
    author: req.user._id,
    authorRole: req.user.role,
    text,
    isInternal: internal,
  });

  await complaint.save();
  await complaint.populate('comments.author', 'name role avatar');

  const newComment = complaint.comments[complaint.comments.length - 1];

  // Emit real-time
  io.to(`complaint_${complaint._id}`).emit('new_comment', { complaintId: complaint._id, comment: newComment });

  // Notify relevant parties
  const recipients = new Set();
  if (complaint.submittedBy && req.user._id.toString() !== complaint.submittedBy._id.toString()) {
    if (!internal) recipients.add(complaint.submittedBy._id.toString());
  }
  if (complaint.assignedTo && req.user._id.toString() !== complaint.assignedTo.toString()) {
    recipients.add(complaint.assignedTo.toString());
  }

  for (const recipId of recipients) {
    await createNotification(io, {
      recipient: recipId,
      title: 'New Comment on Complaint',
      message: `${req.user.name} commented on "${complaint.title}"`,
      type: 'comment_added',
      complaint: complaint._id,
    });
  }

  res.status(201).json({ success: true, message: 'Comment added', comment: newComment });
});

// ─── Delete complaint (own, or admin) ────────────────────────────────────
const deleteComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

  if (req.user.role === 'student') {
    const isOwner = complaint.submittedBy?.toString() === req.user._id.toString();
    if (!isOwner) return res.status(403).json({ success: false, message: 'Access denied' });
    if (complaint.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Cannot delete a complaint that is already being processed' });
    }
  }

  await complaint.deleteOne();
  res.json({ success: true, message: 'Complaint deleted' });
});

// ─── Get all proctors (for assignment) ───────────────────────────────────
const getProctors = asyncHandler(async (req, res) => {
  const proctors = await User.find({ role: 'proctor', isActive: true }).select('name email department isOnline lastSeen');
  res.json({ success: true, proctors });
});

module.exports = {
  submitComplaint,
  getComplaints,
  getComplaint,
  trackAnonymous,
  assignComplaint,
  updateStatus,
  addComment,
  deleteComplaint,
  getProctors,
};
