const { FeedRecord, PoultryBatch, User } = require('../models');
const { Op } = require('sequelize');

/**
 * @desc    Create feeding record
 * @route   POST /api/feeding
 * @access  Private
 */
const createFeedingRecord = async (req, res) => {
  try {
    const { batch_id, feed_type, quantity, unit, date } = req.body;

    // Validation
    if (!batch_id || !feed_type || !quantity || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide batch_id, feed_type, quantity, and date'
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

    const feedRecord = await FeedRecord.create({
      batch_id,
      feed_type,
      quantity,
      unit: unit || 'kg',
      date,
      recorded_by: req.user.user_id
    });

    const record = await FeedRecord.findByPk(feedRecord.feed_id, {
      include: [
        { model: PoultryBatch, as: 'batch' },
        { model: User, as: 'recorder', attributes: ['user_id', 'name', 'role'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Feeding record created successfully',
      data: record
    });
  } catch (error) {
    console.error('Create feeding record error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating feeding record',
      error: error.message
    });
  }
};

/**
 * @desc    Get all feeding records
 * @route   GET /api/feeding
 * @access  Private
 */
const getFeedingRecords = async (req, res) => {
  try {
    const { batch_id, feed_type, start_date, end_date } = req.query;

    // Build filter
    const where = {};
    if (batch_id) where.batch_id = batch_id;
    if (feed_type) where.feed_type = { [Op.like]: `%${feed_type}%` };
    if (start_date && end_date) {
      where.date = { [Op.between]: [start_date, end_date] };
    } else if (start_date) {
      where.date = { [Op.gte]: start_date };
    } else if (end_date) {
      where.date = { [Op.lte]: end_date };
    }

    const feedingRecords = await FeedRecord.findAll({
      where,
      include: [
        { model: PoultryBatch, as: 'batch' },
        { model: User, as: 'recorder', attributes: ['user_id', 'name', 'role'] }
      ],
      order: [['date', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: feedingRecords.length,
      data: feedingRecords
    });
  } catch (error) {
    console.error('Get feeding records error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feeding records',
      error: error.message
    });
  }
};

/**
 * @desc    Get feeding records for specific batch
 * @route   GET /api/feeding/batch/:batchId
 * @access  Private
 */
const getBatchFeedingRecords = async (req, res) => {
  try {
    const feedingRecords = await FeedRecord.findAll({
      where: { batch_id: req.params.batchId },
      include: [
        { model: PoultryBatch, as: 'batch' },
        { model: User, as: 'recorder', attributes: ['user_id', 'name', 'role'] }
      ],
      order: [['date', 'DESC']]
    });

    // Calculate total feed consumed
    const totalFeed = await FeedRecord.sum('quantity', {
      where: { batch_id: req.params.batchId }
    });

    res.status(200).json({
      success: true,
      count: feedingRecords.length,
      totalFeed: totalFeed || 0,
      data: feedingRecords
    });
  } catch (error) {
    console.error('Get batch feeding records error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching batch feeding records',
      error: error.message
    });
  }
};

/**
 * @desc    Update feeding record
 * @route   PUT /api/feeding/:id
 * @access  Private
 */
const updateFeedingRecord = async (req, res) => {
  try {
    const { feed_type, quantity, unit, date } = req.body;

    const feedRecord = await FeedRecord.findByPk(req.params.id);

    if (!feedRecord) {
      return res.status(404).json({
        success: false,
        message: 'Feeding record not found'
      });
    }

    await feedRecord.update({
      feed_type: feed_type || feedRecord.feed_type,
      quantity: quantity !== undefined ? quantity : feedRecord.quantity,
      unit: unit || feedRecord.unit,
      date: date || feedRecord.date
    });

    const updatedRecord = await FeedRecord.findByPk(feedRecord.feed_id, {
      include: [
        { model: PoultryBatch, as: 'batch' },
        { model: User, as: 'recorder', attributes: ['user_id', 'name', 'role'] }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Feeding record updated successfully',
      data: updatedRecord
    });
  } catch (error) {
    console.error('Update feeding record error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating feeding record',
      error: error.message
    });
  }
};

/**
 * @desc    Delete feeding record
 * @route   DELETE /api/feeding/:id
 * @access  Private/Admin/Manager
 */
const deleteFeedingRecord = async (req, res) => {
  try {
    const feedRecord = await FeedRecord.findByPk(req.params.id);

    if (!feedRecord) {
      return res.status(404).json({
        success: false,
        message: 'Feeding record not found'
      });
    }

    await feedRecord.destroy();

    res.status(200).json({
      success: true,
      message: 'Feeding record deleted successfully'
    });
  } catch (error) {
    console.error('Delete feeding record error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting feeding record',
      error: error.message
    });
  }
};

module.exports = {
  createFeedingRecord,
  getFeedingRecords,
  getBatchFeedingRecords,
  updateFeedingRecord,
  deleteFeedingRecord
};

