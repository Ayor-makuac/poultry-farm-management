const User = require('./User');
const PoultryBatch = require('./PoultryBatch');
const FeedRecord = require('./FeedRecord');
const ProductionRecord = require('./ProductionRecord');
const HealthRecord = require('./HealthRecord');
const Inventory = require('./Inventory');
const SalesRecord = require('./SalesRecord');
const Expense = require('./Expense');
const Notification = require('./Notification');

// Define relationships

// User relationships
User.hasMany(FeedRecord, { foreignKey: 'recorded_by', as: 'feedRecords' });
User.hasMany(ProductionRecord, { foreignKey: 'recorded_by', as: 'productionRecords' });
User.hasMany(HealthRecord, { foreignKey: 'vet_id', as: 'healthRecords' });
User.hasMany(SalesRecord, { foreignKey: 'recorded_by', as: 'salesRecords' });
User.hasMany(Expense, { foreignKey: 'recorded_by', as: 'expenses' });
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });

// PoultryBatch relationships
PoultryBatch.hasMany(FeedRecord, { foreignKey: 'batch_id', as: 'feedRecords' });
PoultryBatch.hasMany(ProductionRecord, { foreignKey: 'batch_id', as: 'productionRecords' });
PoultryBatch.hasMany(HealthRecord, { foreignKey: 'batch_id', as: 'healthRecords' });

// FeedRecord relationships
FeedRecord.belongsTo(PoultryBatch, { foreignKey: 'batch_id', as: 'batch' });
FeedRecord.belongsTo(User, { foreignKey: 'recorded_by', as: 'recorder' });

// ProductionRecord relationships
ProductionRecord.belongsTo(PoultryBatch, { foreignKey: 'batch_id', as: 'batch' });
ProductionRecord.belongsTo(User, { foreignKey: 'recorded_by', as: 'recorder' });

// HealthRecord relationships
HealthRecord.belongsTo(PoultryBatch, { foreignKey: 'batch_id', as: 'batch' });
HealthRecord.belongsTo(User, { foreignKey: 'vet_id', as: 'veterinarian' });

// SalesRecord relationships
SalesRecord.belongsTo(User, { foreignKey: 'recorded_by', as: 'recorder' });

// Expense relationships
Expense.belongsTo(User, { foreignKey: 'recorded_by', as: 'recorder' });

// Notification relationships
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  User,
  PoultryBatch,
  FeedRecord,
  ProductionRecord,
  HealthRecord,
  Inventory,
  SalesRecord,
  Expense,
  Notification
};

