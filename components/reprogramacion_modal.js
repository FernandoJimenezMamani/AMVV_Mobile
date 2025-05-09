import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ReprogramacionModal = ({ visible, onClose, simulacion, onConfirm }) => {
  if (!simulacion) return null;

  // Separar fecha y hora
  const [fecha, hora] = simulacion.nuevaFechaHora.split(' ');

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Encabezado del modal */}
          <View style={styles.modalHeader}>
            <Icon name="calendar-month" size={24} color="#143E42" />
            <Text style={styles.modalTitle}>Nueva Programación del Partido</Text>
          </View>

          {/* Contenido del modal */}
          <View style={styles.modalBody}>
            <View style={styles.infoRow}>
              <Icon name="event" size={20} color="#3D8FA4" />
              <Text style={styles.infoText}><Text style={styles.boldText}>Fecha:</Text> {fecha}</Text>
            </View>

            <View style={styles.infoRow}>
              <Icon name="access-time" size={20} color="#3D8FA4" />
              <Text style={styles.infoText}><Text style={styles.boldText}>Hora:</Text> {hora}</Text>
            </View>

            <View style={styles.infoRow}>
              <Icon name="location-on" size={20} color="#3D8FA4" />
              <Text style={styles.infoText}><Text style={styles.boldText}>Lugar:</Text> {simulacion.nuevoLugar.nombre}</Text>
            </View>

            <View style={styles.sectionHeader}>
              <Icon name="gavel" size={20} color="#9DAC42" />
              <Text style={styles.sectionTitle}>Árbitros Asignados</Text>
            </View>

            <View style={styles.arbitrosList}>
              {simulacion.arbitrosAsignados.map(arbitro => (
                <View key={arbitro.id} style={styles.arbitroItem}>
                  <Icon name="person" size={16} color="#555" />
                  <Text style={styles.arbitroText}>{arbitro.nombre} {arbitro.apellido}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Botones del modal */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text >Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={onConfirm}>
              <Text style={styles.buttonText}>Confirmar</Text>
              <Icon name="check" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#143E42',
    marginLeft: 10,
  },
  modalBody: {
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#555',
  },
  boldText: {
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#143E42',
    marginLeft: 10,
  },
  arbitrosList: {
    marginLeft: 30,
  },
  arbitroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  arbitroText: {
    marginLeft: 5,
    color: '#555',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#3D8FA4',
  },
  buttonText: {
    marginRight: 5,
    color: 'white',
  },
});

export default ReprogramacionModal;