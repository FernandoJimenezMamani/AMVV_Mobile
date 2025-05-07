import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import styles from '../../styles/crear_modal';
import Toast from 'react-native-toast-message';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const EditarArbitro = ({ isOpen, onClose, personaId, onPersonaUpdated }) => {
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', fecha_nacimiento: '', ci: '', direccion: '',
    correo: '', genero: 'V', roles: [], image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && personaId) 
      setImagePreview(null);      
      setCroppedImage(null);
      fetchArbitro();
  }, [isOpen, personaId]);

  const fetchArbitro = async () => {
    if(!personaId)return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/arbitro/get_arbitroById/${personaId}`);
      const rolesArray = Array.isArray(res.data.roles)
        ? res.data.roles
        : res.data.roles.split(',').map(r => r.trim());
      setFormData({ ...res.data, roles: rolesArray, fecha_nacimiento: res.data.fecha_nacimiento.split('T')[0] });
      if (res.data.persona_imagen) setImagePreview(res.data.persona_imagen);
    } catch (err) {
      Alert.alert('Error', 'No se pudo cargar el árbitro.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled) {
        const img = await ImageManipulator.manipulateAsync(result.assets[0].uri, [{ resize: { width: 300, height: 300 } }], { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG });
        setCroppedImage(img.uri);
        setImagePreview(img.uri);
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen.');
    }
  };

  const handleSubmit = async () => {
    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (k === 'roles') data.append(k, v.join(','));
      else if (v) data.append(k, v);
    });
    if (croppedImage) {
      data.append('image', { uri: croppedImage, name: 'photo.jpg', type: 'image/jpeg' });
    }
    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/persona/update_persona_with_roles/${personaId}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onPersonaUpdated();
      onClose();
      Toast.show({
        type: 'success',
        text1: 'Arbitro actualizado con éxito',
        position: 'bottom',
      });
    } catch (err) {
      const msg =
      err.response?.data?.message ||
      err.response?.data?.mensaje ||
        'Error al registrar arbitro';
      Toast.show({
        type: 'error',
        text1: msg,
        position: 'bottom',
      });
    }finally {
      setLoading(false); 
    }
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Editar Árbitro</Text>
            <ScrollView>
              <View style={{ alignItems: 'center', marginBottom: 15 }}>
                <TouchableOpacity onPress={handleImageSelect} style={styles.fileButton}>
                  {imagePreview ? (
                      <Image source={{ uri: imagePreview }} style={styles.imagePreview} />
                  ) : (
                      <Text style={styles.fileButtonText}>Seleccionar imagen</Text>
                  )}
                  </TouchableOpacity>
              </View>         
              {['nombre', 'apellido', 'ci', 'direccion', 'correo'].map((f, i) => (
                <TextInput key={i} style={styles.input} placeholder={f} value={formData[f]} onChangeText={(t) => setFormData({ ...formData, [f]: t })} />
              ))}

              <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
                <Text>{formData.fecha_nacimiento}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={new Date(formData.fecha_nacimiento)}
                  mode="date"
                  display="default"
                  onChange={(e, d) => {
                    setShowDatePicker(false);
                    if (d) setFormData({ ...formData, fecha_nacimiento: d.toISOString().split('T')[0] });
                  }}
                />
              )}

              <Picker selectedValue={formData.genero} style={styles.picker} onValueChange={(v) => setFormData({ ...formData, genero: v })}>
                <Picker.Item label="Varón" value="V" />
                <Picker.Item label="Dama" value="D" />
              </Picker>

              <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
                  <Text style={styles.buttonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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

export default EditarArbitro;