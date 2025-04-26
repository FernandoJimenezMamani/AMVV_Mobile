import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Modal, 
  TouchableOpacity, 
  StyleSheet,
  ScrollView
} from 'react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { useSession } from '../../../context/SessionProvider';
import styles from '../../../styles/crear_modal';
import { Picker } from '@react-native-picker/picker';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const EditarEquipoModal = ({ isOpen, onClose, equipoId, onEquipoUpdated }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    club_id: null,
    categoria_id: null,
    user_id: 1,
  });

  const [clubes, setClubes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [errors, setErrors] = useState({});
  const [esAscenso, setEsAscenso] = useState(null);
  const { user } = useSession();

  useEffect(() => {
    const fetchEquipo = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/equipo/get_equipo/${equipoId}`);
        const data = response.data;
        setFormData({
          nombre: data.equipo_nombre,
          club_id: data.club_id,
          categoria_id: data.categoria_id,
          user_id: 1,
        });
        setEsAscenso(data.es_ascenso);
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Error al obtener los datos del equipo.',
        });
      }
    };

    if (equipoId && isOpen) {
      fetchEquipo();
    }
  }, [equipoId, isOpen]);

  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        const [clubRes, catRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/club/get_club`),
          axios.get(`${API_BASE_URL}/categoria/get_categoria`)
        ]);
        setClubes(clubRes.data);
        setCategorias(catRes.data);
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Error al cargar datos',
        });
      }
    };
    
    if (isOpen) {
      fetchSelectData();
    }
  }, [isOpen]);

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre) newErrors.nombre = 'El campo nombre es obligatorio';
    if (!formData.categoria_id) newErrors.categoria_id = 'Debe seleccionar una categoría';
    if (!formData.club_id) newErrors.club_id = 'Debe seleccionar un club';
    return newErrors;
  };

  const handleSubmit = async () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
  
    try {
      await axios.put(`${API_BASE_URL}/equipo/update_equipo/${equipoId}`, formData);
      
      Toast.show({
        type: 'success',
        text1: 'Éxito',
        text2: 'Equipo actualizado con éxito',
      });
      
      onEquipoUpdated();
      onClose();
    } catch (error) {
      console.error("Error en actualización:", error);
      const mensaje = error.response?.data?.error || "Error inesperado";
      
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: mensaje,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Editar Equipo</Text>
          
          <ScrollView style={{ width: '100%' }}>
            {/* Nombre del Equipo */}
            <TextInput
              style={styles.input}
              placeholder="Nombre del Equipo"
              value={formData.nombre}
              onChangeText={(text) => handleChange('nombre', text)}
            />
            {errors.nombre && <Text style={{ color: 'red', marginBottom: 10 }}>{errors.nombre}</Text>}

            {/* Club (disabled) */}
            <View style={styles.input}>
            <Picker
              selectedValue={formData.club_id}
              onValueChange={(value) => handleChange('club_id', value)}
              style={styles.picker}
              enabled={false}
            >
              <Picker.Item label="Seleccione un Club" value={null} />
              {clubes.map(club => (
                <Picker.Item key={club.id} label={club.nombre} value={club.id} />
              ))}
            </Picker>
            </View>
            {errors.club_id && <Text style={{ color: 'red', marginBottom: 10 }}>{errors.club_id}</Text>}

            {/* Categoría (disabled) */}
            <View style={styles.input}>
              <Picker
                selectedValue={formData.categoria_id}
                onValueChange={(value) => handleChange('categoria_id', value)}
                style={styles.picker}
                enabled={false}
              >
                <Picker.Item label="Seleccione una Categoría" value={null} />
                {categorias.map(cat => {
                  const generoText = cat.genero === 'V' ? 'masculino' : 'femenino';
                  return (
                    <Picker.Item 
                      key={cat.id} 
                      label={`${cat.nombre} - ${generoText}`} 
                      value={cat.id} 
                    />
                  );
                })}
              </Picker>
            </View>
            {errors.categoria_id && <Text style={{ color: 'red', marginBottom: 10 }}>{errors.categoria_id}</Text>}
          </ScrollView>

          {/* Botones */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Guardar Cambios</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EditarEquipoModal;