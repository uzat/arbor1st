#!/bin/bash
# setup-repo-structure.sh

echo "Setting up ArborIQ repository structure..."

# Make sure we're in the right directory
echo "Current directory: $(pwd)"
echo "This should be your arbor1st project root"
read -p "Is this correct? (y/n): " confirm

if [ "$confirm" != "y" ]; then
    echo "Please navigate to your arbor1st directory first"
    exit 1
fi

# Initialize git if not already done
if [ ! -d .git ]; then
    git init
    git remote add origin https://github.com/uzat/arbor1st.git
else
    echo "Git already initialized"
fi

# Create the project structure
echo "Creating project directories..."
mkdir -p backend/src
mkdir -p backend/tests
mkdir -p mobile/src
mkdir -p mobile/assets
mkdir -p web/src
mkdir -p web/public
mkdir -p docs/architecture
mkdir -p docs/api
mkdir -p infrastructure/azure
mkdir -p infrastructure/scripts

# Move our Azure script to the right place
if [ -f create-resource-groups.sh ]; then
    mv create-resource-groups.sh infrastructure/scripts/
fi

# Create README.md
cat > README.md << 'EOF'
# 🌳 ArborIQ (Arbor1st)

Professional arborist platform for tree monitoring, diagnostics, and risk management.

## Project Overview
ArborIQ provides arborists, councils, and land managers with a complete platform for tree inventory, diagnostics, and proactive risk management.

## Tech Stack
- **Backend**: Node.js, Express, PostgreSQL + PostGIS
- **Mobile**: React Native (Expo)
- **Web**: React (Next.js), Mapbox GL JS
- **Cloud**: Azure (Australia Southeast)

## Project Structure

arbor1st/
├── backend/          # Node.js API server
├── mobile/           # React Native app
├── web/              # Next.js web console
├── docs/             # Documentation
└── infrastructure/   # Azure and deployment scripts


## Getting Started
See [docs/setup.md](docs/setup.md) for development setup instructions.

## Azure Resources
- Resource Group: `rg-arboriq-dev`
- Region: Australia Southeast
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.*.local

# Build outputs
dist/
build/
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Azure
*.azureauth
.azure/

# Mobile
*.expo/
.expo-shared/

# Testing
coverage/
*.lcov
EOF

# Create setup documentation
cat > docs/setup.md << 'EOF'
# Development Setup

## Prerequisites
- Node.js 18+
- Azure CLI
- Git

## Azure Configuration
1. Resource Group: `rg-arboriq-dev`
2. Location: `australiasoutheast`

## Local Development
```bash
# Backend
cd backend
npm install
npm run dev

# Web
cd web
npm install
npm run dev

# Mobile
cd mobile
npm install
npm start

EOF


echo "✅ Repository structure created!"
echo ""
echo "Files created:"
find . -type f -name "*.md" -o -name ".gitignore" | head -10
echo ""
echo "Directories created:"
ls -la

## Step 2: Run the script and commit
```bash
# Run the setup script
bash setup-repo-structure.sh

# Add all files to git
git add .

# Create initial commit
git commit -m "Initial project structure setup"

# Push to GitHub
git push -u origin main
