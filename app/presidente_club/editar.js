import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Modal,ActivityIndicator,
  ScrollView} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import styles from '../../styles/crear_modal';
import Toast from 'react-native-toast-message';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const EditarPresidente = ({ isOpen, onClose, presidenteId, onPresidenteUpdated }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    fecha_nacimiento: new Date().toISOString().split('T')[0],
    ci: '',
    direccion: '',
    correo: '',
    genero: 'V',
    roles: [],
    club_jugador_id: null, // Agregado
    club_presidente_id: null,
    club_delegado_id: null,
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [clubes, setClubes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPresidente = async () => {
      if (!presidenteId) return;
      try {
        const response = await axios.get(`${API_BASE_URL}/presidente_club/get_presidenteById/${presidenteId}`);
        const rolesArray = Array.isArray(response.data.roles)
          ? response.data.roles
          : response.data.roles.split(',').map((role) => role.trim());

          setFormData({
          ...response.data,
          fecha_nacimiento: response.data.fecha_nacimiento.split('T')[0],
          roles: rolesArray,
          club_jugador_id: response.data.club_jugador || null, // Agregado
          club_presidente_id: response.data.club_presidente || null,
          club_delegado_id: response.data.club_delegado || null,
          image: response.data.persona_imagen,
        });
        setImagePreview(response.data.persona_imagen);
      } catch (error) {
        console.log('Error al obtener los datos del presidente:', error);
      }
    };
    fetchPresidente();
  }, [presidenteId]);

  useEffect(() => {
    const fetchClubes = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/club/get_club`);
        setClubes(response.data);
      } catch (error) {
        console.log('Error al obtener los clubes:', error);
      }
    };
    fetchClubes();
  }, []);

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
      console.log('Error al seleccionar la imagen:', error);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setFormData({ ...formData, fecha_nacimiento: formattedDate });
    }
  };

  const handleSubmit = async () => {
    const data = new FormData();

    data.append('nombre', formData.nombre || '');
    data.append('apellido', formData.apellido || '');
    data.append('fecha_nacimiento', formData.fecha_nacimiento || '');
    data.append('ci', formData.ci || '');
    data.append('direccion', formData.direccion || '');
    data.append('correo', formData.correo || '');
    data.append('genero', formData.genero || 'V');
    data.append('roles', formData.roles.join(',') || '');
    data.append('club_jugador_id', formData.club_jugador_id || ''); // Agregado
    data.append('club_presidente_id', formData.club_presidente_id || '');
    data.append('club_delegado_id', formData.club_presidente_id || '');

    if (croppedImage) {
      const file = {
        uri: croppedImage,
        name: 'photo.jpg',
        type: 'image/jpeg',
      };
      data.append('image', file);
    }
    setLoading(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/persona/update_persona_with_roles/${presidenteId}`,
        data,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      console.log('Respuesta del servidor:', response.data);
      onPresidenteUpdated();
      onClose();
      Toast.show({
        type: 'success',
        text1: 'Presidente actualizado con éxito',
        position: 'bottom',
      });
    } catch (err) {
      const msg =
      err.response?.data?.message ||
      err.response?.data?.mensaje ||
        'Error al registrar jugador';
      Toast.show({
        type: 'error',
        text1: msg,
        position: 'bottom',
      });
    }finally {
      setLoading(false); 
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Editar Presidente</Text>
          <ScrollView>
            <View style={{ alignItems: 'center', marginBottom: 15 }}>
              <TouchableOpacity onPress={handleSelectImage} style={styles.fileButton}>
                {imagePreview ? (
                  <Image source={{ uri: imagePreview }} style={styles.imagePreview} />
                ) : (
                  <Text style={styles.fileButtonText}>Seleccionar Foto</Text>
                )}
              </TouchableOpacity>
            </View>
            <TextInput style={styles.input} placeholder="Nombre" value={formData.nombre} onChangeText={(text) => setFormData({ ...formData, nombre: text })} />
            <TextInput style={styles.input} placeholder="Apellido" value={formData.apellido} onChangeText={(text) => setFormData({ ...formData, apellido: text })} />
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
              <Text>{formData.fecha_nacimiento || 'Seleccionar fecha de nacimiento'}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker value={new Date(formData.fecha_nacimiento)} mode="date" display="default" onChange={handleDateChange} />
            )}
            <TextInput style={styles.input} placeholder="Cédula" value={formData.ci} onChangeText={(text) => setFormData({ ...formData, ci: text })} />
            <TextInput style={styles.input} placeholder="Dirección" value={formData.direccion} onChangeText={(text) => setFormData({ ...formData, direccion: text })} />
            <TextInput style={styles.input} placeholder="Correo" value={formData.correo} onChangeText={(text) => setFormData({ ...formData, correo: text })} />
            <Picker selectedValue={formData.genero} style={styles.picker} onValueChange={(itemValue) => setFormData({ ...formData, genero: itemValue })}>
              <Picker.Item label="Varón" value="V" />
              <Picker.Item label="Dama" value="D" />
            </Picker>
            <Picker selectedValue={formData.club_presidente_id} style={styles.picker} onValueChange={(itemValue) => setFormData({ ...formData, club_presidente_id: itemValue })}>
              {clubes.map((club) => (
                <Picker.Item key={club.id} label={club.nombre} value={club.id} />
              ))}
            </Picker>
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={onClose} style={styles.cancelButton}><Text style={styles.buttonText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}><Text style={styles.buttonText}>Guardar</Text></TouchableOpacity>
            </View>
          </ScrollView>
        </View>
        <Toast />
      </View>
      <Modal visible={loading} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: '#fff', marginTop: 10 }}>Actualizando presidente...</Text>
        </View>
      </Modal>
    </Modal>
  );
};

export default EditarPresidente;