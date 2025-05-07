// EditarClubModal.js
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import styles from '../../styles/crear_modal';
import Toast from 'react-native-toast-message';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const EditarClubModal = ({ isOpen, onClose, clubId, onClubUpdated }) => {
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', user_id: 1 });
  const [imagePreview, setImagePreview] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (clubId) fetchClub();
  }, [clubId]);

  const fetchClub = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/club/get_club/${clubId}`);
      const club = res.data[0];
      setFormData({ nombre: club.nombre, descripcion: club.descripcion, user_id: club.user_id });
      setImagePreview(club.club_imagen || null);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el club');
    }
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const manipulated = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 300, height: 300 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      setCroppedImage(manipulated.uri);
      setImagePreview(manipulated.uri);
    }
  };

  const handleUpdate = async () => {
    if (!formData.nombre.trim() || !formData.descripcion.trim()) {
      Alert.alert('Campos requeridos', 'Completa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/club/update_club/${clubId}`, formData);

      if (croppedImage) {
        const data = new FormData();
        const fileName = croppedImage.split('/').pop();
        data.append('image', {
          uri: croppedImage,
          name: fileName,
          type: 'image/jpeg',
        });

        await axios.put(`${API_BASE_URL}/club/update_club_image/${clubId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      onClubUpdated();
      onClose();
      Toast.show({
        type: 'success',
        text1: 'Club actualizado con éxito',
        position: 'bottom',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error al actualizar el club',
        position: 'bottom',
      });
    } finally {
       setLoading(false);
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Editar Club</Text>
          <TextInput style={styles.input} value={formData.nombre} onChangeText={(t) => setFormData({ ...formData, nombre: t })} placeholder="Nombre*" />
          <TextInput style={styles.input} value={formData.descripcion} onChangeText={(t) => setFormData({ ...formData, descripcion: t })} placeholder="Descripción*" multiline />

          <TouchableOpacity style={styles.fileButton} onPress={handleImagePick}>
            <Text style={styles.fileButtonText}>Cambiar imagen</Text>
          </TouchableOpacity>
          {imagePreview && <Image source={{ uri: imagePreview }} style={styles.imagePreview} />}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={handleUpdate} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        <Toast />
      </View>
      <Modal visible={loading} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: '#fff', marginTop: 10 }}>Actualizando jugador...</Text>
        </View>
      </Modal>
    </Modal>
  );
};

export default EditarClubModal;
