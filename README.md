# Ngibulls - Cyber Game Arena

Ngibulls adalah platform permainan kartu dan dadu multiplayer real-time yang mengusung tema **Cyber-Terminal** futuristik. Pemain dapat bertanding dalam permainan _Card Bluff_ (Tebak kartu) dan _Liar's Dice_ (Tebak dadu) dengan antarmuka yang modern dan responsif.

## 🚀 Fitur yang Sudah Dikerjakan

### 1. Visual & UI/UX (Cyber Aesthetic)

- **Tema Premium**: Implementasi desain berbasis _Glassmorphism_ dengan latar belakang gelap pekat, aksen biru neon, dan efek _glow_ yang mempesona.
- **Booting Terminal**: Antarmuka _loading_ bertema terminal OS ("Core_System_Link") yang menampilkan log sinkronisasi sistem secara real-time.
- **Responsive Layout**: Antarmuka adaptif yang mendukung layar desktop hingga perangkat mobile paling kecil sekalipun tanpa ada konten yang terpotong.
- **Micro-Animations**: Animasi halus pada kartu, transisi giliran (_Turn Splash_), dan indikator status pemain.

### 2. Gameplay Mechanics

- **Card Bluff & Liar's Dice**: Dukungan penuh untuk dua mode permainan utama dengan logika sinkronisasi Socket.IO.
- **Deck Manifest HUD**: Panel info di sisi kanan yang menampilkan ringkasan komposisi kartu yang ada dalam deck (misal: "6x Aces"), memudahkan strategi pemain.
- **Real-time Turn Timer**: Indikator progres waktu (20 detik) di atas konsol kontrol dengan peringatan visual (berwarna merah berkedip) saat waktu hampir habis.
- **Initializing Deck Splash**: Layar transisi saat game dimulai yang menampilkan seluruh isi deck dengan animasi yang canggih.
- **Reveal Arena**: Area meja tengah untuk menampilkan kartu/dadu hasil tantangan (_bluff call_) dengan penanganan tumpukan kartu yang dinamis.

### 3. Social & Identity

- **Dynamic Lobby**: Sistem pembuatan dan bergabung ke ruangan dengan kode unik.
- **Copy Lobby ID**: Fitur salin ID lobi sekali klik dengan notifikasi konfirmasi _toast_.
- **Player Roster**: Tampilan pemain dengan indikator kesehatan (_hearts_) yang dioptimalkan untuk visibilitas mobile (diletakkan tepat di bawah foto profil).

### 4. Technical Improvements

- **Socket Integration**: Sinkronisasi state game yang robust melalui event `room_updated`, `game_loading`, dan `game_ready`.
- **Mobile Scaling**: Meja arena yang secara otomatis menyesuaikan skala (`scale`) agar konsol kontrol tetap terlihat dan dapat dioperasikan di layar HP.
- **Notification System**: Integrasi SweetAlert2 untuk notifikasi taktis dan peringatan sistem dengan gaya futuristik.

---

## 🛠️ Stack Teknologi

- **Core**: Angular 21 (v21.2.2)
- **Styling**: Tailwind CSS & Vanilla CSS (untuk animasi kustom)
- **Real-time**: Socket.IO Client
- **UI Components**: SweetAlert2, Lucide-like SVG Icons

## 💻 Cara Menjalankan Project

1. Jaga agar backend berjalan di background (lihat `API_SPEC.md`).
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Jalankan server pengembangan:
   ```bash
   ng serve
   ```
4. Buka `http://localhost:4200` di browser Anda.

---

_Dikembangkan oleh iannstronaut untuk pengalaman bermain yang taktis dan modern._
