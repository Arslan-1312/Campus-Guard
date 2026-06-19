const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const User = require('../models/User');
const { generateToken, generateResetToken } = require('../utils/generateToken');
const { sendEmail } = require('../utils/emailService');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, rollNumber, department, semester, phone } = req.body;

  // Only allow student self-registration; proctors created by chief
  if (role && role !== 'student') {
    return res.status(403).json({ success: false, message: 'Students can only register as students' });
  }

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'student',
    rollNumber,
    department,
    semester,
    phone,
  });

  // Send welcome email
  sendEmail({ to: email, templateName: 'welcome', templateData: [name] });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      rollNumber: user.rollNumber,
      department: user.department,
      semester: user.semester,
      phone: user.phone,
      avatar: user.avatar,
      isOnline: user.isOnline,
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Please provide identifier (Email or Roll Number) and password' });
  }

  let user;

  if (identifier.includes('@')) {
    if (!identifier.endsWith('@hu.edu.pk')) {
       return res.status(403).json({ success: false, message: 'Staff must login with a valid @hu.edu.pk email address' });
    }
    user = await User.findOne({ email: identifier.toLowerCase() }).select('+password');
    if (user && user.role === 'student') {
        return res.status(403).json({ success: false, message: 'Students must login using their Roll Number' });
    }
  } else {
    user = await User.findOne({ rollNumber: identifier }).select('+password');
    if (user && user.role !== 'student') {
        return res.status(403).json({ success: false, message: 'Staff must login using their @hu.edu.pk email address' });
    }
  }

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (!user.isActive) {
    return res.status(401).json({ success: false, message: 'Your account has been deactivated. Contact administration.' });
  }

  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      rollNumber: user.rollNumber,
      department: user.department,
      semester: user.semester,
      phone: user.phone,
      avatar: user.avatar,
      isOnline: user.isOnline,
    },
  });
});

// @desc    Get logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
});

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, department, semester, rollNumber } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, department, semester, rollNumber },
    { new: true, runValidators: true }
  );

  res.json({ success: true, message: 'Profile updated', user });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password changed successfully' });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({ success: false, message: 'No account with that email' });
  }

  const resetToken = generateResetToken(user._id);
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  sendEmail({ to: user.email, templateName: 'passwordReset', templateData: [user.name, resetUrl] });

  res.json({ success: true, message: 'Password reset email sent' });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const jwt = require('jsonwebtoken');
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    if (decoded.purpose !== 'reset') throw new Error();

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.password = req.body.password;
    await user.save();

    res.json({ success: true, message: 'Password reset successful. You can now login.' });
  } catch (e) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
  }
});

// @desc    Create proctor/chief (chief proctor only)
// @route   POST /api/auth/create-staff
// @access  Private (chief_proctor)
const createStaff = asyncHandler(async (req, res) => {
  const { name, email, password, role, department, phone } = req.body;

  if (!['proctor', 'chief_proctor'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Role must be proctor or chief_proctor' });
  }

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  const user = await User.create({ name, email, password, role, department, phone });
  sendEmail({ to: email, templateName: 'welcome', templateData: [name] });

  res.status(201).json({ success: true, message: `${role} account created`, user });
});

module.exports = { register, login, getMe, updateProfile, changePassword, forgotPassword, resetPassword, createStaff };
