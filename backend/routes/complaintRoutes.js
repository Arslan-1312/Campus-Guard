const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');
const {
  submitComplaint, getComplaints, getComplaint, trackAnonymous,
  assignComplaint, updateStatus, addComment, deleteComplaint, getProctors,
} = require('../controllers/complaintController');

// Public – anonymous tracking
router.get('/track/:referenceNumber', trackAnonymous);

// Protected
router.use(protect);

router.get('/proctors', authorize('chief_proctor'), getProctors);

router.route('/')
  .get(getComplaints)
  .post(upload.array('evidence', 5), submitComplaint);

router.route('/:id')
  .get(getComplaint)
  .delete(deleteComplaint);

router.put('/:id/assign', authorize('chief_proctor'), assignComplaint);
router.put('/:id/status', authorize('proctor', 'chief_proctor'), updateStatus);
router.post('/:id/comment', addComment);

module.exports = router;
