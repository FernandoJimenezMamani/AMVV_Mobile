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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import defaultUserMen from '../../../assets/img/Default_Imagen_Men.webp';
import defaultUserWomen from '../../../assets/img/Default_Imagen_Women.webp';
import styles from '../../../styles/detalle_traspaso';
import ConfirmModal from '../../../components/confirm_modal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const DetalleTraspasoPresidente = () => {
  const params = useLocalSearchParams();
  const solicitudId = params.id;
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState('');
  const [presidente, setPresidente] = useState(null);
   const router = useRouter();

  useEffect(() => {
    fetchPresidente();
  }, []);

  useEffect(() => {
    if (solicitudId) {
      fetchSolicitud();
    }
  }, [solicitudId]);

  const fetchPresidente = async () => {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (!userString) {
        throw new Error('No se encontró el usuario en AsyncStorage');
      }

      const user = JSON.parse(userString);
      const userId = user?.id;

      if (!userId) {
        throw new Error('El usuario no tiene un ID válido');
      }

      const response = await axios.get(`${API_BASE_URL}/presidente_club/get_presidenteById/${userId}`);
      setPresidente(response.data);
    } catch (error) {
      Alert.alert('Error', 'Error al obtener los datos del presidente');
    }
  };

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
      let url = '';
  
      if (solicitud.tipo_solicitud === 'Jugador') {
        url = `${API_BASE_URL}/traspaso/${actionType === 'approve' ? 'aprobarPorPresidente' : 'rechazarPorPresidente'}/${solicitudId}`;
      } else {
        url = `${API_BASE_URL}/traspaso/${actionType === 'approve' ? 'aprobar' : 'rechazar'}/club/${solicitudId}`;
      }
      console.log(presidente.id);
      await axios.put(url, { presidenteId: presidente.id });
      Toast.show({
        type: 'success', 
        text1: 'Éxito',
        text2: `Traspaso ${actionType === 'approve' ? 'aprobado' : 'rechazado'} exitosamente`, 
        position: 'bottom'
      });
      closeModal();
      fetchSolicitud();
    } catch (error) {
      Toast.show({
        type: 'error', 
        text1: 'Error',
        text2: `Error al ${actionType === 'approve' ? 'aprobar' : 'rechazar'} el traspaso`, 
        position: 'bottom'
      });
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#143E42" />
          </TouchableOpacity>
        <Text style={styles.title}>Certificado de Transferencia</Text>
      </View>

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
      <Text style={styles.sectionTitle}>Estado de la Solicitud</Text>
      <View style={styles.estadoContainer}>
        {solicitud.tipo_solicitud === 'Presidente' ? (
          <View style={styles.estadoItem}>
            <Text style={styles.estadoLabel}>Respuesta del Jugador:</Text>
            <View style={[styles.estadoValue, styles[`estado${solicitud.estado_jugador}`]]}>
              {renderEstadoIcono(solicitud.estado_jugador)}
              <Text> {solicitud.estado_jugador}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.estadoItem}>
            <Text style={styles.estadoLabel}>Respuesta del Presidente de club Receptor:</Text>
            <View style={[styles.estadoValue, styles[`estado${solicitud.estado_club_receptor}`]]}>
              {renderEstadoIcono(solicitud.estado_club_receptor)}
              <Text> {solicitud.estado_club_receptor}</Text>
            </View>
          </View>
        )}
        
        <View style={styles.estadoItem}>
          <Text style={styles.estadoLabel}>Respuesta del Presidente del Club Actual:</Text>
          <View style={[styles.estadoValue, styles[`estado${solicitud.estado_club_origen}`]]}>
            {renderEstadoIcono(solicitud.estado_club_origen)}
            <Text> {solicitud.estado_club_origen}</Text>
          </View>
        </View>
      </View>

      {/* Botones de acción */}
      <View style={styles.botonesContainer}>
        {/* CASO: tipo presidente */}
        {solicitud.tipo_solicitud === 'Presidente' && solicitud.estado_club_origen === 'PENDIENTE' && (
          <>
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
          </>
        )}

        {/* CASO: tipo jugador → presidente club ORIGEN */}
        {solicitud.tipo_solicitud === 'Jugador' &&
          presidente?.id_presidente === solicitud.presidente_club_id_origen &&
          solicitud.estado_club_origen === 'PENDIENTE' && (
            <>
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
            </>
          )}

        {/* CASO: tipo jugador → presidente club RECEPTOR */}
        {solicitud.tipo_solicitud === 'Jugador' &&
          presidente?.id_presidente === solicitud.presidente_club_id_destino &&
          solicitud.estado_club_receptor === 'PENDIENTE' && (
            <>
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
            </>
          )}
      </View>

      {solicitud.tipo_solicitud === 'Presidente' && (
        <>
          <Text style={styles.sectionTitle}>Estado del Pago</Text>
          <View style={styles.pagoContainer}>
            {solicitud.estado_jugador === 'APROBADO' && solicitud.estado_club_origen === 'APROBADO' ? (
              <View style={styles.estadoItem}>
                <Text style={styles.estadoLabel}>Estado del Pago:</Text>
                <View style={[styles.estadoValue, styles[`estado${solicitud.estado_deuda}`]]}>
                  {renderEstadoIcono(solicitud.estado_deuda)}
                  <Text> {solicitud.estado_deuda}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.text}>
                El estado del pago se mostrará una vez el jugador y el presidente del club hayan aprobado la solicitud.
              </Text>
            )}
          </View>
        </>
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

export default DetalleTraspasoPresidente;