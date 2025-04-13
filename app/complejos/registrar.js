import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../../styles/crear_modal';
import MapModal from '../../components/registro_modal_map';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const RegistroComplejoModal = ({ visible, onClose, onComplejoAdded }) => {
    const [nombre, setNombre] = useState('');
    const [longitud, setLongitud] = useState('');
    const [latitud, setLatitud] = useState('');
    const [error, setError] = useState('');
    const [direccion, setDireccion] = useState('');
    const [mapModalOpen, setMapModalOpen] = useState(false);

    const handleSubmit = async () => {
        setError('');
        
        if (!nombre || !longitud || !latitud || !direccion) {
            setError('Todos los campos deben ser proporcionados');
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/lugar/insert`, {
                nombre,
                longitud: parseFloat(longitud),
                latitud: parseFloat(latitud),
                direccion
            });
            
            Toast.show({
                type: 'success',
                text1: 'Registrado con éxito',
                position: 'bottom'
            });
            
            resetForm();
            onClose();
            onComplejoAdded();
        } catch (err) {
            console.error('Error al crear el lugar:', err);
            setError('Error al crear el Lugar');
            Toast.show({
                type: 'error',
                text1: 'Error al registrar',
                text2: err.message,
                position: 'bottom'
            });
        }
    };

    const resetForm = () => {
        setNombre('');
        setLongitud('');
        setLatitud('');
        setDireccion('');
        setError('');
    };

    const handleLocationSelect = (lat, lng, address) => {
        setLatitud(lat.toString());
        setLongitud(lng.toString());
        setDireccion(address);
        setMapModalOpen(false);
    };

    return (
        <>
            {/* Modal principal de registro */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={visible}
                onRequestClose={onClose}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Registrar Complejo Deportivo</Text>
                        
                        <ScrollView style={{ width: '100%' }}>
                            <TextInput
                                style={styles.input}
                                value={nombre}
                                onChangeText={setNombre}
                                placeholder="Nombre del complejo"
                                placeholderTextColor="#999"
                            />
                            
                            <TextInput
                                style={[styles.input, { color: '#333', backgroundColor: '#f5f5f5' }]}
                                value={direccion}
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
                            
                            {error ? <Text style={{ color: '#d9534f', marginBottom: 15, textAlign: 'center' }}>{error}</Text> : null}
                            
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
                                    <Text style={styles.buttonText}>Registrar</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
            
            {/* Modal del Mapa */}
            <MapModal 
                isOpen={mapModalOpen}
                onClose={() => setMapModalOpen(false)}
                onLocationSelect={handleLocationSelect}
                latitud={latitud}
                longitud={longitud}
            />
        </>
    );
};

export default RegistroComplejoModal;