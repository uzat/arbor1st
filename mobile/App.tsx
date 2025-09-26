import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Auth Context
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Import screens
import TreeListScreen from './src/screens/TreeListScreen';
import TreeDetailScreen from './src/screens/TreeDetailScreen';
import AddTreeScreen from './src/screens/AddTreeScreen';
import LoginScreen from './src/screens/LoginScreen';
import MapScreen from './src/screens/MapScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

// Profile/Settings Screen
function ProfileScreen() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={{ flex: 1, padding: 20, paddingTop: 40 }}>
      <View style={{ alignItems: 'center', marginBottom: 40 }}>
        <Ionicons name="person-circle" size={100} color="#2e7d32" />
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 10 }}>User Profile</Text>
      </View>
      
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'white',
          padding: 15,
          borderRadius: 10,
          marginBottom: 10,
          elevation: 2,
        }}
        onPress={() => {}}
      >
        <Ionicons name="settings-outline" size={24} color="#666" />
        <Text style={{ marginLeft: 15, fontSize: 16 }}>Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'white',
          padding: 15,
          borderRadius: 10,
          marginBottom: 10,
          elevation: 2,
        }}
        onPress={() => {}}
      >
        <Ionicons name="help-circle-outline" size={24} color="#666" />
        <Text style={{ marginLeft: 15, fontSize: 16 }}>Help & Support</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#ffebee',
          padding: 15,
          borderRadius: 10,
          marginTop: 30,
          elevation: 2,
        }}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={24} color="#d32f2f" />
        <Text style={{ marginLeft: 15, fontSize: 16, color: '#d32f2f', fontWeight: 'bold' }}>
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// Main Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help';

          if (route.name === 'Trees') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Add') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2e7d32',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#2e7d32',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => null,
      })}
    >
      <Tab.Screen 
        name="Trees" 
        component={TreeListScreen}
        options={{
          title: 'Trees',
          headerTitle: 'Tree Inventory',
        }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen}
        options={{
          title: 'Map',
          headerTitle: 'Tree Map',
        }}
      />
      <Tab.Screen 
        name="Add" 
        component={AddTreeScreen}
        options={{
          title: 'Add',
          headerTitle: 'Add New Tree',
          tabBarLabel: 'Add',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profile',
          headerTitle: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

// Auth Stack Navigator
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

// Main App Stack
function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2e7d32',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabs} 
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TreeDetail"
        component={TreeDetailScreen}
        options={{ 
          title: "Tree Details",
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="AddTreeFromMap"
        component={AddTreeScreen}
        options={{ 
          title: "Add Tree",
          headerBackTitle: 'Back',
        }}
      />
    </Stack.Navigator>
  );
}

// Navigation wrapper that uses auth context
function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading ArborIQ...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="App" component={AppStack} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </AuthProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}