/**
 * Drawer Content Component
 * Side navigation drawer matching the design
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const DrawerContent = ({ onClose }) => {
  const navigation = useNavigation();
  const { isAuthenticated, user, logout } = useAuth();
  const [expandedCategory, setExpandedCategory] = useState(null);

  const categories = [
    { 
      id: 'men', 
      label: 'Men', 
      subItems: [
        { name: 'Shirts', path: 'shirt' },
        { name: 'T-Shirts', path: 'tshirt' },
        { name: 'Trousers', path: 'trousers' },
        { name: 'Shoes', path: 'shoes' }
      ] 
    },
    { 
      id: 'women', 
      label: 'Women', 
      subItems: [
        { name: 'Shirts', path: 'shirt' },
        { name: 'T-Shirts', path: 'tshirt' },
        { name: 'Jeans', path: 'jeans' },
        { name: 'Trousers', path: 'trousers' },
        { name: 'Saree', path: 'saree' }
      ] 
    },
    { 
      id: 'watches', 
      label: 'Watches', 
      subItems: [
        { name: "Men's Watches", path: 'watches', params: { gender: 'men' } },
        { name: "Women's Watches", path: 'watches', params: { gender: 'women' } },
        { name: 'Smart Watches', path: 'watches', params: { type: 'smart' } }
      ] 
    },
    { 
      id: 'eyewear', 
      label: 'Eyewear', 
      subItems: [
        { name: "Men's Eyewear", path: 'lenses', params: { gender: 'men' } },
        { name: "Women's Eyewear", path: 'lenses', params: { gender: 'women' } },
        { name: 'Sunglasses', path: 'lenses', params: { type: 'sun' } }
      ] 
    },
    { 
      id: 'accessories', 
      label: 'Accessories', 
      subItems: [
        { name: "Men's Accessories", path: 'accessories', params: { gender: 'men' } },
        { name: "Women's Accessories", path: 'accessories', params: { gender: 'women' } },
        { name: 'Wallets & Belts', path: 'accessories', params: { type: 'general' } }
      ] 
    }
  ];

  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleNavigation = (route, params = {}) => {
    navigation.navigate(route, params);
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View className="px-6 pt-10 pb-4 flex-row justify-between items-start">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <Image
                source={{ uri: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1765969744/ef93f9f5-0469-413a-a0d3-24df2b70f27b.png' }}
                className="h-10 w-auto"
                style={{ height: 40, width: 120 }}
                resizeMode="contain"
              />
            </View>
            {isAuthenticated && user?.name && (
              <Text className="text-xs text-gray-500 mt-1">Hello, {user.name}</Text>
            )}
          </View>
          <TouchableOpacity onPress={onClose} className="p-2 -mr-2">
            <Ionicons name="close" size={24} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Auth Quick Actions */}
        <View className="px-6 pb-4 flex-row gap-3">
          {isAuthenticated ? (
            <>
              <TouchableOpacity
                onPress={() => handleNavigation('Profile')}
                className="flex-1 flex-row items-center justify-center gap-2 py-3 bg-black rounded-lg"
              >
                <Text className="text-white text-sm font-semibold">Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogout}
                className="flex-1 flex-row items-center justify-center gap-2 py-3 bg-white border border-gray-300 rounded-lg"
              >
                <Text className="text-gray-900 text-sm font-semibold">Logout</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => handleNavigation('Login')}
                className="flex-1 py-3 bg-white border border-gray-200 rounded-lg"
              >
                <Text className="text-center text-sm font-bold text-gray-900">Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleNavigation('SignUp')}
                className="flex-1 py-3 bg-black rounded-lg"
              >
                <Text className="text-center text-sm font-bold text-white">Sign Up</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Main Navigation Links */}
        <View className="px-6 py-4">
          <TouchableOpacity onPress={() => handleNavigation('Home')} className="mb-4">
            <Text className="text-2xl font-light tracking-tight text-gray-900">Home</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleNavigation('Category', { category: 'new-arrival' })} className="mb-4">
            <Text className="text-2xl font-light tracking-tight text-gray-900">New Arrivals</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleNavigation('Category', { category: 'sale' })} className="mb-4">
            <Text className="text-2xl font-bold tracking-tight text-red-600">Sale</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View className="px-6">
          <View className="w-12 h-px bg-gray-200" />
        </View>

        {/* Shop Categories */}
        <View className="px-6 py-4">
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            Shop Categories
          </Text>
          {categories.map((category) => (
            <View key={category.id} className="border-b border-gray-100">
              <TouchableOpacity
                onPress={() => toggleCategory(category.id)}
                className="flex-row justify-between items-center py-4"
              >
                <Text className="text-base font-medium text-gray-800">{category.label}</Text>
                <Ionicons 
                  name={expandedCategory === category.id ? "chevron-up" : "chevron-down"} 
                  size={18} 
                  color="#9ca3af" 
                />
              </TouchableOpacity>
              
              {expandedCategory === category.id && (
                <View className="pl-4 pb-4">
                  {category.subItems.map((subItem, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => {
                        if (subItem.params) {
                          handleNavigation('Category', { category: subItem.path, ...subItem.params });
                        } else {
                          handleNavigation('Category', { category: category.id, subcategory: subItem.path });
                        }
                      }}
                      className="mb-3"
                    >
                      <Text className="text-sm text-gray-500">{subItem.name}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    onPress={() => handleNavigation('Category', { category: category.id })}
                    className="mt-2"
                  >
                    <Text className="text-sm font-bold text-black">Shop All</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer Sign Out */}
      <View className="px-6 py-4 border-t border-gray-100 bg-gray-50">
        {isAuthenticated ? (
          <TouchableOpacity
            onPress={handleLogout}
            className="w-full py-3 border border-red-200 bg-white rounded-lg"
          >
            <Text className="text-center text-sm font-bold text-red-600">Sign Out</Text>
          </TouchableOpacity>
        ) : (
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => handleNavigation('Login')}
              className="flex-1 py-3 bg-white border border-gray-200 rounded-lg"
            >
              <Text className="text-center text-sm font-bold text-gray-900">Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleNavigation('SignUp')}
              className="flex-1 py-3 bg-black rounded-lg"
            >
              <Text className="text-center text-sm font-bold text-white">Sign Up</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default DrawerContent;

