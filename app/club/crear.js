import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import styles from '../../styles/crear_modal';
import Toast from 'react-native-toast-message';
import { AntDesign } from '@expo/vector-icons';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const CrearClubModal = ({ isOpen, onClose, clubId, onClubCreated, onClubUpdated }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    user_id: 1, 
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para seleccionar una imagen.');
      }
    })();
  }, []);

  useEffect(() => {
    if (clubId) {
      const fetchClub = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/club/get_club/${clubId}`);
          const club = response.data[0];
          setFormData({
            nombre: club.nombre,
            descripcion: club.descripcion,
            user_id: club.user_id,
          });
          setImagePreview(club.club_imagen || null);
        } catch (error) {
          Alert.alert('Error', 'No se pudo cargar el club');
          console.error('Error al obtener el club:', error);
        }
      };
      fetchClub();
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        user_id: 1,
      });
      setImagePreview(null);
      setCroppedImage(null);
    }
  }, [clubId]);
  

  const handleSelectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 300, height: 300 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );

        setCroppedImage(manipulatedImage.uri);
        setImagePreview(manipulatedImage.uri);
      }
    } catch (error) {
      console.error('Error al seleccionar la imagen:', error);
    }
  };

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const isFormValid = () => {
    return formData.nombre.trim() !== '' && formData.descripcion.trim() !== '';
  };

  const updateClubData = async () => {
    try {
      await axios.put(`${API_BASE_URL}/club/update_club/${clubId}`, {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        user_id: formData.user_id,
      });
      return true;
    } catch (error) {
      console.error('Error al actualizar el club:', error);
      Alert.alert('Error', 'No se pudo actualizar el club');
      return false;
    }
  };

  const updateClubImage = async () => {
    if (!croppedImage) return;

    const data = new FormData();
    const fileName = croppedImage.split('/').pop();
    data.append('image', {
      uri: croppedImage,
      type: 'image/jpeg',
      name: fileName || 'club_image.jpg',
    });

    try {
      await axios.put(`${API_BASE_URL}/club/update_club_image/${clubId}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error) {
      console.error('Error al actualizar la imagen:', error);
      Alert.alert('Error', 'No se pudo actualizar la imagen');
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      Alert.alert('Error', 'Todos los campos deben estar llenos');
      return;
    }
    
    if (clubId) {
      const clubUpdated = await updateClubData();
      if (clubUpdated && croppedImage) {
        await updateClubImage();
      }
      onClubUpdated();
    } else {
      const data = new FormData();
      data.append('nombre', formData.nombre);
      data.append('descripcion', formData.descripcion);
      data.append('user_id', formData.user_id);
      if (croppedImage) {
        const fileName = croppedImage.split('/').pop();
        data.append('image', {
          uri: croppedImage,
          type: 'image/jpeg',
          name: fileName || 'club_image.jpg',
        });
      }
      setLoading(true);
      try {
        await axios.post(`${API_BASE_URL}/club/post_club`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        onClubCreated();
        onClose();
        Toast.show({
          type: 'success',
          text1: 'Club registrado con éxito',
          position: 'bottom',
        });
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error al registrar club',
          position: 'bottom',
        });
      }finally {
        setLoading(false); 
      }
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{clubId ? 'Editar Club' : 'Registrar Club'}</Text>
          <TextInput style={styles.input} placeholder="Nombre*" value={formData.nombre} onChangeText={(text) => handleChange('nombre', text)} />
          <TextInput style={styles.input} placeholder="Descripción*" value={formData.descripcion} onChangeText={(text) => handleChange('descripcion', text)} multiline />
          <TouchableOpacity style={styles.fileButton} onPress={handleSelectImage}>
            <AntDesign name="camera" size={24} color="black" />
          </TouchableOpacity>
          {imagePreview && <Image source={{ uri: imagePreview }} style={styles.imagePreview} />}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.submitButton, !isFormValid() && styles.disabledButton]} onPress={handleSubmit} disabled={!isFormValid()}>
              <Text style={styles.buttonText}>{clubId ? 'Guardar Cambios' : 'Registrar'}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Toast />
      </View>
      <Modal visible={loading} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: '#fff', marginTop: 10 }}>Registrando club...</Text>
        </View>
      </Modal>
    </Modal>
  );
};

export default CrearClubModal;
