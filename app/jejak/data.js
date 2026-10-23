/* ============================================================
   jejak. — kandungan Sejarah Malaysia (Bahasa Melayu)
   Penanda dalam perenggan:
     {{istilah}}  -> boleh diketuk, makna diambil dari GLOSARI
   ============================================================ */

const GLOSARI = {
  'prasejarah': 'Zaman sebelum manusia meninggalkan catatan bertulis. Kita mengenalinya melalui artifak, rangka dan tapak arkeologi.',
  'arkeologi': 'Kajian tentang masa lalu manusia melalui tinggalan fizikal seperti alat, binaan dan rangka.',
  'candi': 'Binaan keagamaan Hindu-Buddha yang diperbuat daripada batu atau bata.',
  'talasokrasi': 'Kerajaan yang kekuatannya bersandar pada penguasaan laut dan laluan perdagangan, bukan wilayah daratan.',
  'entrepot': 'Pelabuhan persinggahan tempat barang dikumpul, disimpan dan diedarkan semula kepada pedagang lain.',
  'syahbandar': 'Pegawai yang mengurus pelabuhan: menyambut pedagang, memeriksa timbangan dan mengutip cukai.',
  'monsun': 'Angin bermusim yang bertukar arah. Kapal layar zaman dahulu belayar mengikut tiupannya.',
  'lingua franca': 'Bahasa perantaraan yang digunakan oleh orang yang berlainan bahasa ibunda.',
  'bendahara': 'Jawatan tertinggi selepas sultan, setaraf perdana menteri dalam pentadbiran Melaka.',
  'residen': 'Pegawai British yang ditempatkan di sesebuah negeri Melayu untuk menasihati sultan. Nasihatnya wajib diikuti kecuali dalam hal agama Islam dan adat Melayu.',
  'Negeri-Negeri Selat': 'Gabungan Pulau Pinang, Melaka dan Singapura di bawah pentadbiran British sejak 1826.',
  'nasionalisme': 'Semangat cinta akan tanah air yang mendorong rakyat memperjuangkan kebebasan dan kemajuan bangsa.',
  'jus soli': 'Prinsip kerakyatan berdasarkan tempat lahir: sesiapa yang lahir di sesebuah wilayah layak menjadi warganya.',
  'darurat': 'Keadaan bahaya yang diisytiharkan kerajaan; undang-undang khas dikuatkuasakan untuk memulihkan keamanan.',
  'kampung baru': 'Penempatan yang dibina semasa Darurat di bawah Rancangan Briggs untuk memutuskan bekalan kepada pengganas komunis.',
  'Perikatan': 'Gabungan parti UMNO, MCA dan MIC yang bertanding bersama dalam pilihan raya 1955.',
  'Rukun Negara': 'Ideologi kebangsaan yang diisytiharkan pada 31 Ogos 1970 dengan lima prinsip untuk menyatupadukan rakyat.'
};

