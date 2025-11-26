const { mongoose } = require('../config/database');
const applyVirtualId = require('./plugins/addVirtualId');

const SalesRecordSchema = new mongoose.Schema(
  {
    product_type: {
      type: String,
      enum: ['Eggs', 'Birds', 'Manure', 'Other'],
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    unit_price: {
      type: Number,
      required: true,
      min: 0
    },
    total_amount: {
      type: Number,
      required: true,
      min: 0
    },
    customer_name: {
      type: String,
      trim: true,
      maxlength: 100
    },
    customer_phone: {
      type: String,
      trim: true,
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

applyVirtualId(SalesRecordSchema, 'sale_id');

module.exports = mongoose.model('SalesRecord', SalesRecordSchema);

