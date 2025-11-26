const { ProductionRecord, PoultryBatch } = require('../models');
const { mongoose } = require('../config/database');

/**
 * @desc    Create production record
 * @route   POST /api/production
 * @access  Private
 */
const createProductionRecord = async (req, res) => {
  try {
    const { batch_id, eggs_collected, mortality_count, date, notes } = req.body;

    // Validation
    if (!batch_id || eggs_collected === undefined || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide batch_id, eggs_collected, and date'
      });
    }

    // Check if batch exists
    const batch = await PoultryBatch.findById(batch_id);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Poultry batch not found'
      });
    }

    // Update batch quantity if there's mortality
    if (mortality_count && mortality_count > 0) {
      const newQuantity = Math.max(0, batch.quantity - Number(mortality_count));
      batch.quantity = newQuantity;
      await batch.save();
    }

    const productionRecord = await ProductionRecord.create({
      batch_id,
      eggs_collected,
      mortality_count: mortality_count || 0,
      date,
      notes,
      recorded_by: req.user.user_id
    });

    const record = await ProductionRecord.findById(productionRecord._id)
      .populate('batch_id')
      .populate('recorded_by', 'name role');

    res.status(201).json({
      success: true,
      message: 'Production record created successfully',
      data: record
    });
  } catch (error) {
    console.error('Create production record error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating production record',
      error: error.message
    });
  }
};

/**
 * @desc    Get all production records
 * @route   GET /api/production
 * @access  Private
 */
const getProductionRecords = async (req, res) => {
  try {
    const { batch_id, start_date, end_date } = req.query;

    const filter = {};
    if (batch_id) filter.batch_id = batch_id;
    if (start_date || end_date) {
      filter.date = {};
      if (start_date) filter.date.$gte = new Date(start_date);
      if (end_date) filter.date.$lte = new Date(end_date);
    }

    const productionRecords = await ProductionRecord.find(filter)
      .populate('batch_id')
      .populate('recorded_by', 'name role')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: productionRecords.length,
      data: productionRecords
    });
  } catch (error) {
    console.error('Get production records error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching production records',
      error: error.message
    });
  }
};

/**
 * @desc    Get production records for specific batch
 * @route   GET /api/production/batch/:batchId
 * @access  Private
 */
const getBatchProductionRecords = async (req, res) => {
  try {
    const productionRecords = await ProductionRecord.find({ batch_id: req.params.batchId })
      .populate('batch_id')
      .populate('recorded_by', 'name role')
      .sort({ date: -1 });

    const match = { batch_id: new mongoose.Types.ObjectId(req.params.batchId) };
    const [totals] = await ProductionRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalEggs: { $sum: '$eggs_collected' },
          totalMortality: { $sum: '$mortality_count' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: productionRecords.length,
      totalEggs: totalEggs || 0,
      totalMortality: totalMortality || 0,
      data: productionRecords
    });
  } catch (error) {
    console.error('Get batch production records error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching batch production records',
      error: error.message
    });
  }
};

/**
 * @desc    Get production statistics
 * @route   GET /api/production/stats/summary
 * @access  Private
 */
const getProductionStats = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const match = {};
    if (start_date || end_date) {
      match.date = {};
      if (start_date) match.date.$gte = new Date(start_date);
      if (end_date) match.date.$lte = new Date(end_date);
    }

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

    const productionByBatch = await ProductionRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$batch_id',
          total_eggs: { $sum: '$eggs_collected' },
          total_mortality: { $sum: '$mortality_count' },
          record_count: { $sum: 1 }
        }
      }
    ]);

    const batchLookup = await PoultryBatch.find({
      _id: { $in: productionByBatch.map(item => item._id) }
    }).select('batch_id breed quantity');

    const batchMap = batchLookup.reduce((acc, batch) => {
      acc[batch._id.toString()] = batch;
      return acc;
    }, {});

    const productionByBatchWithDetails = productionByBatch.map(item => {
      const batchIdString = item._id?.toString();
      return {
        batch_id: batchIdString,
      total_eggs: item.total_eggs,
      total_mortality: item.total_mortality,
      record_count: item.record_count,
        batch: batchMap[batchIdString] || null
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalEggs: summary?.totalEggs || 0,
        totalMortality: summary?.totalMortality || 0,
        recordCount: summary?.recordCount || 0,
        avgEggsPerDay: summary?.recordCount ? Number((summary.totalEggs / summary.recordCount).toFixed(2)) : 0,
        productionByBatch: productionByBatchWithDetails
      }
    });
  } catch (error) {
    console.error('Get production stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching production statistics',
      error: error.message
    });
  }
};

/**
 * @desc    Update production record
 * @route   PUT /api/production/:id
 * @access  Private
 */
const updateProductionRecord = async (req, res) => {
  try {
    const { eggs_collected, mortality_count, date, notes } = req.body;

    const productionRecord = await ProductionRecord.findById(req.params.id);

    if (!productionRecord) {
      return res.status(404).json({
        success: false,
        message: 'Production record not found'
      });
    }

    productionRecord.eggs_collected = eggs_collected ?? productionRecord.eggs_collected;
    productionRecord.mortality_count = mortality_count ?? productionRecord.mortality_count;
    productionRecord.date = date || productionRecord.date;
    productionRecord.notes = notes ?? productionRecord.notes;

    await productionRecord.save();

    const updatedRecord = await ProductionRecord.findById(productionRecord._id)
      .populate('batch_id')
      .populate('recorded_by', 'name role');

    res.status(200).json({
      success: true,
      message: 'Production record updated successfully',
      data: updatedRecord
    });
  } catch (error) {
    console.error('Update production record error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating production record',
      error: error.message
    });
  }
};

/**
 * @desc    Delete production record
 * @route   DELETE /api/production/:id
 * @access  Private/Admin/Manager
 */
const deleteProductionRecord = async (req, res) => {
  try {
    const productionRecord = await ProductionRecord.findById(req.params.id);

    if (!productionRecord) {
      return res.status(404).json({
        success: false,
        message: 'Production record not found'
      });
    }

    await productionRecord.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Production record deleted successfully'
    });
  } catch (error) {
    console.error('Delete production record error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting production record',
      error: error.message
    });
  }
};

module.exports = {
  createProductionRecord,
  getProductionRecords,
  getBatchProductionRecords,
  getProductionStats,
  updateProductionRecord,
  deleteProductionRecord
};

