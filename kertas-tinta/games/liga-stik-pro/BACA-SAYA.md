# Liga Stik Pro · Bola Matematika

Game sepak bola stickman gaya konsol (11 vs 11, kamera siaran) dengan soal matematika di tengah laga. Bahasa Indonesia + English. Statis, tanpa build: seret folder ini ke Netlify Drop.

## Cara main singkat
- Gerak: WASD / panah · Umpan J · Tembak K (tahan untuk tenaga) · Terobosan L · Lambung I · Lari Shift · Ganti pemain Q · Jeda Esc
- HP: joystik kiri + tombol Umpan / Tembak / Terobos / Lambung / Lari (label berubah saat bertahan: Tekan / Sliding / Ganti)
- Gamepad: A umpan, X tembak, Y terobos, B lambung, RB lari, LB ganti
- Soal Momen (2/4/7 kali per laga): benar = Semangat 25 detik + setengah meteran Tendangan Super. Penalti & Adu Penalti: soal dulu sebelum menendang / menjaga.

## Daftar file
| File | Isi |
|---|---|
| `index.html` | kerangka halaman, urutan skrip |
| `css/game.css` | gaya "Pro" biru malam + emas, menu, modal, tombol sentuh |
| `js/00-util.js` | ruang nama `G`, alat bantu, penyimpanan |
| `js/01-ikon.js` | ikon garis SVG |
| `js/02-teks.js` | teks ID / EN |
| `js/03-klub.js` | 10 klub, kit kandang/tandang, pemain + statistik, formasi 4-3-3 (**ubah nama pemain di sini**) |
| `js/04-soal.js` | pembuat soal (mudah / sedang / sulit, soal cerita) |
| `js/05-bunyi.js` | suara sintesis WebAudio (peluit, tendangan, penonton) |
| `js/06-kamera.js` | kamera perspektif + pemotongan bidang dekat |
| `js/07-lapangan.js` | stadion, penonton, papan iklan, garis, gawang |
| `js/08-stik.js` | pemain stickman berwarna + pose (lari, tendang, sliding, kiper melompat, selebrasi) |
| `js/09-bola.js` | fisika bola, umpan, tembakan, sundulan, tekel |
| `js/10-ai.js` | AI tim & kiper, level Mudah/Normal/Sulit |
| `js/11-laga.js` | aturan pertandingan, bola mati, gol, pelanggaran, kendali pemain, jam, Soal Momen |
| `js/12-penalti.js` | penalti dalam laga + mode Adu Penalti |
| `js/13-input.js` | papan ketik, sentuh, gamepad |
| `js/14-hud.js` | papan skor, radar, meteran, pesan |
| `js/15-layar.js` | menu, pilih tim, cara main, hasil, modal soal & jeda |
| `js/99-mulai.js` | gelung utama, kait ujian `window.__game` |
| `uji/main.mjs` | uji main otomatis (menu, AI vs AI, laga + soal, adu penalti) → `bukti/` |
| `uji/bot.mjs`, `uji/sampul.mjs` | bot pemain, pembuat sampul |
| `prompt/` | prompt untuk membuat ulang game (ID / MS / EN) |

Catatan: tanpa logo resmi klub; nama pemain hanya gambaran skuad dan bisa diubah.