const ERA = [
  {
    id: 'awal', no: '01', nama: 'Kerajaan Awal', tempoh: '40,000 SM – abad ke-14',
    warna: 'lilac', ikon: 'batu',
    ringkas: 'Dari gua batu kapur ke pelabuhan Kedah Tua: bermulanya kisah manusia di Tanah Melayu dan Borneo.',
    pelajaran: [
      {
        tajuk: 'Jejak manusia terawal', tahun: '40000', label: '± 40,000 tahun dahulu', minit: 4,
        isi: [
          'Kisah kita bermula jauh sebelum ada tulisan, pada zaman {{prasejarah}}. Di Gua Niah, Sarawak, ahli {{arkeologi}} menemui tengkorak manusia moden yang berusia kira-kira 40,000 tahun, antara yang tertua di Asia Tenggara.',
          'Di Lembah Lenggong, Perak, ditemui rangka yang digelar Perak Man di Gua Gunung Runtuh pada tahun 1990. Usianya sekitar 11,000 tahun. Dia dikebumikan bersama alat batu dan makanan, tanda bahawa masyarakat ketika itu sudah mempunyai kepercayaan.',
          'Pada tahun 2012, Lembah Lenggong diiktiraf UNESCO sebagai Tapak Warisan Dunia kerana menyimpan rekod kehidupan manusia yang berterusan selama ratusan ribu tahun.'
        ],
        fakta: 'Alat batu di Bukit Bunuh, Lenggong dianggarkan berusia 1.83 juta tahun. Tarikh ini masih dibahaskan oleh para pengkaji.',
        tarikh: [['± 40,000 SM', 'Tengkorak Gua Niah'], ['± 9,000 SM', 'Perak Man dikebumikan'], ['1990', 'Perak Man ditemui'], ['2012', 'Lenggong diiktiraf UNESCO']]
      },
      {
        tajuk: 'Kedah Tua & Lembah Bujang', tahun: '500', label: 'abad ke-5 Masihi', minit: 4,
        isi: [
          'Di kaki Gunung Jerai, Lembah Bujang pernah menjadi pelabuhan sibuk kerajaan Kedah Tua. Pedagang dari India, China dan Arab singgah untuk menunggu angin {{monsun}} bertukar arah.',
          'Lebih 50 tapak {{candi}} ditemui di sini. Candi Bukit Batu Pahat yang dibina semula menjadi simbol pengaruh Hindu-Buddha di Semenanjung.',
          'Tapak Sungai Batu pula menyimpan sisa peleburan besi dan jeti purba. Penyelidik menganggarkan aktivitinya bermula seawal abad ke-6 Sebelum Masihi, menjadikan Kedah antara pusat tamadun tertua di rantau ini.'
        ],
        fakta: 'Besi dari Kedah Tua dipercayai dieksport ke India dan Asia Barat. Nama Kataha atau Kadaram dicatat dalam teks Tamil.',
        tarikh: [['abad ke-6 SM', 'Peleburan besi Sungai Batu'], ['abad ke-5 M', 'Pelabuhan Lembah Bujang'], ['1936', 'Kajian candi oleh Quaritch Wales']]
      },
      {
        tajuk: 'Langkasuka, Gangga Negara & Srivijaya', tahun: '682', label: 'abad ke-2 hingga ke-13', minit: 5,
        isi: [
          'Langkasuka di pantai timur semenanjung disebut dalam catatan China sejak abad ke-2. Gangga Negara pula dipercayai berpusat di Beruas, Perak.',
          'Pada abad ke-7, Srivijaya bangkit dari Palembang. Ia sebuah {{talasokrasi}}: kuasanya bukan pada tanah yang luas, tetapi pada kawalan Selat Melaka dan Selat Sunda.',
          'Apabila Srivijaya merosot pada abad ke-13, ruang kuasa di Selat Melaka terbuka. Di situlah seorang putera Palembang akan mengasaskan sebuah kerajaan baharu.'
        ],
        fakta: 'Prasasti Kedukan Bukit (682 M) di Palembang ialah antara bukti bertulis tertua tentang Srivijaya, ditulis dalam bahasa Melayu Kuno.',
        tarikh: [['abad ke-2', 'Langkasuka dicatat China'], ['682', 'Prasasti Kedukan Bukit'], ['1025', 'Serangan Chola ke Srivijaya'], ['abad ke-13', 'Srivijaya merosot']]
      }
    ],
    kuiz: [
      { s: 'Di manakah tengkorak manusia moden berusia ± 40,000 tahun ditemui?', p: ['Gua Niah, Sarawak', 'Gua Tempurung, Perak', 'Batu Caves, Selangor', 'Gua Kelam, Perlis'], j: 0 },
      { s: 'Rangka Perak Man ditemui di lembah mana?', p: ['Lembah Bujang', 'Lembah Lenggong', 'Lembah Klang', 'Lembah Danum'], j: 1 },
      { s: 'Lembah Bujang terletak di kaki gunung apakah?', p: ['Gunung Tahan', 'Gunung Ledang', 'Gunung Jerai', 'Gunung Kinabalu'], j: 2 },
      { s: 'Srivijaya disebut talasokrasi kerana kuasanya bersandar pada…', p: ['Pertanian padi', 'Lombong emas', 'Penguasaan laut', 'Tentera gajah'], j: 2 },
      { s: 'Srivijaya berpusat di…', p: ['Palembang', 'Pattani', 'Beruas', 'Temasik'], j: 0 }
    ]
  },
  {
    id: 'melaka', no: '02', nama: 'Kesultanan Melayu Melaka', tempoh: '1400 – 1511',
    warna: 'lime', ikon: 'mahkota',
    ringkas: 'Sebuah pelabuhan kecil menjadi pusat dagangan dunia, pusat Islam dan tempat lahirnya sistem pemerintahan Melayu.',
    pelajaran: [
      {
        tajuk: 'Parameswara membuka Melaka', tahun: '1400', label: '± 1400', minit: 4,
        isi: [
          'Parameswara, seorang putera dari Palembang, berundur ke Temasik dan kemudian ke pesisir barat semenanjung. Menurut Sejarah Melayu, baginda melihat seekor pelanduk menendang anjing perburuannya di bawah sebatang pokok, lalu tempat itu dinamakan Melaka.',
          'Lokasinya sangat strategik. Melaka terlindung daripada tiupan angin {{monsun}} oleh Pulau Sumatera, airnya dalam, dan ia terletak tepat di tengah laluan Selat Melaka.',
          'Parameswara bijak berdiplomasi. Baginda menjalin hubungan dengan Maharaja China dan melawat negeri itu pada tahun 1411. Perlindungan China menjauhkan Melaka daripada ancaman Siam.'
        ],
        fakta: 'Laksamana Cheng Ho singgah di Melaka beberapa kali pada awal abad ke-15 dan membina gudang di sana.',
        tarikh: [['± 1400', 'Melaka diasaskan'], ['1405', 'Pelayaran pertama Cheng Ho'], ['1411', 'Parameswara ke China']]
      },
      {
        tajuk: 'Pelabuhan entrepot dunia', tahun: '1450', label: 'abad ke-15', minit: 4,
        isi: [
          'Pada kemuncaknya, Melaka ialah pelabuhan {{entrepot}} terbesar di Asia Tenggara. Lada, rempah, sutera, tembikar dan kain bertukar tangan di dermaganya.',
          'Empat orang {{syahbandar}} dilantik, setiap seorang mengurus pedagang dari kawasan berlainan: Gujerat; India dan Burma; Asia Tenggara; serta China dan Ryukyu.',
          'Undang-undang Laut Melaka mengatur hal kapal dan pelayaran, manakala mata wang timah memudahkan jual beli. Bahasa Melayu menjadi {{lingua franca}} yang menyatukan pedagang dari pelbagai bangsa.'
        ],
        fakta: 'Tomé Pires, penulis Portugis, mencatatkan bahawa 84 bahasa dituturkan di pelabuhan Melaka.',
        tarikh: [['abad ke-15', 'Empat syahbandar dilantik'], ['abad ke-15', 'Undang-undang Laut Melaka'], ['± 1512', 'Catatan Tomé Pires']]
      },
      {
        tajuk: 'Islam, undang-undang & Tun Perak', tahun: '1456', label: '1445 – 1498', minit: 5,
        isi: [
          'Islam menjadi agama rasmi Melaka. Sultan Muzaffar Shah ialah pemerintah pertama yang memakai gelaran Sultan, dan Melaka berkembang menjadi pusat penyebaran Islam di Nusantara.',
          'Hukum Kanun Melaka menetapkan peraturan tentang jenayah, jual beli dan perkahwinan. Inilah antara kod undang-undang bertulis terawal di alam Melayu.',
          'Tun Perak berkhidmat sebagai {{bendahara}} di bawah empat orang sultan. Kebijaksanaannya menangkis serangan Siam dan meluaskan pengaruh Melaka hingga ke Pahang, Johor dan Sumatera.'
        ],
        fakta: 'Tun Perak terkenal kerana mengutamakan kesetiaan kepada negeri melebihi kepentingan keluarganya sendiri.',
        tarikh: [['1445', 'Sultan Muzaffar Shah menaiki takhta'], ['± 1456', 'Tun Perak menjadi bendahara'], ['1498', 'Tun Perak meninggal dunia']]
      }
    ],
    kuiz: [
      { s: 'Siapakah pengasas Melaka?', p: ['Tun Perak', 'Parameswara', 'Sultan Mahmud Shah', 'Hang Tuah'], j: 1 },
      { s: 'Berapakah bilangan syahbandar di pelabuhan Melaka?', p: ['Dua', 'Tiga', 'Empat', 'Enam'], j: 2 },
      { s: 'Pemerintah Melaka pertama yang bergelar Sultan ialah…', p: ['Sultan Muzaffar Shah', 'Sultan Mansur Shah', 'Sultan Alauddin', 'Sultan Iskandar'], j: 0 },
      { s: 'Pelabuhan entrepot bermaksud pelabuhan yang…', p: ['Hanya untuk kapal perang', 'Mengumpul dan mengedar semula barang', 'Ditutup ketika monsun', 'Milik pedagang China'], j: 1 },
      { s: 'Tun Perak memegang jawatan…', p: ['Laksamana', 'Temenggung', 'Syahbandar', 'Bendahara'], j: 3 }
    ]
  },
  {
    id: 'barat', no: '03', nama: 'Kuasa Barat Tiba', tempoh: '1511 – 1941',
    warna: 'violet', ikon: 'kapal',
    ringkas: 'Portugis, Belanda dan British bergilir menguasai Selat Melaka sehingga Tanah Melayu dan Borneo jatuh ke tangan penjajah.',
    pelajaran: [
      {
        tajuk: 'Kejatuhan Melaka', tahun: '1511', label: '24 Ogos 1511', minit: 4,
        isi: [
          'Pada tahun 1511, angkatan Portugis di bawah Alfonso de Albuquerque menyerang Melaka. Selepas pertempuran berminggu-minggu, kota itu jatuh pada 24 Ogos 1511.',
          'Sultan Mahmud Shah berundur. Waris baginda kemudian mengasaskan Kesultanan Johor-Riau dan Kesultanan Perak, maka warisan Melaka terus hidup.',
          'Portugis membina kota A Famosa. Namun Melaka tidak lagi semeriah dahulu kerana pedagang Islam beralih ke pelabuhan lain. Pada 14 Januari 1641, Belanda bersama Johor pula menawan Melaka.'
        ],
        fakta: 'Pintu gerbang Porta de Santiago ialah satu-satunya bahagian A Famosa yang masih berdiri hari ini.',
        tarikh: [['1511', 'Portugis menawan Melaka'], ['1528', 'Kesultanan Johor & Perak'], ['1641', 'Belanda menawan Melaka']]
      },
      {
        tajuk: 'British bertapak', tahun: '1786', label: '1786 – 1826', minit: 4,
        isi: [
          'Pada 11 Ogos 1786, Francis Light mendarat di Pulau Pinang bagi pihak Syarikat Hindia Timur Inggeris. Pada tahun 1819, Stamford Raffles membuka Singapura.',
          'Perjanjian Inggeris-Belanda 17 Mac 1824 membahagi rantau ini kepada dua: utara Selat Melaka untuk British, selatan untuk Belanda. Sempadan inilah yang kelak memisahkan Malaysia dan Indonesia.',
          'Pada tahun 1826, Pulau Pinang, Melaka dan Singapura disatukan sebagai {{Negeri-Negeri Selat}}. Di Borneo pula, James Brooke menjadi Rajah Sarawak pada 1841.'
        ],
        fakta: 'Perjanjian 1824 dibuat di London tanpa melibatkan raja-raja Melayu yang wilayahnya dibahagikan.',
        tarikh: [['1786', 'Francis Light di Pulau Pinang'], ['1819', 'Raffles di Singapura'], ['1824', 'Perjanjian Inggeris-Belanda'], ['1826', 'Negeri-Negeri Selat'], ['1841', 'James Brooke, Rajah Sarawak']]
      },
      {
        tajuk: 'Perjanjian Pangkor & sistem Residen', tahun: '1874', label: '20 Januari 1874', minit: 5,
        isi: [
          'Perebutan takhta Perak dan pergaduhan kongsi gelap di lombong bijih timah memberi alasan kepada British untuk campur tangan. Perjanjian Pangkor ditandatangani pada 20 Januari 1874.',
          'Raja Abdullah diiktiraf sebagai Sultan Perak, tetapi baginda wajib menerima seorang {{residen}} British. J.W.W. Birch dilantik sebagai Residen pertama Perak.',
          'Sistem ini merebak ke Selangor, Negeri Sembilan dan Pahang. Pada 1 Julai 1896, keempat-empat negeri itu digabungkan menjadi Negeri-Negeri Melayu Bersekutu dengan pusat pentadbiran di Kuala Lumpur.'
        ],
        fakta: 'Frank Swettenham ialah Residen Jeneral pertama Negeri-Negeri Melayu Bersekutu.',
        tarikh: [['1874', 'Perjanjian Pangkor'], ['1881', 'Syarikat Borneo Utara British'], ['1896', 'Negeri-Negeri Melayu Bersekutu'], ['1909', 'Perjanjian Bangkok']]
      }
    ],
    kuiz: [
      { s: 'Siapakah yang mengetuai serangan Portugis ke atas Melaka?', p: ['Vasco da Gama', 'Alfonso de Albuquerque', 'Francis Light', 'Diogo Lopes'], j: 1 },
      { s: 'Bilakah Melaka jatuh ke tangan Portugis?', p: ['1488', '1511', '1641', '1786'], j: 1 },
      { s: 'Francis Light membuka…', p: ['Singapura', 'Melaka', 'Pulau Pinang', 'Labuan'], j: 2 },
      { s: 'Perjanjian Pangkor ditandatangani pada tahun…', p: ['1824', '1874', '1896', '1909'], j: 1 },
      { s: 'Residen British pertama di Perak ialah…', p: ['J.W.W. Birch', 'Frank Swettenham', 'Hugh Low', 'Stamford Raffles'], j: 0 }
    ]
  },
  {
    id: 'bangkit', no: '04', nama: 'Bangkit Menentang', tempoh: '1875 – 1938',
    warna: 'coral', ikon: 'api',
    ringkas: 'Dari keris di Pasir Salak hingga pena di akhbar: rakyat setiap negeri bangun mempertahankan maruah.',
    pelajaran: [
      {
        tajuk: 'Pasir Salak', tahun: '1875', label: '2 November 1875', minit: 4,
        isi: [
          'J.W.W. Birch mengutip cukai, menghapuskan amalan tradisional dan mengabaikan pembesar Perak. Kemarahan rakyat memuncak.',
          'Pada 2 November 1875, Birch dibunuh di Pasir Salak ketika menampal notis di tebing Sungai Perak. Dato\' Maharaja Lela, pembesar Pasir Salak, memimpin penentangan itu.',
          'British membalas dengan tentera dari India dan Hong Kong. Dato\' Maharaja Lela ditangkap dan dihukum gantung pada 1877, tetapi namanya kekal sebagai lambang keberanian.'
        ],
        fakta: 'Kompleks Sejarah Pasir Salak di Perak kini menempatkan tugu memperingati peristiwa ini.',
        tarikh: [['1874', 'Birch dilantik residen'], ['1875', 'Birch dibunuh'], ['1877', 'Dato\' Maharaja Lela dihukum']]
      },
      {
        tajuk: 'Pahlawan di setiap negeri', tahun: '1891', label: '1853 – 1928', minit: 5,
        isi: [
          'Di Sarawak, Rentap menentang Rajah Brooke dari kubunya di Bukit Sadok sejak 1853. Di Pahang, Dato\' Bahaman dan Mat Kilau bangkit menentang campur tangan British dari tahun 1891 hingga 1895.',
          'Di Sabah, Mat Salleh menentang Syarikat Borneo Utara British dari 1894 hingga beliau terkorban di Tambunan pada tahun 1900.',
          'Di Kelantan, Tok Janggut memimpin penentangan cukai di Pasir Puteh pada 1915. Di Terengganu, Haji Abdul Rahman Limbong membela petani yang dibebani peraturan tanah pada 1928.'
        ],
        fakta: 'Penentangan ini berlaku di negeri yang berbeza dan pada masa berbeza, tetapi puncanya serupa: campur tangan asing dalam cukai, tanah dan adat.',
        tarikh: [['1853', 'Rentap di Sarawak'], ['1891', 'Pahang bangkit'], ['1894', 'Mat Salleh di Sabah'], ['1915', 'Tok Janggut di Kelantan'], ['1928', 'Terengganu']]
      },
      {
        tajuk: 'Pena & persatuan', tahun: '1938', label: '1906 – 1938', minit: 4,
        isi: [
          'Abad ke-20 membawa bentuk penentangan baharu. Semangat {{nasionalisme}} tersebar melalui majalah, sekolah dan persatuan.',
          'Majalah Al-Imam (1906) menyeru umat Melayu supaya maju melalui ilmu. Kesatuan Melayu Singapura (1926) menjadi persatuan politik Melayu yang awal.',
          'Pada 1938, Ibrahim Yaakob menubuhkan Kesatuan Melayu Muda, antara pertubuhan pertama yang berani menuntut kemerdekaan. Akhbar Utusan Melayu (1939) pula menjadi suara bangsa.'
        ],
        fakta: 'Za\'ba, pendeta bahasa Melayu, menulis rencana tentang kemiskinan orang Melayu yang membuka mata ramai pembaca.',
        tarikh: [['1906', 'Majalah Al-Imam'], ['1926', 'Kesatuan Melayu Singapura'], ['1938', 'Kesatuan Melayu Muda'], ['1939', 'Utusan Melayu']]
      }
    ],
    kuiz: [
      { s: 'Siapakah yang memimpin penentangan di Pasir Salak?', p: ['Mat Kilau', 'Dato\' Maharaja Lela', 'Tok Janggut', 'Rentap'], j: 1 },
      { s: 'Mat Salleh menentang British di…', p: ['Sarawak', 'Pahang', 'Sabah', 'Kelantan'], j: 2 },
      { s: 'Tok Janggut memimpin penentangan pada tahun…', p: ['1875', '1891', '1915', '1928'], j: 2 },
      { s: 'Kubu Rentap terletak di…', p: ['Bukit Sadok', 'Bukit Kepong', 'Bukit Gantang', 'Bukit Mertajam'], j: 0 },
      { s: 'Kesatuan Melayu Muda ditubuhkan oleh…', p: ['Dato\' Onn Jaafar', 'Za\'ba', 'Ibrahim Yaakob', 'Tunku Abdul Rahman'], j: 2 }
    ]
  },
  {
    id: 'perang', no: '05', nama: 'Perang & Malayan Union', tempoh: '1941 – 1960',
    warna: 'ink', ikon: 'perisai',
    ringkas: 'Tiga tahun lapan bulan di bawah Jepun, penolakan Malayan Union, dan dua belas tahun Darurat.',
    pelajaran: [
      {
        tajuk: 'Pendudukan Jepun', tahun: '1941', label: '8 Disember 1941', minit: 4,
        isi: [
          'Pada 8 Disember 1941, tentera Jepun mendarat di Kota Bharu, Kelantan. Mereka mara dengan pantas, malah menggunakan basikal untuk bergerak ke selatan.',
          'Singapura jatuh pada 15 Februari 1942. Rakyat hidup dalam ketakutan dan kekurangan selama tiga tahun lapan bulan: makanan dicatu, wang "pisang" hilang nilai.',
          'Jepun menyerah kalah pada 15 Ogos 1945. Kekalahan British pada 1941 menyedarkan rakyat bahawa penjajah bukanlah kuasa yang tidak boleh ditewaskan.'
        ],
        fakta: 'Wang kertas Jepun digelar duit pisang kerana gambar pokok pisang pada not $10.',
        tarikh: [['1941', 'Jepun mendarat di Kota Bharu'], ['1942', 'Singapura jatuh'], ['1945', 'Jepun menyerah kalah']]
      },
      {
        tajuk: 'Malayan Union ditolak', tahun: '1946', label: '1 April 1946', minit: 5,
        isi: [
          'British memperkenalkan Malayan Union pada 1 April 1946. Kuasa sultan dikurangkan dan kerakyatan diberi berdasarkan prinsip {{jus soli}}.',
          'Orang Melayu bangkit membantah. Raja-raja Melayu memulaukan majlis pelantikan Gabenor Edward Gent. Kongres Melayu bersidang di Kuala Lumpur pada Mac 1946.',
          'Pada 11 Mei 1946, UMNO ditubuhkan di Johor Bahru dengan Dato\' Onn Jaafar sebagai presiden. Tekanan ini berjaya: Malayan Union digantikan dengan Persekutuan Tanah Melayu pada 1 Februari 1948.'
        ],
        fakta: 'Penolakan Malayan Union dilakukan tanpa pertumpahan darah, melalui rapat umum, perhimpunan dan rundingan.',
        tarikh: [['Apr 1946', 'Malayan Union'], ['Mei 1946', 'UMNO ditubuhkan'], ['Feb 1948', 'Persekutuan Tanah Melayu']]
      },
      {
        tajuk: 'Darurat', tahun: '1948', label: '1948 – 1960', minit: 4,
        isi: [
          'Pada 16 Jun 1948, tiga pengurus ladang dibunuh di Sungai Siput, Perak. Kerajaan mengisytiharkan {{darurat}} untuk menentang keganasan Parti Komunis Malaya.',
          'Melalui Rancangan Briggs, ratusan {{kampung baru}} dibina supaya penduduk terlindung dan komunis terputus bekalan. Sir Gerald Templer pula menekankan usaha memenangi hati rakyat.',
          'Darurat berlarutan selama dua belas tahun dan hanya ditamatkan secara rasmi pada 31 Julai 1960, selepas negara merdeka.'
        ],
        fakta: 'Peristiwa Bukit Kepong (23 Februari 1950) mengenang keberanian anggota polis yang mempertahankan balai mereka.',
        tarikh: [['1948', 'Darurat diisytiharkan'], ['1950', 'Bukit Kepong'], ['1960', 'Darurat tamat']]
      }
    ],
    kuiz: [
      { s: 'Di manakah tentera Jepun mula mendarat pada 1941?', p: ['Kuala Lumpur', 'Kota Bharu', 'Pulau Pinang', 'Johor Bahru'], j: 1 },
      { s: 'Berapa lama Jepun menduduki Tanah Melayu?', p: ['1 tahun', '2 tahun 4 bulan', '3 tahun 8 bulan', '5 tahun'], j: 2 },
      { s: 'Malayan Union diperkenalkan pada…', p: ['1 April 1946', '11 Mei 1946', '1 Februari 1948', '31 Ogos 1957'], j: 0 },
      { s: 'Presiden pertama UMNO ialah…', p: ['Tunku Abdul Rahman', 'Tun Abdul Razak', 'Dato\' Onn Jaafar', 'Ibrahim Yaakob'], j: 2 },
      { s: 'Kampung baru dibina di bawah rancangan…', p: ['Rancangan Briggs', 'Rancangan Reid', 'Rancangan Cobbold', 'Rancangan Malaya'], j: 0 }
    ]
  },
  {
    id: 'merdeka', no: '06', nama: 'Merdeka & Malaysia', tempoh: '1955 – 1970',
    warna: 'lime', ikon: 'bendera',
    ringkas: 'Pilihan raya pertama, laungan Merdeka di Stadium Merdeka, dan lahirnya Malaysia pada 16 September 1963.',
    pelajaran: [
      {
        tajuk: 'Pilihan raya pertama', tahun: '1955', label: '27 Julai 1955', minit: 4,
        isi: [
          'Pilihan raya umum pertama Persekutuan Tanah Melayu diadakan pada 27 Julai 1955. Ia menjadi ujian sama ada rakyat berbilang kaum mampu bekerjasama.',
          'Parti {{Perikatan}} memenangi 51 daripada 52 kerusi yang dipertandingkan. Kemenangan ini membuktikan kerjasama kaum boleh menjadi jalan menuju kemerdekaan.',
          'Tunku Abdul Rahman dilantik sebagai Ketua Menteri. Pada Disember 1955, beliau berunding dengan pemimpin komunis di Baling, tetapi rundingan itu gagal.'
        ],
        fakta: 'Satu-satunya kerusi yang tidak dimenangi Perikatan jatuh kepada PAS di Kerian, Perak.',
        tarikh: [['Jul 1955', 'Pilihan raya umum'], ['Ogos 1955', 'Tunku Ketua Menteri'], ['Dis 1955', 'Rundingan Baling']]
      },
      {
        tajuk: '31 Ogos 1957', tahun: '1957', label: '31 Ogos 1957', minit: 5,
        isi: [
          'Rombongan kemerdekaan yang dipimpin Tunku Abdul Rahman berunding di London pada awal 1956. Perjanjian ditandatangani pada 8 Februari 1956.',
          'Suruhanjaya Reid kemudian merangka perlembagaan. Pada 30 Ogos 1957 menjelang tengah malam, bendera Union Jack diturunkan di Padang Kelab Selangor.',
          'Pagi 31 Ogos 1957, di Stadium Merdeka, Tunku membacakan Pemasyhuran Kemerdekaan lalu melaungkan "Merdeka!" sebanyak tujuh kali, disambut ribuan rakyat.'
        ],
        fakta: 'Padang Kelab Selangor tempat Union Jack diturunkan kini dikenali sebagai Dataran Merdeka.',
        tarikh: [['Feb 1956', 'Perjanjian London'], ['1956', 'Suruhanjaya Reid'], ['31 Ogos 1957', 'Merdeka!']]
      },
      {
        tajuk: 'Lahirnya Malaysia', tahun: '1963', label: '16 September 1963', minit: 5,
        isi: [
          'Pada 27 Mei 1961, Tunku mencadangkan gagasan Malaysia: Persekutuan Tanah Melayu, Singapura, Sabah, Sarawak dan Brunei bersatu.',
          'Suruhanjaya Cobbold meninjau pandangan rakyat Sabah dan Sarawak pada 1962. Brunei akhirnya memilih untuk tidak menyertai.',
          'Malaysia diisytiharkan pada 16 September 1963. Singapura keluar pada 9 Ogos 1965. Pada 31 Ogos 1970, {{Rukun Negara}} diisytiharkan untuk mengukuhkan perpaduan.'
        ],
        fakta: 'Perjanjian 20 Perkara (Sabah) dan 18 Perkara (Sarawak) menjadi syarat penyertaan kedua-dua wilayah Borneo.',
        tarikh: [['1961', 'Gagasan Malaysia'], ['1962', 'Suruhanjaya Cobbold'], ['1963', 'Malaysia dibentuk'], ['1965', 'Singapura keluar'], ['1970', 'Rukun Negara']]
      }
    ],
    kuiz: [
      { s: 'Pilihan raya umum pertama diadakan pada tahun…', p: ['1948', '1955', '1957', '1963'], j: 1 },
      { s: 'Berapa kerusi dimenangi Perikatan pada 1955?', p: ['45 daripada 52', '50 daripada 52', '51 daripada 52', '52 daripada 52'], j: 2 },
      { s: 'Berapa kali Tunku melaungkan "Merdeka!"?', p: ['Tiga', 'Lima', 'Tujuh', 'Sembilan'], j: 2 },
      { s: 'Malaysia dibentuk pada…', p: ['31 Ogos 1957', '16 September 1963', '9 Ogos 1965', '31 Ogos 1970'], j: 1 },
      { s: 'Wilayah mana yang memilih untuk tidak menyertai Malaysia?', p: ['Sabah', 'Sarawak', 'Singapura', 'Brunei'], j: 3 }
    ]
  }
];

