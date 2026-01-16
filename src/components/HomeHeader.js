/**
 * Home Header Component - Professional & Animated
 * Retains exact functionality but upgrades UI/UX
 */
import React, { useRef } from 'react';
import { 
  View, 
  Text, 
  Animated, 
  Pressable, 
  StyleSheet, 
  Platform 
} from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';

// --- ANIMATED BUTTON COMPONENT ---
// Creates that smooth "shrink" effect seen in professional apps like App Store/Cred
const ScalePress = ({ children, onPress, style, scaleTo = 0.92 }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: scaleTo,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={({ pressed }) => [style, { opacity: pressed ? 0.8 : 1 }]}
    >
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

const HomeHeader = () => {
  const navigation = useNavigation();
  const { isAuthenticated } = useAuth(); // Kept for logic preservation
  const { unreadCount } = useNotifications();
  const { colors, isDark } = useTheme();

  const openDrawer = () => {
    // Exact logic preserved from your snippet
    let nav = navigation;
    while (nav) {
      try {
        nav.dispatch(DrawerActions.openDrawer());
        return;
      } catch (error) {
        nav = nav.getParent();
        if (!nav) break;
      }
    }
    try {
      navigation.dispatch(DrawerActions.openDrawer());
    } catch (error) {
      console.warn('Could not open drawer:', error);
    }
  };

  // Dynamic Styles based on theme
  const containerStyle = {
    backgroundColor: colors.background,
  };

  return (
    <View style={[styles.container, containerStyle]}>
      
      {/* --- HAMBURGER MENU - LEFT MOST --- */}
      <ScalePress onPress={openDrawer} style={styles.iconWrapper}>
        <Ionicons name="menu-outline" size={26} color={colors.text} />
      </ScalePress>

      {/* --- CENTER SPACER --- */}
      <View style={{ flex: 1 }} />

      {/* --- ICONS SECTION - RIGHT SIDE --- */}
      <View style={styles.iconGroup}>
        
        {/* Notifications */}
        <ScalePress onPress={() => navigation.navigate('Notifications')} style={styles.iconWrapper}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.error, borderColor: colors.background }]}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </ScalePress>

        {/* Profile */}
        <ScalePress onPress={() => navigation.navigate('Profile')} style={styles.iconWrapper}>
          <Ionicons name="person-outline" size={24} color={colors.text} />
        </ScalePress>

        {/* Microphone Icon - Right Most */}
        <ScalePress onPress={() => {}} style={styles.iconWrapper}>
          <Ionicons name="mic-outline" size={24} color={colors.text} />
        </ScalePress>

      </View>
    </View>
  );
};

// --- PROFESSIONAL STYLES ---
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0,
    // Modern subtle shadow for depth
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5, // Tight lettering creates a "brand" look
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // Consistent spacing between icons
  },
  iconWrapper: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5, // Adds a "cutout" effect against the icon
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 10,
  },
});

export default HomeHeader;