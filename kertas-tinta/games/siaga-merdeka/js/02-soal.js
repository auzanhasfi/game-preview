/* Siaga Merdeka: pelajaran sejarah, bank soal sejarah, dan pembuat soal matematika bertema perang. */
'use strict';

/* kartu pelajaran: dipakai di briefing misi dan menu Belajar Sejarah */
var PELAJARAN = {
  jepang: { judul: 'Pendudukan Jepang', tahun: '1942–1945', topik: 'jepang', isi: [
    'Jepang mendarat di Tarakan pada Januari 1942. Hanya dalam beberapa minggu, Hindia Belanda runtuh.',
    'Belanda menyerah tanpa syarat di Kalijati, Subang, pada 8 Maret 1942. Letjen Ter Poorten menandatangani penyerahan di hadapan Jenderal Hitoshi Imamura.',
    'Jepang membentuk Heiho (pasukan pembantu, 1942) dan PETA atau Pembela Tanah Air (Oktober 1943). Banyak perwira PETA kelak menjadi tulang punggung tentara Indonesia.',
    'Rakyat dipaksa bekerja sebagai romusha untuk proyek perang Jepang. Penderitaan ini memicu perlawanan, misalnya pemberontakan PETA di Blitar yang dipimpin Supriyadi pada 14 Februari 1945.'
  ], tahukah: 'Masa pendudukan Jepang hanya sekitar 3,5 tahun, jauh lebih singkat daripada penjajahan Belanda, tetapi sangat berat bagi rakyat.' },
  proklamasi: { judul: 'Proklamasi Kemerdekaan', tahun: '17 Agustus 1945', topik: 'proklamasi', isi: [
    'Jepang menyerah kepada Sekutu pada 15 Agustus 1945 setelah bom atom dijatuhkan di Hiroshima dan Nagasaki.',
    'Golongan muda membawa Soekarno dan Hatta ke Rengasdengklok pada 16 Agustus 1945 agar proklamasi segera dilakukan.',
    'Teks proklamasi dirumuskan di rumah Laksamana Maeda dan diketik oleh Sayuti Melik.',
    'Proklamasi dibacakan di Jalan Pegangsaan Timur 56, Jakarta, pada 17 Agustus 1945 pukul 10.00. Bendera Merah Putih dijahit oleh Fatmawati.'
  ], tahukah: 'Sehari kemudian, 18 Agustus 1945, PPKI mengesahkan UUD 1945 serta memilih Soekarno sebagai presiden dan Hatta sebagai wakil presiden.' },
  semarang: { judul: 'Pertempuran Lima Hari di Semarang', tahun: '15–19 Oktober 1945', topik: 'semarang', isi: [
    'Setelah proklamasi, para pemuda berusaha melucuti senjata tentara Jepang yang masih berada di Semarang.',
    'Muncul kabar bahwa cadangan air minum di Candi diracuni. dr. Kariadi berangkat memeriksanya, lalu gugur ditembak tentara Jepang.',
    'Kemarahan rakyat memuncak. Pertempuran antara pemuda, TKR, dan tentara Jepang berlangsung lima hari, dari 15 sampai 19 Oktober 1945.',
    'Untuk mengenang peristiwa ini dibangun Tugu Muda di Semarang. Nama dr. Kariadi diabadikan sebagai nama rumah sakit besar di kota itu.'
  ], tahukah: 'Pertempuran berhenti setelah perundingan dan kedatangan pasukan Sekutu di Semarang pada 20 Oktober 1945.' },
  surabaya: { judul: 'Pertempuran Surabaya', tahun: '10 November 1945', topik: 'surabaya', isi: [
    'Pada 19 September 1945, pemuda Surabaya merobek warna biru bendera Belanda di Hotel Yamato sehingga tinggal Merah Putih.',
    'Pasukan Sekutu (Inggris) datang, diboncengi NICA, pasukan Belanda yang ingin berkuasa kembali. Brigjen A.W.S. Mallaby tewas dalam baku tembak pada 30 Oktober 1945.',
    'Sekutu mengeluarkan ultimatum agar pejuang menyerahkan senjata. Ultimatum ditolak. Pada 10 November 1945 pukul 06.00, Surabaya diserang dari darat, laut, dan udara.',
    'Bung Tomo membakar semangat rakyat lewat siaran radio. Pertempuran berlangsung sekitar tiga minggu dan tanggal 10 November kini diperingati sebagai Hari Pahlawan.'
  ], tahukah: 'Resolusi Jihad yang dikeluarkan KH Hasyim Asy\'ari pada 22 Oktober 1945 ikut menggerakkan para santri untuk berjuang di Surabaya.' },
  ambarawa: { judul: 'Palagan Ambarawa', tahun: '20 Oktober – 15 Desember 1945', topik: 'ambarawa', isi: [
    'Pasukan Sekutu yang datang ke Magelang dan Ambarawa dengan alasan mengurus tawanan malah membebaskan dan mempersenjatai tawanan Belanda.',
    'Letkol Isdiman gugur dalam pertempuran. Kolonel Soedirman, Panglima Divisi V Banyumas, lalu memimpin langsung.',
    'Soedirman memakai siasat Supit Urang: musuh dikepung dari dua sisi seperti capit udang sehingga terputus dari pasukan induknya.',
    'Pada 15 Desember 1945 Sekutu terdesak dan mundur ke Semarang. Tanggal ini diperingati sebagai Hari Juang Kartika (Hari Juang TNI Angkatan Darat).'
  ], tahukah: 'Di Ambarawa kini berdiri Monumen Palagan Ambarawa yang memajang tank dan pesawat dari masa itu.' },
  bandung: { judul: 'Bandung Lautan Api', tahun: '24 Maret 1946', topik: 'bandung', isi: [
    'Sekutu memerintahkan pejuang mengosongkan Bandung bagian selatan.',
    'Para pejuang memilih membakar kota sendiri agar tidak dipakai musuh sebagai markas. Siasat ini disebut bumi hangus.',
    'Sekitar 200.000 penduduk mengungsi dan bangunan-bangunan dibakar dalam satu malam.',
    'Lagu "Halo-Halo Bandung" menjadi lagu kenangan peristiwa ini. Mohammad Toha dikenal karena meledakkan gudang mesiu Sekutu.'
  ], tahukah: 'Siasat bumi hangus artinya merelakan milik sendiri dihancurkan supaya tidak bisa dimanfaatkan lawan.' },
  agresi1: { judul: 'Diplomasi dan Agresi Militer I', tahun: '1946–1948', topik: 'agresi', isi: [
    'Perundingan Linggarjati (November 1946) menghasilkan pengakuan Belanda atas kekuasaan RI di Jawa, Sumatra, dan Madura.',
    'Belanda melanggar perjanjian itu dan melancarkan Agresi Militer I pada 21 Juli 1947 untuk merebut daerah perkebunan dan sumber daya.',
    'Dunia internasional mengecam. PBB membentuk Komisi Tiga Negara (Australia, Belgia, Amerika Serikat).',
    'Perjanjian Renville ditandatangani di atas kapal perang Amerika Serikat USS Renville pada Januari 1948. Wilayah RI makin sempit.'
  ], tahukah: 'Australia dipilih oleh Indonesia, Belgia dipilih oleh Belanda, dan Amerika Serikat dipilih oleh keduanya.' },
  agresi2: { judul: 'Agresi Militer II dan Perang Gerilya', tahun: '19 Desember 1948', topik: 'agresi', isi: [
    'Belanda menyerang Yogyakarta, ibu kota RI saat itu, pada 19 Desember 1948. Serangan ini disebut Operasi Gagak.',
    'Soekarno, Hatta, dan beberapa menteri ditawan lalu diasingkan ke luar Jawa.',
    'Pemerintahan Darurat Republik Indonesia (PDRI) dibentuk di Sumatra Barat dan dipimpin Sjafruddin Prawiranegara agar negara tetap berjalan.',
    'Jenderal Soedirman yang sedang sakit tetap memimpin perang gerilya sambil ditandu, berpindah-pindah hutan dan gunung selama sekitar tujuh bulan.'
  ], tahukah: 'Perang gerilya artinya menyerang lawan secara tiba-tiba dalam kelompok kecil, lalu menghilang lagi. Siasat ini menguras tenaga pasukan Belanda.' },
  seranganumum: { judul: 'Serangan Umum 1 Maret', tahun: '1 Maret 1949', topik: 'seranganumum', isi: [
    'Belanda mengabarkan ke dunia bahwa RI dan tentaranya sudah tidak ada.',
    'Pada 1 Maret 1949 pagi, TNI menyerang Yogyakarta secara serentak dan menguasai kota sekitar enam jam. Letkol Soeharto memimpin serangan di lapangan.',
    'Sri Sultan Hamengkubuwono IX mendukung serangan ini. Kabar keberhasilannya disiarkan sampai ke luar negeri.',
    'Dunia jadi tahu bahwa RI masih ada. Posisi Indonesia di meja perundingan menjadi jauh lebih kuat.'
  ], tahukah: 'Di Yogyakarta berdiri Monumen Serangan Oemoem 1 Maret 1949 di dekat Benteng Vredeburg.' },
  kmb: { judul: 'Roem-Royen dan Konferensi Meja Bundar', tahun: '1949', topik: 'kmb', isi: [
    'Perundingan Roem-Royen (April–Mei 1949) membuat pemimpin RI dibebaskan dan pemerintah kembali ke Yogyakarta pada Juli 1949.',
    'Konferensi Meja Bundar berlangsung di Den Haag, Belanda, pada 23 Agustus – 2 November 1949. Delegasi Indonesia dipimpin Mohammad Hatta.',
    'Belanda menyerahkan kedaulatan kepada Republik Indonesia Serikat (RIS) pada 27 Desember 1949.',
    'Perjuangan bersenjata dan perjuangan diplomasi berjalan bersama sampai kemerdekaan diakui.'
  ], tahukah: 'RIS hanya bertahan sebentar. Pada 17 Agustus 1950 Indonesia kembali menjadi negara kesatuan (NKRI).' }
};
var URUT_PELAJARAN = ['jepang', 'proklamasi', 'semarang', 'surabaya', 'ambarawa', 'bandung', 'agresi1', 'agresi2', 'seranganumum', 'kmb'];

