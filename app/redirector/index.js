import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSession } from '../../context/SessionProvider';

export default function Redirector() {
  const { user } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace('/home');  // Usuarios no logueados
    } else {
      const rol = user.rol?.nombre;

      if (rol === 'PresidenteAsociacion') {
        router.replace('/home/vista_defecto'); // Vista por defecto para PresidenteAsociacion
      } else if (rol === 'PresidenteClub' || rol === 'DelegadoClub') {
        router.replace('/presidente_club/inicio_presidente');
      } else if (rol === 'Jugador') {
        router.replace('/jugador/inicio_jugador');
      } else {
        router.replace('/home/vista_defecto'); // Cualquier otro rol no esperado
      }
    }
    setLoading(false);
  }, [user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#143E42" />
        <Text>Cargando...</Text>
      </View>
    );
  }

  return null;
}
