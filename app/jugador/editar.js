import React, { useEffect, useState } from 'react';
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

const EditarJugadorModal = ({ isOpen, onClose, jugadorId, onJugadorUpdated }) => {
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', fecha_nacimiento: '', ci: '', direccion: '',
    correo: '', genero: 'V', club_jugador_id: null, roles: [],image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [clubes, setClubes] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && jugadorId) fetchJugador();
  }, [isOpen, jugadorId]);

  const fetchJugador = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/jugador/get_jugadorById/${jugadorId}`);
      const data = res.data;
      setFormData({
        nombre: data.nombre,
        apellido: data.apellido,
        fecha_nacimiento: data.fecha_nacimiento.split('T')[0],
        ci: data.ci,
        direccion: data.direccion,
        correo: data.correo,
        genero: data.genero,
        club_jugador_id: data.club_jugador,
        roles: Array.isArray(data.roles) ? data.roles : data.roles.split(',').map(r => r.trim()),
      });
      if (data.persona_imagen) setImagePreview(null);
      setImagePreview(data.persona_imagen);
      if (data.fecha_nacimiento) setSelectedDate(new Date(data.fecha_nacimiento));
    } catch (err) {
      Alert.alert('Error', 'No se pudo cargar el jugador.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchClubes = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/club/get_club`);
        setClubes(res.data);
      } catch (err) {
        Alert.alert('Error', 'No se pudieron cargar los clubes.');
      }
    };
    fetchClubes();
  }, []);

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

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (e, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setFormData({ ...formData, fecha_nacimiento: date.toISOString().split('T')[0] });
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
      await axios.put(`${API_BASE_URL}/persona/update_persona_with_roles/${jugadorId}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onJugadorUpdated();
      onClose();
      Toast.show({
        type: 'success',
        text1: 'Jugador actualizado con éxito',
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

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Editar Jugador</Text>
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
              <TextInput key={i} style={styles.input} placeholder={f} value={formData[f]} onChangeText={(t) => handleChange(f, t)} />
            ))}

            <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
              <Text>{formData.fecha_nacimiento || 'Seleccionar fecha de nacimiento'}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker value={selectedDate} mode="date" display="default" onChange={handleDateChange} />
            )}

            <Picker selectedValue={formData.genero} style={styles.picker} onValueChange={(v) => handleChange('genero', v)}>
              <Picker.Item label="Varón" value="V" />
              <Picker.Item label="Dama" value="D" />
            </Picker>

            <Picker selectedValue={formData.club_jugador_id} style={styles.picker} onValueChange={(v) => handleChange('club_jugador_id', v)}>
              <Picker.Item label="Selecciona un club" value={null} />
              {clubes.map((club) => (
                <Picker.Item key={club.id} label={club.nombre} value={club.id} />
              ))}
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

export default EditarJugadorModal;