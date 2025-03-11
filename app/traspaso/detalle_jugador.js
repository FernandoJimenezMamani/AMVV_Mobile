import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import { useSession } from '../../context/SessionProvider';
import ConfirmModal from '../../components/confirm_modal';
import { MaterialIcons } from '@expo/vector-icons'; // Importa los íconos
import styles from '../../styles/detalle_traspaso'; // Asegúrate de importar tus estilos

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const DetalleTraspaso = () => {
  const route = useRoute();
  const { solicitudId } = route.params;
  const [solicitud, setSolicitud] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState('');
  const { user } = useSession();

  const hasRole = (...roles) => {
    return user && user.rol && roles.includes(user.rol.nombre);
  };

  useEffect(() => {
    fetchSolicitud();
  }, [solicitudId]);

  const fetchSolicitud = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/traspaso/detalle/${solicitudId}`);
      const solicitud = Array.isArray(response.data) && response.data.length > 0 ? response.data[0] : null;
      setSolicitud(solicitud);
    } catch (error) {
      console.error('Error al obtener el detalle de la solicitud de traspaso:', error);
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
      const url = `${API_BASE_URL}/traspaso/${actionType === 'approve' ? 'aprobar' : 'rechazar'}/jugador/${solicitudId}`;
      await axios.put(url);
      Alert.alert('Aprobado', 'Traspaso aprobado exitosamente');
      closeModal();
      fetchSolicitud();
    } catch (error) {
      Alert.alert('Error', 'Error al aprobar el traspaso');
      console.error(`Error al ${actionType === 'approve' ? 'aprobar' : 'rechazar'} el traspaso:`, error);
    }
  };

  if (!solicitud) return <Text>Cargando detalles de la solicitud...</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Certificado de Transferencia</Text>

      <View style={styles.clubInfo}>
        <Text style={styles.subtitle}>CLUB ACTUAL</Text>
        <Text><Text style={styles.bold}>Nombre del Club:</Text> {solicitud.club_origen_nombre}</Text>
        <Text><Text style={styles.bold}>Presidente Actual del Club:</Text> {solicitud.nombre_presi_club_origen} {solicitud.apellido_presi_club_origen}</Text>
      </View>

      <View style={styles.clubInfo}>
        <Text style={styles.subtitle}>CLUB SOLICITANTE</Text>
        <Text><Text style={styles.bold}>Nombre del Club:</Text> {solicitud.club_destino_nombre}</Text>
        <Text><Text style={styles.bold}>Presidente Actual del Club:</Text> {solicitud.nombre_presi_club_dest} {solicitud.apellido_presi_club_dest}</Text>
      </View>

      <Text style={styles.text}>
        De acuerdo con las normas de la Asociación Municipal de Voleibol Vinto,
        certificamos que el jugador(a):
      </Text>

      <View style={styles.clubInfo}>
        <Text><Text style={styles.bold}>Nombre Completo:</Text> {solicitud.jugador_nombre} {solicitud.jugador_apellido}</Text>
        <Text><Text style={styles.bold}>Género:</Text> {solicitud.jugador_genero === 'V' ? 'Varón' : solicitud.jugador_genero === 'D' ? 'Dama' : 'Desconocido'}</Text>
        <Text><Text style={styles.bold}>Cédula de Identidad:</Text> {solicitud.jugador_ci}</Text>
        <Text><Text style={styles.bold}>Fecha de Nacimiento:</Text> {new Date(solicitud.jugador_fecha_nacimiento).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
      </View>

      <Text style={styles.text}>
        Ha sido parte del club: <Text style={styles.bold}>{solicitud.club_origen_nombre}</Text> y ha cumplido con todas
        sus obligaciones, sin tener cargos pendientes. Por lo tanto, se autoriza su
        registro en el club: <Text style={styles.bold}>{solicitud.club_destino_nombre}</Text> para el <Text style={styles.bold}>{solicitud.nombre_campeonato}</Text>.
      </Text>

      <View style={styles.estadoSolicitud}>
        {solicitud.estado_jugador === 'PENDIENTE' ? (
          <View style={styles.botones}>
            <TouchableOpacity style={styles.botonAceptar} onPress={() => openModal('approve')}>
              <Text style={styles.botonTexto}>Aceptar Solicitud</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.botonRechazar} onPress={() => openModal('reject')}>
              <Text style={styles.botonTexto}>Rechazar Solicitud</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.iconoEstado}>
            {solicitud.estado_jugador === 'APROBADO' ? (
              <MaterialIcons name="check-circle-outline" size={24} color="green" />
            ) : solicitud.estado_jugador === 'RECHAZADO' ? (
              <MaterialIcons name="cancel" size={24} color="red" />
            ) : null}
          </View>
        )}
      </View>

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