const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const validatePassword = require('../utils/passwordValidator');

// @desc   Get all users (chief proctor only)
// @route  GET /api/users
// @access Private (chief_proctor)
const getUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 20, search } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { rollNumber: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ success: true, total, users });
});

// @desc   Get single user
// @route  GET /api/users/:id
// @access Private (chief_proctor)
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user });
});

// @desc   Create a new user (admin panel)
// @route  POST /api/users
// @access Private (chief_proctor)
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, rollNumber, department, semester, phone } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'Name, email, password, and role are required' });
  }

  const pwCheck = validatePassword(password);
  if (!pwCheck.isValid) {
    return res.status(400).json({ success: false, message: pwCheck.message });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(400).json({ success: false, message: 'A user with this email already exists' });
  }

  if (role === 'student' && rollNumber) {
    const existingRoll = await User.findOne({ rollNumber });
    if (existingRoll) {
      return res.status(400).json({ success: false, message: 'A student with this roll number already exists' });
    }
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    rollNumber: role === 'student' ? rollNumber : undefined,
    department,
    semester,
    phone,
    isActive: true,
  });

  res.status(201).json({ success: true, message: 'User created successfully', user });
});

// @desc   Update a user
// @route  PUT /api/users/:id
// @access Private (chief_proctor)
const updateUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, rollNumber, department, semester, phone, isActive } = req.body;

  const user = await User.findById(req.params.id).select('+password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  // Check email uniqueness if changing
  if (email && email.toLowerCase() !== user.email) {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already in use by another user' });
    }
    user.email = email.toLowerCase();
  }

  if (name) user.name = name;
  if (role) user.role = role;
  if (rollNumber !== undefined) user.rollNumber = rollNumber;
  if (department !== undefined) user.department = department;
  if (semester !== undefined) user.semester = semester;
  if (phone !== undefined) user.phone = phone;
  if (typeof isActive === 'boolean') user.isActive = isActive;
  if (password) {
    const pwCheck = validatePassword(password);
    if (!pwCheck.isValid) {
      return res.status(400).json({ success: false, message: pwCheck.message });
    }
    user.password = password; // pre-save hook will hash it
  }

  await user.save();

  res.json({ success: true, message: 'User updated successfully', user });
});

// @desc   Delete a user
// @route  DELETE /api/users/:id
// @access Private (chief_proctor)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  // Prevent deleting yourself
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
  }

  await user.deleteOne();
  res.json({ success: true, message: 'User deleted successfully' });
});

// @desc   Toggle user active status
// @route  PUT /api/users/:id/toggle-active
// @access Private (chief_proctor)
const toggleUserActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
});

// @desc   Get proctors list (for assignment)
// @route  GET /api/users/proctors
// @access Private
const getProctors = asyncHandler(async (req, res) => {
  const proctors = await User.find({ role: 'proctor', isActive: true })
    .select('name email department isOnline lastSeen');
  res.json({ success: true, proctors });
});

module.exports = { getUsers, getUser, createUser, updateUser, deleteUser, toggleUserActive, getProctors };
