const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Inventory = sequelize.define('Inventory', {
  inventory_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  item_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  item_type: {
    type: DataTypes.ENUM('Feed', 'Medicine', 'Equipment', 'Other'),
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
  minimum_stock: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 10
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  supplier: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'inventory',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'last_updated'
});

module.exports = Inventory;

