import React, { useState, useContext } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router'; 
import { useSession } from '../context/SessionProvider';
import logo from '../assets/logo.png';

const HamburgerAdmin = ({ children }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const { user, logout } = useSession(); 
  const router = useRouter();

  const toggleMenu = () => setMenuVisible(!menuVisible);
  const toggleSection = (section) => setExpandedSection(expandedSection === section ? null : section);

  const hasRole = (...roles) => {
    return user && user.roles && roles.some(role => user.roles.includes(role));
  };

  const navigateToPartidos = () => router.push('/partidos');
  const navigateToIndiceCampeonato = () => router.push('/campeonato');
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

          {hasRole('Presidente') && (
            <View style={styles.menuItem}>
              <TouchableOpacity onPress={() => toggleSection('campeonatos')}>
                <Text style={styles.mainLink}>Campeonatos</Text>
              </TouchableOpacity>
              {expandedSection === 'campeonatos' && (
                <View style={styles.subMenu}>
                  <TouchableOpacity onPress={navigateToIndiceCampeonato}>
                    <Text style={styles.subMenuItem}>Indice</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Buscar..."
              style={styles.searchInput}
              placeholderTextColor="#ccc"
            />
          </View>

          <TouchableOpacity onPress={logout}>
            <Text style={styles.link}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

export default HamburgerAdmin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#64848C',
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  brand: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  hamburger: {
    padding: 10,
  },
  bar: {
    width: 25,
    height: 3,
    backgroundColor: '#fff',
    marginVertical: 2,
  },
  menu: {
    backgroundColor: '#1B2426',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  link: {
    fontSize: 16,
    color: '#fff',
    marginVertical: 10,
  },
  menuItem: {
    marginVertical: 10,
  },
  mainLink: {
    fontSize: 18,
    color: '#fff',
    paddingVertical: 10,
  },
  subMenu: {
    paddingLeft: 10,
    backgroundColor: '#143E43',
    borderRadius: 5,
    marginVertical: 5,
  },
  subMenuItem: {
    fontSize: 16,
    color: '#fff',
    paddingVertical: 5,
  },
  searchContainer: {
    marginVertical: 10,
  },
  searchInput: {
    backgroundColor: '#2c3e50',
    borderRadius: 5,
    paddingHorizontal: 10,
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
});
