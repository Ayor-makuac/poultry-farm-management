const express = require('express');
const router = express.Router();
const {
  createFeedingRecord,
  getFeedingRecords,
  getBatchFeedingRecords,
  updateFeedingRecord,
  deleteFeedingRecord
} = require('../controllers/feedingController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// All routes are protected
router.use(protect);

// Batch-specific feeding records
router.get('/batch/:batchId', getBatchFeedingRecords);

// CRUD routes
router.route('/')
  .get(getFeedingRecords)
  .post(createFeedingRecord);

router.route('/:id')
  .put(updateFeedingRecord)
  .delete(authorize('Admin', 'Manager'), deleteFeedingRecord);

module.exports = router;

