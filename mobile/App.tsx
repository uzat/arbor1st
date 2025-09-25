import TreeListScreen from './src/screens/TreeListScreen';
import TreeDetailScreen from './src/screens/TreeDetailScreen';
import AddTreeScreen from './src/screens/AddTreeScreen';
import LoginScreen from './src/screens/LoginScreen';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Button } from 'react-native';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

// Temporary Login Screen

// Temporary Main Screen
function MainScreen({ navigation }: any) {
  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
    navigation.replace('Login');
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>ArborIQ</Text>
      <Text style={{ marginBottom: 20 }}>Tree Management System</Text>
      <Button
        title="View Trees"
        onPress={() => navigation.navigate('TreeList')}
      />
      <View style={{ marginTop: 10 }}>
        <Button
          title="Add New Tree"
          onPress={() => navigation.navigate('AddTree')}
          color="#2e7d32"
        />
      </View>
      <View style={{ marginTop: 30 }}>
        <Button
          title="Logout"
          onPress={handleLogout}
          color="#d32f2f"
        />
      </View>
    </View>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      setIsAuthenticated(!!token);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  if (isAuthenticated === null) {
    // Loading state
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={isAuthenticated ? "Main" : "Login"}
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
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Main"
              component={MainScreen}
              options={{ title: 'ArborIQ' }}
            />
            <Stack.Screen
              name="TreeList"
              component={TreeListScreen}
              options={{ title: 'Trees' }}
            />
            <Stack.Screen
              name="TreeDetail"
              component={TreeDetailScreen}
              options={{ title: "Tree Details" }}
            />
            <Stack.Screen
              name="AddTree"
              component={AddTreeScreen}
              options={{ title: "Add New Tree" }}
            />
          </Stack.Navigator>
          <StatusBar style="auto" />
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
