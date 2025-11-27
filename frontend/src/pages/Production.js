import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { productionService, flockService } from '../services';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import { safeString, safeId, safeArray } from '../utils/safeRender';
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
      // Handle response structure: productionRes is { success, data } from service
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
        const updateId = safeId(editingRecord.production_id || editingRecord._id, '');
        if (!updateId) {
          toast.error('Unable to identify record to update');
          return;
        }
        await productionService.updateProduction(updateId, formData);
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
    setFormData({
      batch_id: safeId(record.batch_id, ''),
      eggs_collected: safeString(record.eggs_collected, ''),
      mortality_count: safeString(record.mortality_count, '0'),
      date: record.date ? new Date(record.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: safeString(record.notes, '')
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
          {safeArray(records).map((record, index) => {
            // Use safeString for all values
            const batchDisplay = safeString(record.batch_id, 'N/A');
            const recordKey = safeId(record.production_id || record._id, `prod-${index}`);
            const eggsCollected = safeString(record.eggs_collected, '0');
            const mortalityCount = safeString(record.mortality_count, '0');
            const notes = safeString(record.notes, '');
            const dateStr = record.date ? new Date(record.date).toLocaleDateString() : 'N/A';
            
            return (
            <Card key={recordKey} className="flock-card">
              <div className="flock-header">
                <h3>Batch #{batchDisplay}</h3>
                <span className="status-badge status-active">
                  {dateStr}
                </span>
              </div>
              <div className="flock-details">
                <div className="detail-row">
                  <span className="label">Eggs Collected:</span>
                  <span className="value">{eggsCollected}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Mortality:</span>
                  <span className="value">{mortalityCount}</span>
                </div>
                {notes && (
                  <div className="detail-row">
                    <span className="label">Notes:</span>
                    <span className="value">{notes}</span>
                  </div>
                )}
              </div>
              <div className="flock-actions">
                <Button onClick={() => handleEdit(record)} variant="info" size="small">
                  Edit
                </Button>
                <Button onClick={() => {
                  const deleteId = safeId(record.production_id || record._id, '');
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

