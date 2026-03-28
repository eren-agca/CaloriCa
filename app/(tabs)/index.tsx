import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, FlatList, Keyboard, KeyboardAvoidingView, Modal, PanResponder, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

const screenHeight =  Dimensions.get('window').height;

type Yemek = {
  id: string;
  isim: string;
  kaloriPer100g: number;
  proteinPer100g: number;
  karbPer100g: number;
  yagPer100g: number;
  emoji: string;
};
type YenilenYemek = {
  id: string;
  isim: string;
  kalori: number;
  adet: number;
  gramaj: number;
  protein: number;
  karbonhidrat: number;
  yag: number;
};

const Yemekler = [
  {id: '1', isim: 'Pilav', kaloriPer100g: 130, proteinPer100g: 2.7, karbPer100g: 28, yagPer100g: 0.3, emoji: '🍚'},
  {id: '2', isim: 'Tavuk Göğsü', kaloriPer100g: 165, proteinPer100g: 31, karbPer100g: 0, yagPer100g: 3.6, emoji: '🍗'},
  {id: '3', isim: 'Salata', kaloriPer100g: 15, proteinPer100g: 1.2, karbPer100g: 2.9, yagPer100g: 0.2, emoji: '🥗'},
  {id: '4', isim: 'Ekmek', kaloriPer100g: 265, proteinPer100g: 9, karbPer100g: 49, yagPer100g: 3.3, emoji: '🍞'},
  {id: '5', isim: 'Yumurta', kaloriPer100g: 155, proteinPer100g: 13, karbPer100g: 1.1, yagPer100g: 11, emoji: '🥚'},
  {id: '6', isim: 'Muz', kaloriPer100g: 89, proteinPer100g: 1.1, karbPer100g: 23, yagPer100g: 0.3, emoji: '🍌'},
  {id: '7', isim: 'Elma', kaloriPer100g: 52, proteinPer100g: 0.3, karbPer100g: 14, yagPer100g: 0.2, emoji: '🍎'},
  {id: '8', isim: 'Peynir', kaloriPer100g: 350, proteinPer100g: 28, karbPer100g: 1.3, yagPer100g: 28, emoji: '🧀'},
  {id: '9', isim: 'Makarna', kaloriPer100g: 131, proteinPer100g: 5, karbPer100g: 25, yagPer100g: 1.1, emoji: '🍝'},
];


