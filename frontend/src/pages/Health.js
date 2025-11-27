import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { healthService, flockService } from '../services';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import './Flocks.css';

const Health = () => {
  const [records, setRecords] = useState([]);
  const [flocks, setFlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    batch_id: '',
    vaccination_date: '',
    vaccine_name: '',
    disease: '',
    treatment: '',
    status: 'Healthy',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [healthRes, flocksRes] = await Promise.all([
        healthService.getHealth(),
        flockService.getFlocks()
      ]);
      // Handle response structure: healthRes is { success, data } from service
      const records = healthRes?.data || healthRes || [];
      setRecords(Array.isArray(records) ? records : []);
      const flocks = flocksRes?.data || flocksRes || [];
      setFlocks(Array.isArray(flocks) ? flocks : []);
    } catch (error) {
      console.error('Error fetching health data:', error);
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
        const updateId = editingRecord.health_id || editingRecord._id;
        const updateIdString = updateId ? (typeof updateId === 'object' ? String(updateId._id || updateId) : String(updateId)) : '';
        if (!updateIdString) {
          toast.error('Unable to identify record to update');
          return;
        }
        await healthService.updateHealth(updateIdString, formData);
        toast.success('Health record updated successfully');
      } else {
        await healthService.createHealth(formData);
        toast.success('Health record created successfully');
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
      vaccination_date: record.vaccination_date ? new Date(record.vaccination_date).toISOString().split('T')[0] : '',
      vaccine_name: record.vaccine_name || '',
      disease: record.disease || '',
      treatment: record.treatment || '',
      status: record.status || 'Healthy',
      notes: record.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await healthService.deleteHealth(id);
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
      vaccination_date: '',
      vaccine_name: '',
      disease: '',
      treatment: '',
      status: 'Healthy',
      notes: ''
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading health records...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flocks-page">
        <div className="page-header">
          <h1>Health Management</h1>
          <Button onClick={() => setShowModal(true)} variant="primary">
            + Record Health Data
          </Button>
        </div>

        <div className="flocks-grid">
          {records.map((record) => {
            // Handle populated batch_id (could be object or string)
            let batchId = record.batch_id;
            let batchDisplay = 'N/A';
            
            if (typeof record.batch_id === 'object' && record.batch_id !== null) {
              // Extract the ID from populated object
              batchId = record.batch_id._id || record.batch_id.batch_id || null;
              // For display, try to get batch_id field first, then _id, or use breed info
              if (record.batch_id.batch_id) {
                batchDisplay = String(record.batch_id.batch_id);
              } else if (record.batch_id._id) {
                batchDisplay = String(record.batch_id._id);
              } else if (record.batch_id.breed) {
                batchDisplay = record.batch_id.breed;
              } else {
                batchDisplay = 'N/A';
              }
            } else if (record.batch_id) {
              batchDisplay = String(record.batch_id);
            }
            
            // Ensure batchDisplay is always a string
            batchDisplay = batchDisplay ? String(batchDisplay) : 'N/A';
            
            // Ensure key is always a string
            const recordKey = record.health_id || record._id;
            const recordKeyString = recordKey ? (typeof recordKey === 'object' ? String(recordKey._id || recordKey) : String(recordKey)) : Math.random().toString();
            
            return (
            <Card key={recordKeyString} className="flock-card">
              <div className="flock-header">
                <h3>Batch #{batchDisplay}</h3>
                <span className={`status-badge status-${record.status?.toLowerCase().replace(' ', '-') || 'healthy'}`}>
                  {record.status}
                </span>
              </div>
              <div className="flock-details">
                {record.vaccine_name && (
                  <div className="detail-row">
                    <span className="label">Vaccine:</span>
                    <span className="value">{record.vaccine_name}</span>
                  </div>
                )}
                {record.vaccination_date && (
                  <div className="detail-row">
                    <span className="label">Vaccination Date:</span>
                    <span className="value">{new Date(record.vaccination_date).toLocaleDateString()}</span>
                  </div>
                )}
                {record.disease && (
                  <div className="detail-row">
                    <span className="label">Disease:</span>
                    <span className="value">{record.disease}</span>
                  </div>
                )}
                {record.treatment && (
                  <div className="detail-row">
                    <span className="label">Treatment:</span>
                    <span className="value">{record.treatment}</span>
                  </div>
                )}
              </div>
              <div className="flock-actions">
                <Button onClick={() => handleEdit(record)} variant="info" size="small">
                  Edit
                </Button>
                <Button onClick={() => {
                  const deleteId = record.health_id || record._id;
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
            <p>No health records found. Add your first record!</p>
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={closeModal}
          title={editingRecord ? 'Edit Health Record' : 'Record Health Data'}
          size="large"
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
                {flocks.map(flock => {
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
              label="Vaccination Date"
              type="date"
              name="vaccination_date"
              value={formData.vaccination_date}
              onChange={handleInputChange}
            />
            <Input
              label="Vaccine Name"
              name="vaccine_name"
              value={formData.vaccine_name}
              onChange={handleInputChange}
              placeholder="e.g., Newcastle Disease Vaccine"
            />
            <Input
              label="Disease"
              name="disease"
              value={formData.disease}
              onChange={handleInputChange}
              placeholder="Disease name if any"
            />
            <div className="input-group">
              <label>Treatment</label>
              <textarea
                name="treatment"
                value={formData.treatment}
                onChange={handleInputChange}
                className="input-field"
                rows="3"
                placeholder="Treatment details..."
              />
            </div>
            <div className="input-group">
              <label>Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="Healthy">Healthy</option>
                <option value="Under Treatment">Under Treatment</option>
                <option value="Quarantined">Quarantined</option>
                <option value="Recovered">Recovered</option>
              </select>
            </div>
            <div className="input-group">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="input-field"
                rows="3"
                placeholder="Additional notes..."
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

export default Health;

