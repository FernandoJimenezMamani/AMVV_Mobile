import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { SessionProvider, useSession } from '../../../context/SessionProvider';
import Club_defecto from '../../../assets/img/Club_defecto.png'; 
import FechaCampeonatoInfo from '../../../components/FechaCampeonatoInfo';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const InicioPresidente = ({  }) => {
  const [clubActual, setClubActual] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, token, logout } = useSession();
  const presidenteId = user?.id;
  useEffect(() => {
    if (presidenteId) {
      fetchClubActual(presidenteId);
    }
  }, [presidenteId]);

  const fetchClubActual = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/presidente_club/clubActual/${id}`);
      setClubActual(response.data);
    } catch (error) {
      console.log('Error al obtener el club actual del presidente:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImagenClub = (club) => {
    if (club && club.club_imagen) {
      return { uri: club.club_imagen };
    }
    return Club_defecto;
  };

  const handleVerPerfil = () => {
    if (clubActual?.club_id) {
      router.push(`/club/perfil/${clubActual.club_id}`);
    }
  };


  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#143E42" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <>
    <View>
      <FechaCampeonatoInfo />
    </View>
    <View style={styles.container}>
      {clubActual ? (
        <View style={styles.clubInfo}>
          
          <Text style={styles.titulo}>Mi Club</Text>
          <Image source={getImagenClub(clubActual)} style={styles.clubLogo} />
          <Text style={styles.clubNombre}>{clubActual.club_nombre}</Text>
          <TouchableOpacity style={styles.btnVerClub} onPress={handleVerPerfil}>
            <Text style={styles.btnVerClubText}>Ver Perfil del Club</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.noClubText}>No tienes un club activo actualmente.</Text>
      )}
    </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  clubInfo: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  clubLogo: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#007bff',
    marginBottom: 20,
    resizeMode: 'cover',
  },
  clubNombre: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  btnVerClub: {
    backgroundColor: '#3D8FA4',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  btnVerClubText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noClubText: {
    fontSize: 18,
    color: '#d9534f',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#143E42',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#143E42',
  },
});

export default InicioPresidente;
