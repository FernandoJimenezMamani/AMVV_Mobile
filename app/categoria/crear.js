import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../../styles/crear_modal';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const CrearCategoriaModal = ({ isOpen, onClose, categoriaId, onCategoriaCreated, onCategoriaUpdated }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    genero: 'V', // Valor predeterminado
    division: 'MY', // Valor predeterminado
    edad_minima: '',
    edad_maxima: '',
    costo_traspaso: '',
    user_id: 1, // Valor predeterminado
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (categoriaId) {
      const fetchCategoria = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/categoria/get_categoriaId/${categoriaId}`);
          const categoria = response.data;
          setFormData({
            nombre: categoria.nombre,
            genero: categoria.genero,
            division: categoria.division,
            edad_minima: categoria.edad_minima,
            edad_maxima: categoria.edad_maxima,
            costo_traspaso: categoria.costo_traspaso,
            user_id: categoria.user_id,
          });
        } catch (error) {
          Alert.alert('Error', 'No se pudo cargar la categoría');
          console.error('Error al obtener la categoría:', error);
        }
      };
      fetchCategoria();
    } else {
      setFormData({
        nombre: '',
        genero: 'V',
        division: 'MY',
        edad_minima: '',
        edad_maxima: '',
        costo_traspaso: '',
        user_id: 1,
      });
    }
  }, [categoriaId]);

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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre) {
      newErrors.nombre = 'El campo nombre es obligatorio';
    }
    if (formData.edad_minima && isNaN(formData.edad_minima)) {
      newErrors.edad_minima = 'La edad mínima debe ser un número';
    }
    if (formData.edad_maxima && isNaN(formData.edad_maxima)) {
      newErrors.edad_maxima = 'La edad máxima debe ser un número';
    }
    if (formData.edad_minima && formData.edad_maxima && Number(formData.edad_minima) > Number(formData.edad_maxima)) {
      newErrors.edad_minima = 'La edad mínima no puede ser mayor que la edad máxima';
    }
    if (!formData.costo_traspaso || isNaN(formData.costo_traspaso) || Number(formData.costo_traspaso) < 0) {
      newErrors.costo_traspaso = 'El costo de traspaso debe ser un número mayor o igual a 0';
    }
    return newErrors;
  };

  const handleSubmit = async () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      if (categoriaId) {
        await axios.put(`${API_BASE_URL}/categoria/update_categoria/${categoriaId}`, formData);
        onCategoriaUpdated();
      } else {
        await axios.post(`${API_BASE_URL}/categoria/post_categoria`, formData);
        onCategoriaCreated();
      }
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al guardar la categoría');
      console.error('Error al guardar la categoría:', error);
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{categoriaId ? 'Editar Categoría' : 'Registrar Categoría'}</Text>

          <TextInput
            style={styles.input}
            placeholder="Nombre*"
            value={formData.nombre}
            onChangeText={(text) => handleChange('nombre', text)}
          />
          {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}

          <Picker
            selectedValue={formData.genero}
            style={styles.picker}
            onValueChange={(value) => handleChange('genero', value)}
          >
            <Picker.Item label="Varones" value="V" />
            <Picker.Item label="Damas" value="D" />
            <Picker.Item label="Mixto" value="M" />
          </Picker>

          <Picker
            selectedValue={formData.division}
            style={styles.picker}
            onValueChange={(value) => handleChange('division', value)}
          >
            <Picker.Item label="Mayores" value="MY" />
            <Picker.Item label="Menores" value="MN" />
          </Picker>

          <TextInput
            style={styles.input}
            placeholder="Edad Mínima (opcional)"
            value={formData.edad_minima}
            onChangeText={(text) => handleChange('edad_minima', text)}
            keyboardType="numeric"
          />
          {errors.edad_minima && <Text style={styles.errorText}>{errors.edad_minima}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Edad Máxima (opcional)"
            value={formData.edad_maxima}
            onChangeText={(text) => handleChange('edad_maxima', text)}
            keyboardType="numeric"
          />
          {errors.edad_maxima && <Text style={styles.errorText}>{errors.edad_maxima}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Costo de Traspaso*"
            value={formData.costo_traspaso}
            onChangeText={(text) => handleChange('costo_traspaso', text)}
            keyboardType="numeric"
          />
          {errors.costo_traspaso && <Text style={styles.errorText}>{errors.costo_traspaso}</Text>}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.buttonText}>{categoriaId ? 'Guardar Cambios' : 'Registrar'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CrearCategoriaModal;