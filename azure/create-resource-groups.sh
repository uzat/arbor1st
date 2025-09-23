#!/bin/bash
# create-resource-groups.sh

# Variables - USING YOUR ACTUAL SUBSCRIPTION
SUBSCRIPTION_NAME="Pay-As-You-Go"  # Your actual subscription name
LOCATION="australiasoutheast"
RESOURCE_GROUP_DEV="rg-arboriq-dev"

echo "Creating ArborIQ Development Resource Group..."

# Check if already logged in
echo "Checking Azure login status..."
if az account show &>/dev/null; then
    echo "✓ Already logged in to Azure"
else
    echo "Need to login to Azure..."
    az login
fi

# Set subscription BY NAME (not ID)
echo "Setting subscription to: $SUBSCRIPTION_NAME"
az account set --subscription "$SUBSCRIPTION_NAME"

# Show current subscription to confirm
echo "Current subscription:"
az account show --output table

# Create development resource group
echo "Creating resource group: $RESOURCE_GROUP_DEV in $LOCATION"
az group create \
    --name "$RESOURCE_GROUP_DEV" \
    --location "$LOCATION"

# Add tags for cost tracking and auto-shutdown
echo "Adding tags..."
az group update \
    --name "$RESOURCE_GROUP_DEV" \
    --tags Environment=Development Project=ArborIQ AutoShutdown=true

# Verify creation
echo "Resource group created:"
az group show --name "$RESOURCE_GROUP_DEV" --output table

echo "✅ Resource group creation complete!"