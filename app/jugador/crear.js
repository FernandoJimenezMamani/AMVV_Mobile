import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker'; // Importa DateTimePicker
import styles from '../../styles/crear_modal';
import roleNames from '../../constants/roles';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const CrearJugadorModal = ({ isOpen, onClose, jugadorId, onJugadorCreated, onJugadorUpdated }) => {
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
  const [showDatePicker, setShowDatePicker] = useState(false); // Estado para mostrar el DatePicker
  const [selectedDate, setSelectedDate] = useState(new Date()); // Estado para la fecha seleccionada

  useEffect(() => {
    if (jugadorId) {
      const fetchJugador = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/jugador/get_jugadorById/${jugadorId}`);
          const jugador = response.data;
          setFormData({
            nombre: jugador.nombre,
            apellido: jugador.apellido,
            fecha_nacimiento: jugador.fecha_nacimiento.split('T')[0],
            ci: jugador.ci,
            direccion: jugador.direccion,
            correo: jugador.correo,
            genero: jugador.genero,
            club_jugador_id: jugador.club_jugador_id,
            roles: jugador.roles || [roleNames.Jugador],
          });
          setImagePreview(jugador.persona_imagen || null);
          if (jugador.fecha_nacimiento) {
            setSelectedDate(new Date(jugador.fecha_nacimiento)); // Establece la fecha seleccionada
          }
        } catch (error) {
          Alert.alert('Error', 'No se pudo cargar el jugador');
          console.error(jugadorId, error);
        }
      };
      fetchJugador();
    } else {
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
      setSelectedDate(new Date()); // Restablece la fecha seleccionada
    }
  }, [jugadorId]);

  useEffect(() => {
    const fetchClubes = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/club/get_club`);
        setClubes(response.data);
      } catch (error) {
        Alert.alert('Error', 'No se pudo obtener la lista de clubes');
        console.error('Error al obtener los clubes:', error);
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
      console.error('Error al seleccionar la imagen:', error);
    }
  };

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }));
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false); // Oculta el DatePicker
    if (date) {
      setSelectedDate(date);
      setFormData({
        ...formData,
        fecha_nacimiento: date.toISOString().split('T')[0], // Formato YYYY-MM-DD
      });
    }
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
    data.append('roles', JSON.stringify(formData.roles)); // Enviar roles como JSON
    data.append('club_jugador_id', formData.club_jugador_id || null);
    data.append('club_presidente_id', formData.club_presidente_id || null);
    data.append('club_delegado_id', formData.club_delegado_id || null);
  
    if (croppedImage) {
      const fileName = croppedImage.split('/').pop();
      data.append('image', {
        uri: croppedImage,
        type: 'image/jpeg',
        name: fileName || 'arbitro_image.jpg',
      });
    }
  
    try {
      if (arbitroId) {
        await axios.put(`${API_BASE_URL}/persona/update_persona_with_roles/${arbitroId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        onArbitroUpdated();
      } else {
        await axios.post(`${API_BASE_URL}/persona/post_persona`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        onArbitroCreated();
      }
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al guardar el árbitro');
      console.error('Error al guardar el árbitro:', error.response?.data || error.message);
    }
  };
  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{jugadorId ? 'Editar Jugador' : 'Registrar Jugador'}</Text>

          <TouchableOpacity style={styles.fileButton} onPress={handleSelectImage}>
            <Text style={styles.fileButtonText}>Seleccionar imagen*</Text>
          </TouchableOpacity>
          {imagePreview && <Image source={{ uri: imagePreview }} style={styles.imagePreview} />}

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
              <Text style={styles.buttonText}>{jugadorId ? 'Guardar Cambios' : 'Registrar'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CrearJugadorModal;