import { Slot } from 'expo-router';
import { SessionProvider, useSession } from '../context/SessionProvider';
import HamburgerMenu from './hamburgerAdmin';
import Toast from 'react-native-toast-message';
import { useEffect } from 'react';
import { registerForPushNotifications, setupNotificationListeners } from '../services/notification';
import { useNavigation } from 'expo-router';

function RootLayout() {
  const { token } = useSession();
  const isLoggedIn = !!token;
  const navigation = useNavigation();

  useEffect(() => {
    if (isLoggedIn) {
      // Registrar para notificaciones push cuando el usuario está logueado
      registerForPushNotifications();
      
      // Configurar los listeners de notificaciones
      setupNotificationListeners(navigation);
    }
  }, [isLoggedIn, navigation]);

  return (
    <HamburgerMenu isLoggedIn={isLoggedIn}>
      <Slot />
    </HamburgerMenu>
  );
}

export default function AppLayout() {
  return (
    <SessionProvider>
      <RootLayout />
      <Toast />
    </SessionProvider>
  );
}