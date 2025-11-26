const { ProductionRecord, PoultryBatch, User } = require('../models');
const { Op } = require('sequelize');

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
    const batch = await PoultryBatch.findByPk(batch_id);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Poultry batch not found'
      });
    }

    // Update batch quantity if there's mortality
    if (mortality_count && mortality_count > 0) {
      const newQuantity = Math.max(0, batch.quantity - mortality_count);
      await batch.update({ quantity: newQuantity });
    }

    const productionRecord = await ProductionRecord.create({
      batch_id,
      eggs_collected,
      mortality_count: mortality_count || 0,
      date,
      notes,
      recorded_by: req.user.user_id
    });

    const record = await ProductionRecord.findByPk(productionRecord.production_id, {
      include: [
        { model: PoultryBatch, as: 'batch' },
        { model: User, as: 'recorder', attributes: ['user_id', 'name', 'role'] }
      ]
    });

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

    // Build filter
    const where = {};
    if (batch_id) where.batch_id = batch_id;
    if (start_date && end_date) {
      where.date = { [Op.between]: [start_date, end_date] };
    } else if (start_date) {
      where.date = { [Op.gte]: start_date };
    } else if (end_date) {
      where.date = { [Op.lte]: end_date };
    }

    const productionRecords = await ProductionRecord.findAll({
      where,
      include: [
        { model: PoultryBatch, as: 'batch' },
        { model: User, as: 'recorder', attributes: ['user_id', 'name', 'role'] }
      ],
      order: [['date', 'DESC']]
    });

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
    const productionRecords = await ProductionRecord.findAll({
      where: { batch_id: req.params.batchId },
      include: [
        { model: PoultryBatch, as: 'batch' },
        { model: User, as: 'recorder', attributes: ['user_id', 'name', 'role'] }
      ],
      order: [['date', 'DESC']]
    });

    // Calculate totals
    const totalEggs = await ProductionRecord.sum('eggs_collected', {
      where: { batch_id: req.params.batchId }
    });

    const totalMortality = await ProductionRecord.sum('mortality_count', {
      where: { batch_id: req.params.batchId }
    });

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

    const where = {};
    if (start_date && end_date) {
      where.date = { [Op.between]: [start_date, end_date] };
    }

    const totalEggs = await ProductionRecord.sum('eggs_collected', { where });
    const totalMortality = await ProductionRecord.sum('mortality_count', { where });
    const recordCount = await ProductionRecord.count({ where });

    // Average eggs per day
    const avgEggsPerDay = recordCount > 0 ? (totalEggs / recordCount).toFixed(2) : 0;

    // Production by batch
    const productionByBatch = await ProductionRecord.findAll({
      where,
      attributes: [
        'batch_id',
        [ProductionRecord.sequelize.fn('SUM', ProductionRecord.sequelize.col('eggs_collected')), 'total_eggs'],
        [ProductionRecord.sequelize.fn('SUM', ProductionRecord.sequelize.col('mortality_count')), 'total_mortality'],
        [ProductionRecord.sequelize.fn('COUNT', ProductionRecord.sequelize.col('production_id')), 'record_count']
      ],
      include: [
        { model: PoultryBatch, as: 'batch', attributes: ['batch_id', 'breed', 'quantity'] }
      ],
      group: ['batch_id']
    });

    res.status(200).json({
      success: true,
      data: {
        totalEggs: totalEggs || 0,
        totalMortality: totalMortality || 0,
        recordCount,
        avgEggsPerDay,
        productionByBatch
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

    const productionRecord = await ProductionRecord.findByPk(req.params.id);

    if (!productionRecord) {
      return res.status(404).json({
        success: false,
        message: 'Production record not found'
      });
    }

    await productionRecord.update({
      eggs_collected: eggs_collected !== undefined ? eggs_collected : productionRecord.eggs_collected,
      mortality_count: mortality_count !== undefined ? mortality_count : productionRecord.mortality_count,
      date: date || productionRecord.date,
      notes: notes !== undefined ? notes : productionRecord.notes
    });

    const updatedRecord = await ProductionRecord.findByPk(productionRecord.production_id, {
      include: [
        { model: PoultryBatch, as: 'batch' },
        { model: User, as: 'recorder', attributes: ['user_id', 'name', 'role'] }
      ]
    });

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
    const productionRecord = await ProductionRecord.findByPk(req.params.id);

    if (!productionRecord) {
      return res.status(404).json({
        success: false,
        message: 'Production record not found'
      });
    }

    await productionRecord.destroy();

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

