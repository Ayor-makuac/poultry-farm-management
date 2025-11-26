const { PoultryBatch } = require('../models');

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

    const filter = {};
    if (status) filter.status = status;
    if (breed) filter.breed = { $regex: breed, $options: 'i' };
    if (housing_unit) filter.housing_unit = housing_unit;

    const flocks = await PoultryBatch.find(filter)
      .sort({ created_at: -1 })
      .populate({
        path: 'feedRecords',
        options: { sort: { date: -1 }, limit: 5 }
      })
      .populate({
        path: 'productionRecords',
        options: { sort: { date: -1 }, limit: 5 }
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
    const flock = await PoultryBatch.findById(req.params.id)
      .populate({
        path: 'feedRecords',
        options: { sort: { date: -1 } }
      })
      .populate({
        path: 'productionRecords',
        options: { sort: { date: -1 } }
      })
      .populate({
        path: 'healthRecords',
        options: { sort: { created_at: -1 } },
        populate: { path: 'vet_id', select: 'name role' }
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

    const flock = await PoultryBatch.findById(req.params.id);

    if (!flock) {
      return res.status(404).json({
        success: false,
        message: 'Poultry batch not found'
      });
    }

    flock.breed = breed || flock.breed;
    flock.quantity = quantity ?? flock.quantity;
    flock.age = age ?? flock.age;
    flock.date_acquired = date_acquired || flock.date_acquired;
    flock.housing_unit = housing_unit || flock.housing_unit;
    flock.status = status || flock.status;

    await flock.save();

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
    const flock = await PoultryBatch.findById(req.params.id);

    if (!flock) {
      return res.status(404).json({
        success: false,
        message: 'Poultry batch not found'
      });
    }

    await flock.deleteOne();

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
    const totalFlocks = await PoultryBatch.countDocuments();
    const activeFlocks = await PoultryBatch.countDocuments({ status: 'Active' });

    const [totalBirdsAgg] = await PoultryBatch.aggregate([
      { $match: { status: 'Active' } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);

    const flocksByStatus = await PoultryBatch.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total_birds: { $sum: '$quantity' }
        }
      },
      { $project: { status: '$_id', count: 1, total_birds: 1, _id: 0 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalFlocks,
        activeFlocks,
        totalBirds: totalBirdsAgg?.total || 0,
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

