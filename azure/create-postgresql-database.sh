#!/bin/bash
# create-postgresql-flexible.sh

# Variables
RESOURCE_GROUP="rg-arboriq-dev"
SERVER_NAME="arboriq-db-dev"
LOCATION="australiasoutheast"
ADMIN_USER="arboriqadmin"
ADMIN_PASSWORD="Arb0r!Q2025Dev"  # Use your secure password
SKU="Standard_B1ms"  # Burstable, cheapest flexible server option
STORAGE_SIZE=32  # Minimum for flexible server (GB)

echo "Creating PostgreSQL Flexible Server for ArborIQ..."
echo "Using Burstable Standard_B1ms tier (cheapest flexible server option)"

# Show current subscription
echo "Current Azure subscription:"
az account show --output table

read -p "Continue with database creation? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "Cancelled"
    exit 1
fi

# Create PostgreSQL Flexible Server
echo "Creating PostgreSQL Flexible Server (this takes 5-10 minutes)..."
az postgres flexible-server create \
    --resource-group "$RESOURCE_GROUP" \
    --name "$SERVER_NAME" \
    --location "$LOCATION" \
    --admin-user "$ADMIN_USER" \
    --admin-password "$ADMIN_PASSWORD" \
    --sku-name "$SKU" \
    --tier Burstable \
    --version 14 \
    --storage-size $STORAGE_SIZE \
    --database-name arboriq \
    --public-access 0.0.0.0-255.255.255.255 \
    --backup-retention 7 \
    --geo-redundant-backup Disabled

# The flexible-server create command automatically:
# - Creates the database
# - Sets up firewall rules for public access
# - Enables basic extensions

# Add your current IP specifically (for better security)
echo "Adding your current IP to firewall..."
MY_IP=$(curl -s ifconfig.me)
echo "Your IP: $MY_IP"

az postgres flexible-server firewall-rule create \
    --resource-group "$RESOURCE_GROUP" \
    --name "$SERVER_NAME" \
    --rule-name AllowMyIP \
    --start-ip-address "$MY_IP" \
    --end-ip-address "$MY_IP"

# Enable PostGIS extension
echo "Enabling PostGIS extension..."
az postgres flexible-server parameter set \
    --resource-group "$RESOURCE_GROUP" \
    --server-name "$SERVER_NAME" \
    --name azure.extensions \
    --value "POSTGIS"

# Show server details
echo "Getting server details..."
az postgres flexible-server show \
    --resource-group "$RESOURCE_GROUP" \
    --name "$SERVER_NAME" \
    --output table

echo ""
echo "✅ PostgreSQL Flexible Server created successfully!"
echo ""
echo "Connection details:"
echo "==================="
echo "Host: $SERVER_NAME.postgres.database.azure.com"
echo "Port: 5432"
echo "Database: arboriq"
echo "Username: $ADMIN_USER"
echo "Password: $ADMIN_PASSWORD"
echo ""
echo "Connection string for .env file:"
echo "DATABASE_URL=postgresql://$ADMIN_USER:$ADMIN_PASSWORD@$SERVER_NAME.postgres.database.azure.com:5432/arboriq?sslmode=require"
echo ""
echo "IMPORTANT: Save these credentials securely!"
echo ""
echo "Monthly cost estimate: ~\$15-20 USD (Burstable tier)"