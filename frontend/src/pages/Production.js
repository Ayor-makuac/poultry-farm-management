import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { productionService, flockService } from '../services';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import './Flocks.css';

const Production = () => {
  const [records, setRecords] = useState([]);
  const [flocks, setFlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    batch_id: '',
    eggs_collected: '',
    mortality_count: '0',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productionRes, flocksRes] = await Promise.all([
        productionService.getProduction(),
        flockService.getFlocks()
      ]);
      const records = productionRes?.data || productionRes || [];
      setRecords(Array.isArray(records) ? records : []);
      const flocks = flocksRes?.data || flocksRes || [];
      setFlocks(Array.isArray(flocks) ? flocks : []);
    } catch (error) {
      console.error('Error fetching production data:', error);
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
        const updateId = editingRecord.production_id || editingRecord._id;
        const updateIdString = updateId ? (typeof updateId === 'object' ? String(updateId._id || updateId) : String(updateId)) : '';
        if (!updateIdString) {
          toast.error('Unable to identify record to update');
          return;
        }
        await productionService.updateProduction(updateIdString, formData);
        toast.success('Production record updated successfully');
      } else {
        await productionService.createProduction(formData);
        toast.success('Production record created successfully');
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
      eggs_collected: record.eggs_collected || '',
      mortality_count: record.mortality_count || '0',
      date: record.date ? new Date(record.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: record.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await productionService.deleteProduction(id);
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
      eggs_collected: '',
      mortality_count: '0',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading production records...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flocks-page">
        <div className="page-header">
          <h1>Production Tracking</h1>
          <Button onClick={() => setShowModal(true)} variant="primary">
            + Record Production
          </Button>
        </div>

        <div className="flocks-grid">
          {records.map((record) => {
            // Handle populated batch_id (could be object or string)
            let batchId = record.batch_id;
            let batchDisplay = 'N/A';
            
            if (typeof record.batch_id === 'object' && record.batch_id !== null) {
              batchId = record.batch_id._id || record.batch_id.batch_id || null;
              batchDisplay = record.batch_id.batch_id || record.batch_id._id || 'N/A';
            } else if (record.batch_id) {
              batchDisplay = String(record.batch_id);
            }
            
            // Ensure batchDisplay is always a string
            batchDisplay = batchDisplay ? String(batchDisplay) : 'N/A';
            
            // Ensure key is always a string
            const recordKey = record.production_id || record._id;
            const recordKeyString = recordKey ? (typeof recordKey === 'object' ? String(recordKey._id || recordKey) : String(recordKey)) : Math.random().toString();
            
            return (
            <Card key={recordKeyString} className="flock-card">
              <div className="flock-header">
                <h3>Batch #{batchDisplay}</h3>
                <span className="status-badge status-active">
                  {new Date(record.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flock-details">
                <div className="detail-row">
                  <span className="label">Eggs Collected:</span>
                  <span className="value">{record.eggs_collected}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Mortality:</span>
                  <span className="value">{record.mortality_count}</span>
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
                <Button onClick={() => {
                  const deleteId = record.production_id || record._id;
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
            <p>No production records found. Add your first record!</p>
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={closeModal}
          title={editingRecord ? 'Edit Production Record' : 'Record Production'}
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
                {flocks.filter(f => f.status === 'Active').map(flock => {
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
              label="Eggs Collected"
              type="number"
              name="eggs_collected"
              value={formData.eggs_collected}
              onChange={handleInputChange}
              placeholder="Number of eggs"
              min="0"
              required
            />
            <Input
              label="Mortality Count"
              type="number"
              name="mortality_count"
              value={formData.mortality_count}
              onChange={handleInputChange}
              placeholder="Number of deaths"
              min="0"
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

export default Production;

