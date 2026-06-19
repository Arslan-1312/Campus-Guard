const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getChiefDashboard, getProctorDashboard, getStudentDashboard } = require('../controllers/dashboardController');

router.use(protect);
router.get('/chief', authorize('chief_proctor'), getChiefDashboard);
router.get('/proctor', authorize('proctor'), getProctorDashboard);
router.get('/student', authorize('student'), getStudentDashboard);

module.exports = router;
