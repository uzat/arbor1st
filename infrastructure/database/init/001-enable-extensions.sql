-- Enable PostGIS and related extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS uuid-ossp;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Verify PostGIS installation
DO $$
BEGIN
    RAISE NOTICE 'PostGIS Version: %', PostGIS_Version();
END
$$;
