const { mongoose } = require('../config/database');
const applyVirtualId = require('./plugins/addVirtualId');

const PoultryBatchSchema = new mongoose.Schema(
  {
    breed: {
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
    age: {
      type: Number,
      required: true,
      min: 0,
      comment: 'Age in weeks'
    },
    date_acquired: {
      type: Date,
      required: true
    },
    housing_unit: {
      type: String,
      trim: true,
      maxlength: 50
    },
    status: {
      type: String,
      enum: ['Active', 'Sold', 'Deceased', 'Inactive'],
      default: 'Active',
      required: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

applyVirtualId(PoultryBatchSchema, 'batch_id');

PoultryBatchSchema.virtual('feedRecords', {
  ref: 'FeedRecord',
  localField: '_id',
  foreignField: 'batch_id',
  justOne: false
});

PoultryBatchSchema.virtual('productionRecords', {
  ref: 'ProductionRecord',
  localField: '_id',
  foreignField: 'batch_id',
  justOne: false
});

PoultryBatchSchema.virtual('healthRecords', {
  ref: 'HealthRecord',
  localField: '_id',
  foreignField: 'batch_id',
  justOne: false
});

module.exports = mongoose.model('PoultryBatch', PoultryBatchSchema);

