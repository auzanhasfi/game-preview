/* Misi Detektif Nyamuk: warna, ikon tambahan, dan SEMUA kandungan pelajaran (BM).
   Ubah teks pelajaran di sini sahaja. Rujukan: Pendidikan Kesihatan Tahun 3, Unit 6.0 Penyakit, SP 6.1.1–6.1.3 (buku teks hlm. 82–85). */
'use strict';

var INK = '#2e2620', PAPER = '#efebe2', PAPER2 = '#faf8f2', GOLD = '#e2a93b', CL = '#d8714f', CL_H = '#a94c33', NAVY = '#2c3e6b', PLUM = '#5a2d58', SKY = '#6fa8dc';
var DENG = '#d6496a', MAL = '#1f8f8a', DUA = '#7a5bc7', HIJAU = '#6fa83c', AIR = '#7fb8d9';

/* ikon tambahan gaya sama (kotak 24, garis 1.75) */
ICONS.search = cir(11, 11, 7) + 'M21 21l-4.6-4.6';
ICONS.notebook = 'M5 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5zM9 3v18M12 8h4M12 12h4';
ICONS.pin = 'M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z' + cir(12, 10, 2.5);
ICONS.house = 'M3 11l9-8 9 8M5 9.5V21h14V9.5M10 21v-6h4v6';
ICONS.clinic = 'M4 21V7l8-4 8 4v14zM12 9v6M9 12h6M2 21h20';
ICONS.sun = cir(12, 12, 4) + 'M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4';
ICONS.moon = 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z';
ICONS.bug = 'M9 7a3 3 0 0 1 6 0M8 9h8v5a4 4 0 0 1-8 0zM12 9v9M3 12h5M16 12h5M4 7l4 3M20 7l-4 3M4 18l4-2M20 18l-4-2';
ICONS.people = cir(9, 7, 3.5) + 'M2 21v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1M16 3.5a3.5 3.5 0 0 1 0 7M19 15a5 5 0 0 1 3 4.6V21';
ICONS.thermo = 'M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0zM12 9v7';
ICONS.image = 'M4 4h16v16H4zM4 16l5-5 4 4 2-2 5 5' + cir(15.5, 8.5, 1.5);
ICONS.download = 'M12 3v12M7 10l5 5 5-5M4 21h16';
ICONS.arrowR = 'M5 12h14M13 6l6 6-6 6';
ICONS.refresh = 'M3 12a9 9 0 0 1 15.4-6.4L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.4 6.4L3 16M3 21v-5h5';
ICONS.eye = 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z' + cir(12, 12, 3);
ICONS.textsize = 'M4 20 9 6l5 14M5.8 15h6.4M15 20l3-8 3 8M15.8 18h4.4';

