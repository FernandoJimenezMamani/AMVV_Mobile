import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const HamburgerAdmin = ({ children }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const router = useRouter();

  const toggleMenu = () => setMenuVisible(!menuVisible);
  const toggleSection = (section) => setExpandedSection(expandedSection === section ? null : section);

  return (
    <View style={styles.container}>
      {/* Barra de navegación superior */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.hamburger} onPress={toggleMenu}>
          <View style={styles.bar} />
          <View style={styles.bar} />
          <View style={styles.bar} />
        </TouchableOpacity>
      </View>

      {/* Menú desplegable */}
      {menuVisible && (
        <View style={styles.menu}>
          <TouchableOpacity onPress={() => router.push('/partidos')}>
            <Text style={styles.link}>Inicio</Text>
          </TouchableOpacity>

          <View style={styles.menuItem}>
            <TouchableOpacity onPress={() => toggleSection('campeonatos')}>
              <Text style={styles.mainLink}>Asociación</Text>
            </TouchableOpacity>
            {expandedSection === 'campeonatos' && (
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
              </View>
            )}
          </View>
          <View style={styles.menuItem}>
            <TouchableOpacity onPress={() => toggleSection('miembros')}>
              <Text style={styles.mainLink}>Miembros</Text>
            </TouchableOpacity>
            {expandedSection === 'miembros' && (
              <View style={styles.subMenu}>
                <TouchableOpacity onPress={() => router.push('/arbitro')}>
                  <Text style={styles.subMenuItem}>Arbitros</Text>
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
          <View style={styles.menuItem}>
            <TouchableOpacity onPress={() => toggleSection('traspasos')}>
              <Text style={styles.mainLink}>Traspasos</Text>
            </TouchableOpacity>
            {expandedSection === 'traspasos' && (
              <View style={styles.subMenu}>
                <TouchableOpacity onPress={() => router.push('/traspaso/index_jugador_traspaso')}>
                  <Text style={styles.subMenuItem}>Fichar Jugadores</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/traspaso')}>
                  <Text style={styles.subMenuItem}>Ver Solicitudes</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/traspaso')}>
                  <Text style={styles.subMenuItem}>Ver Solicitudes P</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
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
});

export default HamburgerAdmin;