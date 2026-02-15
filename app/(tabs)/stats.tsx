import { View, Text, StyleSheet , ScrollView } from 'react-native';
import { useState , useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function StatsScreen () {

  const [haftalikVeri, setHaftalikVeri] = useState<{tarih: string; kalori: number; su: number}[]>([]);
  const [hedef, setHedef] = useState(2000);

  const verileriYukle = async () => {
    try {
      const profilData = await AsyncStorage.getItem('profil');
      if (profilData) {
        const profil = JSON.parse(profilData);
        if (profil.hedefKalori) {
          setHedef(parseInt(profil.hedefKalori));
        }
      }

      const data = await AsyncStorage.getItem('haftalikIstatistik');
      if(data){
        const haftalik = JSON.parse(data);
      

      const bugun = new Date();
      const son7Gun: {tarih: string; kalori: number; su: number}[] = [];

      for(let i=6; i >= 0; i--) {
        const tarih = new Date(bugun);
        tarih.setDate(bugun.getDate()-i);
        const tarihStr = tarih.toISOString().split('T')[0];

        son7Gun.push({
          tarih: tarihStr,
          kalori: haftalik[tarihStr]?.kalori || 0,
          su: haftalik[tarihStr]?.su || 0,
        });
      }
      setHaftalikVeri(son7Gun);
    }
    } catch (error) {
      console.log('Istatistik yukleme hatasi : ', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      verileriYukle();
    }, [])
  );

  const gunAdi = (tarih: string) => {
    const gun = new Date(tarih).getDay();
    const gunler = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    return gunler[gun];
  };

  const maxKalori = Math.max(...haftalikVeri.map(v => v.kalori),hedef);
  const ortalamaKalori = haftalikVeri.length > 0
  ? Math.round(haftalikVeri.reduce((t,v) => t + v.kalori,0) / haftalikVeri.length)
  : 0;
  const toplamKalori = haftalikVeri.reduce((t,v)=> t + v.kalori , 0);
  const enYuksek = Math.max(...haftalikVeri.map(v => v.kalori));
  const enDusuk = Math.min(...haftalikVeri.filter(v => v.kalori > 0).map(v=> v.kalori));
  const ortalamaSu = haftalikVeri.length > 0
    ? (haftalikVeri.reduce((t,v)=> t + v.su ,0)/ haftalikVeri.length).toFixed(1)
    : '0';

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.pageTitle}>Istatistikler</Text>
      <View style={styles.grafikContainer}>
        <Text style={styles.grafikBaslik}>Haftalik Kalori</Text>
        <View style={styles.grafik}>
          {haftalikVeri.map((gun,index) => {
            const yukseklik = maxKalori > 0 ? (gun.kalori / maxKalori) * 150 : 0;
            const hedefYuzde = hedef > 0 ? (gun.kalori / hedef) * 100 : 0;

            return (
              <View key={index} style={styles.grafikSutun}>
                <Text style={styles.grafikDeger}>
                  {gun.kalori > 0 ? gun.kalori : ''}
                </Text>
                <View style={styles.barContainer}>
                  <View 
                    style={[
                      styles.bar,
                      {
                        height:yukseklik,
                        backgroundColor: hedefYuzde > 100 ? '#e74c3c': hedefYuzde > 70 ? '#2ecc71' : '#3498db',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.grafikGun}>{gunAdi(gun.tarih)}</Text>
              </View>
            );
          })}
        </View>
        <View style={styles.hedefCizgi}>
          <Text style={styles.hedefText}>Hedef : {hedef} kcal</Text>
        </View>
      </View>

      <View style={styles.ozetContainer}>
        <Text style={styles.ozetBaslik}> Bu Hafta Ozeti</Text>
        <View style={styles.ozetSatir}>
          <Text style={styles.ozetLabel}>Ortalama</Text>
          <Text style={styles.ozetDeger}> {ortalamaKalori} kcal </Text>
        </View>
        <View style={styles.ozetSatir}>
          <Text style={styles.ozetLabel}>En Yüksek</Text>
          <Text style={[styles.ozetDeger, {color: '#e74c3c'}]}> {enYuksek} kcal </Text>
        </View>
        <View style={styles.ozetSatir}>
          <Text style={styles.ozetLabel}>En Düşük</Text>
          <Text style={[styles.ozetDeger, {color: '#3498db'}]}> {enDusuk === Infinity ? 0 : enDusuk} kcal </Text>
        </View>
        <View style={styles.ozetSatir}>
          <Text style={styles.ozetLabel}>Toplam</Text>
          <Text style={[styles.ozetDeger, {color: '#2ecc71'}]}> {toplamKalori} kcal </Text>
        </View>
      </View>

      <View style={styles.suOzet}>
        <Text style={styles.suOzetText}>💧 Su Ortalaması: {ortalamaSu} bardak/gün</Text>
      </View>
      </ScrollView>
    );
}

const styles= StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop : 70,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 20,
  },
  grafikContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0,height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  grafikBaslik: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  grafik: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 200,
    paddingTop: 20,
  },
  grafikSutun: {
    alignItems: 'center',
    flex: 1,
  },
  grafikDeger: {
    fontSize : 10,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  barContainer: {
    height:150,
    width: 25,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 25,
    borderRadius: 5,
    minHeight: 3,
  },
   grafikGun: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 8,
    fontWeight: '600',
  },
  hedefCizgi: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    alignItems: 'center',
  },
  hedefText: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '600',
  },
  ozetContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ozetBaslik: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  ozetSatir: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  ozetLabel: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  ozetDeger: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  suOzet: {
    backgroundColor: '#e3f2fd',
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 40,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  suOzetText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
  },
});