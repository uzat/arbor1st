import Constants from 'expo-constants';
import { Alert } from 'react-native';

// Get the local IP address from Expo's manifest for development
const getApiUrl = () => {
  // In production, use your actual server URL
  if (process.env.NODE_ENV === 'production') {
    return 'https://api.arboriq.com.au/api/v1';
  }
  
  // For development, try to auto-detect from Expo
  // Use the new expoConfig instead of deprecated manifest
  const expoConfig = Constants.expoConfig;
  const manifestExtra = Constants.manifest2?.extra ?? Constants.expoConfig?.extra;
  
  // Try multiple ways to get the host
  const debuggerHost = 
    manifestExtra?.debuggerHost ||
    expoConfig?.hostUri ||
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost;
  
  if (debuggerHost) {
    const hostname = debuggerHost.split(':')[0];
    console.log('Detected hostname:', hostname);
    return `http://${hostname}:3000/api/v1`;
  }
  
  // Fallback with your actual IP
  console.log('Using fallback IP');
  return 'http://192.168.1.13:3000/api/v1';
};

const API_URL = getApiUrl();
console.log('========================================');
console.log('API URL CONFIGURATION:');
console.log('API_URL:', API_URL);
console.log('========================================');

// Debug alert to see what URL is being used
setTimeout(() => {
  Alert.alert('API Config', `Using API: ${API_URL}`);
}, 2000);

const config = {
  API_URL,
  
  // API endpoints
  endpoints: {
    trees: '/trees',
    species: '/species',
    identify: '/identify',
    health: '/health-assessment',
  },
  
  // External API configs (we'll add keys here later)
  plantId: {
    apiKey: '', // We'll add this via env later
    baseUrl: 'https://api.plant.id/v3',
  },
  
  iNaturalist: {
    baseUrl: 'https://api.inaturalist.org/v1',
    // No API key needed for basic usage
  },
  
  // App settings
  mapDefaults: {
    latitude: -38.2380,  // Mornington Peninsula default
    longitude: 145.0387,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  
  // Timeouts and retries
  requestTimeout: 30000,
  maxRetries: 3,
};

export default config;