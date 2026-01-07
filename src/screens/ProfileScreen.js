/**
 * Profile Screen - React Native Version
 */
import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { profileAPI, orderAPI } from '../services/api';
import HomeHeader from '../components/HomeHeader';
import BottomNavBar from '../components/BottomNavBar';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
      if (activeTab === 'orders') {
        loadOrders();
      }
    }
  }, [isAuthenticated, activeTab]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await profileAPI.getProfile();
      if (response.success) {
        setProfileData(response.data);
        const userData = response.data.user;
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address
            ? `${userData.address.address || ''}, ${userData.address.city || ''}, ${userData.address.state || ''}, ${userData.address.country || 'India'}`
                .replace(/^,\s*|,\s*$/g, '')
                .replace(/,\s*,/g, ',')
            : '',
        });
      } else {
        setError(response.message || 'Failed to load profile data.');
      }
    } catch (err) {
      setError('Failed to load profile data.');
      console.error('Profile load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await orderAPI.getOrders();
      if (response.success) {
        setOrders(response.data.orders || []);
      }
    } catch (err) {
      console.error('Orders load error:', err);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    const promises = [loadProfile()];
    if (activeTab === 'orders') {
      promises.push(loadOrders());
    }
    await Promise.all(promises);
    setIsRefreshing(false);
  };

  const handleUpdateProfile = async () => {
    setError('');
    setSuccess('');

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

      const updateData = {
        name: formData.name,
        phone: formData.phone,
      };

      if (addressObj) updateData.address = addressObj;

      const response = await profileAPI.updateProfile(updateData);
      if (response.success) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        await loadProfile();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError('Failed to update profile.');
      console.error('Update error:', err);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const displayName = user?.name || profileData?.user?.name || 'User';
  const userInitial = displayName.charAt(0).toUpperCase();
  const userEmail = user?.email || profileData?.user?.email || '';

  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-500 mb-4">Please log in to view your profile</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          className="bg-gray-900 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-semibold">Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading && !profileData) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <SafeAreaView className="bg-white">
        <HomeHeader />
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Profile Header */}
        <View className="bg-white py-6 border-b border-gray-100" style={{ paddingHorizontal: 16 }}>
          <View className="flex-row items-center mb-4">
            <View className="w-16 h-16 rounded-full bg-gray-900 items-center justify-center mr-4">
              <Text className="text-white text-2xl font-bold">{userInitial}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900">{displayName}</Text>
              <Text className="text-sm text-gray-500 mt-1">{userEmail}</Text>
            </View>
            <TouchableOpacity
              onPress={handleLogout}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <Text className="text-sm font-medium text-gray-700">Sign Out</Text>
            </TouchableOpacity>
          </View>

          {/* Tab Navigation */}
          <View className="flex-row gap-2">
            {[
              { id: 'profile', label: 'Profile' },
              { id: 'orders', label: 'Orders' },
              { id: 'settings', label: 'Settings' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full ${
                  activeTab === tab.id
                    ? 'bg-gray-900'
                    : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    activeTab === tab.id
                      ? 'text-white'
                      : 'text-gray-700'
                  }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Success/Error Messages */}
        {success ? (
          <View className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3" style={{ marginHorizontal: 16 }}>
            <Text className="text-green-800 text-sm">{success}</Text>
          </View>
        ) : null}
        {error ? (
          <View className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3" style={{ marginHorizontal: 16 }}>
            <Text className="text-red-800 text-sm">{error}</Text>
          </View>
        ) : null}

        {/* Profile Tab Content */}
        {activeTab === 'profile' && (
          <View className="py-6" style={{ paddingHorizontal: 16 }}>
            <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-lg font-bold text-gray-900">Personal Information</Text>
                {!isEditing ? (
                  <TouchableOpacity
                    onPress={() => setIsEditing(true)}
                    className="px-4 py-2 bg-gray-900 rounded-lg"
                  >
                    <Text className="text-white text-sm font-semibold">Edit</Text>
                  </TouchableOpacity>
                ) : (
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => {
                        setIsEditing(false);
                        loadProfile();
                      }}
                      className="px-4 py-2 bg-gray-100 rounded-lg"
                    >
                      <Text className="text-gray-700 text-sm font-semibold">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleUpdateProfile}
                      className="px-4 py-2 bg-gray-900 rounded-lg"
                    >
                      <Text className="text-white text-sm font-semibold">Save</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <View>
                <View className="mb-4">
                  <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Full Name
                  </Text>
                  {isEditing ? (
                    <TextInput
                      value={formData.name}
                      onChangeText={(text) => setFormData({ ...formData, name: text })}
                      className="border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-white"
                      placeholder="Enter your name"
                    />
                  ) : (
                    <Text className="text-gray-900 text-base py-3">
                      {formData.name || 'Not set'}
                    </Text>
                  )}
                </View>

                <View className="mb-4">
                  <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Email
                  </Text>
                  <Text className="text-gray-900 text-base py-3">{formData.email}</Text>
                  <Text className="text-xs text-gray-400 mt-1">Email cannot be changed</Text>
                </View>

                <View className="mb-4">
                  <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Phone
                  </Text>
                  {isEditing ? (
                    <TextInput
                      value={formData.phone}
                      onChangeText={(text) => setFormData({ ...formData, phone: text })}
                      className="border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-white"
                      placeholder="Enter your phone number"
                      keyboardType="phone-pad"
                    />
                  ) : (
                    <Text className="text-gray-900 text-base py-3">
                      {formData.phone || 'Not set'}
                    </Text>
                  )}
                </View>

                <View>
                  <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Address
                  </Text>
                  {isEditing ? (
                    <TextInput
                      value={formData.address}
                      onChangeText={(text) => setFormData({ ...formData, address: text })}
                      className="border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-white"
                      placeholder="Street, City, State, Country"
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  ) : (
                    <Text className="text-gray-900 text-base py-3">
                      {formData.address || 'Not set'}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Orders Tab Content */}
        {activeTab === 'orders' && (
          <View className="py-6" style={{ paddingHorizontal: 16 }}>
            {orders.length === 0 ? (
              <View className="bg-white rounded-2xl p-8 items-center">
                <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
                <Text className="text-gray-500 text-lg font-semibold mt-4">No orders yet</Text>
                <Text className="text-gray-400 text-sm mt-2 text-center">
                  Your order history will appear here
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Home')}
                  className="mt-6 px-6 py-3 bg-gray-900 rounded-lg"
                >
                  <Text className="text-white font-semibold">Start Shopping</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                {orders.map((order, index) => (
                  <View key={order._id}>
                    {index > 0 && <View className="h-4" />}
                    <TouchableOpacity
                      onPress={() => navigation.navigate('TrackOrder', { orderId: order._id })}
                      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                    >
                      <View className="flex-row justify-between items-start mb-3">
                        <View className="flex-1">
                          <Text className="text-sm text-gray-500">
                            Order #{order.orderNumber || (order._id ? order._id.slice(-8) : 'N/A')}
                          </Text>
                          <Text className="text-lg font-bold text-gray-900 mt-1">
                            ₹{(order.totalAmount && typeof order.totalAmount === 'number' ? order.totalAmount.toLocaleString() : '0')}
                          </Text>
                        </View>
                        <View className={`px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                          <Text className="text-xs font-semibold capitalize">
                            {order.status || 'Pending'}
                          </Text>
                        </View>
                      </View>

                      <Text className="text-sm text-gray-500 mb-3">
                        {formatDate(order.createdAt) || 'Date not available'}
                      </Text>

                      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                        <Text className="text-sm text-gray-600">
                          {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                        </Text>
                        <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Settings Tab Content */}
        {activeTab === 'settings' && (
          <View className="py-6" style={{ paddingHorizontal: 16 }}>
            <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {[
                {
                  icon: 'notifications-outline',
                  label: 'Notifications',
                  onPress: () => Alert.alert('Notifications', 'Notification settings coming soon'),
                },
                {
                  icon: 'lock-closed-outline',
                  label: 'Privacy & Security',
                  onPress: () => Alert.alert('Privacy', 'Privacy settings coming soon'),
                },
                {
                  icon: 'help-circle-outline',
                  label: 'Help & Support',
                  onPress: () => Alert.alert('Help', 'Support coming soon'),
                },
                {
                  icon: 'document-text-outline',
                  label: 'Terms & Conditions',
                  onPress: () => Alert.alert('Terms', 'Terms & Conditions coming soon'),
                },
              ].map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  onPress={item.onPress}
                  className={`flex-row items-center px-6 py-4 ${
                    index !== 3 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <Ionicons name={item.icon} size={24} color="#374151" />
                  <Text className="text-gray-900 text-base ml-4 flex-1">{item.label}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
      <BottomNavBar />
    </View>
  );
};

export default ProfileScreen;
