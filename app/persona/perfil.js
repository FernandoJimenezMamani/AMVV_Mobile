import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSession } from '../../context/SessionProvider';
import defaultUserMenIcon from '../../assets/img/Default_Imagen_Men.webp';
import defaultUserWomenIcon from '../../assets/img/Default_Imagen_Women.webp';
import { MaterialIcons } from '@expo/vector-icons'; // Importa MaterialIcons desde @expo/vector-icons
import ChangePasswordModal from '../cambiar_contraseña';
import EditarPerfilPersona from './editar_perfil';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const PerfilJugador = () => {
  const { id } = useLocalSearchParams(); 
  const [jugador, setJugador] = useState(null);
  const { user, logout } = useSession();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchJugador = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/persona/get_personaById/${id}`);
        setJugador(response.data);
      } catch (error) {
        Alert.alert('Error', 'No se pudo obtener los datos del jugador');
        console.error('Error al obtener los datos del jugador:', error);
      }
    };

    fetchJugador();
  }, [id]);

  if (!jugador) {
    return <Text>Cargando...</Text>;
  }

  const calcularEdad = (fechaNacimiento) => {
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    return edad;
  };

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const getImagenPerfil = (persona) => {
    if (persona.persona_imagen) {
      return { uri: persona.persona_imagen };
    }
    return persona.genero === 'V' ? defaultUserMenIcon : defaultUserWomenIcon;
  };

  const ConvertGenero = () => {
    if (jugador.genero === 'V') {
      return 'Varón';
    } else {
      return 'Mujer';
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login'); // Navega a la pantalla de Login usando expo-router
  };

  return (
    <ScrollView style={styles.container}>
      <ChangePasswordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <EditarPerfilPersona
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        personaId={jugador.id}
        onPersonaUpdated={() => {
          setIsEditModalOpen(false);
          // Recargar los datos del jugador
          const fetchJugador = async () => {
            try {
              const response = await axios.get(`${API_BASE_URL}/persona/get_personaById/${id}`);
              setJugador(response.data);
            } catch (error) {
              Alert.alert('Error', 'No se pudo obtener los datos del jugador');
              console.error('Error al obtener los datos del jugador:', error);
            }
          };
          fetchJugador();
        }}
      />
      <View style={styles.header}>
        <Text style={styles.title}>Mi Perfil</Text>
        <TouchableOpacity onPress={handleEditProfile} style={styles.button}>
          <Text style={styles.buttonText}>Editar perfil</Text>
          <MaterialIcons name="edit" size={24} color="white" /> {/* Ícono de edición */}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsModalOpen(true)} style={styles.button}>
          <Text style={styles.buttonText}>Cambiar Contraseña</Text>
          <MaterialIcons name="edit" size={24} color="white" /> {/* Ícono de edición */}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} style={styles.button}>
          <Text style={styles.buttonText}>Cerrar Sesion</Text>
          <MaterialIcons name="logout" size={24} color="white" /> {/* Ícono de logout */}
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image source={getImagenPerfil(jugador)} style={styles.image} />
        </View>
        <View style={styles.details}>
          <Text style={styles.detailText}><Text style={styles.bold}>Nombre Completo:</Text> {jugador.nombre} {jugador.apellido}</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>Carnet de Identidad:</Text> {jugador.ci}</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>Fecha de Nacimiento:</Text> {jugador.fecha_nacimiento}</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>Edad:</Text> {calcularEdad(jugador.fecha_nacimiento)} años</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>Genero:</Text> {ConvertGenero(jugador.genero)}</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>Dirección vivienda:</Text> {jugador.direccion}</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>Correo Electronico:</Text> {jugador.correo}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 26,
    color: '#333',
    fontWeight: 'bold',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#3D8FA4',
    borderRadius: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    marginRight: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    paddingTop: 20,
  },
  imageContainer: {
    flex: 1,
    maxWidth: 250,
    alignItems: 'center',
  },
  image: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 4,
    borderColor: '#ddd',
  },
  details: {
    flex: 2,
    paddingLeft: 30,
  },
  detailText: {
    fontSize: 18,
    marginVertical: 8,
    color: '#444',
  },
  bold: {
    fontWeight: 'bold',
    color: '#222',
  },
});

export default PerfilJugador;