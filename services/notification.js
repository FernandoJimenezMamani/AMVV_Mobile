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

export const setupNotificationListeners = (router) => {
  Notifications.addNotificationReceivedListener(notification => {
    console.log('Notificación recibida:', notification);
  });

  Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data;
    console.log('Usuario tocó la notificación:', data);
    
    if (data?.screen === 'detalle_jugador') {
      router.push(`/traspaso/detalle_jugador/${data.traspasoId}`);
    }
    switch(data?.screen){
      case 'detalle_jugador':
        router.push(`/traspaso/detalle_jugador/${data.traspasoId}`);
        break;
      case 'detalle_presidente':
        router.push(`/traspaso/detalle_presidente/${data.traspasoId}`);
        break;
      case 'detalle_solicitante':
          router.push(`/traspaso/detalle_solicitante/${data.traspasoId}`);
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
    console.error('Error al obtener token push:', error);
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
      console.error('Respuesta no JSON recibida:', text);
      throw new Error(`Respuesta inesperada: ${text.substring(0, 100)}...`);
    }

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error al registrar token:', data);
      throw new Error(data.message || 'Error al registrar token push');
    }

    console.log('Token registrado exitosamente en backend:', data);
    return data;
  } catch (error) {
    console.error('Error en registerPushToken:', error);
    throw error;
  }
};

const getAuthToken = async () => {
  return await AsyncStorage.getItem('token');
};