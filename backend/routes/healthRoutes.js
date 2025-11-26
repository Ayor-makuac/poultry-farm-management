const express = require('express');
const router = express.Router();
const {
  createHealthRecord,
  getHealthRecords,
  getBatchHealthRecords,
  updateHealthRecord,
  deleteHealthRecord,
  getHealthAlerts
} = require('../controllers/healthController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// All routes are protected
router.use(protect);

// Health alerts route
router.get('/alerts/active', getHealthAlerts);

// Batch-specific health records
router.get('/batch/:batchId', getBatchHealthRecords);

// CRUD routes
router.route('/')
  .get(getHealthRecords)
  .post(authorize('Admin', 'Manager', 'Veterinarian'), createHealthRecord);

router.route('/:id')
  .put(authorize('Admin', 'Manager', 'Veterinarian'), updateHealthRecord)
  .delete(authorize('Admin'), deleteHealthRecord);

module.exports = router;

