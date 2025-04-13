import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clubContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clubImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  clubDescription: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  // Agrega esto a tus estilos (index_tabla.js)
loadingContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center'
},
header: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
  paddingHorizontal: 16
},
listContainer: {
  padding: 16
},
itemContainer: {
  backgroundColor: '#fff',
  borderRadius: 8,
  padding: 16,
  marginBottom: 12,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3
},
itemInfo: {
  flex: 1
},
itemTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  marginBottom: 4
},
itemAddress: {
  fontSize: 14,
  color: '#666'
},
itemActions: {
  flexDirection: 'row',
  gap: 16
},
emptyText: {
  textAlign: 'center',
  marginTop: 20,
  fontSize: 16,
  color: '#666'
},
filterContainer: {
  marginBottom: 16,
},
pickerContainer: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  marginBottom: 10,
  overflow: 'hidden',
},
picker: {
  width: '100%',
  height: 50,
},
playerInfoContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
},
smallImage: {
  width: 40,
  height: 40,
  borderRadius: 20,
  marginRight: 10,
},
playerName: {
  fontSize: 14,
  fontWeight: 'bold',
},
statusContainer: {
  marginVertical: 8,
},
actionButton: {
  padding: 8,
},
noResultsText: {
  textAlign: 'center',
  marginTop: 20,
  fontSize: 16,
  color: '#666',
},
playerInfoContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
},
smallImage: {
  width: 40,
  height: 40,
  borderRadius: 20,
  marginRight: 10,
},
playerName: {
  fontSize: 14,
  fontWeight: 'bold',
},
playerRole: {
  fontSize: 12,
  color: '#666',
},
clubName: {
  fontSize: 14,
},
statusContainer: {
  marginVertical: 8,
},
actionButton: {
  padding: 8,
},
noResultsText: {
  textAlign: 'center',
  marginTop: 20,
  fontSize: 16,
  color: '#666',
},
});

export default styles;