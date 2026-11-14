'use strict';
// Layar DOM: menu, pilih tim + opsi, cara main, hasil, modal soal, modal jeda.
(function () {
  G.set = Object.assign({ menit: 4, ai: 'normal', soal: 'sedang', frek: 'normal', kamera: 'lebar', kandang: 'mci', tandang: 'mun' }, G.simpan.baca('set', {}));
  const simpanSet = () => G.simpan.tulis('set', G.set);
  const Ly = G.layar = {}, $ = G.$, t = G.t, ik = G.ikon;
  let modeTim = 'laga', sisi = 0, soalAktif = null;
  const LAYAR = ['#layarMenu', '#layarTim', '#layarCara', '#layarHasil'];
  Ly.tampil = function (id) {
    for (const s of LAYAR) $(s).hidden = s !== id;
    const dlmLaga = !id; $('#redup').classList.toggle('mati', dlmLaga);
    $('#btnJeda').hidden = !dlmLaga; $('#sentuh').hidden = !(dlmLaga && G.inp.sentuh);
    if (id) G.keadaan = id === '#layarHasil' ? 'hasil' : 'menu';
  };
  const segBahasa = () => `<div class="seg" role="group" aria-label="Bahasa / Language"><button data-lang="id" data-uji="lang-id" aria-pressed="${G.bahasa === 'id'}">Indonesia</button><button data-lang="en" data-uji="lang-en" aria-pressed="${G.bahasa === 'en'}">English</button></div>`;
  function pasangBahasa(root, ulang) { root.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => { G.bunyi.klik(); G.aturBahasa(b.dataset.lang); ulang(); }); }
  // ---------- menu ----------
  Ly.menu = function () {
    const el = $('#layarMenu');
    el.innerHTML = `<div class="wadah">
      <div class="atas"><span class="label emas">Liga Stik Pro · ${G.bahasa === 'id' ? 'Bola Matematika' : 'Maths Football'}</span>${segBahasa()}</div>
      <div class="menu-judul"><h1 id="judul">Liga Stik <span>Pro</span></h1><p>${t('sub')}</p></div>
      <div class="menu-tombol">
        <button class="btn utama" data-uji="mulai" data-a="laga">${ik('main')}<span>${t('m_main')}<small>${t('m_mainK')}</small></span></button>
        <button class="btn" data-uji="adu" data-a="adu">${ik('penalti')}<span>${t('m_adu')}<small>${t('m_aduK')}</small></span></button>
        <button class="btn" data-uji="cara" data-a="cara">${ik('buku')}<span>${t('m_cara')}<small>${t('m_caraK')}</small></span></button>
        <button class="btn" data-uji="suara" data-a="suara">${ik(G.bunyi.hidup ? 'suara' : 'bisu')}<span>${t(G.bunyi.hidup ? 'suaraHidup' : 'suaraMati')}</span></button>
      </div>
      <p class="menu-kaki">${t('kaki')}</p></div>`;
    pasangBahasa(el, Ly.menu);
    el.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
      G.bunyi.buka(); G.bunyi.klik(); const a = b.dataset.a;
      if (a === 'laga' || a === 'adu') Ly.tim(a); else if (a === 'cara') Ly.cara(); else { G.bunyi.alih(); Ly.menu(); }
    });
    Ly.tampil('#layarMenu');
  };
  // ---------- pilih tim ----------
  const seg = (judul, kunci, pil) => `<div><span class="label">${judul}</span><div class="seg" role="group">${pil.map(([v, tx]) => `<button data-set="${kunci}" data-v="${v}" data-uji="${kunci}-${v}" aria-pressed="${String(G.set[kunci]) === String(v)}">${tx}</button>`).join('')}</div></div>`;
  Ly.tim = function (mode = modeTim) {
    modeTim = mode;
    const el = $('#layarTim'), A = G.klub(G.set.kandang), B = G.klub(G.set.tandang);
    const kartu = (k, i) => `<button class="sisi" data-sisi="${i}" data-uji="sisi-${i}" aria-pressed="${sisi === i}"><canvas width="72" height="96" data-kit="${i}"></canvas><div style="min-width:0"><span class="label ${i ? '' : 'emas'}">${t(i ? 'lawan' : 'kamu')}</span><p class="nm">${k.n}</p><p class="bintang">${t('rating')} ${G.ratingKlub(k)} · ${G.bintangKlub(k).join(', ')}</p></div></button>`;
    el.innerHTML = `<div class="wadah">
      <div class="atas"><button class="btn" data-a="kembali" data-uji="kembali">${ik('kembali')}${t('kembali')}</button><span class="label emas">${t(mode === 'adu' ? 'pilihAdu' : 'pilihTim')}</span>${segBahasa()}</div>
      <div class="duel">${kartu(A, 0)}<span class="vs">vs</span>${kartu(B, 1)}</div>
      <p class="label">${t('ketukGanti')}</p>
      <div class="grid-klub">${G.KLUB.map(k => `<button class="klub ${sisi ? 'lawan' : ''}" data-klub="${k.id}" data-uji="klub-${k.id}" aria-pressed="${(sisi ? G.set.tandang : G.set.kandang) === k.id}"><span class="chip" style="background:linear-gradient(90deg, ${k.kandang.baju} 62%, ${k.kandang.baju2} 62%)"></span><span><b>${k.n}</b><i>${k.k} · ${G.ratingKlub(k)}</i></span></button>`).join('')}</div>
      <div class="opsi">
        ${mode === 'laga' ? seg(t('o_durasi'), 'menit', [[3, '3 ' + t('menit')], [4, '4'], [6, '6'], [8, '8']]) : ''}
        ${mode === 'laga' ? seg(t('o_ai'), 'ai', [['mudah', t('mudah')], ['normal', t('normal')], ['sulit', t('sulit')]]) : ''}
        ${seg(t('o_soal'), 'soal', [['mudah', t('s_mudah')], ['sedang', t('s_sedang')], ['sulit', t('s_sulit')]])}
        ${mode === 'laga' ? seg(t('o_frek'), 'frek', [['mati', t('f_mati')], ['jarang', t('f_jarang')], ['normal', t('f_normal')], ['sering', t('f_sering')]]) : ''}
        ${mode === 'laga' ? seg(t('o_kamera'), 'kamera', [['lebar', t('kam_lebar')], ['dekat', t('kam_dekat')]]) : ''}
      </div>
      <div class="aksi"><button class="btn utama" data-a="mulai" data-uji="kickoff">${ik(mode === 'adu' ? 'penalti' : 'bola')}${t(mode === 'adu' ? 'mulaiAdu' : 'kickoff')}</button></div></div>`;
    pasangBahasa(el, () => Ly.tim());
    el.querySelectorAll('canvas[data-kit]').forEach(cv => { const i = +cv.dataset.kit, kA = A.kandang; let kit = i ? B.kandang : kA; if (i && (G.bedaWarna(kA.baju, kit.baju) < 140 || A.id === B.id)) kit = B.tandang; G.pratinjauStik(cv, kit); });
    el.querySelectorAll('[data-sisi]').forEach(b => b.onclick = () => { G.bunyi.klik(); sisi = +b.dataset.sisi; Ly.tim(); });
    el.querySelectorAll('[data-klub]').forEach(b => b.onclick = () => { G.bunyi.klik(); if (sisi) G.set.tandang = b.dataset.klub; else { G.set.kandang = b.dataset.klub; sisi = 1; } simpanSet(); Ly.tim(); });
    el.querySelectorAll('[data-set]').forEach(b => b.onclick = () => { G.bunyi.klik(); const k = b.dataset.set, v = b.dataset.v; G.set[k] = k === 'menit' ? +v : v; simpanSet(); Ly.tim(); });
    el.querySelector('[data-a="kembali"]').onclick = () => { G.bunyi.klik(); Ly.menu(); };
    el.querySelector('[data-a="mulai"]').onclick = () => { G.bunyi.buka(); G.mulaiLaga(modeTim); };
    Ly.tampil('#layarTim');
  };
  // ---------- cara main ----------
  Ly.cara = function () {
    const el = $('#layarCara');
    const baris = [['c_gerak', '<kbd>W A S D</kbd> / <kbd>←↑↓→</kbd>', t('j_stik')], ['c_umpan', '<kbd>J</kbd> / <kbd>Z</kbd>', t('k_umpan')], ['c_terobos', '<kbd>L</kbd> / <kbd>C</kbd>', t('k_terobos')],
      ['c_lambung', '<kbd>I</kbd> / <kbd>V</kbd>', t('k_lambung')], ['c_tembak', '<kbd>K</kbd> / <kbd>Space</kbd>', t('k_tembak') + ' (' + t('j_tahan') + ')'], ['c_lari', '<kbd>Shift</kbd>', t('k_lari') + ' (' + t('j_tahan') + ')'],
      ['c_tekan', '<kbd>J</kbd> (' + t('j_tahan') + ')', t('k_tekan')], ['c_sliding', '<kbd>K</kbd>', t('k_sliding')], ['c_ganti', '<kbd>Q</kbd> / <kbd>L</kbd>', t('k_ganti')], ['c_jeda', '<kbd>Esc</kbd> / <kbd>P</kbd>', '⏸']];
    el.innerHTML = `<div class="wadah">
      <div class="atas"><button class="btn" data-a="kembali" data-uji="kembali">${ik('kembali')}${t('kembali')}</button>${segBahasa()}</div>
      <h1 style="font-size:clamp(30px,5vw,44px)">${t('caraJudul')}</h1>
      <div class="dua-kolom">
        <div class="kartu"><div class="tabel-kontrol"><span class="h">${t('h_aksi')}</span><span class="h">${t('h_kb')}</span><span class="h">${t('h_hp')}</span>
          ${baris.map(([k, kb, hp]) => `<span>${t(k)}</span><span>${kb}</span><span>${hp}</span>`).join('')}</div>
          <p class="label">Gamepad: A ${t('k_umpan')} · X ${t('k_tembak')} · Y ${t('k_terobos')} · B ${t('k_lambung')} · RB ${t('k_lari')} · LB ${t('k_ganti')}</p></div>
        <div class="kartu"><h2>${t('aturanJudul')}</h2><ul class="daftar">${['a1', 'a2', 'a3', 'a4', 'a5'].map(k => `<li>${t(k)}</li>`).join('')}</ul></div>
      </div></div>`;
    pasangBahasa(el, Ly.cara);
    el.querySelector('[data-a="kembali"]').onclick = () => { G.bunyi.klik(); Ly.menu(); };
    Ly.tampil('#layarCara');
  };
  // ---------- hasil ----------
  Ly.hasil = function (M) {
    const el = $('#layarHasil'), [a, b] = M.skor, adu = M.mode === 'adu';
    const judul = a > b ? t('menang') : a < b ? t('kalah') : t('seri');
    const cetak = i => M.gol.filter(g => g.tim === i).map(g => `${G.esc(g.nama)} ${g.menit}'`).join(' · ');
    const tot = Math.max(1e-6, M.stat.kuasa[0] + M.stat.kuasa[1]);
    const baris = (k, x, y, fmt = v => v) => { const s = x + y || 1; return `<span class="n" style="text-align:right">${fmt(x)}</span><div class="bar"><i style="width:${x / s * 100}%"></i></div><span class="n">${fmt(y)}</span><span class="k">${t(k)}</span>`; };
    const pct = (ok, n) => n ? Math.round(ok / n * 100) : 0;
    el.innerHTML = `<div class="wadah" style="max-width:720px">
      <div class="atas"><span class="label emas">${t(adu ? 'aduHasil' : 'hasilJudul')}</span>${G.ikon('piala')}</div>
      <h1 style="font-size:clamp(34px,6vw,54px)" data-uji="judul-hasil">${judul}</h1>
      <div class="kartu"><div class="papan-hasil"><div><p class="nm">${M.klub[0].n}</p><p class="pencetak">${adu ? '' : cetak(0)}</p></div><p class="skor" data-uji="skor">${a} – ${b}</p><div><p class="nm">${M.klub[1].n}</p><p class="pencetak">${adu ? '' : cetak(1)}</p></div></div></div>
      ${adu ? '' : `<div class="kartu"><div class="statistik">
        ${baris('st_kuasa', Math.round(M.stat.kuasa[0] / tot * 100), Math.round(M.stat.kuasa[1] / tot * 100), v => v + '%')}
        ${baris('st_tembak', M.stat.tembak[0], M.stat.tembak[1])}${baris('st_tepat', M.stat.tepat[0], M.stat.tepat[1])}
        ${baris('st_umpan', pct(M.stat.umpanOk[0], M.stat.umpan[0]), pct(M.stat.umpanOk[1], M.stat.umpan[1]), v => v + '%')}</div></div>`}
      <div class="kartu" style="flex-direction:row;gap:24px;flex-wrap:wrap"><div><span class="label">${t('soalBenar')}</span><p style="font:800 28px var(--ui)" data-uji="soal-benar">${M.soal.benar} / ${M.soal.total}</p></div>${adu ? '' : `<div><span class="label">${t('superDipakai')}</span><p style="font:800 28px var(--ui)">${M.superDipakai}</p></div>`}</div>
      <div class="aksi"><button class="btn" data-a="menu" data-uji="menu">${ik('rumah')}${t('menuUtama')}</button><button class="btn" data-a="tim" data-uji="ganti-tim">${ik('tim')}${t('gantiTim')}</button><button class="btn utama" data-a="lagi" data-uji="main-lagi">${ik('ulang')}${t('mainLagi')}</button></div></div>`;
    el.querySelector('[data-a="menu"]').onclick = () => { G.bunyi.klik(); G.keMenu(); };
    el.querySelector('[data-a="tim"]').onclick = () => { G.bunyi.klik(); G.M = null; Ly.tim(adu ? 'adu' : 'laga'); };
    el.querySelector('[data-a="lagi"]').onclick = () => { G.bunyi.klik(); G.mulaiLaga(adu ? 'adu' : 'laga'); };
    G.$('#toast').innerHTML = ''; Ly.tampil('#layarHasil');
    G.bunyi.sorak(a > b ? .8 : .2);
  };
  // ---------- modal soal ----------
  Ly.soal = function (cfg, cb) {
    const m = $('#modalSoal'), s = G.buatSoal(cfg.level || 'sedang', cfg.nama), batas = 12;
    m.innerHTML = `<div class="kotak"><div class="kepala">${ik('hitung')}<span class="label">${G.esc(cfg.judul)}</span></div>
      ${s.cerita ? `<p class="soal-cerita">${G.esc(s.cerita)}</p>` : ''}
      <p class="soal-teks" id="soalTeks">${s.teks} = ?</p>
      <div class="waktu"><i></i></div>
      <div class="pilihan">${s.pilihan.map((v, i) => `<button data-v="${v}" data-uji="jawab-${i + 1}" ${v === s.jawab ? 'data-benar="1"' : ''}><kbd>${i + 1}</kbd>${v}</button>`).join('')}</div>
      <p class="umpan-balik" aria-live="polite"></p><p class="hadiah">${G.esc(cfg.hadiah || '')}</p></div>`;
    m.hidden = false; G.bunyi.tik();
    const bar = m.querySelector('.waktu i'), mulai = performance.now(); let selesai = false;
    const jawab = (btn) => {
      if (selesai) return; selesai = true; clearInterval(iv);
      const benar = !!btn && +btn.dataset.v === s.jawab, fb = m.querySelector('.umpan-balik');
      m.querySelectorAll('.pilihan button').forEach(b => { b.disabled = true; if (b.dataset.benar) b.classList.add('benar'); });
      if (btn && !benar) btn.classList.add('salah');
      fb.textContent = benar ? t('benar') : t(btn ? 'salah' : 'habis', s.jelas); fb.className = 'umpan-balik ' + (benar ? 'ok' : 'no');
      benar ? G.bunyi.benar() : G.bunyi.salah();
      setTimeout(() => { m.hidden = true; soalAktif = null; cb(benar); }, benar ? 900 : 1700);
    };
    const iv = setInterval(() => { if (G.jeda) return; const k = (performance.now() - mulai) / 1000 / batas; bar.style.transform = `scaleX(${Math.max(0, 1 - k)})`; if (k >= 1) jawab(null); }, 80);
    m.querySelectorAll('.pilihan button').forEach(b => b.onclick = () => jawab(b));
    soalAktif = { jawab, m };
    setTimeout(() => { const b = m.querySelector('.pilihan button'); b && b.focus({ preventScroll: true }); }, 50);
  };
  Ly.tombolAngka = n => { if (!soalAktif) return; const b = soalAktif.m.querySelectorAll('.pilihan button')[n - 1]; if (b) soalAktif.jawab(b); };
  Ly.jawabUji = benar => { if (!soalAktif) return false; const bs = [...soalAktif.m.querySelectorAll('.pilihan button')]; soalAktif.jawab(bs.find(b => !!b.dataset.benar === benar)); return true; };
  Ly.adaSoal = () => !!soalAktif;
  // ---------- jeda ----------
  Ly.jeda = function () {
    if (G.keadaan !== 'main' || soalAktif) return;
    G.jeda = true; const m = $('#modalJeda');
    m.innerHTML = `<div class="kotak" style="width:min(380px,100%)"><div class="kepala">${ik('jeda')}<span class="label">${t('jedaJudul')}</span></div>
      <div class="jeda-tombol"><button class="btn utama" data-a="lanjut" data-uji="lanjut">${ik('main')}${t('lanjut')}</button>
      <button class="btn" data-a="ulang" data-uji="ulang">${ik('ulang')}${t('ulang')}</button>
      <button class="btn" data-a="suara">${ik(G.bunyi.hidup ? 'suara' : 'bisu')}${t(G.bunyi.hidup ? 'suaraHidup' : 'suaraMati')}</button>
      <button class="btn" data-a="menu" data-uji="ke-menu">${ik('rumah')}${t('keMenu')}</button></div></div>`;
    m.hidden = false;
    m.querySelector('[data-a="lanjut"]').onclick = () => { m.hidden = true; G.jeda = false; };
    m.querySelector('[data-a="ulang"]').onclick = () => { m.hidden = true; G.jeda = false; G.mulaiLaga(G.M && G.M.mode === 'adu' ? 'adu' : 'laga'); };
    m.querySelector('[data-a="suara"]').onclick = () => { G.bunyi.alih(); m.hidden = true; G.jeda = false; Ly.jeda(); };
    m.querySelector('[data-a="menu"]').onclick = () => { m.hidden = true; G.jeda = false; G.keMenu(); };
  };
})();
