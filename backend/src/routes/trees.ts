import { Router, Request, Response, NextFunction } from 'express';
import TreeModel from '../models/Tree';
import { validate, validateQuery, validateUUID, treeSchemas } from '../middleware/validation';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';

const router = Router();

// GET /api/v1/trees - Get all trees (public with optional auth for filtering)
router.get('/', 
  optionalAuth,  // Optional auth to get user-specific trees
  validateQuery(treeSchemas.listQuery),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = {
        property_id: req.query.property_id as string,
        zone_id: req.query.zone_id as string,
        health_status: req.query.health_status as string,
        risk_rating: req.query.risk_rating ? Number(req.query.risk_rating) : undefined
      };

      const trees = await TreeModel.findAll(filters);
      res.json({
        success: true,
        count: trees.length,
        data: trees
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/trees/nearby - Find trees near a location (public)
router.get('/nearby', 
  validateQuery(treeSchemas.nearbyQuery),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lat, lng, radius = 100 } = req.query;

      const trees = await TreeModel.findNearby(
        Number(lat),
        Number(lng),
        Number(radius)
      );

      res.json({
        success: true,
        count: trees.length,
        data: trees
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/trees/high-risk - Get high risk trees (authenticated)
router.get('/high-risk', 
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const minRating = req.query.min_rating ? Number(req.query.min_rating) : 70;
      const trees = await TreeModel.findHighRisk(minRating);
      
      res.json({
        success: true,
        count: trees.length,
        data: trees
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/trees/:id - Get single tree by ID (public)
router.get('/:id', 
  validateUUID('id'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tree = await TreeModel.findById(req.params.id);
      
      if (!tree) {
        res.status(404).json({
          success: false,
          error: 'Tree not found'
        });
        return;
      }

      res.json({
        success: true,
        data: tree
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/trees - Create new tree (authenticated - arborist or admin)
router.post('/', 
  authenticate,
  authorize('arborist', 'admin', 'council_manager'),
  validate(treeSchemas.create),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const treeData = {
        ...req.body,
        created_by: req.user!.id  // Use authenticated user's ID
      };

      const tree = await TreeModel.create(treeData);
      
      res.status(201).json({
        success: true,
        data: tree
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/v1/trees/:id - Update tree (authenticated - arborist or admin)
router.put('/:id', 
  authenticate,
  authorize('arborist', 'admin', 'council_manager'),
  validateUUID('id'),
  validate(treeSchemas.update),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updateData = {
        ...req.body,
        updated_by: req.user!.id  // Use authenticated user's ID
      };

      const tree = await TreeModel.update(req.params.id, updateData);
      
      if (!tree) {
        res.status(404).json({
          success: false,
          error: 'Tree not found'
        });
        return;
      }

      res.json({
        success: true,
        data: tree
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/v1/trees/:id - Soft delete tree (authenticated - admin only)
router.delete('/:id', 
  authenticate,
  authorize('admin'),
  validateUUID('id'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const success = await TreeModel.delete(req.params.id);
      
      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Tree not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Tree deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;