import { StyleSheet } from 'react-native';
const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 10,
      backgroundColor: '#f5f5f5',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },
    backButton: {
      marginRight: 10,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#143E42',
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    card: {
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 15,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    label: {
      fontWeight: 'bold',
      width: 120,
      fontSize: 14,
      color: '#555',
    },
    value: {
      flex: 1,
      fontSize: 14,
    },
    playerInfo: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    image: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 10,
    },
    playerName: {
      fontSize: 14,
      fontWeight: '500',
    },
    clubName: {
      fontSize: 14,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusText: {
      marginLeft: 5,
      fontSize: 14,
    },
    statusContainer: {
      flex: 1,
    },
    actionButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: '#eee',
    },
    actionButtonText: {
      color: '#3D8FA4',
      fontWeight: 'bold',
      fontSize: 14,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    emptyText: {
      fontSize: 16,
      color: '#777',
      textAlign: 'center',
    },
  });
  export default styles;