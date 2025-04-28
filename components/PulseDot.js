// components/PulseDot.js
import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';

const PulseDot = ({ size = 10, color = 'red' }) => {
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          backgroundColor: color,
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: [{ scale: pulseAnim }],
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  dot: {
    marginRight: 5,
  },
});

export default PulseDot;
