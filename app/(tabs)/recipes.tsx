import { View, Text, StyleSheet, ScrollView } from 'react-native';


export default function RecipesScreen(){


return(
    <View style={styles.container}>
        <Text style={styles.geciciText}>Yemek Tarifleri!</Text>
    </View>   
)


}; 

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    geciciText: {
        alignContent: 'center',
        fontWeight: 'bold',
        fontSize: 16,
    },
})

