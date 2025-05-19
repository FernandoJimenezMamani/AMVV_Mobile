import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

const ImageCropperModal = ({ isOpen, onClose, onCropConfirm }) => {
  const [image, setImage] = useState(null); // Estado para la imagen seleccionada

  // Pedir permisos de acceso a la galería
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para seleccionar una imagen.');
      }
    })();
  }, []);

  // Función para abrir el selector de imágenes y recortar
  const handleSelectImage = async () => {
    try {
      // Abrir la galería
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, // Permite recorte dentro del selector
        aspect: [1, 1], // Define un recorte cuadrado
        quality: 0.8, // Calidad de la imagen
      });

      if (!result.canceled) {
        const croppedImage = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 300, height: 300 } }], // Recortar la imagen a 300x300 px
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );

        // Guardar la imagen recortada
        setImage(croppedImage.uri);

        // Pasar la imagen recortada al componente padre
        onCropConfirm(croppedImage.uri);
      }
    } catch (error) {
      console.log('Error al seleccionar o recortar la imagen:', error);
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Seleccionar Imagen</Text>

          {/* Mostrar la imagen seleccionada */}
          {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

          {/* Botón para seleccionar y recortar la imagen */}
          <TouchableOpacity style={styles.selectButton} onPress={handleSelectImage}>
            <Text style={styles.buttonText}>Seleccionar y Recortar</Text>
          </TouchableOpacity>

          {/* Botón para cerrar el modal */}
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  selectButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ImageCropperModal;
