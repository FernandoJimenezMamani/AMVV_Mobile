import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSession } from '../../../context/SessionProvider';
import defaultUserMenIcon from '../../../assets/img/Default_Imagen_Men.webp';
import defaultUserWomenIcon from '../../../assets/img/Default_Imagen_Women.webp';
import ChangePasswordModal from '../../cambiar_contraseña';
import EditarPerfilPersona from '../editar_perfil';
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const PerfilJugador = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [jugador, setJugador] = useState(null);
  const { user, logout } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJugador = async () => {
      try {
        if (!id) {
          console.warn('No se recibió un ID');
          router.back();
          return;
        }
        
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/persona/get_personaById/${id}`);
        setJugador(response.data);
      } catch (error) {
        Alert.alert('Error', 'No se pudo obtener los datos del jugador');
        console.log('Error:', error);
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchJugador();
  }, [id]);

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return 'N/A';
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    return `${edad} años`;
  };

  const getImagenPerfil = () => {
    if (!jugador) return defaultUserMenIcon;
    if (jugador.persona_imagen) {
      return { uri: jugador.persona_imagen };
    }
    return jugador.genero === 'V' ? defaultUserMenIcon : defaultUserWomenIcon;
  };

  const getGeneroTexto = () => {
    if (!jugador) return 'N/A';
    return jugador.genero === 'V' ? 'Varón' : 'Mujer';
  };

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  const handleBack = () => {
    router.back();
  };

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3D8FA4" />
      </View>
    );
  }

  if (!jugador) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudo cargar el perfil</Text>
        <TouchableOpacity onPress={handleBack} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <ChangePasswordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      
      <EditarPerfilPersona
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        personaId={jugador.id}
        onPersonaUpdated={(updatedPersona) => {
          setIsEditModalOpen(false);
          setJugador(updatedPersona);
        }}
      />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#3D8FA4" />
        </TouchableOpacity>
        
        <Text style={styles.title}>Mi Perfil</Text>
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.editButton]}
            onPress={handleEditProfile}
          >
            <MaterialIcons name="edit" size={18} color="white" />
            <Text style={styles.buttonText}>Editar perfil</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.passwordButton]}
            onPress={() => setIsModalOpen(true)}
          >
            <MaterialIcons name="lock" size={18} color="white" />
            <Text style={styles.buttonText}>Contraseña</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <MaterialIcons name="logout" size={18} color="white" />
            <Text style={styles.buttonText}>Salir</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.profileContainer}>
        <Image 
          source={getImagenPerfil()} 
          style={styles.profileImage} 
        />
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Nombre Completo:</Text>
            <Text style={styles.detailValue}>
              {jugador.nombre} {jugador.apellido}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Carnet de Identidad:</Text>
            <Text style={styles.detailValue}>{jugador.ci}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fecha de Nacimiento:</Text>
            <Text style={styles.detailValue}>{jugador.fecha_nacimiento}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Edad:</Text>
            <Text style={styles.detailValue}>
              {calcularEdad(jugador.fecha_nacimiento)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Género:</Text>
            <Text style={styles.detailValue}>{getGeneroTexto()}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Dirección:</Text>
            <Text style={styles.detailValue}>{jugador.direccion || 'N/A'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Correo:</Text>
            <Text style={styles.detailValue}>{jugador.correo || 'N/A'}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexWrap: 'wrap',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 4,
    flex: 1,
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: '#3D8FA4',
  },
  passwordButton: {
    backgroundColor: '#5D8FA4',
  },
  logoutButton: {
    backgroundColor: '#45575C',
  },
  buttonText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  detailsContainer: {
    width: '100%',
  },
  detailRow: {
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 16,
    color: '#444',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 20,
  },
  closeButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#ddd',
    borderRadius: 6,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PerfilJugador;