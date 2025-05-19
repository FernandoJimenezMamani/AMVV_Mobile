import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import axios from 'axios';
import styles from '../../../styles/crear_modal'; // Reutilizamos tu estilo base

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const DetallePagoInscripcionModal = ({ isOpen, onClose, equipoId, campeonatoId }) => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPagos = async () => {
      if (!equipoId || !campeonatoId) return;
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/pagos/historial-inscripcion/${campeonatoId}`);
        const todos = response.data || [];
        const filtrados = todos.filter(p => p.equipoId === equipoId);
        setPagos(filtrados);
      } catch (error) {
        Alert.alert('Error', 'No se pudo obtener el historial de pagos');
      } finally {
        setLoading(false);
      }
    };

    fetchPagos();
  }, [equipoId, campeonatoId]);

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
          <Text style={styles.modalTitle}>Detalle del Pago</Text>

          {loading ? (
            <View style={modalStyles.loadingBox}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={{ marginTop: 10 }}>Cargando pagos...</Text>
            </View>
          ) : pagos.length === 0 ? (
            <Text style={styles.emptyText}>No hay pagos registrados para este equipo.</Text>
          ) : (
            <ScrollView contentContainerStyle={modalStyles.scrollContent}>
              {pagos.map((pago, idx) => (
                <View key={idx} style={modalStyles.card}>
                  <View style={modalStyles.row}>
                    <Text style={modalStyles.label}>Equipo:</Text>
                    <Text style={modalStyles.value}>{pago.equipo}</Text>
                  </View>
                  <View style={modalStyles.row}>
                    <Text style={modalStyles.label}>Categoría:</Text>
                    <Text style={modalStyles.value}>{pago.categoria}</Text>
                  </View>
                  <View style={modalStyles.row}>
                    <Text style={modalStyles.label}>Género:</Text>
                    <Text style={modalStyles.value}>{pago.genero === 'V' ? 'Varones' : 'Damas'}</Text>
                  </View>
                  <View style={modalStyles.row}>
                    <Text style={modalStyles.label}>Monto:</Text>
                    <Text style={modalStyles.value}>{pago.monto} Bs</Text>
                  </View>
                  <View style={modalStyles.row}>
                    <Text style={modalStyles.label}>Fecha:</Text>
                    <Text style={modalStyles.value}>{formatFecha(pago.fecha)}</Text>
                  </View>
                  <View style={modalStyles.row}>
                    <Text style={modalStyles.label}>Referencia:</Text>
                    <Text style={modalStyles.value}>{pago.referencia}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          <View style={modalStyles.buttonBox}>
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
  card: {
    marginBottom: 15,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  row: {
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  value: {
    fontSize: 15,
    color: '#333',
    marginTop: 2,
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  scrollContent: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  buttonBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    marginBottom: 10,
  },
});

export default DetallePagoInscripcionModal;
