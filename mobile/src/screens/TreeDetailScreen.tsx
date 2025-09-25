import React from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { treeService } from '../services/api';

export default function TreeDetailScreen({ route, navigation }: any) {
  const { treeId } = route.params;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tree', treeId],
    queryFn: () => treeService.getById(treeId),
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Loading tree details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load tree details</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const tree = data?.data;

  if (!tree) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Tree not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Species:</Text>
          <Text style={styles.value}>{tree.species || 'Unknown'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Common Name:</Text>
          <Text style={styles.value}>{tree.common_name || '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Cultivar:</Text>
          <Text style={styles.value}>{tree.cultivar || '-'}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Measurements</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Height:</Text>
          <Text style={styles.value}>{tree.height_m ? `${tree.height_m}m` : '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>DBH:</Text>
          <Text style={styles.value}>{tree.dbh_cm ? `${tree.dbh_cm}cm` : '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Canopy Spread:</Text>
          <Text style={styles.value}>{tree.canopy_spread_m ? `${tree.canopy_spread_m}m` : '-'}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Health & Risk</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Health Status:</Text>
          <Text style={[styles.value, styles.healthStatus, 
            { color: tree.health_status === 'good' ? '#4caf50' : 
                     tree.health_status === 'fair' ? '#ff9800' : '#f44336' }]}>
            {tree.health_status || 'Unknown'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Risk Rating:</Text>
          <Text style={[styles.value, 
            { color: tree.risk_rating > 50 ? '#f44336' : 
                     tree.risk_rating > 25 ? '#ff9800' : '#4caf50' }]}>
            {tree.risk_rating || 0}/100
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Identification</Text>
        <View style={styles.row}>
          <Text style={styles.label}>QR Code:</Text>
          <Text style={styles.value}>{tree.qr_code || 'Not assigned'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>NFC Tag:</Text>
          <Text style={styles.value}>{tree.nfc_tag || 'Not assigned'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Reference ID:</Text>
          <Text style={styles.value}>{tree.reference_id || '-'}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Location</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{tree.address || 'Not specified'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Coordinates:</Text>
          <Text style={styles.value}>
            {tree.latitude && tree.longitude 
              ? `${tree.latitude.toFixed(6)}, ${tree.longitude.toFixed(6)}`
              : 'Not recorded'}
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.buttonText}>Edit Tree</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.inspectButton}>
          <Text style={styles.buttonText}>New Inspection</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 1.5,
    textAlign: 'right',
  },
  healthStatus: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 20,
    marginBottom: 40,
  },
  editButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 5,
  },
  inspectButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
