import { Router, Request, Response, NextFunction } from 'express';
import TreeModel from '../models/Tree';

const router = Router();

// GET /api/v1/trees - Get all trees with optional filters
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
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
});

// GET /api/v1/trees/nearby - Find trees near a location
router.get('/nearby', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lat, lng, radius = 100 } = req.query;
    
    if (!lat || !lng) {
      res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
      return;
    }

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
});

// GET /api/v1/trees/high-risk - Get high risk trees
router.get('/high-risk', async (req: Request, res: Response, next: NextFunction) => {
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
});

// GET /api/v1/trees/:id - Get single tree by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
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
});

// POST /api/v1/trees - Create new tree
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: Get user ID from auth middleware
    const userId = req.headers['x-user-id'] as string || undefined;
    
    const treeData = {
      ...req.body,
      created_by: userId
    };

    const tree = await TreeModel.create(treeData);
    
    res.status(201).json({
      success: true,
      data: tree
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/trees/:id - Update tree
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: Get user ID from auth middleware
    const userId = req.headers['x-user-id'] as string || undefined;
    
    const updateData = {
      ...req.body,
      updated_by: userId
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
});

// DELETE /api/v1/trees/:id - Soft delete tree
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
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
});

export default router;