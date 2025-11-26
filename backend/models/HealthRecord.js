const { mongoose } = require('../config/database');
const applyVirtualId = require('./plugins/addVirtualId');

const HealthRecordSchema = new mongoose.Schema(
  {
    batch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PoultryBatch',
      required: true
    },
    vaccination_date: {
      type: Date
    },
    vaccine_name: {
      type: String,
      trim: true,
      maxlength: 100
    },
    disease: {
      type: String,
      trim: true,
      maxlength: 100
    },
    treatment: {
      type: String,
      trim: true
    },
    vet_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['Healthy', 'Under Treatment', 'Quarantined', 'Recovered'],
      default: 'Healthy',
      required: true
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

applyVirtualId(HealthRecordSchema, 'health_id');

module.exports = mongoose.model('HealthRecord', HealthRecordSchema);

