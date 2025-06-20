import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Modal, 
  Alert,ActivityIndicator,ScrollView} from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams } from 'expo-router';
import styles from '../../../styles/crear_modal';
import roleNames from '../../../constants/roles'; // Importa los roles
import Toast from 'react-native-toast-message';
import { AntDesign } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const RegistroJugadorClub = ({ isOpen, onClose, onJugadorCreated, club_jugador_id }) => {
  const [formData, setFormData] = useState({
    nombre: '', 
    apellido: '',
    fecha_nacimiento: '',
    ci: '',
    direccion: '',
    correo: '',
    genero: 'V',
    roles: [roleNames.Jugador],
    club_jugador_id: club_jugador_id,
  });
  const [errors, setErrors] = useState({});
  const [image, setImage] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para seleccionar una imagen.');
      }
    })();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre) newErrors.nombre = 'El campo nombre es obligatorio';
    if (!formData.apellido) newErrors.apellido = 'El campo apellido es obligatorio';
    if (!formData.fecha_nacimiento) newErrors.fecha_nacimiento = 'El campo fecha de nacimiento es obligatorio';
    if (!formData.ci) newErrors.ci = 'El campo cédula de identidad es obligatorio';
    if (!formData.direccion) newErrors.direccion = 'El campo dirección es obligatorio';
    if (!formData.correo) newErrors.correo = 'El campo correo es obligatorio';
    return newErrors;
  };

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri); // Asegúrate de usar result.assets[0].uri
    }
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setFormData({ ...formData, fecha_nacimiento: date.toISOString().split('T')[0] });
    }
  };

  
  const handleSubmit = async () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const data = new FormData();
    data.append('nombre', formData.nombre);
    data.append('apellido', formData.apellido);
    data.append('fecha_nacimiento', formData.fecha_nacimiento);
    data.append('ci', formData.ci);
    data.append('direccion', formData.direccion);
    data.append('correo', formData.correo);
    data.append('genero', formData.genero);
    data.append('roles', JSON.stringify(formData.roles));
    data.append('club_jugador_id', formData.club_jugador_id); // Agrega roles como JSON

    if (image) {
      data.append('image', {
        uri: image,
        name: 'profile.jpg',
        type: 'image/jpeg',
      });
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/persona/post_persona`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onClose();
      onJugadorCreated();
      setFormData({
        nombre: '', 
        apellido: '',
        fecha_nacimiento: '',
        ci: '',
        direccion: '',
        correo: '',
        genero: 'V',
        roles: [roleNames.Jugador],
        club_jugador_id: club_jugador_id,
      });
      setImage(null);
      setErrors({});
      setSelectedDate(new Date());
      Toast.show({
        type: 'success',
        text1: 'Jugador registrado con éxito',
        position: 'bottom',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error al registrar jugador',
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
          <Text style={styles.modalTitle}>Registrar Jugador</Text>
          <ScrollView >
            <View style={{ alignItems: 'center', marginBottom: 15 }}>
          <TouchableOpacity onPress={handleImagePick} style={styles.fileButton}>
          <AntDesign name="camera" size={24} color="black" />
          </TouchableOpacity>
          {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
          </View>
          <TextInput placeholder="Nombre" style={styles.input} value={formData.nombre} onChangeText={(text) => handleChange('nombre', text)} />
          <TextInput placeholder="Apellido" style={styles.input} value={formData.apellido} onChangeText={(text) => handleChange('apellido', text)} />
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
            <Text>
              {formData.fecha_nacimiento || 'Seleccionar fecha de nacimiento'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
          <TextInput placeholder="Cédula de Identidad" style={styles.input} value={formData.ci} onChangeText={(text) => handleChange('ci', text)} />
          <TextInput placeholder="Dirección" style={styles.input} value={formData.direccion} onChangeText={(text) => handleChange('direccion', text)} />
          <TextInput placeholder="Correo" style={styles.input} value={formData.correo} onChangeText={(text) => handleChange('correo', text)} keyboardType="email-address" />
          <Picker selectedValue={formData.genero} style={styles.picker} onValueChange={(itemValue) => handleChange('genero', itemValue)}>
            <Picker.Item label="Varón" value="V" />
            <Picker.Item label="Dama" value="D" />
          </Picker>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Registrar</Text>
            </TouchableOpacity>
          </View>
          </ScrollView>
        </View>
        <Toast />
      </View>
      <Modal visible={loading} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: '#fff', marginTop: 10 }}>Registrando arbitro...</Text>
        </View>
      </Modal>
    </Modal>
  );
};

export default RegistroJugadorClub;