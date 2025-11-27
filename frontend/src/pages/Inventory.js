import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { inventoryService } from '../services';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import './Flocks.css';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    item_name: '',
    item_type: 'Feed',
    quantity: '',
    unit: 'kg',
    minimum_stock: '10',
    unit_price: '',
    supplier: ''
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await inventoryService.getInventory();
      const items = response?.data || response || [];
      setItems(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      toast.error('Failed to fetch inventory');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const updateId = editingItem.inventory_id || editingItem._id;
        const updateIdString = updateId ? (typeof updateId === 'object' ? String(updateId._id || updateId) : String(updateId)) : '';
        if (!updateIdString) {
          toast.error('Unable to identify item to update');
          return;
        }
        await inventoryService.updateInventory(updateIdString, formData);
        toast.success('Inventory item updated successfully');
      } else {
        await inventoryService.createInventory(formData);
        toast.success('Inventory item created successfully');
      }
      fetchItems();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      item_name: item.item_name,
      item_type: item.item_type,
      quantity: item.quantity,
      unit: item.unit,
      minimum_stock: item.minimum_stock,
      unit_price: item.unit_price || '',
      supplier: item.supplier || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await inventoryService.deleteInventory(id);
        toast.success('Item deleted successfully');
        fetchItems();
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      item_name: '',
      item_type: 'Feed',
      quantity: '',
      unit: 'kg',
      minimum_stock: '10',
      unit_price: '',
      supplier: ''
    });
  };

  const isLowStock = (item) => {
    return parseFloat(item.quantity) <= parseFloat(item.minimum_stock);
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading inventory...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flocks-page">
        <div className="page-header">
          <h1>Inventory Management</h1>
          <Button onClick={() => setShowModal(true)} variant="primary">
            + Add Item
          </Button>
        </div>

        <div className="flocks-grid">
          {items.map((item) => {
            // Ensure key is always a string
            const itemKey = item.inventory_id || item._id;
            const itemKeyString = itemKey ? (typeof itemKey === 'object' ? String(itemKey._id || itemKey) : String(itemKey)) : Math.random().toString();
            
            return (
            <Card key={itemKeyString} className={`flock-card ${isLowStock(item) ? 'low-stock' : ''}`}>
              <div className="flock-header">
                <h3>{item.item_name}</h3>
                <span className={`status-badge ${isLowStock(item) ? 'status-danger' : 'status-active'}`}>
                  {item.item_type}
                </span>
              </div>
              <div className="flock-details">
                <div className="detail-row">
                  <span className="label">Quantity:</span>
                  <span className="value">{item.quantity} {item.unit}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Min Stock:</span>
                  <span className="value">{item.minimum_stock} {item.unit}</span>
                </div>
                {item.unit_price && (
                  <div className="detail-row">
                    <span className="label">Unit Price:</span>
                    <span className="value">KES {item.unit_price}</span>
                  </div>
                )}
                {item.supplier && (
                  <div className="detail-row">
                    <span className="label">Supplier:</span>
                    <span className="value">{item.supplier}</span>
                  </div>
                )}
                {isLowStock(item) && (
                  <div className="detail-row">
                    <span className="label" style={{color: '#dc3545', fontWeight: 'bold'}}>⚠️ Low Stock!</span>
                  </div>
                )}
              </div>
              <div className="flock-actions">
                <Button onClick={() => handleEdit(item)} variant="info" size="small">
                  Edit
                </Button>
                <Button onClick={() => {
                  const deleteId = item.inventory_id || item._id;
                  const deleteIdString = deleteId ? (typeof deleteId === 'object' ? String(deleteId._id || deleteId) : String(deleteId)) : '';
                  if (deleteIdString) handleDelete(deleteIdString);
                }} variant="danger" size="small">
                  Delete
                </Button>
              </div>
            </Card>
            );
          })}
        </div>

        {items.length === 0 && (
          <div className="empty-state">
            <p>No inventory items found. Add your first item!</p>
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={closeModal}
          title={editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
        >
          <form onSubmit={handleSubmit} className="modal-form">
            <Input
              label="Item Name"
              name="item_name"
              value={formData.item_name}
              onChange={handleInputChange}
              placeholder="e.g., Layer Mash, Medicine X"
              required
            />
            <div className="input-group">
              <label>Item Type *</label>
              <select
                name="item_type"
                value={formData.item_type}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="Feed">Feed</option>
                <option value="Medicine">Medicine</option>
                <option value="Equipment">Equipment</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <Input
              label="Quantity"
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              placeholder="Current stock"
              min="0"
              step="0.01"
              required
            />
            <div className="input-group">
              <label>Unit *</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="bags">bags</option>
                <option value="liters">liters</option>
                <option value="pieces">pieces</option>
              </select>
            </div>
            <Input
              label="Minimum Stock"
              type="number"
              name="minimum_stock"
              value={formData.minimum_stock}
              onChange={handleInputChange}
              placeholder="Alert threshold"
              min="0"
              step="0.01"
              required
            />
            <Input
              label="Unit Price (KES)"
              type="number"
              name="unit_price"
              value={formData.unit_price}
              onChange={handleInputChange}
              placeholder="Price per unit"
              min="0"
              step="0.01"
            />
            <Input
              label="Supplier"
              name="supplier"
              value={formData.supplier}
              onChange={handleInputChange}
              placeholder="Supplier name"
            />
            <div className="modal-actions">
              <Button type="button" onClick={closeModal} variant="secondary">
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingItem ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default Inventory;

