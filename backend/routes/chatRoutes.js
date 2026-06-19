const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMessages, sendMessage } = require('../controllers/chatController');

router.get('/:complaintId', protect, getMessages);
router.post('/:complaintId', protect, sendMessage);

module.exports = router;
