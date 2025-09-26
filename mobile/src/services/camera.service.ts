import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ImageResult {
  uri: string;
  base64?: string;
  width: number;
  height: number;
}

interface PendingIdentification {
  id: string;
  treeId?: string;
  imageUri: string;
  location?: { latitude: number; longitude: number };
  timestamp: Date;
  mode: 'professional' | 'economy';
  status: 'pending' | 'processing' | 'complete' | 'failed';
  result?: any;
}

export class CameraService {
  // Request camera permissions
  static async requestCameraPermissions(): Promise<boolean> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera permission is needed to take photos of trees.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  }

  // Request gallery permissions
  static async requestGalleryPermissions(): Promise<boolean> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Gallery access is needed to select photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  }

  // Take a photo with the camera
  static async takePhoto(includeBase64: boolean = false): Promise<ImageResult | null> {
    const hasPermission = await this.requestCameraPermissions();
    if (!hasPermission) return null;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        base64: includeBase64,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          base64: asset.base64 || undefined,
          width: asset.width,
          height: asset.height,
        };
      }
      return null;
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
      return null;
    }
  }

  // Pick a photo from gallery
  static async pickPhoto(includeBase64: boolean = false): Promise<ImageResult | null> {
    const hasPermission = await this.requestGalleryPermissions();
    if (!hasPermission) return null;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        base64: includeBase64,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          base64: asset.base64 || undefined,
          width: asset.width,
          height: asset.height,
        };
      }
      return null;
    } catch (error) {
      console.error('Error picking photo:', error);
      Alert.alert('Error', 'Failed to select photo');
      return null;
    }
  }

  // Save pending identification for offline processing
  static async queueIdentification(
    imageUri: string,
    location?: { latitude: number; longitude: number },
    treeId?: string
  ): Promise<string> {
    try {
      const id = `pending_${Date.now()}`;
      const pendingItem: PendingIdentification = {
        id,
        treeId,
        imageUri,
        location,
        timestamp: new Date(),
        mode: await this.getIdentificationMode(),
        status: 'pending',
      };

      // Get existing queue
      const queueJson = await AsyncStorage.getItem('pendingIdentifications');
      const queue = queueJson ? JSON.parse(queueJson) : [];
      
      // Add new item
      queue.push(pendingItem);
      
      // Save updated queue
      await AsyncStorage.setItem('pendingIdentifications', JSON.stringify(queue));
      
      return id;
    } catch (error) {
      console.error('Error queuing identification:', error);
      throw error;
    }
  }

  // Get user's identification mode preference
  static async getIdentificationMode(): Promise<'professional' | 'economy'> {
    try {
      const mode = await AsyncStorage.getItem('identificationMode');
      return mode === 'economy' ? 'economy' : 'professional';
    } catch {
      return 'professional'; // Default to professional
    }
  }

  // Set user's identification mode preference
  static async setIdentificationMode(mode: 'professional' | 'economy'): Promise<void> {
    await AsyncStorage.setItem('identificationMode', mode);
  }

  // Get pending identifications (for sync when online)
  static async getPendingIdentifications(): Promise<PendingIdentification[]> {
    try {
      const queueJson = await AsyncStorage.getItem('pendingIdentifications');
      return queueJson ? JSON.parse(queueJson) : [];
    } catch (error) {
      console.error('Error getting pending identifications:', error);
      return [];
    }
  }

  // Update pending identification status
  static async updateIdentificationStatus(
    id: string,
    status: PendingIdentification['status'],
    result?: any
  ): Promise<void> {
    try {
      const queue = await this.getPendingIdentifications();
      const index = queue.findIndex(item => item.id === id);
      
      if (index !== -1) {
        queue[index].status = status;
        if (result) queue[index].result = result;
        await AsyncStorage.setItem('pendingIdentifications', JSON.stringify(queue));
      }
    } catch (error) {
      console.error('Error updating identification status:', error);
    }
  }

  // Remove completed identification from queue
  static async removeFromQueue(id: string): Promise<void> {
    try {
      const queue = await this.getPendingIdentifications();
      const filtered = queue.filter(item => item.id !== id);
      await AsyncStorage.setItem('pendingIdentifications', JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing from queue:', error);
    }
  }
}