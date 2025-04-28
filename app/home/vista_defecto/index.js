import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import defaultBackground from '../../../assets/logo.png'; // Ajusta la ruta si es necesario

const VistaDefault = () => {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image 
          source={defaultBackground} 
          style={styles.image} 
          resizeMode="contain" 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '60%',
    maxWidth: 800,
    aspectRatio: 1, // Mantiene la relación 1:1
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    opacity: 0.2,
    borderRadius: 10,
  },
});

export default VistaDefault;