/* ---------- 6 stesen di peta (urutan = urutan Tahap Penguasaan) ---------- */
var STESEN = [
  {
    id: 'kenal', nama: 'Rumah Mira', misi: 'Kenal Si Penggigit', tp: 'TP1', sp: '6.1.1', ikon: 'house', x: 430, y: 300,
    pembuka: 'Mira, 9 tahun, demam panas sejak semalam. Di biliknya ada dua ekor nyamuk. Detektif, siapakah mereka?',
    kad: [
      { seni: 'duaNyamuk', tajuk: 'Dua suspek', teks: 'Penyakit bawaan nyamuk ialah penyakit yang disebarkan melalui gigitan nyamuk. Di Malaysia, dua yang paling penting ialah demam denggi dan demam malaria.', dedah: [['Demam denggi', 'dibawa oleh nyamuk Aedes betina'], ['Demam malaria', 'dibawa oleh nyamuk tiruk betina']] },
      { seni: 'aedes', tajuk: 'Suspek 1: Nyamuk Aedes', teks: 'Ketik kanta pada setiap petunjuk untuk melihat ciri nyamuk Aedes.', dedah: [['Badan', 'hitam dengan belang putih'], ['Kaki', 'berbelang hitam putih'], ['Masa menggigit', 'waktu siang, terutama pagi dan petang'], ['Penyakit', 'membawa virus denggi']] },
      { seni: 'tiruk', tajuk: 'Suspek 2: Nyamuk tiruk', teks: 'Nama lainnya nyamuk Anopheles. Ketik kanta pada setiap petunjuk.', dedah: [['Badan', 'perang keabu-abuan, tiada belang putih'], ['Cara hinggap', 'badan menunduk, bahagian belakang terangkat'], ['Masa menggigit', 'waktu malam'], ['Penyakit', 'membawa parasit malaria']] },
      { seni: 'betina', tajuk: 'Kenapa betina sahaja?', teks: 'Hanya nyamuk betina menghisap darah. Darah diperlukan untuk menghasilkan telur. Nyamuk jantan hanya minum air manis daripada bunga.', dedah: [['Nyamuk betina', 'menghisap darah untuk bertelur'], ['Nyamuk jantan', 'minum madu bunga, tidak menggigit']] }
    ],
    bukti: 'Nyamuk berkaki belang putih ditemui di bilik Mira pada waktu petang. Suspek utama: nyamuk Aedes.'
  },
  {
    id: 'rantai', nama: 'Klinik Desa', misi: 'Rantai Jangkitan', tp: 'TP2', sp: '6.1.1', ikon: 'clinic', x: 1120, y: 260,
    pembuka: 'Jururawat Lina berkata minggu lepas jiran Mira, Pak Abu, juga demam. Bagaimana penyakit berpindah dari Pak Abu kepada Mira?',
    kad: [
      { seni: 'tidakTerus', tajuk: 'Bukan berjangkit terus', teks: 'Demam denggi dan malaria tidak berjangkit melalui bersalaman, batuk atau berkongsi makanan. Penyakit ini merebak hanya melalui gigitan nyamuk.', dedah: [['Bersalaman', 'tidak menjangkiti'], ['Gigitan nyamuk', 'cara penyakit merebak']] },
      { seni: 'kuman', tajuk: 'Apa yang dibawa?', teks: 'Nyamuk ialah "kenderaan". Penumpangnya ialah kuman yang sangat kecil.', dedah: [['Demam denggi', 'disebabkan oleh VIRUS denggi'], ['Demam malaria', 'disebabkan oleh PARASIT malaria']] },
      { seni: 'rantai', tajuk: 'Langkah demi langkah', teks: 'Tekan Main untuk melihat bagaimana kuman berpindah. Perhatikan nyamuk itu.', anim: 'rantai', dedah: [['Langkah 1', 'nyamuk betina menggigit pesakit'], ['Langkah 2', 'kuman masuk ke dalam badan nyamuk'], ['Langkah 3', 'nyamuk menggigit orang yang sihat'], ['Langkah 4', 'orang sihat dijangkiti dan jatuh sakit selepas beberapa hari']] }
    ],
    bukti: 'Nyamuk menggigit Pak Abu yang sakit, kemudian terbang ke rumah Mira dan menggigitnya. Rantai jangkitan terbukti.'
  },
  {
    id: 'simptom', nama: 'Klinik Simptom', misi: 'Klinik Simptom', tp: 'TP1 + TP4', sp: '6.1.1', ikon: 'thermo', x: 1340, y: 640,
    pembuka: 'Dr. Siti ada tiga pesakit hari ini. Semuanya demam. Bantu doktor membezakan demam denggi dan demam malaria.',
    kad: [
      { seni: 'simptomD', tajuk: 'Simptom demam denggi', teks: 'Simptom ialah apa yang pesakit rasa atau nampak pada badannya.', dedah: [['Demam panas', 'datang secara mengejut'], ['Sakit kepala', 'dan sakit biji mata'], ['Sakit sendi', 'dan sakit tulang belakang'], ['Ruam pada kulit', 'bintik merah'], ['Loya, muntah', 'atau cirit-birit']] },
      { seni: 'simptomM', tajuk: 'Simptom demam malaria', teks: 'Malaria pula ada ciri yang berbeza.', dedah: [['Demam panas', 'datang dan pergi'], ['Menggigil', 'rasa sangat sejuk kemudian panas'], ['Sakit kepala', ''], ['Letih dan pucat', 'tiada tenaga'], ['Loya dan muntah', ''], ['Meracau', 'bercakap merepek ketika demam tinggi']] },
      { seni: 'venn', tajuk: 'Petunjuk yang membezakan', teks: 'Demam panas, sakit kepala dan muntah ada pada KEDUA-DUA penyakit. Jadi detektif mesti cari petunjuk lain.', dedah: [['Ruam + sakit sendi', 'petunjuk demam denggi'], ['Menggigil + meracau', 'petunjuk demam malaria'], ['Demam, sakit kepala, muntah', 'ada pada kedua-duanya']] },
      { seni: 'klinik', tajuk: 'Bila demam, ke klinik', teks: 'Hanya doktor boleh mengesahkan penyakit dengan ujian darah. Jika demam, beritahu ibu bapa dan pergi ke klinik.', dedah: [['Minum banyak air', 'supaya badan tidak kering'], ['Jangan ambil ubat sendiri', 'ikut nasihat doktor']] }
    ],
    bukti: 'Mira ada ruam pada kulit dan sakit sendi, tetapi tidak menggigil. Diagnosis Dr. Siti: demam denggi.'
  },
  {
    id: 'ronda', nama: 'Laman Belakang', misi: 'Ronda Rumah', tp: 'TP3', sp: '6.1.2', ikon: 'drop', x: 760, y: 820,
    pembuka: 'Di mana nyamuk Aedes itu membiak? Kita perlu meronda laman belakang rumah Mira.',
    kad: [
      { seni: 'kitaran', tajuk: 'Kitaran hidup nyamuk', teks: 'Nyamuk membiak di dalam air yang bertakung. Dari telur menjadi nyamuk dewasa hanya mengambil masa kira-kira 7 hingga 10 hari.', dedah: [['Telur', 'diletak di tepi air'], ['Jentik-jentik', 'hidup dalam air'], ['Pupa', 'berehat dalam air'], ['Nyamuk dewasa', 'terbang keluar']] },
      { seni: 'tempat', tajuk: 'Tempat kegemaran', teks: 'Setiap nyamuk ada tempat membiak kegemaran.', dedah: [['Aedes', 'air bersih dalam bekas: pasu bunga, tayar lama, tin, tempayan'], ['Tiruk', 'air di paya, sawah, kolam dan alur sungai']] },
      { seni: 'cegah', tajuk: 'Lima cara mencegah', teks: 'Daripada buku teks: cara-cara mencegah pembiakan nyamuk.', dedah: [['Tanam', 'bekas yang menakung air'], ['Tutup', 'bekas yang mengandungi air'], ['Bersihkan', 'bekas takungan air'], ['Tutup', 'tong sampah'], ['Pengabutan (fogging)', 'dibuat oleh pegawai kesihatan, bukan murid']] },
      { seni: 'diri', tajuk: 'Lindungi diri', teks: 'Selain memusnahkan tempat membiak, kita juga boleh elak digigit.', dedah: [['Pakai baju', 'berlengan panjang'], ['Losen', 'penghalau nyamuk (dengan bantuan orang dewasa)'], ['Kelambu', 'ketika tidur, terutama di kawasan malaria'], ['10 minit seminggu', 'cari dan musnah tempat pembiakan bersama keluarga']] }
    ],
    bukti: 'Pasu bunga dan tayar lama di laman Mira berisi jentik-jentik. Tempat pembiakan Aedes ditemui dan dimusnahkan.'
  },
  {
    id: 'cerita', nama: 'Rumah Pak Abu', misi: 'Apa Akan Jadi?', tp: 'TP5', sp: '6.1.2', ikon: 'people', x: 230, y: 760,
    pembuka: 'Cucu Pak Abu, Adam, kini demam pula. Pilihan keluarga ini akan mengubah apa yang berlaku. Ramalkan kesannya.',
    kad: [
      { seni: 'kesan', tajuk: 'Kesan berlapis', teks: 'Apabila seorang jatuh sakit, kesannya bukan pada dirinya sahaja.', dedah: [['Diri sendiri', 'sakit, lemah, tidak dapat ke sekolah'], ['Keluarga', 'risau, ibu bapa ambil cuti, belanja ke klinik'], ['Jiran dan komuniti', 'nyamuk boleh menjangkiti lebih ramai orang']] },
      { seni: 'bahaya', tajuk: 'Kenapa tidak boleh tunggu?', teks: 'Demam denggi dan malaria boleh menjadi teruk jika lambat dirawat. Rawatan awal di klinik membantu pesakit pulih.', dedah: [['Rawat awal', 'cepat pulih'], ['Lambat dirawat', 'boleh jadi teruk dan perlu ke hospital']] }
    ],
    bukti: 'Keluarga Pak Abu membawa Adam ke klinik dengan segera dan membersihkan bekas air. Jiran lain selamat.'
  },
  {
    id: 'poster', nama: 'Balai Raya', misi: 'Studio Poster', tp: 'TP6', sp: '6.1.3', ikon: 'image', x: 1160, y: 980,
    pembuka: 'Kes hampir selesai! Penduduk Taman Seri Bersih mesti tahu cara mencegah nyamuk. Cipta poster untuk ditampal di balai raya.',
    kad: [
      { seni: 'posterBaik', tajuk: 'Poster yang berkesan', teks: 'Poster yang baik boleh dibaca dari jauh dalam masa 5 saat.', dedah: [['Tajuk', 'pendek dan jelas'], ['Gambar', 'satu gambar besar yang mudah faham'], ['Langkah', '3 tindakan yang betul'], ['Warna', 'kontras, tulisan senang dibaca']] }
    ],
    bukti: 'Poster pencegahan sudah ditampal. Penduduk taman tahu cara menghapuskan tempat pembiakan nyamuk.'
  }
];

