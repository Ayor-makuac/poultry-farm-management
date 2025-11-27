import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { feedingService, flockService } from '../services';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import { safeString, safeId, safeArray } from '../utils/safeRender';
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
        const updateId = safeId(editingRecord.feed_id || editingRecord._id, '');
        if (!updateId) {
          toast.error('Unable to identify record to update');
          return;
        }
        await feedingService.updateFeeding(updateId, formData);
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
    setFormData({
      batch_id: safeId(record.batch_id, ''),
      feed_type: safeString(record.feed_type, ''),
      quantity: safeString(record.quantity, ''),
      unit: safeString(record.unit, 'kg'),
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

  // Pre-process active flocks to ensure they're always strings
  const activeFlocks = useMemo(() => {
    const validFlocks = safeArray(flocks);
    return validFlocks
      .filter(f => {
        if (!f || typeof f !== 'object' || Array.isArray(f)) return false;
        const statusStr = safeString(f.status, '');
        return statusStr === 'Active';
      })
      .map(flock => ({
        batch_id: safeId(flock.batch_id, ''),
        _id: safeId(flock._id, ''),
        breed: safeString(flock.breed, 'Unknown'),
        quantity: safeString(flock.quantity, '0')
      }));
  }, [flocks]);

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
          {safeArray(records).map((record, index) => {
            // Use safeString for all values
            const batchDisplay = safeString(record.batch_id, 'N/A');
            const recordKey = safeId(record.feed_id || record._id, `feed-${index}`);
            const feedType = safeString(record.feed_type, 'Unknown');
            const quantity = safeString(record.quantity, '0');
            const unit = safeString(record.unit, '');
            const dateStr = record.date ? new Date(record.date).toLocaleDateString() : 'N/A';
            
            return (
            <Card key={recordKey} className="flock-card">
              <div className="flock-header">
                <h3>{feedType}</h3>
                <span className="status-badge status-active">
                  {dateStr}
                </span>
              </div>
              <div className="flock-details">
                <div className="detail-row">
                  <span className="label">Batch:</span>
                  <span className="value">#{batchDisplay}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Quantity:</span>
                  <span className="value">{quantity} {unit}</span>
                </div>
              </div>
              <div className="flock-actions">
                <Button onClick={() => handleEdit(record)} variant="info" size="small">
                  Edit
                </Button>
                <Button onClick={() => {
                  const deleteId = safeId(record.feed_id || record._id, '');
                  if (deleteId) handleDelete(deleteId);
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
                value={safeId(formData.batch_id, '')}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="">Select Flock</option>
                {activeFlocks.map((flock, index) => {
                  const flockKey = flock.batch_id || flock._id || `flock-${index}`;
                  return (
                    <option key={flockKey} value={flock.batch_id}>
                      {flock.breed} - {flock.quantity} birds
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

