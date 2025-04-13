import { Slot } from 'expo-router';
import { SessionProvider, useSession } from '../context/SessionProvider';
import HamburgerMenu from './hamburgerAdmin';

function RootLayout() {
  const { token } = useSession(); // Usa token en lugar de session
  
  // Verifica directamente el token
  const isLoggedIn = !!token;
  console.log("RootLayout - isLoggedIn:", isLoggedIn, "token:", token);

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
    </SessionProvider>
  );
}