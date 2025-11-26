const { Expense } = require('../models');

/**
 * @desc    Create expense record
 * @route   POST /api/expenses
 * @access  Private
 */
const createExpense = async (req, res) => {
  try {
    const { category, description, amount, date, notes } = req.body;

    // Validation
    if (!category || !description || !amount || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category, description, amount, and date'
      });
    }

    const expense = await Expense.create({
      category,
      description,
      amount,
      date,
      notes,
      recorded_by: req.user.user_id
    });

    const record = await Expense.findById(expense._id).populate('recorded_by', 'name role');

    res.status(201).json({
      success: true,
      message: 'Expense record created successfully',
      data: record
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating expense record',
      error: error.message
    });
  }
};

/**
 * @desc    Get all expense records
 * @route   GET /api/expenses
 * @access  Private
 */
const getExpenses = async (req, res) => {
  try {
    const { category, start_date, end_date } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (start_date || end_date) {
      filter.date = {};
      if (start_date) filter.date.$gte = new Date(start_date);
      if (end_date) filter.date.$lte = new Date(end_date);
    }

    const expenses = await Expense.find(filter)
      .populate('recorded_by', 'name role')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expense records',
      error: error.message
    });
  }
};

/**
 * @desc    Get expense statistics
 * @route   GET /api/expenses/stats/summary
 * @access  Private
 */
const getExpenseStats = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const match = {};
    if (start_date || end_date) {
      match.date = {};
      if (start_date) match.date.$gte = new Date(start_date);
      if (end_date) match.date.$lte = new Date(end_date);
    }

    const [summary] = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: '$amount' },
          expenseCount: { $sum: 1 }
        }
      }
    ]);

    const expensesByCategory = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          total_amount: { $sum: '$amount' }
        }
      },
      { $project: { category: '$_id', count: 1, total_amount: 1, _id: 0 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalExpenses: summary?.totalExpenses || 0,
        expenseCount: summary?.expenseCount || 0,
        expensesByCategory
      }
    });
  } catch (error) {
    console.error('Get expense stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expense statistics',
      error: error.message
    });
  }
};

/**
 * @desc    Update expense record
 * @route   PUT /api/expenses/:id
 * @access  Private/Admin/Manager
 */
const updateExpense = async (req, res) => {
  try {
    const { category, description, amount, date, notes } = req.body;

    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found'
      });
    }

    expense.category = category || expense.category;
    expense.description = description || expense.description;
    expense.amount = amount ?? expense.amount;
    expense.date = date || expense.date;
    expense.notes = notes ?? expense.notes;

    await expense.save();

    const updatedRecord = await Expense.findById(expense._id).populate('recorded_by', 'name role');

    res.status(200).json({
      success: true,
      message: 'Expense record updated successfully',
      data: updatedRecord
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating expense record',
      error: error.message
    });
  }
};

/**
 * @desc    Delete expense record
 * @route   DELETE /api/expenses/:id
 * @access  Private/Admin
 */
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found'
      });
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Expense record deleted successfully'
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting expense record',
      error: error.message
    });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseStats,
  updateExpense,
  deleteExpense
};