/* ---------- mini 1: siapa ini? ---------- */
var KENAL = [
  { petunjuk: 'Kakinya berbelang hitam putih.', jawapan: 'aedes', seni: 'aedes' },
  { petunjuk: 'Ia hinggap dengan badan menunduk dan bahagian belakang terangkat.', jawapan: 'tiruk', seni: 'tiruk' },
  { petunjuk: 'Ia menggigit Mira pada waktu petang ketika Mira membuat kerja sekolah.', jawapan: 'aedes', seni: 'siang' },
  { petunjuk: 'Ia membawa parasit malaria dan menggigit pada waktu malam.', jawapan: 'tiruk', seni: 'malam' },
  { petunjuk: 'Ia membawa virus denggi.', jawapan: 'aedes', seni: 'kuman' }
];

/* ---------- mini 2: susun rantai ---------- */
var RANTAI = [
  'Nyamuk betina menggigit Pak Abu yang sedang sakit.',
  'Virus denggi masuk ke dalam badan nyamuk.',
  'Nyamuk terbang ke rumah Mira dan menggigit Mira yang sihat.',
  'Mira dijangkiti dan demam selepas beberapa hari.'
];

/* ---------- mini 3: pesakit ---------- */
var PESAKIT = [
  { nama: 'Mira', umur: 9, kad: [['Ruam pada kulit', 'd'], ['Sakit sendi', 'd'], ['Demam panas', 'k'], ['Sakit biji mata', 'd']], jawapan: 'd' },
  { nama: 'Encik Ravi', umur: 35, kad: [['Menggigil', 'm'], ['Demam panas', 'k'], ['Letih dan pucat', 'm'], ['Sakit kepala', 'k']], jawapan: 'm', cerita: 'Baru pulang dari bekerja di kebun dekat hutan.' },
  { nama: 'Adam', umur: 7, kad: [['Loya dan muntah', 'k'], ['Sakit tulang belakang', 'd'], ['Ruam pada kulit', 'd'], ['Demam panas', 'k']], jawapan: 'd' }
];

