const { 
  ProductionRecord, 
  SalesRecord, 
  Expense, 
  PoultryBatch, 
  FeedRecord,
  HealthRecord,
  Inventory 
} = require('../models');
const { Op } = require('sequelize');

/**
 * @desc    Get production report
 * @route   GET /api/reports/production
 * @access  Private
 */
const getProductionReport = async (req, res) => {
  try {
    const { start_date, end_date, batch_id } = req.query;

    const where = {};
    if (batch_id) where.batch_id = batch_id;
    if (start_date && end_date) {
      where.date = { [Op.between]: [start_date, end_date] };
    }

    const totalEggs = await ProductionRecord.sum('eggs_collected', { where });
    const totalMortality = await ProductionRecord.sum('mortality_count', { where });
    const recordCount = await ProductionRecord.count({ where });
    const avgEggsPerDay = recordCount > 0 ? (totalEggs / recordCount).toFixed(2) : 0;

    // Production trend (daily)
    const productionTrend = await ProductionRecord.findAll({
      where,
      attributes: [
        'date',
        [ProductionRecord.sequelize.fn('SUM', ProductionRecord.sequelize.col('eggs_collected')), 'total_eggs'],
        [ProductionRecord.sequelize.fn('SUM', ProductionRecord.sequelize.col('mortality_count')), 'total_mortality']
      ],
      group: ['date'],
      order: [['date', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalEggs: totalEggs || 0,
          totalMortality: totalMortality || 0,
          recordCount,
          avgEggsPerDay
        },
        trend: productionTrend
      }
    });
  } catch (error) {
    console.error('Get production report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating production report',
      error: error.message
    });
  }
};

/**
 * @desc    Get financial report
 * @route   GET /api/reports/financial
 * @access  Private/Admin/Manager
 */
const getFinancialReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const where = {};
    if (start_date && end_date) {
      where.date = { [Op.between]: [start_date, end_date] };
    }

    // Revenue
    const totalRevenue = await SalesRecord.sum('total_amount', { where });
    const salesCount = await SalesRecord.count({ where });

    // Expenses
    const totalExpenses = await Expense.sum('amount', { where });
    const expenseCount = await Expense.count({ where });

    // Profit/Loss
    const profit = (totalRevenue || 0) - (totalExpenses || 0);
    const profitMargin = totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(2) : 0;

    // Revenue by product
    const revenueByProduct = await SalesRecord.findAll({
      where,
      attributes: [
        'product_type',
        [SalesRecord.sequelize.fn('SUM', SalesRecord.sequelize.col('total_amount')), 'revenue']
      ],
      group: ['product_type']
    });

    // Expenses by category
    const expensesByCategory = await Expense.findAll({
      where,
      attributes: [
        'category',
        [Expense.sequelize.fn('SUM', Expense.sequelize.col('amount')), 'amount']
      ],
      group: ['category']
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRevenue: totalRevenue || 0,
          totalExpenses: totalExpenses || 0,
          profit,
          profitMargin: parseFloat(profitMargin),
          salesCount,
          expenseCount
        },
        revenueByProduct,
        expensesByCategory
      }
    });
  } catch (error) {
    console.error('Get financial report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating financial report',
      error: error.message
    });
  }
};

/**
 * @desc    Get performance metrics
 * @route   GET /api/reports/performance
 * @access  Private
 */
const getPerformanceMetrics = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const dateWhere = {};
    if (start_date && end_date) {
      dateWhere.date = { [Op.between]: [start_date, end_date] };
    }

    // Flock statistics
    const totalFlocks = await PoultryBatch.count();
    const activeFlocks = await PoultryBatch.count({ where: { status: 'Active' } });
    const totalBirds = await PoultryBatch.sum('quantity', { where: { status: 'Active' } });

    // Production efficiency
    const totalEggs = await ProductionRecord.sum('eggs_collected', { where: dateWhere });
    const productionDays = await ProductionRecord.count({ where: dateWhere });
    const avgEggsPerDay = productionDays > 0 ? (totalEggs / productionDays).toFixed(2) : 0;

    // Feed efficiency
    const totalFeed = await FeedRecord.sum('quantity', { where: dateWhere });
    const feedToEggRatio = totalEggs > 0 ? (totalFeed / totalEggs).toFixed(2) : 0;

    // Health status
    const healthyBatches = await HealthRecord.count({
      where: { status: 'Healthy' },
      distinct: true,
      col: 'batch_id'
    });

    const underTreatment = await HealthRecord.count({
      where: { status: 'Under Treatment' },
      distinct: true,
      col: 'batch_id'
    });

    // Inventory status
    const lowStockItems = await Inventory.count({
      where: {
        quantity: {
          [Op.lte]: Inventory.sequelize.col('minimum_stock')
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        flockMetrics: {
          totalFlocks,
          activeFlocks,
          totalBirds: totalBirds || 0
        },
        productionMetrics: {
          totalEggs: totalEggs || 0,
          productionDays,
          avgEggsPerDay: parseFloat(avgEggsPerDay)
        },
        feedMetrics: {
          totalFeed: totalFeed || 0,
          feedToEggRatio: parseFloat(feedToEggRatio)
        },
        healthMetrics: {
          healthyBatches,
          underTreatment
        },
        inventoryMetrics: {
          lowStockItems
        }
      }
    });
  } catch (error) {
    console.error('Get performance metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating performance metrics',
      error: error.message
    });
  }
};

/**
 * @desc    Get inventory report
 * @route   GET /api/reports/inventory
 * @access  Private
 */
const getInventoryReport = async (req, res) => {
  try {
    const { item_type } = req.query;

    const where = {};
    if (item_type) where.item_type = item_type;

    const inventoryItems = await Inventory.findAll({ where });

    // Calculate total value
    const totalValue = inventoryItems.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity) * parseFloat(item.unit_price || 0));
    }, 0);

    // Low stock items
    const lowStockItems = inventoryItems.filter(item => 
      parseFloat(item.quantity) <= parseFloat(item.minimum_stock)
    );

    // Group by type
    const inventoryByType = await Inventory.findAll({
      where,
      attributes: [
        'item_type',
        [Inventory.sequelize.fn('COUNT', Inventory.sequelize.col('inventory_id')), 'item_count'],
        [Inventory.sequelize.fn('SUM', Inventory.sequelize.col('quantity')), 'total_quantity']
      ],
      group: ['item_type']
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalItems: inventoryItems.length,
          totalValue: totalValue.toFixed(2),
          lowStockCount: lowStockItems.length
        },
        inventoryByType,
        lowStockItems
      }
    });
  } catch (error) {
    console.error('Get inventory report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating inventory report',
      error: error.message
    });
  }
};

module.exports = {
  getProductionReport,
  getFinancialReport,
  getPerformanceMetrics,
  getInventoryReport
};

