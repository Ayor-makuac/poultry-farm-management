const request = require('supertest');
const app = require('../../server');
const { User } = require('../../models');
const { mongoose } = require('../../config/database');

describe('Users API Tests', () => {
  let adminToken;
  let adminUser;
  let testUser;

  beforeAll(async () => {
    // Create admin user for testing
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      role: 'Admin'
    });

    // Login as admin to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password123'
      });
    
    adminToken = loginResponse.body.data.token;
  });

  afterAll(async () => {
    // Clean up test users
    if (adminUser?.user_id) await User.deleteOne({ _id: adminUser.user_id });
    if (testUser?.user_id) await User.deleteOne({ _id: testUser.user_id });
  });

  describe('GET /api/users', () => {
    it('should get all users (Admin only)', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 403 for non-admin users', async () => {
      // Create a worker user
      const worker = await User.create({
        name: 'Worker User',
        email: 'worker@test.com',
        password: 'password123',
        role: 'Worker'
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'worker@test.com',
          password: 'password123'
        });

      const workerToken = loginResponse.body.data.token;

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${workerToken}`);

      expect(response.status).toBe(403);

      // Cleanup
      await User.deleteOne({ _id: worker.user_id });
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get a single user by ID', async () => {
      const response = await request(app)
        .get(`/api/users/${adminUser.user_id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user_id).toBe(adminUser.user_id);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .get(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user successfully', async () => {
      testUser = await User.create({
        name: 'Test User',
        email: 'testuser@test.com',
        password: 'password123',
        role: 'Worker'
      });

      const response = await request(app)
        .put(`/api/users/${testUser.user_id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Name',
          phone: '+254711111111'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
    });

    it('should return 403 if non-admin tries to change role', async () => {
      const worker = await User.create({
        name: 'Worker',
        email: 'worker2@test.com',
        password: 'password123',
        role: 'Worker'
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'worker2@test.com',
          password: 'password123'
        });

      const workerToken = loginResponse.body.data.token;

      const response = await request(app)
        .put(`/api/users/${worker.user_id}`)
        .set('Authorization', `Bearer ${workerToken}`)
        .send({
          role: 'Manager'
        });

      expect(response.status).toBe(403);

      await User.deleteOne({ _id: worker.user_id });
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user successfully (Admin only)', async () => {
      const userToDelete = await User.create({
        name: 'Delete Me',
        email: 'delete@test.com',
        password: 'password123',
        role: 'Worker'
      });

      const response = await request(app)
        .delete(`/api/users/${userToDelete.user_id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify user is deleted
      const deletedUser = await User.findById(userToDelete.user_id);
      expect(deletedUser).toBeNull();
    });
  });
});

