const { Inventory } = require('../models');

/**
 * @desc    Create inventory item
 * @route   POST /api/inventory
 * @access  Private/Admin/Manager
 */
const createInventoryItem = async (req, res) => {
  try {
    const { item_name, item_type, quantity, unit, minimum_stock, unit_price, supplier } = req.body;

    // Validation
    if (!item_name || !item_type || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide item_name, item_type, and quantity'
      });
    }

    const inventoryItem = await Inventory.create({
      item_name,
      item_type,
      quantity,
      unit: unit || 'kg',
      minimum_stock: minimum_stock || 10,
      unit_price,
      supplier
    });

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: inventoryItem
    });
  } catch (error) {
    console.error('Create inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating inventory item',
      error: error.message
    });
  }
};

/**
 * @desc    Get all inventory items
 * @route   GET /api/inventory
 * @access  Private
 */
const getInventoryItems = async (req, res) => {
  try {
    const { item_type, search } = req.query;

    const filter = {};
    if (item_type) filter.item_type = item_type;
    if (search) filter.item_name = { $regex: search, $options: 'i' };

    const inventoryItems = await Inventory.find(filter).sort({ last_updated: -1 });

    res.status(200).json({
      success: true,
      count: inventoryItems.length,
      data: inventoryItems
    });
  } catch (error) {
    console.error('Get inventory items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory items',
      error: error.message
    });
  }
};

/**
 * @desc    Get single inventory item
 * @route   GET /api/inventory/:id
 * @access  Private
 */
const getInventoryItem = async (req, res) => {
  try {
    const inventoryItem = await Inventory.findById(req.params.id);

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: inventoryItem
    });
  } catch (error) {
    console.error('Get inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory item',
      error: error.message
    });
  }
};

/**
 * @desc    Update inventory item
 * @route   PUT /api/inventory/:id
 * @access  Private/Admin/Manager
 */
const updateInventoryItem = async (req, res) => {
  try {
    const { item_name, item_type, quantity, unit, minimum_stock, unit_price, supplier } = req.body;

    const inventoryItem = await Inventory.findById(req.params.id);

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    inventoryItem.item_name = item_name || inventoryItem.item_name;
    inventoryItem.item_type = item_type || inventoryItem.item_type;
    inventoryItem.quantity = quantity ?? inventoryItem.quantity;
    inventoryItem.unit = unit || inventoryItem.unit;
    inventoryItem.minimum_stock = minimum_stock ?? inventoryItem.minimum_stock;
    inventoryItem.unit_price = unit_price ?? inventoryItem.unit_price;
    inventoryItem.supplier = supplier || inventoryItem.supplier;

    await inventoryItem.save();

    res.status(200).json({
      success: true,
      message: 'Inventory item updated successfully',
      data: inventoryItem
    });
  } catch (error) {
    console.error('Update inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating inventory item',
      error: error.message
    });
  }
};

/**
 * @desc    Delete inventory item
 * @route   DELETE /api/inventory/:id
 * @access  Private/Admin
 */
const deleteInventoryItem = async (req, res) => {
  try {
    const inventoryItem = await Inventory.findById(req.params.id);

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    await inventoryItem.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting inventory item',
      error: error.message
    });
  }
};

/**
 * @desc    Get low stock alerts
 * @route   GET /api/inventory/alerts/low-stock
 * @access  Private
 */
const getLowStockAlerts = async (req, res) => {
  try {
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ['$quantity', '$minimum_stock'] }
    }).sort({ quantity: 1 });

    res.status(200).json({
      success: true,
      count: lowStockItems.length,
      data: lowStockItems
    });
  } catch (error) {
    console.error('Get low stock alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching low stock alerts',
      error: error.message
    });
  }
};

module.exports = {
  createInventoryItem,
  getInventoryItems,
  getInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getLowStockAlerts
};

