import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import styles from '../../../styles/crear_modal';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const RegistroEquipo = ({ isOpen, onClose, onTeamCreated, clubId }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    club_id: clubId,
    categoria_id: null,
  });
  const [clubName, setClubName] = useState('Cargando...'); // Estado para el nombre del club
  const [categorias, setCategorias] = useState([]); // Estado para las categorías
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchClubName = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/club/get_club/${clubId}`);
        if (response.data && response.data.length > 0 && response.data[0].nombre) {
          setClubName(response.data[0].nombre); // Actualiza el nombre del club
        } else {
          setClubName('Club no encontrado');
        }
      } catch (error) {
        Alert.alert('Error', 'No se pudo cargar el nombre del club');
        console.error('Error al obtener el nombre del club:', error);
      }
    };

    const fetchCategorias = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/categoria/get_categoria`);
        setCategorias(response.data); // Actualiza las categorías
      } catch (error) {
        Alert.alert('Error', 'No se pudieron cargar las categorías');
        console.error('Error al obtener las categorías:', error);
      }
    };

    fetchClubName();
    fetchCategorias();
  }, [clubId]);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre) newErrors.nombre = 'El campo nombre es obligatorio';
    if (!formData.categoria_id) newErrors.categoria_id = 'Debe seleccionar una categoría';
    return newErrors;
  };

  const handleSubmit = async () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
  
    const payload = {
      nombre: formData.nombre,
      club_id: clubId,  // Asegurar que el club_id se envía correctamente
      categoria_id: formData.categoria_id, 
      user_id: 1,  // Agregar user_id como en React
    };
  
    try {
      const response = await axios.post(`${API_BASE_URL}/equipo/post_equipo`, payload, {
        headers: { 'Content-Type': 'application/json' }  // Especificar JSON
      });
  
      Alert.alert('Éxito', 'Equipo registrado con éxito');
      onClose();
      onTeamCreated();
    } catch (error) {
      console.error('Error al registrar el equipo:', error.response?.data || error);
      Alert.alert('Error', 'No se pudo registrar el equipo. Verifica los datos enviados.');
    }
  };
  

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Registrar Equipo</Text>

          {/* Mostrar el nombre del club */}
          <TextInput
            value={clubName}
            editable={false} // Campo no editable
            style={styles.input}
          />

          <TextInput
            placeholder="Nombre del Equipo"
            style={styles.input}
            value={formData.nombre}
            onChangeText={(text) => handleChange('nombre', text)}
          />
          {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}

          {/* Picker para seleccionar categoría */}
          <View style={styles.input}> 
            <Picker
                selectedValue={formData.categoria_id}
                onValueChange={(itemValue) => handleChange('categoria_id', itemValue)}
                style={styles.picker}
            >
                <Picker.Item label="Seleccione una categoría" value={null} />
                {categorias.map((categoria) => (
                <Picker.Item
                    key={categoria.id}
                    label={`${categoria.nombre} - ${categoria.genero === 'M' ? 'Masculino' : 'Femenino'}`}
                    value={categoria.id}
                />
                ))}
            </Picker>
            </View>
            {errors.categoria_id && <Text style={styles.errorText}>{errors.categoria_id}</Text>}


          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancelButton]}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={[styles.button, styles.submitButton]}>
              <Text style={styles.buttonText}>Registrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default RegistroEquipo;