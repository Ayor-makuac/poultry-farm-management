const { FeedRecord, PoultryBatch } = require('../models');
const { mongoose } = require('../config/database');

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
    const batch = await PoultryBatch.findById(batch_id);
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

    const record = await FeedRecord.findById(feedRecord._id)
      .populate('batch_id')
      .populate('recorded_by', 'name role');

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

    const filter = {};
    if (batch_id) filter.batch_id = batch_id;
    if (feed_type) filter.feed_type = { $regex: feed_type, $options: 'i' };
    if (start_date || end_date) {
      filter.date = {};
      if (start_date) filter.date.$gte = new Date(start_date);
      if (end_date) filter.date.$lte = new Date(end_date);
    }

    const feedingRecords = await FeedRecord.find(filter)
      .populate('batch_id')
      .populate('recorded_by', 'name role')
      .sort({ date: -1 });

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
    const feedingRecords = await FeedRecord.find({ batch_id: req.params.batchId })
      .populate('batch_id')
      .populate('recorded_by', 'name role')
      .sort({ date: -1 });

    const [totalFeedAgg] = await FeedRecord.aggregate([
      { $match: { batch_id: new mongoose.Types.ObjectId(req.params.batchId) } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);

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

    const feedRecord = await FeedRecord.findById(req.params.id);

    if (!feedRecord) {
      return res.status(404).json({
        success: false,
        message: 'Feeding record not found'
      });
    }

    feedRecord.feed_type = feed_type || feedRecord.feed_type;
    feedRecord.quantity = quantity ?? feedRecord.quantity;
    feedRecord.unit = unit || feedRecord.unit;
    feedRecord.date = date || feedRecord.date;

    await feedRecord.save();

    const updatedRecord = await FeedRecord.findById(feedRecord._id)
      .populate('batch_id')
      .populate('recorded_by', 'name role');

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
    const feedRecord = await FeedRecord.findById(req.params.id);

    if (!feedRecord) {
      return res.status(404).json({
        success: false,
        message: 'Feeding record not found'
      });
    }

    await feedRecord.deleteOne();

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