/* ---------- mini 4: ronda laman (x, y dalam peratus pemandangan) ---------- */
var TINDAKAN = { tanam: 'Tanam / buang', tutup: 'Tutup', bersih: 'Bersihkan', lapor: 'Laporkan kepada orang dewasa' };
var RONDA = [
  { id: 'pasu', nama: 'Piring pasu bunga', x: 18, y: 70, betul: 'bersih', sebab: 'Air dalam piring pasu perlu dibuang dan piring dibersihkan setiap minggu.' },
  { id: 'tayar', nama: 'Tayar lama', x: 74, y: 76, betul: 'tanam', sebab: 'Tayar lama perlu dibuang atau disimpan di tempat kering supaya tidak menakung air hujan.' },
  { id: 'tempayan', nama: 'Tempayan air', x: 44, y: 62, betul: 'tutup', sebab: 'Tempayan yang menyimpan air mesti ditutup rapat supaya nyamuk tidak boleh bertelur.' },
  { id: 'tin', nama: 'Tin dan bekas plastik kosong', x: 60, y: 86, betul: 'tanam', sebab: 'Bekas kosong ditanam atau dibuang ke dalam tong sampah bertutup.' },
  { id: 'tong', nama: 'Tong sampah terbuka', x: 88, y: 58, betul: 'tutup', sebab: 'Tong sampah mesti sentiasa ditutup.' },
  { id: 'longkang', nama: 'Longkang tersumbat', x: 30, y: 90, betul: 'lapor', sebab: 'Longkang yang tersumbat dan kawasan besar perlu dilaporkan kepada orang dewasa atau pihak berkuasa.' }
];

