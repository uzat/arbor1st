import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { treeService } from '../services/api';

export default function TreeListScreen({ navigation }: any) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['trees'],
    queryFn: () => treeService.getAll(),
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Loading trees...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load trees</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const trees = data?.data || [];

  return (
    <View style={styles.container}>
      {trees.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No trees found</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('AddTree')}
          >
            <Text style={styles.addButtonText}>Add First Tree</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={trees}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.treeCard}
                onPress={() => navigation.navigate('TreeDetail', { treeId: item.id })}
              >
                <Text style={styles.treeSpecies}>{item.species || 'Unknown Species'}</Text>
                <Text style={styles.treeInfo}>
                  Tag: {item.qr_code || item.nfc_tag || 'No tag'}
                </Text>
                <Text style={styles.treeInfo}>
                  Height: {item.height_m || '-'}m | DBH: {item.dbh_cm || '-'}cm
                </Text>
                <Text style={styles.treeHealth}>
                  Health: {item.health_status || 'Unknown'}
                </Text>
                {item.risk_rating > 0 && (
                  <Text style={styles.riskRating}>
                    Risk Rating: {item.risk_rating}
                  </Text>
                )}
              </TouchableOpacity>
            )}
            refreshing={isLoading}
            onRefresh={() => refetch()}
            contentContainerStyle={{ paddingBottom: 80 }}
          />
          <TouchableOpacity 
            style={styles.fab}
            onPress={() => navigation.navigate('AddTree')}
          >
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
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
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  treeCard: {
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
  treeSpecies: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 5,
  },
  treeInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  treeHealth: {
    fontSize: 14,
    color: '#4caf50',
    marginTop: 5,
  },
  riskRating: {
    fontSize: 14,
    color: '#ff9800',
    marginTop: 3,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  fabText: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
});
