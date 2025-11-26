const express = require('express');
const router = express.Router();
const {
  createFlock,
  getFlocks,
  getFlock,
  updateFlock,
  deleteFlock,
  getFlockStats
} = require('../controllers/flockController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// All routes are protected
router.use(protect);

// Statistics route (must be before /:id)
router.get('/stats/summary', getFlockStats);

// CRUD routes
router.route('/')
  .get(getFlocks)
  .post(authorize('Admin', 'Manager'), createFlock);

router.route('/:id')
  .get(getFlock)
  .put(authorize('Admin', 'Manager'), updateFlock)
  .delete(authorize('Admin'), deleteFlock);

module.exports = router;

