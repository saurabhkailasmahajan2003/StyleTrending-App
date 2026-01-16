import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  StatusBar,
  Easing,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

/**
 * E-COMMERCE BACKGROUND
 * A high-quality image of a modern clothing rack/boutique.
 * This sets the mood for "Shopping" immediately.
 */
const BACKGROUND_IMAGE = 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1767158757/5-must-have-winter-wear-for-women_1100x_rsua6w.jpg';

const SplashScreen = ({ onFinish }) => {
  const { colors } = useTheme(); // We ignore isDark here to force a specific luxury look

  // --- Animation Values ---
  const bgScale = useRef(new Animated.Value(1.0)).current;      // Background Zoom
  const titleY = useRef(new Animated.Value(40)).current;        // Title slide up
  const subtitleY = useRef(new Animated.Value(40)).current;     // Subtitle slide up
  const opacityAnim = useRef(new Animated.Value(0)).current;    // Text Opacity
  const curtainAnim = useRef(new Animated.Value(0)).current;    // Final Slide Up
  const bagIconScale = useRef(new Animated.Value(0)).current;   // Shopping Bag Icon Pop

  useEffect(() => {
    // A. Endless Zoom Effect (Ken Burns)
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgScale, {
          toValue: 1.15,
          duration: 12000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(bgScale, {
          toValue: 1.0,
          duration: 12000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ])
    ).start();

    // B. Choreographed Entrance
    Animated.sequence([
      Animated.delay(300),

      // 1. Reveal Text & Icon
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.stagger(150, [
            // Icon pops in
            Animated.spring(bagIconScale, {
                toValue: 1,
                friction: 6,
                useNativeDriver: true,
            }),
            // Title slides up
            Animated.timing(titleY, {
                toValue: 0,
                duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            // Subtitle slides up
            Animated.timing(subtitleY, {
                toValue: 0,
                duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]),
      ]),

      // 2. Hold phase
      Animated.delay(1800),

      // 3. "Curtain" Exit - Slide the whole screen up
      Animated.timing(curtainAnim, {
        toValue: -height, 
        duration: 800,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onFinish) onFinish();
    });
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: curtainAnim }] },
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* --- LAYER 1: Retail Store Background --- */}
      <View style={StyleSheet.absoluteFill}>
        <Animated.Image
          source={{ uri: BACKGROUND_IMAGE }}
          style={[
            styles.backgroundImage,
            { transform: [{ scale: bgScale }] },
          ]}
          resizeMode="cover"
        />
        {/* Semi-transparent dark overlay to make text readable */}
        <View style={styles.overlay} />
      </View>

      {/* --- LAYER 2: Content --- */}
      <View style={styles.contentContainer}>
        
        {/* Shopping Bag Icon / Logo Placeholder */}
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: bagIconScale }] }]}>
            {/* Simple CSS shape for a shopping bag - Replace with your SVG/Icon */}
            <View style={styles.shoppingBag}>
                <View style={styles.bagHandle} />
            </View>
        </Animated.View>

        {/* Title */}
        <View style={styles.textMask}>
          <Animated.Text
            style={[
              styles.title,
              { opacity: opacityAnim, transform: [{ translateY: titleY }] },
            ]}
          >
            STYLETRENDING
          </Animated.Text>
        </View>

        {/* Decorative Line */}
        <Animated.View 
            style={[
                styles.separator, 
                { opacity: opacityAnim, transform: [{ scaleX: opacityAnim }] }
            ]} 
        />

        {/* Subtitle */}
        <View style={styles.textMask}>
          <Animated.Text
            style={[
              styles.subtitle,
              { opacity: opacityAnim, transform: [{ translateY: subtitleY }] },
            ]}
          >
            SHOP THE LATEST
          </Animated.Text>
        </View>
      </View>

      {/* --- LAYER 3: Footer --- */}
      <Animated.View style={[styles.bottomContainer, { opacity: opacityAnim }]}>
        <Text style={styles.loadingText}>PREPARING YOUR COLLECTION...</Text>
      </Animated.View>

    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a', 
    zIndex: 9999,
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  backgroundImage: {
    width: width,
    height: height + 50,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    // A gradient-like overlay (Darker at bottom/center)
    backgroundColor: 'rgba(0,0,0,0.5)', 
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // --- Icon Styles (CSS Shopping Bag) ---
  iconContainer: {
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  shoppingBag: {
    width: 50,
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 4,
  },
  bagHandle: {
    width: 24,
    height: 12,
    borderColor: '#FFF',
    borderWidth: 3,
    position: 'absolute',
    top: -12,
    left: 13,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  // --- Text Styles ---
  textMask: {
    overflow: 'hidden', 
    alignItems: 'center',
    marginVertical: 2,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F0F0F0',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  separator: {
    height: 2,
    width: 40,
    backgroundColor: '#FFFFFF', // Or use colors.primary
    marginVertical: 15,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '500',
  },
});

export default SplashScreen;