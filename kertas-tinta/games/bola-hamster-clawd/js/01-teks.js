/* 01 — Teks dwibahasa: Bahasa Melayu (ms) dan English (en). Tukar bahasa bila-bila masa. */
var HB = window.HB = {};

HB.TEKS = {
  ms: {
    tagline: 'Matematik · bola hamster · 4 trek terapung',
    title1: 'Bola Hamster', title2: 'Clawd',
    intro: 'Clawd masuk ke dalam bola lutsinar dan bergolek di trek yang terapung di awan. Jangan jatuh dari tepi! Di setiap gerbang ada soalan matematik: golek melalui pintu yang jawapannya betul.',
    f1: 'Condongkan bola dengan anak panah, WASD, atau seret jari di skrin.',
    f2: 'Gerbang soalan: masuk pintu jawapan betul, pintu salah melantunkan bola.',
    f3: 'Kutip biji bunga matahari dan capai garisan penamat secepat mungkin.',
    lv1: 'Mudah', lv1d: 'Tahun 1–2 · tambah & tolak hingga 20',
    lv2: 'Sederhana', lv2d: 'Tahun 3–4 · hingga 100, sifir 2–5',
    lv3: 'Mencabar', lv3d: 'Tahun 5–6 · darab & bahagi sifir 2–10',
    menuNote: 'Pilih tahap untuk mula dari Trek 1.',
    track: 'Trek', locked: 'Berkunci', best: 'Terbaik',
    tr: [
      { n: 'Taman Biji', f: 'Trek latihan. Laluan lebar, sedikit lantunan. Rasa bagaimana bola bergolek dan berhenti.', g: 'Golek ke bendera penamat dan jawab 2 soalan.' },
      { n: 'Jambatan Ais', f: 'Lantai ais sangat licin: bola susah berhenti! Brek awal dengan menekan arah bertentangan.', g: 'Lalu jambatan sempit dan jawab 3 soalan.' },
      { n: 'Kilang Gear', f: 'Tali sawat menolak bola, kayu penyapu berputar, dan Si Comot meronda. Tunggu masa yang sesuai.', g: 'Elak penyapu dan Si Comot, jawab 3 soalan.' },
      { n: 'Menara Awan', f: 'Naik pelantar bergerak merentas awan. Tunggu pelantar datang, kemudian golek perlahan ke atasnya.', g: 'Tunggang pelantar dan jawab 3 soalan terakhir.' }
    ],
    trackOf: function (i, n) { return 'Trek ' + i + ' daripada ' + n; },
    go: 'Mula bergolek', next: 'Trek seterusnya',
    keys: 'Papan kekunci: <kbd>←</kbd><kbd>↑</kbd><kbd>→</kbd><kbd>↓</kbd> atau <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> golek, <kbd>Enter</kbd> mula',
    soundOn: 'Bunyi: hidup', soundOff: 'Bunyi: mati', quit: 'Keluar',
    goalRoll: 'Golek ke gerbang seterusnya!', goalFinish: 'Gerbang selesai! Terus ke bendera penamat.',
    hintDrag: 'Seret jari ke arah mahu bergolek', hintKeys: 'Tekan anak panah untuk bergolek',
    correct: function (e) { return 'Betul! ' + e; }, wrong: function (e) { return 'Belum tepat. ' + e; },
    checkpoint: 'Titik simpan!', tryOther: 'Cuba pintu lain!', bonus: 'Bonus masa', fell: 'Alamak, jatuh! Cuba lagi dari titik simpan.',
    seedT: 'BIJI!', tingT: 'BETUL!', bonkT: 'BONK!', pushT: 'TOLAK!',
    score: 'Markah', firstTry: 'Betul kali pertama', seeds: 'Biji', time: 'Masa',
    recapT: 'Soalan yang anda jawab:',
    winTag: 'Semua trek selesai', winH: 'Clawd tiba di puncak awan!',
    winMsg: function (s) { return s === 3 ? 'Hebat! Hampir semua soalan betul pada percubaan pertama.' : s === 2 ? 'Bagus! Cuba lagi untuk 3 bintang: jawab betul pada percubaan pertama.' : 'Syabas kerana tamat! Main lagi dan baca soalan dengan teliti.'; },
    loseTag: 'Nyawa habis', loseH: 'Bola terjatuh terlalu kerap',
    loseMsg: 'Golek perlahan di tepi trek dan brek awal di lantai ais. Anda boleh cuba lagi dari trek ini.',
    again: 'Main lagi', retry: 'Cuba lagi trek ini', menu: 'Tukar tahap',
    bestOf: function (p) { return 'Markah terbaik tahap ini: ' + p; },
    lvName: { mudah: 'Mudah', sederhana: 'Sederhana', mencabar: 'Mencabar' },
    how: function (a, op, b, r) { return a + ' ' + op + ' ' + b + ' = ' + r; },
    clear: 'Trek selesai!'
  },
  en: {
    tagline: 'Maths · hamster ball · 4 floating tracks',
    title1: 'Clawd’s', title2: 'Hamster Ball',
    intro: 'Clawd climbs into a clear ball and rolls along tracks floating in the clouds. Don’t fall off the edge! Every gate has a maths question: roll through the door with the right answer.',
    f1: 'Tilt the ball with the arrow keys, WASD, or by dragging on the screen.',
    f2: 'Question gates: roll into the right answer, wrong doors bounce you back.',
    f3: 'Collect sunflower seeds and reach the finish line as fast as you can.',
    lv1: 'Easy', lv1d: 'Year 1–2 · add & subtract within 20',
    lv2: 'Medium', lv2d: 'Year 3–4 · within 100, times tables 2–5',
    lv3: 'Challenge', lv3d: 'Year 5–6 · times & divide tables 2–10',
    menuNote: 'Choose a level to start from Track 1.',
    track: 'Track', locked: 'Locked', best: 'Best',
    tr: [
      { n: 'Seed Garden', f: 'A practice track. Wide paths and a few bumpers. Feel how the ball rolls and stops.', g: 'Roll to the finish flag and answer 2 questions.' },
      { n: 'Ice Bridge', f: 'The ice is very slippery: the ball hardly stops! Brake early by pressing the opposite way.', g: 'Cross the narrow bridges and answer 3 questions.' },
      { n: 'Gear Factory', f: 'Conveyor belts push the ball, sweepers spin, and Smudge patrols. Wait for the right moment.', g: 'Dodge the sweepers and Smudge, answer 3 questions.' },
      { n: 'Cloud Tower', f: 'Ride moving platforms across the clouds. Wait for the platform, then roll gently onto it.', g: 'Ride the platforms and answer the last 3 questions.' }
    ],
    trackOf: function (i, n) { return 'Track ' + i + ' of ' + n; },
    go: 'Start rolling', next: 'Next track',
    keys: 'Keyboard: <kbd>←</kbd><kbd>↑</kbd><kbd>→</kbd><kbd>↓</kbd> or <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> to roll, <kbd>Enter</kbd> to start',
    soundOn: 'Sound: on', soundOff: 'Sound: off', quit: 'Exit',
    goalRoll: 'Roll to the next gate!', goalFinish: 'Gates done! Head for the finish flag.',
    hintDrag: 'Drag your finger the way you want to roll', hintKeys: 'Press the arrow keys to roll',
    correct: function (e) { return 'Correct! ' + e; }, wrong: function (e) { return 'Not quite. ' + e; },
    checkpoint: 'Checkpoint!', tryOther: 'Try another door!', bonus: 'Time bonus', fell: 'Oops, you fell! Try again from the checkpoint.',
    seedT: 'SEED!', tingT: 'RIGHT!', bonkT: 'BONK!', pushT: 'SHOVE!',
    score: 'Score', firstTry: 'Right first time', seeds: 'Seeds', time: 'Time',
    recapT: 'Questions you answered:',
    winTag: 'All tracks cleared', winH: 'Clawd made it to the top of the clouds!',
    winMsg: function (s) { return s === 3 ? 'Brilliant! Nearly every question right on the first try.' : s === 2 ? 'Nice! For 3 stars, answer right on the first try.' : 'Well done for finishing! Play again and read each question carefully.'; },
    loseTag: 'Out of lives', loseH: 'The ball fell too many times',
    loseMsg: 'Roll slowly near the edges and brake early on ice. You can retry from this track.',
    again: 'Play again', retry: 'Retry this track', menu: 'Change level',
    bestOf: function (p) { return 'Best score at this level: ' + p; },
    lvName: { mudah: 'Easy', sederhana: 'Medium', mencabar: 'Challenge' },
    how: function (a, op, b, r) { return a + ' ' + op + ' ' + b + ' = ' + r; },
    clear: 'Track cleared!'
  }
};

HB.lang = (function () {
  var q = new URLSearchParams(location.search).get('lang');
  if (q === 'en' || q === 'ms') return q;
  try { var s = localStorage.getItem('hb-lang'); if (s === 'en' || s === 'ms') return s; } catch (e) { /* tiada storan */ }
  return 'ms';
})();
HB.T = function (k) { return HB.TEKS[HB.lang][k]; };
HB.setLang = function (l) {
  HB.lang = l;
  try { localStorage.setItem('hb-lang', l); } catch (e) { /* tiada storan */ }
  document.documentElement.lang = l;
  document.querySelectorAll('[data-t]').forEach(function (el) {
    var v = HB.T(el.getAttribute('data-t'));
    if (typeof v === 'string') el.innerHTML = v;
  });
  document.querySelectorAll('[data-lang]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-lang') === l); });
  if (HB.onLang) HB.onLang();
};
