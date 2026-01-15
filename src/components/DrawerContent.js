/**
 * Drawer Content Component - Professional & Animated
 * Stack: React Native + Tailwind CSS (NativeWind)
 */
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Platform, 
  UIManager, 
  LayoutAnimation 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DrawerContent = React.memo(({ onClose }) => {
  const navigation = useNavigation();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const [expandedCategory, setExpandedCategory] = useState(null);

  // --- CONFIG DATA ---
  const categories = [
    { 
      id: 'men', label: 'Men', icon: 'man-outline',
      subItems: [
        { name: 'Shirts', path: 'shirt' }, { name: 'T-Shirts', path: 'tshirt' },
        { name: 'Jeans', path: 'jeans' }, { name: 'Shoes', path: 'shoes' }
      ] 
    },
    { 
      id: 'women', label: 'Women', icon: 'woman-outline',
      subItems: [
        { name: 'Tops & Tees', path: 'tshirt' }, { name: 'Dresses', path: 'dress' },
        { name: 'Jeans', path: 'jeans' }, { name: 'Sarees', path: 'saree' }
      ] 
    },
    { 
      id: 'watches', label: 'Watches', icon: 'watch-outline',
      subItems: [
        { name: "Men's", path: 'watches', params: { gender: 'men' } },
        { name: "Women's", path: 'watches', params: { gender: 'women' } },
      ] 
    },
    { 
      id: 'accessories', label: 'Accessories', icon: 'glasses-outline',
      subItems: [
        { name: "Eyewear", path: 'lenses' }, { name: "Wallets", path: 'accessories' }
      ] 
    }
  ];

  // --- HANDLERS ---
  const toggleCategory = (categoryId) => {
    // Trigger smooth animation
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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

  // --- DYNAMIC STYLES ---
  const bgMain = isDark ? 'bg-neutral-900' : 'bg-white';
  const bgSecondary = isDark ? 'bg-neutral-800' : 'bg-gray-50';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
  const borderColor = isDark ? 'border-neutral-800' : 'border-gray-100';

  return (
    <SafeAreaView className={`flex-1 ${bgMain}`} edges={['top', 'bottom']}>
      
      {/* --- HEADER: USER PROFILE --- */}
      <View className={`px-6 pt-6 pb-6 border-b ${borderColor}`}>
        <View className="flex-row justify-between items-start">
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => isAuthenticated ? handleNavigation('Profile') : handleNavigation('Login')}
            className="flex-row items-center gap-x-4"
          >
            {/* Avatar Circle */}
            <View className={`h-14 w-14 rounded-full items-center justify-center ${isDark ? 'bg-neutral-700' : 'bg-gray-200'}`}>
              {isAuthenticated && user?.avatar ? (
                <Image source={{ uri: user.avatar }} className="h-14 w-14 rounded-full" />
              ) : (
                <Ionicons name="person" size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
              )}
            </View>
            
            <View>
              <Text className={`text-lg font-bold ${textPrimary}`}>
                {isAuthenticated ? user?.name || 'User' : 'Welcome, Guest'}
              </Text>
              <Text className={`text-xs ${textSecondary}`}>
                {isAuthenticated ? 'View Profile' : 'Sign in to start shopping'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Close Button */}
          <TouchableOpacity onPress={onClose} className={`p-2 rounded-full ${isDark ? 'bg-neutral-800' : 'bg-gray-100'}`}>
            <Ionicons name="close" size={20} color={isDark ? 'white' : 'black'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* --- MAIN LINKS --- */}
        <View className="px-6 py-6 gap-y-1">
          <TouchableOpacity onPress={() => handleNavigation('Home')} className="flex-row items-center py-3">
            <Ionicons name="home-outline" size={22} color={isDark ? '#D1D5DB' : '#4B5563'} />
            <Text className={`ml-4 text-base font-medium ${textPrimary}`}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => handleNavigation('FreshDrops')} className="flex-row items-center py-3">
            <Ionicons name="flash-outline" size={22} color={isDark ? '#D1D5DB' : '#4B5563'} />
            <Text className={`ml-4 text-base font-medium ${textPrimary}`}>New Arrivals</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => handleNavigation('Sale')} className="flex-row items-center py-3">
            <Ionicons name="pricetag-outline" size={22} color="#EF4444" />
            <Text className="ml-4 text-base font-bold text-red-500">Sale Collection</Text>
          </TouchableOpacity>
        </View>

        {/* --- DIVIDER --- */}
        <View className={`h-[1px] mx-6 ${borderColor}`} />

        {/* --- ACCORDION CATEGORIES --- */}
        <View className="px-6 py-6">
          <Text className={`text-xs font-bold tracking-widest uppercase mb-4 ${textSecondary}`}>
            Shop By Category
          </Text>

          {categories.map((category) => {
            const isOpen = expandedCategory === category.id;
            return (
              <View key={category.id} className="mb-1">
                <TouchableOpacity
                  onPress={() => toggleCategory(category.id)}
                  className={`flex-row justify-between items-center py-3 ${isOpen ? 'opacity-100' : 'opacity-80'}`}
                >
                  <View className="flex-row items-center">
                    <View className={`w-8 items-center`}>
                       <Ionicons name={category.icon} size={20} color={isDark ? '#D1D5DB' : '#4B5563'} />
                    </View>
                    <Text className={`ml-2 text-base font-medium ${textPrimary}`}>{category.label}</Text>
                  </View>
                  <Ionicons 
                    name={isOpen ? "chevron-up" : "chevron-down"} 
                    size={16} 
                    color={isDark ? '#9CA3AF' : '#9CA3AF'} 
                  />
                </TouchableOpacity>

                {/* Sub Items (Animated by LayoutAnimation) */}
                {isOpen && (
                  <View className={`ml-10 border-l ${borderColor} pl-4 mb-2`}>
                    {category.subItems.map((sub, idx) => (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => {
                          if (sub.params) handleNavigation('Category', { category: sub.path, ...sub.params });
                          else handleNavigation('Category', { category: category.id, subcategory: sub.path });
                        }}
                        className="py-2.5"
                      >
                        <Text className={`text-sm ${textSecondary} hover:text-pink-500`}>{sub.name}</Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity onPress={() => handleNavigation('Category', { category: category.id })} className="py-2.5 mt-1">
                      <Text className="text-sm font-bold text-pink-500">View All {category.label}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* --- THEME TOGGLE --- */}
        <View className={`h-[1px] mx-6 ${borderColor}`} />
        <View className="px-6 py-6">
          <TouchableOpacity
            onPress={() => toggleTheme(theme === 'light' ? 'dark' : 'light')}
            className={`flex-row items-center justify-between p-3 rounded-xl ${bgSecondary}`}
          >
             <View className="flex-row items-center gap-x-3">
                <View className={`p-2 rounded-full ${isDark ? 'bg-neutral-700' : 'bg-white'}`}>
                    <Ionicons name={isDark ? 'moon' : 'sunny'} size={18} color={textPrimary} />
                </View>
                <Text className={`font-medium ${textPrimary}`}>Dark Mode</Text>
             </View>
             
             {/* Simple Custom Switch UI */}
             <View className={`w-10 h-6 rounded-full justify-center px-1 ${isDark ? 'bg-green-500' : 'bg-gray-300'}`}>
                <View className={`w-4 h-4 bg-white rounded-full shadow-sm ${isDark ? 'self-end' : 'self-start'}`} />
             </View>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* --- FOOTER ACTIONS --- */}
      <View className={`px-6 py-6 border-t ${borderColor} ${bgMain}`}>
        {isAuthenticated ? (
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center justify-center py-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/50"
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text className="ml-2 font-bold text-red-500">Log Out</Text>
          </TouchableOpacity>
        ) : (
          <View className="flex-row gap-x-4">
             <TouchableOpacity 
                onPress={() => handleNavigation('Login')}
                className={`flex-1 py-3 rounded-xl border ${borderColor} items-center`}
             >
                <Text className={`font-bold ${textPrimary}`}>Log In</Text>
             </TouchableOpacity>
             <TouchableOpacity 
                onPress={() => handleNavigation('SignUp')}
                className="flex-1 py-3 rounded-xl bg-pink-600 items-center shadow-md shadow-pink-200"
             >
                <Text className="font-bold text-white">Sign Up</Text>
             </TouchableOpacity>
          </View>
        )}
        <Text className={`text-center text-[10px] mt-4 ${textSecondary}`}>
            App Version 1.0.2 • StyleTrending
        </Text>
      </View>

    </SafeAreaView>
  );
});

export default DrawerContent;