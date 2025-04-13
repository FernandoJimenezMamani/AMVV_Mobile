import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../../styles/crear_modal';
import MapModal from '../../components/registro_modal_map';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const EditarComplejo = ({ isOpen, onClose, complejoId, onComplejoUpdated }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    latitud: '',
    longitud: '',
    user_id: 2,
  });

  const [mapModalOpen, setMapModalOpen] = useState(false);

  useEffect(() => {
    const fetchComplejo = async () => {
      if (!complejoId) return;
      try {
        const response = await axios.get(`${API_BASE_URL}/lugar/${complejoId}`);
        const { nombre, latitud, longitud, direccion } = response.data;

        setFormData({
          nombre: nombre,
          direccion: direccion,
          latitud: latitud,
          longitud: longitud,
          user_id: 2,
        });
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error al obtener los datos del complejo',
          position: 'bottom'
        });
        console.error('Error al obtener el complejo:', error);
      }
    };

    fetchComplejo();
  }, [complejoId]);

  const handleLocationSelect = (lat, lng, address) => {
    setFormData(prevData => ({
      ...prevData,
      latitud: lat.toString(),
      longitud: lng.toString(),
      direccion: address,
    }));
    setMapModalOpen(false);
  };

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.direccion || !formData.latitud || !formData.longitud) {
      Toast.show({
        type: 'error',
        text1: 'Todos los campos deben ser completados',
        position: 'bottom'
      });
      return;
    }

    try {
      await axios.put(`${API_BASE_URL}/lugar/edit/${complejoId}`, formData, {
        headers: { 'Content-Type': 'application/json' },
      });

      Toast.show({
        type: 'success',
        text1: 'Complejo actualizado exitosamente',
        position: 'bottom'
      });
      onClose();
      onComplejoUpdated();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error al actualizar el complejo',
        position: 'bottom'
      });
      console.error('Error al actualizar el complejo:', error);
    }
  };

  return (
    <>
      <Modal
        animationType="fade"
        transparent={true}
        visible={isOpen}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Editar Complejo Deportivo</Text>
            
            <ScrollView style={{ width: '100%' }}>
              <TextInput
                style={styles.input}
                value={formData.nombre}
                onChangeText={(text) => handleChange('nombre', text)}
                placeholder="Nombre del complejo"
                placeholderTextColor="#999"
              />
              
              <TextInput
                style={[styles.input, { color: '#333', backgroundColor: '#f5f5f5' }]}
                value={formData.direccion}
                placeholder="Dirección (seleccionar en el mapa)"
                placeholderTextColor="#999"
                editable={false}
                multiline
              />
              
              <TouchableOpacity 
                style={[styles.fileButton, { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]} 
                onPress={() => setMapModalOpen(true)}
              >
                <MaterialIcons name="place" size={20} color="white" />
                <Text style={styles.fileButtonText}>  Seleccionar en el Mapa</Text>
              </TouchableOpacity>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={onClose}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.submitButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.buttonText}>Guardar Cambios</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      <MapModal
        isOpen={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        onLocationSelect={handleLocationSelect}
        latitud={formData.latitud}
        longitud={formData.longitud}
      />
    </>
  );
};

export default EditarComplejo;