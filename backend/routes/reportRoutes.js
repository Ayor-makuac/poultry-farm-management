const express = require('express');
const router = express.Router();
const {
  getProductionReport,
  getFinancialReport,
  getPerformanceMetrics,
  getInventoryReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// All routes are protected
router.use(protect);

// Report routes
router.get('/production', getProductionReport);
router.get('/financial', authorize('Admin', 'Manager'), getFinancialReport);
router.get('/performance', getPerformanceMetrics);
router.get('/inventory', getInventoryReport);

module.exports = router;

