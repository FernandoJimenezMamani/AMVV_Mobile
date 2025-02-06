import { Slot } from 'expo-router';
import { SessionProvider } from '../context/SessionProvider'; 

export default function Layout() {
  return (
    <SessionProvider>
      <Slot /> 
    </SessionProvider>
  );
}
