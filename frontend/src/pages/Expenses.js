import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { expenseService } from '../services';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import './Flocks.css';

const Expenses = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    category: 'Feed',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await expenseService.getExpenses();
      setRecords(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch expenses');
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
      if (editingRecord) {
        await expenseService.updateExpense(editingRecord.expense_id, formData);
        toast.success('Expense record updated successfully');
      } else {
        await expenseService.createExpense(formData);
        toast.success('Expense record created successfully');
      }
      fetchExpenses();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      category: record.category || 'Feed',
      description: record.description,
      amount: record.amount,
      date: record.date ? new Date(record.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: record.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await expenseService.deleteExpense(id);
        toast.success('Record deleted successfully');
        fetchExpenses();
      } catch (error) {
        toast.error('Failed to delete record');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRecord(null);
    setFormData({
      category: 'Feed',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading expenses...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flocks-page">
        <div className="page-header">
          <h1>Expense Management</h1>
          <Button onClick={() => setShowModal(true)} variant="primary">
            + Record Expense
          </Button>
        </div>

        <div className="flocks-grid">
          {records.map((record) => (
            <Card key={record.expense_id} className="flock-card">
              <div className="flock-header">
                <h3>{record.category}</h3>
                <span className="status-badge status-active">
                  {new Date(record.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flock-details">
                <div className="detail-row">
                  <span className="label">Description:</span>
                  <span className="value">{record.description}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Amount:</span>
                  <span className="value stat-danger">KES {record.amount}</span>
                </div>
                {record.notes && (
                  <div className="detail-row">
                    <span className="label">Notes:</span>
                    <span className="value">{record.notes}</span>
                  </div>
                )}
              </div>
              <div className="flock-actions">
                <Button onClick={() => handleEdit(record)} variant="info" size="small">
                  Edit
                </Button>
                <Button onClick={() => handleDelete(record.expense_id)} variant="danger" size="small">
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {records.length === 0 && (
          <div className="empty-state">
            <p>No expense records found. Add your first expense!</p>
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={closeModal}
          title={editingRecord ? 'Edit Expense Record' : 'Record Expense'}
        >
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="input-group">
              <label>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="Feed">Feed</option>
                <option value="Medicine">Medicine</option>
                <option value="Labor">Labor</option>
                <option value="Equipment">Equipment</option>
                <option value="Utilities">Utilities</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <Input
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Expense description"
              required
            />
            <Input
              label="Amount (KES)"
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="Amount spent"
              min="0"
              step="0.01"
              required
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

export default Expenses;

