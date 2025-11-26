const { HealthRecord, PoultryBatch, User } = require('../models');
const { Op } = require('sequelize');

/**
 * @desc    Create health record
 * @route   POST /api/health
 * @access  Private/Veterinarian/Admin/Manager
 */
const createHealthRecord = async (req, res) => {
  try {
    const { batch_id, vaccination_date, vaccine_name, disease, treatment, status, notes } = req.body;

    // Validation
    if (!batch_id) {
      return res.status(400).json({
        success: false,
        message: 'Please provide batch_id'
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

    const healthRecord = await HealthRecord.create({
      batch_id,
      vaccination_date,
      vaccine_name,
      disease,
      treatment,
      vet_id: req.user.user_id,
      status: status || 'Healthy',
      notes
    });

    const record = await HealthRecord.findByPk(healthRecord.health_id, {
      include: [
        { model: PoultryBatch, as: 'batch' },
        { model: User, as: 'veterinarian', attributes: ['user_id', 'name', 'role'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Health record created successfully',
      data: record
    });
  } catch (error) {
    console.error('Create health record error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating health record',
      error: error.message
    });
  }
};

/**
 * @desc    Get all health records
 * @route   GET /api/health
 * @access  Private
 */
const getHealthRecords = async (req, res) => {
  try {
    const { batch_id, status, disease } = req.query;

    // Build filter
    const where = {};
    if (batch_id) where.batch_id = batch_id;
    if (status) where.status = status;
    if (disease) where.disease = { [Op.like]: `%${disease}%` };

    const healthRecords = await HealthRecord.findAll({
      where,
      include: [
        { model: PoultryBatch, as: 'batch' },
        { model: User, as: 'veterinarian', attributes: ['user_id', 'name', 'role'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: healthRecords.length,
      data: healthRecords
    });
  } catch (error) {
    console.error('Get health records error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching health records',
      error: error.message
    });
  }
};

/**
 * @desc    Get health records for specific batch
 * @route   GET /api/health/batch/:batchId
 * @access  Private
 */
const getBatchHealthRecords = async (req, res) => {
  try {
    const healthRecords = await HealthRecord.findAll({
      where: { batch_id: req.params.batchId },
      include: [
        { model: PoultryBatch, as: 'batch' },
        { model: User, as: 'veterinarian', attributes: ['user_id', 'name', 'role'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: healthRecords.length,
      data: healthRecords
    });
  } catch (error) {
    console.error('Get batch health records error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching batch health records',
      error: error.message
    });
  }
};

/**
 * @desc    Update health record
 * @route   PUT /api/health/:id
 * @access  Private/Veterinarian/Admin/Manager
 */
const updateHealthRecord = async (req, res) => {
  try {
    const { vaccination_date, vaccine_name, disease, treatment, status, notes } = req.body;

    const healthRecord = await HealthRecord.findByPk(req.params.id);

    if (!healthRecord) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }

    await healthRecord.update({
      vaccination_date: vaccination_date || healthRecord.vaccination_date,
      vaccine_name: vaccine_name || healthRecord.vaccine_name,
      disease: disease || healthRecord.disease,
      treatment: treatment || healthRecord.treatment,
      status: status || healthRecord.status,
      notes: notes !== undefined ? notes : healthRecord.notes
    });

    const updatedRecord = await HealthRecord.findByPk(healthRecord.health_id, {
      include: [
        { model: PoultryBatch, as: 'batch' },
        { model: User, as: 'veterinarian', attributes: ['user_id', 'name', 'role'] }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Health record updated successfully',
      data: updatedRecord
    });
  } catch (error) {
    console.error('Update health record error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating health record',
      error: error.message
    });
  }
};

/**
 * @desc    Delete health record
 * @route   DELETE /api/health/:id
 * @access  Private/Admin
 */
const deleteHealthRecord = async (req, res) => {
  try {
    const healthRecord = await HealthRecord.findByPk(req.params.id);

    if (!healthRecord) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }

    await healthRecord.destroy();

    res.status(200).json({
      success: true,
      message: 'Health record deleted successfully'
    });
  } catch (error) {
    console.error('Delete health record error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting health record',
      error: error.message
    });
  }
};

/**
 * @desc    Get health alerts (batches under treatment or quarantined)
 * @route   GET /api/health/alerts/active
 * @access  Private
 */
const getHealthAlerts = async (req, res) => {
  try {
    const alerts = await HealthRecord.findAll({
      where: {
        status: {
          [Op.in]: ['Under Treatment', 'Quarantined']
        }
      },
      include: [
        { model: PoultryBatch, as: 'batch' },
        { model: User, as: 'veterinarian', attributes: ['user_id', 'name', 'role'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    console.error('Get health alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching health alerts',
      error: error.message
    });
  }
};

module.exports = {
  createHealthRecord,
  getHealthRecords,
  getBatchHealthRecords,
  updateHealthRecord,
  deleteHealthRecord,
  getHealthAlerts
};

