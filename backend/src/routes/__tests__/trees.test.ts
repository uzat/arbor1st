import request from 'supertest';
import express from 'express';
import { faker } from '@faker-js/faker';
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
      email: faker.internet.email(),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      role: 'arborist',
      active: true
    }).returning('*');
  });

  describe('GET /api/v1/trees', () => {
    it('should return empty array when no trees exist', async () => {
      const response = await request(app)
        .get('/api/v1/trees')
        .expect(200);

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

    it('should filter trees by health status', async () => {
      await db('trees').insert([
        {
          species: 'Tree 1',
          health_status: 'excellent',
          created_by: testUser.id
        },
        {
          species: 'Tree 2',
          health_status: 'poor',
          created_by: testUser.id
        }
      ]);

      const response = await request(app)
        .get('/api/v1/trees?health_status=excellent')
        .expect(200);

      expect(response.body.count).toBe(1);
      expect(response.body.data[0].health_status).toBe('excellent');
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
        .send(treeData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.species).toBe(treeData.species);
      expect(response.body.data.id).toBeDefined();
      
      // Verify it's in the database
      const tree = await db('trees').where({ id: response.body.data.id }).first();
      expect(tree).toBeDefined();
      expect(tree.species).toBe(treeData.species);
    });

    it('should store location as PostGIS point', async () => {
      const lat = -37.8136;
      const lng = 144.9631;

      const response = await request(app)
        .post('/api/v1/trees')
        .send({
          species: 'Test Tree',
          latitude: lat,
          longitude: lng
        })
        .expect(201);

      // Query with PostGIS functions to verify location
      const result = await db('trees')
        .select(
          db.raw('ST_X(location::geometry) as lng'),
          db.raw('ST_Y(location::geometry) as lat')
        )
        .where({ id: response.body.data.id })
        .first();

      expect(parseFloat(result.lat)).toBeCloseTo(lat, 5);
      expect(parseFloat(result.lng)).toBeCloseTo(lng, 5);
    });
  });

  describe('GET /api/v1/trees/nearby', () => {
    it('should find trees within radius', async () => {
      // Create trees at different distances
      const melbourneCBD = { lat: -37.8136, lng: 144.9631 };
      
      // Tree 1: At exact location (0m)
      await db('trees').insert({
        species: 'Tree at CBD',
        location: db.raw('ST_SetSRID(ST_MakePoint(?, ?), 4326)', [melbourneCBD.lng, melbourneCBD.lat]),
        created_by: testUser.id
      });

      // Tree 2: ~500m away
      await db('trees').insert({
        species: 'Tree 500m away',
        location: db.raw('ST_SetSRID(ST_MakePoint(?, ?), 4326)', [144.968, -37.813]),
        created_by: testUser.id
      });

      // Tree 3: ~2km away
      await db('trees').insert({
        species: 'Tree 2km away',
        location: db.raw('ST_SetSRID(ST_MakePoint(?, ?), 4326)', [144.983, -37.813]),
        created_by: testUser.id
      });

      const response = await request(app)
        .get(`/api/v1/trees/nearby?lat=${melbourneCBD.lat}&lng=${melbourneCBD.lng}&radius=1000`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2); // Should find trees within 1km
      expect(response.body.data[0].distance).toBeLessThan(1);
      expect(response.body.data[1].distance).toBeLessThan(1000);
    });

    it('should return 400 if coordinates missing', async () => {
      const response = await request(app)
        .get('/api/v1/trees/nearby')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Latitude and longitude are required');
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
      const fakeId = faker.string.uuid();
      
      const response = await request(app)
        .get(`/api/v1/trees/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Tree not found');
    });
  });

  describe('PUT /api/v1/trees/:id', () => {
    beforeEach(async () => {
      [testTree] = await db('trees').insert({
        species: 'Original Species',
        health_status: 'fair',
        height_m: 10,
        created_by: testUser.id
      }).returning('*');
    });

    it('should update a tree', async () => {
      const updates = {
        health_status: 'excellent',
        height_m: 12,
        risk_rating: 15
      };

      const response = await request(app)
        .put(`/api/v1/trees/${testTree.id}`)
        .set('x-user-id', testUser.id)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.health_status).toBe('excellent');
      expect(response.body.data.height_m).toBe(12);
      expect(response.body.data.risk_rating).toBe(15);
      
      // Verify in database
      const updated = await db('trees').where({ id: testTree.id }).first();
      expect(updated.health_status).toBe('excellent');
    });

    it('should return 404 when updating non-existent tree', async () => {
      const fakeId = faker.string.uuid();
      
      const response = await request(app)
        .put(`/api/v1/trees/${fakeId}`)
        .send({ health_status: 'good' })
        .expect(404);

      expect(response.body.success).toBe(false);
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
      
      // Should not appear in normal queries
      const trees = await db('trees').whereNull('deleted_at');
      expect(trees).toHaveLength(0);
    });

    it('should return 404 when deleting non-existent tree', async () => {
      const fakeId = faker.string.uuid();
      
      const response = await request(app)
        .delete(`/api/v1/trees/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});