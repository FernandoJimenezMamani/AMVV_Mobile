import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Modal,
  ActivityIndicator,ScrollView  } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { AntDesign } from '@expo/vector-icons';
import roleNames from '../../constants/roles';
import styles from '../../styles/crear_modal';
import Toast from 'react-native-toast-message';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const RegistroArbitro = ({ isOpen, onClose, onArbitroCreated }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    fecha_nacimiento: new Date().toISOString().split('T')[0], // Inicializar como string en formato 'YYYY-MM-DD'
    ci: '',
    direccion: '',
    correo: '',
    genero: 'V',
    roles: [roleNames.Arbitro],
  });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

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

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toISOString().split('T')[0]; // Formatear la fecha como 'YYYY-MM-DD'
      handleChange('fecha_nacimiento', formattedDate);
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
      roles: [roleNames.Arbitro],
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

    // Adjuntar los campos del formulario
    data.append('nombre', formData.nombre);
    data.append('apellido', formData.apellido);
    data.append('fecha_nacimiento', formData.fecha_nacimiento);
    data.append('ci', formData.ci);
    data.append('direccion', formData.direccion);
    data.append('correo', formData.correo);
    data.append('genero', formData.genero);
    data.append('roles', JSON.stringify(formData.roles));

    // Adjuntar la imagen si existe
    if (croppedImage) {
      const file = {
        uri: croppedImage,
        name: 'photo.jpg', // Nombre del archivo
        type: 'image/jpeg', // Tipo MIME
      };
      data.append('image', file);
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/persona/post_persona`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Respuesta del servidor:', response.data);
      onClose();
      onArbitroCreated();
      resetForm();
            Toast.show({
              type: 'success',
              text1: 'Arbitro registrado con éxito',
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
    <Modal visible={isOpen} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Registrar Árbitro</Text>
          <ScrollView >
            <View style={{ alignItems: 'center', marginBottom: 15 }}>
              <TouchableOpacity style={styles.fileButton} onPress={handleSelectImage}>
                {imagePreview ? (
                  <Image source={{ uri: imagePreview }} style={styles.imagePreview} />
                ) : (
                  <AntDesign name="camera" size={24} color="black" />
                )}
              </TouchableOpacity>
            </View>
          <TextInput style={styles.input} placeholder="Nombre" value={formData.nombre} onChangeText={(text) => handleChange('nombre', text)} />
          {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}
          <TextInput style={styles.input} placeholder="Apellido" value={formData.apellido} onChangeText={(text) => handleChange('apellido', text)} />
          {errors.apellido && <Text style={styles.errorText}>{errors.apellido}</Text>}
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
            <Text>{formData.fecha_nacimiento || 'Seleccionar fecha de nacimiento'}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker value={selectedDate} mode="date" display="default" onChange={handleDateChange} />
          )}
          {errors.fecha_nacimiento && <Text style={styles.errorText}>{errors.fecha_nacimiento}</Text>}
          <TextInput style={styles.input} placeholder="Cédula" value={formData.ci} onChangeText={(text) => handleChange('ci', text)} />
          {errors.ci && <Text style={styles.errorText}>{errors.ci}</Text>}
          <TextInput
            style={styles.input}
            placeholder="Dirección"
            value={formData.direccion}
            onChangeText={(text) => handleChange('direccion', text)}
          />
          {errors.direccion && <Text style={styles.errorText}>{errors.direccion}</Text>}
          <TextInput style={styles.input} placeholder="Correo" value={formData.correo} onChangeText={(text) => handleChange('correo', text)} keyboardType="email-address" />
          {errors.correo && <Text style={styles.errorText}>{errors.correo}</Text>}
          <Picker selectedValue={formData.genero} style={styles.picker} onValueChange={(itemValue) => handleChange('genero', itemValue)}>
            <Picker.Item label="Varón" value="V" />
            <Picker.Item label="Dama" value="D" />
          </Picker>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}><Text style={styles.buttonText}>Cancelar</Text></TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}><Text style={styles.buttonText}>Registrar</Text></TouchableOpacity>
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

export default RegistroArbitro;