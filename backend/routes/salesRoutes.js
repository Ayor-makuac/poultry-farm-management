const express = require('express');
const router = express.Router();
const {
  createSalesRecord,
  getSalesRecords,
  getSalesStats,
  updateSalesRecord,
  deleteSalesRecord
} = require('../controllers/salesController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// All routes are protected
router.use(protect);

// Statistics route (must be before /:id)
router.get('/stats/summary', getSalesStats);

// CRUD routes
router.route('/')
  .get(getSalesRecords)
  .post(createSalesRecord);

router.route('/:id')
  .put(authorize('Admin', 'Manager'), updateSalesRecord)
  .delete(authorize('Admin'), deleteSalesRecord);

module.exports = router;

