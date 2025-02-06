import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Layout from '../../components/hamburger';  // Asegúrate de que la ruta al componente Layout sea la correcta

export default function Home() {
  return (
    <Layout>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to the Home Page!</Text>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
