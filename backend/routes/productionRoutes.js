const express = require('express');
const router = express.Router();
const {
  createProductionRecord,
  getProductionRecords,
  getBatchProductionRecords,
  getProductionStats,
  updateProductionRecord,
  deleteProductionRecord
} = require('../controllers/productionController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// All routes are protected
router.use(protect);

// Statistics route (must be before /:id)
router.get('/stats/summary', getProductionStats);

// Batch-specific production records
router.get('/batch/:batchId', getBatchProductionRecords);

// CRUD routes
router.route('/')
  .get(getProductionRecords)
  .post(createProductionRecord);

router.route('/:id')
  .put(updateProductionRecord)
  .delete(authorize('Admin', 'Manager'), deleteProductionRecord);

module.exports = router;

