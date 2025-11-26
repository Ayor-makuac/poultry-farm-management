const { mongoose } = require('../config/database');
const applyVirtualId = require('./plugins/addVirtualId');

const InventorySchema = new mongoose.Schema(
  {
    item_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    item_type: {
      type: String,
      enum: ['Feed', 'Medicine', 'Equipment', 'Other'],
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      default: 'kg',
      maxlength: 20,
      required: true
    },
    minimum_stock: {
      type: Number,
      default: 10,
      min: 0
    },
    unit_price: {
      type: Number,
      min: 0
    },
    supplier: {
      type: String,
      trim: true,
      maxlength: 100
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'last_updated' }
  }
);

applyVirtualId(InventorySchema, 'inventory_id');

module.exports = mongoose.model('Inventory', InventorySchema);

