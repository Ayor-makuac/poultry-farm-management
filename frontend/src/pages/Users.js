import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services';
import { ROLES } from '../utils/permissions';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import { toast } from 'react-toastify';
import './Users.css';

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Worker',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers();
      // Handle different response structures
      let usersData = [];
      if (response?.data) {
        usersData = Array.isArray(response.data) ? response.data : (response.data.data || []);
      } else if (Array.isArray(response)) {
        usersData = response;
      }
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load users';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'Worker',
      password: ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'Worker',
      password: ''
    });
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'Worker',
      password: ''
    });
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await userService.deleteUser(userId);
        if (response?.success !== false) {
          toast.success('User deleted successfully');
          fetchUsers();
        } else {
          toast.error(response.message || 'Failed to delete user');
        }
      } catch (error) {
        console.error('Failed to delete user:', error);
        const errorMsg = error.response?.data?.message || error.message || 'Failed to delete user';
        toast.error(errorMsg);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Update user
        const updateData = { ...formData };
        // Only include password if it's provided
        if (!updateData.password || updateData.password.trim() === '') {
          delete updateData.password;
        }
        const response = await userService.updateUser(editingUser.user_id, updateData);
        
        // Backend returns: { success: true, message: "...", data: {...} }
        if (response?.success === false) {
          toast.error(response.message || 'Failed to update user');
          return;
        }
        
        toast.success(response?.message || 'User updated successfully');
        handleCloseModal();
        fetchUsers();
      } else {
        // Create user (using auth register endpoint)
        const { authService } = await import('../services');
        const registerData = { ...formData };
        if (!registerData.password || registerData.password.trim() === '') {
          toast.error('Password is required for new users');
          return;
        }
        const response = await authService.register(registerData);
        
        // Backend returns: { success: true, message: "...", data: {...} }
        if (response?.success === false) {
          toast.error(response.message || 'Failed to create user');
          return;
        }
        
        toast.success(response?.message || 'User created successfully');
        handleCloseModal();
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to save user:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save user';
      toast.error(errorMessage);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return <div className="users-page">Loading...</div>;
  }

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>User Management</h1>
        {currentUser?.role === 'Admin' && (
          <Button onClick={handleAdd} className="add-btn">
            + Add User
          </Button>
        )}
      </div>

      <div className="users-grid">
        {users.map((user) => (
          <Card key={user.user_id} className="user-card">
            <div className="user-card-header">
              <div className="user-avatar-large">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="user-card-actions">
                {currentUser?.role === 'Admin' && (
                  <>
                    <button
                      className="icon-btn edit-btn"
                      onClick={() => handleEdit(user)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    {user.user_id !== currentUser.user_id && (
                      <button
                        className="icon-btn delete-btn"
                        onClick={() => handleDelete(user.user_id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="user-card-body">
              <h3>{user.name}</h3>
              <p className="user-email">{user.email}</p>
              <div className="user-details">
                <div className="detail-item">
                  <span className="detail-label">Role:</span>
                  <span className={`role-badge role-${user.role?.toLowerCase()}`}>
                    {user.role}
                  </span>
                </div>
                {user.phone && (
                  <div className="detail-item">
                    <span className="detail-label">Phone:</span>
                    <span>{user.phone}</span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="detail-label">Joined:</span>
                  <span>{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        <form onSubmit={handleSubmit} className="user-form">
          <Input
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
          />
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value={ROLES.WORKER}>Worker</option>
              <option value={ROLES.VETERINARIAN}>Veterinarian</option>
              <option value={ROLES.MANAGER}>Manager</option>
              {currentUser?.role === 'Admin' && (
                <option value={ROLES.ADMIN}>Admin</option>
              )}
            </select>
          </div>
          {!editingUser && (
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required={!editingUser}
            />
          )}
          {editingUser && (
            <Input
              label="New Password (leave blank to keep current)"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />
          )}
          <div className="form-actions">
            <Button type="button" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;

