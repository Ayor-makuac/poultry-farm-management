const { mongoose } = require('../config/database');
const applyVirtualId = require('./plugins/addVirtualId');

const ProductionRecordSchema = new mongoose.Schema(
  {
    batch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PoultryBatch',
      required: true
    },
    eggs_collected: {
      type: Number,
      required: true,
      min: 0
    },
    mortality_count: {
      type: Number,
      default: 0,
      min: 0
    },
    date: {
      type: Date,
      required: true
    },
    recorded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

applyVirtualId(ProductionRecordSchema, 'production_id');

module.exports = mongoose.model('ProductionRecord', ProductionRecordSchema);

