import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { feedingService, flockService } from '../services';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import './Flocks.css';

const Feeding = () => {
  const [records, setRecords] = useState([]);
  const [flocks, setFlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    batch_id: '',
    feed_type: '',
    quantity: '',
    unit: 'kg',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [feedingRes, flocksRes] = await Promise.all([
        feedingService.getFeeding(),
        flockService.getFlocks()
      ]);
      // Handle response structure: feedingRes is { success, data } from service
      const records = feedingRes?.data || feedingRes || [];
      setRecords(Array.isArray(records) ? records : []);
      const flocks = flocksRes?.data || flocksRes || [];
      setFlocks(Array.isArray(flocks) ? flocks : []);
    } catch (error) {
      console.error('Error fetching feeding data:', error);
      toast.error('Failed to fetch data');
      setRecords([]);
      setFlocks([]);
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
        const updateId = editingRecord.feed_id || editingRecord._id;
        const updateIdString = updateId ? (typeof updateId === 'object' ? String(updateId._id || updateId) : String(updateId)) : '';
        if (!updateIdString) {
          toast.error('Unable to identify record to update');
          return;
        }
        await feedingService.updateFeeding(updateIdString, formData);
        toast.success('Feeding record updated successfully');
      } else {
        await feedingService.createFeeding(formData);
        toast.success('Feeding record created successfully');
      }
      fetchData();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    // Handle populated batch_id (could be object or string)
    let batchId = '';
    if (record.batch_id) {
      if (typeof record.batch_id === 'object' && record.batch_id !== null) {
        batchId = String(record.batch_id._id || record.batch_id.batch_id || '');
      } else {
        batchId = String(record.batch_id);
      }
    }
    
    setFormData({
      batch_id: batchId,
      feed_type: record.feed_type || '',
      quantity: record.quantity || '',
      unit: record.unit || 'kg',
      date: record.date ? new Date(record.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await feedingService.deleteFeeding(id);
        toast.success('Record deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete record');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRecord(null);
    setFormData({
      batch_id: '',
      feed_type: '',
      quantity: '',
      unit: 'kg',
      date: new Date().toISOString().split('T')[0]
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading feeding records...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flocks-page">
        <div className="page-header">
          <h1>Feeding Management</h1>
          <Button onClick={() => setShowModal(true)} variant="primary">
            + Record Feeding
          </Button>
        </div>

        <div className="flocks-grid">
          {records.map((record) => {
            // Handle populated batch_id (could be object or string)
            let batchDisplay = 'N/A';
            if (typeof record.batch_id === 'object' && record.batch_id !== null) {
              batchDisplay = record.batch_id.batch_id || record.batch_id._id || 'N/A';
            } else if (record.batch_id) {
              batchDisplay = String(record.batch_id);
            }
            batchDisplay = batchDisplay ? String(batchDisplay) : 'N/A';
            
            // Ensure key is always a string
            const recordKey = record.feed_id || record._id;
            const recordKeyString = recordKey ? (typeof recordKey === 'object' ? String(recordKey._id || recordKey) : String(recordKey)) : Math.random().toString();
            
            return (
            <Card key={recordKeyString} className="flock-card">
              <div className="flock-header">
                <h3>{record.feed_type ? String(record.feed_type) : 'Unknown'}</h3>
                <span className="status-badge status-active">
                  {new Date(record.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flock-details">
                <div className="detail-row">
                  <span className="label">Batch:</span>
                  <span className="value">#{batchDisplay}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Quantity:</span>
                  <span className="value">{record.quantity} {record.unit}</span>
                </div>
              </div>
              <div className="flock-actions">
                <Button onClick={() => handleEdit(record)} variant="info" size="small">
                  Edit
                </Button>
                <Button onClick={() => {
                  const deleteId = record.feed_id || record._id;
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
            <p>No feeding records found. Add your first record!</p>
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={closeModal}
          title={editingRecord ? 'Edit Feeding Record' : 'Record Feeding'}
        >
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="input-group">
              <label>Flock/Batch *</label>
              <select
                name="batch_id"
                value={formData.batch_id ? (typeof formData.batch_id === 'object' ? String(formData.batch_id._id || formData.batch_id.batch_id || formData.batch_id) : String(formData.batch_id)) : ''}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="">Select Flock</option>
                {flocks.filter(f => {
                  const statusStr = f?.status ? String(f.status) : '';
                  return statusStr === 'Active';
                }).map(flock => {
                  // Ensure batch_id is always a string
                  const flockBatchId = flock.batch_id ? (typeof flock.batch_id === 'object' ? String(flock.batch_id._id || flock.batch_id.batch_id || flock.batch_id) : String(flock.batch_id)) : '';
                  const flockKey = flockBatchId || (flock._id ? String(flock._id) : Math.random().toString());
                  const breedDisplay = flock.breed ? String(flock.breed) : 'Unknown';
                  const quantityDisplay = flock.quantity ? String(flock.quantity) : '0';
                  
                  return (
                    <option key={flockKey} value={flockBatchId}>
                      {breedDisplay} - {quantityDisplay} birds
                    </option>
                  );
                })}
              </select>
            </div>
            <Input
              label="Feed Type"
              name="feed_type"
              value={formData.feed_type}
              onChange={handleInputChange}
              placeholder="e.g., Layer Mash, Starter Feed"
              required
            />
            <Input
              label="Quantity"
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              placeholder="Amount"
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
              </select>
            </div>
            <Input
              label="Date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
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

export default Feeding;

