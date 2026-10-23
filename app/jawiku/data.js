/* ============================================================
   JawiKu — kandungan belajar Jawi (Bahasa Melayu + English)
   37 huruf Jawi mengikut susunan Pedoman Ejaan Jawi.
   sambung:false = huruf yang TIDAK bersambung dengan huruf selepasnya.
   ============================================================ */

const HURUF = [
  { j: 'ا', nama: 'alif',   bunyi: 'a',       sambung: false, contoh: ['ayam', 'ايم'] },
  { j: 'ب', nama: 'ba',     bunyi: 'b',       sambung: true,  contoh: ['buku', 'بوکو'] },
  { j: 'ت', nama: 'ta',     bunyi: 't',       sambung: true,  contoh: ['tikus', 'تيکوس'] },
  { j: 'ث', nama: 'sa',     bunyi: 's (th)',  sambung: true,  contoh: ['Selasa', 'ثلاث'], arab: true },
  { j: 'ج', nama: 'jim',    bunyi: 'j',       sambung: true,  contoh: ['jalan', 'جالن'] },
  { j: 'چ', nama: 'ca',     bunyi: 'c',       sambung: true,  contoh: ['cawan', 'چاون'], jawi: true },
  { j: 'ح', nama: 'ha',     bunyi: 'h',       sambung: true,  contoh: ['haiwan', 'حيوان'], arab: true },
  { j: 'خ', nama: 'kha',    bunyi: 'kh',      sambung: true,  contoh: ['khabar', 'خبر'], arab: true },
  { j: 'د', nama: 'dal',    bunyi: 'd',       sambung: false, contoh: ['dua', 'دوا'] },
  { j: 'ذ', nama: 'zal',    bunyi: 'z (dh)',  sambung: false, contoh: ['zikir', 'ذکير'], arab: true },
  { j: 'ر', nama: 'ra',     bunyi: 'r',       sambung: false, contoh: ['rumah', 'رومه'] },
  { j: 'ز', nama: 'zai',    bunyi: 'z',       sambung: false, contoh: ['zirafah', 'زيرافه'] },
  { j: 'س', nama: 'sin',    bunyi: 's',       sambung: true,  contoh: ['satu', 'ساتو'] },
  { j: 'ش', nama: 'syin',   bunyi: 'sy',      sambung: true,  contoh: ['syarikat', 'شريکت'] },
  { j: 'ص', nama: 'sad',    bunyi: 's',       sambung: true,  contoh: ['sabun', 'صابون'], arab: true },
  { j: 'ض', nama: 'dad',    bunyi: 'd',       sambung: true,  contoh: ['reda', 'رضا'], arab: true },
  { j: 'ط', nama: 'ta',     bunyi: 't',       sambung: true,  contoh: ['sultan', 'سلطان'], arab: true },
  { j: 'ظ', nama: 'za',     bunyi: 'z',       sambung: true,  contoh: ['zalim', 'ظالم'], arab: true },
  { j: 'ع', nama: 'ain',    bunyi: 'a / \'',  sambung: true,  contoh: ['Arab', 'عرب'], arab: true },
  { j: 'غ', nama: 'ghain',  bunyi: 'gh',      sambung: true,  contoh: ['maghrib', 'مغرب'], arab: true },
  { j: 'ڠ', nama: 'nga',    bunyi: 'ng',      sambung: true,  contoh: ['bunga', 'بوڠا'], jawi: true },
  { j: 'ف', nama: 'fa',     bunyi: 'f',       sambung: true,  contoh: ['fikir', 'فيکير'] },
  { j: 'ڤ', nama: 'pa',     bunyi: 'p',       sambung: true,  contoh: ['padi', 'ڤادي'], jawi: true },
  { j: 'ق', nama: 'qaf',    bunyi: 'q / k',   sambung: true,  contoh: ['emak', 'امق'] },
  { j: 'ک', nama: 'kaf',    bunyi: 'k',       sambung: true,  contoh: ['kaki', 'کاکي'] },
  { j: 'ݢ', nama: 'ga',     bunyi: 'g',       sambung: true,  contoh: ['gigi', 'ݢيݢي'], jawi: true },
  { j: 'ل', nama: 'lam',    bunyi: 'l',       sambung: true,  contoh: ['lima', 'ليم'] },
  { j: 'م', nama: 'mim',    bunyi: 'm',       sambung: true,  contoh: ['mata', 'مات'] },
  { j: 'ن', nama: 'nun',    bunyi: 'n',       sambung: true,  contoh: ['nasi', 'ناسي'] },
  { j: 'و', nama: 'wau',    bunyi: 'w / u / o', sambung: false, contoh: ['wang', 'واڠ'] },
  { j: 'ۏ', nama: 'va',     bunyi: 'v',       sambung: false, contoh: ['vitamin', 'ۏيتامين'], jawi: true },
  { j: 'ه', nama: 'ha',     bunyi: 'h',       sambung: true,  contoh: ['hari', 'هاري'] },
  { j: 'ء', nama: 'hamzah', bunyi: '\'',      sambung: false, contoh: ['air', 'اءير'] },
  { j: 'ي', nama: 'ya',     bunyi: 'y / i / e', sambung: true, contoh: ['kayu', 'کايو'] },
  { j: 'ى', nama: 'ye',     bunyi: 'e (akhir)', sambung: false, contoh: ['sate', 'ساتى'] },
  { j: 'ڽ', nama: 'nya',    bunyi: 'ny',      sambung: true,  contoh: ['nyanyi', 'ڽاڽي'], jawi: true }
];

