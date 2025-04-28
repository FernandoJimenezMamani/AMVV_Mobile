import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { SessionProvider, useSession } from '../context/SessionProvider';
import { MaterialIcons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialIcons';

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

  const hasRole = (...roles) => {
    return user && user.rol && roles.includes(user.rol.nombre);
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
         <>

         <View style={styles.overlay} onTouchStart={toggleMenu} />
        <View style={styles.menu}>
          {!isLoggedIn ? (
            /* Menú para usuarios NO autenticados */
            <>
              <TouchableOpacity onPress={() => {router.push('/club'); setMenuVisible(false); }} style={styles.linkButton}>
                <Icon name="groups" size={24} color="#000" />
                <Text style={styles.linkText}>Clubes</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => {router.push('/auth'); setMenuVisible(false);}} style={styles.linkButton}>
                <Icon name="login" size={24} color="#000" />
                <Text style={styles.linkText}>Iniciar Sesión</Text>
              </TouchableOpacity>

            </>
          ) : (
            /* Menú para usuarios autenticados (Admin) */
            <>
              <TouchableOpacity onPress={() => {router.push('/'); setMenuVisible(false);} }>
              <View style={styles.mainLink}>
                <MaterialIcons name="home" size={20} color="#143E42" style={{ marginRight: 8 }} />
                <Text style={styles.mainLinkText}>Inicio</Text>
              </View>

              </TouchableOpacity>

              {hasRole('PresidenteAsociacion') && (
                <View style={styles.menuItem}>
                  <TouchableOpacity onPress={() => toggleSection('asociacion')}>
                  <View style={styles.mainLink}>
                    <MaterialIcons name="sports" size={20} color="#143E42" style={{ marginRight: 8 }} />
                    <Text style={styles.mainLinkText}>Asociación</Text>
                  </View>
                  
                  </TouchableOpacity>
                  {expandedSection === 'asociacion' && (
                    <View style={styles.subMenu}>
                      <TouchableOpacity onPress={() => {router.push('/campeonato'); setMenuVisible(false);}}>
                        <Text style={styles.subMenuItem}>Campeonatos</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() =>{ router.push('/club') ; setMenuVisible(false);}}>
                        <Text style={styles.subMenuItem}>Clubes</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => {router.push('/categoria') ; setMenuVisible(false);}}>
                        <Text style={styles.subMenuItem}>Categorías</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => {router.push('/complejos') ; setMenuVisible(false);}}>
                        <Text style={styles.subMenuItem}>Complejos</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}

              {hasRole('PresidenteAsociacion') && (
                <View style={styles.menuItem}>
                  <TouchableOpacity onPress={() => toggleSection('miembros')}>
                  <View style={styles.mainLink}>
                    <MaterialIcons name="group" size={20} color="#143E42" style={{ marginRight: 8 }}/>
                    <Text style={styles.mainLinkText}>Miembros</Text>
                  </View>
                  </TouchableOpacity>
                  {expandedSection === 'miembros' && (
                    <View style={styles.subMenu}>
                      <TouchableOpacity onPress={() => {router.push('/arbitro'); setMenuVisible(false);}}>
                        <Text style={styles.subMenuItem}>Árbitros</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => {router.push('/jugador'); setMenuVisible(false);}}>
                        <Text style={styles.subMenuItem}>Jugadores</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => {router.push('/presidente_club'); setMenuVisible(false);}}>
                        <Text style={styles.subMenuItem}>Presidentes</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => {router.push('/delegado_club'); setMenuVisible(false);}}>
                        <Text style={styles.subMenuItem}>Delegados</Text>
                      </TouchableOpacity>
                    </View>
                  )}
              </View>
              )}
              {/* Sección Miembros */}
              

              {/* Sección Traspasos */}
              {(hasRole('PresidenteClub') || hasRole('Jugador')) && (
                <View style={styles.menuItem}>
                  <TouchableOpacity onPress={() => toggleSection('traspasos')}>
                  <View style={styles.mainLink}>
                  <Text style={styles.mainLinkText}>Traspasos</Text>
                  </View>
                    
                  </TouchableOpacity>
                  {expandedSection === 'traspasos' && (
                    <View style={styles.subMenu}>
                      {hasRole('PresidenteClub') && (
                        <>
                          <TouchableOpacity onPress={() => {router.push('/traspaso/jugadores_traspaso'); setMenuVisible(false);}}>
                            <Text style={styles.subMenuItem}>Fichar Jugadores</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => {router.push('/traspaso/solicitud_presidente'); setMenuVisible(false);}}>
                            <Text style={styles.subMenuItem}>Ver Solicitudes P</Text>
                          </TouchableOpacity>
                        </>
                      )}
                      {hasRole('Jugador') && (
                        <>
                          <TouchableOpacity onPress={() => {router.push('/traspaso/clubes_traspaso') ; setMenuVisible(false);}}>
                            <Text style={styles.subMenuItem}>Cambiar de Club</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => {router.push('/traspaso/solicitud_jugador'); setMenuVisible(false);}}>
                            <Text style={styles.subMenuItem}>Ver Solicitudes</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  )}
                </View>
              )}

              <TouchableOpacity 
                style={styles.accountButton} 
                onPress={handleProfileClick}
              >
                <Text style={styles.accountButtonText}>
                  <MaterialIcons name="account-circle" size={20} alignItems={'center'} color="#fff" /> Mi Cuenta
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        </>
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
    backgroundColor: 'transparent',
    paddingHorizontal: 10,
    paddingVertical: 1,
    marginBottom: -30,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginRight: 5,
  },
  brand: {
    color: '#143E42',
    fontSize: 18,
    fontWeight: 'bold',
  },
  hamburger: {
    padding: 10,
  },
  bar: {
    width: 25,
    height: 3,
    backgroundColor: '#143E42',
    marginVertical: 2,
  },
  menu: {
    position: 'absolute',  // 🔥 Flotante
    top: 80,                // 🔥 Distancia desde arriba (ajustar según tu navbar)
    right: 10,              // 🔥 Pegado al lado derecho
    width: 250,             // 🔥 Ancho fijo
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 100,            // 🔥 Muy importante para que esté encima
  },
  
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', // 🔥 Fondo negro transparente
    zIndex: 99,
  },
  
  link: {
    fontSize: 16,
    color: '#143E42',
    marginVertical: 10,
    fontWeight: 'bold',

  },
  menuItem: {
    marginVertical: 5, // más espacio entre secciones
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0', // línea tenue de separación
    paddingBottom: 1,
  },
  
  mainLink: {
    fontSize: 16,
    color: '#143E42',
    marginVertical: 10,
    fontWeight: 'bold',
    flexDirection: 'row',   // 🔥 Poner ícono + texto en una fila
    alignItems: 'center',
  },
  mainLinkText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#143E42',
  },
  subMenu: {
    backgroundColor: '#e8f0f2', // gris clarito azulado
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginVertical: 5,
  },
  subMenuItem: {
    fontSize: 16,
    color: '#143E42',
    paddingVertical: 8,


  },
  
  content: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    marginVertical: 10,
  },
  searchInput: {
    backgroundColor: 'transparent',
    color: '#fff',
    padding: 10,
    borderRadius: 5,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  
  linkText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  accountButton: {
    backgroundColor: '#143E42',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 20,
    alignSelf: 'center',
  },
  accountButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  
});

export default HamburgerMenu;