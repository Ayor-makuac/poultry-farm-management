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
        await healthService.updateHealth(editingRecord.health_id || editingRecord._id, formData);
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
    let batchId = record.batch_id;
    if (typeof record.batch_id === 'object' && record.batch_id !== null) {
      batchId = record.batch_id._id || record.batch_id.batch_id || record.batch_id;
    }
    // Convert to string if it's an ObjectId
    batchId = batchId?.toString ? batchId.toString() : batchId;
    
    setFormData({
      batch_id: batchId || '',
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
              batchId = record.batch_id._id || record.batch_id.batch_id || record.batch_id;
              batchDisplay = record.batch_id.batch_id || record.batch_id._id || 'N/A';
            } else {
              batchDisplay = batchId;
            }
            
            // Convert to string for display
            batchDisplay = batchDisplay?.toString ? batchDisplay.toString() : batchDisplay;
            
            return (
            <Card key={record.health_id || record._id} className="flock-card">
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
                <Button onClick={() => handleDelete(record.health_id || record._id)} variant="danger" size="small">
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
                value={formData.batch_id}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="">Select Flock</option>
                {flocks.map(flock => (
                  <option key={flock.batch_id} value={flock.batch_id}>
                    {flock.breed} - {flock.quantity} birds
                  </option>
                ))}
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