/* bank soal sejarah: t = topik, q = soal, a = pilihan (indeks 0 benar, diacak saat tampil), e = penjelasan */
var SOAL_SEJARAH = [
  { t: 'jepang', q: 'Di mana Belanda menyerah kepada Jepang pada Maret 1942?', a: ['Kalijati, Subang', 'Rengasdengklok', 'Linggarjati', 'Ambarawa'], e: 'Penyerahan tanpa syarat ditandatangani di Kalijati, Subang, pada 8 Maret 1942.' },
  { t: 'jepang', q: 'Apa kepanjangan PETA?', a: ['Pembela Tanah Air', 'Pejuang Tanah Air', 'Pasukan Tentara Asia', 'Pemuda Tanah Air'], e: 'PETA = Pembela Tanah Air, dibentuk Jepang pada Oktober 1943.' },
  { t: 'jepang', q: 'Kerja paksa untuk proyek perang Jepang disebut...', a: ['Romusha', 'Heiho', 'Kerja rodi', 'Seinendan'], e: 'Romusha adalah kerja paksa pada masa Jepang. Kerja rodi adalah kerja paksa masa Belanda.' },
  { t: 'jepang', q: 'Siapa pemimpin pemberontakan PETA di Blitar tahun 1945?', a: ['Supriyadi', 'Bung Tomo', 'Soedirman', 'Isdiman'], e: 'Supriyadi memimpin pemberontakan PETA di Blitar pada 14 Februari 1945.' },
  { t: 'jepang', q: 'Pasukan pembantu dari orang Indonesia yang dibentuk Jepang tahun 1942 adalah...', a: ['Heiho', 'KNIL', 'BKR', 'NICA'], e: 'Heiho adalah pasukan pembantu tentara Jepang. KNIL adalah tentara Hindia Belanda.' },
  { t: 'jepang', q: 'Di kota mana Jepang pertama kali mendarat di Indonesia pada Januari 1942?', a: ['Tarakan', 'Surabaya', 'Batavia', 'Medan'], e: 'Pendaratan pertama Jepang terjadi di Tarakan, Kalimantan Timur, karena kaya minyak.' },
  { t: 'proklamasi', q: 'Kapan proklamasi kemerdekaan Indonesia dibacakan?', a: ['17 Agustus 1945', '16 Agustus 1945', '18 Agustus 1945', '10 November 1945'], e: 'Proklamasi dibacakan 17 Agustus 1945 pukul 10.00 di Pegangsaan Timur 56, Jakarta.' },
  { t: 'proklamasi', q: 'Siapa yang mengetik naskah proklamasi?', a: ['Sayuti Melik', 'Sukarni', 'Ahmad Soebardjo', 'Wikana'], e: 'Sayuti Melik mengetik naskah proklamasi yang ditulis tangan Soekarno.' },
  { t: 'proklamasi', q: 'Peristiwa golongan muda membawa Soekarno-Hatta ke luar Jakarta pada 16 Agustus 1945 disebut...', a: ['Peristiwa Rengasdengklok', 'Peristiwa Kalijati', 'Peristiwa Hotel Yamato', 'Peristiwa Renville'], e: 'Golongan muda membawa keduanya ke Rengasdengklok agar proklamasi tidak menunggu Jepang.' },
  { t: 'proklamasi', q: 'Siapa yang menjahit bendera pusaka Merah Putih?', a: ['Fatmawati', 'Cut Nyak Dien', 'R.A. Kartini', 'Dewi Sartika'], e: 'Bendera pusaka dijahit oleh Fatmawati, istri Soekarno.' },
  { t: 'proklamasi', q: 'Naskah proklamasi dirumuskan di rumah...', a: ['Laksamana Maeda', 'Ahmad Soebardjo', 'Soekarno', 'Hatta'], e: 'Perumusan naskah proklamasi berlangsung di rumah Laksamana Tadashi Maeda, Jakarta.' },
  { t: 'proklamasi', q: 'Badan yang mengesahkan UUD 1945 pada 18 Agustus 1945 adalah...', a: ['PPKI', 'BPUPKI', 'KNIP', 'PDRI'], e: 'PPKI (Panitia Persiapan Kemerdekaan Indonesia) mengesahkan UUD 1945 dan memilih presiden.' },
  { t: 'semarang', q: 'Pertempuran Lima Hari di Semarang terjadi antara pejuang Indonesia melawan...', a: ['Tentara Jepang', 'Tentara Belanda', 'Tentara Inggris', 'Tentara Australia'], e: 'Pertempuran 15–19 Oktober 1945 melawan tentara Jepang yang menolak menyerahkan senjata.' },
  { t: 'semarang', q: 'Dokter yang gugur saat memeriksa cadangan air minum di Semarang adalah...', a: ['dr. Kariadi', 'dr. Soetomo', 'dr. Wahidin', 'dr. Cipto'], e: 'dr. Kariadi gugur ditembak Jepang saat akan memeriksa kabar air minum diracun.' },
  { t: 'semarang', q: 'Monumen peringatan Pertempuran Lima Hari di Semarang bernama...', a: ['Tugu Muda', 'Tugu Pahlawan', 'Monas', 'Tugu Jogja'], e: 'Tugu Muda di Semarang dibangun untuk mengenang pertempuran itu. Tugu Pahlawan ada di Surabaya.' },
  { t: 'surabaya', q: 'Tanggal 10 November diperingati sebagai...', a: ['Hari Pahlawan', 'Hari Kebangkitan Nasional', 'Hari Sumpah Pemuda', 'Hari Juang Kartika'], e: 'Hari Pahlawan mengenang pertempuran Surabaya 10 November 1945.' },
  { t: 'surabaya', q: 'Tokoh yang membakar semangat arek-arek Surabaya lewat radio adalah...', a: ['Bung Tomo', 'Bung Hatta', 'Bung Karno', 'Bung Syahrir'], e: 'Sutomo atau Bung Tomo berpidato lewat radio untuk menyemangati pejuang.' },
  { t: 'surabaya', q: 'Di Hotel Yamato, pemuda merobek warna apa dari bendera Belanda?', a: ['Biru', 'Merah', 'Putih', 'Oranye'], e: 'Warna biru dirobek sehingga bendera merah-putih-biru menjadi Merah Putih.' },
  { t: 'surabaya', q: 'Perwira Inggris yang tewas di Surabaya pada 30 Oktober 1945 adalah...', a: ['Brigjen Mallaby', 'Jenderal Spoor', 'Jenderal Imamura', 'Letjen Ter Poorten'], e: 'Brigjen A.W.S. Mallaby tewas sehingga Inggris mengeluarkan ultimatum.' },
  { t: 'surabaya', q: 'NICA yang membonceng pasukan Sekutu adalah pasukan dari...', a: ['Belanda', 'Jepang', 'Amerika Serikat', 'Australia'], e: 'NICA (Netherlands Indies Civil Administration) adalah pemerintahan sipil Belanda yang ingin berkuasa lagi.' },
  { t: 'surabaya', q: 'Siapa ulama yang mengeluarkan Resolusi Jihad 22 Oktober 1945?', a: ['KH Hasyim Asy\'ari', 'KH Ahmad Dahlan', 'Buya Hamka', 'KH Agus Salim'], e: 'KH Hasyim Asy\'ari, pendiri NU, mengeluarkan Resolusi Jihad. Tanggal 22 Oktober kini Hari Santri.' },
  { t: 'ambarawa', q: 'Siasat Kolonel Soedirman di Ambarawa disebut...', a: ['Supit Urang', 'Bumi Hangus', 'Perang Gerilya', 'Benteng Stelsel'], e: 'Supit Urang: mengepung musuh dari dua sisi seperti capit udang.' },
  { t: 'ambarawa', q: 'Kemenangan Palagan Ambarawa 15 Desember diperingati sebagai...', a: ['Hari Juang Kartika', 'Hari Pahlawan', 'Hari Bela Negara', 'Hari Santri'], e: 'Hari Juang Kartika adalah Hari Juang TNI Angkatan Darat.' },
  { t: 'ambarawa', q: 'Perwira yang gugur di Ambarawa sebelum Soedirman memimpin langsung adalah...', a: ['Letkol Isdiman', 'Letkol Soeharto', 'Mayjen Sungkono', 'Mohammad Toha'], e: 'Letkol Isdiman gugur, lalu Kolonel Soedirman turun memimpin.' },
  { t: 'ambarawa', q: 'Setelah kalah di Ambarawa, pasukan Sekutu mundur ke...', a: ['Semarang', 'Magelang', 'Surabaya', 'Bandung'], e: 'Sekutu mundur ke Semarang pada 15 Desember 1945.' },
  { t: 'bandung', q: 'Siasat membakar kota sendiri agar tidak dipakai musuh disebut...', a: ['Bumi hangus', 'Supit urang', 'Gerilya', 'Blokade'], e: 'Bandung Lautan Api 1946 adalah contoh siasat bumi hangus.' },
  { t: 'bandung', q: 'Lagu yang terkenal dari peristiwa Bandung Lautan Api adalah...', a: ['Halo-Halo Bandung', 'Maju Tak Gentar', 'Hari Merdeka', 'Gugur Bunga'], e: '"Halo-Halo Bandung" menjadi lagu kenangan perjuangan Bandung.' },
  { t: 'bandung', q: 'Pejuang yang meledakkan gudang mesiu Sekutu di Bandung adalah...', a: ['Mohammad Toha', 'Bung Tomo', 'I Gusti Ngurah Rai', 'Slamet Riyadi'], e: 'Mohammad Toha meledakkan gudang mesiu di Dayeuhkolot dan gugur.' },
  { t: 'agresi', q: 'Agresi Militer Belanda I dimulai pada...', a: ['21 Juli 1947', '19 Desember 1948', '17 Agustus 1945', '1 Maret 1949'], e: 'Agresi Militer I dimulai 21 Juli 1947, melanggar Perjanjian Linggarjati.' },
  { t: 'agresi', q: 'Perjanjian Renville ditandatangani di atas...', a: ['Kapal perang Amerika Serikat', 'Kereta api', 'Pesawat terbang', 'Istana Bogor'], e: 'USS Renville adalah kapal perang Amerika Serikat yang berlabuh di Teluk Jakarta.' },
  { t: 'agresi', q: 'Ibu kota RI yang diserang Belanda pada Agresi Militer II adalah...', a: ['Yogyakarta', 'Jakarta', 'Bukittinggi', 'Surabaya'], e: 'Saat itu ibu kota RI pindah ke Yogyakarta.' },
  { t: 'agresi', q: 'Pemerintahan Darurat Republik Indonesia (PDRI) dipimpin oleh...', a: ['Sjafruddin Prawiranegara', 'Sutan Syahrir', 'Amir Sjarifuddin', 'Mohammad Natsir'], e: 'PDRI dipimpin Sjafruddin Prawiranegara di Sumatra Barat.' },
  { t: 'agresi', q: 'Saat memimpin perang gerilya, Jenderal Soedirman dalam keadaan...', a: ['Sakit dan ditandu', 'Naik tank', 'Naik kuda putih', 'Berada di luar negeri'], e: 'Soedirman sakit paru-paru tetapi tetap memimpin gerilya sambil ditandu.' },
  { t: 'agresi', q: 'Komisi Tiga Negara terdiri dari Australia, Belgia, dan...', a: ['Amerika Serikat', 'Inggris', 'India', 'Jepang'], e: 'KTN: Australia (pilihan RI), Belgia (pilihan Belanda), Amerika Serikat (pilihan keduanya).' },
  { t: 'agresi', q: 'Perang gerilya adalah cara bertempur dengan...', a: ['Menyerang tiba-tiba dalam kelompok kecil lalu menghilang', 'Bertahan di benteng besar', 'Berperang di laut', 'Berunding di meja bundar'], e: 'Gerilya mengandalkan serangan kilat, penyamaran, dan dukungan rakyat.' },
  { t: 'seranganumum', q: 'Berapa lama TNI menguasai Yogyakarta pada Serangan Umum 1 Maret 1949?', a: ['Sekitar 6 jam', 'Sekitar 6 hari', 'Sekitar 6 bulan', 'Sekitar 6 menit'], e: 'Kota dikuasai sekitar enam jam, cukup untuk membuktikan RI masih ada.' },
  { t: 'seranganumum', q: 'Tujuan utama Serangan Umum 1 Maret 1949 adalah...', a: ['Menunjukkan kepada dunia bahwa RI dan TNI masih ada', 'Merebut Jakarta', 'Mengusir Jepang', 'Membentuk PDRI'], e: 'Belanda mengaku RI sudah lenyap. Serangan ini membantah klaim itu.' },
  { t: 'seranganumum', q: 'Komandan lapangan Serangan Umum 1 Maret adalah...', a: ['Letkol Soeharto', 'Kolonel Soedirman', 'Bung Tomo', 'Letkol Isdiman'], e: 'Letkol Soeharto memimpin serangan di lapangan, didukung Sri Sultan HB IX.' },
  { t: 'kmb', q: 'Konferensi Meja Bundar diadakan di kota...', a: ['Den Haag', 'Jakarta', 'Linggarjati', 'New York'], e: 'KMB berlangsung di Den Haag, Belanda, 23 Agustus – 2 November 1949.' },
  { t: 'kmb', q: 'Belanda menyerahkan kedaulatan kepada Indonesia pada...', a: ['27 Desember 1949', '17 Agustus 1945', '1 Maret 1949', '17 Agustus 1950'], e: 'Penyerahan kedaulatan kepada RIS terjadi pada 27 Desember 1949.' },
  { t: 'kmb', q: 'Ketua delegasi Indonesia di Konferensi Meja Bundar adalah...', a: ['Mohammad Hatta', 'Soekarno', 'Mohammad Roem', 'Sjahrir'], e: 'Mohammad Hatta memimpin delegasi Indonesia di KMB.' },
  { t: 'kmb', q: 'Perundingan yang membuat pemimpin RI dibebaskan pada 1949 adalah...', a: ['Roem-Royen', 'Linggarjati', 'Renville', 'Kalijati'], e: 'Perjanjian Roem-Royen (Mei 1949) membuka jalan ke KMB.' }
];

