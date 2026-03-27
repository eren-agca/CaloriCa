import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Image, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export default function CameraScreen(){

    // Typelar
    type AnalizSonucu = {
        yemekAdi: string;
        porsiyon: number;
        birim: string;
        kalori: number;
        protein: number;
        karbonhidrat: number;
        yag: number;
    };
    


    // useState vs.
    const [duzeltmeMode, setDuzeltmeMode] = useState(false);
    const [duzeltmeText, setDuzeltmeText] = useState('');
    const [permission, requestPermission] = useCameraPermissions();
    const [fotograf,setFotograf] = useState<string | null>(null);
    const kameraRef = useRef<CameraView>(null);
    const [odakNoktasi , setOdakNoktasi] = useState<{x: number, y: number} | null>(null);
    const [analizSonucu, setAnalizSonucu]= useState<AnalizSonucu |null>(null);
    const [yukleniyor, setYukleniyor] = useState(false);
    const [base64Foto, setBase64Foto] = useState<string | null>(null);
    const router = useRouter();

    // Fonksiyonlar

    const fotografCek = async () => {
        if(kameraRef.current) {
            try {
                const sonuc = await kameraRef.current.takePictureAsync({
                    quality: 0.7,
                    base64: true,
                });
                if (sonuc) {
                    setFotograf(sonuc.uri);
                    setBase64Foto(sonuc.base64 ?? null); 
                }
            } catch (error) {
                console.log('Fotograf cekme hatasi:', error);
            }
        }
    }

    const yemekAnaliz = async () => {
        if (!base64Foto) return;

        setYukleniyor(true);
        setAnalizSonucu(null);

        try {
            const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
            
            const yanit = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                {
                                    text: `Sen bir profesyonel beslenme uzmanı ve gıda tanıma uzmanısın. Türk mutfağı dahil dünya mutfaklarını çok iyi biliyorsun.

Bu fotoğraftaki yemeği/içeceği dikkatli bir şekilde analiz et.

REFERANS BOYUTLARI (porsiyon tahmini için kullan):
- Standart çay bardağı: 150-200 ml
- Buyuk boy kupa : 300-500 ml
- Su bardağı: 200-250 ml
- Kahve fincanı: 50-80 ml
- Yemek tabağı: 22-26 cm çap (300-400g yemek sığar)
- Çorba kasesi: 250-300 ml
- 1 dilim ekmek: 30-40g
- 1 yumurta: 50-60g
- 1 poğaça/simit: 80-120g
- 1 porsiyon pilav: 150-200g
- Varsa tabak, bardak, kaşık, kişi eli gibi referans objelerle karşılaştır

Kurallar:
- Yemeğin tam ve doğru adını Türkçe olarak yaz (örneğin: poğaça, lahmacun, mercimek çorbası)
- Benzer görünen yemekleri karıştırma (poğaça ≠ pişi, simit ≠ açma, börek ≠ gözleme)
- Fotoğraftaki yemeğin görünüşüne, şekline, rengine, dokusuna ve boyutuna DİKKATLİ bak
- SIVILER için birim: "ml", KATILAR için birim: "g" kullan
  * Çorba, kahve, çay, su, süt, ayran, meyve suyu = SIVI (ml)
  * Ekmek, et, pilav, salata, meyve, pasta, tatlı = KATI (g)
- Porsiyon miktarını fotoğraftaki büyüklüğe göre GERÇEKÇİ tahmin et
- Eğer yiyecek/içecek yarım kalmışsa, KALAN miktarı tahmin et (dolu halini değil)
  * Örnek: Yarısı içilmiş bardak çay → 100ml (200ml değil)
- Besin değerlerini o porsiyon miktarına göre hesapla
- Eğer fotoğrafta yemek yoksa yemekAdi: "Tanımlanamadı" yaz

Sadece aşağıdaki JSON formatında yanıt ver, başka hiçbir şey yazma:
{"yemekAdi": "...", "porsiyon": 0, "birim": "g", "kalori": 0, "protein": 0, "karbonhidrat": 0, "yag": 0}

Örnekler:
- 1 bardak çay → {"yemekAdi": "Çay", "porsiyon": 200, "birim": "ml", "kalori": 2, ...}
- 1 tabak pilav → {"yemekAdi": "Pilav", "porsiyon": 180, "birim": "g", "kalori": 234, ...}
- Yarım bardak kahve → {"yemekAdi": "Kahve", "porsiyon": 100, "birim": "ml", "kalori": 5, ...}
- 2 dilim ekmek → {"yemekAdi": "Ekmek", "porsiyon": 70, "birim": "g", "kalori": 185, ...}`
                                },
                                {
                                    inlineData: {
                                        mimeType: 'image/jpeg',
                                        data : base64Foto
                                    }
                                }
                            ]
                        }]
                    })

                }
            );
            const data = await yanit.json();
            console.log('API yaniti:', JSON.stringify(data).substring(0, 500));
            
            if (data.error) {
                console.log('API hata:', data.error.message);
                return;
            }
            
            const jsonText = data.candidates[0].content.parts[0].text;
            const temiz = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const sonuc = JSON.parse(temiz);
            setAnalizSonucu(sonuc);
    
        } catch (error) {
            console.log('Analiz hatasi: ', error);
        } finally {
            setYukleniyor(false);
        }
    };

    const yemekDuzelt = async () => {
        if (!duzeltmeText.trim()) return;

        setYukleniyor(true);
        setDuzeltmeMode(false);

        try {
            const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
            const porsiyon = analizSonucu?.porsiyon || 100;

            const yanit = await fetch(  
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Sen bir beslenme uzmanısın. Kullanıcı bir yiyecek/içecek adı veriyor.

Yiyecek: ${duzeltmeText}
Porsiyon: ${porsiyon}

Bu yiyeceğin/içeceğin besin değerlerini hesapla.
ÖNEMLI: Eğer SIVI ise (çorba, kahve, çay, süt, ayran, meyve suyu vb) birim "ml" olsun.
Eğer KATI ise (ekmek, et, pilav, meyve, salata vb) birim "g" olsun.

Sadece aşağıdaki JSON formatında yanıt ver, başka hiçbir şey yazma:
{"yemekAdi": "${duzeltmeText}", "porsiyon": ${porsiyon}, "birim": "g veya ml", "kalori": 0, "protein": 0, "karbonhidrat": 0, "yag": 0}`
                        }]
                    }]
                })
            }
        );

        const data = await yanit.json();
        if(data.error) {
            console.log('Duzeltme Hatasi: ', data.error.message);
            return;
        }
        const jsonText = data.candidates [0].content.parts[0].text;
        const temiz = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const sonuc = JSON.parse(temiz);
        setAnalizSonucu(sonuc);
        } catch (error) {
            console.log('Duzeltme Hatasi: ', error);
        } finally {
            setYukleniyor(false);
        }
    };

    const yemekKaydet = async () => {
    if (!analizSonucu) return;

    try {
        // Mevcut verileri oku
        const ypilenData = await AsyncStorage.getItem('ypilenYemekler');
        const kalorilerData = await AsyncStorage.getItem('kaloriler');
        
        let ypilenYemekler = ypilenData ? JSON.parse(ypilenData) : [];
        let kaloriler = kalorilerData ? parseInt(kalorilerData) : 0;

        // Yeni yemeği ekle
        const yeniYemek = {
            id: Date.now().toString(),
            isim: analizSonucu.yemekAdi,
            kalori: analizSonucu.kalori,
            adet: 1,
            gramaj: analizSonucu.porsiyon,
            protein: analizSonucu.protein,
            karbonhidrat: analizSonucu.karbonhidrat,
            yag: analizSonucu.yag,
        };

        ypilenYemekler.push(yeniYemek);
        kaloriler += analizSonucu.kalori;

        // Kaydet
        await AsyncStorage.setItem('ypilenYemekler', JSON.stringify(ypilenYemekler));
        await AsyncStorage.setItem('kaloriler', kaloriler.toString());
        await AsyncStorage.setItem('sonKayitTarihi', new Date().toDateString());

        // Başarı mesajı
        Alert.alert('✅ Eklendi!', `${analizSonucu.yemekAdi} günlük listene eklendi.`);

        // Kamerayı sıfırla (yeni çekim için)
        setFotograf(null);
        setBase64Foto(null);
        setAnalizSonucu(null);
        setDuzeltmeMode(false);
        setDuzeltmeText('');

    } catch (error) {
        console.log('Kaydetme Hatasi:', error);
        Alert.alert('Hata', 'Kaydederken bir sorun oluştu.');
    }
};

    // Kamera izin durumlari
    if(!permission){
        return <View style={styles.container}><Text>Yukleniyor...</Text></View>;
    }

    if(!permission.granted){
        return(
            <View style={styles.container}>
                <Text>Kamera izni gerekli.</Text>
                <TouchableOpacity onPress={requestPermission}>
                    <Text>Izin Ver</Text>
                </TouchableOpacity>
            </View>
        );
    }
    if(fotograf) {
        return(
            <KeyboardAvoidingView 
                style={styles.onizlemeContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{flex: 1}}>
            <ScrollView style={{flex: 1}} contentContainerStyle={styles.onizlemeScroll}>
                <Image source={{uri: fotograf}} style={styles.onizleme}/>
               {yukleniyor && (
                <Text style={styles.yukleniyorText}>Analiz ediliyor...</Text>
               )}

               {analizSonucu && (
                <View style={styles.sonucKutusu}>
                    {duzeltmeMode ? (
                        <View style={styles.duzeltmeRow}>
                            <TextInput
                                style={styles.duzeltmeInput}
                                value={duzeltmeText}
                                onChangeText={setDuzeltmeText}
                                placeholder="Doğru yemek adını yaz..."
                                autoFocus={true}
                            />
                            <TouchableOpacity style={styles.duzeltmeOnay} onPress={yemekDuzelt}>
                                <Text style={styles.duzeltmeOnayText}>✓</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={() => {
                            setDuzeltmeMode(true);
                            setDuzeltmeText(analizSonucu.yemekAdi);
                        }}>
                            <Text style={styles.yemekAdi}>{analizSonucu.yemekAdi} ✏️</Text>
                        </TouchableOpacity>
                    )}
                    <Text style={styles.porsiyonText}>{analizSonucu.porsiyon}{analizSonucu.birim} porsiyon</Text>
                    <View style={styles.besinRow}>
                        <View style={styles.besinItem}>
                            <Text style={styles.besinDeger}>{analizSonucu.kalori}</Text>
                            <Text style={styles.besinLabel}>kcal</Text>
                        </View>
                        <View style={styles.besinItem}>
                            <Text style={styles.besinDeger}>{analizSonucu.protein}g</Text>
                            <Text style={styles.besinLabel}>Protein</Text>
                        </View>
                        <View style={styles.besinItem}>
                            <Text style={styles.besinDeger}>{analizSonucu.karbonhidrat}g</Text>
                            <Text style={styles.besinLabel}>Karb</Text>
                        </View>
                        <View style={styles.besinItem}>
                            <Text style={styles.besinDeger}>{analizSonucu.yag}g</Text>
                            <Text style={styles.besinLabel}>Yağ</Text>
                        </View>
                    </View>
                </View>
               )}

               <View style={styles.butonRow}>
                {!analizSonucu && !yukleniyor && (
                    <TouchableOpacity style={styles.analizButton} onPress={yemekAnaliz}>
                        <Text style={styles.analizButtonText}>Analiz Et</Text>
                    </TouchableOpacity>
                )} 
                {analizSonucu && (
                    <TouchableOpacity style={styles.kaydetButton} onPress={yemekKaydet}>
                        <Text style={styles.kaydetButtonText}>Kaydet ve Ekle 💾</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.tekrarButton} onPress={() => {
                    setFotograf(null);
                    setBase64Foto(null);
                    setAnalizSonucu(null);
                    setDuzeltmeMode(false);
                    setDuzeltmeText('');
                }}>
                    <Text style={styles.tekrarButtonText}>Tekrar Cek</Text>
                </TouchableOpacity>
               </View>
            </ScrollView>
            </View>
            </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        );
    }


    return (
        <View style={styles.container}>
            <CameraView 
            ref={kameraRef} 
            style={styles.kamera}  
            facing="back" 
            zoom={0.1}
            autofocus='on'
            onTouchEnd={(e) => {
                const { locationX, locationY} = e.nativeEvent;
                setOdakNoktasi({x: locationX, y: locationY});
                setTimeout(() => setOdakNoktasi(null),1000);
            }}
            />
            {odakNoktasi && (
                <View style={[styles.odakKaresi, { 
                    left: odakNoktasi.x - 25, 
                    top: odakNoktasi.y - 25 
                }]} />  
            )}
            <TouchableOpacity style={styles.fotografButton} onPress={fotografCek}>
                <Text style={styles.emoji}>📸</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles= StyleSheet.create({
    kamera:{
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
        
    },
    container: {
        flex:1 ,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
     onizlemeContainer: {
        flex:1 ,
        backgroundColor: '#312f2f',
    },
    emoji: {
        fontSize: 20,
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
    fotografButton: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        width: 50,
        height: 50,
        backgroundColor: '#fdfbff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
    },
    onizleme: {
        width: '90%',
        height: '70%',
        borderRadius: 15,
    },
    odakKaresi: {
        position: 'absolute',
        width: 50,
        height: 50,
        borderWidth: 2,
        borderColor: '#ffff00',
        borderRadius: 5,
    },
    yukleniyorText: {
        fontSize: 18,
        color: '#ffffff',
        marginTop: 15,
        fontWeight: '600',
    },
    sonucKutusu: {
        backgroundColor: '#ffffff',
        marginHorizontal: 20,
        marginTop: 15,
        borderRadius: 15,
        padding: 15,
        width: '90%',
    },yemekAdi: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 4,
    },
    porsiyonText: {
        fontSize: 13,
        color: '#7f8c8d',
        textAlign: 'center',
        marginBottom: 10,
    },
    besinRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    besinItem: {
        alignItems: 'center',
    },
    besinDeger: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#e74c3c',
    },
    besinLabel: {
        fontSize: 12,
        color: '#7f8c8d',
        marginTop: 2,
    },
    butonRow: {
        flexDirection: 'row',
        marginTop: 15,
        gap: 10,
    },
    analizButton: {
        backgroundColor: '#2ecc71',
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 25,
    },
    analizButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    tekrarButton: {
        backgroundColor: '#e74c3c',
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 25,
    },
    tekrarButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    duzeltmeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
},
duzeltmeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#3498db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#09090a',
},
duzeltmeOnay: {
    marginLeft: 10,
    backgroundColor: '#2ecc71',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
},
duzeltmeOnayText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
},
onizlemeScroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingBottom: 30,
},
kaydetButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
},
kaydetButtonText: {
    color: '#ffffff',
    fontSize:16,
    fontWeight: 'bold',
}
})
