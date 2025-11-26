const { SalesRecord, User } = require('../models');
const { Op } = require('sequelize');

/**
 * @desc    Create sales record
 * @route   POST /api/sales
 * @access  Private
 */
const createSalesRecord = async (req, res) => {
  try {
    const { product_type, quantity, unit_price, total_amount, customer_name, customer_phone, date, notes } = req.body;

    // Validation
    if (!product_type || !quantity || !unit_price || !total_amount || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product_type, quantity, unit_price, total_amount, and date'
      });
    }

    const salesRecord = await SalesRecord.create({
      product_type,
      quantity,
      unit_price,
      total_amount,
      customer_name,
      customer_phone,
      date,
      notes,
      recorded_by: req.user.user_id
    });

    const record = await SalesRecord.findByPk(salesRecord.sale_id, {
      include: [
        { model: User, as: 'recorder', attributes: ['user_id', 'name', 'role'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Sales record created successfully',
      data: record
    });
  } catch (error) {
    console.error('Create sales record error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating sales record',
      error: error.message
    });
  }
};

/**
 * @desc    Get all sales records
 * @route   GET /api/sales
 * @access  Private
 */
const getSalesRecords = async (req, res) => {
  try {
    const { product_type, start_date, end_date, customer_name } = req.query;

    // Build filter
    const where = {};
    if (product_type) where.product_type = product_type;
    if (customer_name) where.customer_name = { [Op.like]: `%${customer_name}%` };
    if (start_date && end_date) {
      where.date = { [Op.between]: [start_date, end_date] };
    } else if (start_date) {
      where.date = { [Op.gte]: start_date };
    } else if (end_date) {
      where.date = { [Op.lte]: end_date };
    }

    const salesRecords = await SalesRecord.findAll({
      where,
      include: [
        { model: User, as: 'recorder', attributes: ['user_id', 'name', 'role'] }
      ],
      order: [['date', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: salesRecords.length,
      data: salesRecords
    });
  } catch (error) {
    console.error('Get sales records error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales records',
      error: error.message
    });
  }
};

/**
 * @desc    Get sales statistics
 * @route   GET /api/sales/stats/summary
 * @access  Private
 */
const getSalesStats = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const where = {};
    if (start_date && end_date) {
      where.date = { [Op.between]: [start_date, end_date] };
    }

    const totalRevenue = await SalesRecord.sum('total_amount', { where });
    const totalSales = await SalesRecord.count({ where });

    // Sales by product type
    const salesByProduct = await SalesRecord.findAll({
      where,
      attributes: [
        'product_type',
        [SalesRecord.sequelize.fn('COUNT', SalesRecord.sequelize.col('sale_id')), 'count'],
        [SalesRecord.sequelize.fn('SUM', SalesRecord.sequelize.col('quantity')), 'total_quantity'],
        [SalesRecord.sequelize.fn('SUM', SalesRecord.sequelize.col('total_amount')), 'total_revenue']
      ],
      group: ['product_type']
    });

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: totalRevenue || 0,
        totalSales,
        salesByProduct
      }
    });
  } catch (error) {
    console.error('Get sales stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales statistics',
      error: error.message
    });
  }
};

/**
 * @desc    Update sales record
 * @route   PUT /api/sales/:id
 * @access  Private/Admin/Manager
 */
const updateSalesRecord = async (req, res) => {
  try {
    const { product_type, quantity, unit_price, total_amount, customer_name, customer_phone, date, notes } = req.body;

    const salesRecord = await SalesRecord.findByPk(req.params.id);

    if (!salesRecord) {
      return res.status(404).json({
        success: false,
        message: 'Sales record not found'
      });
    }

    await salesRecord.update({
      product_type: product_type || salesRecord.product_type,
      quantity: quantity !== undefined ? quantity : salesRecord.quantity,
      unit_price: unit_price !== undefined ? unit_price : salesRecord.unit_price,
      total_amount: total_amount !== undefined ? total_amount : salesRecord.total_amount,
      customer_name: customer_name || salesRecord.customer_name,
      customer_phone: customer_phone || salesRecord.customer_phone,
      date: date || salesRecord.date,
      notes: notes !== undefined ? notes : salesRecord.notes
    });

    const updatedRecord = await SalesRecord.findByPk(salesRecord.sale_id, {
      include: [
        { model: User, as: 'recorder', attributes: ['user_id', 'name', 'role'] }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Sales record updated successfully',
      data: updatedRecord
    });
  } catch (error) {
    console.error('Update sales record error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating sales record',
      error: error.message
    });
  }
};

/**
 * @desc    Delete sales record
 * @route   DELETE /api/sales/:id
 * @access  Private/Admin
 */
const deleteSalesRecord = async (req, res) => {
  try {
    const salesRecord = await SalesRecord.findByPk(req.params.id);

    if (!salesRecord) {
      return res.status(404).json({
        success: false,
        message: 'Sales record not found'
      });
    }

    await salesRecord.destroy();

    res.status(200).json({
      success: true,
      message: 'Sales record deleted successfully'
    });
  } catch (error) {
    console.error('Delete sales record error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting sales record',
      error: error.message
    });
  }
};

module.exports = {
  createSalesRecord,
  getSalesRecords,
  getSalesStats,
  updateSalesRecord,
  deleteSalesRecord
};

