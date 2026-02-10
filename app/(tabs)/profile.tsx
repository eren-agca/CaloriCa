import { View, Text, StyleSheet , TouchableOpacity, TextInput , ScrollView , Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const router = useRouter();

  const [isim,setIsim] = useState('');
  const [yas,setYas] = useState('');
  const [boy,setBoy] = useState('');
  const [kilo,setKilo] = useState('');
  const [cinsiyet,setCinsiyet] = useState('E');
  const [hedefKalori,setHedefKalori] = useState('2000');
  const [bmi,setBmi] = useState(0);
  const [duzenlemeMode, setDuzenlemeMode] = useState(false);


  const bmiHesapla = () => {
    const boyMetre = parseInt(boy) / 100;
    const kiloNum = parseInt(kilo);

    if (boyMetre > 0 && kiloNum > 0) {
      const sonuc = kiloNum / (boyMetre * boyMetre);
      setBmi(Math.round(sonuc * 10) / 10);
    } 
  };

  const bmiDurum = () => {
    if (bmi ===0) return '';
    if (bmi < 18.5) return 'Zayif';
    if (bmi <25) return 'Normal';
    if (bmi <30) return 'Fazla Kilolu';
    return 'Obez';
  };

  const bmiRenk = () => {
      if (bmi ===0) return '#7f8c8d';
    if (bmi < 18.5) return '#3498db';
    if (bmi <25) return '#2ecc71';
    if (bmi <30) return '#f39c12';
    return '#e74c3c';
  };

  const profiliKaydet = async () => {
    try {
      const profilData = {isim,yas,boy,kilo,cinsiyet,hedefKalori,};
      await AsyncStorage.setItem('profil', JSON.stringify(profilData));
      setDuzenlemeMode(false);
      Alert.alert('Basarili', 'Profil kaydedildi! ✅ ');
    } catch (error) {
      console.log('Kaydetme hatasi', error);
    }
  };

  const profiliYukle = async () => {
    try {
      const data = await AsyncStorage.getItem('profil');
      if (data) {
        const profil = JSON.parse(data);
        setIsim(profil.isim || '');
        setYas(profil.yas || '');
        setBoy(profil.boy || '');
        setKilo(profil.kilo || '');
        setCinsiyet(profil.cinsiyet || 'E');
        setHedefKalori(profil.hedefKalori || '2000');
      }
    } catch (error) {
      console.log('Yukleme Hatasi: ', error);
    }
  };

  useEffect(() => {
    profiliYukle();
  }, []);

useEffect(() => {
    bmiHesapla();
  }, [boy,kilo]);
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {duzenlemeMode ? 'Profili Duzenle' : 'Profil'}
        </Text>
        {!duzenlemeMode ? (
          <TouchableOpacity style={styles.editButton} onPress={() => setDuzenlemeMode(true)}>
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer}/>
        )}
      </View>

      <View style={styles.avatarContainer}>
        <Text style={styles.avatar}>👤</Text>
        <Text style={styles.avatarName}>{isim || 'Kullanici'}</Text>
      </View>

      {duzenlemeMode ? (
        <View style={styles.formContainer}>
          
          <Text style={styles.formLabel}>Isim</Text>
          <TextInput style={styles.input} value={isim} onChangeText={setIsim}
          placeholder='Isminizi Giriniz' placeholderTextColor='#95a5a6'/>

          <Text style={styles.formLabel}>Yaş</Text>
          <TextInput style={styles.input} value={yas} onChangeText={setYas}
          placeholder='Yaşınızı Giriniz' placeholderTextColor='#95a5a6'/>

          <Text style={styles.formLabel}>Boy (cm) </Text>
          <TextInput style={styles.input} value={boy} onChangeText={setBoy}
          placeholder='Örneğin : 175' placeholderTextColor='#95a5a6'/>

          <Text style={styles.formLabel}>Kilo</Text>
          <TextInput style={styles.input} value={kilo} onChangeText={setKilo}
          placeholder='Örneğin : 70' placeholderTextColor='#95a5a6'/>

          <Text style={styles.formLabel}>👫 Cinsiyet</Text>
          <View style={styles.cinsiyetContainer}>
            <TouchableOpacity
              style={[styles.cinsiyetButton, cinsiyet === 'E' && styles.cinsiyetAktif]}
              onPress={() => setCinsiyet('E')}>
              <Text style={[styles.cinsiyetText, cinsiyet === 'E' && styles.cinsiyetAktifText]}>Erkek</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cinsiyetButton, cinsiyet === 'K' && styles.cinsiyetAktif]}
              onPress={() => setCinsiyet('K')}>
              <Text style={[styles.cinsiyetText, cinsiyet === 'K' && styles.cinsiyetAktifText]}>Kadın</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
       <View style={styles.bilgiContainer}>
          <View style={styles.bilgiSatir}>
            <Text style={styles.bilgiLabel}>📏 Boy</Text>
            <Text style={styles.bilgiDeger}>{boy ? `${boy} cm` : '—'}</Text>
          </View>
          <View style={styles.bilgiSatir}>
            <Text style={styles.bilgiLabel}>⚖️ Kilo</Text>
            <Text style={styles.bilgiDeger}>{kilo ? `${kilo} kg` : '—'}</Text>
          </View>
          <View style={styles.bilgiSatir}>
            <Text style={styles.bilgiLabel}>🎂 Yaş</Text>
            <Text style={styles.bilgiDeger}>{yas || '—'}</Text>
          </View>
          <View style={styles.bilgiSatir}>
            <Text style={styles.bilgiLabel}>👫 Cinsiyet</Text>
            <Text style={styles.bilgiDeger}>{cinsiyet === 'E' ? 'Erkek' : 'Kadın'}</Text>
          </View>
        </View>
      )}

      {bmi > 0 && (
        <View style={[styles.bmiBox, {borderColor: bmiRenk() }]}>
          <Text style={styles.bmiLabel}>Vücut Kitle İndeksi (BMI)</Text>
          <Text style={[styles.bmiValue, {color: bmiRenk() }]}>{bmi}</Text>
          <Text style={[styles.bmiDurum, {color: bmiRenk() }]}>{bmiDurum()}</Text>
        </View>
      )}

      <View style={styles.hedefContainer}>
        <Text style={styles.formLabel}>🎯 Günlük Kalori Hedefi</Text>
        <TextInput
          style={styles.hedefInput}
          value={hedefKalori}
          onChangeText={setHedefKalori}
          placeholder="Örn: 2000"
          placeholderTextColor="#95a5a6"
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity style={styles.kaydetButton} onPress={profiliKaydet}>
        <Text style={styles.kaydetText}>💾 Kaydet</Text>
      </TouchableOpacity>
    </ScrollView>

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
    position: 'fixed',
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
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    fontSize: 60,
    marginBottom: 8,
  },
  avatarName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  formContainer: {
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#2c3e50',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cinsiyetContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  cinsiyetButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
   cinsiyetAktif: {
    borderColor: '#e74c3c',
    backgroundColor: '#ffe8e6',
   },
   cinsiyetText: {
    fontSize: 16,
    color: '#7f8c8d',
   },
   cinsiyetAktifText: {
    color: '#e74c3c',
    fontWeight: 'bold',
   },
   bmiBox: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 25,
    marginTop: 20,
    alignItems: 'center',
    borderWidth: 2,
   },
   bmiLabel: {
    fontSize: 14,
    color: '#7f8c8d',
   },
   bmiValue: {
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 5,
   },
   bmiDurum: {
    fontSize: 18,
    fontWeight: '600',
   },
   kaydetButton: {
    backgroundColor: '#e74c3c',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 25,
   },
   kaydetText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
   },
     editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  editIcon: {
    fontSize: 18,
  },
  bilgiContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 25,
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bilgiSatir: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  bilgiLabel: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  bilgiDeger: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  hedefContainer: {
    paddingHorizontal: 25,
    marginTop: 10,
  },
  hedefInput: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    fontSize: 20,
    color: '#e74c3c',
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#e74c3c',
  },
});