# Bola Hamster Clawd / Clawd's Hamster Ball

Game bola hamster (genre Hamsterball, Marble Madness, Super Monkey Ball) dengan soalan matematik asas.
Clawd bergolek di dalam bola lutsinar melalui 4 trek terapung. Setiap gerbang ada 3 pintu jawapan:
golek melalui pintu yang betul, pintu salah melantunkan bola dan dipangkah.

- Bahasa: Bahasa Melayu (lalai) dan English, butang BM | EN di menu.
- Tahap: Mudah (Tahun 1–2), Sederhana (Tahun 3–4), Mencabar (Tahun 5–6).
- Trek: Taman Biji, Jambatan Ais (licin), Kilang Gear (tali sawat, penyapu, Si Comot), Menara Awan (pelantar bergerak).
- Kawalan: anak panah / WASD, atau seret jari di skrin (kayu bedik terapung).
- Gaya: kertas & dakwat, enjin lukis dari Petualangan Fotosintesis (garis bergetar, arsiran, kata bunyi).
- Statik, tanpa build: seret folder ini ke Netlify Drop, atau buka melalui pelayan tempatan.

## Fail

| Fail | Isi |
|---|---|
| `index.html` | Struktur menu, permainan, skrin tamat |
| `css/game.css` | Gaya kertas & dakwat, susun atur HP (pentas 4:5) |
| `js/01-teks.js` | Semua teks BM + EN, tukar bahasa |
| `js/02-ikon.js` | Ikon garis SVG (tanpa emoji) |
| `js/03-util.js` | Alat am + alat lukis dakwat + Clawd |
| `js/04-bunyi.js` | Bunyi & muzik sintesis WebAudio (tanpa fail audio) |
| `js/05-soal.js` | Penjana soalan ikut tahap |
| `js/06-trek.js` | Peta 4 trek (grid teks) + objek |
| `js/07-fizik.js` | Fizik bola, dinding, ais, tali sawat, gerbang, objek, jatuh |
| `js/08-lukis.js` | Lukisan dunia, bola, zarah |
| `js/09-hud.js` | HUD, papan soalan, toast, kad trek, skrin tamat |
| `js/10-kawalan.js` | Papan kekunci + kayu bedik sentuh |
| `js/99-main.js` | Aliran permainan, gelung, autopilot ujian |

## Ubah suai cepat
- Tukar soalan: `js/05-soal.js` (fungsi `HB.buatSoal`).
- Tambah trek: salin satu objek dalam `HB.TREK` di `js/06-trek.js`; legenda aksara ada di atas fail.
- Tukar teks: `js/01-teks.js`.

## Ujian
`?uji=1&demo=1` main sendiri (autopilot), `&tr=0..3` pilih trek, `&lv=mudah|sederhana|mencabar`,
`?uji=1&preview=1` mod pratonton galeri. Kait konsol: `__hb.info()`, `__hb.step(saat)`.
