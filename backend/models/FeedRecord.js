const { mongoose } = require('../config/database');
const applyVirtualId = require('./plugins/addVirtualId');

const FeedRecordSchema = new mongoose.Schema(
  {
    batch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PoultryBatch',
      required: true
    },
    feed_type: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      default: 'kg',
      required: true,
      maxlength: 20
    },
    date: {
      type: Date,
      required: true
    },
    recorded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

applyVirtualId(FeedRecordSchema, 'feed_id');

module.exports = mongoose.model('FeedRecord', FeedRecordSchema);

