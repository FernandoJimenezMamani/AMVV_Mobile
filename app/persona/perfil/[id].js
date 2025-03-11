import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSession } from '../../../context/SessionProvider';
import defaultUserMenIcon from '../../../assets/img/Default_Imagen_Men.webp';
import defaultUserWomenIcon from '../../../assets/img/Default_Imagen_Women.webp';
import { MaterialIcons } from '@expo/vector-icons';
import ChangePasswordModal from '../../cambiar_contraseña';
import EditarPerfilPersona from '../editar_perfil';

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
    router.push('/login');
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
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleEditProfile} style={styles.button}>
            <MaterialIcons name="edit" size={20} color="white" />
            <Text style={styles.buttonText}>Editar perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsModalOpen(true)} style={styles.button}>
            <MaterialIcons name="edit" size={20} color="white" />
            <Text style={styles.buttonText}>Cambiar Contraseña</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.button}>
            <MaterialIcons name="logout" size={20} color="white" />
            <Text style={styles.buttonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image source={getImagenPerfil(jugador)} style={styles.image} />
        </View>
        <View style={styles.details}>
          <Text style={styles.detailText}>
            <Text style={styles.bold}>Nombre Completo:</Text> {jugador.nombre} {jugador.apellido}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.bold}>Carnet de Identidad:</Text> {jugador.ci}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.bold}>Fecha de Nacimiento:</Text> {jugador.fecha_nacimiento}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.bold}>Edad:</Text> {calcularEdad(jugador.fecha_nacimiento)} años
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.bold}>Género:</Text> {ConvertGenero(jugador.genero)}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.bold}>Dirección vivienda:</Text> {jugador.direccion}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.bold}>Correo Electrónico:</Text> {jugador.correo}
          </Text>
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
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 26,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#3D8FA4',
    borderRadius: 6,
    marginBottom: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 5,
  },
  content: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 20,
  },
  imageContainer: {
    marginBottom: 20,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: '#ddd',
  },
  details: {
    width: '100%',
  },
  detailText: {
    fontSize: 16,
    marginVertical: 8,
    color: '#444',
  },
  bold: {
    fontWeight: 'bold',
    color: '#222',
  },
});

export default PerfilJugador;