import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import styles from '../../../styles/crear_modal';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const RegistroEquipo = ({ isOpen, onClose, onTeamCreated, clubId }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    club_id: clubId,
    categoria_id: null,
    user_id: 1
  });
  const [clubName, setClubName] = useState('Cargando...');
  const [categorias, setCategorias] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Obtener nombre del club
        const clubResponse = await axios.get(`${API_BASE_URL}/club/get_club/${clubId}`);
        if (clubResponse.data?.length > 0) {
          setClubName(clubResponse.data[0].nombre || 'Club no encontrado');
        }

        // Obtener categorías
        const categoriasResponse = await axios.get(`${API_BASE_URL}/categoria/get_categoria`);
        setCategorias(categoriasResponse.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'No se pudieron cargar los datos',
          position: 'bottom'
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && clubId) {
      fetchData();
    }
  }, [isOpen, clubId]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!formData.categoria_id) newErrors.categoria_id = 'Seleccione una categoría';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE_URL}/equipo/post_equipo`, formData);
      
      Toast.show({
        type: 'success',
        text1: 'Éxito',
        text2: 'Equipo registrado correctamente',
        position: 'bottom'
      });
      
      onTeamCreated();
      onClose();
    } catch (error) {
      console.error('Registration error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Error al registrar el equipo',
        position: 'bottom'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Registrar Equipo</Text>
          
          <ScrollView style={{ width: '100%' }}>
            {/* Nombre del club (solo lectura) */}
            <TextInput
              style={[styles.input, { color: '#333', backgroundColor: '#f5f5f5' }]}
              value={clubName}
              editable={false}
            />

            {/* Nombre del equipo */}
            <TextInput
              style={[styles.input, errors.nombre && { borderColor: 'red' }]}
              placeholder="Nombre del equipo"
              value={formData.nombre}
              onChangeText={text => handleChange('nombre', text)}
            />
            {errors.nombre && <Text style={{ color: 'red', marginBottom: 10 }}>{errors.nombre}</Text>}

            {/* Selector de categoría */}
            <View style={[styles.input, errors.categoria_id && { borderColor: 'red' }]}>
              <Picker
                selectedValue={formData.categoria_id}
                onValueChange={value => handleChange('categoria_id', value)}
                style={styles.picker}
              >
                <Picker.Item label="Seleccione una categoría" value={null} />
                {categorias.map(categoria => (
                  <Picker.Item
                    key={`cat-${categoria.id}`}
                    label={`${categoria.nombre} - ${categoria.genero === 'M' ? 'Masculino' : 'Femenino'}`}
                    value={categoria.id}
                  />
                ))}
              </Picker>
            </View>
            {errors.categoria_id && <Text style={{ color: 'red', marginBottom: 10 }}>{errors.categoria_id}</Text>}

            {/* Botones */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.submitButton, isLoading && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Registrar</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default RegistroEquipo;