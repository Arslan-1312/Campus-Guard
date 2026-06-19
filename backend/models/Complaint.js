const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    authorRole: {
      type: String,
      enum: ['student', 'proctor', 'chief_proctor', 'system'],
    },
    text: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    isInternal: {
      type: Boolean,
      default: false, // Internal = only proctors/chief can see
    },
  },
  { timestamps: true }
);

const complaintSchema = new mongoose.Schema(
  {
    referenceNumber: {
      type: String,
      unique: true,
      default: () => `CG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    category: {
      type: String,
      required: true,
      enum: ['harassment', 'smoking', 'bullying', 'academic', 'ragging', 'theft', 'violence', 'misconduct', 'other'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'in_progress', 'resolved', 'rejected', 'closed'],
      default: 'pending',
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: function () { return !this.isAnonymous; },
    },
    anonymousToken: {
      type: String, // Encrypted token for anonymous tracking
      select: false,
    },
    anonymousEmail: {
      type: String, // Email to send updates for anonymous complaints
      select: false,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedAt: Date,
    location: {
      type: String,
      trim: true,
    },
    incidentDate: {
      type: Date,
    },
    evidence: [
      {
        url: String,
        publicId: String,
        resourceType: String,
        originalName: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    comments: [commentSchema],
    resolution: {
      type: String,
      maxlength: 2000,
    },
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    statusHistory: [
      {
        status: String,
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
    isRead: {
      type: Boolean,
      default: false,
    },
    viewedBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        viewedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
complaintSchema.index({ referenceNumber: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ submittedBy: 1 });
complaintSchema.index({ assignedTo: 1 });
complaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);
