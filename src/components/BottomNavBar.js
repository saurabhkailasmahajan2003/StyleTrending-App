import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Platform, 
  StyleSheet,
  // Removed Animated and Easing imports for the container
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics'; 

import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

// --- Sub-Component for Individual Tabs ---
const TabItem = ({ item, isActive, onPress, colors, isDark }) => {
  // NOTE: I kept the subtle icon bounce on press because it's good UX.
  // If you want ZERO animation here too, let me know and I can remove it.
  
  const handlePress = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {
        // Ignore if haptics fail
      }
    }
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.tabContainer}
      activeOpacity={0.9}
    >
      <View style={styles.iconWrapper}>
        {isActive && (
          <View style={[
            styles.activePill, 
            { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' } 
          ]} />
        )}

        <Ionicons
          name={isActive ? item.iconActive : item.icon}
          size={24}
          color={isActive ? colors.primary : colors.textSecondary}
        />

        {item.badge > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.error || '#EF4444', borderColor: isDark ? colors.card : '#FFFFFF' }]}>
            <Text style={styles.badgeText}>
              {item.badge > 9 ? '9+' : item.badge}
            </Text>
          </View>
        )}
      </View>

      <Text style={[
        styles.label, 
        { color: isActive ? colors.primary : colors.textSecondary, fontWeight: isActive ? '700' : '500' }
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
};

// --- Main Component ---
const BottomNavBar = ({ isVisible = true }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { cart, getCartItemsCount } = useCart();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  
  const cartItemCount = getCartItemsCount ? getCartItemsCount() : (cart?.length || 0);

  // 1. Instant Hide: If not visible, return null immediately (No animation)
  if (!isVisible) return null;

  const navItems = useMemo(() => [
    { name: 'Home', icon: 'home-outline', iconActive: 'home', route: 'Home' },
    { name: 'Shop', icon: 'grid-outline', iconActive: 'grid', route: 'Shop' },
    { name: 'Cart', icon: 'cart-outline', iconActive: 'cart', route: 'Cart', badge: cartItemCount },
    { name: 'Profile', icon: 'person-outline', iconActive: 'person', route: 'Profile' },
  ], [cartItemCount]);

  const isTabActive = (tabRoute) => {
    if (!route) return false;
    const currentName = route.name;
    if (tabRoute === 'Home') return currentName === 'Home';
    if (tabRoute === 'Shop') return ['Category', 'Search', 'ProductDetail'].includes(currentName);
    if (tabRoute === 'Cart') return ['Cart', 'Checkout'].includes(currentName);
    if (tabRoute === 'Profile') return ['Profile', 'Orders'].includes(currentName);
    return currentName === tabRoute;
  };

  const handleNavigation = (screenName) => {
    if (!navigation) return;
    const isActive = isTabActive(screenName);

    if (isActive) {
      const targetParams = { scrollToTop: Date.now() };
      if (screenName === 'Shop') {
        navigation.navigate('Category', { ...targetParams, category: 'all' });
      } else {
        navigation.navigate(screenName, targetParams);
      }
      return;
    }

    try {
      if (screenName === 'Shop') {
        navigation.navigate('Category', { category: 'all' });
      } else {
        navigation.navigate(screenName);
      }
    } catch (error) {
      console.warn('Navigation error:', error);
      navigation.reset({
        index: 0,
        routes: [{ name: screenName === 'Shop' ? 'Home' : screenName }],
      });
    }
  };

  const bottomPadding = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'ios' ? 10 : 10);

  return (
    <View 
      style={[
        styles.container, 
        { 
          paddingBottom: bottomPadding,
          backgroundColor: isDark ? colors.card : '#FFFFFF',
          borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          shadowColor: colors.shadow || '#000',
        }
      ]}
    >
      <View style={styles.contentContainer}>
        {navItems.map((item) => (
          <TabItem
            key={item.name}
            item={item}
            isActive={isTabActive(item.route)}
            onPress={() => handleNavigation(item.route)}
            colors={colors}
            isDark={isDark}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    borderTopWidth: 1,
    paddingTop: 8,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 20,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconWrapper: {
    width: 44, 
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  activePill: {
    position: 'absolute',
    width: 50,
    height: 32,
    borderRadius: 16,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
});

export default BottomNavBar;