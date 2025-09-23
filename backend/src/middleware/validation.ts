import { Request, Response, NextFunction } from 'express';
import Joi, { Schema, ValidationError } from 'joi';

// Generic validation middleware factory
export const validate = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just first one
      stripUnknown: true, // Remove unknown fields
      convert: true // Type conversion
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
      return;
    }

    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
};

// Tree validation schemas
export const treeSchemas = {
  create: Joi.object({
    species: Joi.string().min(2).max(255).required(),
    common_name: Joi.string().min(2).max(255).optional(),
    cultivar: Joi.string().max(255).optional(),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
    height_m: Joi.number().min(0).max(200).optional(),
    dbh_cm: Joi.number().min(0).max(2000).optional(),
    canopy_spread_m: Joi.number().min(0).max(100).optional(),
    health_status: Joi.string()
      .valid('excellent', 'good', 'fair', 'poor', 'dead')
      .optional(),
    risk_rating: Joi.number().min(0).max(100).optional(),
    address: Joi.string().max(500).optional(),
    property_id: Joi.string().uuid().optional(),
    zone_id: Joi.string().uuid().optional()
  }),

  update: Joi.object({
    species: Joi.string().min(2).max(255).optional(),
    common_name: Joi.string().min(2).max(255).optional(),
    cultivar: Joi.string().max(255).optional(),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
    height_m: Joi.number().min(0).max(200).optional(),
    dbh_cm: Joi.number().min(0).max(2000).optional(),
    canopy_spread_m: Joi.number().min(0).max(100).optional(),
    health_status: Joi.string()
      .valid('excellent', 'good', 'fair', 'poor', 'dead')
      .optional(),
    risk_rating: Joi.number().min(0).max(100).optional(),
    address: Joi.string().max(500).optional(),
    property_id: Joi.string().uuid().optional().allow(null),
    zone_id: Joi.string().uuid().optional().allow(null)
  }).min(1), // At least one field required for update

  nearbyQuery: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
    radius: Joi.number().min(1).max(50000).default(100)
  }),

  listQuery: Joi.object({
    property_id: Joi.string().uuid().optional(),
    zone_id: Joi.string().uuid().optional(),
    health_status: Joi.string()
      .valid('excellent', 'good', 'fair', 'poor', 'dead')
      .optional(),
    risk_rating: Joi.number().min(0).max(100).optional(),
    limit: Joi.number().min(1).max(100).default(50),
    offset: Joi.number().min(0).default(0)
  })
};

// ID parameter validation
export const validateUUID = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const schema = Joi.string().uuid().required();
    const { error } = schema.validate(req.params[paramName]);

    if (error) {
      res.status(400).json({
        success: false,
        error: `Invalid ${paramName} format. Must be a valid UUID.`
      });
      return;
    }

    next();
  };
};

// Query parameter validation middleware
export const validateQuery = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: errors
      });
      return;
    }

    // Instead of replacing req.query, merge the validated values
    Object.keys(value).forEach(key => {
      (req.query as any)[key] = value[key];
    });
    
    next();
  };
};