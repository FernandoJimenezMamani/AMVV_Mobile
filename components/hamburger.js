import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router'; 
import logo from '../assets/logo.png'; 
import styles from "../styles/hamburger";

const Layout = ({ children }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter(); 

  const toggleMenu = () => setMenuVisible(!menuVisible);

  const navigateToPartidos = () => router.push('/partidos');
  const navigateToPosiciones = () => router.push('/hamburgerAdmin');
  const navigateToLogin = () => router.push('/auth');

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} />
          <Text style={styles.brand}>A.M.V.V</Text>
        </View>

        <TouchableOpacity style={styles.hamburger} onPress={toggleMenu}>
          <View style={styles.bar} />
          <View style={styles.bar} />
          <View style={styles.bar} />
        </TouchableOpacity>
      </View>

      {menuVisible && (
        <View style={styles.menu}>
          <TouchableOpacity onPress={navigateToPartidos}>
            <Text style={styles.link}>Partidos</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateToPosiciones}>
            <Text style={styles.link}>Posiciones</Text>
          </TouchableOpacity>
          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Buscar..."
              style={styles.searchInput}
              placeholderTextColor="#ccc"
            />
          </View>
          <TouchableOpacity onPress={navigateToLogin}>
            <Text style={styles.link}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

export default Layout;
