import { Slot } from 'expo-router';
import { SessionProvider, useSession } from '../context/SessionProvider';
import HamburgerMenu from './hamburgerAdmin';
import Toast from 'react-native-toast-message';
import { useEffect } from 'react';
import { registerForPushNotifications, setupNotificationListeners } from '../services/notification';
import { useRouter  } from 'expo-router';
import { CampeonatoProvider } from '../context/CampeonatoContext';

function RootLayout() {
  const { token,user } = useSession();
  const isLoggedIn = !!token;
  const router = useRouter(); 

  useEffect(() => {
    if (isLoggedIn) {
      registerForPushNotifications();
      setupNotificationListeners(router,user); 
    }
  }, [isLoggedIn, router, user]);

  return (
    <HamburgerMenu isLoggedIn={isLoggedIn}>
      <Slot />
    </HamburgerMenu>
  );
}
export default function AppLayout() {
  return (
    <SessionProvider>
      <CampeonatoProvider> 
        <RootLayout />
        <Toast />
      </CampeonatoProvider>
    </SessionProvider>
  );
}