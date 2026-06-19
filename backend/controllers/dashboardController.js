const asyncHandler = require('express-async-handler');
const Complaint = require('../models/Complaint');
const User = require('../models/User');

// @desc   Get chief proctor dashboard stats
// @route  GET /api/dashboard/chief
// @access Private (chief_proctor)
const getChiefDashboard = asyncHandler(async (req, res) => {
  const [
    totalComplaints,
    pendingComplaints,
    underReview,
    inProgress,
    resolved,
    rejected,
    totalStudents,
    totalProctors,
    recentComplaints,
  ] = await Promise.all([
    Complaint.countDocuments(),
    Complaint.countDocuments({ status: 'pending' }),
    Complaint.countDocuments({ status: 'under_review' }),
    Complaint.countDocuments({ status: 'in_progress' }),
    Complaint.countDocuments({ status: 'resolved' }),
    Complaint.countDocuments({ status: 'rejected' }),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'proctor' }),
    Complaint.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('submittedBy', 'name rollNumber')
      .populate('assignedTo', 'name'),
  ]);

  // Category breakdown
  const categoryStats = await Complaint.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // Monthly trend (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyTrend = await Complaint.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Proctor performance
  const proctorStats = await Complaint.aggregate([
    { $match: { assignedTo: { $exists: true, $ne: null } } },
    {
      $group: {
        _id: '$assignedTo',
        assigned: { $sum: 1 },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $in: ['$status', ['under_review', 'in_progress']] }, 1, 0] } },
      },
    },
    {
      $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'proctor' },
    },
    { $unwind: '$proctor' },
    {
      $project: {
        name: '$proctor.name',
        email: '$proctor.email',
        assigned: 1,
        resolved: 1,
        pending: 1,
        resolutionRate: {
          $cond: [{ $eq: ['$assigned', 0] }, 0, { $multiply: [{ $divide: ['$resolved', '$assigned'] }, 100] }],
        },
      },
    },
  ]);

  res.json({
    success: true,
    stats: {
      totalComplaints,
      pendingComplaints,
      underReview,
      inProgress,
      resolved,
      rejected,
      totalStudents,
      totalProctors,
    },
    recentComplaints,
    categoryStats,
    monthlyTrend,
    proctorStats,
  });
});

// @desc   Get proctor dashboard
// @route  GET /api/dashboard/proctor
// @access Private (proctor)
const getProctorDashboard = asyncHandler(async (req, res) => {
  const proctorId = req.user._id;

  const [assigned, inProgress, resolved, recentComplaints] = await Promise.all([
    Complaint.countDocuments({ assignedTo: proctorId, status: { $in: ['under_review', 'in_progress'] } }),
    Complaint.countDocuments({ assignedTo: proctorId, status: 'in_progress' }),
    Complaint.countDocuments({ assignedTo: proctorId, status: 'resolved' }),
    Complaint.find({ assignedTo: proctorId })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('submittedBy', 'name rollNumber department'),
  ]);

  res.json({
    success: true,
    stats: { assigned, inProgress, resolved },
    recentComplaints,
  });
});

// @desc   Get student dashboard
// @route  GET /api/dashboard/student
// @access Private (student)
const getStudentDashboard = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  const [total, pending, inProgress, resolved, rejected, recentComplaints] = await Promise.all([
    Complaint.countDocuments({ submittedBy: studentId }),
    Complaint.countDocuments({ submittedBy: studentId, status: 'pending' }),
    Complaint.countDocuments({ submittedBy: studentId, status: { $in: ['under_review', 'in_progress'] } }),
    Complaint.countDocuments({ submittedBy: studentId, status: 'resolved' }),
    Complaint.countDocuments({ submittedBy: studentId, status: 'rejected' }),
    Complaint.find({ submittedBy: studentId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('assignedTo', 'name'),
  ]);

  res.json({
    success: true,
    stats: { total, pending, inProgress, resolved, rejected },
    recentComplaints,
  });
});

module.exports = { getChiefDashboard, getProctorDashboard, getStudentDashboard };
