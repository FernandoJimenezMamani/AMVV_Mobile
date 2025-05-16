import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

const MapModal = ({ isOpen, onClose, onLocationSelect, latitud, longitud }) => {
    const [position, setPosition] = useState({
        latitude: latitud ? parseFloat(latitud) : -17.7833,
        longitude: longitud ? parseFloat(longitud) : -63.1821,
    });
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [lastRequestTime, setLastRequestTime] = useState(0);
    const mapRef = useRef(null);

   const NOMINATIM_URL = process.env.EXPO_PUBLIC_NOMINATIM_URL;
   const REQUEST_DELAY = parseInt(process.env.EXPO_PUBLIC_REQUEST_DELAY || '1000');


    useEffect(() => {
        if (latitud && longitud) {
            const newPosition = {
                latitude: parseFloat(latitud),
                longitude: parseFloat(longitud),
            };
            setPosition(newPosition);
            reverseGeocode(newPosition.latitude, newPosition.longitude);
            
            if (mapRef.current) {
                mapRef.current.animateToRegion({
                    ...newPosition,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }, 500);
            }
        }
    }, [latitud, longitud]);

    const reverseGeocode = async (lat, lng) => {
        const now = Date.now();
        if (now - lastRequestTime < REQUEST_DELAY) {
            // Skip if we're making requests too quickly
            return;
        }

        setLoading(true);
        setLastRequestTime(now);
        
        try {
            const response = await axios.get(NOMINATIM_URL, {
                params: {
                    format: 'json',
                    lat: lat,
                    lon: lng,
                    zoom: 18, // More detailed address
                    addressdetails: 1,
                },
                headers: {
                    'User-Agent': 'YourAppName/1.0 (your@email.com)', // Required by Nominatim
                    'Accept-Language': 'es', // Get results in Spanish
                },
                timeout: 5000, // 5 second timeout
            });

            if (response.data && response.data.display_name) {
                setAddress(response.data.display_name);
            } else {
                setAddress('Dirección no disponible');
            }
        } catch (error) {
            console.error('Error al obtener la dirección:', error);
            if (error.response && error.response.status === 403) {
                setAddress('Error: Demasiadas solicitudes. Por favor espere.');
            } else {
                setAddress('Error al obtener la dirección');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleMapPress = (e) => {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        setPosition({ latitude, longitude });
        reverseGeocode(latitude, longitude);
    };

    const handleConfirm = () => {
        onLocationSelect(position.latitude, position.longitude, address);
    };

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={isOpen}
            onRequestClose={onClose}
        >
            <View style={styles.fullScreenMap}>
                <View style={styles.mapHeader}>
                    <Text style={styles.mapTitle}>Seleccionar Ubicación</Text>
                </View>
                
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={{
                        ...position,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                    onPress={handleMapPress}
                >
                    <Marker coordinate={position} />
                </MapView>
                
                <View style={styles.mapInfoContainer}>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="#185564" />
                            <Text style={styles.loadingText}>Buscando dirección...</Text>
                        </View>
                    ) : (
                        <Text style={styles.mapInfoText}>
                            <Text style={styles.mapInfoLabel}>Dirección:</Text> {address || 'Toque en el mapa para seleccionar ubicación'}
                        </Text>
                    )}
                </View>
                
                <View style={styles.mapButtonContainer}>
                    <TouchableOpacity 
                        style={[styles.button, styles.cancelButton]}
                        onPress={onClose}
                    >
                        <Text style={styles.buttonText}>Cancelar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.button, styles.submitButton]}
                        onPress={handleConfirm}
                        disabled={!address || address.includes('Error')}
                    >
                        <Text style={styles.buttonText}>Confirmar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    fullScreenMap: {
        flex: 1,
        backgroundColor: 'white',
    },
    mapHeader: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    mapTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#185564',
        textAlign: 'center',
    },
    map: {
        flex: 1,
    },
    mapInfoContainer: {
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        minHeight: 60,
        justifyContent: 'center',
    },
    mapInfoText: {
        fontSize: 14,
        color: '#333',
    },
    mapInfoLabel: {
        fontWeight: 'bold',
    },
    mapButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        backgroundColor: '#f9f9f9',
    },
    button: {
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
        minWidth: '48%',
    },
    cancelButton: {
        backgroundColor: '#a94442',
    },
    submitButton: {
        backgroundColor: '#185564',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginLeft: 10,
        color: '#185564',
    },
});

export default MapModal;