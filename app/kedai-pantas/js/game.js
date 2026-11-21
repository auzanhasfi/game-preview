'use strict';
(function () {
  var $ = function (s) { return document.querySelector(s); };
  var KUNCI = 'kedaipantas.v1';
  var S = {keadaan: 'menu', lang: 'ms', tahap: 0, cfg: null, skor: 0, nyawa: 3, kombo: 0, ke: 0, layan: 0, sempurna: 0,
    p: null, sela: 0, jeda: false, skala: 1, rng: null, bintang: 0, kalah: false, benih: 0, tamat: false};
  var simpanan = {rekod: {}};
  var toastT = 0, maskotT = 0;

  function T(k) { return (I18N[S.lang] || I18N.ms)[k]; }
  function Ng() { return NEGARA[S.lang]; }
  function muat() { try { var o = JSON.parse(localStorage.getItem(KUNCI)); if (o) simpanan = o; } catch (e) {} if (!simpanan.rekod) simpanan.rekod = {}; }
  function simpan() { try { localStorage.setItem(KUNCI, JSON.stringify(simpanan)); } catch (e) {} }
  function show(id) { ['menu', 'main', 'hasil'].forEach(function (s) { $('#' + s).hidden = s !== id; }); S.keadaan = id === 'main' ? 'main' : id; }
  function ambangBintang(cfg) { return {b2: cfg.pelanggan * 180, b3: cfg.pelanggan * 250}; }

  /* ---------- bahasa & menu ---------- */
  function terapBahasa() {
    document.documentElement.lang = S.lang;
    document.title = T('tajuk');
    document.querySelectorAll('[data-t]').forEach(function (e) { e.textContent = T(e.getAttribute('data-t')); });
    document.querySelectorAll('[data-loc]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-loc') === S.lang ? 'true' : 'false'); });
    $('#papanKedai').textContent = T('kedai');
    $('#cara').innerHTML = '<li>' + T('cara1') + '</li><li>' + T('cara2') + '</li><li>' + T('cara3') + '</li>';
    $('#btnJeda').innerHTML = Seni.ikon('jeda'); $('#btnJeda').setAttribute('aria-label', T('jeda'));
    ikonBunyi();
    bangunKad();
    $('#maskotMenu').innerHTML = Seni.bulat('gembira');
  }
  function ikonBunyi() { var b = $('#btnBunyi'); b.innerHTML = Seni.ikon(Bunyi.aktif() ? 'bunyiOn' : 'bunyiOff', 24); b.setAttribute('aria-label', T('bunyi')); }
  function bangunKad() {
    var h = '';
    TAHAP.forEach(function (t) {
      var r = simpanan.rekod['t' + t.id] || {b: 0, s: 0}, bt = '';
      for (var i = 1; i <= 3; i++) bt += Seni.bintang(i <= r.b, 20);
      h += '<button class="kad" data-aksi="tahap" data-n="' + t.id + '" data-uji="tahap-' + t.id + '"><span class="no">' + t.id + '</span>' +
        '<span class="teks"><b>' + T('tahapN') + ' ' + t.id + ': ' + T('t' + t.id) + '</b><span>' + t.pelanggan + ' ' + T('pelanggan') + (r.s ? ' · ' + T('terbaik') + ' ' + r.s : '') + '</span></span><span class="bt">' + bt + '</span></button>';
    });
    $('#kadTahap').innerHTML = h;
  }

  /* ---------- mula tahap ---------- */
  function mulaiTahap(n) {
    var cfg = TAHAP[n - 1]; if (!cfg) return;
    Bunyi.buka();
    S.tahap = n; S.cfg = cfg; S.skor = 0; S.nyawa = 3; S.kombo = 0; S.ke = 0; S.layan = 0; S.sempurna = 0; S.p = null; S.sela = 0.5;
    S.jeda = false; S.kalah = false; S.tamat = false;
    var q = /[?&]benih=(\d+)/.exec(location.search); S.benih = q ? +q[1] : (Date.now() % 1000000);
    S.rng = mulberry(S.benih + n * 7919);
    $('#tirai').hidden = true;
    $('#pelanggan').innerHTML = ''; $('#gelembung').innerHTML = ''; $('#gelembung').hidden = true;
    $('#panel').innerHTML = ''; $('#resit').innerHTML = ''; $('#arahan').textContent = '';
    $('#sabar').style.width = '100%';
    show('main'); setMaskot('tenang'); hud(); giliran();
  }

  function hud() {
    var h = ''; for (var i = 0; i < 3; i++) h += Seni.hati(i >= S.nyawa);
    $('#nyawa').innerHTML = h; $('#nyawa').setAttribute('aria-label', T('nyawa') + ' ' + S.nyawa);
    $('#skor').textContent = S.skor;
    var k = $('#kombo'); if (S.kombo >= 2) { k.hidden = false; k.textContent = T('kombo') + ' x' + S.kombo; } else k.hidden = true;
  }
  function giliran() {
    var n = Math.min(S.ke + (S.p && S.p.aktif ? 0 : 1), S.cfg.pelanggan);
    $('#giliran').innerHTML = Seni.ikon('orang', 14) + '<span>' + Math.min(S.ke + 1, S.cfg.pelanggan) + '/' + S.cfg.pelanggan + '</span>';
  }

  /* ---------- pelanggan ---------- */
  function mulaiPelanggan() {
    if (S.nyawa <= 0 || S.ke >= S.cfg.pelanggan) { selesai(); return; }
    var ps = buatPesanan(S.lang, S.cfg, S.rng);
    S.p = {pesanan: ps, sabarMax: S.cfg.sabar, sabar: S.cfg.sabar, dibeli: {}, diberi: 0, diberiList: {}, fasa: 'barang', salah: 0, aktif: true,
      varian: Math.floor(S.rng() * Seni.nVarian), mood: 'tenang', petunjuk: ''};
    var el = $('#pelanggan'); el.className = 'pelanggan'; void el.offsetWidth; el.className = 'pelanggan masuk';
    renderPelanggan('tenang'); giliran(); Bunyi.masuk();
    $('#gelembung').hidden = false;
    ke('barang');
  }
  function renderPelanggan(mood) { S.p.mood = mood; $('#pelanggan').innerHTML = Seni.pelanggan(S.p.varian, mood); }
  function ke(fasa) {
    S.p.fasa = fasa; S.p.petunjuk = '';
    renderGelembung(); renderPanel(); renderResit(); renderArahan();
  }
  function namaBarang(id) { var b = Ng().barang; for (var i = 0; i < b.length; i++) if (b[i].id === id) return b[i].nama; return id; }

  function renderGelembung() {
    var p = S.p, ps = p.pesanan, h = '';
    if (p.fasa === 'barang' || p.fasa === 'diskaun') {
      ps.baris.forEach(function (r) { h += '<div class="gb"><span class="gi">' + Seni.barang(r.id, 26) + '</span><b>' + r.qty + ' x</b><span>' + namaBarang(r.id) + '</span></div>'; });
      if (ps.diskaun) h += '<span class="lencana-disk">' + T('diskaun') + ' ' + ps.diskaun + '%</span>';
    } else {
      h = '<div class="g-bayar baru">' + Seni.wang(S.lang, ps.nota, 74) + '<div><small>' + T('wangSaya') + '</small><b>' + Ng().fmt(ps.nota) + '</b></div></div>';
    }
    $('#gelembung').innerHTML = h;
  }
  function renderArahan() {
    var p = S.p, urut = S.cfg.diskaun ? ['barang', 'diskaun', 'terima', 'baki'] : ['barang', 'terima', 'baki'];
    var pip = '<span class="pip">'; var idx = urut.indexOf(p.fasa);
    urut.forEach(function (f, i) { pip += '<i class="' + (i < idx ? 'siap' : i === idx ? 'on' : '') + '"></i>'; }); pip += '</span>';
    $('#arahan').innerHTML = pip + '<span>' + T('arah_' + p.fasa) + '</span>';
  }

  /* ---------- panel ikut fasa ---------- */
  function jumlahBeg() { var t = 0, d = S.p.dibeli; for (var id in d) t += d[id] * hargaBarang(S.lang, id); return t; }
  function kosongBeg() { for (var id in S.p.dibeli) if (S.p.dibeli[id] > 0) return false; return true; }

  function renderPanel() {
    var p = S.p, N = Ng(), h = '';
    if (p.fasa === 'barang') {
      h = '<div class="rak">';
      N.barang.forEach(function (b) {
        h += '<button class="rak-btn" data-aksi="barang" data-id="' + b.id + '" data-uji="barang-' + b.id + '" aria-label="' + b.nama + ' ' + N.fmt(b.harga) + '">' + Seni.barang(b.id, 36) +
          '<b>' + b.nama + '</b><em>' + N.fmt(b.harga) + '</em><i class="lcn" hidden></i></button>';
      });
      h += '</div><div class="baris-btn"><button class="btn utama" data-aksi="siap" data-uji="siap" id="btnSiap" disabled>' + Seni.ikon('semak', 22) + T('siap') + '</button></div>';
    } else if (p.fasa === 'diskaun') {
      h = '<div class="opsi-disk">';
      p.pesanan.opsiDisk.forEach(function (v) { h += '<button class="opsi" data-aksi="diskaun" data-nilai="' + v + '" data-uji="disk-' + v + '">' + N.fmt(v) + '</button>'; });
      h += '</div>';
    } else if (p.fasa === 'terima') {
      h = '<div class="terima-wrap"><button class="terima-btn" data-aksi="terima" data-uji="terima">' + Seni.wang(S.lang, p.pesanan.nota, 130) + '<span>' + N.fmt(p.pesanan.nota) + '</span></button></div>';
    } else if (p.fasa === 'baki') {
      h = '<div class="tray">';
      N.denom.forEach(function (d) { h += '<button class="wang-btn" data-aksi="uang" data-nilai="' + d + '" data-uji="uang-' + d + '" aria-label="' + N.fmtDenom(d) + '">' + Seni.wang(S.lang, d) + '</button>'; });
      h += '</div><div class="baris-btn"><button class="btn kecil-btn" data-aksi="kosong" data-uji="kosong">' + Seni.ikon('getah', 20) + T('kosong') + '</button>' +
        '<button class="btn utama" data-aksi="beri" data-uji="beri">' + Seni.ikon('semak', 22) + T('beri') + '</button></div>';
    }
    $('#panel').innerHTML = h;
    kemasBadge();
  }
  function kemasBadge() {
    if (S.p.fasa !== 'barang') return;
    document.querySelectorAll('.rak-btn').forEach(function (b) {
      var q = S.p.dibeli[b.getAttribute('data-id')] || 0, l = b.querySelector('.lcn'); l.hidden = !q; l.textContent = q;
    });
    var s = $('#btnSiap'); if (s) s.disabled = kosongBeg();
  }
  function renderResit() {
    var p = S.p, N = Ng(), ps = p.pesanan, h = '';
    if (p.fasa === 'barang') {
      h = '<div class="beg" data-uji="beg">';
      var ada = false;
      ps.baris.concat(Ng().barang.filter(function (b) { return !ps.baris.some(function (r) { return r.id === b.id; }); }).map(function (b) { return {id: b.id}; })).forEach(function (r) {
        var q = p.dibeli[r.id] || 0; if (!q) return; ada = true;
        h += '<button class="cip" data-aksi="buang" data-id="' + r.id + '" data-uji="buang-' + r.id + '" aria-label="' + T('buang') + ': ' + namaBarang(r.id) + '">' + Seni.barang(r.id, 28) + 'x' + q + '</button>';
      });
      if (!ada) h += '<span class="kosong">' + T('begKosong') + '</span>';
      h += '</div><div class="jumlah"><small>' + T('jumlah') + '</small><b data-uji="jumlah">' + N.fmt(jumlahBeg()) + '</b></div>';
    } else if (p.fasa === 'diskaun') {
      h = '<div class="ringkas"><span>' + T('jumlah') + '</span><b>' + N.fmt(ps.jumlah) + '</b><span>' + T('diskaun') + '</span><b>' + ps.diskaun + '%</b></div>';
    } else if (p.fasa === 'terima') {
      h = '<div class="ringkas"><span>' + T('bayar') + '</span><b data-uji="bayar">' + N.fmt(ps.bayarJumlah) + '</b></div>';
    } else {
      var chips = '';
      N.denom.forEach(function (d) { var q = p.diberiList[d]; if (q) chips += '<span class="mini">' + Seni.wang(S.lang, d, 22) + 'x' + q + '</span>'; });
      h = '<div class="ringkas"><span>' + T('bayar') + '</span><b>' + N.fmt(ps.bayarJumlah) + '</b><span>' + T('diterima') + '</span><b>' + N.fmt(ps.nota) + '</b>' +
        '<div class="beri"><span>' + T('diberi') + ':</span><b data-uji="diberi">' + N.fmt(p.diberi) + '</b>' + chips + '</div></div>';
    }
    $('#resit').innerHTML = h;
  }

  /* ---------- tindakan ---------- */
  function pesananSama() {
    var d = S.p.dibeli, ps = S.p.pesanan.baris, n = 0;
    for (var i = 0; i < ps.length; i++) { if ((d[ps[i].id] || 0) !== ps[i].qty) return false; n++; }
    for (var id in d) if (d[id] > 0 && !ps.some(function (r) { return r.id === id; })) return false;
    return true;
  }
  function salah(jenis) {
    var p = S.p; p.salah++; p.sabar = Math.max(0.5, p.sabar - 2.5); S.kombo = 0;
    Bunyi.salah(); setMaskot('oops'); tunjuk(T(jenis), 'salah'); hud();
    var pn = $('#panel'); pn.classList.remove('goyang'); void pn.offsetWidth; pn.classList.add('goyang');
    var pl = $('#pelanggan'); pl.classList.remove('goyang'); void pl.offsetWidth; pl.classList.add('goyang');
  }
  function tunjuk(teks, jenis) {
    var t = $('#toast'); t.textContent = teks; t.className = 'toast nampak ' + (jenis || '');
    clearTimeout(toastT); toastT = setTimeout(function () { t.className = 'toast'; }, 1500);
  }
  function setMaskot(mood, lompat) {
    var el = $('#penjual'); el.innerHTML = Seni.bulat(mood);
    if (lompat) { el.classList.remove('lompat'); void el.offsetWidth; el.classList.add('lompat'); }
    clearTimeout(maskotT); if (mood !== 'tenang') maskotT = setTimeout(function () { if (S.keadaan === 'main') $('#penjual').innerHTML = Seni.bulat('tenang'); }, 1600);
  }

  function aksi(a, el) {
    if (a === 'bunyi') { Bunyi.aktif(!Bunyi.aktif()); try { localStorage.setItem(KUNCI + '.bunyi', Bunyi.aktif() ? '1' : '0'); } catch (e) {} ikonBunyi(); Bunyi.tap(); return; }
    if (a === 'tahap') { mulaiTahap(+el.getAttribute('data-n')); return; }
    if (a === 'ulang') { mulaiTahap(S.tahap); return; }
    if (a === 'seterusnya') { mulaiTahap(S.tahap + 1); return; }
    if (a === 'menu' || a === 'keluar') { S.jeda = false; $('#tirai').hidden = true; bangunKad(); show('menu'); Bunyi.tap(); return; }
    if (a === 'jeda') { S.jeda = true; $('#tirai').hidden = false; Bunyi.tap(); return; }
    if (a === 'sambung') { S.jeda = false; $('#tirai').hidden = true; Bunyi.tap(); return; }
    if (S.keadaan !== 'main' || !S.p || !S.p.aktif || S.jeda) return;
    var p = S.p, id;
    if (a === 'barang' && p.fasa === 'barang') { id = el.getAttribute('data-id'); if ((p.dibeli[id] || 0) < 9) p.dibeli[id] = (p.dibeli[id] || 0) + 1; Bunyi.tap(); kemasBadge(); renderResit(); }
    else if (a === 'buang' && p.fasa === 'barang') { id = el.getAttribute('data-id'); p.dibeli[id] = Math.max(0, (p.dibeli[id] || 0) - 1); Bunyi.tap(); kemasBadge(); renderResit(); }
    else if (a === 'siap' && p.fasa === 'barang') { if (pesananSama()) { Bunyi.betul(); setMaskot('gembira'); ke(p.pesanan.diskaun ? 'diskaun' : 'terima'); } else salah('s_barang'); }
    else if (a === 'diskaun' && p.fasa === 'diskaun') {
      if (+el.getAttribute('data-nilai') === p.pesanan.bayarJumlah) { Bunyi.betul(); setMaskot('gembira'); ke('terima'); }
      else { el.classList.add('salah'); salah('s_disk'); }
    }
    else if (a === 'terima' && p.fasa === 'terima') { Bunyi.koin(); ke('baki'); }
    else if (a === 'uang' && p.fasa === 'baki') { var d = +el.getAttribute('data-nilai'); p.diberi += d; p.diberiList[d] = (p.diberiList[d] || 0) + 1; Bunyi.koin(); renderResit(); }
    else if (a === 'kosong' && p.fasa === 'baki') { p.diberi = 0; p.diberiList = {}; Bunyi.tap(); renderResit(); }
    else if (a === 'beri' && p.fasa === 'baki') {
      if (p.diberi === p.pesanan.baki) sukses();
      else salah(p.diberi > p.pesanan.baki ? 's_lebih' : 's_kurang');
    }
  }

  function sukses() {
    var p = S.p, frac = Math.max(0, p.sabar / p.sabarMax), pts = 100 + Math.round(100 * frac);
    if (p.salah === 0 && frac >= 0.35) { S.kombo++; S.sempurna++; pts = Math.round(pts * (1 + 0.25 * (Math.min(S.kombo, 5) - 1))); }
    else { S.kombo = 0; if (p.salah > 0) pts = Math.round(pts * 0.6); }
    S.skor += pts; S.layan++; S.ke++; p.aktif = false;
    renderPelanggan('senang'); setMaskot('sorak', true);
    var puji = T('puji'); tunjuk(puji[Math.floor(Math.random() * puji.length)], 'betul');
    var pop = document.createElement('div'); pop.className = 'pop'; pop.textContent = '+' + pts; $('#adegan').appendChild(pop); setTimeout(function () { pop.remove(); }, 1000);
    if (S.kombo >= 2) Bunyi.kombo(S.kombo); else Bunyi.betul();
    Bunyi.koin(); hud(); keluarkan('keluar-senang', 0.9);
  }
  function pergi() {
    var p = S.p; p.aktif = false; S.nyawa--; S.kombo = 0; S.ke++;
    renderPelanggan('marah'); setMaskot('oops'); tunjuk(T('lari'), 'salah'); Bunyi.pergi(); hud();
    if (S.nyawa <= 0) S.kalah = true;
    keluarkan('keluar-marah', 1.1);
  }
  function keluarkan(kelas, jeda) {
    setTimeout(function () { var el = $('#pelanggan'); el.className = 'pelanggan ' + kelas; $('#gelembung').hidden = true; }, 350);
    $('#panel').innerHTML = ''; $('#resit').innerHTML = ''; $('#arahan').textContent = '';
    S.sela = jeda;
  }

  function selesai() {
    if (S.tamat) return; S.tamat = true;
    var c = S.cfg, a = ambangBintang(c);
    S.bintang = S.kalah ? 0 : (S.skor >= a.b3 ? 3 : S.skor >= a.b2 ? 2 : 1);
    var r = simpanan.rekod['t' + c.id] || {b: 0, s: 0}, baru = S.skor > r.s;
    simpanan.rekod['t' + c.id] = {b: Math.max(r.b, S.bintang), s: Math.max(r.s, S.skor)}; simpan();
    var bt = ''; for (var i = 1; i <= 3; i++) bt += Seni.bintang(i <= S.bintang, 54);
    $('#bintang').innerHTML = bt; $('#bintang').setAttribute('aria-label', S.bintang + ' ' + T('bintang'));
    $('#hasilTajuk').textContent = S.kalah ? T('kalah') : T('menang');
    $('#maskotHasil').innerHTML = Seni.bulat(S.kalah ? 'oops' : (S.bintang >= 2 ? 'sorak' : 'gembira'));
    $('#statistik').innerHTML = '<div class="stat lebar"><small>' + T('skor') + '</small><b data-uji="skor-akhir">' + S.skor + '</b>' + (baru && S.skor > 0 ? '<div class="rekod">' + T('rekodBaru') + '</div>' : '') + '</div>' +
      '<div class="stat"><small>' + T('dilayan') + '</small><b>' + S.layan + '/' + c.pelanggan + '</b></div><div class="stat"><small>' + T('tepat') + '</small><b>' + S.sempurna + '</b></div>' +
      '<div class="stat lebar"><small>' + T('tahapN') + ' ' + c.id + '</small><span>' + T('syarat').replace('{a}', a.b2).replace('{b}', a.b3) + '</span></div>';
    $('#btnSeterusnya').hidden = S.kalah || c.id >= TAHAP.length;
    show('hasil'); if (S.kalah) Bunyi.kalah(); else Bunyi.menang();
  }

  /* ---------- gelung ---------- */
  function tick(dt) {
    if (S.keadaan !== 'main' || S.jeda || !S.cfg) return;
    if (S.sela > 0) { S.sela -= dt; if (S.sela <= 0) mulaiPelanggan(); return; }
    var p = S.p; if (!p || !p.aktif) return;
    p.sabar -= dt;
    var f = Math.max(0, p.sabar / p.sabarMax), b = $('#sabar');
    b.style.width = (f * 100).toFixed(1) + '%'; b.className = f < 0.2 ? 'kritis' : f < 0.45 ? 'rendah' : '';
    var mood = f < 0.35 ? 'marah' : 'tenang';
    if (mood !== p.mood) renderPelanggan(mood);
    if (p.sabar <= 0) pergi();
  }
  var last = 0;
  function loop(t) { var dt = Math.min(0.1, (t - last) / 1000 || 0); last = t; try { tick(dt * S.skala); } catch (e) { console.error(e); } requestAnimationFrame(loop); }

  /* ---------- init ---------- */
  document.addEventListener('click', function (e) {
    var l = e.target.closest('[data-loc]');
    if (l) { S.lang = l.getAttribute('data-loc'); try { localStorage.setItem(KUNCI + '.lang', S.lang); } catch (x) {} terapBahasa(); Bunyi.tap(); return; }
    var el = e.target.closest('[data-aksi]'); if (el) aksi(el.getAttribute('data-aksi'), el);
  });
  document.addEventListener('visibilitychange', function () { if (document.hidden && S.keadaan === 'main' && !S.jeda) { S.jeda = true; $('#tirai').hidden = false; } });

  muat();
  try { var lg = localStorage.getItem(KUNCI + '.lang'); if (lg === 'ms' || lg === 'id') S.lang = lg; if (localStorage.getItem(KUNCI + '.bunyi') === '0') Bunyi.aktif(false); } catch (e) {}
  var qb = /[?&]bahasa=(ms|id)/.exec(location.search); if (qb) S.lang = qb[1];
  terapBahasa(); show('menu'); requestAnimationFrame(loop);

  /* untuk ujian automatik */
  window.__game = {
    get keadaan() { return S.keadaan; }, get skor() { return S.skor; }, get nyawa() { return S.nyawa; }, get kombo() { return S.kombo; },
    get bintang() { return S.bintang; }, get tahap() { return S.tahap; }, get lang() { return S.lang; }, get fasa() { return S.p ? S.p.fasa : null; },
    get aktif() { return !!(S.p && S.p.aktif); }, get pesanan() { return S.p ? S.p.pesanan : null; }, get dibeli() { return S.p ? S.p.dibeli : null; },
    get denom() { return Ng().denom; }, get jeda() { return S.jeda; }, get layan() { return S.layan; },
    set skala(v) { S.skala = v; }, get skala() { return S.skala; },
    mulaiTahap: mulaiTahap,
    jawabUji: function (betul) {
      if (!S.p || !S.p.aktif) return;
      if (betul) { S.p.diberi = S.p.pesanan.baki; sukses(); } else pergi();
    }
  };
})();
