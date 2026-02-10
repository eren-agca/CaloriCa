# CaloriCa 🍎

**CaloriCa**, günlük kalori ve su tüketiminizi kolayca takip etmenizi sağlayan modern bir mobil uygulamadır. React Native ve Expo ile geliştirilmiştir.

![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-blue)
![Expo](https://img.shields.io/badge/Expo-54-000020)
![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6)

---

## 📱 Özellikler

### 🏠 Ana Sayfa
- **Günlük Kalori Takibi**: Yediğiniz yemekleri seçin ve kalori hesaplaması otomatik yapılsın
- **Su Takibi**: Günlük su tüketiminizi bardak olarak takip edin (hedef: 8 bardak)
- **Yemek Veritabanı**: Pilav, tavuk, salata, muz gibi yaygın yemekler hazır
- **Gramaj Girişi**: Her yemek için porsiyon miktarını gram olarak belirleyin
- **Yenilen Yemek Listesi**: Gün içinde yediklerinizi görüntüleyin ve düzenleyin

### 📸 Kamera (Yakında)
- AI destekli yemek tanıma özelliği
- Fotoğraf çekerek otomatik kalori hesaplama

### 📊 İstatistikler (Yakında)
- Haftalık ve aylık kalori takibi
- Görsel grafikler ve analizler

### 👤 Profil
- Hesap ayarları
- Kişisel hedef belirleme

---

## 🚀 Başlarken

### Gereksinimler

- [Node.js](https://nodejs.org/) (v18 veya üzeri)
- [npm](https://www.npmjs.com/) veya [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS için: Xcode (macOS)
- Android için: Android Studio ve Emulator

### Kurulum

1. **Repoyu klonlayın:**
   ```bash
   git clone https://github.com/kullanici/CaloriCa.git
   cd CaloriCa
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Uygulamayı başlatın:**
   ```bash
   npx expo start
   ```

### Çalıştırma Seçenekleri

Uygulama başladıktan sonra aşağıdaki seçeneklerden birini kullanabilirsiniz:

| Komut | Açıklama |
|-------|----------|
| `npm run ios` | iOS Simulator'da çalıştır |
| `npm run android` | Android Emulator'da çalıştır |
| `npm run web` | Web tarayıcısında çalıştır |
| `npm start` | Expo Dev Server'ı başlat |

Ayrıca [Expo Go](https://expo.dev/go) uygulamasını kullanarak telefonunuzda QR kod okutarak test edebilirsiniz.

---

## 📁 Proje Yapısı

```
CaloriCa/
├── app/                    # Uygulama ekranları (file-based routing)
│   ├── (tabs)/            # Tab navigasyonu
│   │   ├── index.tsx      # Ana sayfa - Kalori takibi
│   │   ├── camera.tsx     # Kamera ekranı
│   │   ├── stats.tsx      # İstatistikler
│   │   ├── profile.tsx    # Profil ayarları
│   │   └── _layout.tsx    # Tab layout yapılandırması
│   ├── _layout.tsx        # Root layout
│   └── modal.tsx          # Modal ekranı
├── components/            # Yeniden kullanılabilir bileşenler
│   ├── ui/               # UI bileşenleri
│   └── ...
├── constants/            # Sabit değerler (tema, renkler)
├── hooks/                # Custom React hooks
├── assets/               # Görseller ve statik dosyalar
└── scripts/              # Yardımcı scriptler
```

---

## 🛠️ Teknolojiler

| Teknoloji | Versiyon | Açıklama |
|-----------|----------|----------|
| [Expo](https://expo.dev/) | 54 | React Native geliştirme platformu |
| [React Native](https://reactnative.dev/) | 0.81 | Mobil uygulama framework'ü |
| [React](https://react.dev/) | 19.1 | UI kütüphanesi |
| [TypeScript](https://www.typescriptlang.org/) | 5.9 | Tip güvenli JavaScript |
| [Expo Router](https://docs.expo.dev/router/introduction/) | 6 | File-based routing |
| [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) | 2.2 | Yerel veri depolama |
| [React Navigation](https://reactnavigation.org/) | 7 | Navigasyon kütüphanesi |

---

## 🎨 Ekran Görüntüleri

*Ekran görüntüleri yakında eklenecek*

---

## 🔧 Geliştirme

### Kod Kalitesi

```bash
# ESLint ile kod kontrolü
npm run lint
```

### Projeyi Sıfırlama

Yeni bir başlangıç yapmak için:

```bash
npm run reset-project
```

Bu komut mevcut kodu `app-example` klasörüne taşır ve boş bir `app` klasörü oluşturur.

---

## 📝 Yol Haritası

- [x] Temel kalori takip sistemi
- [x] Su tüketimi takibi
- [x] Yemek veritabanı
- [x] Günlük veri sıfırlama
- [ ] AI destekli yemek tanıma (kamera)
- [ ] Haftalık/aylık istatistikler
- [ ] Kullanıcı profili ve hedef belirleme
- [ ] Bildirimler ve hatırlatmalar
- [ ] Daha fazla yemek seçeneği
- [ ] Egzersiz takibi
- [ ] Sosyal özellikler

---

## 🤝 Katkıda Bulunma

1. Fork'layın
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'Yeni özellik eklendi'`)
4. Branch'e push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request açın

---

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 📞 İletişim

Sorularınız veya önerileriniz için issue açabilirsiniz.

---

<div align="center">
  <strong>CaloriCa ile sağlıklı yaşamın keyfini çıkarın! 🥗</strong>
</div>
