import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import styles from '../../../styles/crear_modal';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const DetallePagoTraspasoModal = ({ isOpen, onClose, traspasoId, campeonatoId }) => {
  const [pago, setPago] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPago = async () => {
      if (!traspasoId || !campeonatoId) return;
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/pagos/historial-traspasos/${campeonatoId}`);
        const encontrado = res.data.find(p => p.traspaso_id === traspasoId);
        setPago(encontrado || null);
      } catch (error) {
        Alert.alert('Error', 'No se pudo obtener el detalle del pago de traspaso');
      } finally {
        setLoading(false);
      }
    };

    fetchPago();
  }, [traspasoId, campeonatoId]);

  const formatFecha = (fecha) =>
    new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Detalle de Pago de Traspaso</Text>
          {loading ? (
            <View style={modalStyles.loadingBox}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={{ marginTop: 10 }}>Cargando...</Text>
            </View>
          ) : !pago ? (
            <Text style={styles.emptyText}>No se encontró información del traspaso.</Text>
          ) : (
            <ScrollView>
              <Text style={modalStyles.sectionTitle}>{pago.nombre_campeonato}</Text>

              {/* Jugador */}
              <View style={modalStyles.section}>
                <Text style={modalStyles.label}>Jugador:</Text>
                <Text style={modalStyles.value}>{pago.jugador_nombre} {pago.jugador_apellido}</Text>
                <Text style={modalStyles.label}>CI:</Text>
                <Text style={modalStyles.value}>{pago.jugador_ci}</Text>
              </View>

              {/* Origen */}
              <View style={modalStyles.section}>
                <Text style={modalStyles.sectionSubtitle}>Club de Origen</Text>
                <Text style={modalStyles.label}>Club:</Text>
                <Text style={modalStyles.value}>{pago.club_origen_nombre}</Text>
                <Text style={modalStyles.label}>Presidente:</Text>
                <Text style={modalStyles.value}>{pago.nombre_presi_club_origen} {pago.apellido_presi_club_origen}</Text>
              </View>

              {/* Destino */}
              <View style={modalStyles.section}>
                <Text style={modalStyles.sectionSubtitle}>Club de Destino</Text>
                <Text style={modalStyles.label}>Club:</Text>
                <Text style={modalStyles.value}>{pago.club_destino_nombre}</Text>
                <Text style={modalStyles.label}>Presidente:</Text>
                <Text style={modalStyles.value}>{pago.nombre_presi_club_dest} {pago.apellido_presi_club_dest}</Text>
              </View>

              {/* Pago */}
              <View style={modalStyles.section}>
                <Text style={modalStyles.sectionSubtitle}>Información del Pago</Text>
                <Text style={modalStyles.label}>Monto:</Text>
                <Text style={modalStyles.value}>{pago.monto_real} Bs</Text>
                <Text style={modalStyles.label}>Fecha:</Text>
                <Text style={modalStyles.value}>{formatFecha(pago.pago_fecha)}</Text>
                <Text style={modalStyles.label}>Referencia:</Text>
                <Text style={modalStyles.value}>{pago.pago_referencia}</Text>
              </View>
            </ScrollView>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  section: {
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  value: {
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 10,
  },
  loadingBox: {
    alignItems: 'center',
    marginVertical: 30,
  },
});

export default DetallePagoTraspasoModal;
