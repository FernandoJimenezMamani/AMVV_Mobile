import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import defaultUserMen from '../../../assets/img/Default_Imagen_Men.webp';
import defaultUserWomen from '../../../assets/img/Default_Imagen_Women.webp';
import styles from '../../../styles/detalle_traspaso'; 

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const DetalleTraspasoPresidenteSolicitante = () => {
  // Cambia esto para obtener correctamente el parámetro de la ruta
  const params = useLocalSearchParams();
  const solicitudId = params.id; // Asegúrate de que el nombre del parámetro coincide
  
  console.log('ID recibido:', solicitudId); // Para depuración

  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!solicitudId) {
      setError('No se recibió un ID válido');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
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

        console.log('Respuesta API:', response.data); // Para depuración

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
          `No se pudo cargar la información de la solicitud (ID: ${solicitudId}). Por favor, inténtalo de nuevo.`,
          [{ text: 'OK' }]
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [solicitudId]);

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
    </ScrollView>
  );
};


export default DetalleTraspasoPresidenteSolicitante;