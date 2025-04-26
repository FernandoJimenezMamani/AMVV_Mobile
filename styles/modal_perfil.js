import { StyleSheet, Dimensions } from 'react-native';
const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: width * 0.9,
      maxHeight: '90%',
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    scrollContent: {
      paddingBottom: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#3D8FA4',
      textAlign: 'center',
      marginBottom: 15,
      textTransform: 'uppercase',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      gap: 15,
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 2,
      borderColor: '#3D8FA4',
    },
    infoContainer: {
      flex: 1,
    },
    infoText: {
      fontSize: 16,
      marginBottom: 5,
      flexWrap: 'wrap',
    },
    infoLabel: {
      fontWeight: 'bold',
      color: '#222',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#2e5c68',
      marginTop: 20,
      marginBottom: 10,
      textTransform: 'uppercase',
    },
    clubBox: {
      backgroundColor: '#f5f5f5',
      borderRadius: 8,
      padding: 10,
      marginBottom: 10,
    },
    clubItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 15,
      padding: 10,
      borderRadius: 8,
      backgroundColor: '#f5f5f5',
      marginBottom: 8,
    },
    clubIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      borderWidth: 2,
      borderColor: '#3D8FA4',
    },
    clubDetails: {
      flex: 1,
    },
    clubName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#3D8FA4',
    },
    clubTeam: {
      fontSize: 14,
      color: '#666',
    },
    emptyText: {
      textAlign: 'center',
      color: '#666',
      padding: 10,
    },
    closeButton: {
      marginTop: 15,
      padding: 12,
      backgroundColor: '#ddd',
      borderRadius: 6,
      alignItems: 'center',
    },
    closeButtonText: {
      color: '#333',
      fontSize: 16,
      fontWeight: '500',
    },
  });
  export default styles;