import request from 'supertest';
import express from 'express';
import treeRoutes from '../trees';
import db from '../../config/database';

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/v1/trees', treeRoutes);

describe('Tree API Endpoints', () => {
  let testUser: any;
  let testTree: any;

  beforeEach(async () => {
    // Create a test user for foreign key constraints
    [testUser] = await db('users').insert({
      email: `test.user.${Date.now()}@arboriq.com`,
      first_name: 'Test',
      last_name: 'User',
      role: 'arborist',
      active: true
    }).returning('*');
  });

  describe('GET /api/v1/trees', () => {
    it('should return empty array when no trees exist', async () => {
      // Clean up any existing trees first
      await db('trees').del();
      
      const response = await request(app)
        .get('/api/v1/trees');
      
      // Log the error if we get 500
      if (response.status === 500) {
        console.error('Error response:', response.body);
        console.error('Error text:', response.text);
      }
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
      expect(response.body.data).toEqual([]);
    });

    it('should return all trees', async () => {
      // Create test trees
      await db('trees').insert([
        {
          species: 'Eucalyptus camaldulensis',
          common_name: 'River Red Gum',
          height_m: 15,
          health_status: 'good',
          created_by: testUser.id
        },
        {
          species: 'Acacia melanoxylon',
          common_name: 'Blackwood',
          height_m: 10,
          health_status: 'fair',
          created_by: testUser.id
        }
      ]);

      const response = await request(app)
        .get('/api/v1/trees')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('POST /api/v1/trees', () => {
    it('should create a new tree', async () => {
      const treeData = {
        species: 'Eucalyptus regnans',
        common_name: 'Mountain Ash',
        height_m: 25.5,
        dbh_cm: 80,
        health_status: 'excellent',
        risk_rating: 10,
        latitude: -37.8136,
        longitude: 144.9631
      };

      const response = await request(app)
        .post('/api/v1/trees')
        .set('x-user-id', testUser.id)
        .send(treeData);
      
      // Log error if we get 500
      if (response.status === 500) {
        console.error('POST Error:', response.text);
      }

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.species).toBe(treeData.species);
      expect(response.body.data.id).toBeDefined();
      
      // Verify it's in the database
      const tree = await db('trees').where({ id: response.body.data.id }).first();
      expect(tree).toBeDefined();
      expect(tree.species).toBe(treeData.species);
    });
  });

  describe('GET /api/v1/trees/:id', () => {
    beforeEach(async () => {
      [testTree] = await db('trees').insert({
        species: 'Eucalyptus test',
        common_name: 'Test Tree',
        health_status: 'good',
        created_by: testUser.id
      }).returning('*');
    });

    it('should return a tree by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/trees/${testTree.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testTree.id);
      expect(response.body.data.species).toBe(testTree.species);
    });

    it('should return 404 for non-existent tree', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app)
        .get(`/api/v1/trees/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Tree not found');
    });
  });

  describe('DELETE /api/v1/trees/:id', () => {
    beforeEach(async () => {
      [testTree] = await db('trees').insert({
        species: 'Tree to delete',
        created_by: testUser.id
      }).returning('*');
    });

    it('should soft delete a tree', async () => {
      const response = await request(app)
        .delete(`/api/v1/trees/${testTree.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Verify soft delete
      const deleted = await db('trees').where({ id: testTree.id }).first();
      expect(deleted.deleted_at).not.toBeNull();
    });
  });
});