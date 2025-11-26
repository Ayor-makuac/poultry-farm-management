const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FeedRecord = sequelize.define('FeedRecord', {
  feed_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  batch_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'poultry_batches',
      key: 'batch_id'
    }
  },
  feed_type: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  unit: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'kg'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  recorded_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  }
}, {
  tableName: 'feed_records',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = FeedRecord;

