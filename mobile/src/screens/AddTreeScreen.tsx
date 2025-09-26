import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AxiosError } from 'axios';
import * as Location from 'expo-location';
import { treeService } from '../services/api';

// Navigation types
type RootStackParamList = {
  Trees: undefined;
  TreeDetail: { treeId: string };
  AddTree: { location?: { latitude: number; longitude: number } };
  Map: undefined;
  AddTreeFromMap: { latitude: number; longitude: number; returnTo: string };
};

type AddTreeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type AddTreeScreenRouteProp = RouteProp<RootStackParamList, 'AddTree'> | RouteProp<RootStackParamList, 'AddTreeFromMap'>;

export default function AddTreeScreen() {
  const navigation = useNavigation<AddTreeScreenNavigationProp>();
  const route = useRoute<AddTreeScreenRouteProp>();
  
  // Get location from params - handle both route types
  let paramLocation: { latitude: number; longitude: number } | null = null;
  
  if (route.params) {
    if ('location' in route.params && route.params.location) {
      // Coming from AddTree route with optional location
      paramLocation = route.params.location;
    } else if ('latitude' in route.params && 'longitude' in route.params) {
      // Coming from AddTreeFromMap route with direct coordinates
      paramLocation = {
        latitude: route.params.latitude,
        longitude: route.params.longitude,
      };
    }
  }
  
  const [species, setSpecies] = useState('');
  const [cultivar, setCultivar] = useState('');
  const [height, setHeight] = useState('');
  const [dbh, setDbh] = useState('');
  const [healthStatus, setHealthStatus] = useState('good');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(paramLocation);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdTreeId, setCreatedTreeId] = useState<string | null>(null);

  // Update location when params change
  useEffect(() => {
    if (paramLocation) {
      setLocation(paramLocation);
    }
  }, []);

  const validateForm = () => {
    if (!species.trim()) {
      Alert.alert('Validation Error', 'Species is required');
      return false;
    }
    if (!height || isNaN(parseFloat(height)) || parseFloat(height) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid height');
      return false;
    }
    if (!dbh || isNaN(parseFloat(dbh)) || parseFloat(dbh) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid DBH');
      return false;
    }
    if (!location) {
      Alert.alert('Validation Error', 'Please set the tree location');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const treeData = {
        species: species.trim(),
        cultivar: cultivar.trim() || null,
        height: parseFloat(height),
        dbh: parseFloat(dbh),
        health_status: healthStatus,
        location: {
          latitude: location!.latitude,
          longitude: location!.longitude,
        },
        notes: notes.trim() || null,
      };

      const response = await treeService.create(treeData);
      
      // Fix: response.data.id instead of response.id
      setCreatedTreeId(response.data.id);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating tree:', error);
      const axiosError = error as AxiosError<{ message?: string; error?: string }>;
      
      // Check if it's an auth error
      if (axiosError.response?.status === 401) {
        Alert.alert(
          'Session Expired',
          'Please log in again to continue.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error',
          axiosError.response?.data?.message || 
          axiosError.response?.data?.error || 
          'Failed to create tree'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessAction = (action: 'view' | 'map' | 'another' | 'list') => {
    setShowSuccessModal(false);
    
    switch(action) {
      case 'view':
        if (createdTreeId) {
          navigation.navigate('TreeDetail', { treeId: createdTreeId });
        }
        break;
      case 'map':
        // Navigate to Map tab
        navigation.navigate('Map');
        break;
      case 'another':
        // Reset form
        setSpecies('');
        setCultivar('');
        setHeight('');
        setDbh('');
        setHealthStatus('good');
        setNotes('');
        setCreatedTreeId(null);
        // Keep location if it was from map
        if (!paramLocation) {
          setLocation(null);
        }
        break;
      case 'list':
        // Navigate to Trees tab
        navigation.navigate('Trees');
        break;
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <MaterialIcons name="park" size={32} color="#10b981" />
          <Text style={styles.title}>Add New Tree</Text>
        </View>

        <View style={styles.form}>
          {/* Species Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Species (Scientific Name) *</Text>
            <TextInput
              style={styles.input}
              value={species}
              onChangeText={setSpecies}
              placeholder="e.g., Eucalyptus camaldulensis"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Cultivar/Common Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Common Name / Cultivar</Text>
            <TextInput
              style={styles.input}
              value={cultivar}
              onChangeText={setCultivar}
              placeholder="e.g., River Red Gum"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Measurements Row */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Height (m) *</Text>
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                placeholder="0.0"
                keyboardType="decimal-pad"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={[styles.inputGroup, styles.flex1, styles.ml10]}>
              <Text style={styles.label}>DBH (cm) *</Text>
              <TextInput
                style={styles.input}
                value={dbh}
                onChangeText={setDbh}
                placeholder="0.0"
                keyboardType="decimal-pad"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          {/* Health Status */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Health Status</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={healthStatus}
                onValueChange={setHealthStatus}
                style={styles.picker}
              >
                <Picker.Item label="Excellent" value="excellent" />
                <Picker.Item label="Good" value="good" />
                <Picker.Item label="Fair" value="fair" />
                <Picker.Item label="Poor" value="poor" />
                <Picker.Item label="Dead" value="dead" />
              </Picker>
            </View>
          </View>

          {/* Location Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            
            {location && (
              <View style={styles.locationIndicator}>
                <MaterialIcons name="location-on" size={20} color="#10b981" />
                <Text style={styles.locationText}>
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </Text>
              </View>
            )}
            
            <TouchableOpacity
              style={styles.locationButton}
              onPress={async () => {
                try {
                  // Request permissions
                  let { status } = await Location.requestForegroundPermissionsAsync();
                  if (status !== 'granted') {
                    Alert.alert('Permission Denied', 'Location permission is required');
                    return;
                  }

                  // Get current location
                  Alert.alert('Getting Location', 'Fetching your current position...');
                  const currentLocation = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                  });

                  // Update form
                  setLocation({
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude,
                  });
                  
                  Alert.alert('Success', 'Location updated');
                } catch (error) {
                  Alert.alert('Error', 'Could not get current location');
                  console.error('Location error:', error);
                }
              }}
            >
              <MaterialIcons name="my-location" size={20} color="#fff" />
              <Text style={styles.locationButtonText}>Use My Current Location</Text>
            </TouchableOpacity>
          </View>

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional observations..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <MaterialIcons name="save" size={24} color="#fff" />
            <Text style={styles.submitButtonText}>
              {loading ? 'Creating...' : 'Create Tree'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialIcons name="check-circle" size={60} color="#10b981" />
            <Text style={styles.modalTitle}>Tree Created!</Text>
            <Text style={styles.modalMessage}>
              What would you like to do next?
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.primaryButton]}
                onPress={() => handleSuccessAction('view')}
              >
                <Text style={styles.primaryButtonText}>View Details</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.secondaryButton]}
                onPress={() => handleSuccessAction('map')}
              >
                <Text style={styles.secondaryButtonText}>Show on Map</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.secondaryButton]}
                onPress={() => handleSuccessAction('another')}
              >
                <Text style={styles.secondaryButtonText}>Add Another</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.textButton]}
                onPress={() => handleSuccessAction('list')}
              >
                <Text style={styles.textButtonText}>Back to List</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#1f2937',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  ml10: {
    marginLeft: 10,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: Platform.OS === 'ios' ? 150 : 50,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#374151',
  },
  locationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  locationText: {
    marginLeft: 8,
    color: '#065f46',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  locationButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#1f2937',
  },
  modalMessage: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    width: '100%',
  },
  modalButton: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#10b981',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  textButton: {
    backgroundColor: 'transparent',
  },
  textButtonText: {
    color: '#6b7280',
    fontSize: 16,
  },
});