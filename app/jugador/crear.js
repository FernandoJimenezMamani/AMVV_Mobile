import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator ,
  ScrollView
} from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import styles from '../../styles/crear_modal';
import roleNames from '../../constants/roles';
import Toast from 'react-native-toast-message';
import { AntDesign } from '@expo/vector-icons';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const CrearJugadorModal = ({ isOpen, onClose, onJugadorCreated }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    fecha_nacimiento: '',
    ci: '',
    direccion: '',
    correo: '',
    genero: 'V',
    club_jugador_id: null,
    roles: [roleNames.Jugador],
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [clubes, setClubes] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClubes = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/club/get_club`);
        setClubes(response.data);
      } catch (error) {
        Alert.alert('Error', 'No se pudo obtener la lista de clubes');
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

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setFormData({
        ...formData,
        fecha_nacimiento: date.toISOString().split('T')[0],
      });
    }
  };
  
  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      fecha_nacimiento: '',
      ci: '',
      direccion: '',
      correo: '',
      genero: 'V',
      club_jugador_id: null,
      roles: [roleNames.Jugador],
    });
    setImagePreview(null);
    setCroppedImage(null);
    setErrors({});
    setSelectedDate(new Date());
  };
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre) newErrors.nombre = 'El campo nombre es obligatorio';
    if (!formData.apellido) newErrors.apellido = 'El campo apellido es obligatorio';
    if (!formData.fecha_nacimiento) newErrors.fecha_nacimiento = 'El campo fecha de nacimiento es obligatorio';
    if (!formData.ci) newErrors.ci = 'El campo cédula de identidad es obligatorio';
    if (!formData.direccion) newErrors.direccion = 'El campo dirección es obligatorio';
    if (!formData.correo) newErrors.correo = 'El campo correo es obligatorio';
    if (!formData.club_jugador_id) newErrors.club_jugador_id = 'Debe seleccionar un club';
    return newErrors;
  };

  const handleSubmit = async () => {
    setErrors({});
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'roles') {
        data.append(key, JSON.stringify(value));
      } else {
        data.append(key, value);
      }
    });

    if (croppedImage) {
      const fileName = croppedImage.split('/').pop();
      data.append('image', {
        uri: croppedImage,
        type: 'image/jpeg',
        name: fileName || 'jugador_image.jpg',
      });
    }
    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/persona/post_persona`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onJugadorCreated();
      onClose();
      resetForm();
      Toast.show({
        type: 'success',
        text1: 'Jugador registrado con éxito',
        position: 'bottom',
      });
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.mensaje ||
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
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Registrar Jugador</Text>
          <ScrollView>
            <View style={{ alignItems: 'center', marginBottom: 15 }}>
              <TouchableOpacity style={styles.fileButton} onPress={handleSelectImage}>
                {imagePreview ? (
                  <Image source={{ uri: imagePreview }} style={styles.imagePreview} />
                ) : (
                  <AntDesign name="camera" size={24} color="black" />
                )}
              </TouchableOpacity>
            </View>
          <TextInput
            style={styles.input}
            placeholder="Nombre*"
            value={formData.nombre}
            onChangeText={(text) => handleChange('nombre', text)}
          />
          {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Apellido*"
            value={formData.apellido}
            onChangeText={(text) => handleChange('apellido', text)}
          />
          {errors.apellido && <Text style={styles.errorText}>{errors.apellido}</Text>}

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
          {errors.fecha_nacimiento && <Text style={styles.errorText}>{errors.fecha_nacimiento}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Cédula de Identidad*"
            value={formData.ci}
            onChangeText={(text) => handleChange('ci', text)}
          />
          {errors.ci && <Text style={styles.errorText}>{errors.ci}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Dirección*"
            value={formData.direccion}
            onChangeText={(text) => handleChange('direccion', text)}
          />
          {errors.direccion && <Text style={styles.errorText}>{errors.direccion}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Correo*"
            value={formData.correo}
            onChangeText={(text) => handleChange('correo', text)}
          />
          {errors.correo && <Text style={styles.errorText}>{errors.correo}</Text>}

          <Picker
            selectedValue={formData.club_jugador_id}
            style={styles.picker}
            onValueChange={(value) => handleChange('club_jugador_id', value)}
          >
            <Picker.Item label="Selecciona un club" value={null} />
            {clubes.map((club) => (
              <Picker.Item key={club.id} label={club.nombre} value={club.id} />
            ))}
          </Picker>
          {errors.club_jugador_id && <Text style={styles.errorText}>{errors.club_jugador_id}</Text>}

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
          <Text style={{ color: '#fff', marginTop: 10 }}>Registrando jugador...</Text>
        </View>
      </Modal>

    </Modal>
    
  );
};

export default CrearJugadorModal;
