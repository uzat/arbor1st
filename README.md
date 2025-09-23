🌳 ArborIQ Project Overview (Full Production Specification)

Working Title: ArborIQ (alt. Arbor1st)
Domain: Arborist tools for tree monitoring, diagnostics, and risk management
Deployment Region: Starting on the Mornington Peninsula, scalable nationally
Parent Portfolio: TechSpring

🎯 Product Vision

ArborIQ provides arborists, councils, and land managers with a complete, production-grade platform for tree inventory, diagnostics, and proactive risk management. It integrates field capture, AI-powered health analysis, geospatial boundaries, weather-driven risk forecasting, drone/NDVI inputs, and planning/development impact tools into a single, reliable system.

The guiding principle: build once, build properly — robust engineering, defensible data, and scalable architecture.

📌 Core Use Cases
1. Tree Inventory & Inspections

Create tree records with GPS, QR/NFC, photos, structured inspections.

Species suggestion via iNaturalist + Atlas of Living Australia (ALA).

Health advisory via Plant.id.

Record condition, defects, risk rating, recommended works.

Full inspection history with audit trail.

2. Geo-Fenced Property Boundaries

Define boundaries by drawing or importing polygons.

Auto-associate all trees inside a boundary.

Subdivide into operational zones (campground, schoolyard).

Property-specific reports and exports.

3. Predictive Risk Forecasting

Cross-check inspection risk data against BOM weather forecasts.

Flag vulnerable trees ahead of storms.

Allow exclusion zones around high-risk trees.

Log all risk events for liability defensibility.

4. Planning & Development Impact

Draw or upload proposed development footprints.

Identify impacted trees, including heritage-listed.

Generate AS 4970–2009 compliant reports.

Track approvals, permits, removals.

5. Drone Inspections & NDVI

Upload drone imagery/video for inspection records.

Ingest NDVI raster data (GeoTIFF).

Overlay NDVI vegetation health maps.

Compute canopy stress indices for dense tree areas.

🛠️ Technology Stack

Mobile

React Native (Expo)

SQLite offline cache

GPS/camera/EXIF capture

QR/NFC tagging

Web Console

React (Next.js)

Mapbox GL JS (primary maps)

MapLibre fallback

Nearmap overlays

Backend

Node.js (Express/Fastify)

PostgreSQL + PostGIS

Azure Blob Storage for media

API-first design

AI/APIs

iNaturalist + ALA (species ID)

Plant.id (health)

BOM Weather API (forecasts)

NDVI ingestion pipeline

Reporting

Puppeteer for PDF generation

CSV/GeoJSON exports

AS 4970–2009 outputs

Infrastructure

Azure hosting

GitHub Actions CI/CD

Secure auth (OAuth2/JWT)

📊 Tasks Breakdown

Backend & Database: Schema design (Tree, Inspection, WorkOrder, Boundary, RiskAlert, DroneAsset), PostGIS queries, BOM scheduler.

Mobile App: Auth, offline sync, GPS/photo capture, inspection forms, QR/NFC tagging, AI integrations.

Web Console: Map with Mapbox/Nearmap, boundaries, detail popups, risk overlays, exclusion zones, reporting.

Risk Engine: Defects + weather thresholds, overlays, liability logs.

Drone & NDVI: Media ingestion, NDVI GeoTIFF pipeline, vegetation health overlays.

Testing & QA: Unit, integration, E2E, manual pilot, performance and security checks.

🚩 Deliverables

Production backend with PostGIS.

Mobile app with offline capture + AI integration.

Web console with Mapbox/Nearmap and client/public portals.

Predictive risk forecasting engine.

Geo-fencing + exclusion zones.

Drone/NDVI ingestion pipeline.

Compliant reporting outputs (PDF, CSV, GeoJSON).

🧭 Development Sequence

Backend + DB schema + CI/CD.

Mobile app (capture, sync, AI).

Web console (map, boundaries, portals).

Risk engine (BOM integration).

Geo-fencing + exclusion zones.

Drone/NDVI ingestion.

Reporting engine.

QA, security, performance testing.

🔍 Quality Principles

Build for production standards only.

Testing embedded at every stage.

AI outputs logged with confidence + version.

Modular, extensible architecture.

Slower is Faster — understand first, validate always, no guessing.
