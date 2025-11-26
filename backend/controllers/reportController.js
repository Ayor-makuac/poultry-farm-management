const {
  ProductionRecord,
  SalesRecord,
  Expense,
  PoultryBatch,
  FeedRecord,
  HealthRecord,
  Inventory
} = require('../models');
const { mongoose } = require('../config/database');

const buildDateMatch = (start, end) => {
  if (!start && !end) return {};
  const match = {};
  if (start) match.$gte = new Date(start);
  if (end) match.$lte = new Date(end);
  return match;
};

const toObjectId = (value) => {
  if (!value || !mongoose.Types.ObjectId.isValid(value)) return null;
  return new mongoose.Types.ObjectId(value);
};

/**
 * @desc    Get production report
 * @route   GET /api/reports/production
 * @access  Private
 */
const getProductionReport = async (req, res) => {
  try {
    const { start_date, end_date, batch_id } = req.query;
    const match = {};

    const batchObjectId = toObjectId(batch_id);
    if (batchObjectId) match.batch_id = batchObjectId;

    const dateMatch = buildDateMatch(start_date, end_date);
    if (Object.keys(dateMatch).length) match.date = dateMatch;

    const [summary] = await ProductionRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalEggs: { $sum: '$eggs_collected' },
          totalMortality: { $sum: '$mortality_count' },
          recordCount: { $sum: 1 }
        }
      }
    ]);

    const trend = await ProductionRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$date',
          total_eggs: { $sum: '$eggs_collected' },
          total_mortality: { $sum: '$mortality_count' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalEggs: summary?.totalEggs || 0,
          totalMortality: summary?.totalMortality || 0,
          recordCount: summary?.recordCount || 0,
          avgEggsPerDay: summary?.recordCount
            ? Number((summary.totalEggs / summary.recordCount).toFixed(2))
            : 0
        },
        trend: trend.map(item => ({
          date: item._id,
          total_eggs: item.total_eggs,
          total_mortality: item.total_mortality
        }))
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
    const match = {};
    const dateMatch = buildDateMatch(start_date, end_date);
    if (Object.keys(dateMatch).length) match.date = dateMatch;

    const [salesSummary] = await SalesRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total_amount' },
          salesCount: { $sum: 1 }
        }
      }
    ]);

    const [expenseSummary] = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: '$amount' },
          expenseCount: { $sum: 1 }
        }
      }
    ]);

    const revenueByProduct = await SalesRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$product_type',
          revenue: { $sum: '$total_amount' }
        }
      },
      { $project: { product_type: '$_id', revenue: 1, _id: 0 } }
    ]);

    const expensesByCategory = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$category',
          amount: { $sum: '$amount' }
        }
      },
      { $project: { category: '$_id', amount: 1, _id: 0 } }
    ]);

    const totalRevenue = salesSummary?.totalRevenue || 0;
    const totalExpenses = expenseSummary?.totalExpenses || 0;
    const profit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? Number(((profit / totalRevenue) * 100).toFixed(2)) : 0;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalExpenses,
          profit,
          profitMargin,
          salesCount: salesSummary?.salesCount || 0,
          expenseCount: expenseSummary?.expenseCount || 0
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
    const dateMatch = buildDateMatch(start_date, end_date);
    const match = {};
    if (Object.keys(dateMatch).length) match.date = dateMatch;

    const totalFlocks = await PoultryBatch.countDocuments();
    const activeFlocks = await PoultryBatch.countDocuments({ status: 'Active' });

    const [totalBirdsAgg] = await PoultryBatch.aggregate([
      { $match: { status: 'Active' } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);

    const [productionSummary] = await ProductionRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalEggs: { $sum: '$eggs_collected' },
          productionDays: { $sum: 1 }
        }
      }
    ]);

    const [feedSummary] = await FeedRecord.aggregate([
      { $match: match },
      { $group: { _id: null, totalFeed: { $sum: '$quantity' } } }
    ]);

    const healthyBatches = await HealthRecord.distinct('batch_id', { status: 'Healthy' });
    const underTreatment = await HealthRecord.distinct('batch_id', { status: 'Under Treatment' });

    const lowStockItems = await Inventory.countDocuments({
      $expr: { $lte: ['$quantity', '$minimum_stock'] }
    });

    const totalEggs = productionSummary?.totalEggs || 0;
    const productionDays = productionSummary?.productionDays || 0;
    const totalFeed = feedSummary?.totalFeed || 0;

    res.status(200).json({
      success: true,
      data: {
        flockMetrics: {
          totalFlocks,
          activeFlocks,
          totalBirds: totalBirdsAgg?.total || 0
        },
        productionMetrics: {
          totalEggs,
          productionDays,
          avgEggsPerDay: productionDays ? Number((totalEggs / productionDays).toFixed(2)) : 0
        },
        feedMetrics: {
          totalFeed,
          feedToEggRatio: totalEggs ? Number((totalFeed / totalEggs).toFixed(2)) : 0
        },
        healthMetrics: {
          healthyBatches: healthyBatches.length,
          underTreatment: underTreatment.length
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
    const filter = {};
    if (item_type) filter.item_type = item_type;

    const inventoryItems = await Inventory.find(filter);

    const totalValue = inventoryItems.reduce((sum, item) => {
      const unitPrice = Number(item.unit_price || 0);
      return sum + item.quantity * unitPrice;
    }, 0);

    const lowStockItems = inventoryItems.filter(item => item.quantity <= item.minimum_stock);

    const inventoryByType = await Inventory.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$item_type',
          item_count: { $sum: 1 },
          total_quantity: { $sum: '$quantity' }
        }
      },
      { $project: { item_type: '$_id', item_count: 1, total_quantity: 1, _id: 0 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalItems: inventoryItems.length,
          totalValue: Number(totalValue.toFixed(2)),
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

