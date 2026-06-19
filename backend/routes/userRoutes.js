const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getUsers, getUser, createUser, updateUser, deleteUser,
  toggleUserActive, getProctors
} = require('../controllers/userController');

router.use(protect);

router.get('/proctors', getProctors);
router.get('/', authorize('chief_proctor'), getUsers);
router.post('/', authorize('chief_proctor'), createUser);
router.get('/:id', authorize('chief_proctor'), getUser);
router.put('/:id', authorize('chief_proctor'), updateUser);
router.delete('/:id', authorize('chief_proctor'), deleteUser);
router.put('/:id/toggle-active', authorize('chief_proctor'), toggleUserActive);

module.exports = router;
