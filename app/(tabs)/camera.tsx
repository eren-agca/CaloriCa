import { View, Text, StyleSheet, TouchableOpacity, Image , TextInput , KeyboardAvoidingView , Platform , TouchableWithoutFeedback, Keyboard , ScrollView} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';

export default function CameraScreen(){

    // Typelar
    type AnalizSonucu = {
        yemekAdi: string;
        porsiyon: number;
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

Bu fotoğraftaki yemeği dikkatli bir şekilde analiz et.

Kurallar:
- Yemeğin tam ve doğru adını Türkçe olarak yaz (örneğin: poğaça, lahmacun, mercimek çorbası)
- Benzer görünen yemekleri karıştırma (poğaça ≠ pişi, simit ≠ açma, börek ≠ gözleme)
- Fotoğraftaki yemeğin görünüşüne, şekline, rengine, dokusuna ve boyutuna dikkat et
- Porsiyon miktarını fotoğraftaki büyüklüğe göre tahmin et (gram cinsinden)
- Eğer yiyecek/içecek yarım kalmışsa, bir kısmı yenmiş/içilmişse veya eksikse, KALAN miktarı tahmin et (dolu halini değil). Örneğin bardağın yarısı içilmiş bir kahve için 200ml değil ~100ml yaz
- Besin değerlerini o porsiyon miktarına göre hesapla
- Eğer fotoğrafta yemek yoksa veya tanıyamıyorsan yemekAdi olarak "Tanımlanamadı" yaz

Sadece aşağıdaki JSON formatında yanıt ver, başka hiçbir şey yazma:
{"yemekAdi": "...", "porsiyon": 0, "kalori": 0, "protein": 0, "karbonhidrat": 0, "yag": 0}

- porsiyon: gram cinsinden tahmini porsiyon miktarı (örnek: 150)
- kalori: kcal cinsinden (örnek: 280)
- protein: gram cinsinden (örnek: 12)
- karbonhidrat: gram cinsinden (örnek: 35)
- yag: gram cinsinden (örnek: 10)`
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
                            text: `Sen bir beslenme uzmanısın. Kullanıcı bir yiyecek/içecek adı veriyor. Bu yiyeceğin ${porsiyon} gramlık porsiyon için besin değerlerini hesapla.

Yiyecek: ${duzeltmeText}

Sadece aşağıdaki JSON formatında yanıt ver, başka hiçbir şey yazma:
{"yemekAdi": "${duzeltmeText}", "porsiyon": ${porsiyon}, "kalori": 0, "protein": 0, "karbonhidrat": 0, "yag": 0}`
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
                    <Text style={styles.porsiyonText}>{analizSonucu.porsiyon}g porsiyon</Text>
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
})
