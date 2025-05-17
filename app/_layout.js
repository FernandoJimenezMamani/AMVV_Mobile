import { Slot } from 'expo-router';
import { SessionProvider, useSession } from '../context/SessionProvider';
import HamburgerMenu from './hamburgerAdmin';
import Toast from 'react-native-toast-message';
import { useEffect } from 'react';
import { registerForPushNotifications, setupNotificationListeners } from '../services/notification';
import { useRouter  } from 'expo-router';

function RootLayout() {
  const { token } = useSession();
  const isLoggedIn = !!token;
  const router = useRouter(); 
  const { user } = useSession();
  useEffect(() => {
    if (isLoggedIn) {
      registerForPushNotifications();
      setupNotificationListeners(router,user); 
    }
  }, [isLoggedIn, router]);

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