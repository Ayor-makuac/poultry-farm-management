import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import flockService from '../services/flockService';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import SearchBar from '../components/common/SearchBar';
import Pagination from '../components/common/Pagination';
import './Flocks.css';

const Flocks = () => {
  const [flocks, setFlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFlock, setEditingFlock] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('All');
  const [formData, setFormData] = useState({
    breed: '',
    quantity: '',
    age: '',
    date_acquired: '',
    housing_unit: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchFlocks();
  }, []);

  const fetchFlocks = async () => {
    try {
      const response = await flockService.getFlocks();
      const flocks = response?.data || response || [];
      setFlocks(Array.isArray(flocks) ? flocks : []);
    } catch (error) {
      console.error('Error fetching flocks data:', error);
      toast.error('Failed to fetch flocks');
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
      if (editingFlock) {
        const updateId = editingFlock.batch_id || editingFlock._id;
        const updateIdString = updateId ? (typeof updateId === 'object' ? String(updateId._id || updateId.batch_id || updateId) : String(updateId)) : '';
        if (!updateIdString) {
          toast.error('Unable to identify flock to update');
          return;
        }
        await flockService.updateFlock(updateIdString, formData);
        toast.success('Flock updated successfully');
      } else {
        await flockService.createFlock(formData);
        toast.success('Flock created successfully');
      }
      fetchFlocks();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (flock) => {
    setEditingFlock(flock);
    setFormData({
      breed: flock.breed,
      quantity: flock.quantity,
      age: flock.age,
      date_acquired: flock.date_acquired,
      housing_unit: flock.housing_unit || '',
      status: flock.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this flock?')) {
      try {
        await flockService.deleteFlock(id);
        toast.success('Flock deleted successfully');
        fetchFlocks();
      } catch (error) {
        toast.error('Failed to delete flock');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingFlock(null);
    setFormData({
      breed: '',
      quantity: '',
      age: '',
      date_acquired: '',
      housing_unit: '',
      status: 'Active'
    });
  };

  // Filter and search logic
  const filteredFlocks = useMemo(() => {
    return flocks.filter(flock => {
      const matchesSearch = 
        flock.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flock.housing_unit?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || flock.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [flocks, searchTerm, statusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredFlocks.length / itemsPerPage);
  const paginatedFlocks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredFlocks.slice(start, start + itemsPerPage);
  }, [filteredFlocks, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, statusFilter]);

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading flocks...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flocks-page">
        <div className="page-header">
          <h1>Flock Management</h1>
          <Button onClick={() => setShowModal(true)} variant="primary">
            + Add New Flock
          </Button>
        </div>

        <div className="filters-section">
          <SearchBar 
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by breed or housing unit..."
          />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Sold">Sold</option>
            <option value="Deceased">Deceased</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="flocks-grid">
          {paginatedFlocks.map((flock) => {
            // Ensure key is always a string
            const flockKey = flock.batch_id || flock._id;
            const flockKeyString = flockKey ? (typeof flockKey === 'object' ? String(flockKey._id || flockKey.batch_id || flockKey) : String(flockKey)) : Math.random().toString();
            
            return (
            <Card key={flockKeyString} className="flock-card">
              <div className="flock-header">
                <h3>{flock.breed}</h3>
                <span className={`status-badge status-${flock.status.toLowerCase()}`}>
                  {flock.status}
                </span>
              </div>
              <div className="flock-details">
                <div className="detail-row">
                  <span className="label">Quantity:</span>
                  <span className="value">{flock.quantity} birds</span>
                </div>
                <div className="detail-row">
                  <span className="label">Age:</span>
                  <span className="value">{flock.age} weeks</span>
                </div>
                <div className="detail-row">
                  <span className="label">Housing:</span>
                  <span className="value">{flock.housing_unit || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Acquired:</span>
                  <span className="value">{new Date(flock.date_acquired).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flock-actions">
                <Button onClick={() => handleEdit(flock)} variant="info" size="small">
                  Edit
                </Button>
                <Button onClick={() => {
                  const deleteId = flock.batch_id || flock._id;
                  const deleteIdString = deleteId ? (typeof deleteId === 'object' ? String(deleteId._id || deleteId.batch_id || deleteId) : String(deleteId)) : '';
                  if (deleteIdString) handleDelete(deleteIdString);
                }} variant="danger" size="small">
                  Delete
                </Button>
              </div>
            </Card>
            );
          })}
        </div>

        {filteredFlocks.length === 0 && (
          <div className="empty-state">
            <p>{flocks.length === 0 ? 'No flocks found. Add your first flock to get started!' : 'No flocks match your search criteria.'}</p>
          </div>
        )}

        {filteredFlocks.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setCurrentPage(1);
            }}
          />
        )}

        <Modal
          isOpen={showModal}
          onClose={closeModal}
          title={editingFlock ? 'Edit Flock' : 'Add New Flock'}
        >
          <form onSubmit={handleSubmit} className="modal-form">
                <Input
                  label="Breed"
                  name="breed"
                  value={formData.breed}
                  onChange={handleInputChange}
                  placeholder="e.g., Layers, Broilers"
                  required
                />
                <Input
                  label="Quantity"
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="Number of birds"
                  min="1"
                  required
                />
                <Input
                  label="Age (weeks)"
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="Age in weeks"
                  min="0"
                  required
                />
                <Input
                  label="Date Acquired"
                  type="date"
                  name="date_acquired"
                  value={formData.date_acquired}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Housing Unit"
                  name="housing_unit"
                  value={formData.housing_unit}
                  onChange={handleInputChange}
                  placeholder="e.g., House A, Pen 1"
                />
                <div className="input-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="Active">Active</option>
                    <option value="Sold">Sold</option>
                    <option value="Deceased">Deceased</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <Button type="button" onClick={closeModal} variant="secondary">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    {editingFlock ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default Flocks;

