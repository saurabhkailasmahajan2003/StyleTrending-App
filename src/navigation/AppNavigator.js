/**
 * Main App Navigator
 * Sets up navigation structure for the mobile app
 * 
 * Make sure to import gesture handler at the root of your app
 * import 'react-native-gesture-handler';
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';

// Screens
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrderSuccessScreen from '../screens/OrderSuccessScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CategoryScreen from '../screens/CategoryScreen';
import SaleScreen from '../screens/SaleScreen';
import FreshDropsScreen from '../screens/FreshDropsScreen';
import SearchScreen from '../screens/SearchScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import DrawerContent from '../components/DrawerContent';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Main Stack Navigator (defined first)
function MainStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#000',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        animationEnabled: true,
        animationTypeForReplace: 'push',
        transitionSpec: {
          open: {
            animation: 'timing',
            config: {
              duration: 200,
              useNativeDriver: true,
            },
          },
          close: {
            animation: 'timing',
            config: {
              duration: 200,
              useNativeDriver: true,
            },
          },
        },
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
              opacity: current.progress.interpolate({
                inputRange: [0, 0.3, 1],
                outputRange: [0, 0.5, 1],
              }),
            },
          };
        },
        detachInactiveScreens: false, // Keep screens mounted for smoother transitions
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Category" 
        component={CategoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Sale" 
        component={SaleScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="FreshDrops" 
        component={FreshDropsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Cart" 
        component={CartScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Checkout" 
        component={CheckoutScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="OrderSuccess" 
        component={OrderSuccessScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen 
        name="Search" 
        component={SearchScreen}
        options={{ title: 'Search Products' }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Drawer Navigator
// Configured for Reanimated 3 compatibility
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      id="Drawer"
      useLegacyImplementation={false}
      drawerContent={(props) => <DrawerContent {...props} onClose={() => props.navigation.closeDrawer()} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          width: '80%',
          maxWidth: 320,
          backgroundColor: '#fff',
        },
        overlayColor: 'rgba(0, 0, 0, 0.5)',
        drawerPosition: 'right',
        swipeEnabled: true,
        drawerAnimationType: 'slide',
        drawerHideStatusBarOnOpen: false,
        drawerActiveTintColor: '#000',
        drawerInactiveTintColor: '#666',
        gestureHandlerProps: {
          enableTrackpadTwoFingerGesture: false,
          activeOffsetX: [-10, 10],
          failOffsetY: [-5, 5],
        },
        animationEnabled: true,
        swipeEdgeWidth: 20,
      }}
    >
      <Drawer.Screen 
        name="MainStack" 
        component={MainStack}
        options={{
          drawerLabel: () => null,
          drawerItemStyle: { height: 0 },
        }}
      />
    </Drawer.Navigator>
  );
}

// Root Navigator (handles auth screens)
function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Main" component={DrawerNavigator} />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="SignUp" 
        component={SignUpScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}

