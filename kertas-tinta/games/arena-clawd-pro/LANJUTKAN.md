# Arena Clawd Pro — catatan untuk melanjutkan (24 Okt 2026)

STATUS: sekitar 15% selesai. `game.html` BELUM bisa dimainkan. CSS dan kerangka menu baru sudah diganti,
tetapi JavaScript masih kode Arena Clawd v2 dan memanggil elemen lama (`heroPick`, `spellPick`, `dMudah`, `dSedang`, `bStart`, `best`) yang sudah dihapus.

- Sumber dasar (v2, bisa dimainkan): `../../../arena-clawd/index.html` di repo ini.
- `game.html` = format Artifact (tanpa doctype). `sh build.sh` menulis `index.html` lengkap.
- Gaya: kertas & tinta siri Clawd (tetap sama dengan v2).

## Permintaan user
Arena Clawd versi PRO (file BARU, beda dari arena-clawd): tambah fitur MOBA yang penting saja, tidak terlalu detail.
Musuh HANYA minion dan menara: tanpa hero AI musuh, tanpa Raja Comot (boss dihapus, diganti Inti Istana Comot).
Lalu tulis prompt detail untuk membuat game seperti ini di Prompt Generator. Cek 2–3 kali sebelum push.

## Fitur yang harus dibuat
1. Bahasa ID (lalai) + BM: `L(id, ms)` dan `tx([id, ms])`, simpan di localStorage `arena-pro-lang`, tombol `[data-lang]` di menu.
2. 6 hero (urutan pahlawan, perisai, pemanah, sihir, bayang, penyembuh). Skill: 3 hero lama tetap, ditambah:
   - Perisai (tank, #a3b86c, hp 1500): Hantam Perisai (area 150 di depan, pingsan 0,8 s) · Tembok Kertas (perisai 30%, kebal 4 s, minion musuh dekat menyerang dia) · ult Benteng Raksasa (cincin 270, pingsan 1,6 s).
   - Bayangan (assassin, #8a78b8, hp 820, laju 278): Lompat Bayangan (meluncur ke musuh; reset bila musuh mati) · Tusuk Kembar (2 pukulan) · ult Tarian Bayangan (1,6 s tak bisa diserang, memukul semua di radius 230 tiap 0,2 s).
   - Penyembuh (support, #f19bb4, jarak jauh): Cahaya Pulih (pulih diri + minion kawan) · Gelembung Lindung (minion kawan −50% damage +50% serangan 6 s) · ult Panggil Pasukan (3/5 minion super).
   - Aksesori dilukis di `drawClawd`: perisai bulat + helm, syal gelap + belati, mahkota daun + tongkat hati.
3. Mode `satu` (1 lorong tengah, menara musuh midP 0.6/0.72/0.86, kita 0.4/0.28/0.14) dan `tiga` (peta v2 + menara tier 3 di midP 0.88 / 0.14). Kamp & semak per mode; pohon dijana ulang per mode (jalur kamp→lorong dikosongkan).
4. Rantai perisai: tier 2 kebal sampai tier 1 lorong sama roboh; tier 3 kebal sampai satu lorong bersih; inti kebal sampai tier 3 roboh. Menang = Inti Istana Comot hancur; kalah = inti kita hancur.
5. Minion: dekat, jauh, meriam (tiap gelombang ke-3; damage 2,6× ke bangunan), super (dari support/hadiah).
6. Semak: hero di dalam semak tidak terlihat minion/menara musuh, sampai 1,2 s setelah menyerang.
7. Kuis di dalam gameplay:
   - Soal Gempur: tombol ⚡ (tombol G) muncul dekat menara/inti yang bisa diserang. Benar = pensil raksasa −18% nyawa (inti −12%), jeda 20 s; salah = jeda 12 s.
   - Ultimate Matematika: ult memunculkan soal lebih sulit (tier +1). Benar = 150%, salah = 70% (ult tetap keluar).
   - Soal kilat tiap 60–75 s (buff: kuasa/laju/perisai/pulih/koin/meriam bonus) + soal saat tumbang (benar = bangkit).
   - Kombo: 3 benar beruntun = Ledakan Kombo (area 280 + koin). Tampil di HUD.
   - Tingkat soal naik tiap 5 level (tier 0–2) di dalam Mudah (kelas 1–2) / Sedang (3–4) / Sulit (5–6). Topik: campur/tambah/kurang/kali/bagi. Sulit punya soal angka hilang.
   - Salah = tampil jawaban benar + PENJELASAN cara (puluhan/satuan, penjumlahan berulang, cek dengan kebalikan) + tombol Lanjut.
8. Menu bertab: Main (hero, spell, mode, topik, tingkat, cara main) · Belajar (4 kartu konsep + contoh + tips + "Latihan 5 soal") · Latihan (10 soal tanpa tekanan, ada penjelasan) · Kemajuan (localStorage `arena-pro-kemajuan`: main, menang, skor, akurasi per topik, 8 soal salah terakhir).
9. Layar akhir = laporan belajar: statistik, akurasi per topik, soal yang salah + penjelasan, tombol "Latihan soal yang salah".
10. Kedai: 8 item lama + Ramuan Nyawa (90 koin, langsung +40%, tidak memakai slot).
11. Kait ujian `window.__game`: keadaan, info, langkah, gerak, ke, skill, spell, naik, beli, kedai, tutupKedai, balik, xp, emas, soalan, jawabUji, lanjut, runtuh(n), gempur, hancurInti, cedera, monster, semak.

## Sesudah game jadi
- Main-uji otomatis di HP 390×844 dan desktop (skrip `~/.claude/skills/studio-game-web/scripts/main-uji.mjs` hanya ada di Mac user), simpan bukti.
- game-preview: pindahkan ke main, tambah sampul `sampul/arena-clawd-pro.jpg` + entri di array `DATA` `index.html`.
- prompt-generator (repo auzanhasfi/prompt-generator): salin ke `contoh/kertas-tinta/games/arena-clawd-pro/`, entri KT_GAMES + KT_IDE + KW_TPL di `js/template-kt.js`, prompt detail 3 bahasa lewat `Object.assign` di akhir `js/detail-{id,ms,en}.js`, terjemahan di `js/i18n-{ms,en}.js`, sampul `vid/template/arena-clawd-pro-edu.jpg`. Contoh pola: lari-clawd.
