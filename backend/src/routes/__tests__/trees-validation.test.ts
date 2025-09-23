import 'jest';
import request from 'supertest';
import express from 'express';
import treeRoutes from '../trees';

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/v1/trees', treeRoutes);

describe('Tree API Validation', () => {
  describe('POST /api/v1/trees validation', () => {
    it('should reject negative height', async () => {
      const response = await request(app)
        .post('/api/v1/trees')
        .send({
          species: 'Test Tree',
          height_m: -5
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContainEqual({
        field: 'height_m',
        message: '"height_m" must be greater than or equal to 0'
      });
    });

    it('should reject risk_rating over 100', async () => {
      const response = await request(app)
        .post('/api/v1/trees')
        .send({
          species: 'Test Tree',
          risk_rating: 150
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toContainEqual({
        field: 'risk_rating',
        message: '"risk_rating" must be less than or equal to 100'
      });
    });

    it('should require species field', async () => {
      const response = await request(app)
        .post('/api/v1/trees')
        .send({
          height_m: 10
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toContainEqual({
        field: 'species',
        message: '"species" is required'
      });
    });

    it('should strip unknown fields', async () => {
      const response = await request(app)
        .post('/api/v1/trees')
        .send({
          species: 'Test Tree',
          unknown_field: 'should be removed',
          another_unknown: 123
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.unknown_field).toBeUndefined();
      expect(response.body.data.another_unknown).toBeUndefined();
    });

    it('should validate UUID format for IDs', async () => {
      const response = await request(app)
        .get('/api/v1/trees/not-a-uuid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid id format. Must be a valid UUID.');
    });

    it('should validate coordinates for nearby search', async () => {
      const response = await request(app)
        .get('/api/v1/trees/nearby?lat=200&lng=400')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid query parameters');
      expect(response.body.details).toContainEqual({
        field: 'lat',
        message: '"lat" must be less than or equal to 90'
      });
    });
  });
});