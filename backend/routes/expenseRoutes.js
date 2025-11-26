const express = require('express');
const router = express.Router();
const {
  createExpense,
  getExpenses,
  getExpenseStats,
  updateExpense,
  deleteExpense
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// All routes are protected
router.use(protect);

// Statistics route (must be before /:id)
router.get('/stats/summary', getExpenseStats);

// CRUD routes
router.route('/')
  .get(getExpenses)
  .post(createExpense);

router.route('/:id')
  .put(authorize('Admin', 'Manager'), updateExpense)
  .delete(authorize('Admin'), deleteExpense);

module.exports = router;