/* ---------- pengacak sederhana (Math.random cukup untuk soal) ---------- */
function acak(n) { return Math.floor(Math.random() * n); }
function pilihAcak(arr) { return arr[acak(arr.length)]; }
function kocok(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = acak(i + 1); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function angkaID(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }

/* pilihan pengecoh angka: dekat dengan jawaban, unik, positif */
function pengecoh(benar, langkah) {
  var hasil = [benar], coba = [benar + langkah, benar - langkah, benar + 2 * langkah, benar * 2, Math.round(benar / 2), benar + langkah * 3, benar - 2 * langkah];
  for (var i = 0; i < coba.length && hasil.length < 4; i++) if (coba[i] > 0 && hasil.indexOf(coba[i]) < 0) hasil.push(coba[i]);
  while (hasil.length < 4) hasil.push(benar + hasil.length * 7);
  return hasil;
}
function soalAngka(q, benar, langkah, e, satuan) {
  var s = satuan || '';
  return { t: 'mtk', q: q, a: pengecoh(benar, langkah).map(function (v) { return angkaID(v) + s; }), e: e };
}

/* soal matematika bertema medan perang; tingkat 0 = mudah, 1 = sedang, 2 = sulit */
var PEMBUAT_MTK = [
  function (lv) { var a = (2 + acak(8)) * 100 + (lv ? 50 : 0), b = (1 + acak(6)) * 25 * (lv + 1);
    return soalAngka('Kas pejuang berisi ' + angkaID(a) + ' Dana. Truk membawa ' + angkaID(b) + ' Dana lagi. Berapa Dana sekarang?', a + b, 25, a + ' + ' + b + ' = ' + (a + b) + '.'); },
  function (lv) { var n = 2 + acak(lv ? 7 : 4), h = pilihAcak([100, 150, 160, 300]);
    return soalAngka('Satu prajurit butuh ' + h + ' Dana. Berapa Dana untuk melatih ' + n + ' prajurit?', n * h, h, n + ' × ' + h + ' = ' + n * h + '.'); },
  function (lv) { var per = pilihAcak([4, 5, 6, 8]), n = 3 + acak(lv ? 9 : 5);
    return soalAngka(angkaID(per * n) + ' peluru dibagi rata ke ' + per + ' regu. Tiap regu dapat berapa peluru?', n, 1, (per * n) + ' : ' + per + ' = ' + n + '.'); },
  function (lv) { var a = (10 + acak(30)) * 100, b = (2 + acak(8)) * 100; if (b > a) b = a - 100;
    return soalAngka('Dana ' + angkaID(a) + ', lalu dipakai membangun barak seharga ' + angkaID(b) + '. Sisa Dana?', a - b, 100, a + ' − ' + b + ' = ' + (a - b) + '.'); },
  function (lv) { var v = pilihAcak([20, 30, 40, 45, 60]), t = lv ? pilihAcak([2, 3, 1.5, 2.5]) : pilihAcak([2, 3, 4]);
    var j = v * t; return soalAngka('Tank melaju ' + v + ' km/jam selama ' + String(t).replace('.', ',') + ' jam. Berapa km jarak yang ditempuh?', j, 10, 'Jarak = laju × waktu = ' + v + ' × ' + String(t).replace('.', ',') + ' = ' + j + ' km.', ' km'); },
  function (lv) { var p = pilihAcak([10, 20, 25, 50]), b = pilihAcak([400, 800, 1200, 1600, 2000]);
    return soalAngka('Bengkel memberi potongan ' + p + '% untuk tank seharga ' + angkaID(b) + ' Dana. Berapa besar potongannya?', b * p / 100, b / 20, p + '% × ' + b + ' = ' + (b * p / 100) + '.'); },
  function (lv) { var den = pilihAcak([2, 3, 4, 5]), num = 1 + acak(den - 1), tot = den * (4 + acak(lv ? 20 : 8)) * 10;
    return soalAngka(num + '/' + den + ' dari ' + angkaID(tot) + ' pejuang berjaga di garis depan. Berapa orang yang berjaga?', tot / den * num, tot / den / 2 | 0 || 5, tot + ' : ' + den + ' × ' + num + ' = ' + (tot / den * num) + '.'); },
  function (lv) { var awal = pilihAcak([15, 20, 10, 23]), akhir = awal + 2 + acak(5);
    return soalAngka('Pertempuran berlangsung dari tanggal ' + awal + ' sampai ' + akhir + ' (kedua tanggal dihitung). Berapa hari?', akhir - awal + 1, 1, akhir + ' − ' + awal + ' + 1 = ' + (akhir - awal + 1) + ' hari. Tanggal pertama ikut dihitung.', ' hari'); },
  function (lv) { var pasang = pilihAcak([[1945, 1949, 'Proklamasi (1945) sampai pengakuan kedaulatan'], [1942, 1945, 'Jepang datang (1942) sampai Jepang menyerah'], [1945, 2025, 'Proklamasi (1945) sampai tahun 2025'], [1947, 1949, 'Agresi Militer I (1947) sampai KMB']]);
    return soalAngka(pasang[2] + ' berjarak berapa tahun?', pasang[1] - pasang[0], 1, pasang[1] + ' − ' + pasang[0] + ' = ' + (pasang[1] - pasang[0]) + ' tahun.', ' tahun'); },
  function (lv) { var hasil = 100 * (1 + acak(3)), pakai = 20 * (2 + acak(5)), n = 2 + acak(3);
    return soalAngka(n + ' pembangkit masing-masing menghasilkan ' + hasil + ' daya. Pabrik memakai ' + pakai + ' daya. Sisa daya?', n * hasil - pakai, 20, n + ' × ' + hasil + ' − ' + pakai + ' = ' + (n * hasil - pakai) + '.'); },
  function (lv) { if (!lv) return PEMBUAT_MTK[1](lv); var a = 12 + acak(14), b = 11 + acak(9);
    return soalAngka('Ada ' + a + ' baris karung pasir, tiap baris ' + b + ' karung. Berapa karung semuanya?', a * b, 10, a + ' × ' + b + ' = ' + a * b + '.'); },
  function (lv) { var l = 4 + acak(lv ? 12 : 6), p = 5 + acak(lv ? 14 : 6);
    return soalAngka('Pangkalan berbentuk persegi panjang ' + p + ' × ' + l + ' ubin. Berapa ubin luasnya?', p * l, Math.max(2, l), 'Luas = panjang × lebar = ' + p + ' × ' + l + ' = ' + p * l + '.', ' ubin'); }
];

/* ambil satu soal sesuai mode; topik dipakai untuk mendahulukan soal sejarah yang cocok dengan misi */
var _soalTerpakai = {};
function ambilSoal(mode, topik, lv) {
  var pakaiMtk = mode === 'mtk' || (mode === 'campur' && Math.random() < 0.5);
  var s;
  if (pakaiMtk) s = pilihAcak(PEMBUAT_MTK)(lv || 0);
  else {
    var cocok = SOAL_SEJARAH.filter(function (x) { return (!topik || x.t === topik) && !_soalTerpakai[x.q]; });
    if (!cocok.length || Math.random() < 0.35) cocok = SOAL_SEJARAH.filter(function (x) { return !_soalTerpakai[x.q]; });
    if (!cocok.length) { _soalTerpakai = {}; cocok = SOAL_SEJARAH; }
    var asli = pilihAcak(cocok); _soalTerpakai[asli.q] = 1;
    s = { t: asli.t, q: asli.q, a: asli.a, e: asli.e };
  }
  var benar = s.a[0], pil = kocok(s.a);
  return { topik: s.t, q: s.q, pilihan: pil, benar: pil.indexOf(benar), e: s.e };
}
