import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AddM3UScreen from './src/screens/AddM3UScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import PlayerScreen from './src/screens/PlayerScreen';
import M3UListScreen from './src/screens/M3UListScreen';
import { SubCategoryScreen } from './src/screens/CategoriesScreen';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const Stack = createNativeStackNavigator();

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={{ marginTop: 10 }}>Yükleniyor...</Text>
  </View>
);

const App = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simulating initialization
    setTimeout(() => {
      setIsReady(true);
    }, 1000);
  }, []);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer
        fallback={<LoadingScreen />}
        onStateChange={(state) => {
          // Navigation state changed
          console.log('New navigation state:', state);
        }}
      >
        <Stack.Navigator
          initialRouteName="M3UList"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerTintColor: '#007AFF',
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        >
          <Stack.Screen 
            name="M3UList" 
            component={M3UListScreen}
            options={{
              title: 'M3U Listelerim',
            }}
          />
          <Stack.Screen 
            name="Categories" 
            component={CategoriesScreen} 
            options={{ title: 'Kategoriler' }}
          />
          <Stack.Screen 
            name="Player" 
            component={PlayerScreen} 
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen 
            name="SubCategory" 
            component={SubCategoryScreen}
            options={({ route }) => ({ 
              title: route.params?.categoryName || 'Alt Kategori'
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