/* kamus perkataan: [rumi, jawi, kategori, english] */
const KAMUS = [
  ['saya', 'ساي', 'diri', 'I / me'], ['kamu', 'کامو', 'diri', 'you'],
  ['ibu', 'ايبو', 'keluarga', 'mother'], ['bapa', 'باڤ', 'keluarga', 'father'], ['emak', 'امق', 'keluarga', 'mum'],
  ['adik', 'اديق', 'keluarga', 'younger sibling'], ['kakak', 'کاکق', 'keluarga', 'older sister'], ['abang', 'اباڠ', 'keluarga', 'older brother'],
  ['kucing', 'کوچيڠ', 'haiwan', 'cat'], ['ikan', 'ايکن', 'haiwan', 'fish'], ['burung', 'بوروڠ', 'haiwan', 'bird'], ['ayam', 'ايم', 'haiwan', 'chicken'], ['tikus', 'تيکوس', 'haiwan', 'mouse'],
  ['nasi', 'ناسي', 'makanan', 'rice'], ['air', 'اءير', 'makanan', 'water'], ['makan', 'ماکن', 'makanan', 'eat'], ['minum', 'مينوم', 'makanan', 'drink'], ['sate', 'ساتى', 'makanan', 'satay'],
  ['buku', 'بوکو', 'sekolah', 'book'], ['guru', 'ݢورو', 'sekolah', 'teacher'], ['sekolah', 'سکوله', 'sekolah', 'school'], ['meja', 'ميجا', 'sekolah', 'table'], ['kerusi', 'کروسي', 'sekolah', 'chair'], ['pensel', 'ڤنسيل', 'sekolah', 'pencil'],
  ['satu', 'ساتو', 'nombor', 'one'], ['dua', 'دوا', 'nombor', 'two'], ['tiga', 'تيݢ', 'nombor', 'three'], ['lima', 'ليم', 'nombor', 'five'],
  ['rumah', 'رومه', 'alam', 'house'], ['bunga', 'بوڠا', 'alam', 'flower'], ['mata', 'مات', 'alam', 'eye'], ['kaki', 'کاکي', 'alam', 'leg / foot'], ['payung', 'ڤايوڠ', 'alam', 'umbrella'], ['bola', 'بولا', 'alam', 'ball'], ['kereta', 'کريتا', 'alam', 'car'],
  ['selamat', 'سلامت', 'ucapan', 'safe / greetings'], ['pagi', 'ڤاݢي', 'ucapan', 'morning'], ['terima kasih', 'تريما کاسيه', 'ucapan', 'thank you'], ['Malaysia', 'مليسيا', 'ucapan', 'Malaysia']
];

