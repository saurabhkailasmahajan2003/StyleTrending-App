/**
 * Notifications Screen - React Native Version
 * Shows all in-app notifications
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import HomeHeader from '../components/HomeHeader';
import BottomNavBar from '../components/BottomNavBar';

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    loadNotifications,
  } = useNotifications();
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'close-circle';
      case 'info':
      default:
        return 'information-circle';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      case 'error':
        return '#ef4444';
      case 'info':
      default:
        return '#3b82f6';
    }
  };

  const handleNotificationPress = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification data
    if (notification.data?.productId) {
      navigation.navigate('ProductDetail', { productId: notification.data.productId });
    }
    // Order tracking removed - order placing system is disabled
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ backgroundColor: colors.background }} edges={['top']}>
        <HomeHeader />
      </SafeAreaView>

      {/* Header */}
      <View style={{ backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginRight: 8 }}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={{ marginLeft: 8, backgroundColor: colors.error || '#EF4444', borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {notifications.length > 0 && (
          <TouchableOpacity
            onPress={markAllAsRead}
            style={{ paddingHorizontal: 12, paddingVertical: 6 }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {notifications.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 24 }}>
            <Ionicons name="notifications-off-outline" size={64} color={colors.textTertiary} />
            <Text style={{ color: colors.textSecondary, fontSize: 18, fontWeight: '600', marginTop: 16 }}>No notifications</Text>
            <Text style={{ color: colors.textTertiary, fontSize: 14, marginTop: 8, textAlign: 'center' }}>
              You're all caught up! New notifications will appear here.
            </Text>
          </View>
        ) : (
          <View style={{ paddingVertical: 16 }}>
            {notifications.map((notification, index) => (
              <TouchableOpacity
                key={notification.id}
                onPress={() => handleNotificationPress(notification)}
                style={{
                  backgroundColor: notification.read ? colors.card : (isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)'),
                  marginHorizontal: 16,
                  marginBottom: 12,
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: notification.read ? colors.border : (isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'),
                }}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                      backgroundColor: `${getNotificationColor(notification.type)}20`,
                    }}
                  >
                    <Ionicons
                      name={getNotificationIcon(notification.type)}
                      size={20}
                      color={getNotificationColor(notification.type)}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, flex: 1 }}>
                        {notification.title}
                      </Text>
                      {!notification.read && (
                        <View style={{ width: 8, height: 8, backgroundColor: colors.primary || '#3B82F6', borderRadius: 4, marginLeft: 8, marginTop: 4 }} />
                      )}
                    </View>
                    <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>
                      {notification.message}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 12, color: colors.textTertiary }}>
                        {formatTime(notification.createdAt)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => deleteNotification(notification.id)}
                        style={{ padding: 4 }}
                      >
                        <Ionicons name="close" size={16} color={colors.textTertiary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {notifications.length > 0 && (
        <View style={{ position: 'absolute', bottom: 80, left: 0, right: 0, paddingHorizontal: 16, paddingBottom: 16 }}>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Clear All Notifications',
                'Are you sure you want to clear all notifications?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: clearAllNotifications,
                  },
                ]
              );
            }}
            style={{ backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 12, alignItems: 'center' }}
          >
            <Text style={{ color: isDark ? '#000000' : '#FFFFFF', fontWeight: '600' }}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      <BottomNavBar />
    </View>
  );
};

export default NotificationsScreen;
