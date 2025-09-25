import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { treeService } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

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

  const getHealthColor = (health: string) => {
    switch(health?.toLowerCase()) {
      case 'excellent': return '#4caf50';
      case 'good': return '#8bc34a';
      case 'fair': return '#ffc107';
      case 'poor': return '#ff9800';
      case 'critical': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 8) return '#f44336';
    if (risk >= 6) return '#ff9800';
    if (risk >= 4) return '#ffc107';
    if (risk >= 2) return '#8bc34a';
    return '#4caf50';
  };

  return (
    <SafeAreaView style={styles.container}>
      {trees.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 80, marginBottom: 20 }}>🌳</Text>
          <Text style={styles.emptyText}>No trees found</Text>
          <Text style={styles.emptySubtext}>Start by adding your first tree</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('AddTree')}
          >
            <Text style={{ fontSize: 20, marginRight: 8 }}>➕🌳</Text>
            <Text style={styles.addButtonText}>Add First Tree</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.listContainer}>
          <FlatList
            data={trees}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.treeCard}
                onPress={() => navigation.navigate('TreeDetail', { treeId: item.id })}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <Text style={{ fontSize: 24, marginRight: 8 }}>🌳</Text>
                    <Text style={styles.treeSpecies}>{item.species || 'Unknown Species'}</Text>
                  </View>
                  {item.risk_rating > 0 && (
                    <View style={[styles.riskBadge, { backgroundColor: getRiskColor(item.risk_rating) }]}>
                      <Text style={styles.riskBadgeText}>{item.risk_rating}</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.cardBody}>
                  <View style={styles.infoRow}>
                    <Ionicons name="pricetag-outline" size={16} color="#666" />
                    <Text style={styles.treeInfo}>
                      {item.qr_code || item.nfc_tag || 'No tag assigned'}
                    </Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Ionicons name="resize-outline" size={16} color="#666" />
                    <Text style={styles.treeInfo}>
                      Height: {item.height_m || '-'}m | DBH: {item.dbh_cm || '-'}cm
                    </Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Ionicons name="heart-outline" size={16} color={getHealthColor(item.health_status)} />
                    <Text style={[styles.treeHealth, { color: getHealthColor(item.health_status) }]}>
                      {item.health_status || 'Health Unknown'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            refreshing={isLoading}
            onRefresh={() => refetch()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    flex: 1,
    position: 'relative',
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
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20, // Reduced since no FAB
    paddingTop: 8,
  },
  treeCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  treeSpecies: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  cardBody: {
    marginLeft: 32, // Indent under icon
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  treeInfo: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  treeHealth: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  riskBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  riskBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});