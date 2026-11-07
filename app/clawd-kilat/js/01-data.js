/* Clawd Kilat: bahasa, hero, zona, tingkat, misi, simpanan */

export const TEKS = {
  id: {
    tag: 'Lari kilat matematika', intro: 'Lari secepat kilat, lompati rintangan, hancurkan Si Comot, dan pilih jawaban yang benar di gerbang angka.',
    main: 'Main', hero: 'Pilih hero', tingkat: 'Tingkat', bahasa: 'Bahasa', grafik: 'Grafik', tinggi: 'Tinggi', ringan: 'Ringan',
    mudah: 'Mudah', sedang: 'Sedang', sulit: 'Sulit', mudahT: '+ dan − sampai 20', sedangT: '+ − × sampai 100', sulitT: '× ÷ dan dua langkah',
    rekor: 'Rekor', koin: 'Koin', referensi: 'Referensi desain', cara: 'Cara main',
    caraT: ['Geser kiri/kanan atau ← → untuk pindah lajur', 'Geser atas / ↑ / spasi untuk lompat, geser bawah / ↓ untuk guling', 'Kumpulkan koin untuk mengisi meter KILAT, lalu ketuk KILAT (atau E)', 'Gerbang angka: lari ke lajur jawaban yang benar', 'Raja Comot muncul tiap 1200 m: ambil bola jawaban benar untuk memukulnya'],
    pasif: 'Kemampuan lari', buka: 'Buka', dipakai: 'Dipakai', pakai: 'Pakai', kurangKoin: 'Koin belum cukup', tutup: 'Tutup',
    jeda: 'Jeda', lanjut: 'Lanjut', ulang: 'Main lagi', menu: 'Menu', suara: 'Suara',
    lari: 'LARI!', kilat: 'KILAT', kilatSiap: 'KILAT SIAP!', benar: 'BENAR!', salah: 'Belum tepat', pengali: 'Pengali',
    gerbang: 'Gerbang angka', larike: 'Lari ke lajur jawabanmu', bos: 'RAJA COMOT DATANG!', bosKalah: 'RAJA COMOT KALAH!', bosT: 'Ambil bola jawaban yang benar',
    tumbang: 'Clawd tumbang!', bangkitT: 'Jawab benar untuk bangkit', bangkit: 'BANGKIT!', waktu: 'detik',
    hasil: 'Hasil lari', skor: 'Skor', jarak: 'Jarak', benarN: 'Soal benar', musuh: 'Comot hancur', rekorBaru: 'REKOR BARU!',
    belajar: 'Catatan belajar', semuaBenar: 'Semua soal dijawab benar. Hebat!', jawabanBenar: 'jawaban benar',
    misi: 'Misi', selesai: 'Selesai', hadiah: 'hadiah', zona: ['Lembah Hijau', 'Pantai Senja', 'Kota Tinta'],
    pegas: 'MELAYANG!', magnet: 'MAGNET', perisai: 'PERISAI', kombo: 'LEDAKAN KOMBO!', rekorBendera: 'REKOR',
    geserPetunjuk: 'Geser untuk bergerak', m: 'm', terkunci: 'Terkunci'
  },
  ms: {
    tag: 'Larian kilat matematik', intro: 'Lari sepantas kilat, lompati halangan, musnahkan Si Comot, dan pilih jawapan yang betul di gerbang nombor.',
    main: 'Main', hero: 'Pilih hero', tingkat: 'Tahap', bahasa: 'Bahasa', grafik: 'Grafik', tinggi: 'Tinggi', ringan: 'Ringan',
    mudah: 'Mudah', sedang: 'Sederhana', sulit: 'Sukar', mudahT: '+ dan − hingga 20', sedangT: '+ − × hingga 100', sulitT: '× ÷ dan dua langkah',
    rekor: 'Rekod', koin: 'Syiling', referensi: 'Rujukan reka bentuk', cara: 'Cara main',
    caraT: ['Leret kiri/kanan atau ← → untuk tukar lorong', 'Leret atas / ↑ / ruang untuk lompat, leret bawah / ↓ untuk golek', 'Kutip syiling untuk mengisi meter KILAT, kemudian ketik KILAT (atau E)', 'Gerbang nombor: lari ke lorong jawapan yang betul', 'Raja Comot muncul setiap 1200 m: ambil bola jawapan betul untuk memukulnya'],
    pasif: 'Kebolehan lari', buka: 'Buka', dipakai: 'Dipakai', pakai: 'Pakai', kurangKoin: 'Syiling belum cukup', tutup: 'Tutup',
    jeda: 'Jeda', lanjut: 'Sambung', ulang: 'Main lagi', menu: 'Menu', suara: 'Bunyi',
    lari: 'LARI!', kilat: 'KILAT', kilatSiap: 'KILAT SEDIA!', benar: 'BETUL!', salah: 'Belum tepat', pengali: 'Pengganda',
    gerbang: 'Gerbang nombor', larike: 'Lari ke lorong jawapanmu', bos: 'RAJA COMOT DATANG!', bosKalah: 'RAJA COMOT TUMPAS!', bosT: 'Ambil bola jawapan yang betul',
    tumbang: 'Clawd tumbang!', bangkitT: 'Jawab betul untuk bangkit', bangkit: 'BANGKIT!', waktu: 'saat',
    hasil: 'Keputusan larian', skor: 'Skor', jarak: 'Jarak', benarN: 'Soalan betul', musuh: 'Comot musnah', rekorBaru: 'REKOD BARU!',
    belajar: 'Catatan belajar', semuaBenar: 'Semua soalan dijawab betul. Hebat!', jawabanBenar: 'jawapan betul',
    misi: 'Misi', selesai: 'Selesai', hadiah: 'ganjaran', zona: ['Lembah Hijau', 'Pantai Senja', 'Kota Dakwat'],
    pegas: 'MELAYANG!', magnet: 'MAGNET', perisai: 'PERISAI', kombo: 'LETUPAN KOMBO!', rekorBendera: 'REKOD',
    geserPetunjuk: 'Leret untuk bergerak', m: 'm', terkunci: 'Berkunci'
  }
};

