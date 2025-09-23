import db from '../config/database';

export interface Tree {
  id: string;
  species: string;
  common_name?: string;
  cultivar?: string;
  location?: any; // PostGIS point
  latitude?: number;
  longitude?: number;
  height_m?: number;
  dbh_cm?: number;
  canopy_spread_m?: number;
  health_status?: string;
  risk_rating?: number;
  address?: string;
  qr_code?: string;
  nfc_tag?: string;
  reference_id?: string;
  attributes?: any;
  property_id?: string;
  zone_id?: string;
  created_by?: string;
  updated_by?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export interface TreeCreateInput {
  species: string;
  common_name?: string;
  cultivar?: string;
  latitude?: number;
  longitude?: number;
  height_m?: number;
  dbh_cm?: number;
  canopy_spread_m?: number;
  health_status?: string;
  risk_rating?: number;
  address?: string;
  property_id?: string;
  zone_id?: string;
  created_by?: string;  // Made optional
}

class TreeModel {
  private table = 'trees';

  // Get all trees with optional filters
  async findAll(filters: Partial<Tree> = {}): Promise<Tree[]> {
    let query = db(this.table)
      .select('*', 
        db.raw('ST_X(location::geometry) as longitude'),
        db.raw('ST_Y(location::geometry) as latitude')
      )
      .whereNull('deleted_at');

    // Apply filters
    if (filters.property_id) {
      query = query.where('property_id', filters.property_id);
    }
    if (filters.zone_id) {
      query = query.where('zone_id', filters.zone_id);
    }
    if (filters.health_status) {
      query = query.where('health_status', filters.health_status);
    }
    if (filters.risk_rating) {
      query = query.where('risk_rating', '>=', filters.risk_rating);
    }

    return query;
  }

  // Get tree by ID
  async findById(id: string): Promise<Tree | null> {
    const tree = await db(this.table)
      .select('*',
        db.raw('ST_X(location::geometry) as longitude'),
        db.raw('ST_Y(location::geometry) as latitude')
      )
      .where({ id })
      .whereNull('deleted_at')
      .first();
    
    return tree || null;
  }

  // Create new tree
  async create(data: TreeCreateInput): Promise<Tree> {
    const { latitude, longitude, ...treeData } = data;
    
    // Create PostGIS point if coordinates provided
    let location = null;
    if (latitude && longitude) {
      location = db.raw(`ST_SetSRID(ST_MakePoint(?, ?), 4326)`, [longitude, latitude]);
    }

    const [tree] = await db(this.table)
      .insert({
        ...treeData,
        location,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    return tree;
  }

  // Update tree
  async update(id: string, data: Partial<TreeCreateInput>): Promise<Tree | null> {
    const { latitude, longitude, ...updateData } = data;
    
    // Update location if coordinates changed
    if (latitude !== undefined && longitude !== undefined) {
      (updateData as any).location = db.raw(`ST_SetSRID(ST_MakePoint(?, ?), 4326)`, [longitude, latitude]);
    }

    const [tree] = await db(this.table)
      .where({ id })
      .whereNull('deleted_at')
      .update({
        ...updateData,
        updated_at: new Date()
      })
      .returning('*');

    return tree || null;
  }

  // Soft delete tree
  async delete(id: string): Promise<boolean> {
    const count = await db(this.table)
      .where({ id })
      .whereNull('deleted_at')
      .update({
        deleted_at: new Date(),
        updated_at: new Date()
      });

    return count > 0;
  }

  // Find trees within radius (meters) of a point
  async findNearby(latitude: number, longitude: number, radiusMeters: number): Promise<Tree[]> {
    return db(this.table)
      .select('*',
        db.raw('ST_X(location::geometry) as longitude'),
        db.raw('ST_Y(location::geometry) as latitude'),
        db.raw('ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) as distance', [longitude, latitude])
      )
      .whereRaw('ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?)', [longitude, latitude, radiusMeters])
      .whereNull('deleted_at')
      .orderBy('distance');
  }

  // Get trees by risk rating
  async findHighRisk(minRating: number = 70): Promise<Tree[]> {
    return db(this.table)
      .select('*',
        db.raw('ST_X(location::geometry) as longitude'),
        db.raw('ST_Y(location::geometry) as latitude')
      )
      .where('risk_rating', '>=', minRating)
      .whereNull('deleted_at')
      .orderBy('risk_rating', 'desc');
  }
}

export default new TreeModel();