const KATEGORI = [
  { id: 'huruf',    ms: 'Huruf',      en: 'Letters',   ikon: 'huruf',  warna: 'biru' },
  { id: 'sukukata', ms: 'Suku kata',  en: 'Syllables', ikon: 'blok',   warna: 'kuning' },
  { id: 'perkataan',ms: 'Perkataan',  en: 'Words',     ikon: 'buku',   warna: 'hijau' },
  { id: 'surih',    ms: 'Surih',      en: 'Trace',     ikon: 'pensel', warna: 'merah' },
  { id: 'kuiz',     ms: 'Kuiz',       en: 'Quiz',      ikon: 'bintang',warna: 'oren' }
];
const KAT_KAMUS = {
  diri: ['Diri', 'Me'], keluarga: ['Keluarga', 'Family'], haiwan: ['Haiwan', 'Animals'], makanan: ['Makanan', 'Food'],
  sekolah: ['Sekolah', 'School'], nombor: ['Nombor', 'Numbers'], alam: ['Sekeliling', 'Around me'], ucapan: ['Ucapan', 'Greetings']
};

/* pelajaran suku kata terbuka: konsonan + alif (a), ya (i/e), wau (u/o) */
const SUKU = ['ب', 'ت', 'ج', 'چ', 'د', 'ر', 'س', 'ک', 'ݢ', 'ل', 'م', 'ن', 'ڤ'];
const SUKU_RUMI = { 'ب': 'b', 'ت': 't', 'ج': 'j', 'چ': 'c', 'د': 'd', 'ر': 'r', 'س': 's', 'ک': 'k', 'ݢ': 'g', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ڤ': 'p' };

const FAQ = [
  { s: ['Apa itu tulisan Jawi?', 'What is Jawi script?'], j: ['Jawi ialah tulisan berasaskan huruf Arab yang digunakan untuk menulis bahasa Melayu sejak ratusan tahun dahulu.', 'Jawi is an Arabic-based script used to write the Malay language for hundreds of years.'] },
  { s: ['Ke arah mana Jawi ditulis?', 'Which direction is Jawi written?'], j: ['Dari kanan ke kiri, sama seperti tulisan Arab.', 'From right to left, just like Arabic.'] },
  { s: ['Berapa banyak huruf Jawi?', 'How many Jawi letters are there?'], j: ['Ada 37 huruf: huruf Arab ditambah huruf ciptaan Melayu seperti چ ڠ ڤ ݢ ۏ ڽ.', 'There are 37 letters: Arabic letters plus Malay additions such as چ ڠ ڤ ݢ ۏ ڽ.'] },
  { s: ['Kenapa huruf berubah bentuk?', 'Why do letters change shape?'], j: ['Huruf bersambung dengan huruf di sebelahnya, jadi bentuknya berbeza di awal, tengah dan akhir perkataan.', 'Letters join to their neighbours, so their shape differs at the start, middle and end of a word.'] },
  { s: ['Huruf mana yang tidak bersambung?', 'Which letters do not join?'], j: ['ا د ذ ر ز و ۏ ء ى tidak bersambung dengan huruf selepasnya.', 'ا د ذ ر ز و ۏ ء ى never join to the letter after them.'] }
];

/* teks antara muka: [Bahasa Melayu, English] */
const UI = {
  mula: ['Mula Sekarang', 'Get Started'], cipta: ['Cipta Akaun', 'Create Account'], google: ['Teruskan dengan Google', 'Continue with Google'],
  masuk: ['Log masuk', 'Log in'], ciptaBaru: ['Cipta Akaun Baharu', 'Create a New Account'], sudahAda: ['Saya Sudah Ada Akaun', 'I Already Have an Account'],
  ciptaJ: ['Cipta akaun\nanda', 'Create your\naccount'], masukJ: ['Log masuk ke\nakaun anda', 'Log in to your\naccount'], lupaJ: ['Lupa kata laluan', 'Forgot password'],
  lupaS: ['Masukkan e-mel anda untuk menerima pautan menetapkan semula kata laluan.', 'Enter your email to receive a link to create a new password.'],
  hantar: ['Hantar', 'Send'], lupa: ['Lupa?', 'Forgot?'], nama: ['Nama pengguna', 'Username'], emel: ['E-mel', 'Email'], laluan: ['Kata laluan', 'Password'], umur: ['Umur', 'Age'],
  terma: ['Dengan mendaftar, anda bersetuju dengan Terma & Syarat kami.', 'By signing up you agree to our Terms and Conditions.'],
  sudahAkun: ['Sudah ada akaun?', 'Already have an account?'], belumAkun: ['Belum ada akaun?', 'Don\'t have an account?'], daftar: ['Daftar', 'Sign up'],
  tahap: ['Tahap anda', 'Your level'], cari: ['Cari huruf atau perkataan', 'Search letters or words'],
  popular: ['Pilihan Popular', 'Popular Choices'], baharu: ['Pelajaran Baharu', 'New Lessons'], lihat: ['Lihat semua', 'See all'],
  cabaran: ['Cabaran Hari Ini', 'Today\'s Challenge'], semuaHuruf: ['Semua Huruf', 'All Letters'],
  bentuk: ['Bentuk huruf', 'Letter forms'], tunggal: ['Tunggal', 'Alone'], awal: ['Awal', 'Start'], tengah: ['Tengah', 'Middle'], akhir: ['Akhir', 'End'],
  contoh: ['Contoh perkataan', 'Example words'], tambahBeg: ['Tambah ke beg latihan', 'Add to practice bag'],
  beg: ['Beg Latihan', 'Practice Bag'], begKosong: ['Beg latihan kosong', 'Your bag is empty'], begKosongS: ['Tambah huruf dan perkataan untuk dilatih.', 'Add letters and words to practise.'],
  mulaKuiz: ['Mula kuiz', 'Start quiz'], sedia: ['Sedia untuk kuiz', 'Ready for the quiz'], ringkasan: ['Ringkasan', 'Summary'],
  tahniah: ['Tahniah!', 'Well done!'], jejak: ['Lihat perjalanan', 'Track my progress'], lagi: ['Belajar lagi', 'Learn something else'],
  perjalanan: ['Perjalanan Belajar', 'Learning Journey'], masaHari: ['Masa belajar hari ini', 'Time learned today'],
  surih: ['Surih Huruf', 'Trace the Letter'], padam: ['Padam', 'Clear'], semak: ['Semak', 'Check'],
  bantuan: ['Bantuan', 'Support'], sembangJ: ['Sembang dengan\nCikgu Jawi', 'Chat with\nTeacher Jawi'], soalan: ['Soalan lazim', 'Frequently asked questions'],
  tapis: ['Tapis', 'Filters'], susun: ['Susun ikut', 'Sort by'], set: ['Set semula', 'Reset'], guna: ['Guna', 'Apply'],
  profil: ['Profil', 'Profile'], bahasa: ['Bahasa', 'Language'], sejarah: ['Sejarah kuiz', 'Quiz history'], tetapan: ['Tetapan', 'Settings'], tentang: ['Tentang JawiKu', 'About JawiKu'], keluar: ['Log keluar', 'Log out'],
  utama: ['Utama', 'Home'], belajar: ['Belajar', 'Learn'], akaun: ['Akaun', 'Account'], kamus: ['Kamus', 'Dictionary'],
  terkini: ['Carian terkini', 'Recent searches'], taip: ['Taip dalam Jawi…', 'Type in Jawi…'], taipRumi: ['Tulis perkataan rumi…', 'Type a Rumi word…']
};
