import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");
const LOGO_SIZE = Math.min(width * 0.7, 280);

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1.05,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => onFinish());
    }, 1800);

    return () => clearTimeout(timer);
  }, [onFinish, opacity, scale]);

  return (
    <Animated.View style={[styles.container, { opacity }]} pointerEvents="none">
      <Animated.View style={[styles.logoWrap, { transform: [{ scale }] }]}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  logoWrap: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
});
