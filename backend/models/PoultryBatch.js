const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PoultryBatch = sequelize.define('PoultryBatch', {
  batch_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  breed: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Age in weeks'
  },
  date_acquired: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  housing_unit: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Active', 'Sold', 'Deceased', 'Inactive'),
    allowNull: false,
    defaultValue: 'Active'
  }
}, {
  tableName: 'poultry_batches',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = PoultryBatch;

