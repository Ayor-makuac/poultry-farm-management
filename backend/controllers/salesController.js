const { SalesRecord } = require('../models');

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

    const record = await SalesRecord.findById(salesRecord._id)
      .populate('recorded_by', 'name role');

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

    const filter = {};
    if (product_type) filter.product_type = product_type;
    if (customer_name) filter.customer_name = { $regex: customer_name, $options: 'i' };
    if (start_date || end_date) {
      filter.date = {};
      if (start_date) filter.date.$gte = new Date(start_date);
      if (end_date) filter.date.$lte = new Date(end_date);
    }

    const salesRecords = await SalesRecord.find(filter)
      .populate('recorded_by', 'name role')
      .sort({ date: -1 });

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

    const match = {};
    if (start_date || end_date) {
      match.date = {};
      if (start_date) match.date.$gte = new Date(start_date);
      if (end_date) match.date.$lte = new Date(end_date);
    }

    const [summary] = await SalesRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total_amount' },
          totalSales: { $sum: 1 }
        }
      }
    ]);

    const salesByProduct = await SalesRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$product_type',
          count: { $sum: 1 },
          total_quantity: { $sum: '$quantity' },
          total_revenue: { $sum: '$total_amount' }
        }
      },
      { $project: { product_type: '$_id', count: 1, total_quantity: 1, total_revenue: 1, _id: 0 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: summary?.totalRevenue || 0,
        totalSales: summary?.totalSales || 0,
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

    const salesRecord = await SalesRecord.findById(req.params.id);

    if (!salesRecord) {
      return res.status(404).json({
        success: false,
        message: 'Sales record not found'
      });
    }

    salesRecord.product_type = product_type || salesRecord.product_type;
    salesRecord.quantity = quantity ?? salesRecord.quantity;
    salesRecord.unit_price = unit_price ?? salesRecord.unit_price;
    salesRecord.total_amount = total_amount ?? salesRecord.total_amount;
    salesRecord.customer_name = customer_name || salesRecord.customer_name;
    salesRecord.customer_phone = customer_phone || salesRecord.customer_phone;
    salesRecord.date = date || salesRecord.date;
    salesRecord.notes = notes ?? salesRecord.notes;

    await salesRecord.save();

    const updatedRecord = await SalesRecord.findById(salesRecord._id)
      .populate('recorded_by', 'name role');

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
    const salesRecord = await SalesRecord.findById(req.params.id);

    if (!salesRecord) {
      return res.status(404).json({
        success: false,
        message: 'Sales record not found'
      });
    }

    await salesRecord.deleteOne();

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

