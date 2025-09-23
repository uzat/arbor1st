import { Router, Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { generateToken, hashPassword, comparePassword, authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import db from '../config/database';

const router = Router();

// Validation schemas
const authSchemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    first_name: Joi.string().min(2).max(100).required(),
    last_name: Joi.string().min(2).max(100).required(),
    phone: Joi.string().max(50).optional(),
    role: Joi.string().valid('admin', 'arborist', 'council_manager', 'viewer').default('viewer'),
    company: Joi.string().max(255).optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  changePassword: Joi.object({
    current_password: Joi.string().required(),
    new_password: Joi.string().min(8).required()
  })
};

// POST /api/v1/auth/register
router.post('/register',
  validate(authSchemas.register),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, ...userData } = req.body;

      // Check if user already exists
      const existingUser = await db('users')
        .where({ email })
        .first();

      if (existingUser) {
        res.status(409).json({
          success: false,
          error: 'Email already registered'
        });
        return;
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      
      const [user] = await db('users')
        .insert({
          email,
          password_hash: hashedPassword,
          ...userData,
          active: true,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning(['id', 'email', 'first_name', 'last_name', 'role']);

      // Generate token
      const token = generateToken(user);

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/auth/login
router.post('/login',
  validate(authSchemas.login),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await db('users')
        .where({ email, active: true })
        .whereNull('deleted_at')
        .first();

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
        return;
      }

      // Verify password
      const isValidPassword = await comparePassword(password, user.password_hash);

      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
        return;
      }

      // Update last login
      await db('users')
        .where({ id: user.id })
        .update({ last_login_at: new Date() });

      // Generate token
      const token = generateToken(user);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/auth/me - Get current user
router.get('/me',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await db('users')
        .where({ id: req.user!.id })
        .select('id', 'email', 'first_name', 'last_name', 'role', 'company', 'phone', 'certification_level', 'last_login_at')
        .first();

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/v1/auth/password - Change password
router.put('/password',
  authenticate,
  validate(authSchemas.changePassword),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { current_password, new_password } = req.body;

      // Get user with password hash
      const user = await db('users')
        .where({ id: req.user!.id })
        .first();

      // Verify current password
      const isValidPassword = await comparePassword(current_password, user.password_hash);

      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          error: 'Current password is incorrect'
        });
        return;
      }

      // Hash new password and update
      const hashedPassword = await hashPassword(new_password);
      
      await db('users')
        .where({ id: req.user!.id })
        .update({
          password_hash: hashedPassword,
          updated_at: new Date()
        });

      res.json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/auth/refresh - Refresh token
router.post('/refresh',
  authenticate,
  async (req: Request, res: Response) => {
    // Generate new token with existing user data
    const token = generateToken(req.user!);

    res.json({
      success: true,
      data: { token }
    });
  }
);

export default router;