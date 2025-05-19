import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
// Configuración inicial de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const setupNotificationListeners = (router, user) => {
  Notifications.addNotificationReceivedListener(notification => {
    console.log('Notificación recibida:', notification);
  });

  Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data;
    console.log('Usuario tocó la notificación:', data);
    
    switch(data?.screen){
      case 'solicitud_jugador':
        router.push(`/traspaso/solicitud_jugador`);
        break;
      case 'solicitud_presidente':
        router.push(`/traspaso/solicitud_presidente`);
        break;
      case 'mis_solicitudes_presidente':
          router.push(`/traspaso/mis_solicitudes`);
          break;  
      case 'mis_solicitudes_jugador':
        router.push(`/traspaso/mis_solicitudes_jugador`);
        break;
      case 'historial_pago_presidente':
        router.push({
        pathname: '/pago/HistorialPagosTraspasoClub',
        params: { presidenteId: user.id }
      });
        break;
      case 'historial_pago_presidente_inscripcion':
        router.push({
        pathname: '/pago/HistorialPagosInscripcionClub',
        params: { presidenteId: user.id }
      });
        break;
      case 'home':
        router.push(`/`);
        break;
    } 
  });
};

export const registerForPushNotifications = async () => {
  if (!Device.isDevice) {
    console.warn('Debes usar un dispositivo físico para notificaciones push');
    return null;
  }

  // Verificar permisos
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Permiso para notificaciones no concedido');
    return null;
  }

  try {
    // Obtener token
    const token = (await Notifications.getExpoPushTokenAsync({
      projectId: '1b930ead-0efd-439c-afba-5097a5591258' // Tu projectId de EAS
    })).data;

    console.log('Token push obtenido:', token);
    
    // Registrar token en el backend
    await registerPushToken(token);
    
    return token;
  } catch (error) {
    console.log('Error al obtener token push:', error);
    return null;
  }
};

const registerPushToken = async (token) => {
  try {
    const authToken = await getAuthToken();
    
    if (!authToken) {
      console.log('No hay token de autenticación, no se puede registrar push token');
      return;
    }

    const response = await fetch(`${API_BASE_URL}/notification/register-push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ token }),
    });

    // Verificar si la respuesta es JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.log('Respuesta no JSON recibida:', text);
      throw new Error(`Respuesta inesperada: ${text.substring(0, 100)}...`);
    }

    const data = await response.json();
    
    if (!response.ok) {
      console.log('Error al registrar token:', data);
      throw new Error(data.message || 'Error al registrar token push');
    }

    console.log('Token registrado exitosamente en backend:', data);
    return data;
  } catch (error) {
    console.log('Error en registerPushToken:', error);
    throw error;
  }
};

const getAuthToken = async () => {
  return await AsyncStorage.getItem('token');
};