export default function HomeScreen(){
  
  // UseState vs.
  const router = useRouter();
  const [suBardak, setSuBardak] = useState(0);
  const suHedef = 8;
  const [kaloriler,setKaloriler] = useState(0);
  const [toplamProtein,setToplamProtein] = useState(0);
  const [toplamKarb, setToplamKarb] = useState(0);
  const [toplamYag, setToplamYag] = useState(0);
  const [ypilenYemekler, setypilenYemekler] = useState<YenilenYemek[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [seciliYemek, setSeciliYemek]= useState<Yemek | null>(null);
  const [gramajInput, setGramajInput] = useState('');
  const [analizYukleniyor , setAnalizYukleniyor] = useState(false);
  const [analizSonucu , setAnalizSonucu] = useState<string | null>(null);
  const [analizModalVisible, setAnalizModalVisible] = useState(false);
  const scrollPosition = useRef(new Animated.Value(0)).current;


  // Fonksiyonlar

  const panResponder = useRef(
  PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        scrollPosition.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 150) {
        Animated.timing(scrollPosition, {
            toValue: screenHeight,
            duration: 300,
            useNativeDriver: false,
           }).start(() => {
          setAnalizModalVisible(false);
      });
      } else {
        Animated.spring(scrollPosition, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    },
  })
).current;

  const verileriKaydet = async (
    ypilenYemeklerData: YenilenYemek[],
    kalorilerData: number,
    proteinData: number,
    karbonhidratData: number,
    yagData: number
  ) => {
  try{
    await AsyncStorage.setItem('ypilenYemekler', JSON.stringify(ypilenYemeklerData));
    await AsyncStorage.setItem('kaloriler',kalorilerData.toString());
    await AsyncStorage.setItem('toplamProtein', proteinData.toString());
    await AsyncStorage.setItem('toplamKarb', karbonhidratData.toString());
    await AsyncStorage.setItem('toplamYag', yagData.toString());
    await AsyncStorage.setItem('suBardak', suBardak.toString());
    await AsyncStorage.setItem('sonKayitTarihi',new Date().toDateString());
    const bugun = new Date().toISOString().split('T')[0];
    const haftalikData = await AsyncStorage.getItem('haftalikIstatistik');
    let haftalik = haftalikData ? JSON.parse(haftalikData) : {};
    haftalik[bugun] = {
      kalori : kalorilerData,
      su : suBardak,
      protein: proteinData,
      karbonhidrat: karbonhidratData,
      yag: yagData,
    };
    await AsyncStorage.setItem('haftalikIstatistik', JSON.stringify(haftalik));
  }catch (error) {
    console.log('Kaydetme Hatasi: ', error);
  }
  };

  const verileriYukle = async () => {
    try {
      const suData = await AsyncStorage.getItem('suBardak');
      const sonTarih = await AsyncStorage.getItem('sonKayitTarihi');
      const bugun = new Date().toDateString();

      //Eger yeni gun ise sifirla
      if (sonTarih !== bugun) {
        await AsyncStorage.removeItem('ypilenYemekler');
        await AsyncStorage.removeItem('kaloriler');
        return;
      }

      const ypilenData = await AsyncStorage.getItem('ypilenYemekler');
      const kalorilerData = await AsyncStorage.getItem('kaloriler');
      const proteinData = await AsyncStorage.getItem('toplamProtein');
      const karbData = await AsyncStorage.getItem('toplamKarb');
      const yagData = await AsyncStorage.getItem('toplamYag');
      
      if(ypilenData) {
        setypilenYemekler(JSON.parse(ypilenData));
      }
      if(kalorilerData) {
        setKaloriler(parseInt(kalorilerData));
      }
      if (suData){
        setSuBardak(parseInt(suData));
      }
      if (proteinData){
        setToplamProtein(parseInt(proteinData));
      }
      if (karbData){
        setToplamKarb(parseInt(karbData));
      }
      if (yagData){
        setToplamYag(parseInt(yagData));
      }
    } catch (error) {
      console.log('Yukleme Hatasi: ', error);
    }
  };

  const yemekSec = (yemek: Yemek) => {
    setSeciliYemek(yemek);
    setGramajInput('100');
    setModalVisible(true);
  }
    
  const yemekOnayla = () => {
    if (!seciliYemek || !gramajInput) return;

    const gramaj = parseInt(gramajInput) || 0;
    if (gramaj <= 0) return;
  
    const hesaplananKalori = Math.round((gramaj / 100) * seciliYemek.kaloriPer100g);
    const hesaplananProtein = Math.round((gramaj / 100) * seciliYemek.proteinPer100g);
    const hesaplananKarb = Math.round((gramaj / 100) * seciliYemek.karbPer100g);
    const hesaplananYag = Math.round((gramaj / 100) * seciliYemek.yagPer100g);

    setKaloriler(kaloriler + hesaplananKalori);
    setToplamProtein(toplamProtein + hesaplananProtein);
    setToplamKarb(toplamKarb + hesaplananKarb);
    setToplamYag(toplamYag + hesaplananYag);

    const mevcutIndex = ypilenYemekler.findIndex(y => y.id === seciliYemek.id && y.gramaj === gramaj);
    
    if (mevcutIndex >= 0){
      const yeniListe = [...ypilenYemekler];
      yeniListe[mevcutIndex].adet +=1;
      yeniListe[mevcutIndex].kalori += hesaplananKalori;
      setypilenYemekler(yeniListe);
    } else {
      setypilenYemekler([...ypilenYemekler, {
        id: seciliYemek.id,
        isim: seciliYemek.isim,
        kalori: hesaplananKalori,
        adet: 1,
        gramaj : gramaj,
        protein: hesaplananProtein,
        karbonhidrat: hesaplananKarb,
        yag: hesaplananYag,
    }]);
    }

    setModalVisible(false);
    setSeciliYemek(null);
    setGramajInput('');
  };

  const profilData = async () => {
      try {
        const data = await AsyncStorage.getItem('profil');
        if (data) {
          const profil = JSON.parse(data);
          return profil;
        } 
        return null;
      }catch (error) {
          console.log('Profil verisi cekilemedi.');
          return null;
        }
    };

  const yemekSil = (yemek: YenilenYemek) => {
    const birPorsiyonKalori = Math.round(yemek.kalori / yemek.adet);
    const yeniKaloriler = kaloriler - birPorsiyonKalori;
    setKaloriler(yeniKaloriler);

    let yeniListe: YenilenYemek[];
    if (yemek.adet > 1){
      yeniListe = ypilenYemekler.map(y =>
        y.id === yemek.id && y.gramaj === yemek.gramaj
        ? {...y, adet: y.adet - 1, kalori: y.kalori - birPorsiyonKalori} : y 
      );
    } else {
      yeniListe = ypilenYemekler.filter(y => !(y.id === yemek.id && y.gramaj === yemek.gramaj));
    }
    setypilenYemekler(yeniListe);
    verileriKaydet(yeniListe, yeniKaloriler,toplamProtein,toplamKarb,toplamYag);
  };

  const sifirla = async () => {
    setKaloriler(0);
    setypilenYemekler([]);
    setSuBardak(0);
    try{
      await AsyncStorage.removeItem('suBardak');
      await AsyncStorage.removeItem('ypilenYemekler');
      await AsyncStorage.removeItem('kaloriler');
    } catch (error) {
      console.log('Sifirlama Hatasi: ', error);
    }
  };

  const gunuAnaliz = async () => {
    const profil = await profilData();
    if(ypilenYemekler.length === 0) {
      return Alert.alert('Analiz edilecek yiyecek yok.');
    }
    setAnalizYukleniyor(true);
    scrollPosition.setValue(screenHeight);
    setAnalizModalVisible(true);
    setAnalizSonucu(null);

    

    const yemekListesi = ypilenYemekler.map(y => 
      `- ${y.isim}: ${y.gramaj}g x${y.adet} (${y.kalori} kcal)`
      ).join('\n');

    try {
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

      const prompt = `Sen bir profesyonel beslenme uzmanısın. Türk mutfağı dahil tüm dünya mutfaklarını ve sağlıklı beslenme prensiplerini çok iyi biliyorsun.
Aşağıda bir kullanıcının bugün yediği yemekler ve kişisel bilgileri verilmiştir.

Kurallar:
Kullanıcının gününü beslenme açısından özetle, eksik veya fazla yönlerini belirt.
Sağlıklı ve uygulanabilir öneriler ver.
Yorumlarını Türkçe, kısa ve anlaşılır şekilde yaz.
Sadece düz metin olarak cevap ver, JSON, tablo veya madde işareti kullanma.
Gereksiz tekrar yapma, samimi ve motive edici ol.
Verdigin cevabi düz metin olarak ver. Asla JSON dosyası verme.

Kullanıcı Bilgileri:
Ad: ${profil?.isim || "Belirtilmedi"}
Yaş: ${profil?.yas || "Belirtilmedi"}
Cinsiyet: ${profil?.cinsiyet || "Belirtilmedi"}
Boy: ${profil?.boy || "---"} cm
Kilo: ${profil?.kilo || "---"} kg
Hedef Kalori: ${profil?.hedefKalori || "Belirtilmedi"}

Bugün Yediklerim:
${yemekListesi || "Henüz veri girişi yapılmadı."}

Lütfen bu bilgilere dayanarak analizini yap.`;

      const yanit = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method:'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }],
              }],
            }),
          }
      );

      const data = await yanit.json();
      
      if (data.error) {
        Alert.alert('Hata', 'Analiz servisinde bir sorun oluştu.');
        setAnalizModalVisible(false);
        return;
      }

      const sonucMetni = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (sonucMetni) {
        setAnalizSonucu(sonucMetni);
      }
    } catch (error) {
      console.log('Analiz Hatasi:', error);
      Alert.alert('Hata', 'Analiz yapılırken bir sorun oluştu.');
      setAnalizModalVisible(false);
    } finally {
      setAnalizYukleniyor(false);
    }
  };

    

  const suEkle = () => {
    if (suBardak < suHedef) {
      setSuBardak(suBardak + 1);
    }
  };

  const suCikar = () => {
    if (suBardak > 0){
      setSuBardak(suBardak - 1);
    }
  };

  const hedefYukle = async () => {
    try {
      const data = await AsyncStorage.getItem('profil');
      if (data) {
        const profil = JSON.parse(data);
        if(profil.hedefKalori) {
          setHedef(parseInt(profil.hedefKalori));
        }
      }
    } catch (error) {
      console.log('Hedef Yukleme Hatasi: ', error);
    }
  };

  const [hedef,setHedef] = useState(2000);
  const yuzde = Math.round(Math.min((kaloriler / hedef) * 100,100));
 
 // veriler degistiginde kaydetme
 useEffect(() =>{
  if(ypilenYemekler.length > 0 || kaloriler > 0 || suBardak > 0){
    verileriKaydet(ypilenYemekler,kaloriler,toplamProtein,toplamKarb,toplamYag);
  }
 },[ypilenYemekler,kaloriler,suBardak,toplamProtein,toplamKarb,toplamYag]);



 useFocusEffect(
  useCallback(() => {
    hedefYukle();
    verileriYukle();
  }, []));

 

  return(
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerSpacer}/>
        <Text style={styles.appName}>CaloriCa</Text>
        <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/profile')}>
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>
    

     <ScrollView style={styles.scrollViewContent} contentContainerStyle={styles.scrollViewContainer}>
       <View style={styles.summaryBox}>
      <Text style={styles.summaryTitle}>Bugunku Toplam</Text>
      <Text style={styles.calories}>{kaloriler} kcal</Text>
      <Text style={styles.yemekSayisi}>{ypilenYemekler.length} yemek eklendi</Text>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, {width: `${yuzde}%`}]} />
      </View>
            <Text style={styles.progressText}>Hedefe : %{yuzde}</Text>
            <View style={styles.besinContainer}>
              <View style={styles.besinGridi}>
                <View style={styles.besinKarti}>
                  <Text style={styles.besinDeger}>{toplamProtein} g</Text>
                  <Text style={styles.besinLabel}>Protein</Text>
                </View>
                 <View style={styles.besinKarti}>
                  <Text style={styles.besinDeger}>{toplamKarb} g</Text>
                  <Text style={styles.besinLabel}>Karb</Text>
                </View>
                 <View style={styles.besinKarti}>
                  <Text style={styles.besinDeger}>{toplamYag} g</Text>
                  <Text style={styles.besinLabel}>Yag</Text>
                </View>
              </View>
            </View>
      </View>
      
      <View style={styles.suContainer}>
        <View style={styles.suHeader}>
          <Text style={styles.suTitle}>💧 Su Takibi</Text>
          <Text style={styles.suSayac}>{suBardak} / {suHedef} Bardak</Text>
        </View>
        <View style={styles.suContent}>
          <TouchableOpacity style={styles.suButton} onPress={suCikar}>
            <Text style={styles.suButtonText}>-</Text>
          </TouchableOpacity>
          <View style={styles.suBardaklar}>
            {Array.from({length: suHedef},(_,i)=> (
              <Text key={i} style={styles.suDamla}>
                {i < suBardak ? '🔵': '⚪'}
              </Text>
            ))}
          </View>
          <TouchableOpacity style={styles.suButton} onPress={suEkle}>
            <Text style={styles.suButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.ypilenContainer}>
        <View style={styles.ypilenHeader}>
          <Text style={styles.ypilenTitle}>📋 Bugün Yediklerin:</Text>
          <TouchableOpacity style={styles.sifirlaKucuk} onPress={sifirla}>
            <Text style={styles.sifirlaKucukText}>✕</Text>
          </TouchableOpacity>
        </View>
        {ypilenYemekler.length > 0 ? (
          <ScrollView 
            horizontal={true} 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipScrollContent}
          >
            {ypilenYemekler.map((yemek, index) => (
              <View key={index} style={styles.chip}>
                <Text style={styles.chipText}>{yemek.isim} ({yemek.gramaj} g)</Text>
                <Text style={styles.chipAdet}>x{yemek.adet}</Text>
                <TouchableOpacity onPress={() => yemekSil(yemek)} style={styles.chipSil}>
                  <Text style={styles.chipSilText}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.bosListeText}>Henüz yemek eklenmedi 🍽️</Text>
        )}
      </View>


    

    <View style={styles.menuContainer}>
      <Text style={styles.listTitle}>🍽️ Yemek Seç:</Text>

    <FlatList
      data={Yemekler}
      keyExtractor={(item) => item.id}
      numColumns={3}
      scrollEnabled={false}
      nestedScrollEnabled={true}
      style={styles.list}
      contentContainerStyle={styles.listContent}
      renderItem={({item}) => (
       <TouchableOpacity style={styles.yemekKart} onPress={() => yemekSec(item)}>
        <Text style={styles.yemekEmoji}>{item.emoji}</Text>
        <Text style={styles.yemekKartIsim}>{item.isim} </Text>
       </TouchableOpacity>
      )}
    />
</View>
    <TouchableOpacity style={styles.analizButton} onPress={gunuAnaliz}>
      <Text style={styles.analizButtonText}>🤖 Günümü Analiz Et</Text>
    </TouchableOpacity>
    </ScrollView>


  <Modal
    visible={modalVisible}
    transparent={true}
    animationType="fade"
    onRequestClose={() => setModalVisible(false)}
  >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.modalOverlay}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.modalContent}>
        {seciliYemek && (
          <>
            <Text style={styles.modalEmoji}>{seciliYemek.emoji}</Text>
            <Text style={styles.modalTitle}>{seciliYemek.isim}</Text>
          
            <Text style={styles.modalLabel}>Gramaj girin:</Text>
            <TextInput
              style={styles.gramajInput}
              value={gramajInput}
              onChangeText={setGramajInput}
              keyboardType="numeric"
              placeholder="100"
              placeholderTextColor="#95a5a6"
            />
          
          <View style={styles.hizliGramajlar}>
            <TouchableOpacity style={styles.gramajChip} onPress={() => setGramajInput('50')}>
              <Text style={styles.gramajChipText}>50g</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gramajChip} onPress={() => setGramajInput('100')}>
              <Text style={styles.gramajChipText}>100g</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gramajChip} onPress={() => setGramajInput('150')}>
              <Text style={styles.gramajChipText}>150g</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gramajChip} onPress={() => setGramajInput('200')}>
              <Text style={styles.gramajChipText}>200g</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.iptalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.iptalButtonText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ekleButton} onPress={yemekOnayla}>
              <Text style={styles.ekleButtonText}>Ekle</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
      </KeyboardAvoidingView>
  </View>
    </TouchableWithoutFeedback>
