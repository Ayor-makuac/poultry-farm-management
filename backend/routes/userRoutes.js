const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// All routes are protected
router.use(protect);

// Admin only routes
router.get('/', authorize('Admin', 'Manager'), getUsers);
router.delete('/:id', authorize('Admin'), deleteUser);

// User routes
router.get('/:id', getUser);
router.put('/:id', updateUser);

module.exports = router;