/* 7 hero Arena Clawd Pro (warna sama), masing-masing satu kemampuan lari */
export const HEROES = {
  pahlawan: { nama: ['Clawd Pahlawan', 'Clawd Pahlawan'], col: '#d8714f', c2: '#d9534a', harga: 0, ikon: 'sword',
    pasif: ['Kilat lebih lama: 6 detik (biasa 4).', 'Kilat lebih lama: 6 saat (biasa 4).'], aks: 'jubah' },
  pemanah: { nama: ['Clawd Pemanah', 'Clawd Pemanah'], col: '#f2c14e', c2: '#5b8f3a', harga: 0, ikon: 'bow',
    pasif: ['Magnet kuat: 14 detik dan menarik koin dari semua lajur.', 'Magnet kuat: 14 saat dan menarik syiling dari semua lorong.'], aks: 'topi' },
  sihir: { nama: ['Clawd Penyihir', 'Clawd Ahli Sihir'], col: '#7f9fd9', c2: '#2f3f7a', harga: 0, ikon: 'wand',
    pasif: ['Otak kilat: jawaban benar memberi skor ×1,5 dan meter KILAT +50%.', 'Otak kilat: jawapan betul beri skor ×1.5 dan meter KILAT +50%.'], aks: 'topiSihir' },
  perisai: { nama: ['Clawd Perisai', 'Clawd Perisai'], col: '#a3b86c', c2: '#c9a35a', harga: 300, ikon: 'shield',
    pasif: ['Mulai dengan perisai, dan perisai muncul lebih sering.', 'Mula dengan perisai, dan perisai muncul lebih kerap.'], aks: 'tameng' },
  bayang: { nama: ['Clawd Bayangan', 'Clawd Bayang'], col: '#8a78b8', c2: '#3a3150', harga: 600, ikon: 'shadow',
    pasif: ['Lompat ganda: geser atas lagi saat di udara.', 'Lompat berganda: leret atas lagi ketika di udara.'], aks: 'syal' },
  penyembuh: { nama: ['Clawd Penyembuh', 'Clawd Penyembuh'], col: '#f19bb4', c2: '#fff1a8', harga: 600, ikon: 'heal',
    pasif: ['Bisa bangkit 2 kali dalam satu lari.', 'Boleh bangkit 2 kali dalam satu larian.'], aks: 'lingkar' },
  nini: { nama: ['Clawd Nini', 'Clawd Nini'], col: '#f6e2a8', c2: '#f19bb4', harga: 1000, ikon: 'cat',
    pasif: ['Kucing Mochi ikut berlari dan memungut koin di lajur sebelah.', 'Kucing Mochi ikut berlari dan mengutip syiling di lorong sebelah.'], aks: 'telinga' }
};
export const HERO_IDS = ['pahlawan', 'pemanah', 'sihir', 'perisai', 'bayang', 'penyembuh', 'nini'];

