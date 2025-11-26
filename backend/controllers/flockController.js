const { PoultryBatch, FeedRecord, ProductionRecord, HealthRecord } = require('../models');
const { Op } = require('sequelize');

/**
 * @desc    Create new poultry batch
 * @route   POST /api/flocks
 * @access  Private/Admin/Manager
 */
const createFlock = async (req, res) => {
  try {
    const { breed, quantity, age, date_acquired, housing_unit, status } = req.body;

    // Validation
    if (!breed || !quantity || age === undefined || !date_acquired) {
      return res.status(400).json({
        success: false,
        message: 'Please provide breed, quantity, age, and date_acquired'
      });
    }

    const flock = await PoultryBatch.create({
      breed,
      quantity,
      age,
      date_acquired,
      housing_unit,
      status: status || 'Active'
    });

    res.status(201).json({
      success: true,
      message: 'Poultry batch created successfully',
      data: flock
    });
  } catch (error) {
    console.error('Create flock error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating poultry batch',
      error: error.message
    });
  }
};

/**
 * @desc    Get all poultry batches
 * @route   GET /api/flocks
 * @access  Private
 */
const getFlocks = async (req, res) => {
  try {
    const { status, breed, housing_unit } = req.query;

    // Build filter
    const where = {};
    if (status) where.status = status;
    if (breed) where.breed = { [Op.like]: `%${breed}%` };
    if (housing_unit) where.housing_unit = housing_unit;

    const flocks = await PoultryBatch.findAll({
      where,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: FeedRecord,
          as: 'feedRecords',
          limit: 5,
          order: [['date', 'DESC']]
        },
        {
          model: ProductionRecord,
          as: 'productionRecords',
          limit: 5,
          order: [['date', 'DESC']]
        }
      ]
    });

    res.status(200).json({
      success: true,
      count: flocks.length,
      data: flocks
    });
  } catch (error) {
    console.error('Get flocks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching poultry batches',
      error: error.message
    });
  }
};

/**
 * @desc    Get single poultry batch
 * @route   GET /api/flocks/:id
 * @access  Private
 */
const getFlock = async (req, res) => {
  try {
    const flock = await PoultryBatch.findByPk(req.params.id, {
      include: [
        {
          model: FeedRecord,
          as: 'feedRecords',
          order: [['date', 'DESC']]
        },
        {
          model: ProductionRecord,
          as: 'productionRecords',
          order: [['date', 'DESC']]
        },
        {
          model: HealthRecord,
          as: 'healthRecords',
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!flock) {
      return res.status(404).json({
        success: false,
        message: 'Poultry batch not found'
      });
    }

    res.status(200).json({
      success: true,
      data: flock
    });
  } catch (error) {
    console.error('Get flock error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching poultry batch',
      error: error.message
    });
  }
};

/**
 * @desc    Update poultry batch
 * @route   PUT /api/flocks/:id
 * @access  Private/Admin/Manager
 */
const updateFlock = async (req, res) => {
  try {
    const { breed, quantity, age, date_acquired, housing_unit, status } = req.body;

    const flock = await PoultryBatch.findByPk(req.params.id);

    if (!flock) {
      return res.status(404).json({
        success: false,
        message: 'Poultry batch not found'
      });
    }

    await flock.update({
      breed: breed || flock.breed,
      quantity: quantity !== undefined ? quantity : flock.quantity,
      age: age !== undefined ? age : flock.age,
      date_acquired: date_acquired || flock.date_acquired,
      housing_unit: housing_unit || flock.housing_unit,
      status: status || flock.status
    });

    res.status(200).json({
      success: true,
      message: 'Poultry batch updated successfully',
      data: flock
    });
  } catch (error) {
    console.error('Update flock error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating poultry batch',
      error: error.message
    });
  }
};

/**
 * @desc    Delete poultry batch
 * @route   DELETE /api/flocks/:id
 * @access  Private/Admin
 */
const deleteFlock = async (req, res) => {
  try {
    const flock = await PoultryBatch.findByPk(req.params.id);

    if (!flock) {
      return res.status(404).json({
        success: false,
        message: 'Poultry batch not found'
      });
    }

    await flock.destroy();

    res.status(200).json({
      success: true,
      message: 'Poultry batch deleted successfully'
    });
  } catch (error) {
    console.error('Delete flock error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting poultry batch',
      error: error.message
    });
  }
};

/**
 * @desc    Get flock statistics
 * @route   GET /api/flocks/stats/summary
 * @access  Private
 */
const getFlockStats = async (req, res) => {
  try {
    const totalFlocks = await PoultryBatch.count();
    const activeFlocks = await PoultryBatch.count({ where: { status: 'Active' } });
    
    const totalBirds = await PoultryBatch.sum('quantity', {
      where: { status: 'Active' }
    });

    const flocksByStatus = await PoultryBatch.findAll({
      attributes: [
        'status',
        [PoultryBatch.sequelize.fn('COUNT', PoultryBatch.sequelize.col('batch_id')), 'count'],
        [PoultryBatch.sequelize.fn('SUM', PoultryBatch.sequelize.col('quantity')), 'total_birds']
      ],
      group: ['status']
    });

    res.status(200).json({
      success: true,
      data: {
        totalFlocks,
        activeFlocks,
        totalBirds: totalBirds || 0,
        flocksByStatus
      }
    });
  } catch (error) {
    console.error('Get flock stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching flock statistics',
      error: error.message
    });
  }
};

module.exports = {
  createFlock,
  getFlocks,
  getFlock,
  updateFlock,
  deleteFlock,
  getFlockStats
};

