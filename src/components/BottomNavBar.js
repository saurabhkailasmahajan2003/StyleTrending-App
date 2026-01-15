/**
 * Bottom Navigation Bar Component
 * Modern, aesthetically pleasing bottom navigation with smooth animations
 */
import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

const BottomNavBar = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { cartItems } = useCart();
  const { colors, isDark } = useTheme();
  const cartItemCount = cartItems?.length || 0;
  const insets = useSafeAreaInsets();
  
  // Calculate bottom padding to avoid overlap with system controls
  const bottomPadding = insets.bottom > 0 ? insets.bottom + 4 : (Platform.OS === 'ios' ? 8 : 12);

  const isActive = (routeName) => {
    if (routeName === 'Home' && route.name === 'Home') return true;
    if (routeName === 'Shop' && (route.name === 'Category' || route.name === 'Search')) return true;
    if (routeName === 'Cart' && route.name === 'Cart') return true;
    if (routeName === 'Profile' && route.name === 'Profile') return true;
    return false;
  };

  const navigateToScreen = (screenName) => {
    const currentRoute = route.name;
    const isActive = 
      (screenName === 'Home' && currentRoute === 'Home') ||
      (screenName === 'Shop' && (currentRoute === 'Category' || currentRoute === 'Search')) ||
      (screenName === 'Cart' && currentRoute === 'Cart') ||
      (screenName === 'Profile' && currentRoute === 'Profile');

    // If already on this screen, trigger scroll to top
    if (isActive) {
      // Emit navigation event to trigger scroll to top
      navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      // Also use navigate with scrollToTop param
      if (screenName === 'Home') {
        navigation.navigate('Home', { scrollToTop: true });
      } else if (screenName === 'Shop') {
        navigation.navigate('Category', { category: 'all', scrollToTop: true });
      } else if (screenName === 'Cart') {
        navigation.navigate('Cart', { scrollToTop: true });
      } else if (screenName === 'Profile') {
        navigation.navigate('Profile', { scrollToTop: true });
      }
      return;
    }

    // Navigate to new screen
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
    { name: 'Home', icon: 'home-outline', iconActive: 'home', route: 'Home' },
    { name: 'Shop', icon: 'grid-outline', iconActive: 'grid', route: 'Shop' },
    { name: 'Cart', icon: 'bag-outline', iconActive: 'bag', route: 'Cart', badge: cartItemCount },
    { name: 'Profile', icon: 'person-outline', iconActive: 'person', route: 'Profile' },
  ];

  return (
    <View 
      style={{ 
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
      }}
    >
      <View 
        style={{
          backgroundColor: isDark ? colors.card : '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
          paddingTop: 10,
          paddingBottom: bottomPadding,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0.3 : 0.08,
          shadowRadius: 12,
          elevation: 16,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 8 }}>
          {navItems.map((item) => {
            const active = isActive(item.route);
            return (
              <TouchableOpacity
                key={item.name}
                onPress={() => navigateToScreen(item.route)}
                style={{ 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  flex: 1,
                  paddingVertical: 4,
                }}
                activeOpacity={0.7}
              >
                <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center', minWidth: 56 }}>
                  {/* Active indicator background */}
                  {active && (
                    <View
                      style={{
                        position: 'absolute',
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                      }}
                    />
                  )}
                  
                  {/* Icon Container */}
                  <View style={{ position: 'relative', marginBottom: 4 }}>
                    <Ionicons 
                      name={active ? item.iconActive : item.icon} 
                      size={active ? 26 : 24} 
                      color={active ? colors.primary : colors.textSecondary} 
                    />
                    
                    {/* Badge */}
                    {item.badge && item.badge > 0 && (
                      <View 
                        style={{
                          position: 'absolute',
                          top: -8,
                          right: -10,
                          backgroundColor: '#EF4444',
                          borderRadius: 10,
                          minWidth: 20,
                          height: 20,
                          paddingHorizontal: 6,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: 2,
                          borderColor: isDark ? colors.card : '#FFFFFF',
                          shadowColor: '#EF4444',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.4,
                          shadowRadius: 4,
                          elevation: 6,
                        }}
                      >
                        <Text 
                          style={{ 
                            color: '#FFFFFF', 
                            fontSize: 11, 
                            fontWeight: '800',
                            letterSpacing: 0.3,
                          }}
                        >
                          {item.badge > 9 ? '9+' : item.badge}
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  {/* Label */}
                  <Text 
                    style={{
                      fontSize: 12,
                      fontWeight: active ? '700' : '500',
                      color: active ? colors.primary : colors.textSecondary,
                      letterSpacing: 0.2,
                      marginTop: 2,
                    }}
                  >
                    {item.name}
                  </Text>
                  
                  {/* Active indicator dot */}
                  {active && (
                    <View
                      style={{
                        position: 'absolute',
                        bottom: -4,
                        width: 5,
                        height: 5,
                        borderRadius: 2.5,
                        backgroundColor: colors.primary,
                      }}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default BottomNavBar;

