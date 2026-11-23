# Pinball Clawd · Meja Angka

Game pinball 3D (HTML, CSS, JavaScript + three.js lokal) dengan soal matematika. Tanpa cerita: langsung main pinball. Bahasa Indonesia + Melayu. Statik, tanpa build: buka `index.html` lewat server lokal atau seret folder ke Netlify Drop.

## Cara main
- **Plunger**: tahan Spasi / ↓ (atau tombol Plunger di HP), lepas untuk meluncurkan. Masuk lajur atas yang berkedip tepat setelah meluncur = **Skill Shot**.
- **Flipper**: kiri Z / ← / Shift kiri, kanan / / → / Shift kanan. Di HP: ketuk sisi kiri / kanan layar.
- **Soal** tampil di layar dot-matrix atas. Empat tembakan menyala dengan pilihan jawaban (kiri ke kanan): **orbit kiri, ramp kiri, ramp kanan, orbit kanan**. Tembak bola ke jawaban yang benar.
- Benar beruntun melipatgandakan poin (50.000 × beruntun, maks 5×). Lima benar beruntun = **bola ekstra**. Tiga benar beruntun menyalakan lagi **kickback**.
- Jatuhkan 3 **drop target** untuk membuka **Kotak Clawd**. Kunci 2 bola → **Multiball** 3 bola: setiap jawaban benar = **Jackpot 250.000**.
- Tiga lajur atas menyala semua = **bonus berlipat** (sampai 5X). Flipper menggeser lampu lajur.
- **Simpan bola** 10 detik di awal tiap bola, **kickback** di outlane kiri, **goyang meja** (N), tapi 4 goyangan cepat = **TILT**.
- 3 bola. Bintang di akhir: 3 / 6 / 10 jawaban benar.
- Tingkat soal: Mudah (tambah/kurang ≤ 20), Sedang (≤ 100 + perkalian), Sulit (perkalian, pembagian, campuran).

## Daftar file
- `index.html` — kerangka layar (menu, pengaturan, cara main, HUD, jeda, hasil)
- `css/gaya.css` — tampilan (desktop + HP, panel samping di layar lebar)
- `js/00-ikon.js` — ikon garis SVG (dari Turbo Clawd)
- `js/01-data.js` — pengaturan tersimpan + teks ID/BM (termasuk teks layar DMD)
- `js/02-soal.js` — pembuat soal 4 pilihan per tingkat
- `js/03-bunyi.js` — efek bunyi pinball + musik sintesis (WebAudio, tanpa file audio)
- `js/04-meja.js` — tata letak meja: dinding, busur, gerbang satu arah, bumper, sling, flipper, ramp, sensor
- `js/05-fisika.js` — fisika bola 2D (sub-langkah 1/720 detik, flipper berputar, bumper/sling menendang, rel ramp)
- `js/06-aturan.js` — aturan: skor, soal di 4 tembakan, lajur, drop target, kunci → multiball, kickback, simpan bola, bonus, tilt
- `js/07-bot.js` — pemain otomatis (tangkap bola → turunkan → pukul pada posisi yang dikalibrasi) untuk mode demo & uji
- `js/08-render.js` — adegan 3D three.js (playfield bergambar kanvas, krom, bumper menyala, ramp kawat, Clawd, label jawaban)
- `js/09-dmd.js` — layar dot-matrix 128×32 dengan huruf bitmap 5×7 buatan sendiri
- `js/99-main.js` — alur game, input keyboard/sentuh, layar; `window.__game` untuk uji otomatis
- `js/vendor/three/` — three.js (MIT) lokal + EffectComposer/UnrealBloomPass
- `uji/` — `uji.mjs` (uji main Chrome headless desktop + HP), `game-node.mjs` (permainan penuh di Node), `kalibrasi.mjs`, `sudut.mjs`, `tembak.mjs`, `plunger.mjs` (uji fisika), `sampul.mjs`

## Referensi desain (dipelajari, tidak disalin)
Unsur meja pinball umum: pop bumper aktif, slingshot, inlane/outlane, ramp dan orbit sebagai "tembakan", drop target, spinner, lajur rollover dengan lane change, ball lock → multiball, skill shot, ball save, kickback, tilt, layar dot-matrix. Meja ini dirancang sendiri; nama, tata letak, dan grafis buatan sendiri (maskot Clawd), tidak meniru meja pinball tertentu. Struktur folder, ikon, mesin bunyi, dan pembuat soal diambil dari Turbo Clawd.
