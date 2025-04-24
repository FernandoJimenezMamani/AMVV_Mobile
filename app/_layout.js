import { Slot } from 'expo-router';
import { SessionProvider, useSession } from '../context/SessionProvider';
import HamburgerMenu from './hamburgerAdmin';
import  Toast  from 'react-native-toast-message'; // Importa Toast

function RootLayout() {
  const { token } = useSession();
  const isLoggedIn = !!token;
  
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
      {/* Agrega el componente Toast aquí, al mismo nivel que RootLayout */}
      <Toast />
    </SessionProvider>
  );
}