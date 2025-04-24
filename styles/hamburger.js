import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'space-between',
    },
    navbar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      backgroundColor: '#333',
      marginTop:20,
      backgroundColor: 'transparent',
    },
    logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logo: {
      height: 50,
      width: 50,
      marginRight: 10,
    },
    brand: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#143E42',
    },
    hamburger: {
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: 24,
    },
    bar: {
      width: 25,
      height: 3,
      backgroundColor: '#143E42',
      marginVertical: 2,
    },
    menu: {
      backgroundColor: 'transparent',
      paddingVertical: 10,
      paddingHorizontal: 20,
    },
    link: {
      fontSize: 18,
      color: '#143E42',
      paddingVertical: 10,
    },
    searchContainer: {
      marginTop: 10,
    },
    searchInput: {
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 8,
      borderRadius: 5,
      color: '#fff',
      backgroundColor: 'transparent',
    },
    content: {
      flex: 1, 
      justifyContent: 'center',
      alignItems: 'center',
    },
    
  });
  export default styles;