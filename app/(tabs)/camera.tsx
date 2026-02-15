import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';

export default function CameraScreen(){

    // Typelar
    type AnalizSonucu = {
        yemekAdi: string;
        kalori: number;
        protein: number;
        karbonhidrat: number;
        yag: number;
    };


    // useState vs.

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
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                {
                                    text: 'Bu fotoğraftaki yemeği analiz et. Sadece şu formatta JSON döndür,başka hiçbir şey yazma: {"yemekAdi": "...", "kalori": 0, "protein": 0, "karbonhidrat": 0, "yag": 0}. Değerler yaklaşık ve porsiyon başına olsun. Gram cinsinden değil, sayısal değer olsun.'
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
            <View style={styles.onizlemeContainer}>
                <Image source={{uri: fotograf}} style={styles.onizleme}/>
               {yukleniyor && (
                <Text style={styles.yukleniyorText}>Analiz ediliyor...</Text>
               )}

               {analizSonucu && (
                <View style={styles.sonucKutusu}>
                    <Text style={styles.yemekAdi}>{analizSonucu.yemekAdi}</Text>
                    <View style={styles.besinRow}>
                        <View style={styles.besinItem}>
                            <Text style={styles.besinDeger}>{analizSonucu.kalori}</Text>
                            <Text style={styles.besinLabel}>KCAL </Text>
                        </View>
                        <View style={styles.besinItem}>
                            <Text style={styles.besinDeger}>{analizSonucu.protein}</Text>
                            <Text style={styles.besinLabel}>Protein g</Text>
                        </View>
                        <View style={styles.besinItem}>
                            <Text style={styles.besinDeger}>{analizSonucu.karbonhidrat}g</Text>
                            <Text style={styles.besinLabel}>Karb </Text>
                        </View>
                        <View style={styles.besinItem}>
                            <Text style={styles.besinDeger}>{analizSonucu.yag}g</Text>
                            <Text style={styles.besinLabel}>Yağ </Text>
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
                }}>
                    <Text style={styles.tekrarButtonText}>Tekrar Cek</Text>
                </TouchableOpacity>
               </View>
            </View>
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
        alignItems: 'center',
        justifyContent: 'center',
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
})
