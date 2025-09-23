import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../config/database';

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        company_id?: string;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Ensure JWT_SECRET is never empty
if (!JWT_SECRET || JWT_SECRET === 'your-secret-key-change-in-production') {
  console.warn('⚠️  WARNING: Using default JWT secret. Set JWT_SECRET environment variable in production!');
}

// Generate JWT token
export const generateToken = (user: any): string => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    company_id: user.company_id
  };
  
  // Cast to any to bypass TypeScript strict checking
  return (jwt as any).sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compare password
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Verify JWT token middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const decoded = (jwt as any).verify(token, JWT_SECRET) as any;
    
    // Verify user still exists and is active
    const user = await db('users')
      .where({ id: decoded.id, active: true })
      .whereNull('deleted_at')
      .first();

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found or inactive'
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      company_id: user.company_id
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expired'
      });
      return;
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

// Role-based access control
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      next();
      return;
    }

    const decoded = (jwt as any).verify(token, JWT_SECRET) as any;
    
    const user = await db('users')
      .where({ id: decoded.id, active: true })
      .whereNull('deleted_at')
      .first();

    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        company_id: user.company_id
      };
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};