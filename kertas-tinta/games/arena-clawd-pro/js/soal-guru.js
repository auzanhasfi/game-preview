/* Soal Guru: modul bersama untuk game Clawd (Dunia Clawd, Arena Clawd Pro, dll).
   Guru menulis soalan sendiri (mana-mana mata pelajaran), game memakainya menggantikan / bercampur dengan soalan matematik.
   - Simpan di localStorage 'soal-guru-v1'. Tiada pelayan, tiada akaun.
   - Tampal pantas: satu baris = "Soalan | jawapan betul | salah 1 | salah 2 | salah 3" (juga tab dari Excel / Google Sheets).
   - Kongsi: pautan #soal=... (set dimampatkan dalam pautan) untuk murid. Murid buka pautan → set terus dipakai.
   - PIN guru (pilihan) supaya murid tidak boleh mengubah soalan.
   - Laporan: peratus betul setiap soalan, soalan paling sukar di atas.
   API: SoalGuru.bahasa(l) · guna() · ambil() · rekod(q, betul) · buka(opsi) · ringkas() · mod() · setAktif() · dengar(fn)
   Soalan yang dipulangkan: { custom:true, teks, opts:[teks], ans:teks, penjelasan, mapel, kunci } */
(function () {
  'use strict';
  var KUNCI = 'soal-guru-v1';
  var lang = 'ms';
  function T(ms, en, id) { return lang === 'en' ? en : lang === 'id' ? (id == null ? ms : id) : ms; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function uid() { return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function acak(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* ---------- data ---------- */
  var D = { mod: 'mtk', aktif: null, set: [], stat: {}, pin: '' };
  function muat() { try { var r = JSON.parse(localStorage.getItem(KUNCI) || 'null'); if (r && r.set) D = Object.assign(D, r); } catch (e) {} }
  function simpan() { try { localStorage.setItem(KUNCI, JSON.stringify(D)); } catch (e) {} pendengar.forEach(function (f) { try { f(); } catch (e) {} }); }
  var pendengar = [];
  muat();
  function setAktif() { for (var i = 0; i < D.set.length; i++) if (D.set[i].id === D.aktif) return D.set[i]; return null; }
  function sah(q) { return q && String(q.t || '').trim() && String(q.j || '').trim() && (q.s || []).some(function (x) { return String(x || '').trim(); }); }
  function soalSah(s) { return s ? s.soal.filter(sah) : []; }

  /* ---------- contoh sedia ---------- */
  function contoh() {
    var sains = {
      ms: { judul: 'Bahagian tumbuhan', mapel: 'Sains', kelas: 'Tahun 3', soal: [
        ['Bahagian tumbuhan yang menyerap air dari tanah?', 'Akar', 'Daun', 'Bunga', 'Buah', 'Akar menyerap air dan garam mineral dari tanah.'],
        ['Di manakah fotosintesis paling banyak berlaku?', 'Daun', 'Akar', 'Batang', 'Biji', 'Daun mengandungi klorofil yang menyerap cahaya matahari.'],
        ['Apakah gas yang dibebaskan semasa fotosintesis?', 'Oksigen', 'Karbon dioksida', 'Nitrogen', 'Wap air', ''],
        ['Bahagian yang mengangkut air ke daun?', 'Batang', 'Bunga', 'Akar rambut', 'Biji', ''],
        ['Bunga membantu tumbuhan untuk…', 'Membiak', 'Bernafas', 'Menyerap air', 'Berdiri tegak', 'Bunga menghasilkan biji benih untuk membiak.'],
        ['Tumbuhan memerlukan semua ini untuk hidup KECUALI…', 'Plastik', 'Air', 'Cahaya matahari', 'Udara', '']
      ] },
      id: { judul: 'Bagian tumbuhan', mapel: 'IPA', kelas: 'Kelas 3', soal: [
        ['Bagian tumbuhan yang menyerap air dari tanah?', 'Akar', 'Daun', 'Bunga', 'Buah', 'Akar menyerap air dan mineral dari tanah.'],
        ['Di mana fotosintesis paling banyak terjadi?', 'Daun', 'Akar', 'Batang', 'Biji', 'Daun mengandung klorofil yang menyerap cahaya matahari.'],
        ['Gas apa yang dilepaskan saat fotosintesis?', 'Oksigen', 'Karbon dioksida', 'Nitrogen', 'Uap air', ''],
        ['Bagian yang mengangkut air ke daun?', 'Batang', 'Bunga', 'Akar rambut', 'Biji', ''],
        ['Bunga membantu tumbuhan untuk…', 'Berkembang biak', 'Bernapas', 'Menyerap air', 'Berdiri tegak', 'Bunga menghasilkan biji untuk berkembang biak.'],
        ['Tumbuhan butuh semua ini untuk hidup KECUALI…', 'Plastik', 'Air', 'Cahaya matahari', 'Udara', '']
      ] },
      en: { judul: 'Parts of a plant', mapel: 'Science', kelas: 'Year 3', soal: [
        ['Which part of a plant takes in water from the soil?', 'Roots', 'Leaves', 'Flower', 'Fruit', 'Roots absorb water and minerals from the soil.'],
        ['Where does most photosynthesis happen?', 'Leaves', 'Roots', 'Stem', 'Seed', 'Leaves contain chlorophyll that captures sunlight.'],
        ['Which gas is released during photosynthesis?', 'Oxygen', 'Carbon dioxide', 'Nitrogen', 'Water vapour', ''],
        ['Which part carries water up to the leaves?', 'Stem', 'Flower', 'Root hairs', 'Seed', ''],
        ['Flowers help a plant to…', 'Reproduce', 'Breathe', 'Take in water', 'Stand up', 'Flowers make seeds so new plants can grow.'],
        ['Plants need all of these to live EXCEPT…', 'Plastic', 'Water', 'Sunlight', 'Air', '']
      ] }
    };
    var bi = {
      ms: { judul: 'Animals (English)', mapel: 'Bahasa Inggeris', kelas: 'Tahun 2', a: 'Apakah maksud' },
      id: { judul: 'Animals (English)', mapel: 'Bahasa Inggris', kelas: 'Kelas 2', a: 'Apa arti' },
      en: { judul: 'Animals: spelling', mapel: 'English', kelas: 'Year 2', a: 'Spell the animal:' }
    }[lang];
    var kata = lang === 'en'
      ? [['Spell the animal that says "moo".', 'cow', 'caw', 'coww', 'kow'], ['Spell the animal that hops and says "ribbit".', 'frog', 'forg', 'frogg', 'frag'], ['Which word is an animal?', 'tiger', 'table', 'tomato', 'train'], ['Which animal can fly?', 'bird', 'fish', 'goat', 'snake'], ['The plural of "mouse" is…', 'mice', 'mouses', 'mices', 'meese'], ['A baby cat is called a…', 'kitten', 'puppy', 'calf', 'cub']]
      : [[bi.a + ' "cat"?', lang === 'id' ? 'Kucing' : 'Kucing', 'Anjing', 'Ikan', 'Burung'], [bi.a + ' "elephant"?', 'Gajah', 'Harimau', 'Zirafah', 'Monyet'], [bi.a + ' "bird"?', 'Burung', 'Ular', 'Katak', 'Lembu'], [bi.a + ' "fish"?', 'Ikan', 'Ayam', 'Kambing', 'Kuda'], [T('Bahasa Inggeris untuk "harimau"?', '', 'Bahasa Inggris untuk "harimau"?'), 'tiger', 'lion', 'bear', 'monkey'], [T('Bahasa Inggeris untuk "arnab"?', '', 'Bahasa Inggris untuk "kelinci"?'), 'rabbit', 'rat', 'robot', 'rain']];
    function jadi(src, list) { return { id: uid(), judul: src.judul, mapel: src.mapel, kelas: src.kelas, soal: list.map(function (r) { return { t: r[0], j: r[1], s: [r[2], r[3], r[4]], p: r[5] || '' }; }) }; }
    var s1 = sains[lang] || sains.ms;
    return [jadi(s1, s1.soal), jadi(bi, kata)];
  }

  /* ---------- penghurai tampal pantas ---------- */
  function hurai(teks) {
    var out = [], baris = String(teks || '').replace(/\r/g, '').split('\n');
    // format blok: soalan, kemudian pilihan; tanda * pada jawapan betul
    var blok = String(teks || '').replace(/\r/g, '').split(/\n\s*\n/);
    var adaBintang = /^\s*(\*|[A-Da-d][\).:]\s*\*)/m.test(teks) || /\*\s*$/m.test(teks);
    if (adaBintang && blok.length >= 1) {
      blok.forEach(function (b) {
        var l = b.split('\n').map(function (x) { return x.trim(); }).filter(Boolean); if (l.length < 3) return;
        var t = l[0].replace(/^\d+[\).:]\s*/, ''), j = '', s = [], p = '';
        l.slice(1).forEach(function (x) {
          if (/^(penjelasan|explanation|pembahasan)\s*:/i.test(x)) { p = x.replace(/^[^:]+:\s*/, ''); return; }
          var betul = /^\*/.test(x) || /\*$/.test(x) || /^[A-Da-d][\).:]\s*\*/.test(x);
          var v = x.replace(/^\*\s*/, '').replace(/\s*\*$/, '').replace(/^[A-Da-d][\).:]\s*\*?\s*/, '').trim();
          if (!v) return; if (betul && !j) j = v; else s.push(v);
        });
        if (t && j && s.length) out.push({ t: t, j: j, s: s.slice(0, 3), p: p });
      });
      return out;
    }
    baris.forEach(function (x) {
      x = x.trim(); if (!x) return;
      var b = x.indexOf('\t') >= 0 ? x.split('\t') : x.indexOf('|') >= 0 ? x.split('|') : x.split(';');
      b = b.map(function (y) { return y.trim(); });
      if (b.length < 3 || !b[0] || !b[1]) return;
      if (/^(soalan|soal|question)$/i.test(b[0])) return; // baris tajuk
      out.push({ t: b[0].replace(/^\d+[\).:]\s*/, ''), j: b[1], s: b.slice(2, 5).filter(Boolean), p: b[5] || '' });
    });
    return out;
  }

  /* ---------- kongsi melalui pautan ---------- */
  function b64e(s) { return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function b64d(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return decodeURIComponent(escape(atob(s))); }
  function padat(set) { return b64e(JSON.stringify({ v: 1, i: set.id, n: set.judul, m: set.mapel, k: set.kelas, q: soalSah(set).map(function (q) { return [q.t, q.j, (q.s || []).filter(Boolean), q.p || '']; }) })); }
  function buka64(k) { var o = JSON.parse(b64d(k)); return { id: o.i || uid(), judul: o.n || '', mapel: o.m || '', kelas: o.k || '', soal: (o.q || []).map(function (r) { return { t: r[0], j: r[1], s: r[2] || [], p: r[3] || '' }; }) }; }
  function pautan(set) { return location.origin + location.pathname + location.search + '#soal=' + padat(set); }
  function semakPautan() {
    var m = /[#&]soal=([A-Za-z0-9_-]+)/.exec(location.hash); if (!m) return;
    var set; try { set = buka64(m[1]); } catch (e) { return; }
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    if (!soalSah(set).length) return;
    setTimeout(function () {
      kotak('<h3>' + T('Set soalan daripada guru', 'Question set from your teacher', 'Set soal dari guru') + '</h3><p class="sg-dim">' + esc(set.judul) + ' · ' + esc(set.mapel) + (set.kelas ? ' · ' + esc(set.kelas) : '') + ' · ' + soalSah(set).length + ' ' + T('soalan', 'questions', 'soal') + '</p><p>' + T('Gunakan soalan ini dalam game?', 'Use these questions in the game?', 'Pakai soal ini di dalam game?') + '</p><div class="sg-baris"><button class="sg-utama" data-ya>' + T('Ya, guna', 'Yes, use them', 'Ya, pakai') + '</button><button class="sg-btn" data-tidak>' + T('Tidak', 'No', 'Tidak') + '</button></div>', function (el, tutup) {
        el.querySelector('[data-ya]').onclick = function () { var ada = D.set.findIndex(function (s) { return s.id === set.id; }); if (ada >= 0) D.set[ada] = set; else D.set.push(set); D.aktif = set.id; D.mod = 'guru'; simpan(); tutup(); toast(T('Soalan guru aktif', 'Teacher questions on', 'Soal guru aktif')); };
        el.querySelector('[data-tidak]').onclick = tutup;
      });
    }, 900);
  }

  /* ---------- pilih soalan untuk game ---------- */
  var dek = {}, akhir = {};
  function guna() { var s = setAktif(); if (D.mod === 'mtk' || !s || !soalSah(s).length) return false; return D.mod === 'guru' || Math.random() < 0.5; }
  function ambil() {
    var s = setAktif(); if (!s) return null; var list = s.soal.map(function (q, i) { return [q, i]; }).filter(function (x) { return sah(x[0]); }); if (!list.length) return null;
    if (!dek[s.id] || !dek[s.id].length) { dek[s.id] = acak(list.map(function (x) { return x[1]; })); if (dek[s.id].length > 1 && dek[s.id][0] === akhir[s.id]) dek[s.id].push(dek[s.id].shift()); }
    var i = dek[s.id].shift(); akhir[s.id] = i; var q = s.soal[i];
    var pil = [q.j].concat((q.s || []).filter(function (x) { return String(x || '').trim() && x !== q.j; })).map(function (x) { return String(x).trim(); });
    pil = pil.filter(function (x, k) { return pil.indexOf(x) === k; }).slice(0, 4);
    return { custom: true, teks: q.t, opts: acak(pil), ans: String(q.j).trim(), penjelasan: q.p || '', mapel: s.mapel, kunci: s.id + ':' + i, setId: s.id, idx: i };
  }
  function rekod(q, betul) { if (!q || !q.custom) return; var st = D.stat[q.setId] = D.stat[q.setId] || {}; var r = st[q.idx] = st[q.idx] || [0, 0]; r[1]++; if (betul) r[0]++; simpan(); }
  function ringkas() { var s = setAktif(); if (D.mod === 'mtk' || !s) return T('Matematik', 'Maths', 'Matematika'); return (s.mapel || T('Soalan guru', 'Teacher questions', 'Soal guru')) + ' · ' + esc(s.judul || '') + (D.mod === 'campur' ? ' + ' + T('Matematik', 'Maths', 'Matematika') : ''); }

  /* ---------- UI ---------- */
  function toast(s) { var d = document.createElement('div'); d.className = 'sg-toast'; d.textContent = s; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 2600); }
  function kotak(html, ikat, kelas) {
    var B = document.createElement('div'); B.className = 'sg-latar'; B.innerHTML = '<div class="sg-kotak ' + (kelas || '') + '" role="dialog" aria-modal="true">' + html + '</div>'; document.body.appendChild(B);
    var siap = false; function tutup() { if (siap) return; siap = true; B.remove(); if (B._selepas) B._selepas(); }
    B.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Escape') tutup(); });
    B.addEventListener('keyup', function (e) { e.stopPropagation(); });
    B.addEventListener('pointerdown', function (e) { if (e.target === B) tutup(); });
    ikat(B.firstChild, tutup, B); return B;
  }
  var IK = {
    tutup: 'M18 6 6 18M6 6l12 12', tambah: 'M12 5v14M5 12h14', padam: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3', salin: 'M9 9h11v11H9zM5 15H4V4h11v1',
    pautan: 'M10 14a4 4 0 0 0 5.6 0l3-3a4 4 0 0 0-5.6-5.6l-1 1M14 10a4 4 0 0 0-5.6 0l-3 3a4 4 0 0 0 5.6 5.6l1-1', muat: 'M12 3v12M7 10l5 5 5-5M5 21h14', naik: 'M12 21V9M7 14l5-5 5 5M5 3h14',
    kunci: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4', buku: 'M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z', carta: 'M4 20V10M10 20V4M16 20v-7M22 20H2', tampal: 'M9 3h6v4H9zM6 5H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-1M8 12h8M8 16h5', semak: 'M20 6 9 17l-5-5'
  };
  function ik(n, s) { return '<svg width="' + (s || 18) + '" height="' + (s || 18) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + IK[n] + '"/></svg>'; }
  var MAPEL = function () { return lang === 'en' ? ['Maths', 'Science', 'English', 'History', 'Geography', 'Religion', 'Malay', 'Other'] : lang === 'id' ? ['Matematika', 'IPA', 'IPS', 'Bahasa Indonesia', 'Bahasa Inggris', 'Agama', 'Sejarah', 'Lainnya'] : ['Matematik', 'Sains', 'Bahasa Melayu', 'Bahasa Inggeris', 'Sejarah', 'Pendidikan Islam', 'Geografi', 'Lain-lain']; };

  function buka(o) {
    o = o || {};
    if (D.pin && !o.tanpaPin) {
      return kotak('<h3>' + ik('kunci', 20) + ' ' + T('PIN guru', 'Teacher PIN', 'PIN guru') + '</h3><p class="sg-dim">' + T('Masukkan PIN untuk mengubah soalan.', 'Enter the PIN to edit questions.', 'Masukkan PIN untuk mengubah soal.') + '</p><input class="sg-in sg-pin" inputmode="numeric" maxlength="6" autocomplete="off" aria-label="PIN"><p class="sg-ralat" hidden>' + T('PIN salah', 'Wrong PIN', 'PIN salah') + '</p><div class="sg-baris"><button class="sg-utama" data-ok>' + T('Buka', 'Open', 'Buka') + '</button><button class="sg-btn" data-x>' + T('Batal', 'Cancel', 'Batal') + '</button></div>', function (el, tutup) {
        var i = el.querySelector('input'); setTimeout(function () { i.focus(); }, 50);
        var cuba = function () { if (i.value === D.pin) { tutup(); o.tanpaPin = true; buka(o); } else { el.querySelector('.sg-ralat').hidden = false; i.value = ''; } };
        el.querySelector('[data-ok]').onclick = cuba; i.onkeydown = function (e) { if (e.key === 'Enter') cuba(); }; el.querySelector('[data-x]').onclick = tutup;
      });
    }
    if (!D.set.length) { D.set = contoh(); D.aktif = D.set[0].id; simpan(); }
    if (!setAktif()) D.aktif = D.set[0].id;
    var tab = o.tab || 'set';
    var tutupK = null, B = kotak('', function (e0, t0) { tutupK = t0; }, 'sg-besar'); B._selepas = function () { simpan(); o.selepas && o.selepas(); };
    var el = B.firstChild;
    function tutup() { tutupK(); }
    function lukis() {
      var s = setAktif();
      el.innerHTML = '<div class="sg-atas"><div><small class="sg-ttl">' + T('Mod guru', 'Teacher mode', 'Mode guru') + '</small><h2>' + T('Soalan Guru', 'Teacher Questions', 'Soal Guru') + '</h2></div><button class="sg-x" data-tutup aria-label="' + T('Tutup', 'Close', 'Tutup') + '">' + ik('tutup', 20) + '</button></div>' +
        '<div class="sg-mod" role="group" aria-label="mod">' + [['mtk', T('Matematik sahaja', 'Maths only', 'Matematika saja')], ['guru', T('Soalan guru sahaja', 'Teacher questions only', 'Soal guru saja')], ['campur', T('Campur', 'Mixed', 'Campur')]].map(function (m) { return '<button data-mod="' + m[0] + '" aria-pressed="' + (D.mod === m[0]) + '" data-uji="sg-mod-' + m[0] + '">' + m[1] + '</button>'; }).join('') + '</div>' +
        '<div class="sg-tab" role="tablist">' + [['set', 'buku', T('Soalan', 'Questions', 'Soal')], ['tampal', 'tampal', T('Tampal pantas', 'Quick paste', 'Tempel cepat')], ['kongsi', 'pautan', T('Kongsi', 'Share', 'Bagikan')], ['laporan', 'carta', T('Laporan', 'Report', 'Laporan')]].map(function (x) { return '<button data-tab="' + x[0] + '" aria-selected="' + (tab === x[0]) + '" data-uji="sg-tab-' + x[0] + '">' + ik(x[1], 16) + '<span>' + x[2] + '</span></button>'; }).join('') + '</div><div class="sg-isi" id="sgIsi"></div>';
      var I = el.querySelector('#sgIsi');
      if (tab === 'set') lukisSet(I, s); else if (tab === 'tampal') lukisTampal(I, s); else if (tab === 'kongsi') lukisKongsi(I, s); else lukisLaporan(I, s);
      el.querySelector('[data-tutup]').onclick = tutup;
      el.querySelectorAll('[data-mod]').forEach(function (b) { b.onclick = function () { D.mod = b.getAttribute('data-mod'); simpan(); lukis(); }; });
      el.querySelectorAll('[data-tab]').forEach(function (b) { b.onclick = function () { tab = b.getAttribute('data-tab'); lukis(); }; });
    }
    function pilihSet(s) {
      return '<div class="sg-set"><label class="sg-l" for="sgPilih">' + T('Set soalan', 'Question set', 'Set soal') + '</label><div class="sg-baris"><select id="sgPilih" class="sg-in">' + D.set.map(function (x) { return '<option value="' + x.id + '"' + (x.id === s.id ? ' selected' : '') + '>' + esc(x.judul || T('Tanpa tajuk', 'Untitled', 'Tanpa judul')) + ' · ' + soalSah(x).length + '</option>'; }).join('') + '</select><button class="sg-btn" data-baru data-uji="sg-baru">' + ik('tambah', 16) + T('Set baharu', 'New set', 'Set baru') + '</button><button class="sg-btn" data-contoh>' + T('Tambah contoh', 'Add samples', 'Tambah contoh') + '</button></div></div>';
    }
    function ikatPilih(I) {
      I.querySelector('#sgPilih').onchange = function (e) { D.aktif = e.target.value; simpan(); lukis(); };
      I.querySelector('[data-baru]').onclick = function () { var n = { id: uid(), judul: '', mapel: MAPEL()[0], kelas: '', soal: [{ t: '', j: '', s: ['', '', ''], p: '' }] }; D.set.push(n); D.aktif = n.id; simpan(); tab = 'set'; lukis(); var t0 = el.querySelector('[data-f="judul"]'); t0 && t0.focus(); };
      I.querySelector('[data-contoh]').onclick = function () { var c = contoh(); D.set = D.set.concat(c); D.aktif = c[0].id; simpan(); lukis(); };
    }
    function lukisSet(I, s) {
      I.innerHTML = pilihSet(s) +
        '<div class="sg-grid3"><div><label class="sg-l">' + T('Tajuk set', 'Set title', 'Judul set') + '</label><input class="sg-in" data-f="judul" value="' + esc(s.judul) + '" placeholder="' + T('cth. Bab 2: Haiwan', 'e.g. Unit 2: Animals', 'mis. Bab 2: Hewan') + '" data-uji="sg-judul"></div>' +
        '<div><label class="sg-l">' + T('Mata pelajaran', 'Subject', 'Mata pelajaran') + '</label><input class="sg-in" data-f="mapel" value="' + esc(s.mapel) + '" list="sgMapel" data-uji="sg-mapel"><datalist id="sgMapel">' + MAPEL().map(function (m) { return '<option value="' + esc(m) + '">'; }).join('') + '</datalist></div>' +
        '<div><label class="sg-l">' + T('Kelas / tahun', 'Class / year', 'Kelas') + '</label><input class="sg-in" data-f="kelas" value="' + esc(s.kelas) + '" placeholder="' + T('cth. Tahun 4', 'e.g. Year 4', 'mis. Kelas 4') + '"></div></div>' +
        '<div class="sg-cip">' + MAPEL().map(function (m) { return '<button data-mp="' + esc(m) + '" aria-pressed="' + (s.mapel === m) + '">' + esc(m) + '</button>'; }).join('') + '</div>' +
        '<div class="sg-senarai">' + s.soal.map(function (q, i) {
          return '<div class="sg-q ' + (sah(q) ? '' : 'sg-q-kurang') + '" data-i="' + i + '"><div class="sg-qa"><b>' + (i + 1) + '</b><textarea class="sg-in" rows="2" data-k="t" placeholder="' + T('Tulis soalan', 'Write the question', 'Tulis soal') + '" data-uji="sg-t-' + i + '">' + esc(q.t) + '</textarea><button class="sg-ikon" data-hapus aria-label="' + T('Padam soalan', 'Delete question', 'Hapus soal') + '">' + ik('padam', 17) + '</button></div>' +
            '<div class="sg-pil"><label class="sg-betul">' + ik('semak', 14) + '<input class="sg-in" data-k="j" value="' + esc(q.j) + '" placeholder="' + T('Jawapan betul', 'Correct answer', 'Jawaban benar') + '" data-uji="sg-j-' + i + '"></label>' + [0, 1, 2].map(function (k) { return '<input class="sg-in sg-salah" data-k="s' + k + '" value="' + esc((q.s || [])[k] || '') + '" placeholder="' + T('Jawapan salah ', 'Wrong answer ', 'Jawaban salah ') + (k + 1) + (k ? T(' (pilihan)', ' (optional)', ' (opsional)') : '') + '" data-uji="sg-s' + k + '-' + i + '">'; }).join('') + '</div>' +
            '<input class="sg-in sg-pj" data-k="p" value="' + esc(q.p) + '" placeholder="' + T('Penjelasan bila murid salah (pilihan)', 'Explanation when a pupil is wrong (optional)', 'Penjelasan saat murid salah (opsional)') + '"></div>';
        }).join('') + '</div>' +
        '<div class="sg-baris sg-kaki"><button class="sg-btn" data-tambah data-uji="sg-tambah">' + ik('tambah', 16) + T('Tambah soalan', 'Add question', 'Tambah soal') + '</button><button class="sg-btn sg-bahaya" data-hapusSet>' + ik('padam', 16) + T('Padam set', 'Delete set', 'Hapus set') + '</button><span class="sg-dim">' + soalSah(s).length + ' ' + T('soalan lengkap · disimpan automatik', 'complete questions · saved automatically', 'soal lengkap · tersimpan otomatis') + '</span><button class="sg-utama" data-siap data-uji="sg-siap">' + T('Siap, main', 'Done, play', 'Selesai, main') + '</button></div>';
      ikatPilih(I);
      I.querySelectorAll('[data-f]').forEach(function (x) { x.oninput = function () { s[x.getAttribute('data-f')] = x.value; simpan(); if (x.getAttribute('data-f') === 'mapel') I.querySelectorAll('[data-mp]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-mp') === x.value); }); }; });
      I.querySelectorAll('[data-mp]').forEach(function (b) { b.onclick = function () { s.mapel = b.getAttribute('data-mp'); I.querySelector('[data-f="mapel"]').value = s.mapel; I.querySelectorAll('[data-mp]').forEach(function (c) { c.setAttribute('aria-pressed', c === b); }); simpan(); }; });
      I.querySelectorAll('.sg-q').forEach(function (row) {
        var i = +row.getAttribute('data-i'), q = s.soal[i];
        row.querySelectorAll('[data-k]').forEach(function (x) { x.oninput = function () { var k = x.getAttribute('data-k'); if (k[0] === 's' && k.length === 2) { q.s = q.s || []; q.s[+k[1]] = x.value; } else q[k] = x.value; row.classList.toggle('sg-q-kurang', !sah(q)); simpan(); I.querySelector('.sg-kaki .sg-dim').textContent = soalSah(s).length + ' ' + T('soalan lengkap · disimpan automatik', 'complete questions · saved automatically', 'soal lengkap · tersimpan otomatis'); }; });
        row.querySelector('[data-hapus]').onclick = function () { s.soal.splice(i, 1); if (!s.soal.length) s.soal.push({ t: '', j: '', s: ['', '', ''], p: '' }); simpan(); lukis(); };
      });
      I.querySelector('[data-tambah]').onclick = function () { s.soal.push({ t: '', j: '', s: ['', '', ''], p: '' }); simpan(); lukis(); var t2 = el.querySelectorAll('textarea[data-k="t"]'); t2[t2.length - 1].focus(); t2[t2.length - 1].scrollIntoView({ block: 'center' }); };
      I.querySelector('[data-hapusSet]').onclick = function () { if (!confirm(T('Padam set ini?', 'Delete this set?', 'Hapus set ini?'))) return; D.set = D.set.filter(function (x) { return x !== s; }); if (!D.set.length) D.set = contoh(); D.aktif = D.set[0].id; simpan(); lukis(); };
      I.querySelector('[data-siap]').onclick = function () { if (D.mod === 'mtk' && soalSah(s).length) D.mod = 'guru'; simpan(); tutup(); toast(T('Soalan guru disimpan', 'Teacher questions saved', 'Soal guru tersimpan')); };
    }
    function lukisTampal(I, s) {
      I.innerHTML = pilihSet(s) + '<p class="sg-dim">' + T('Salin dari Word, Excel atau Google Sheets. Satu baris satu soalan:', 'Copy from Word, Excel or Google Sheets. One line per question:', 'Salin dari Word, Excel, atau Google Sheets. Satu baris satu soal:') + '</p>' +
        '<pre class="sg-pre">' + esc(T('Ibu negara Malaysia? | Kuala Lumpur | Johor Bahru | Ipoh | Melaka\n2 + 3 = ? | 5 | 4 | 6', 'Capital of Japan? | Tokyo | Osaka | Kyoto | Seoul\n2 + 3 = ? | 5 | 4 | 6', 'Ibu kota Indonesia? | Jakarta | Bandung | Surabaya | Medan\n2 + 3 = ? | 5 | 4 | 6')) + '</pre>' +
        '<p class="sg-dim">' + T('Atau format kuiz biasa: soalan, kemudian pilihan; tanda * pada jawapan betul. Pisahkan soalan dengan baris kosong.', 'Or a normal quiz layout: the question, then options; mark the right answer with *. Separate questions with a blank line.', 'Atau format kuis biasa: soal, lalu pilihan; tandai jawaban benar dengan *. Pisahkan soal dengan baris kosong.') + '</p>' +
        '<pre class="sg-pre">' + esc(T('Haiwan yang bertelur?\n*Ayam\nKucing\nLembu', 'Which animal lays eggs?\n*Hen\nCat\nCow', 'Hewan yang bertelur?\n*Ayam\nKucing\nSapi')) + '</pre>' +
        '<textarea class="sg-in sg-tampal" rows="8" placeholder="' + T('Tampal di sini…', 'Paste here…', 'Tempel di sini…') + '" data-uji="sg-tampal"></textarea><p class="sg-dim" id="sgKira"></p>' +
        '<div class="sg-baris"><label class="sg-cek"><input type="checkbox" id="sgGanti"> ' + T('Ganti semua soalan dalam set ini', 'Replace all questions in this set', 'Ganti semua soal di set ini') + '</label><button class="sg-utama" data-masuk data-uji="sg-masuk">' + T('Masukkan soalan', 'Add questions', 'Masukkan soal') + '</button></div>';
      ikatPilih(I);
      var ta = I.querySelector('.sg-tampal'), k = I.querySelector('#sgKira');
      ta.oninput = function () { var n = hurai(ta.value).length; k.textContent = n ? n + ' ' + T('soalan dikesan', 'questions found', 'soal terdeteksi') : ''; };
      I.querySelector('[data-masuk]').onclick = function () {
        var baru = hurai(ta.value); if (!baru.length) { k.textContent = T('Tiada soalan dikesan. Semak formatnya.', 'No questions found. Check the format.', 'Tidak ada soal terdeteksi. Periksa formatnya.'); return; }
        var kosong = s.soal.filter(sah); s.soal = (I.querySelector('#sgGanti').checked ? [] : kosong).concat(baru); simpan(); toast(baru.length + ' ' + T('soalan dimasukkan', 'questions added', 'soal dimasukkan')); tab = 'set'; lukis();
      };
    }
    function lukisKongsi(I, s) {
      var url = pautan(s), panjang = url.length > 7000;
      I.innerHTML = pilihSet(s) + '<p>' + T('Hantar pautan ini kepada murid (WhatsApp, Google Classroom). Bila dibuka, game terus memakai set ini.', 'Send this link to pupils (WhatsApp, Google Classroom). When they open it, the game uses this set.', 'Kirim link ini ke murid (WhatsApp, Google Classroom). Saat dibuka, game langsung memakai set ini.') + '</p>' +
        '<div class="sg-baris"><input class="sg-in" readonly value="' + esc(url) + '" id="sgUrl" data-uji="sg-url"><button class="sg-utama" data-salin>' + ik('salin', 16) + T('Salin pautan', 'Copy link', 'Salin link') + '</button></div>' + (panjang ? '<p class="sg-ralat">' + T('Pautan sangat panjang. Kongsi fail JSON jika pautan tidak dibuka.', 'The link is very long. Share the JSON file if the link fails.', 'Link sangat panjang. Bagikan file JSON jika link tidak terbuka.') + '</p>' : '') +
        '<h3>' + T('Fail', 'File', 'File') + '</h3><div class="sg-baris"><button class="sg-btn" data-eksport>' + ik('muat', 16) + T('Muat turun JSON', 'Download JSON', 'Unduh JSON') + '</button><label class="sg-btn">' + ik('naik', 16) + T('Buka fail JSON', 'Open JSON file', 'Buka file JSON') + '<input type="file" accept=".json,application/json" hidden data-import></label></div>' +
        '<h3>' + ik('kunci', 18) + ' PIN ' + T('guru', 'teacher', 'guru') + '</h3><p class="sg-dim">' + T('Pilihan: kunci editor supaya murid tidak boleh mengubah soalan.', 'Optional: lock the editor so pupils cannot change questions.', 'Opsional: kunci editor supaya murid tidak bisa mengubah soal.') + '</p><div class="sg-baris"><input class="sg-in sg-pin" inputmode="numeric" maxlength="6" placeholder="' + (D.pin ? '••••' : T('4–6 digit', '4–6 digits', '4–6 digit')) + '" id="sgPin"><button class="sg-btn" data-pin>' + (D.pin ? T('Tukar PIN', 'Change PIN', 'Ganti PIN') : T('Pasang PIN', 'Set PIN', 'Pasang PIN')) + '</button>' + (D.pin ? '<button class="sg-btn sg-bahaya" data-buangpin>' + T('Buang PIN', 'Remove PIN', 'Hapus PIN') + '</button>' : '') + '</div>';
      ikatPilih(I);
      I.querySelector('[data-salin]').onclick = function () { var i = I.querySelector('#sgUrl'); i.select(); (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(function () { toast(T('Pautan disalin', 'Link copied', 'Link disalin')); }, function () { document.execCommand('copy'); toast(T('Pautan disalin', 'Link copied', 'Link disalin')); }); };
      I.querySelector('[data-eksport]').onclick = function () { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' })); a.download = 'soal-' + (s.judul || 'set').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30) + '.json'; a.click(); };
      I.querySelector('[data-import]').onchange = function (e) { var f = e.target.files[0]; if (!f) return; f.text().then(function (t) { try { var o = JSON.parse(t); o.id = uid(); o.soal = (o.soal || []).filter(function (q) { return q && q.t; }); D.set.push(o); D.aktif = o.id; simpan(); toast(T('Set dibuka', 'Set opened', 'Set dibuka')); tab = 'set'; lukis(); } catch (er) { toast(T('Fail tidak sah', 'Invalid file', 'File tidak valid')); } }); };
      I.querySelector('[data-pin]').onclick = function () { var v = I.querySelector('#sgPin').value.trim(); if (!/^\d{4,6}$/.test(v)) { toast(T('PIN mesti 4–6 digit', 'PIN must be 4–6 digits', 'PIN harus 4–6 digit')); return; } D.pin = v; simpan(); toast(T('PIN dipasang', 'PIN set', 'PIN dipasang')); lukis(); };
      var bp = I.querySelector('[data-buangpin]'); if (bp) bp.onclick = function () { D.pin = ''; simpan(); lukis(); };
    }
    function lukisLaporan(I, s) {
      var st = D.stat[s.id] || {}, baris = s.soal.map(function (q, i) { var r = st[i] || [0, 0]; return { q: q, i: i, b: r[0], n: r[1], p: r[1] ? r[0] / r[1] : -1 }; }).filter(function (x) { return sah(x.q); });
      baris.sort(function (a, b) { return (a.p < 0 ? 2 : a.p) - (b.p < 0 ? 2 : b.p); });
      var jum = baris.reduce(function (a, x) { return a + x.n; }, 0), btl = baris.reduce(function (a, x) { return a + x.b; }, 0);
      I.innerHTML = pilihSet(s) + '<div class="sg-stat"><div><b>' + jum + '</b><small>' + T('jawapan', 'answers', 'jawaban') + '</small></div><div><b>' + (jum ? Math.round(btl / jum * 100) : 0) + '%</b><small>' + T('betul', 'correct', 'benar') + '</small></div><div><b>' + baris.filter(function (x) { return x.n; }).length + '/' + baris.length + '</b><small>' + T('soalan dicuba', 'questions tried', 'soal dicoba') + '</small></div></div>' +
        '<p class="sg-dim">' + T('Soalan paling sukar di atas. Data dari peranti ini sahaja.', 'Hardest questions first. Data from this device only.', 'Soal tersulit di atas. Data dari perangkat ini saja.') + '</p>' +
        '<div class="sg-lap">' + baris.map(function (x) { var pc = x.p < 0 ? 0 : Math.round(x.p * 100); return '<div><span>' + (x.i + 1) + '. ' + esc(x.q.t) + '</span><div class="sg-trk"><i style="width:' + pc + '%;background:' + (pc >= 70 ? '#8fc987' : pc >= 40 ? '#e3b04b' : '#e07a6a') + '"></i></div><b>' + (x.n ? pc + '%' : '–') + '</b><small>' + x.b + '/' + x.n + '</small></div>'; }).join('') + '</div>' +
        '<div class="sg-baris"><button class="sg-btn sg-bahaya" data-reset>' + T('Kosongkan laporan', 'Clear report', 'Kosongkan laporan') + '</button></div>';
      ikatPilih(I);
      I.querySelector('[data-reset]').onclick = function () { D.stat[s.id] = {}; simpan(); lukis(); };
    }
    lukis();
    return B;
  }

  /* papar soalan + pilihan dalam kotak sendiri (untuk game yang mahu kotak siap) */
  function tanya(o) {
    o = o || {}; var q = o.q || ambil(); if (!q) return Promise.resolve(null);
    return new Promise(function (selesai) {
      kotak('<small class="sg-ttl">' + esc(o.tajuk || q.mapel || '') + '</small><div class="sg-soalan">' + esc(q.teks) + '</div>' + (o.nota ? '<p class="sg-dim">' + esc(o.nota) + '</p>' : '') + '<div class="sg-jwb">' + q.opts.map(function (v, i) { return '<button data-v="' + esc(v) + '"><small>' + (i + 1) + '</small>' + esc(v) + '</button>'; }).join('') + '</div><div class="sg-lepas"></div>', function (el, tutup) {
        el.querySelectorAll('[data-v]').forEach(function (b) { b.onclick = function () {
          var ok = b.getAttribute('data-v') === q.ans; rekod(q, ok); el.querySelectorAll('[data-v]').forEach(function (x) { x.disabled = true; if (x.getAttribute('data-v') === q.ans) x.classList.add('ok'); });
          if (ok) { b.classList.add('ok'); setTimeout(function () { tutup(); selesai(true); }, 450); return; }
          b.classList.add('no'); el.querySelector('.sg-lepas').innerHTML = '<p><b>' + T('Jawapan: ', 'Answer: ', 'Jawaban: ') + esc(q.ans) + '</b></p>' + (q.penjelasan ? '<p class="sg-dim">' + esc(q.penjelasan) + '</p>' : '') + '<button class="sg-utama" data-f>' + T('Faham', 'Got it', 'Paham') + '</button>';
          el.querySelector('[data-f]').onclick = function () { tutup(); selesai(false); };
        }; });
      });
    });
  }

  window.SoalGuru = {
    bahasa: function (l) { lang = l === 'en' ? 'en' : l === 'id' ? 'id' : 'ms'; },
    guna: guna, ambil: ambil, rekod: rekod, buka: buka, tanya: tanya, ringkas: ringkas, hurai: hurai,
    mod: function (m) { if (m) { D.mod = m; simpan(); } return D.mod; },
    setAktif: setAktif, data: function () { return D; },
    dengar: function (f) { pendengar.push(f); },
    pautan: function () { var s = setAktif(); return s ? pautan(s) : ''; },
    _uji: { contoh: contoh, padat: padat, buka64: buka64, semakPautan: semakPautan }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', semakPautan); else semakPautan();
})();
