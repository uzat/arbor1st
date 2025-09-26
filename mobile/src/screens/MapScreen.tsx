import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { treeService } from '../services/api';
import { styles } from './MapScreen.styles';

interface Tree {
  id: string;
  species: string;
  common_name?: string;
  health_status?: string;
  risk_rating?: number;
  latitude?: number;
  longitude?: number;
}

interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export default function MapScreen({ navigation, route }: any) {
  const mapRef = useRef<MapView>(null);
  const queryClient = useQueryClient();
  
  // Check if we should center on a specific location (from adding a tree)
  const centerOnLocation = route?.params?.centerOnLocation;
  
  const [region, setRegion] = useState<Region>({
    latitude: centerOnLocation?.latitude || -38.1499,
    longitude: centerOnLocation?.longitude || 145.1211,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  
  const [currentBounds, setCurrentBounds] = useState<Bounds | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [allTrees, setAllTrees] = useState<Tree[]>([]);
  const [visibleTrees, setVisibleTrees] = useState<Tree[]>([]);

  // Center map on the new location when navigating from add tree
  useEffect(() => {
    if (centerOnLocation && mapRef.current) {
      const newRegion = {
        latitude: centerOnLocation.latitude,
        longitude: centerOnLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      mapRef.current.animateToRegion(newRegion, 1000);
      setRegion(newRegion);
      
      // Clear the params so it doesn't re-center if user navigates away and back
      navigation.setParams({ centerOnLocation: null });
    }
  }, [centerOnLocation]);

  // Calculate bounds from region
  const calculateBounds = useCallback((region: Region): Bounds => {
    return {
      north: region.latitude + region.latitudeDelta / 2,
      south: region.latitude - region.latitudeDelta / 2,
      east: region.longitude + region.longitudeDelta / 2,
      west: region.longitude - region.longitudeDelta / 2,
    };
  }, []);

  // Check if tree is within bounds - with small buffer for edge cases
  const isTreeInBounds = useCallback((tree: Tree, bounds: Bounds): boolean => {
    if (!tree.latitude || !tree.longitude) return false;
    
    // Add a small buffer (0.0001 degrees ≈ 11 meters) to prevent edge case issues
    const buffer = 0.0001;
    return (
      tree.latitude >= bounds.south - buffer &&
      tree.latitude <= bounds.north + buffer &&
      tree.longitude >= bounds.west - buffer &&
      tree.longitude <= bounds.east + buffer
    );
  }, []);

  // Fetch ALL trees once (or when explicitly refetched)
  const { data: fetchedTrees, isLoading, refetch } = useQuery({
    queryKey: ['trees-map-all'], // Fixed key - no region dependency
    queryFn: async () => {
      // Fetch a larger area or all trees
      // Option 1: Fetch all trees (if reasonable number)
      const response = await treeService.getAll();
      return response.data || [];
      
      // Option 2: If too many trees, fetch a larger fixed area
      // const largeBounds = {
      //   north: -37.5,
      //   south: -39.0,
      //   east: 146.0,
      //   west: 144.5,
      // };
      // const response = await treeService.getInBounds(largeBounds);
      // return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes (v5 uses gcTime instead of cacheTime)
  });

  // Update allTrees when data is fetched
  useEffect(() => {
    if (fetchedTrees && Array.isArray(fetchedTrees)) {
      setAllTrees(fetchedTrees);
    }
  }, [fetchedTrees]);

  // Filter visible trees based on current bounds
  useEffect(() => {
    if (currentBounds && allTrees.length > 0) {
      const treesInView = allTrees.filter(tree => isTreeInBounds(tree, currentBounds));
      setVisibleTrees(treesInView);
      
      // Debug logging - remove after fixing
      console.log('Bounds:', currentBounds);
      console.log('Total trees:', allTrees.length);
      console.log('Visible trees:', treesInView.length);
      if (allTrees.length !== treesInView.length) {
        const hiddenTrees = allTrees.filter(tree => !isTreeInBounds(tree, currentBounds));
        hiddenTrees.forEach(tree => {
          if (tree.latitude && tree.longitude) {
            console.log(`Hidden tree ${tree.id}: ${tree.latitude}, ${tree.longitude}`);
          }
        });
      }
    }
  }, [currentBounds, allTrees, isTreeInBounds]);

  // Get user location on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is needed to show your position');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const userLoc = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setUserLocation(userLoc);
      
      // Center map on user location
      const newRegion = {
        ...userLoc,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      setCurrentBounds(calculateBounds(newRegion));
    })();
  }, [calculateBounds]);

  // Handle map press to add tree
  const handleMapPress = (event: MapPressEvent) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);
    setShowAddModal(true);
  };

  // Go to current location
  const goToUserLocation = async () => {
    setIsLocating(true);
    try {
      const location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      
      mapRef.current?.animateToRegion(newRegion, 1000);
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setRegion(newRegion);
      setCurrentBounds(calculateBounds(newRegion));
    } catch (error) {
      Alert.alert('Error', 'Could not get current location');
    } finally {
      setIsLocating(false);
    }
  };

  // Handle region change - just update bounds for filtering
  const handleRegionChangeComplete = (newRegion: Region) => {
    setRegion(newRegion);
    setCurrentBounds(calculateBounds(newRegion));
  };

  // Get marker color based on health/risk
  const getMarkerColor = (tree: Tree) => {
    if (tree.risk_rating && tree.risk_rating >= 7) return '#f44336'; // High risk - red
    if (tree.risk_rating && tree.risk_rating >= 4) return '#ff9800'; // Medium risk - orange
    if (tree.health_status === 'poor' || tree.health_status === 'dead') return '#9e9e9e'; // Poor health - gray
    if (tree.health_status === 'excellent') return '#4caf50'; // Excellent - green
    return '#2e7d32'; // Default green
  };

  // Navigate to add tree with location
  const handleAddTreeAtLocation = () => {
    setShowAddModal(false);
    if (selectedLocation) {
      navigation.navigate('AddTreeFromMap', {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        returnTo: 'Map'
      });
    }
  };

  // Manual refresh function
  const handleRefresh = async () => {
    // Invalidate and refetch - v5 syntax
    await queryClient.invalidateQueries({ queryKey: ['trees-map-all'] });
    refetch();
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChangeComplete}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
      >
        {/* Tree markers - use visibleTrees for performance */}
        {visibleTrees.map((tree: Tree) => 
          tree.latitude && tree.longitude ? (
            <Marker
              key={tree.id}
              coordinate={{
                latitude: tree.latitude,
                longitude: tree.longitude,
              }}
              title={tree.species}
              description={`Health: ${tree.health_status || 'Unknown'} | Risk: ${tree.risk_rating || 0}`}
              pinColor={getMarkerColor(tree)}
              onCalloutPress={() => navigation.navigate('TreeDetail', { treeId: tree.id })}
              tracksViewChanges={false} // Performance optimization
            />
          ) : null
        )}

        {/* Selected location marker */}
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            title="New Tree Location"
            description="Tap to add tree here"
            pinColor="#2196f3"
          />
        )}
      </MapView>

      {/* Map controls */}
      <View style={styles.controls}>
        {/* Tree count - now shows both visible and total */}
        <View style={styles.treeCount}>
          <Text style={styles.treeCountText}>
            {isLoading ? 'Loading...' : `${visibleTrees.length} trees in view (${allTrees.length} total)`}
          </Text>
        </View>

        {/* Location button */}
        <TouchableOpacity
          style={styles.locationButton}
          onPress={goToUserLocation}
          disabled={isLocating}
        >
          {isLocating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons name="locate" size={24} color="#fff" />
          )}
        </TouchableOpacity>

        {/* Refresh button */}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>Tap on map to add a tree</Text>
      </View>

      {/* Add Tree Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Tree Here?</Text>
            <Text style={styles.modalText}>
              Location: {selectedLocation?.latitude.toFixed(6)}, {selectedLocation?.longitude.toFixed(6)}
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleAddTreeAtLocation}
              >
                <Text style={[styles.buttonText, styles.addButtonText]}>Add Tree</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}