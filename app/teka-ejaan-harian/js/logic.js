/* Logik tulen (boleh diuji dalam Node). */
(function (root) {
  'use strict';
  // Nilai: 't' tepat, 'a' ada tetapi salah tempat, 'x' tiada. Menangani huruf berulang dengan betul.
  function nilai(tekaan, jawapan) {
    const n = jawapan.length, hasil = new Array(n).fill('x'), baki = {};
    for (let i = 0; i < n; i++) { if (tekaan[i] === jawapan[i]) hasil[i] = 't'; else baki[jawapan[i]] = (baki[jawapan[i]] || 0) + 1; }
    for (let i = 0; i < n; i++) if (hasil[i] !== 't' && baki[tekaan[i]] > 0) { hasil[i] = 'a'; baki[tekaan[i]]--; }
    return hasil;
  }
  const BLOK = { t: '█', a: '▒', x: '░' };
  const blok = h => h.map(c => BLOK[c]).join('');
  // Susunan harian tetap (PRNG berbenih) supaya semua murid dapat kata sama pada tarikh sama.
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function susunan(n, benih) { const r = mulberry(benih), a = Array.from({ length: n }, (_, i) => i); for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function kunciTarikh(d) { d = d || new Date(); const p = x => String(x).padStart(2, '0'); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }
  function hariKe(kunci) { const [y, m, d] = kunci.split('-').map(Number); return Math.floor(Date.UTC(y, m - 1, d) / 86400000); }
  function indeksHarian(kunci, n, benih) { return susunan(n, benih || 2026)[((hariKe(kunci) % n) + n) % n]; }
  function semalam(kunci) { const [y, m, d] = kunci.split('-').map(Number); return kunciTarikh(new Date(y, m - 1, d - 1)); }
  // Mod cikgu
  function hurai(teks, min, maks) {
    const lihat = new Set(), kata = []; let langkau = 0;
    String(teks || '').split(/[\n;,]+/).forEach(b => {
      if (!b.trim()) return;
      const m = b.match(/^([^=:]*)[=:]?(.*)$/), w = m[1].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, ''), mk = m[2].trim().slice(0, 120);
      if (w.length < min || w.length > maks || lihat.has(w) || kata.length >= 60) { langkau++; return; }
      lihat.add(w); kata.push([w, mk]);
    });
    return { kata, langkau };
  }
  const b64 = s => { const u = unescape(encodeURIComponent(s)); return btoa(u).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const unb64 = s => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));
  function kodPaut(bahasa, kata) { return 'kata=' + b64(JSON.stringify({ b: bahasa, w: kata })); }
  function bacaPaut(hash) {
    try { const m = /^#?kata=([\w-]+)/.exec(hash || ''); if (!m) return null; const o = JSON.parse(unb64(m[1]));
      if (!o || !Array.isArray(o.w)) return null;
      const w = o.w.filter(x => Array.isArray(x) && /^[a-z]{3,10}$/.test(x[0])).slice(0, 60).map(x => [x[0], String(x[1] || '').slice(0, 120)]);
      return w.length ? { b: o.b === 'id' ? 'id' : 'ms', w } : null; } catch (e) { return null; }
  }
  function kongsi(o) { // o: {tajuk, bar:[hasil...], cuba, maks}
    return o.tajuk + ' ' + (o.menang ? o.bar.length : 'X') + '/' + o.maks + (o.petunjuk ? '*' : '') + '\n' + o.bar.map(blok).join('\n');
  }
  root.TEJA = { nilai, blok, susunan, kunciTarikh, hariKe, indeksHarian, semalam, hurai, kodPaut, bacaPaut, kongsi };
})(typeof window !== 'undefined' ? window : globalThis);
