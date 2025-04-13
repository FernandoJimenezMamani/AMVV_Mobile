import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { SessionProvider, useSession } from '../context/SessionProvider';
import { MaterialIcons } from '@expo/vector-icons';

const HamburgerMenu = ({ children, isLoggedIn }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const router = useRouter();
  const segments = useSegments();
  const { user, token, logout } = useSession();

  console.log("HamburgerMenu - isLoggedIn:", isLoggedIn, "segments:", segments);

  // Mostrar siempre el menú si está logueado, o si está en la página de inicio
  const shouldShowMenu = isLoggedIn || segments.length === 0 || segments[0] === 'home';

  if (!shouldShowMenu) {
    return <View style={styles.container}>{children}</View>;
  }

  const toggleMenu = () => setMenuVisible(!menuVisible);
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleProfileClick = () => {
    if (user?.id) {
      router.push(`/persona/perfil/${user.id}`);
      setMenuVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Barra de navegación superior */}
      <View style={styles.navbar}>
        <View style={styles.logoContainer}>
          <Image source={require('../assets/logo.png')} style={styles.logo} />
          <Text style={styles.brand}>A.M.V.V</Text>
        </View>

        <TouchableOpacity style={styles.hamburger} onPress={toggleMenu}>
          <View style={styles.bar} />
          <View style={styles.bar} />
          <View style={styles.bar} />
        </TouchableOpacity>
      </View>

      {/* Menú desplegable */}
      {menuVisible && (
        <View style={styles.menu}>
          {!isLoggedIn ? (
            /* Menú para usuarios NO autenticados */
            <>
              <TouchableOpacity onPress={() => router.push('/partidos')}>
                <Text style={styles.link}>Partidos</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/posiciones')}>
                <Text style={styles.link}>Posiciones</Text>
              </TouchableOpacity>
              <View style={styles.searchContainer}>
                <TextInput
                  placeholder="Buscar..."
                  style={styles.searchInput}
                  placeholderTextColor="#ccc"
                />
              </View>
              <TouchableOpacity onPress={() => router.push('/auth')}>
                <Text style={styles.link}>Iniciar Sesión</Text>
              </TouchableOpacity>
            </>
          ) : (
            /* Menú para usuarios autenticados (Admin) */
            <>
              <TouchableOpacity onPress={() => router.push('/partidos')}>
                <Text style={styles.link}>Inicio</Text>
              </TouchableOpacity>

              {/* Sección Asociación */}
              <View style={styles.menuItem}>
                <TouchableOpacity onPress={() => toggleSection('asociacion')}>
                  <Text style={styles.mainLink}>Asociación</Text>
                </TouchableOpacity>
                {expandedSection === 'asociacion' && (
                  <View style={styles.subMenu}>
                    <TouchableOpacity onPress={() => router.push('/campeonato')}>
                      <Text style={styles.subMenuItem}>Campeonatos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/club')}>
                      <Text style={styles.subMenuItem}>Clubes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/categoria')}>
                      <Text style={styles.subMenuItem}>Categorias</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/complejos')}>
                      <Text style={styles.subMenuItem}>Complejos</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Sección Miembros */}
              <View style={styles.menuItem}>
                <TouchableOpacity onPress={() => toggleSection('miembros')}>
                  <Text style={styles.mainLink}>Miembros</Text>
                </TouchableOpacity>
                {expandedSection === 'miembros' && (
                  <View style={styles.subMenu}>
                    <TouchableOpacity onPress={() => router.push('/arbitro')}>
                      <Text style={styles.subMenuItem}>Árbitros</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/jugador')}>
                      <Text style={styles.subMenuItem}>Jugadores</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/presidente_club')}>
                      <Text style={styles.subMenuItem}>Presidentes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/delegado_club')}>
                      <Text style={styles.subMenuItem}>Delegados</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Sección Traspasos */}
              <View style={styles.menuItem}>
                <TouchableOpacity onPress={() => toggleSection('traspasos')}>
                  <Text style={styles.mainLink}>Traspasos</Text>
                </TouchableOpacity>
                {expandedSection === 'traspasos' && (
                  <View style={styles.subMenu}>
                    <TouchableOpacity onPress={() => router.push('/traspaso/jugadores_traspaso')}>
                      <Text style={styles.subMenuItem}>Fichar Jugadores</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/traspaso/solicitud_presidente')}>
                      <Text style={styles.subMenuItem}>Ver Solicitudes P</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/traspaso/clubes_traspaso')}>
                      <Text style={styles.subMenuItem}>Cambiar de Club</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/traspaso/solicitud_jugador')}>
                      <Text style={styles.subMenuItem}>Ver Solicitudes</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <TouchableOpacity 
                style={styles.accountButton} 
                onPress={handleProfileClick}
              >
                <Text style={styles.accountButtonText}>
                  <MaterialIcons name="account-circle" size={20} color="white" /> Mi Cuenta
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {/* Contenido principal */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

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
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
  content: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    marginVertical: 10,
  },
  searchInput: {
    backgroundColor: '#2C3E50',
    color: '#fff',
    padding: 10,
    borderRadius: 5,
  },
});

export default HamburgerMenu;