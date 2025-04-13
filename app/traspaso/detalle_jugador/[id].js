import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import defaultUserMen from '../../../assets/img/Default_Imagen_Men.webp';
import defaultUserWomen from '../../../assets/img/Default_Imagen_Women.webp';
import styles from '../../../styles/detalle_traspaso';
import ConfirmModal from '../../../components/confirm_modal';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const DetalleTraspaso = () => {
  const params = useLocalSearchParams();
  const solicitudId = params.id;
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    if (solicitudId) {
      fetchSolicitud();
    }
  }, [solicitudId]);

  const fetchSolicitud = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await axios.get(`${API_BASE_URL}/traspaso/detalle/${solicitudId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      let data = response.data;
      if (Array.isArray(data) && data.length > 0) {
        data = data[0];
      } else if (typeof data === 'object' && data !== null) {
        // La respuesta ya es un objeto
      } else {
        throw new Error('Formato de respuesta inesperado');
      }

      setSolicitud(data);
      setError(null);
    } catch (error) {
      console.error('Error completo:', error);
      setError(error.message || 'Error al obtener los detalles');
      Alert.alert(
        'Error',
        'No se pudo cargar la información de la solicitud. Por favor, inténtalo de nuevo.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type) => {
    setActionType(type);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setActionType('');
  };

  const handleAction = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const url = `${API_BASE_URL}/traspaso/${actionType === 'approve' ? 'aprobar' : 'rechazar'}/jugador/${solicitudId}`;
      
      await axios.put(url, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      Alert.alert('Éxito', `Traspaso ${actionType === 'approve' ? 'aprobado' : 'rechazado'} exitosamente`);
      closeModal();
      fetchSolicitud();
    } catch (error) {
      Alert.alert('Error', `Error al ${actionType === 'approve' ? 'aprobar' : 'rechazar'} el traspaso`);
      console.error(`Error al ${actionType === 'approve' ? 'aprobar' : 'rechazar'} el traspaso:`, error);
    }
  };

  const renderEstadoIcono = (estado) => {
    if (!estado) return null;
    
    switch (estado.toUpperCase()) {
      case 'APROBADO':
        return <MaterialIcons name="check-circle" size={24} color="green" />;
      case 'RECHAZADO':
        return <MaterialIcons name="cancel" size={24} color="red" />;
      case 'PENDIENTE':
        return <MaterialIcons name="pending" size={24} color="orange" />;
      default:
        return null;
    }
  };

  const getImagenPerfil = (persona) => {
    if (!persona) return defaultUserMen;
    
    if (persona?.imagen_jugador) {
      return { uri: persona.imagen_jugador };
    }
    return persona?.jugador_genero === 'V' ? defaultUserMen : defaultUserWomen;
  };

  const getImagenClub = (imagen) => {
    return { uri: imagen };
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#3D8FA4" />
        <Text style={styles.loadingText}>Cargando detalles de la solicitud...</Text>
      </View>
    );
  }

  if (error || !solicitud) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>
          {error || 'No se encontraron datos de la solicitud'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Certificado de Transferencia</Text>

      {/* Club Actual */}
      <View style={styles.infoContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.subtitle}>CLUB ACTUAL</Text>
          <Text style={styles.text}><Text style={styles.bold}>Nombre del Club:</Text> {solicitud.club_origen_nombre || 'No disponible'}</Text>
          <Text style={styles.text}><Text style={styles.bold}>Presidente Actual del Club:</Text> {solicitud.nombre_presi_club_origen || 'No disponible'} {solicitud.apellido_presi_club_origen || ''}</Text>
        </View>
        <Image 
          source={getImagenClub(solicitud.imagen_club_origen)} 
          style={styles.image} 
          onError={(e) => console.log('Error al cargar imagen del club:', e.nativeEvent.error)}
        />
      </View>

      {/* Club Solicitante */}
      <View style={styles.infoContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.subtitle}>CLUB SOLICITANTE</Text>
          <Text style={styles.text}><Text style={styles.bold}>Nombre del Club:</Text> {solicitud.club_destino_nombre}</Text>
          <Text style={styles.text}><Text style={styles.bold}>Presidente Actual del Club:</Text> {solicitud.nombre_presi_club_dest} {solicitud.apellido_presi_club_dest}</Text>
        </View>
        <Image 
          source={getImagenClub(solicitud.imagen_club_destino)} 
          style={styles.image} 
        />
      </View>

      <Text style={styles.paragraph}>
        De acuerdo con las normas de la Asociación Municipal de Voleibol Vinto,
        certificamos que el jugador(a):
      </Text>

      {/* Información del Jugador */}
      <View style={styles.infoContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.text}><Text style={styles.bold}>Nombre Completo:</Text> {solicitud.jugador_nombre} {solicitud.jugador_apellido}</Text>
          <Text style={styles.text}><Text style={styles.bold}>Género:</Text> {solicitud.jugador_genero === 'V' ? 'Varón' : solicitud.jugador_genero === 'D' ? 'Dama' : 'Desconocido'}</Text>
          <Text style={styles.text}><Text style={styles.bold}>Cédula de Identidad:</Text> {solicitud.jugador_ci}</Text>
          <Text style={styles.text}><Text style={styles.bold}>Fecha de Nacimiento:</Text> {new Date(solicitud.jugador_fecha_nacimiento).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
        </View>
        <Image 
          source={getImagenPerfil(solicitud)} 
          style={styles.image} 
        />
      </View>

      <Text style={styles.paragraph}>
        Ha sido parte del club: <Text style={styles.bold}>{solicitud.club_origen_nombre}</Text> y ha cumplido con todas
        sus obligaciones, sin tener cargos pendientes. Por lo tanto, se autoriza su 
        registro en el club: <Text style={styles.bold}>{solicitud.club_destino_nombre}</Text> para el <Text style={styles.bold}>{solicitud.nombre_campeonato}</Text>.
      </Text>

      {/* Estado de la Solicitud */}
      <View style={styles.estadoContainer}>
        <View style={styles.estadoItem}>
          <Text style={styles.estadoLabel}>Estado de la Solicitud:</Text>
          <View style={[styles.estadoValue, styles[`estado${solicitud.estado_jugador}`]]}>
            {renderEstadoIcono(solicitud.estado_jugador)}
            <Text> {solicitud.estado_jugador}</Text>
          </View>
        </View>
      </View>

      {/* Botones de acción */}
      {solicitud.estado_jugador === 'PENDIENTE' ? (
        <View style={styles.botonesContainer}>
          <TouchableOpacity 
            style={[styles.boton, styles.botonAceptar]}
            onPress={() => openModal('approve')}
          >
            <Text style={styles.botonTexto}>Aceptar Solicitud</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.boton, styles.botonRechazar]}
            onPress={() => openModal('reject')}
          >
            <Text style={styles.botonTexto}>Rechazar Solicitud</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.estadoIconoContainer}>
          {renderEstadoIcono(solicitud.estado_jugador)}
        </View>
      )}

      <ConfirmModal
        visible={modalVisible}
        onConfirm={handleAction}
        onCancel={closeModal}
        message={`¿Está seguro de que desea ${actionType === 'approve' ? 'aprobar' : 'rechazar'} este traspaso?`}
      />
    </ScrollView>
  );
};

export default DetalleTraspaso;