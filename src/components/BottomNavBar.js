/**
 * Bottom Navigation Bar Component
 * Sticky bottom bar with Home, Shop, Cart, and Profile
 */
import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';

const BottomNavBar = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { cartItems } = useCart();
  const cartItemCount = cartItems?.length || 0;
  const insets = useSafeAreaInsets();
  
  // Calculate bottom padding to avoid overlap with system controls
  // When control buttons are available (insets.bottom > 0), add extra padding
  // When off or full screen (insets.bottom === 0), use normal padding
  const bottomPadding = insets.bottom > 0 ? insets.bottom + 8 : (Platform.OS === 'ios' ? 4 : 0);

  const isActive = (routeName) => {
    if (routeName === 'Home' && route.name === 'Home') return true;
    if (routeName === 'Shop' && (route.name === 'Category' || route.name === 'Search')) return true;
    if (routeName === 'Cart' && route.name === 'Cart') return true;
    if (routeName === 'Profile' && route.name === 'Profile') return true;
    return false;
  };

  const navigateToScreen = (screenName) => {
    if (screenName === 'Home') {
      navigation.navigate('Home');
    } else if (screenName === 'Shop') {
      navigation.navigate('Category', { category: 'all' });
    } else if (screenName === 'Cart') {
      navigation.navigate('Cart');
    } else if (screenName === 'Profile') {
      navigation.navigate('Profile');
    }
  };

  const navItems = [
    { name: 'Home', icon: 'home', iconActive: 'home', route: 'Home' },
    { name: 'Shop', icon: 'grid-outline', iconActive: 'grid', route: 'Shop' },
    { name: 'Cart', icon: 'bag-outline', iconActive: 'bag', route: 'Cart', badge: cartItemCount },
    { name: 'Profile', icon: 'person-outline', iconActive: 'person', route: 'Profile' },
  ];

  return (
    <View 
      className="absolute left-0 right-0 bg-white border-t border-gray-200 shadow-lg" 
      style={{ 
        bottom: 0,
        elevation: 10,
        paddingBottom: bottomPadding,
      }}
    >
      <View className="flex-row justify-around items-center py-2 px-4">
        {navItems.map((item) => {
          const active = isActive(item.route);
          return (
            <TouchableOpacity
              key={item.name}
              onPress={() => navigateToScreen(item.route)}
              className="items-center justify-center flex-1 py-2"
              activeOpacity={0.7}
            >
              <View className="relative">
                <Ionicons 
                  name={active ? item.iconActive : item.icon} 
                  size={22} 
                  color={active ? '#000' : '#666'} 
                />
                {item.badge && item.badge > 0 && (
                  <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                    <Text className="text-white text-[10px] font-bold">{item.badge > 9 ? '9+' : item.badge}</Text>
                  </View>
                )}
              </View>
              <Text className={`text-[10px] mt-1 ${active ? 'text-black font-semibold' : 'text-gray-500'}`}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default BottomNavBar;

