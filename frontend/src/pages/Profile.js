import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (user?.user_id) {
      fetchUserDetails();
    }
  }, [user?.user_id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await userService.getUser(user.user_id);
      const userData = response.data?.data || response.data;
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || ''
      });
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await userService.updateUser(user.user_id, formData);
      
      // Backend returns: { success: true, message: "...", data: {...} }
      if (response?.success === false) {
        toast.error(response.message || 'Failed to update profile');
        return;
      }
      
      // Extract user data from response
      const updatedUser = response?.data || {};
      
      // Update user in context and localStorage
      const updatedUserData = {
        ...user,
        ...updatedUser,
        name: updatedUser.name || user.name,
        email: updatedUser.email || user.email,
        phone: updatedUser.phone !== undefined ? updatedUser.phone : user.phone
      };
      setUser(updatedUserData);
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      
      // Refresh profile data
      await fetchUserDetails();
      
      toast.success(response?.message || 'Profile updated successfully');
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile';
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
    return <div className="profile-page">Loading...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>My Profile</h1>
        <Button onClick={handleEdit} className="edit-profile-btn">
          ✏️ Edit Profile
        </Button>
      </div>

      <div className="profile-content">
        <Card className="profile-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h2>{user?.name}</h2>
            <p className="profile-role-badge">{user?.role}</p>
          </div>

          <div className="profile-details">
            <div className="detail-section">
              <h3>Personal Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Name</span>
                  <span className="detail-value">{formData.name || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{formData.email || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">{formData.phone || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Role</span>
                  <span className={`role-badge role-${user?.role?.toLowerCase()}`}>
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Account Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">User ID</span>
                  <span className="detail-value">{user?.user_id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Member Since</span>
                  <span className="detail-value">
                    {user?.created_at 
                      ? new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Profile"
      >
        <form onSubmit={handleSubmit} className="profile-form">
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
          <div className="form-actions">
            <Button type="button" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;

