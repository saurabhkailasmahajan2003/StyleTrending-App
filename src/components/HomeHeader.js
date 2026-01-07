/**
 * Home Header Component
 * Matches the web design with top bar, logo, and icons
 */
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const HomeHeader = () => {
  const navigation = useNavigation();
  const { isAuthenticated } = useAuth();

  const openDrawer = () => {
    // Find the drawer navigator in the navigation hierarchy
    let nav = navigation;
    
    // Traverse up the navigation tree to find the drawer
    while (nav) {
      try {
        nav.dispatch(DrawerActions.openDrawer());
        return; // Successfully opened drawer
      } catch (error) {
        // Try parent navigator
        nav = nav.getParent();
        if (!nav) break;
      }
    }
    
    // If drawer not found, try direct dispatch
    try {
      navigation.dispatch(DrawerActions.openDrawer());
    } catch (error) {
      console.warn('Could not open drawer:', error);
    }
  };

  return (
    <View className="bg-white">
      {/* Main Header */}
      <View className="bg-white px-4 py-3 flex-row justify-between items-center border-b border-gray-100">
        {/* Logo */}
        <TouchableOpacity onPress={() => navigation.navigate('Home')} activeOpacity={0.8}>
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-black rounded-full items-center justify-center mr-2">
              <Text className="text-white text-lg font-bold">S</Text>
            </View>
            <Text className="text-xl font-bold text-black">StyleTrending</Text>
          </View>
        </TouchableOpacity>

        {/* Icons */}
        <View className="flex-row items-center gap-4">
          {/* Profile */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
            className="p-2"
          >
            <Ionicons name={isAuthenticated ? "person" : "person-outline"} size={22} color="#000" />
          </TouchableOpacity>

          {/* Hamburger Menu - Opens Drawer */}
          <TouchableOpacity 
            onPress={openDrawer}
            activeOpacity={0.7}
            className="p-2"
          >
            <Ionicons name="reorder-three-outline" size={26} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default HomeHeader;

