import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { salesService } from '../services';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import './Flocks.css';

const Sales = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    product_type: 'Eggs',
    quantity: '',
    unit_price: '',
    total_amount: '',
    customer_name: '',
    customer_phone: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await salesService.getSales();
      const records = response?.data || response || [];
      setRecords(Array.isArray(records) ? records : []);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      toast.error('Failed to fetch sales');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Auto-calculate total if quantity and unit_price are provided
      if (name === 'quantity' || name === 'unit_price') {
        const qty = name === 'quantity' ? parseFloat(value) : parseFloat(prev.quantity);
        const price = name === 'unit_price' ? parseFloat(value) : parseFloat(prev.unit_price);
        if (qty && price) {
          updated.total_amount = (qty * price).toFixed(2);
        }
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        const updateId = editingRecord.sale_id || editingRecord._id;
        const updateIdString = updateId ? (typeof updateId === 'object' ? String(updateId._id || updateId) : String(updateId)) : '';
        if (!updateIdString) {
          toast.error('Unable to identify record to update');
          return;
        }
        await salesService.updateSale(updateIdString, formData);
        toast.success('Sales record updated successfully');
      } else {
        await salesService.createSale(formData);
        toast.success('Sales record created successfully');
      }
      fetchSales();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      product_type: record.product_type || 'Eggs',
      quantity: record.quantity,
      unit_price: record.unit_price,
      total_amount: record.total_amount,
      customer_name: record.customer_name || '',
      customer_phone: record.customer_phone || '',
      date: record.date ? new Date(record.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: record.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await salesService.deleteSale(id);
        toast.success('Record deleted successfully');
        fetchSales();
      } catch (error) {
        toast.error('Failed to delete record');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRecord(null);
    setFormData({
      product_type: 'Eggs',
      quantity: '',
      unit_price: '',
      total_amount: '',
      customer_name: '',
      customer_phone: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading sales records...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flocks-page">
        <div className="page-header">
          <h1>Sales Management</h1>
          <Button onClick={() => setShowModal(true)} variant="primary">
            + Record Sale
          </Button>
        </div>

        <div className="flocks-grid">
          {records.map((record) => {
            // Ensure key is always a string
            const recordKey = record.sale_id || record._id;
            const recordKeyString = recordKey ? (typeof recordKey === 'object' ? String(recordKey._id || recordKey) : String(recordKey)) : Math.random().toString();
            
            return (
            <Card key={recordKeyString} className="flock-card">
              <div className="flock-header">
                <h3>{record.product_type}</h3>
                <span className="status-badge status-active">
                  {new Date(record.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flock-details">
                <div className="detail-row">
                  <span className="label">Quantity:</span>
                  <span className="value">{record.quantity}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Unit Price:</span>
                  <span className="value">KES {record.unit_price}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Total:</span>
                  <span className="value stat-success">KES {record.total_amount}</span>
                </div>
                {record.customer_name && (
                  <div className="detail-row">
                    <span className="label">Customer:</span>
                    <span className="value">{record.customer_name}</span>
                  </div>
                )}
              </div>
              <div className="flock-actions">
                <Button onClick={() => handleEdit(record)} variant="info" size="small">
                  Edit
                </Button>
                <Button onClick={() => {
                  const deleteId = record.sale_id || record._id;
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

        {records.length === 0 && (
          <div className="empty-state">
            <p>No sales records found. Add your first sale!</p>
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={closeModal}
          title={editingRecord ? 'Edit Sale Record' : 'Record Sale'}
        >
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="input-group">
              <label>Product Type *</label>
              <select
                name="product_type"
                value={formData.product_type}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="Eggs">Eggs</option>
                <option value="Birds">Birds</option>
                <option value="Manure">Manure</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <Input
              label="Quantity"
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              placeholder="Quantity sold"
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
              required
            />
            <Input
              label="Total Amount (KES)"
              type="number"
              name="total_amount"
              value={formData.total_amount}
              onChange={handleInputChange}
              placeholder="Auto-calculated"
              min="0"
              step="0.01"
              required
              disabled
            />
            <Input
              label="Customer Name"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleInputChange}
              placeholder="Customer name"
            />
            <Input
              label="Customer Phone"
              type="tel"
              name="customer_phone"
              value={formData.customer_phone}
              onChange={handleInputChange}
              placeholder="+254700000000"
            />
            <Input
              label="Date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
            <div className="input-group">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="input-field"
                rows="3"
                placeholder="Optional notes..."
              />
            </div>
            <div className="modal-actions">
              <Button type="button" onClick={closeModal} variant="secondary">
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingRecord ? 'Update' : 'Record'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default Sales;