/* ---------- mini 5: cerita bercabang ---------- */
var CERITA = {
  mula: { seni: 'adamDemam', teks: 'Adam demam panas sejak pagi. Nenek kata, "Tunggu sahaja, esok baiklah." Apa yang patut keluarga Adam buat?', pilih: [['Tunggu di rumah beberapa hari', 'tunggu'], ['Bawa Adam ke klinik dengan segera', 'klinik']] },
  tunggu: { seni: 'adamLemah', teks: 'Dua hari kemudian Adam sangat lemah dan muntah. Ayah terpaksa ambil cuti, kakak Adam tidak ke sekolah untuk menjaganya. Adam perlu dibawa ke hospital.', ramal: 'Ramalan: lambat dirawat membuat penyakit lebih teruk dan menyusahkan seluruh keluarga.', pilih: [['Undur masa dan pilih semula', 'mula']] },
  klinik: { seni: 'klinik', teks: 'Doktor membuat ujian darah. Adam disahkan demam denggi tahap awal. Adam berehat dan minum banyak air. Di rumah, ada tempayan tanpa penutup. Apa yang patut dibuat?', pilih: [['Biarkan, tempayan itu sudah lama di situ', 'biar'], ['Tutup tempayan dan bersihkan laman', 'bersih']] },
  biar: { seni: 'jiranSakit', teks: 'Seminggu kemudian, dua orang jiran pula demam denggi. Nyamuk terus membiak dalam tempayan itu.', ramal: 'Ramalan: tempat pembiakan yang dibiarkan menjangkiti jiran dan komuniti.', pilih: [['Undur masa dan pilih semula', 'klinik']] },
  bersih: { seni: 'tamanSelamat', teks: 'Adam pulih dan kembali ke sekolah. Tiada lagi kes baharu di taman. Pak Abu mengajak jiran bergotong-royong setiap Sabtu.', ramal: 'Ramalan: tindakan cepat melindungi diri, keluarga dan jiran.', tamat: true }
};
var KESAN = [
  ['Tidak dapat ke sekolah', 'diri'], ['Badan lemah dan sakit', 'diri'], ['Ibu bapa ambil cuti kerja', 'keluarga'],
  ['Keluarga risau dan berbelanja ke klinik', 'keluarga'], ['Jiran turut dijangkiti', 'komuniti'], ['Klinik penuh dengan pesakit', 'komuniti']
];

