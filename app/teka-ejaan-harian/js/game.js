(function () {
  'use strict';
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const T0 = TEJA, M = MASKOT, MAKS = 6;
  const EXTRA = {
    ms: { len: n => `Kata ${n} huruf. Enam cubaan.`, cuba: (c) => `Cubaan ${c} daripada 6`, kelasLen: n => `Kata ${n} huruf daripada cikgu`, tanpaMakna: 'Cikgu tidak beri petunjuk untuk kata ini.', bagus: 'Ada huruf tepat!', hampir: 'Hampir! Tukar kedudukan huruf kuning.', nol: 'Tiada huruf sepadan. Cuba kata lain.', bahasa: 'BM', hariTajuk: 'Teka Ejaan', jumlah: 'Kata', ke: 'Kata ke' },
    id: { len: n => `Kata ${n} huruf. Enam percobaan.`, cuba: (c) => `Percobaan ${c} dari 6`, kelasLen: n => `Kata ${n} huruf dari guru`, tanpaMakna: 'Guru tidak memberi petunjuk untuk kata ini.', bagus: 'Ada huruf tepat!', hampir: 'Hampir! Tukar posisi huruf kuning.', nol: 'Tidak ada huruf cocok. Coba kata lain.', bahasa: 'ID', hariTajuk: 'Tebak Kata', jumlah: 'Kata', ke: 'Kata ke' }
  };
  let store = { lang: 'ms', ms: {}, id: {} };
  try { const r = JSON.parse(localStorage.getItem('teja-v1')); if (r && typeof r === 'object') store = Object.assign(store, r); } catch (e) {}
  const simpan = () => { try { localStorage.setItem('teja-v1', JSON.stringify(store)); } catch (e) {} };
  const bag = l => (store[l] = store[l] || {});
  const stat = l => { const b = bag(l); b.stat = b.stat || { main: 0, menang: 0, streak: 0, maks: 0, dist: [0, 0, 0, 0, 0, 0], lastWin: '' }; return b.stat; };

  const S = { lang: store.lang === 'id' ? 'id' : 'ms', skrin: 'menu', mod: '', jawapan: '', makna: '', len: 5, baris: [], cur: '', tamat: false, menang: false, hint: false, kunci: false, kelas: null, kelasI: -1, tarikh: '', keyState: {}, terakhir: '' };
  const tt = () => I18N[S.lang], xx = () => EXTRA[S.lang];
  let toastT = 0;
  function toast(m, ms) { const e = $('#toast'); e.textContent = m; e.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => e.classList.remove('on'), ms || 1400); }
  const wait = ms => new Promise(r => setTimeout(r, ms));

  function terap() {
    document.documentElement.lang = S.lang === 'id' ? 'id' : 'ms';
    $$('[data-t]').forEach(e => e.textContent = tt()[e.dataset.t]);
    $('#btnHarian').innerHTML = M.ikon('cal') + tt().harian;
    $('#btnLatihan').innerHTML = M.ikon('dumbbell') + tt().latihan;
    $('#btnCikgu').innerHTML = M.ikon('teacher') + tt().cikgu;
    $('#btnLang').textContent = xx().bahasa === 'BM' ? 'BM' : 'ID';
    $('#btnLang').setAttribute('aria-label', tt().bahasaBtn);
    $('#btnStat').innerHTML = M.ikon('stat'); $('#btnStat').setAttribute('aria-label', tt().stat);
    $('#btnBack').innerHTML = M.ikon('back'); $('#btnBack').setAttribute('aria-label', tt().kembali);
    $('#btnHint').innerHTML = M.ikon('hint'); $('#btnHint').setAttribute('aria-label', tt().petunjuk);
    $('#btnSnd').innerHTML = M.ikon(BUNYI.senyap ? 'sndOff' : 'sndOn'); $('#btnSnd').setAttribute('aria-label', tt().bunyi);
    $$('.pil').forEach(p => p.classList.toggle('on', p.dataset.loc === S.lang));
    $('#cTeks').placeholder = tt().cContoh;
    $('#cBuat').innerHTML = M.ikon('link') + tt().cBuat; $('#cSalin').innerHTML = M.ikon('share', 20) + tt().cSalin; $('#cCuba').innerHTML = M.ikon('play', 20) + tt().cCuba;
    $('#hKongsiBtn').innerHTML = M.ikon('share', 20) + tt().kongsi; $('#hStat').innerHTML = M.ikon('stat', 20) + tt().stat; $('#hMenu').innerHTML = M.ikon('home', 20) + tt().menu;
    $('#sTutup').textContent = tt().tutup;
    $('#mMenu').innerHTML = M.clawd('senang', true);
    judul(); if (S.skrin === 'cikgu') cInfoUpdate();
  }
  function judul() {
    const j = S.skrin === 'menu' ? '' : S.skrin === 'cikgu' ? tt().cT : S.mod === 'harian' ? tt().harian + ' ' + S.tarikh.slice(5).split('-').reverse().join('/') : S.mod === 'kelas' ? tt().kelas : tt().latihan;
    $('#barJudul').textContent = j;
  }
  function tunjuk(nama) {
    S.skrin = nama;
    ['menu', 'main', 'cikgu'].forEach(n => $('#' + n).hidden = n !== nama);
    $('#btnBack').hidden = nama === 'menu'; $('#btnLang').hidden = nama !== 'menu'; $('#btnHint').hidden = nama !== 'main';
    judul(); window.scrollTo(0, 0);
  }
  function setLang(l) { S.lang = l; store.lang = l; simpan(); terap(); }
  const mood = (m) => { $('#mMain').innerHTML = M.clawd(m); };
  const bubble = t => { $('#bubble').textContent = t; };

  /* ---------- papan ---------- */
  function binaGrid() {
    const g = $('#grid'); g.style.setProperty('--n', S.len); g.innerHTML = ''; g.className = 'grid';
    for (let r = 0; r < MAKS; r++) for (let c = 0; c < S.len; c++) { const d = document.createElement('div'); d.className = 'sel'; d.id = `s${r}-${c}`; d.style.setProperty('--i', c); g.appendChild(d); }
  }
  const BARIS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
  function binaKbd() {
    const k = $('#kbd'); k.innerHTML = '';
    BARIS.forEach((b, i) => {
      const r = document.createElement('div'); r.className = 'kr';
      if (i === 2) r.appendChild(kunciBtn('Enter', tt().menu === 'Menu' ? (S.lang === 'id' ? 'Masuk' : 'Masuk') : 'Masuk', 'lebar', 'enter'));
      [...b].forEach(h => r.appendChild(kunciBtn(h, h, '', 'k-' + h)));
      if (i === 2) { const d = kunciBtn('Backspace', '', 'lebar', 'padam'); d.innerHTML = M.ikon('del', 22); d.setAttribute('aria-label', 'Padam'); r.appendChild(d); }
      k.appendChild(r);
    });
  }
  function kunciBtn(val, teks, kls, uji) { const b = document.createElement('button'); b.className = 'key ' + kls; b.dataset.k = val; b.dataset.uji = uji; b.textContent = teks; b.type = 'button'; return b; }
  function warnaKbd() { $$('.key[data-k]').forEach(b => { if (b.dataset.k.length === 1) { b.classList.remove('t', 'a', 'x'); const s = S.keyState[b.dataset.k]; if (s) b.classList.add(s); } }); }
  const RANK = { x: 1, a: 2, t: 3 };
  function perbaruiKey(tek, hasil) { for (let i = 0; i < tek.length; i++) { const h = tek[i], s = hasil[i]; if (!S.keyState[h] || RANK[s] > RANK[S.keyState[h]]) S.keyState[h] = s; } }
  function lukisSemasa() { for (let c = 0; c < S.len; c++) { const e = $(`#s${S.baris.length}-${c}`); if (!e) continue; e.textContent = S.cur[c] || ''; e.classList.toggle('isi', !!S.cur[c]); } }
  function paparBaris(r, tek, hasil, anim) {
    return new Promise(res => {
      for (let c = 0; c < S.len; c++) {
        const e = $(`#s${r}-${c}`); e.textContent = tek[c];
        const buat = () => { e.classList.remove('isi'); e.classList.add(hasil[c]); if (anim) { e.classList.add('balik'); if (BUNYI) BUNYI.petak(hasil[c], c); } };
        if (anim) setTimeout(buat, c * 240 + 120); else buat();
      }
      if (anim) setTimeout(res, S.len * 240 + 560); else res();
    });
  }

  /* ---------- mula permainan ---------- */
  function sediaPapan(len) { S.len = len; S.baris = []; S.cur = ''; S.tamat = false; S.menang = false; S.hint = false; S.keyState = {}; S.kunci = false; binaGrid(); binaKbd(); }
  function pilihHarian() { const D = DATA_KATA[S.lang].jawapan; S.tarikh = T0.kunciTarikh(); const [k, m] = D[T0.indeksHarian(S.tarikh, D.length, S.lang === 'id' ? 7 : 2026)]; return [k, m]; }
  async function mulaHarian() {
    S.mod = 'harian'; const [k, m] = pilihHarian(); S.jawapan = k; S.makna = m; sediaPapan(k.length); tunjuk('main'); mood('senang');
    const sv = bag(S.lang).harian;
    if (sv && sv.tarikh === S.tarikh) {
      S.hint = !!sv.hint;
      for (let r = 0; r < sv.rows.length; r++) { const t = sv.rows[r], h = T0.nilai(t, k); S.baris.push({ t, h }); perbaruiKey(t, h); await paparBaris(r, t, h, false); }
      warnaKbd();
      if (sv.done) { S.tamat = true; S.menang = sv.won; mood(sv.won ? 'gembira' : 'oops'); bubble(tt().sudahMain); setTimeout(() => tampilHasil(true), 250); return; }
    }
    bubble(xx().len(S.len));
  }
  function mulaLatihan() {
    const D = DATA_KATA[S.lang].jawapan; let k, m, n = 0;
    do { [k, m] = D[Math.floor(Math.random() * D.length)]; } while (k === S.terakhir && n++ < 5);
    S.terakhir = k; S.mod = 'latihan'; S.jawapan = k; S.makna = m; S.tarikh = ''; sediaPapan(k.length); tunjuk('main'); mood('senang'); bubble(xx().len(S.len));
  }
  function mulaKelas(maju) {
    const K = S.kelas; if (!K) return; S.mod = 'kelas';
    if (maju || S.kelasI < 0) { let n; do { n = Math.floor(Math.random() * K.w.length); } while (K.w.length > 1 && n === S.kelasI); S.kelasI = n; }
    const [k, m] = K.w[S.kelasI]; S.jawapan = k; S.makna = m; S.tarikh = ''; sediaPapan(k.length); tunjuk('main'); mood('senang'); bubble(xx().kelasLen(S.len));
  }

  /* ---------- input ---------- */
  function taip(h) { if (S.tamat || S.kunci || S.cur.length >= S.len) return; S.cur += h; BUNYI.ketik(); lukisSemasa(); }
  function padam() { if (S.tamat || S.kunci || !S.cur) return; S.cur = S.cur.slice(0, -1); BUNYI.padam(); lukisSemasa(); }
  function goyang(m) { const g = $('#grid'); g.classList.remove('goyang'); void g.offsetWidth; g.classList.add('goyang'); BUNYI.ralat(); toast(m); mood('oops'); setTimeout(() => { if (!S.tamat) mood('fikir'); }, 900); }
  function sahKata(k) { return S.mod === 'kelas' ? /^[a-z]+$/.test(k) : DATA_KATA[S.lang].sah.has(k); }
  async function hantar() {
    if (S.tamat || S.kunci) return;
    if (S.cur.length < S.len) return goyang(tt().pendek);
    if (!sahKata(S.cur)) return goyang(tt().bukanKata);
    S.kunci = true;
    const t = S.cur, h = T0.nilai(t, S.jawapan), r = S.baris.length; S.baris.push({ t, h }); S.cur = ''; perbaruiKey(t, h);
    const menang = h.every(c => c === 't'), tamat = menang || S.baris.length >= MAKS;
    if (S.mod === 'harian') { const b = bag(S.lang); b.harian = { tarikh: S.tarikh, rows: S.baris.map(x => x.t), done: tamat, won: menang, hint: S.hint }; simpan(); }
    await paparBaris(r, t, h, true); warnaKbd();
    const nT = h.filter(c => c === 't').length, nA = h.filter(c => c === 'a').length;
    if (!menang) { mood(nT === 0 && nA === 0 ? 'oops' : nA > nT ? 'fikir' : 'senang'); bubble(nT === 0 && nA === 0 ? xx().nol : nA > 0 && nT < S.len - 2 ? xx().hampir : xx().cuba(Math.min(S.baris.length + 1, 6))); }
    S.kunci = false;
    if (tamat) selesai(menang);
  }
  function selesai(menang) {
    S.tamat = true; S.menang = menang;
    if (S.mod !== 'kelas') {
      const st = stat(S.lang); st.main++;
      if (menang) { st.menang++; st.dist[S.baris.length - 1]++; }
      if (S.mod === 'harian') { if (menang) { st.streak = st.lastWin === T0.semalam(S.tarikh) ? st.streak + 1 : 1; st.lastWin = S.tarikh; st.maks = Math.max(st.maks, st.streak); } else st.streak = 0; }
      simpan();
    }
    mood(menang ? 'gembira' : 'oops'); menang ? BUNYI.menang() : BUNYI.kalah();
    if (menang) { $('#grid').classList.add('menang'); }
    setTimeout(() => tampilHasil(false), menang ? 1100 : 700);
  }
  function teksKongsi() {
    const tajuk = S.mod === 'harian' ? `${xx().hariTajuk} ${xx().bahasa} ${S.tarikh}` : S.mod === 'kelas' ? `${xx().hariTajuk} (Kelas)` : `${xx().hariTajuk} ${xx().bahasa} (${tt().latihan})`;
    return T0.kongsi({ tajuk, bar: S.baris.map(b => b.h), menang: S.menang, maks: MAKS, petunjuk: S.hint });
  }
  function tampilHasil(dariSimpanan) {
    const sh = $('#sheetHasil'), m = S.menang;
    $('#mHasil').innerHTML = M.clawd(m ? 'gembira' : 'oops');
    $('#hTajuk').textContent = m ? tt().menang[Math.min(S.baris.length - 1, 5)] : tt().kalah;
    $('#hKata').textContent = S.jawapan;
    $('#hMakna').textContent = S.makna ? tt().maknaT + ': ' + S.makna : (S.mod === 'kelas' ? xx().tanpaMakna : '');
    $('#hKongsi').textContent = teksKongsi();
    $('#hInfo').textContent = S.mod === 'harian' ? tt().esok : '';
    $('#hLagi').innerHTML = M.ikon('next', 20) + (S.mod === 'harian' ? tt().latihan : S.mod === 'kelas' ? tt().seterusnya : tt().lagi);
    sh.hidden = false;
  }
  function tutupSheet() { $('#sheetHasil').hidden = true; $('#sheetStat').hidden = true; }
  function tampilStat() {
    const st = stat(S.lang), now = T0.kunciTarikh(), ok = st.lastWin === now || st.lastWin === T0.semalam(now);
    $('#stat4').innerHTML = [[st.main, tt().main], [st.main ? Math.round(st.menang * 100 / st.main) : 0, tt().menangP], [ok ? st.streak : 0, tt().beruntun], [st.maks, tt().rekod]].map(a => `<div><b>${a[0]}</b><small>${a[1]}</small></div>`).join('');
    const mx = Math.max(1, ...st.dist), cur = S.tamat && S.menang && S.mod !== 'kelas' ? S.baris.length - 1 : -1;
    $('#agihan').innerHTML = st.dist.map((n, i) => `<div class="ag"><span>${i + 1}</span><i class="${i === cur ? 'hi' : ''}" style="width:${Math.max(8, n / mx * 100)}%">${n}</i></div>`).join('');
    $('#sheetStat').hidden = false;
  }
  async function salin(teks) {
    try { await navigator.clipboard.writeText(teks); return true; } catch (e) {}
    try { const t = document.createElement('textarea'); t.value = teks; t.style.position = 'fixed'; t.style.opacity = '0'; document.body.appendChild(t); t.select(); const ok = document.execCommand('copy'); t.remove(); return ok; } catch (e) { return false; }
  }

  /* ---------- cikgu ---------- */
  function cInfoUpdate() { const h = T0.hurai($('#cTeks').value, 3, 10); $('#cInfo').textContent = $('#cTeks').value.trim() ? `${h.kata.length} ${tt().cHasil}${h.langkau ? ', ' + h.langkau + ' ' + tt().cLangkau : ''}. ${tt().lampiran}` : tt().lampiran; return h; }
  function cBuat() {
    const h = cInfoUpdate(); if (!h.kata.length) { toast(tt().cKosong, 2200); return; }
    const url = location.href.split('#')[0] + '#' + T0.kodPaut(S.lang, h.kata);
    $('#cPaut').value = url; $('#cHasil').hidden = false; BUNYI.klik();
  }

  /* ---------- peristiwa ---------- */
  document.addEventListener('click', async e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.k) { BUNYI.klik(); const k = b.dataset.k; if (k === 'Enter') hantar(); else if (k === 'Backspace') padam(); else taip(k); return; }
    if (b.classList.contains('pil')) { BUNYI.klik(); setLang(b.dataset.loc); return; }
    switch (b.id) {
      case 'btnHarian': BUNYI.klik(); mulaHarian(); break;
      case 'btnLatihan': BUNYI.klik(); mulaLatihan(); break;
      case 'btnCikgu': BUNYI.klik(); tunjuk('cikgu'); cInfoUpdate(); break;
      case 'btnBack': tutupSheet(); if (location.hash) history.replaceState(null, '', location.pathname + location.search); S.kelas = null; S.kelasI = -1; tunjuk('menu'); break;
      case 'btnLang': setLang(S.lang === 'ms' ? 'id' : 'ms'); break;
      case 'btnSnd': BUNYI.tukar(); terap(); BUNYI.klik(); break;
      case 'btnStat': tampilStat(); break;
      case 'btnHint': if (S.skrin === 'main' && !S.tamat) { S.hint = true; bubble(S.makna ? tt().maknaT + ': ' + S.makna : xx().tanpaMakna); if (S.mod === 'harian') { const sv = bag(S.lang).harian; if (sv && sv.tarikh === S.tarikh) { sv.hint = true; simpan(); } } } break;
      case 'sTutup': $('#sheetStat').hidden = true; break;
      case 'hKongsiBtn': toast((await salin(teksKongsi())) ? tt().disalin : 'Salin manual', 1500); break;
      case 'hStat': tampilStat(); break;
      case 'hMenu': tutupSheet(); if (location.hash) history.replaceState(null, '', location.pathname + location.search); S.kelas = null; S.kelasI = -1; tunjuk('menu'); break;
      case 'hLagi': tutupSheet(); S.mod === 'kelas' ? mulaKelas(true) : mulaLatihan(); break;
      case 'cBuat': cBuat(); break;
      case 'cSalin': toast((await salin($('#cPaut').value)) ? tt().disalin : 'Salin manual', 1500); break;
      case 'cCuba': { const o = T0.bacaPaut('#' + $('#cPaut').value.split('#')[1]); if (o) { location.hash = '#' + $('#cPaut').value.split('#')[1]; } break; }
    }
  });
  $('#cTeks').addEventListener('input', cInfoUpdate);
  $$('.sheet').forEach(s => s.addEventListener('click', e => { if (e.target === s) s.hidden = true; }));
  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Escape') { tutupSheet(); return; }
    if (S.skrin !== 'main' || !$('#sheetHasil').hidden || !$('#sheetStat').hidden) return;
    if (e.key === 'Enter') { e.preventDefault(); hantar(); } else if (e.key === 'Backspace') padam(); else if (/^[a-zA-Z]$/.test(e.key)) taip(e.key.toLowerCase());
  });
  function dariHash() {
    const o = T0.bacaPaut(location.hash); if (!o) return false;
    S.kelas = o; S.kelasI = -1; setLang(o.b); tutupSheet(); mulaKelas(true); return true;
  }
  window.addEventListener('hashchange', dariHash);

  window.__game = {
    get keadaan() { return !$('#sheetHasil').hidden ? 'hasil' : S.skrin === 'main' ? (S.tamat ? 'tamat' : 'main') : S.skrin; },
    get jawapan() { return S.jawapan; }, get mod() { return S.mod; }, get bahasa() { return S.lang; }, get skrin() { return S.skrin; },
    get baris() { return S.baris.map(b => b.t); }, get tamat() { return S.tamat; }, get menang() { return S.menang; }, get panjang() { return S.len; }
  };
  terap(); if (!dariHash()) tunjuk('menu');
})();
