import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Modal, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import { useSession } from '../../context/SessionProvider';
import { useRouter } from 'expo-router';
import moment from 'moment';
import 'moment/locale/es';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import estadosMapping from '../../constants/campeonato_estados';
import rolMapping from '../../constants/roles';
import styles from '../../styles/campeonato/index';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const WEBSOCKET_URL = process.env.EXPO_PUBLIC_WEBSOCKET_URL;

const Campeonatos = () => {
  const [campeonatos, setCampeonatos] = useState([]);
  const [showFechasModal, setShowFechasModal] = useState(false);
  const [fechasCampeonato, setFechasCampeonato] = useState([]);
  const [selectedCampeonatoId, setSelectedCampeonatoId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { user } = useSession();
  const router = useRouter();

  useEffect(() => {
    fetchCampeonatos();
    const socket = connectWebSocket();
    
    return () => {
      if (socket) socket.close();
    };
  }, []);

  const connectWebSocket = () => {
    const socket = new WebSocket(WEBSOCKET_URL);

    socket.onopen = () => {
      console.log('WebSocket conectado');
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Mensaje recibido:', data);
    
        if (data.type === 'actualizacion_estados' && Array.isArray(data.cambios)) {
          fetchCampeonatos();
          setCampeonatos((prevCampeonatos) =>
            prevCampeonatos.map((campeonato) => {
              const cambio = data.cambios.find((c) => c.id === campeonato.id);
              return cambio ? { ...campeonato, estado: cambio.nuevoEstado } : campeonato;
            })
          );
        }
      } catch (error) {
        console.error('Error procesando el mensaje del WebSocket:', error);
      }
    };

    socket.onerror = (error) => {
      console.error('Error en WebSocket:', error);
    };

    socket.onclose = (event) => {
      console.log('WebSocket desconectado. Código:', event.code);
      if (event.code !== 1000 && event.code !== 1001) {
        setTimeout(() => {
          console.log('Reintentando conexión WebSocket...');
          connectWebSocket();
        }, 5000);
      }
    };

    return socket;
  };

  const fetchCampeonatos = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Campeonatos/select`);
      setCampeonatos(response.data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron obtener los campeonatos');
      console.error('Error al obtener los campeonatos:', error);
    }
  };

  const handleShowFechas = async (campeonatoId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Campeonatos/obtenerFechas/${campeonatoId}`);
      setFechasCampeonato(response.data.fechas);
      setSelectedCampeonatoId(campeonatoId);
      setShowFechasModal(true);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron obtener las fechas del campeonato');
      console.error('Error obteniendo fechas:', error);
    }
  };

  const handleGeneratePDF = async (fecha) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/partidos/campeonatoPartidosPDF/${selectedCampeonatoId}?fecha=${fecha}`,
        { responseType: 'blob' }
      );

      const fileUri = `${FileSystem.cacheDirectory}partidos_${selectedCampeonatoId}_${fecha}.pdf`;
      
      await FileSystem.writeAsStringAsync(fileUri, response.data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Partidos del Campeonato',
        UTI: 'com.adobe.pdf',
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el PDF');
      console.error('Error generando PDF:', error);
    }
  };

  const handleDeleteCampeonato = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/Campeonatos/delete_campeonato/${selectedCampeonatoId}`);
      Alert.alert('Éxito', 'Campeonato eliminado correctamente');
      setCampeonatos(campeonatos.filter(camp => camp.id !== selectedCampeonatoId));
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el campeonato');
      console.error("Error al eliminar el campeonato:", error);
    } finally {
      setShowConfirmModal(false);
      setSelectedCampeonatoId(null);
    }
  };

  const confirmDeleteCampeonato = (campeonatoId) => {
    setSelectedCampeonatoId(campeonatoId);
    setShowConfirmModal(true);
  };

  const hasRole = (...requiredRoles) => {
    return user && user.rol && requiredRoles.includes(user.rol.nombre);
  };

  const handleViewDetails = (id) => {
    router.push(`/categoria/indice/${id}`);
  };

  const renderEstado = (estado) => {
    let estadoTexto = '';
    let estiloEstado = styles.estadoDesconocido;
    
    switch (estado) {
      case estadosMapping.transaccionProceso:
        estadoTexto = 'Preparación';
        estiloEstado = styles.estadoPreparacion;
        break;
      case estadosMapping.campeoantoEnCurso:
        estadoTexto = 'En curso';
        estiloEstado = styles.estadoEnCurso;
        break;
      case estadosMapping.enEspera:
        estadoTexto = 'En espera';
        estiloEstado = styles.estadoEnEspera;
        break;
      case estadosMapping.campeonatoFinalizado:
        estadoTexto = 'Finalizado';
        estiloEstado = styles.estadoFinalizado;
        break;
      default:
        estadoTexto = 'Desconocido';
        estiloEstado = styles.estadoDesconocido;
    }

    return (
      <View style={[styles.estadoContainer, estiloEstado]}>
        <View style={styles.punto} />
        <Text style={styles.estadoText}>{estadoTexto}</Text>
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.campeonatoCard}>
      {renderEstado(item.estado)}
      
      <Text style={styles.campeonatoNombre}>{item.nombre}</Text>
      
      <Text style={styles.campeonatoText}>
        <Text style={styles.boldText}>Inicio de movimientos y transacciones:</Text>{" "}
        {moment.parseZone(item.fecha_inicio_transaccion).format("DD [de] MMMM, YYYY HH:mm [hrs]")}
      </Text>
      
      <Text style={styles.campeonatoText}>
        <Text style={styles.boldText}>Fin de movimientos y transacciones:</Text>{" "}
        {moment.parseZone(item.fecha_fin_transaccion).format("DD [de] MMMM, YYYY HH:mm [hrs]")}
      </Text>
      
      <Text style={styles.campeonatoText}>
        <Text style={styles.boldText}>Inicio Campeonato:</Text>{" "}
        {moment.parseZone(item.fecha_inicio_campeonato).format("DD [de] MMMM, YYYY HH:mm [hrs]")}
      </Text>
      
      <Text style={styles.campeonatoText}>
        <Text style={styles.boldText}>Fin del campeonato:</Text>{" "}
        {moment.parseZone(item.fecha_fin_campeonato).format("DD [de] MMMM, YYYY HH:mm [hrs]")}
      </Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.viewButton]} 
          onPress={() => handleViewDetails(item.id)}
        >
          <MaterialIcons name="visibility" size={20} color="white" />
        </TouchableOpacity>
        
        {(item.estado === estadosMapping.campeoantoEnCurso || 
          item.estado === estadosMapping.transaccionProceso || 
          item.estado === estadosMapping.enEspera) && (
          <>
            <TouchableOpacity 
              style={[styles.button, styles.fechasButton]} 
              onPress={() => handleShowFechas(item.id)}
            >
              <MaterialCommunityIcons name="calendar" size={20} color="white" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Campeonatos</Text>

      <FlatList
        data={campeonatos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
      />

      {/* Modal de Fechas */}
      <Modal
        visible={showFechasModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFechasModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Fechas del Campeonato</Text>
            
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setShowFechasModal(false)}
            >
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
            
            <ScrollView style={styles.fechasScroll}>
              {fechasCampeonato.map((fecha, index) => (
                <View key={index} style={styles.fechaItem}>
                  <Text style={styles.fechaText}>
                    {moment(fecha).format("DD [de] MMMM, YYYY")}
                  </Text>
                  <TouchableOpacity 
                    style={styles.pdfButton}
                    onPress={() => handleGeneratePDF(fecha)}
                  >
                    <MaterialCommunityIcons name="file-pdf-box" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
};
export default Campeonatos;