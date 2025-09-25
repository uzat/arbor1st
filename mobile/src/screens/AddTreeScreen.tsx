import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { treeService } from '../services/api';
import * as Location from 'expo-location';

export default function AddTreeScreen({ navigation, route }: any) {
  const queryClient = useQueryClient();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  // Get location from route params if coming from map
  const passedLocation = route?.params;
  
  // Debug log to see what params we're getting
  console.log('AddTreeScreen params:', passedLocation);
  
  const [formData, setFormData] = useState({
    species: '',
    common_name: '',
    height_m: '',
    dbh_cm: '',
    health_status: 'good',
    risk_rating: '0',
    address: '',
    latitude: passedLocation?.latitude?.toString() || '',
    longitude: passedLocation?.longitude?.toString() || '',
  });

  useEffect(() => {
    // Update location if passed from map
    if (passedLocation?.latitude && passedLocation?.longitude) {
      setFormData(prev => ({
        ...prev,
        latitude: passedLocation.latitude.toString(),
        longitude: passedLocation.longitude.toString(),
      }));
    }
  }, [passedLocation]);

  const createTreeMutation = useMutation({
    mutationFn: (data: any) => treeService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['trees'] });
      queryClient.invalidateQueries({ queryKey: ['trees-map'] });
      
      // Extract the new tree's coordinates
      const newTreeLat = response?.data?.latitude || parseFloat(formData.latitude);
      const newTreeLng = response?.data?.longitude || parseFloat(formData.longitude);
      
      Alert.alert(
        'Success',
        'Tree added successfully!',
        [
          {
            text: 'Add Another',
            onPress: () => {
              // Reset form but keep location if from map
              setFormData({
                species: '',
                common_name: '',
                height_m: '',
                dbh_cm: '',
                health_status: 'good',
                risk_rating: '0',
                address: '',
                latitude: passedLocation?.latitude?.toString() || '',
                longitude: passedLocation?.longitude?.toString() || '',
              });
            },
          },
          {
            text: 'View on Map',
            onPress: () => {
              // Navigate to map with the new tree's location
              navigation.navigate('MainTabs', { 
                screen: 'Map',
                params: {
                  centerOnLocation: {
                    latitude: newTreeLat,
                    longitude: newTreeLng
                  }
                }
              });
            },
          },
          {
            text: 'View Details',
            onPress: () => {
              // Navigate to the newly created tree's detail page
              if (response?.data?.id) {
                navigation.navigate('TreeDetail', { treeId: response.data.id });
              } else {
                navigation.navigate('MainTabs', { screen: 'Trees' });
              }
            },
            style: 'cancel', // Makes this the bold/default option
          },
        ],
        { cancelable: false }
      );
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to add tree');
    },
  });

  // Get current GPS location
  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to get your current position');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setFormData(prev => ({
        ...prev,
        latitude: location.coords.latitude.toString(),
        longitude: location.coords.longitude.toString(),
      }));

      Alert.alert('Success', 'Current location set!');
    } catch (error) {
      Alert.alert('Error', 'Could not get current location. Please enter manually.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.species.trim()) {
      Alert.alert('Validation Error', 'Species is required');
      return;
    }

    // Prepare data
    const treeData: any = {
      species: formData.species.trim(),
      common_name: formData.common_name.trim() || undefined,
      height_m: formData.height_m ? parseFloat(formData.height_m) : undefined,
      dbh_cm: formData.dbh_cm ? parseFloat(formData.dbh_cm) : undefined,
      health_status: formData.health_status,
      risk_rating: parseInt(formData.risk_rating),
      address: formData.address.trim() || undefined,
    };

    // Add location if provided
    if (formData.latitude && formData.longitude) {
      treeData.latitude = parseFloat(formData.latitude);
      treeData.longitude = parseFloat(formData.longitude);
    }

    createTreeMutation.mutate(treeData);
  };

  const isSubmitting = createTreeMutation.isPending;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          {/* Location indicator if from map */}
          {formData.latitude && formData.longitude && (
            <View style={styles.locationCard}>
              <View style={styles.locationText}>
                <Text style={styles.locationTitle}>📍 Location Set</Text>
                <Text style={styles.locationCoords}>
                  {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Species *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Eucalyptus camaldulensis"
              value={formData.species}
              onChangeText={(text) => setFormData({ ...formData, species: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Common Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., River Red Gum"
              value={formData.common_name}
              onChangeText={(text) => setFormData({ ...formData, common_name: text })}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Height (m)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 15"
                value={formData.height_m}
                onChangeText={(text) => setFormData({ ...formData, height_m: text })}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>DBH (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 60"
                value={formData.dbh_cm}
                onChangeText={(text) => setFormData({ ...formData, dbh_cm: text })}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Health Status</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.health_status}
                onValueChange={(value) => setFormData({ ...formData, health_status: value })}
              >
                <Picker.Item label="Excellent" value="excellent" />
                <Picker.Item label="Good" value="good" />
                <Picker.Item label="Fair" value="fair" />
                <Picker.Item label="Poor" value="poor" />
                <Picker.Item label="Dead" value="dead" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Risk Rating (0-10)</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={formData.risk_rating}
              onChangeText={(text) => setFormData({ ...formData, risk_rating: text })}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address/Location Description</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Main Street Park"
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
            />
          </View>

          {/* Manual coordinates if not from map */}
          {!passedLocation && (
            <>
              <View style={styles.separator} />
              <Text style={styles.sectionTitle}>GPS Coordinates (Optional)</Text>
              
              <TouchableOpacity
                style={[styles.locationButton, isGettingLocation && styles.disabledButton]}
                onPress={getCurrentLocation}
                disabled={isGettingLocation}
              >
                {isGettingLocation ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.locationButtonText}>📍 Use Current Location</Text>
                )}
              </TouchableOpacity>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Latitude</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="-38.1499"
                    value={formData.latitude}
                    onChangeText={(text) => setFormData({ ...formData, latitude: text })}
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Longitude</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="145.1211"
                    value={formData.longitude}
                    onChangeText={(text) => setFormData({ ...formData, longitude: text })}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Adding Tree...' : 'Add Tree'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  form: {
    padding: 20,
    paddingBottom: 40,
  },
  locationCard: {
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2e7d32',
  },
  locationText: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
  },
  locationCoords: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    height: Platform.OS === 'ios' ? 180 : 50,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -5,
  },
  halfWidth: {
    flex: 1,
    marginHorizontal: 5,
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  locationButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  locationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
});