/* ---------- mini 6: poster ---------- */
var POSTER_TAJUK = ['Tiada Nyamuk, Tiada Penyakit', 'Jom Cari dan Musnah!', 'Lawan Denggi Bersama'];
var POSTER_LANGKAH = [
  ['Tutup bekas yang mengandungi air', 1], ['Tanam bekas yang menakung air', 1], ['Bersihkan bekas takungan air setiap minggu', 1],
  ['Tutup tong sampah', 1], ['Simpan air dalam bekas terbuka', 0, 'Bekas terbuka menjadi tempat nyamuk bertelur.'],
  ['Biarkan tayar lama di luar rumah', 0, 'Tayar lama menakung air hujan.'], ['Pakai baju berlengan panjang', 1]
];
var POSTER_WARNA = [['#f6d34a', '#2e2620'], ['#1f8f8a', '#ffffff'], ['#d6496a', '#ffffff'], ['#2c3e6b', '#f6d34a']];

/* ---------- akhir: Uji Minda (bentuk buku teks hlm. 85) ---------- */
var UJI = [
  { s: 'Nyamuk berbelang hitam putih ini membawa penyakit apa?', seni: 'aedes', p: ['Demam denggi', 'Demam malaria', 'Selesema'], j: 0, nota: 'Nyamuk Aedes betina membawa virus denggi.' },
  { s: 'Nyamuk tiruk betina membawa penyakit apa?', seni: 'tiruk', p: ['Demam denggi', 'Demam malaria', 'Cacar air'], j: 1, nota: 'Nyamuk tiruk betina membawa parasit malaria.' },
  { s: 'Bagaimanakah demam denggi merebak?', p: ['Bersalaman dengan pesakit', 'Gigitan nyamuk Aedes pembawa virus', 'Makan makanan pedas'], j: 1, nota: 'Denggi merebak melalui gigitan nyamuk Aedes yang membawa virus.' },
  { s: 'Simptom manakah petunjuk demam MALARIA?', p: ['Ruam pada kulit', 'Menggigil', 'Sakit sendi'], j: 1, nota: 'Menggigil ialah petunjuk malaria. Ruam dan sakit sendi petunjuk denggi.' },
  { s: 'Simptom manakah ada pada KEDUA-DUA penyakit?', p: ['Demam panas', 'Meracau', 'Ruam pada kulit'], j: 0, nota: 'Demam panas ada pada demam denggi dan demam malaria.' },
  { s: 'Kamu nampak tayar lama berisi air hujan. Apa tindakan kamu?', seni: 'tayar', p: ['Biarkan sahaja', 'Buang air dan simpan tayar di tempat kering', 'Tambah lagi air'], j: 1, nota: 'Tayar yang menakung air menjadi tempat pembiakan Aedes.' },
  { s: 'Siapakah yang membuat pengabutan (fogging)?', p: ['Murid sekolah', 'Pegawai kesihatan', 'Nyamuk jantan'], j: 1, nota: 'Pengabutan dibuat oleh pegawai kesihatan dengan alat khas.' },
  { s: 'Kawan kamu demam denggi dan tidak ke sekolah seminggu. Apakah kesannya kepada dirinya?', p: ['Ketinggalan pelajaran', 'Jadi lebih kuat', 'Tiada apa-apa kesan'], j: 0, nota: 'Pesakit ketinggalan pelajaran dan keluarganya turut terkesan.' }
];

/* fakta ringkas yang muncul semasa meronda peta */
var FAKTA = [
  'Hanya nyamuk betina menghisap darah.', 'Aedes menggigit pada waktu pagi dan petang.', 'Tiruk menggigit pada waktu malam.',
  'Telur nyamuk menjadi nyamuk dewasa dalam 7 hingga 10 hari.', 'Satu penutup tin botol pun boleh menakung air untuk jentik-jentik.',
  'Menggigil ialah petunjuk demam malaria.', 'Ruam pada kulit ialah petunjuk demam denggi.', 'Demam? Beritahu ibu bapa dan pergi ke klinik.'
];
