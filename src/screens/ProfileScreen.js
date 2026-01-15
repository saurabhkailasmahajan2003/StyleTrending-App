/**
 * Profile Screen - Premium Monochrome Edition
 * Stack: React Native + Tailwind CSS (NativeWind)
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
  LayoutAnimation,
  UIManager
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { profileAPI, orderAPI } from '../services/api';
import BottomNavBar from '../components/BottomNavBar';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Contexts
  const { user, logout, isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications();
  const { theme, isDark, colors, toggleTheme } = useTheme();
  
  // State
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const scrollViewRef = useRef(null);

  // --- THEME CONSTANTS ---
  const bgMain = isDark ? 'bg-black' : 'bg-white';
  const bgCard = isDark ? 'bg-neutral-900' : 'bg-white';
  const textPrimary = isDark ? 'text-white' : 'text-black';
  const textSecondary = isDark ? 'text-neutral-400' : 'text-gray-500';
  const borderCol = isDark ? 'border-neutral-800' : 'border-gray-200';
  const inputBg = isDark ? 'bg-neutral-800' : 'bg-gray-50';

  // --- EFFECT HOOKS ---
  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
      if (activeTab === 'orders') loadOrders();
    }
  }, [isAuthenticated, activeTab]);

  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.scrollToTop && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
        navigation.setParams({ scrollToTop: undefined });
      }
    }, [route.params?.scrollToTop])
  );

  // --- DATA LOADERS ---
  const loadProfile = async () => {
    try {
      if(!profileData) setIsLoading(true); // Only show spinner on first load
      const response = await profileAPI.getProfile();
      if (response.success) {
        setProfileData(response.data);
        const userData = response.data.user;
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address
            ? `${userData.address.address || ''}, ${userData.address.city || ''}, ${userData.address.state || ''}, ${userData.address.country || 'India'}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',')
            : '',
        });
      }
    } catch (err) {
      console.error('Profile load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await orderAPI.getOrders();
      if (response.success) setOrders(response.data.orders || []);
    } catch (err) {
      console.error('Orders load error:', err);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadProfile(), activeTab === 'orders' ? loadOrders() : Promise.resolve()]);
    setIsRefreshing(false);
  };

  // --- HANDLERS ---
  const handleUpdateProfile = async () => {
    setError(''); setSuccess('');
    try {
      let addressObj = null;
      if (formData.address && formData.address.trim()) {
        const parts = formData.address.split(',').map(p => p.trim()).filter(p => p);
        if (parts.length > 0) {
          addressObj = {
            address: parts[0] || '',
            city: parts[1] || '',
            state: parts[2] || '',
            country: parts[3] || 'India',
          };
        }
      }

      const updateData = { name: formData.name, phone: formData.phone };
      if (addressObj) updateData.address = addressObj;

      const response = await profileAPI.updateProfile(updateData);
      if (response.success) {
        setSuccess('Profile updated successfully.');
        setIsEditing(false);
        await loadProfile();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Update failed.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }},
    ]);
  };

  const handleTabChange = (tabId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(tabId);
  };

  // --- UTILS ---
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    switch(s) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const displayName = user?.name || profileData?.user?.name || 'User';
  const userInitial = displayName.charAt(0).toUpperCase();

  // --- RENDER BLOCKS ---
  
  if (!isAuthenticated) {
    return (
      <View className={`flex-1 justify-center items-center ${bgMain}`}>
        <Text className={`mb-6 ${textSecondary}`}>Please log in to view your profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} className={`px-8 py-3 bg-black dark:bg-white rounded-full`}>
          <Text className={`font-bold ${isDark ? 'text-black' : 'text-white'}`}>LOG IN</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading && !profileData) {
    return (
      <View className={`flex-1 justify-center items-center ${bgMain}`}>
        <ActivityIndicator size="large" color={isDark ? 'white' : 'black'} />
      </View>
    );
  }

  return (
    <View className={`flex-1 ${bgMain}`}>
      <SafeAreaView edges={['top']} className={bgMain} />
      
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={isDark ? 'white' : 'black'} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        
        {/* --- HEADER IDENTITY --- */}
        <View className={`px-6 pt-6 pb-8 border-b ${borderCol}`}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-x-5">
              <View className={`h-16 w-16 rounded-full items-center justify-center ${isDark ? 'bg-neutral-800' : 'bg-black'}`}>
                <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-white'}`}>{userInitial}</Text>
              </View>
              <View>
                <Text className={`text-xl font-bold ${textPrimary}`}>{displayName}</Text>
                <Text className={`text-sm ${textSecondary}`}>{user?.email}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleLogout} className={`p-2 rounded-full ${isDark ? 'bg-neutral-800' : 'bg-gray-100'}`}>
               <Ionicons name="log-out-outline" size={20} color={isDark ? 'white' : 'black'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* --- TABS --- */}
        <View className="py-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}>
            {[
              { id: 'profile', label: 'Profile' },
              { id: 'orders', label: 'Orders' },
              { id: 'notifications', label: 'Notifications', badge: unreadCount },
              { id: 'settings', label: 'Settings' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => tab.id === 'notifications' ? navigation.navigate('Notifications') : handleTabChange(tab.id)}
                className={`px-5 py-2.5 rounded-full border ${activeTab === tab.id ? (isDark ? 'bg-white border-white' : 'bg-black border-black') : (isDark ? 'bg-transparent border-neutral-700' : 'bg-white border-gray-200')}`}
              >
                <View className="flex-row items-center gap-x-2">
                  <Text className={`font-semibold text-xs uppercase tracking-wider ${activeTab === tab.id ? (isDark ? 'text-black' : 'text-white') : textPrimary}`}>
                    {tab.label}
                  </Text>
                  {tab.badge > 0 && (
                    <View className="bg-red-500 w-2 h-2 rounded-full" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* --- ALERTS --- */}
        <View className="px-6">
          {success ? <Text className="text-green-600 mb-4 bg-green-50 p-3 rounded-lg border border-green-100 text-sm text-center">{success}</Text> : null}
          {error ? <Text className="text-red-600 mb-4 bg-red-50 p-3 rounded-lg border border-red-100 text-sm text-center">{error}</Text> : null}
        </View>

        {/* --- PROFILE CONTENT --- */}
        {activeTab === 'profile' && (
          <View className="px-6">
            <View className={`flex-row justify-between items-center mb-6`}>
              <Text className={`text-sm font-bold tracking-widest uppercase ${textSecondary}`}>Personal Details</Text>
              <TouchableOpacity onPress={() => isEditing ? setIsEditing(false) : setIsEditing(true)}>
                <Text className={`text-sm font-bold underline ${textPrimary}`}>{isEditing ? 'Cancel' : 'Edit'}</Text>
              </TouchableOpacity>
            </View>

            <View className="gap-y-6">
              {/* Name Field */}
              <View>
                <Text className={`text-xs mb-2 font-medium ${textSecondary}`}>FULL NAME</Text>
                {isEditing ? (
                  <TextInput
                    value={formData.name}
                    onChangeText={(t) => setFormData({ ...formData, name: t })}
                    className={`p-4 rounded-xl border ${borderCol} ${inputBg} ${textPrimary}`}
                  />
                ) : (
                  <Text className={`text-base font-medium ${textPrimary} py-2`}>{formData.name}</Text>
                )}
              </View>

              {/* Email Field (Read Only) */}
              <View>
                <Text className={`text-xs mb-2 font-medium ${textSecondary}`}>EMAIL ADDRESS</Text>
                <Text className={`text-base font-medium ${textSecondary} py-2 opacity-70`}>{formData.email}</Text>
              </View>

              {/* Phone Field */}
              <View>
                <Text className={`text-xs mb-2 font-medium ${textSecondary}`}>PHONE NUMBER</Text>
                {isEditing ? (
                  <TextInput
                    value={formData.phone}
                    onChangeText={(t) => setFormData({ ...formData, phone: t })}
                    keyboardType="phone-pad"
                    className={`p-4 rounded-xl border ${borderCol} ${inputBg} ${textPrimary}`}
                  />
                ) : (
                  <Text className={`text-base font-medium ${textPrimary} py-2`}>{formData.phone || 'Not set'}</Text>
                )}
              </View>

              {/* Address Field */}
              <View>
                <Text className={`text-xs mb-2 font-medium ${textSecondary}`}>SHIPPING ADDRESS</Text>
                {isEditing ? (
                  <TextInput
                    value={formData.address}
                    onChangeText={(t) => setFormData({ ...formData, address: t })}
                    multiline numberOfLines={3}
                    className={`p-4 rounded-xl border ${borderCol} ${inputBg} ${textPrimary}`}
                  />
                ) : (
                  <Text className={`text-base font-medium ${textPrimary} py-2 leading-6`}>{formData.address || 'No address saved'}</Text>
                )}
              </View>

              {isEditing && (
                <TouchableOpacity onPress={handleUpdateProfile} className={`mt-4 py-4 ${isDark ? 'bg-white' : 'bg-black'} rounded-xl items-center`}>
                  <Text className={`font-bold uppercase tracking-widest ${isDark ? 'text-black' : 'text-white'}`}>Save Changes</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* --- ORDERS CONTENT --- */}
        {activeTab === 'orders' && (
          <View className="px-6">
            <Text className={`text-sm font-bold tracking-widest uppercase mb-6 ${textSecondary}`}>Recent Orders</Text>
            
            {orders.length === 0 ? (
              <View className={`p-8 rounded-2xl items-center border border-dashed ${borderCol} ${bgCard}`}>
                <Ionicons name="cart-outline" size={40} color={isDark ? '#525252' : '#A3A3A3'} />
                <Text className={`mt-4 font-medium ${textSecondary}`}>No orders yet</Text>
              </View>
            ) : (
              orders.map((order) => {
                const statusClass = getStatusStyle(order.status);
                return (
                  <TouchableOpacity
                    key={order._id}
                    onPress={() => navigation.navigate('TrackOrder', { orderId: order._id })}
                    className={`mb-4 p-5 rounded-2xl border ${borderCol} ${bgCard}`}
                  >
                    <View className="flex-row justify-between items-start mb-4">
                      <View>
                        <Text className={`text-xs font-bold ${textSecondary} mb-1`}>ORDER #{order.orderNumber || order._id?.slice(-6)}</Text>
                        <Text className={`text-lg font-bold ${textPrimary}`}>₹{order.totalAmount?.toLocaleString()}</Text>
                      </View>
                      <View className={`px-3 py-1 rounded-full ${statusClass.split(' ')[0]}`}>
                         <Text className={`text-[10px] font-bold uppercase ${statusClass.split(' ')[1]}`}>{order.status}</Text>
                      </View>
                    </View>
                    
                    <View className={`flex-row justify-between items-center pt-4 border-t ${borderCol}`}>
                       <Text className={`text-xs ${textSecondary}`}>{formatDate(order.createdAt)}</Text>
                       <View className="flex-row items-center gap-1">
                          <Text className={`text-xs font-medium ${textPrimary}`}>View Details</Text>
                          <Ionicons name="arrow-forward" size={12} color={isDark ? 'white' : 'black'} />
                       </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {/* --- SETTINGS CONTENT --- */}
        {activeTab === 'settings' && (
          <View className="px-6">
             <Text className={`text-sm font-bold tracking-widest uppercase mb-4 ${textSecondary}`}>Preferences</Text>
             
             <View className={`rounded-2xl border ${borderCol} ${bgCard} overflow-hidden`}>
                {[
                  { icon: 'notifications-outline', label: 'Notifications', onPress: () => navigation.navigate('Notifications') },
                  { 
                    icon: isDark ? 'sunny-outline' : 'moon-outline', 
                    label: 'Appearance', 
                    value: isDark ? 'Dark' : 'Light',
                    onPress: () => toggleTheme(isDark ? 'light' : 'dark') 
                  },
                  { icon: 'shield-checkmark-outline', label: 'Privacy & Security', onPress: () => {} },
                  { icon: 'document-text-outline', label: 'Terms of Service', onPress: () => {} },
                  { icon: 'headset-outline', label: 'Help & Support', onPress: () => {} },
                ].map((item, idx, arr) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={item.onPress}
                    className={`flex-row items-center justify-between p-4 ${idx !== arr.length - 1 ? 'border-b' : ''} ${borderCol}`}
                  >
                    <View className="flex-row items-center gap-4">
                       <Ionicons name={item.icon} size={22} color={isDark ? 'white' : 'black'} />
                       <Text className={`font-medium ${textPrimary}`}>{item.label}</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                       {item.value && <Text className={`text-sm ${textSecondary}`}>{item.value}</Text>}
                       <Ionicons name="chevron-forward" size={16} color={isDark ? '#525252' : '#A3A3A3'} />
                    </View>
                  </TouchableOpacity>
                ))}
             </View>

             <Text className={`text-center text-xs mt-8 ${textSecondary}`}>
                Version 1.0.2 • Build 2024
             </Text>
          </View>
        )}

      </ScrollView>
      <BottomNavBar />
    </View>
  );
};

export default ProfileScreen;