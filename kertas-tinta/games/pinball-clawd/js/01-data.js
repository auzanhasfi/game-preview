/* Pinball Clawd: pengaturan tersimpan + teks dua bahasa (Indonesia / Melayu) */

const KUNCI = 'pinball-clawd-v1';
const awal = { bhs: 'id', level: 'sedang', suara: true, rekor: 0, bintang: 0 };
function muat() { try { return Object.assign({}, awal, JSON.parse(localStorage.getItem(KUNCI) || '{}')); } catch (e) { return Object.assign({}, awal); } }
export const SET = typeof localStorage !== 'undefined' ? muat() : Object.assign({}, awal);
export function simpan() { try { localStorage.setItem(KUNCI, JSON.stringify(SET)); } catch (e) { /* mode privat */ } }

export const TEKS = {
  id: {
    sub: 'Meja Angka', main: 'Main', atur: 'Pengaturan', bantuan: 'Cara main', menu: 'Menu',
    level: 'Tingkat soal', mudah: 'Mudah', sedang: 'Sedang', sulit: 'Sulit', bahasa: 'Bahasa', suara: 'Suara', nyala: 'Nyala', mati: 'Mati',
    levelKet: { mudah: 'Tambah & kurang sampai 20', sedang: 'Tambah, kurang sampai 100, perkalian', sulit: 'Perkalian, pembagian, operasi campuran' },
    rekor: 'Rekor', jeda: 'Jeda', teruskan: 'Teruskan', ulangi: 'Main lagi', keluar: 'Keluar ke menu', hasil: 'Permainan Selesai',
    skor: 'Skor', benar: 'Benar', salah: 'Salah', streak: 'Beruntun terbaik', bola: 'Bola', rekorBaru: 'Rekor baru!',
    tembakan: ['Orbit kiri', 'Ramp kiri', 'Ramp kanan', 'Orbit kanan'],
    soalLabel: 'Soal', jawabDi: 'Tembak jawaban yang benar',
    tarikHint: 'Tahan lalu lepas untuk meluncurkan bola', goyang: 'Goyang',
    kontrol: 'Flipper kiri: Z / Shift kiri / ←   ·   Flipper kanan: / / Shift kanan / →   ·   Plunger: Spasi / ↓ (tahan, lepas)   ·   Goyang meja: N   ·   Jeda: P / Esc',
    kontrolHP: 'Ketuk sisi kiri / kanan layar untuk flipper. Tahan tombol plunger lalu lepas untuk meluncurkan bola.',
    bantuanIsi: [
      'Tarik plunger dan luncurkan bola. Masuk lajur atas yang menyala tepat setelah meluncur = Skill Shot.',
      'Soal muncul di layar atas. Empat tembakan menyala dengan pilihan jawaban: orbit kiri, ramp kiri, ramp kanan, orbit kanan.',
      'Tembak bola ke jawaban yang benar. Benar beruntun melipatgandakan poin. Lima benar beruntun = bola ekstra.',
      'Jatuhkan 3 drop target untuk membuka Kotak Clawd. Kunci 2 bola di sana untuk Multiball: setiap jawaban benar jadi Jackpot.',
      'Tiga lajur atas menyala semua = bonus berlipat. Tekan flipper untuk menggeser lampu lajur.',
      'Kickback di outlane kiri menyelamatkan bola sekali. Menyala lagi setelah 3 jawaban benar beruntun. Jangan goyang meja terlalu keras: TILT!'
    ],
    pesanBintang: ['Coba lagi, bidik pelan-pelan dari flipper.', 'Bagus! Terus latih bidikan ramp.', 'Hebat! Hampir sempurna.', 'Luar biasa! Juara Meja Angka.'],
    dmd: {
      bola: 'BOLA', tarik: 'TARIK PLUNGER', skill: 'SKILL SHOT', bonusX: 'BONUS', kotakBuka: 'KOTAK CLAWD TERBUKA', tembakKotak: 'TEMBAK KE TENGAH',
      kickback: 'KICKBACK', kickbackNyala: 'KICKBACK MENYALA', kombo: 'KOMBO', benar: 'BENAR', jackpot: 'JACKPOT', salah: 'SALAH',
      ekstra: 'BOLA EKSTRA', ekstraMain: 'MAIN LAGI', terkunci: 'BOLA TERKUNCI', satuLagi: 'SATU LAGI = MULTIBALL', multiball: 'MULTIBALL',
      jackpotSoal: 'JAWABAN BENAR = JACKPOT', simpan: 'BOLA DISELAMATKAN', bonus: 'BONUS', tilt: 'TILT', awas: 'AWAS', soal: 'SOAL', selesai: 'GAME OVER',
      demo: 'PINBALL CLAWD', demo2: 'TEKAN MAIN'
    }
  },
  ms: {
    sub: 'Meja Nombor', main: 'Main', atur: 'Tetapan', bantuan: 'Cara main', menu: 'Menu',
    level: 'Tahap soalan', mudah: 'Mudah', sedang: 'Sederhana', sulit: 'Sukar', bahasa: 'Bahasa', suara: 'Bunyi', nyala: 'Hidup', mati: 'Senyap',
    levelKet: { mudah: 'Tambah & tolak hingga 20', sedang: 'Tambah, tolak hingga 100, darab', sulit: 'Darab, bahagi, operasi bergabung' },
    rekor: 'Rekod', jeda: 'Jeda', teruskan: 'Sambung', ulangi: 'Main lagi', keluar: 'Keluar ke menu', hasil: 'Permainan Tamat',
    skor: 'Markah', benar: 'Betul', salah: 'Salah', streak: 'Berturut terbaik', bola: 'Bola', rekorBaru: 'Rekod baharu!',
    tembakan: ['Orbit kiri', 'Ramp kiri', 'Ramp kanan', 'Orbit kanan'],
    soalLabel: 'Soalan', jawabDi: 'Tembak jawapan yang betul',
    tarikHint: 'Tahan lalu lepas untuk melancarkan bola', goyang: 'Goncang',
    kontrol: 'Flipper kiri: Z / Shift kiri / ←   ·   Flipper kanan: / / Shift kanan / →   ·   Plunger: Space / ↓ (tahan, lepas)   ·   Goncang meja: N   ·   Jeda: P / Esc',
    kontrolHP: 'Ketik sisi kiri / kanan skrin untuk flipper. Tahan butang plunger kemudian lepas untuk melancarkan bola.',
    bantuanIsi: [
      'Tarik plunger dan lancarkan bola. Masuk lorong atas yang menyala sejurus selepas dilancar = Skill Shot.',
      'Soalan muncul di skrin atas. Empat tembakan menyala dengan pilihan jawapan: orbit kiri, ramp kiri, ramp kanan, orbit kanan.',
      'Tembak bola ke jawapan yang betul. Betul berturut-turut menggandakan mata. Lima betul berturut = bola ekstra.',
      'Jatuhkan 3 drop target untuk membuka Kotak Clawd. Kunci 2 bola di situ untuk Multiball: setiap jawapan betul jadi Jackpot.',
      'Tiga lorong atas menyala semua = bonus berganda. Tekan flipper untuk mengalih lampu lorong.',
      'Kickback di outlane kiri menyelamatkan bola sekali. Menyala semula selepas 3 jawapan betul berturut. Jangan goncang meja terlalu kuat: TILT!'
    ],
    pesanBintang: ['Cuba lagi, bidik perlahan-lahan dari flipper.', 'Bagus! Teruskan latih bidikan ramp.', 'Hebat! Hampir sempurna.', 'Luar biasa! Juara Meja Nombor.'],
    dmd: {
      bola: 'BOLA', tarik: 'TARIK PLUNGER', skill: 'SKILL SHOT', bonusX: 'BONUS', kotakBuka: 'KOTAK CLAWD DIBUKA', tembakKotak: 'TEMBAK KE TENGAH',
      kickback: 'KICKBACK', kickbackNyala: 'KICKBACK HIDUP', kombo: 'KOMBO', benar: 'BETUL', jackpot: 'JACKPOT', salah: 'SALAH',
      ekstra: 'BOLA EKSTRA', ekstraMain: 'MAIN LAGI', terkunci: 'BOLA DIKUNCI', satuLagi: 'SATU LAGI = MULTIBALL', multiball: 'MULTIBALL',
      jackpotSoal: 'JAWAPAN BETUL = JACKPOT', simpan: 'BOLA DISELAMATKAN', bonus: 'BONUS', tilt: 'TILT', awas: 'AWAS', soal: 'SOALAN', selesai: 'GAME OVER',
      demo: 'PINBALL CLAWD', demo2: 'TEKAN MAIN'
    }
  }
};
export const t = () => TEKS[SET.bhs] || TEKS.id;