</Modal>

    {/* Analiz Sonucu Modalı */}
    <Modal
      visible={analizModalVisible}
      transparent={true}
      animationType="none"
      onRequestClose={() => setAnalizModalVisible(false)}
      onShow={() => {
      Animated.timing(scrollPosition, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
        }).start();
      }}
    >
      <View style={styles.bottomSheetOverlay}>
       <TouchableWithoutFeedback onPress={() => setAnalizModalVisible(false)}>
        <View style={styles.bottomSheetBackground}/>
       </TouchableWithoutFeedback>

       <Animated.View
        style={[
          styles.bottomSheetContent,
            {transform: [{translateY: scrollPosition}] }
          ]}
        >
           <View {...panResponder.panHandlers}>
              <View style={styles.dragHandle}/>
           </View>

          <Text style={styles.modalTitle}>Gunluk Analiz</Text>
          <ScrollView style={{maxHeight: screenHeight * 0.5}}>
            {analizYukleniyor ? (
              <ActivityIndicator size='large' color='#28ae60' style={{marginVertical: 30}} />
            ) : (
              <Text style={styles.analizText}>{analizSonucu}</Text>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>

    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    paddingTop: 60,
  },
  scrollViewContent: {
    flex: 1,
    marginTop: 15,
  },
  scrollViewContainer: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerSpacer: {
    width: 40,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius : 20,
    backgroundColor: '#ffffff',
    alignItems:'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0,height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileIcon: {
    fontSize: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight:'bold',
    color: '#7f8c8d',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 40,
  },
  summaryBox: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 15,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    color: '#2c3e50',
    marginBottom: 10,
  },
  calories: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  buttonContainer: {
    marginTop: 30,
    width: '85%',
  },
  button: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom:10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonSecondary: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius:10,
    alignItems: 'center',
    borderWidth:2,
    borderColor:'#e74c3c',
  },
  buttonSecondaryText: {
    color: '#e74c3c',
    fontSize:18,
    fontWeight:'bold',
  },
  yemekSayisi:{
    fontSize:14,
    color:'#ffcccc',
    marginTop:5,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    paddingHorizontal : 28,
    marginBottom: 10,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom:20,
  },
  yemekKart: {
    flex: 1,
    backgroundColor: '#ffffff',
    margin:5,
    padding:15,
    borderRadius:15,
    alignItems:'center',
    justifyContent: 'center',
    minHeight: 110,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  yemekEmoji: {
    fontSize:32,
    marginBottom: 8,
  },
  yemekKartIsim:{
    fontSize: 12,
    fontWeight:'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  yemekKartKalori:{
    fontSize: 11,
    color: '#e74c3c',
    marginTop: 4,
    fontWeight: '600',
  },
  analizButton: {
    backgroundColor: '#27ae60',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  analizButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sifirlaKucuk: {
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sifirlaKucukText: {
    color: '#7f8c8d',
    fontSize: 14,
    fontWeight: 'bold',
  },
  ypilenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressContainer: {
    width: '100%',
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 10,
  },
  progressText: {
    marginTop: 5,
    fontSize: 14,
    color: '#7f8c8d',
  },
  ypilenContainer: {
  width: '85%',
  marginTop: 20,
},
ypilenTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#2c3e50',
},
ypilenItem: {
  backgroundColor: '#e8f5e9',
  padding: 12,
  borderRadius: 8,
  marginBottom: 5,
  flexDirection: 'row',
  justifyContent: 'space-between',
},
ypilenIsim: {
  fontSize: 14,
  color: '#2c3e50',
},
ypilenKalori: {
  fontSize: 14,
  fontWeight: 'bold',
  color: '#4CAF50',
},
bosListeText: {
  fontSize: 14,
  color: '#95a5a6',
  textAlign: 'center',
  fontStyle: 'italic',
  paddingVertical: 20,
},
menuContainer: {
  width : '100%',
  marginTop: 10,
  paddingHorizontal: 5,
  minHeight: 400,
},
chipScrollContent: {
  flexDirection: 'row',
  alignItems: 'center',
},
chip: {
  backgroundColor: '#e74c3c',
  paddingHorizontal : 12,
  paddingVertical : 8,
  borderRadius: 20,
  marginRight : 8,
  flexDirection : 'row',
  alignItems: 'center',
},
chipText : {
  color: '#ffcccc',
  fontSize: 12,
  marginLeft: 5,
  fontWeight: 'bold',
},
chipAdet: {
  color: '#ffcccc',
  fontSize: 12,
  marginLeft: 5,
  fontWeight : 'bold',
},
chipSil: {
  marginLeft: 8,
  backgroundColor: 'rgba(255,255,255,0.3)',
  borderRadius: 10,
  width: 20,
  height: 20,
  alignItems: 'center',
  justifyContent: 'center',
},
chipSilText: {
  color: '#ffffff',
  fontSize: 12,
  fontWeight: 'bold',
},
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContent: {
  backgroundColor: '#ffffff',
  borderRadius: 20,
  padding: 25,
  width: '85%',
  alignItems: 'center',
},
modalEmoji: {
  fontSize: 60,
  marginBottom: 10,
},
modalTitle: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#2c3e50',
  marginBottom: 20,
},
modalLabel: {
  fontSize: 16,
  color: '#7f8c8d',
  marginBottom: 10,
},
gramajInput: {
  width: '100%',
  height: 50,
  borderWidth: 2,
  borderColor: '#e74c3c',
  borderRadius: 10,
  paddingHorizontal: 15,
  fontSize: 20,
  textAlign: 'center',
  color: '#2c3e50',
},
hizliGramajlar: {
  flexDirection: 'row',
  marginTop: 15,
  marginBottom: 20,
},
gramajChip: {
  backgroundColor: '#ecf0f1',
  paddingHorizontal: 15,
  paddingVertical: 8,
  borderRadius: 20,
  marginHorizontal: 5,
},
gramajChipText: {
  color: '#2c3e50',
  fontWeight: '600',
},
modalButtons: {
  flexDirection: 'row',
  width: '100%',
},
iptalButton: {
  flex: 1,
  backgroundColor: '#ecf0f1',
  padding: 15,
  borderRadius: 10,
  marginRight: 10,
  alignItems: 'center',
},
iptalButtonText: {
  color: '#7f8c8d',
  fontSize: 16,
  fontWeight: 'bold',
},
ekleButton: {
  flex: 1,
  backgroundColor: '#e74c3c',
  width: 30,
  height:30,
  padding: 5,
  borderRadius: 5,
  alignItems: 'center',
},
ekleButtonText: {
  color: '#efefef',
  fontSize: 16,
  fontWeight: 'bold',
},
suContainer: {
  backgroundColor: '#ffffff',
  width: 330,
  marginHorizontal: 30,
  marginTop: 10,
  padding:12,
  borderRadius: 15,
  shadowColor: '#000',
  shadowOffset: {width : 0 , height: 1},
  shadowOpacity: 0.1,
  shadowRadius: 3,
},
suHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
},
suTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#2c3e50',
},
suSayac: {
  fontSize: 14,
  color: '#3498db',
  fontWeight: '600',
},
suContent: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},
suButton: {
  backgroundColor: '#3498db',
  width: 32,
  height: 32,
  borderRadius: 16,
  alignItems: 'center',
  justifyContent: 'center',
},
suButtonText: {
  color : '#ffffff',
  fontSize: 20,
  fontWeight: 'bold',
},
suBardaklar: {
  flexDirection: 'row',
  flex: 1,
  justifyContent: 'center',
},
suDamla: {
  fontSize : 18,
  marginHorizontal: 2,
},
analizText: {
  fontSize: 16,
  color: '#2c3e50',
  lineHeight: 24,
},
bottomSheetOverlay: {
  flex: 1,
  justifyContent: 'flex-end',
  backgroundColor: 'rgba(0,0,0,0.5)',
},
bottomSheetBackground: {
  flex: 1,
  
},
dragHandle: {
  width: 40,
  height: 5,
  backgroundColor:'#ccc',
  borderRadius: 3,
  alignSelf: 'center',
  marginBottom: 15,
},
bottomSheetContent: {
  backgroundColor: '#ffffff',
  borderTopLeftRadius: 25,
  borderTopRightRadius: 25,
  padding: 20,
  paddingTop: 10,
  maxHeight: screenHeight * 0.7,
},
besinContainer: {
  backgroundColor: '#ffffff',
  padding: 20,
  borderRadius: 15,
  width: '100%',
  marginTop: 20,
  shadowColor: '#000',
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.1,
  shadowRadius: 4,
},
besinBaslik: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#2c3e50',
  marginBottom: 15,
  textAlign: 'center',
},
besinGridi: {
  flexDirection: 'row',
  justifyContent: 'space-around',
},
besinKarti: {
  alignItems: 'center',
  flex: 1,
},
besinDeger: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#e74c3c',
},
besinLabel: {
  fontSize: 14,
  color: '#7f8c8d',
  marginTop: 5,
},
});
