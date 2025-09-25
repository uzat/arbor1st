import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { treeService } from '../services/api';

export default function AddTreeScreen({ navigation }: any) {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    species: '',
    common_name: '',
    height_m: '',
    dbh_cm: '',
    health_status: 'good',
    qr_code: '',
    address: '',
  });

  const createTreeMutation = useMutation({
    mutationFn: (data: any) => treeService.create(data),
    onSuccess: () => {
      // Invalidate and refetch tree list
      queryClient.invalidateQueries({ queryKey: ['trees'] });
      Alert.alert('Success', 'Tree added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Error', 'Failed to add tree. Please try again.');
      console.error('Create tree error:', error);
    },
  });

  const handleSubmit = () => {
    // Basic validation
    if (!formData.species) {
      Alert.alert('Validation Error', 'Species is required');
      return;
    }

    // Convert numeric strings to numbers
    const submitData = {
      ...formData,
      height_m: formData.height_m ? parseFloat(formData.height_m) : null,
      dbh_cm: formData.dbh_cm ? parseFloat(formData.dbh_cm) : null,
    };

    createTreeMutation.mutate(submitData);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Species *</Text>
            <TextInput
              style={styles.input}
              value={formData.species}
              onChangeText={(text) => setFormData({...formData, species: text})}
              placeholder="e.g., Eucalyptus camaldulensis"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Common Name</Text>
            <TextInput
              style={styles.input}
              value={formData.common_name}
              onChangeText={(text) => setFormData({...formData, common_name: text})}
              placeholder="e.g., River Red Gum"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Height (meters)</Text>
            <TextInput
              style={styles.input}
              value={formData.height_m}
              onChangeText={(text) => setFormData({...formData, height_m: text})}
              placeholder="e.g., 15"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>DBH (centimeters)</Text>
            <TextInput
              style={styles.input}
              value={formData.dbh_cm}
              onChangeText={(text) => setFormData({...formData, dbh_cm: text})}
              placeholder="e.g., 45"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Health Status</Text>
            <View style={styles.healthButtons}>
              {['good', 'fair', 'poor', 'dead'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.healthButton,
                    formData.health_status === status && styles.healthButtonActive
                  ]}
                  onPress={() => setFormData({...formData, health_status: status})}
                >
                  <Text style={[
                    styles.healthButtonText,
                    formData.health_status === status && styles.healthButtonTextActive
                  ]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>QR Code</Text>
            <TextInput
              style={styles.input}
              value={formData.qr_code}
              onChangeText={(text) => setFormData({...formData, qr_code: text})}
              placeholder="e.g., TREE-001"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address/Location</Text>
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(text) => setFormData({...formData, address: text})}
              placeholder="e.g., 123 Main St, Park entrance"
              multiline
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, createTreeMutation.isPending && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={createTreeMutation.isPending}
          >
            <Text style={styles.submitButtonText}>
              {createTreeMutation.isPending ? 'Adding Tree...' : 'Add Tree'}
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
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  healthButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  healthButton: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  healthButtonActive: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  healthButtonText: {
    fontSize: 14,
    color: '#666',
  },
  healthButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 100,
    marginBottom: 100,  // Extra space for keyboard
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