const TOKOH = [
  { nama: 'Parameswara', gelar: 'Pengasas Melaka', tahun: '± 1344 – 1414', era: 'melaka', bio: 'Putera Palembang yang mengasaskan Melaka sekitar 1400. Diplomasinya dengan China melindungi kerajaan muda itu daripada ancaman Siam.' },
  { nama: 'Tun Perak', gelar: 'Bendahara Melaka', tahun: 'm. 1498', era: 'melaka', bio: 'Bendahara di bawah empat sultan. Menangkis serangan Siam dan meluaskan empayar Melaka. Lambang pentadbir yang setia dan bijaksana.' },
  { nama: 'Sultan Mahmud Shah', gelar: 'Sultan terakhir Melaka', tahun: 'm. 1528', era: 'barat', bio: 'Memerintah ketika Portugis menyerang pada 1511. Selepas berundur, warisnya mengasaskan Kesultanan Johor dan Perak.' },
  { nama: 'Dato\' Maharaja Lela', gelar: 'Pembesar Pasir Salak', tahun: 'm. 1877', era: 'bangkit', bio: 'Memimpin penentangan terhadap J.W.W. Birch yang dibunuh pada 2 November 1875. Dihukum gantung oleh British pada 1877.' },
  { nama: 'Rentap', gelar: 'Pahlawan Iban', tahun: 'abad ke-19', era: 'bangkit', bio: 'Menentang pemerintahan Rajah Brooke dari kubu di Bukit Sadok, Sarawak. Gelarannya bermaksud "penggegar dunia".' },
  { nama: 'Mat Kilau', gelar: 'Pahlawan Pahang', tahun: '1866 – 1970', era: 'bangkit', bio: 'Bersama Dato\' Bahaman menentang British di Pahang (1891–1895). Muncul semula secara terbuka pada 1969 setelah lama menyembunyikan identiti.' },
  { nama: 'Mat Salleh', gelar: 'Pahlawan Sabah', tahun: 'm. 1900', era: 'bangkit', bio: 'Menentang Syarikat Borneo Utara British dari 1894 hingga terkorban di Tambunan pada 1900.' },
  { nama: 'Tok Janggut', gelar: 'Pahlawan Kelantan', tahun: '1853 – 1915', era: 'bangkit', bio: 'Nama sebenarnya Haji Mohd Hassan. Memimpin penentangan sistem cukai baharu di Pasir Puteh pada 1915.' },
  { nama: 'Za\'ba', gelar: 'Pendeta Bahasa', tahun: '1895 – 1973', era: 'bangkit', bio: 'Zainal Abidin Ahmad. Pakar bahasa dan penulis yang menyedarkan bangsa Melayu tentang kepentingan ilmu dan ekonomi.' },
  { nama: 'Dato\' Onn Jaafar', gelar: 'Presiden pertama UMNO', tahun: '1895 – 1962', era: 'perang', bio: 'Memimpin penentangan terhadap Malayan Union dan menubuhkan UMNO pada 11 Mei 1946.' },
  { nama: 'Tunku Abdul Rahman', gelar: 'Bapa Kemerdekaan', tahun: '1903 – 1990', era: 'merdeka', bio: 'Ketua rombongan kemerdekaan ke London, Perdana Menteri pertama, dan pencetus gagasan Malaysia.' },
  { nama: 'Tun Abdul Razak', gelar: 'Bapa Pembangunan', tahun: '1922 – 1976', era: 'merdeka', bio: 'Anggota rombongan kemerdekaan, Timbalan Perdana Menteri pertama dan Perdana Menteri kedua.' }
];

/* akaun contoh untuk skrin "Pilih akaun" (log masuk tiruan) */
const AKAUN_CONTOH = [
  { nama: 'Aina Sofea', emel: 'aina.sofea@gmail.com' },
  { nama: 'Haikal Iman', emel: 'haikal.iman@gmail.com' }
];