/* tiga zona: langit atas/bawah, kabut, lantai jalur A/B, tanah samping, garis lajur, cahaya */
export const ZONA = [
  { langitA: '#2f8fe0', langitB: '#bfe8fa', kabut: '#b2e0f4', jalurA: '#d6a25e', jalurB: '#bf8646', tanah: '#4fa83a', tanah2: '#6fc24a', garis: '#fff6dc', matahari: '#fff3c4', hemi: ['#d8f0ff', '#5d8a3c'], sinar: '#fff1d6', tepi: '#7a5a32' },
  { langitA: '#e8664a', langitB: '#ffcf8a', kabut: '#f5b884', jalurA: '#b9743e', jalurB: '#9c5e30', tanah: '#e8c07a', tanah2: '#f0d09a', garis: '#fff1d0', matahari: '#ffe0a0', hemi: ['#ffd6b0', '#a0703c'], sinar: '#ffd2a0', tepi: '#6e4426' },
  { langitA: '#120d33', langitB: '#4a2a7a', kabut: '#2a1d55', jalurA: '#2a2f48', jalurB: '#232740', tanah: '#1a1838', tanah2: '#262250', garis: '#ff7ac8', matahari: '#ff9ad8', hemi: ['#c0b4ff', '#3a2a60'], sinar: '#c0b0ff', tepi: '#5ef0ff' }
];

export const TINGKAT = {
  mudah: { lajuAwal: 22, lajuMaks: 38, naik: 0.9, gerbang: 380, lambatSoal: 0.7 },
  sedang: { lajuAwal: 25, lajuMaks: 46, naik: 1.1, gerbang: 420, lambatSoal: 0.8 },
  sulit: { lajuAwal: 28, lajuMaks: 54, naik: 1.3, gerbang: 460, lambatSoal: 0.85 }
};

export const MISI = [
  { id: 'koin', n: 150, hadiah: 60, t: ['Kumpulkan 150 koin', 'Kutip 150 syiling'] },
  { id: 'benar', n: 5, hadiah: 80, t: ['Jawab 5 soal benar', 'Jawab 5 soalan betul'] },
  { id: 'musuh', n: 6, hadiah: 60, t: ['Hancurkan 6 Si Comot', 'Musnahkan 6 Si Comot'] },
  { id: 'jarak', n: 1000, hadiah: 70, t: ['Lari 1000 m', 'Lari 1000 m'] },
  { id: 'kilat', n: 2, hadiah: 50, t: ['Pakai KILAT 2 kali', 'Guna KILAT 2 kali'] },
  { id: 'bos', n: 1, hadiah: 120, t: ['Kalahkan Raja Comot', 'Tumpaskan Raja Comot'] },
  { id: 'lompat', n: 30, hadiah: 40, t: ['Lompat 30 kali', 'Lompat 30 kali'] },
  { id: 'kombo', n: 3, hadiah: 70, t: ['3 jawaban benar beruntun', '3 jawapan betul berturut-turut'] }
];

const KUNCI = 'clawd-kilat-v1';
export function muat() {
  const asal = { rekor: 0, koin: 0, hero: 'pahlawan', punya: ['pahlawan', 'pemanah', 'sihir'], tingkat: 'mudah', bhs: 'id', suara: true, grafik: 'tinggi', jarakRekor: 0 };
  try { const s = JSON.parse(localStorage.getItem(KUNCI) || '{}'); return Object.assign(asal, s); } catch (e) { return asal; }
}
export function simpan(d) { try { localStorage.setItem(KUNCI, JSON.stringify(d)); } catch (e) { /* mode privat */ } }
