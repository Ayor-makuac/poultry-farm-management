const { Expense, User } = require('../models');
const { Op } = require('sequelize');

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

    const record = await Expense.findByPk(expense.expense_id, {
      include: [
        { model: User, as: 'recorder', attributes: ['user_id', 'name', 'role'] }
      ]
    });

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

    // Build filter
    const where = {};
    if (category) where.category = category;
    if (start_date && end_date) {
      where.date = { [Op.between]: [start_date, end_date] };
    } else if (start_date) {
      where.date = { [Op.gte]: start_date };
    } else if (end_date) {
      where.date = { [Op.lte]: end_date };
    }

    const expenses = await Expense.findAll({
      where,
      include: [
        { model: User, as: 'recorder', attributes: ['user_id', 'name', 'role'] }
      ],
      order: [['date', 'DESC']]
    });

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

    const where = {};
    if (start_date && end_date) {
      where.date = { [Op.between]: [start_date, end_date] };
    }

    const totalExpenses = await Expense.sum('amount', { where });
    const expenseCount = await Expense.count({ where });

    // Expenses by category
    const expensesByCategory = await Expense.findAll({
      where,
      attributes: [
        'category',
        [Expense.sequelize.fn('COUNT', Expense.sequelize.col('expense_id')), 'count'],
        [Expense.sequelize.fn('SUM', Expense.sequelize.col('amount')), 'total_amount']
      ],
      group: ['category']
    });

    res.status(200).json({
      success: true,
      data: {
        totalExpenses: totalExpenses || 0,
        expenseCount,
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

    const expense = await Expense.findByPk(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found'
      });
    }

    await expense.update({
      category: category || expense.category,
      description: description || expense.description,
      amount: amount !== undefined ? amount : expense.amount,
      date: date || expense.date,
      notes: notes !== undefined ? notes : expense.notes
    });

    const updatedRecord = await Expense.findByPk(expense.expense_id, {
      include: [
        { model: User, as: 'recorder', attributes: ['user_id', 'name', 'role'] }
      ]
    });

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
    const expense = await Expense.findByPk(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found'
      });
    }

    await expense.destroy();

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

