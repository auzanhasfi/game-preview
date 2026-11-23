# Turbo Clawd · Arena Lintasan Angka

Game balap mobil mainan 3D (HTML, CSS, JavaScript + three.js lokal) di lintasan plastik oranye: loop, lompatan, jembatan angka delapan, item serangan, dan **Gerbang Angka** matematika di tengah lintasan. Bahasa Indonesia + Melayu. Statik, tanpa build: buka `index.html` lewat server lokal atau seret folder ke Netlify Drop.

## Cerita
Raja Comot mencuri **Piala Angka** dari Kota Mainan. Clawd (dibantu Nini) harus menang di 4 arena:

| Arena | Tempat | Ciri lintasan | Target |
|---|---|---|---|
| 1 Rak Mainan | Kamar tidur | Loop di lurusan utama, lompatan turun | posisi 1–3 |
| 2 Jembatan Wastafel | Dapur raksasa | Angka delapan, lompat melintas di atas lintasan bawah | posisi 1–3 |
| 3 Bukit Bunga | Kebun belakang | Bukit tinggi, loop, lompatan | posisi 1–3 |
| 4 Benteng Comot | Istana kaleng (malam) | Loop + lompatan, Raja Comot menjatuhkan bom | juara 1 |

## Cara main
- Mobil melaju sendiri. **Kiri/kanan** (A/D, panah, atau tombol layar) supaya tidak terlempar ke pagar di tikungan.
- **Drift** (Shift / tombol drift) di tikungan mengisi meter turbo; lepas untuk melesat.
- **Kotak berkilau** memberi item: Roket (mengejar mobil di depan), Bom (dilempar, meledak bila disentuh), Dorong (gelombang pendorong), Nitro, Perisai. Pakai dengan Spasi / tombol bintang.
- **Gerbang Angka** 2× per putaran: soal tampil di atas layar dan di gapura. Masuk lajur warna jawaban yang benar → Turbo Benar 3 detik. Salah → mobil melambat dan jawaban benar ditampilkan.
- Tingkat soal: Mudah (tambah/kurang ≤ 20), Sedang (≤ 100 + perkalian), Sulit (perkalian, pembagian, campuran).

## Daftar file
- `index.html` — kerangka layar (menu, arena, garasi, pengaturan, cerita, HUD, jeda, hasil)
- `css/gaya.css` — tampilan (desktop + HP, kontrol sentuh)
- `js/00-ikon.js` — ikon garis SVG, potret tokoh cerita, siluet mobil
- `js/01-data.js` — pengaturan tersimpan, teks ID/BM, 4 mobil pemain, geng Comot, 4 arena, naskah cerita
- `js/02-soal.js` — pembuat soal Gerbang Angka per tingkat
- `js/03-bunyi.js` — efek bunyi, dengung mesin, musik sintesis (WebAudio, tanpa file audio)
- `js/04-trek.js` — kurva lintasan, loop, lompatan, kemiringan tikungan, mesh plastik oranye, pad turbo
- `js/05-dunia.js` — renderer, tema arena, properti raksasa, gapura gerbang angka, kotak item
- `js/06-mobil.js` — model mobil mainan + supir Clawd / Comot
- `js/07-balap.js` — fisika balap, AI, item & proyektil, tabrakan, partikel
- `js/08-ui.js` — layar, cerita, toast, peta mini, kartu arena & garasi
- `js/99-main.js` — alur game, kamera kejar, HUD, input; `window.__game` untuk uji otomatis
- `js/vendor/three/` — three.js (MIT) lokal
- `uji/uji.mjs` — uji main otomatis (Chrome headless, desktop + HP); `uji/balapan-penuh.mjs` — simulasi balapan penuh; `uji/sampul.mjs` — tangkap sampul

## Referensi desain (dipelajari, tidak disalin)
- Ulasan game balap mobil mainan: inti keseruan = lintasan penuh loop/lompatan + putaran drift→boost; keluhan utama = mudah jatuh dari lintasan → di sini lintasan berpagar dan loop/lompatan punya "magnet" kecepatan minimum.
- Desain item kart racer: undian item berdasar posisi (yang depan dapat item bertahan, yang belakang dapat roket/nitro), karet-gelang AI yang lembut supaya tetap seru tanpa terasa curang.
- Semua nama, tokoh, lintasan, dan grafis buatan sendiri (Clawd, Nini, geng Comot); tidak memakai merek atau aset game lain.
