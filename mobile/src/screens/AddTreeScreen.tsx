import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AxiosError } from 'axios';
import * as Location from 'expo-location';
import { treeService } from '../services/api';
import { CameraService } from '../services/camera.service';
import { styles } from './AddTreeScreen.styles';

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

// Simulated progressive identification (will be replaced with real API)
interface IdentificationProgress {
  level: 'kingdom' | 'class' | 'order' | 'family' | 'genus' | 'species';
  name: string;
  commonName?: string;
  confidence: number;
}

export default function AddTreeScreen() {
  const navigation = useNavigation<AddTreeScreenNavigationProp>();
  const route = useRoute<AddTreeScreenRouteProp>();
  
  // Get location from params - handle both route types
  let paramLocation: { latitude: number; longitude: number } | null = null;
  
  if (route.params) {
    if ('location' in route.params && route.params.location) {
      paramLocation = route.params.location;
    } else if ('latitude' in route.params && 'longitude' in route.params) {
      paramLocation = {
        latitude: route.params.latitude,
        longitude: route.params.longitude,
      };
    }
  }
  
  // Form state
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
  
  // Camera state
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [identifying, setIdentifying] = useState(false);
  const [identificationProgress, setIdentificationProgress] = useState<IdentificationProgress[]>([]);

  // Update location when params change
  useEffect(() => {
    if (paramLocation) {
      setLocation(paramLocation);
    }
  }, []);

  const handleTakePhoto = async () => {
    const result = await CameraService.takePhoto(true); // Include base64 for identification
    if (result) {
      setPhotoUri(result.uri);
      setIdentificationProgress([]); // Clear any previous identification
    }
  };

  const handlePickPhoto = async () => {
    const result = await CameraService.pickPhoto(true); // Include base64 for identification
    if (result) {
      setPhotoUri(result.uri);
      setIdentificationProgress([]); // Clear any previous identification
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUri(null);
    setIdentificationProgress([]);
  };

  const handleIdentifySpecies = async () => {
    if (!photoUri) return;
    
    setIdentifying(true);
    setIdentificationProgress([]);
    
    // Simulate progressive identification
    // In real implementation, this will call actual APIs
    try {
      // Simulate API calls with delays
      await new Promise(resolve => setTimeout(resolve, 500));
      setIdentificationProgress([
        { level: 'kingdom', name: 'Plantae', confidence: 100 }
      ]);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setIdentificationProgress(prev => [...prev,
        { level: 'class', name: 'Magnoliopsida', commonName: 'Flowering plants', confidence: 95 }
      ]);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setIdentificationProgress(prev => [...prev,
        { level: 'family', name: 'Myrtaceae', commonName: 'Myrtle family', confidence: 87 }
      ]);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setIdentificationProgress(prev => [...prev,
        { level: 'genus', name: 'Eucalyptus', confidence: 82 }
      ]);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setIdentificationProgress(prev => [...prev,
        { level: 'species', name: 'Eucalyptus camaldulensis', commonName: 'River Red Gum', confidence: 78 }
      ]);
      
      // If offline, queue for later
      if (!navigator.onLine) {
        await CameraService.queueIdentification(photoUri, location || undefined);
        Alert.alert('Queued', 'Species identification will complete when online');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to identify species');
    } finally {
      setIdentifying(false);
    }
  };

  const acceptIdentification = (progress: IdentificationProgress) => {
    if (progress.level === 'species' || progress.level === 'genus') {
      setSpecies(progress.name);
      if (progress.commonName) {
        setCultivar(progress.commonName);
      }
    }
  };

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
      
      setCreatedTreeId(response.data.id);
      
      // TODO: Upload photo if exists
      // if (photoUri && response.data.id) {
      //   await treeService.uploadPhoto(response.data.id, photoUri);
      // }
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating tree:', error);
      const axiosError = error as AxiosError<{ message?: string; error?: string }>;
      
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
        setPhotoUri(null);
        setIdentificationProgress([]);
        setCreatedTreeId(null);
        if (!paramLocation) {
          setLocation(null);
        }
        break;
      case 'list':
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
          {/* Photo Section */}
          <View style={styles.photoSection}>
            <Text style={styles.sectionTitle}>Tree Photo</Text>
            
            {!photoUri ? (
              <View style={styles.photoButtons}>
                <TouchableOpacity
                  style={styles.photoButton}
                  onPress={handleTakePhoto}
                >
                  <MaterialIcons name="camera-alt" size={20} color="#fff" />
                  <Text style={styles.photoButtonText}>Take Photo</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.photoButton}
                  onPress={handlePickPhoto}
                >
                  <MaterialIcons name="photo-library" size={20} color="#fff" />
                  <Text style={styles.photoButtonText}>Gallery</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoPreview}>
                <Image source={{ uri: photoUri }} style={styles.photo} />
                <View style={styles.photoActions}>
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={handleRemovePhoto}
                  >
                    <Text style={styles.primaryButtonText}>Remove</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.identifyButton}
                    onPress={handleIdentifySpecies}
                    disabled={identifying}
                  >
                    {identifying ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="leaf" size={16} color="#fff" />
                        <Text style={styles.identifyButtonText}>Identify Species</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
                
                {/* Progressive Identification Display */}
                {identificationProgress.length > 0 && (
                  <View style={styles.identificationProgress}>
                    <Text style={styles.progressTitle}>
                      {identifying ? 'Identifying...' : 'Identification Results'}
                    </Text>
                    {identificationProgress.map((item, index) => (
                      <View key={index} style={styles.progressItem}>
                        <Ionicons 
                          name={item.level === 'species' ? 'checkmark-circle' : 'arrow-forward'} 
                          size={16} 
                          color={item.level === 'species' ? '#10b981' : '#6366f1'}
                          style={styles.progressIcon}
                        />
                        <Text style={styles.progressText}>
                          {item.commonName ? `${item.commonName} (${item.name})` : item.name}
                        </Text>
                        <Text style={styles.confidenceText}>
                          {item.confidence}%
                        </Text>
                        {(item.level === 'species' || item.level === 'genus') && (
                          <TouchableOpacity
                            style={styles.acceptButton}
                            onPress={() => acceptIdentification(item)}
                          >
                            <Text style={styles.acceptButtonText}>Use</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>

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
                  let { status } = await Location.requestForegroundPermissionsAsync();
                  if (status !== 'granted') {
                    Alert.alert('Permission Denied', 'Location permission is required');
                    return;
                  }

                  Alert.alert('Getting Location', 'Fetching your current position...');
                  const currentLocation = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                  });

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