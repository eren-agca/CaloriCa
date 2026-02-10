import { View, Text, StyleSheet , TouchableOpacity} from 'react-native';
import { useRouter } from 'expo-router';
import { HeaderTitle } from '@react-navigation/elements';

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerSpacer}/>
      </View>

      <View style={styles.content}>
        <Text style={styles.emoji}>👤</Text>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Hesap ayarlari ve hedefler</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
    width: '100%',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0 , height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backIcon: {
    fontSize: 24,
    color: '#2c3e50',
  },
  headerTitle:{
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerSpacer: {
    width: 40,
  },
  
});