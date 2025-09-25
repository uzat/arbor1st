import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { treeService } from '../services/api';

interface Tree {
  id: string;
  species: string;
  common_name?: string;
  health_status?: string;
  risk_rating?: number;
  latitude?: number;
  longitude?: number;
}

export default function MapScreen({ navigation, route }: any) {
  const mapRef = useRef<MapView>(null);
  const queryClient = useQueryClient();
  
  // Check if we should center on a specific location (from adding a tree)
  const centerOnLocation = route?.params?.centerOnLocation;
  
  const [region, setRegion] = useState<Region>({
    latitude: centerOnLocation?.latitude || -38.1499,  // Use passed location or default
    longitude: centerOnLocation?.longitude || 145.1211,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

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

  // Fetch trees in current map bounds
  const { data: trees, isLoading, refetch } = useQuery({
    queryKey: ['trees-map', region],
    queryFn: async () => {
      const bounds = {
        north: region.latitude + region.latitudeDelta / 2,
        south: region.latitude - region.latitudeDelta / 2,
        east: region.longitude + region.longitudeDelta / 2,
        west: region.longitude - region.longitudeDelta / 2,
      };
      
      const response = await treeService.getInBounds(bounds);
      return response.data || [];
    },
    enabled: true,
  });

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
      setRegion({
        ...userLoc,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

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
    } catch (error) {
      Alert.alert('Error', 'Could not get current location');
    } finally {
      setIsLocating(false);
    }
  };

  // Handle region change
  const handleRegionChangeComplete = (newRegion: Region) => {
    setRegion(newRegion);
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
      // Navigate to the stack screen, not the tab
      navigation.navigate('AddTreeFromMap', {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        returnTo: 'Map'
      });
    }
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
        {/* Tree markers */}
        {trees?.map((tree: Tree) => 
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
        {/* Tree count */}
        <View style={styles.treeCount}>
          <Text style={styles.treeCountText}>
            {isLoading ? 'Loading...' : `${trees?.length || 0} trees in view`}
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
          onPress={() => refetch()}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    right: 16,
    top: 50,
    gap: 10,
  },
  locationButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  refreshButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2196f3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  treeCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 3,
  },
  treeCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  instructions: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: 'rgba(46, 125, 50, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  instructionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  addButton: {
    backgroundColor: '#2e7d32',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  addButtonText: {
    color: '#fff',
  },
});