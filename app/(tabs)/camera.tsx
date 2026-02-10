import {View, Text, StyleSheet} from 'react-native';


export default function CameraScreen(){
    return (
        <View style={styles.container}>
            <Text style={styles.emoji}>📸</Text>
            <Text style={styles.title}>Kamera</Text>
            <Text style={styles.subtitle}>Yemek fotografi cek,AI analiz etsin!</Text>
        </View>
    );
}

const styles= StyleSheet.create({
    container: {
        flex:1 ,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emoji: {
        fontSize: 80,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    subtitle: {
        fontSize: 16,
        color: '#7f8c8d',
        marginTop: 10,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
})
