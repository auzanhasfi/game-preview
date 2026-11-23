# Prompt untuk membuat game serupa

Buatkan game web **pinball 3D** dengan HTML, CSS, dan JavaScript (three.js lokal, tanpa build), dalam bentuk folder: `index.html`, `css/`, `js/` dipecah per bagian, siap diunggah ke Netlify.

- Meja pinball lengkap: plunger dengan skill shot, 2 flipper, 3 pop bumper, 2 slingshot, inlane/outlane, kickback, 2 ramp dengan rel kawat, 2 orbit, gerbang satu arah, spinner, 3 drop target di depan lubang kunci, lajur atas rollover yang bisa digeser dengan flipper.
- Fisika bola 2D di bidang meja dengan sub-langkah kecil (bola tidak menembus dinding), tampil 3D dengan kamera tetap yang memuat seluruh meja di HP maupun desktop.
- Layar dot-matrix jingga di atas menampilkan soal matematika dan skor.
- **Matematika**: setiap soal punya 4 pilihan jawaban yang ditempel di 4 tembakan (orbit kiri, ramp kiri, ramp kanan, orbit kanan). Pemain menjawab dengan menembak bola ke tembakan yang benar. Benar beruntun melipatgandakan poin; 5 beruntun = bola ekstra.
- Kunci 2 bola → multiball 3 bola; selama multiball jawaban benar = jackpot.
- Ball save, tilt, bonus akhir bola, 3 bola, layar hasil dengan bintang dan riwayat soal.
- Tingkat soal Mudah / Sedang / Sulit, Bahasa Indonesia + Melayu, suara sintesis WebAudio.
- Kontrol keyboard (Z dan /, Spasi untuk plunger) dan sentuh (ketuk sisi kiri/kanan, tombol plunger).
- Tanpa cerita: langsung main. Mode demo di menu dengan pemain otomatis.
- Ikon garis yang elegan, bukan emoji.
