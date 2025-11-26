const express = require('express');
const router = express.Router();
const {
  createInventoryItem,
  getInventoryItems,
  getInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getLowStockAlerts
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// All routes are protected
router.use(protect);

// Low stock alerts route (must be before /:id)
router.get('/alerts/low-stock', getLowStockAlerts);

// CRUD routes
router.route('/')
  .get(getInventoryItems)
  .post(authorize('Admin', 'Manager'), createInventoryItem);

router.route('/:id')
  .get(getInventoryItem)
  .put(authorize('Admin', 'Manager'), updateInventoryItem)
  .delete(authorize('Admin'), deleteInventoryItem);

module.exports = router;

