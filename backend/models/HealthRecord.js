const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HealthRecord = sequelize.define('HealthRecord', {
  health_id: {
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
  vaccination_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  vaccine_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  disease: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  treatment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  vet_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  status: {
    type: DataTypes.ENUM('Healthy', 'Under Treatment', 'Quarantined', 'Recovered'),
    allowNull: false,
    defaultValue: 'Healthy'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'health_records',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = HealthRecord;

