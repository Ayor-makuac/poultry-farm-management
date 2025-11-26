const { mongoose } = require('../config/database');
const applyVirtualId = require('./plugins/addVirtualId');

const ExpenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ['Feed', 'Medicine', 'Labor', 'Equipment', 'Utilities', 'Maintenance', 'Other'],
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255
    },
    amount: {
      type: Number,
      required: true,
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

applyVirtualId(ExpenseSchema, 'expense_id');

module.exports = mongoose.model('Expense', ExpenseSchema);

