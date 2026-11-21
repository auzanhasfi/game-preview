'use strict';
/* Semua seni SVG dilukis sendiri: Si Bulat (maskot), pelanggan, barang, wang, ikon UI. */
var Seni = (function () {
  var INK = '#1B2440';

  /* ---------- Si Bulat ---------- */
  var gid = 0;
  function bulat(mood) {
    mood = mood || 'tenang'; var gi = 'gb' + (++gid);
    var mata, mulut, alis = '', extra = '', pipi = '';
    var mataBuka = function (dx, dy, r) {
      return '<g class="kelip"><circle cx="44" cy="58" r="12" fill="#fff"/><circle cx="76" cy="58" r="12" fill="#fff"/>' +
        '<circle cx="' + (44 + dx) + '" cy="' + (58 + dy) + '" r="' + r + '" fill="' + INK + '"/><circle cx="' + (76 + dx) + '" cy="' + (58 + dy) + '" r="' + r + '" fill="' + INK + '"/>' +
        '<circle cx="' + (46 + dx) + '" cy="' + (55 + dy) + '" r="2.4" fill="#fff"/><circle cx="' + (78 + dx) + '" cy="' + (55 + dy) + '" r="2.4" fill="#fff"/></g>';
    };
    if (mood === 'sorak') {
      mata = '<path d="M33 60 Q44 46 55 60" stroke="' + INK + '" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M65 60 Q76 46 87 60" stroke="' + INK + '" stroke-width="5" fill="none" stroke-linecap="round"/>';
      mulut = '<path d="M44 76 Q60 98 76 76 Z" fill="' + INK + '"/><path d="M52 86 Q60 92 68 86 Q60 82 52 86Z" fill="#FF8FA3"/>';
      pipi = '<ellipse cx="30" cy="76" rx="8" ry="5" fill="#FF9DB0" opacity=".7"/><ellipse cx="90" cy="76" rx="8" ry="5" fill="#FF9DB0" opacity=".7"/>';
      extra = '<circle cx="12" cy="52" r="9" fill="#5B97F5"/><circle cx="108" cy="52" r="9" fill="#5B97F5"/>';
    } else if (mood === 'gembira') {
      mata = mataBuka(1, 1, 6.5);
      mulut = '<path d="M46 76 Q60 90 74 76" stroke="' + INK + '" stroke-width="4.5" fill="none" stroke-linecap="round"/>';
      pipi = '<ellipse cx="30" cy="74" rx="8" ry="5" fill="#FF9DB0" opacity=".7"/><ellipse cx="90" cy="74" rx="8" ry="5" fill="#FF9DB0" opacity=".7"/>';
    } else if (mood === 'oops') {
      mata = mataBuka(0, 1, 4.5);
      alis = '<path d="M32 40 L52 46" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/><path d="M88 40 L68 46" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>';
      mulut = '<path d="M50 84 Q55 78 60 84 Q65 90 70 84" stroke="' + INK + '" stroke-width="4" fill="none" stroke-linecap="round"/>';
      extra = '<path d="M98 30 Q104 40 98 44 Q92 40 98 30Z" fill="#9AD7FF" stroke="#4D9BD6" stroke-width="1.5"/>';
    } else {
      mata = mataBuka(0, 0, 6);
      mulut = '<path d="M50 78 Q60 86 70 78" stroke="' + INK + '" stroke-width="4" fill="none" stroke-linecap="round"/>';
      pipi = '<ellipse cx="31" cy="74" rx="7" ry="4.5" fill="#FF9DB0" opacity=".55"/><ellipse cx="89" cy="74" rx="7" ry="4.5" fill="#FF9DB0" opacity=".55"/>';
    }
    return '<svg class="svg-bulat" viewBox="0 0 120 124" role="img" aria-label="Si Bulat" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><radialGradient id="' + gi + '" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="#7DB4FF"/><stop offset="1" stop-color="#2F6FDB"/></radialGradient></defs>' +
      '<ellipse cx="60" cy="116" rx="36" ry="6" fill="#000" opacity=".12"/>' + extra +
      '<circle cx="60" cy="64" r="48" fill="url(#' + gi + ')"/>' +
      '<path d="M26 46 Q32 28 50 22" stroke="#fff" stroke-width="5" opacity=".45" fill="none" stroke-linecap="round"/>' +
      '<path d="M32 28 Q60 6 88 28 Q60 20 32 28Z" fill="#FFC857"/><circle cx="60" cy="14" r="4" fill="#FFC857"/>' +
      pipi + mata + alis + mulut + '</svg>';
  }

  /* ---------- Pelanggan ---------- */
  var VARIAN = [
    {kulit: '#F2C29B', rambut: '#3A2A22', baju: '#F28B5B', gaya: 'pendek'},
    {kulit: '#E0A878', rambut: '#2A2A33', baju: '#6BB36F', gaya: 'tudung', tudung: '#C85A8C'},
    {kulit: '#C98E63', rambut: '#1F1B1A', baju: '#8E7CC3', gaya: 'peci'},
    {kulit: '#F5D0AE', rambut: '#8C5A2B', baju: '#3FA7B5', gaya: 'kuncir'},
    {kulit: '#D9A073', rambut: '#4A3426', baju: '#E2B33D', gaya: 'topi'},
    {kulit: '#B9805A', rambut: '#201A18', baju: '#E56B6B', gaya: 'tudung', tudung: '#3E7CB1'}
  ];
  function pelanggan(vi, mood) {
    var v = VARIAN[vi % VARIAN.length], bawah = '', atas = '', mulut, alis = '';
    if (v.gaya === 'tudung') { bawah = '<circle cx="60" cy="64" r="36" fill="' + v.tudung + '"/><path d="M26 100 Q60 86 94 100 L98 150 L22 150Z" fill="' + v.tudung + '"/>'; }
    var wajah = '<circle cx="60" cy="64" r="' + (v.gaya === 'tudung' ? 27 : 30) + '" fill="' + v.kulit + '"/>';
    if (v.gaya === 'pendek') atas = '<path d="M30 62 Q26 28 60 28 Q94 28 90 62 Q82 44 60 44 Q38 44 30 62Z" fill="' + v.rambut + '"/>';
    if (v.gaya === 'peci') atas = '<path d="M31 62 Q31 52 36 48 L84 48 Q89 52 89 62 Q80 52 60 52 Q40 52 31 62Z" fill="' + v.rambut + '"/><path d="M33 48 Q34 30 60 28 Q86 30 87 48Z" fill="#242424"/>';
    if (v.gaya === 'kuncir') atas = '<circle cx="94" cy="58" r="10" fill="' + v.rambut + '"/><path d="M30 62 Q26 28 60 28 Q94 28 90 62 Q80 42 60 42 Q40 42 30 62Z" fill="' + v.rambut + '"/>';
    if (v.gaya === 'topi') atas = '<path d="M30 52 Q32 26 60 26 Q88 26 90 52Z" fill="#E4572E"/><path d="M26 52 H100 Q100 58 90 58 H30 Q26 58 26 52Z" fill="#B63E1E"/>';
    var mata = '<circle cx="49" cy="66" r="3.6" fill="' + INK + '"/><circle cx="71" cy="66" r="3.6" fill="' + INK + '"/>';
    if (mood === 'senang') { mulut = '<path d="M49 78 Q60 90 71 78" stroke="' + INK + '" stroke-width="3.5" fill="none" stroke-linecap="round"/>'; mata = '<path d="M44 67 Q49 61 54 67" stroke="' + INK + '" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M66 67 Q71 61 76 67" stroke="' + INK + '" stroke-width="3.2" fill="none" stroke-linecap="round"/>'; }
    else if (mood === 'marah') { mulut = '<path d="M50 84 Q60 76 70 84" stroke="' + INK + '" stroke-width="3.5" fill="none" stroke-linecap="round"/>'; alis = '<path d="M41 58 L55 62" stroke="' + INK + '" stroke-width="3.4" stroke-linecap="round"/><path d="M79 58 L65 62" stroke="' + INK + '" stroke-width="3.4" stroke-linecap="round"/>'; }
    else mulut = '<path d="M53 80 H67" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"/>';
    var pipi = '<ellipse cx="41" cy="76" rx="5" ry="3" fill="#F28FA0" opacity=".5"/><ellipse cx="79" cy="76" rx="5" ry="3" fill="#F28FA0" opacity=".5"/>';
    var marahEx = mood === 'marah' ? '<path d="M96 30 l6 -8 M102 36 l8 -4 M92 24 l2 -9" stroke="#E5484D" stroke-width="3.5" stroke-linecap="round"/>' : '';
    return '<svg class="svg-pel" viewBox="0 0 120 150" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">' + bawah +
      '<path d="M22 150 Q22 100 60 100 Q98 100 98 150Z" fill="' + v.baju + '"/><rect x="52" y="90" width="16" height="14" rx="6" fill="' + v.kulit + '"/>' +
      wajah + atas + mata + alis + pipi + mulut + marahEx + '</svg>';
  }

  /* ---------- Barang (48x48) ---------- */
  var S = 'stroke-linejoin="round" stroke-linecap="round"';
  var BARANG = {
    roti: '<path d="M7 29 Q4 13 17 11 H31 Q44 13 41 29 Q41 39 36 39 H12 Q7 39 7 29Z" fill="#E9B45F" stroke="#9A6422" stroke-width="2.4" ' + S + '/><path d="M16 17 L20 26 M24 15 L28 26 M32 17 L35 26" stroke="#B97A2C" stroke-width="2.6" ' + S + '/>',
    telur: '<path d="M24 5 C34 5 39 21 39 28 C39 37 32 43 24 43 C16 43 9 37 9 28 C9 21 14 5 24 5Z" fill="#FFF4DD" stroke="#B88A55" stroke-width="2.4"/><path d="M17 26 Q18 17 22 13" stroke="#fff" stroke-width="3" fill="none" ' + S + '/>',
    susu: '<path d="M13 15 L24 6 L35 15 V42 H13Z" fill="#F5FAFF" stroke="#4A78B8" stroke-width="2.4" ' + S + '/><rect x="13" y="24" width="22" height="12" fill="#5B97F5"/><circle cx="24" cy="30" r="3.6" fill="#fff"/><path d="M13 15 H35" stroke="#4A78B8" stroke-width="2.4"/>',
    air: '<rect x="19" y="4" width="10" height="6" rx="2" fill="#3B7BE8"/><path d="M19 10 Q12 14 12 22 V40 Q12 44 16 44 H32 Q36 44 36 40 V22 Q36 14 29 10Z" fill="#CFEAFF" stroke="#3E7CB1" stroke-width="2.4" ' + S + '/><path d="M13 28 Q18 24 24 28 T35 28 V40 Q35 43 32 43 H16 Q13 43 13 40Z" fill="#7CC4F5"/>',
    biskut: '<circle cx="24" cy="25" r="18" fill="#E2A257" stroke="#9A6422" stroke-width="2.4"/><circle cx="18" cy="19" r="2.6" fill="#6B3E14"/><circle cx="30" cy="22" r="2.6" fill="#6B3E14"/><circle cx="22" cy="31" r="2.6" fill="#6B3E14"/><circle cx="32" cy="32" r="2.2" fill="#6B3E14"/>',
    pisang: '<path d="M10 14 Q8 36 28 40 Q38 41 42 34 Q30 38 22 28 Q16 22 17 12Z" fill="#FFD84D" stroke="#B88A00" stroke-width="2.4" ' + S + '/><path d="M10 14 L17 12" stroke="#7A5B00" stroke-width="3.4" ' + S + '/>',
    nasi: '<path d="M6 36 Q24 4 42 36Z" fill="#4FA06A" stroke="#2F7048" stroke-width="2.4" ' + S + '/><path d="M12 34 Q24 14 36 34Z" fill="#FFFDF4"/><circle cx="24" cy="27" r="3.4" fill="#E5484D"/><path d="M16 34 H32" stroke="#E9D9A8" stroke-width="2" ' + S + '/>',
    tempe: '<path d="M6 18 L14 10 H42 V30 L34 38 H6Z" fill="#E7D3A0" stroke="#8C7440" stroke-width="2.4" ' + S + '/><path d="M6 18 H34 L42 10 M34 18 V38" stroke="#8C7440" stroke-width="2.2" ' + S + '/><circle cx="14" cy="26" r="1.8" fill="#8C7440"/><circle cx="22" cy="30" r="1.8" fill="#8C7440"/><circle cx="26" cy="23" r="1.8" fill="#8C7440"/><circle cx="12" cy="32" r="1.6" fill="#8C7440"/><circle cx="30" cy="31" r="1.6" fill="#8C7440"/>',
    mi: '<path d="M6 24 H42 Q42 40 24 40 Q6 40 6 24Z" fill="#E5484D" stroke="#9E2A2E" stroke-width="2.4" ' + S + '/><path d="M12 22 Q14 10 18 22 Q22 8 26 22 Q30 10 34 22" stroke="#F3C74A" stroke-width="3.4" fill="none" ' + S + '/><path d="M32 6 L38 20" stroke="#9A6422" stroke-width="2.6" ' + S + '/>'
  };
  function barang(id, px) { return '<svg class="svg-ik" viewBox="0 0 48 48" width="' + (px || 40) + '" height="' + (px || 40) + '" aria-hidden="true">' + (BARANG[id] || '') + '</svg>'; }

  /* ---------- Wang ---------- */
  var WARNA = {
    ms: {10: '#C9CED6', 20: '#C9CED6', 50: '#C9CED6', 100: '#4E7FC2', 500: '#4E9A62', 1000: '#C9494F', 2000: '#D9822B'},
    id: {500: '#E2B04A', 1000: '#C9CED6', 2000: '#8A8F99', 5000: '#B5805A', 10000: '#7A5BB0', 20000: '#4C9A6A'}
  };
  function wang(neg, v, w) {
    var N = NEGARA[neg], jenis = jenisWang(neg, v), w0 = jenis === 'syiling' ? 56 : 76, h0 = jenis === 'syiling' ? 56 : 46;
    var s = w ? w / w0 : 1, c = WARNA[neg][v] || '#999';
    var lab = neg === 'ms' ? (v < 100 ? String(v) : String(v / 100)) : N.fmtDenom(v);
    var sub = neg === 'ms' ? (v < 100 ? 'sen' : 'RM') : 'Rp';
    var vb = '0 0 ' + w0 + ' ' + h0, W = Math.round(w0 * s), H = Math.round(h0 * s);
    if (jenis === 'syiling') {
      return '<svg class="svg-wang" viewBox="' + vb + '" width="' + W + '" height="' + H + '" aria-hidden="true"><circle cx="28" cy="28" r="25" fill="' + c + '" stroke="#6D5A2A" stroke-width="2.4"/><circle cx="28" cy="28" r="19.5" fill="none" stroke="#6D5A2A" stroke-width="1.4" stroke-dasharray="3 2.4" opacity=".6"/><text x="28" y="' + (lab.length > 3 ? 30 : 32) + '" text-anchor="middle" font-family="Outfit,Arial,sans-serif" font-weight="800" font-size="' + (lab.length > 3 ? 13 : 17) + '" fill="#2B2A33">' + lab + '</text><text x="28" y="44" text-anchor="middle" font-family="Outfit,Arial,sans-serif" font-weight="700" font-size="9" fill="#2B2A33">' + sub + '</text></svg>';
    }
    var tek = neg === 'ms' ? 'RM ' + lab : lab;
    return '<svg class="svg-wang" viewBox="' + vb + '" width="' + W + '" height="' + H + '" aria-hidden="true"><rect x="2" y="2" width="72" height="42" rx="6" fill="' + c + '" stroke="#2B2A33" stroke-opacity=".5" stroke-width="2"/><rect x="7" y="7" width="62" height="32" rx="4" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.6"/><circle cx="14" cy="23" r="5" fill="#fff" fill-opacity=".45"/><text x="45" y="' + (tek.length > 6 ? 28 : 30) + '" text-anchor="middle" font-family="Outfit,Arial,sans-serif" font-weight="800" font-size="' + (tek.length > 6 ? 13 : 16) + '" fill="#fff" stroke="#000" stroke-opacity=".25" stroke-width=".6" paint-order="stroke">' + tek + '</text></svg>';
  }

  /* ---------- Ikon UI ---------- */
  var IKON = {
    jeda: '<path d="M8 5 H11 V19 H8Z M13 5 H16 V19 H13Z" fill="currentColor"/>',
    bunyiOn: '<path d="M4 9 H8 L13 5 V19 L8 15 H4Z" fill="currentColor"/><path d="M16 9 Q19 12 16 15 M18.5 6.5 Q24 12 18.5 17.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>',
    bunyiOff: '<path d="M3 9 H7 L12 5 V19 L7 15 H3Z" fill="currentColor"/><path d="M16 9 L22 15 M22 9 L16 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    orang: '<circle cx="12" cy="8" r="4" fill="currentColor"/><path d="M4 21 Q4 13 12 13 Q20 13 20 21Z" fill="currentColor"/>',
    semak: '<path d="M5 13 L10 18 L19 7" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    getah: '<path d="M4 15 L12 5 H20 V13 L13 20 H8Z" fill="currentColor"/><path d="M3 21 H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    kurang: '<path d="M5 12 H19" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/>',
    main: '<path d="M7 4 L20 12 L7 20Z" fill="currentColor"/>'
  };
  function ikon(n, px) { return '<svg class="ikon-svg" viewBox="0 0 24 24" width="' + (px || 22) + '" height="' + (px || 22) + '" aria-hidden="true">' + IKON[n] + '</svg>'; }
  function hati(hilang) { return '<svg class="hati' + (hilang ? ' hilang' : '') + '" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M12 21 C4 15 2 11 2 8 C2 5 4.5 3 7 3 C9 3 11 4.2 12 6 C13 4.2 15 3 17 3 C19.5 3 22 5 22 8 C22 11 20 15 12 21Z" fill="' + (hilang ? '#D8D2C6' : '#E5484D') + '" stroke="' + (hilang ? '#B9B1A1' : '#B02A32') + '" stroke-width="1.6" stroke-linejoin="round"/></svg>'; }
  function bintang(penuh, px) { px = px || 44; return '<svg class="bintang-svg' + (penuh ? ' penuh' : '') + '" viewBox="0 0 24 24" width="' + px + '" height="' + px + '" aria-hidden="true"><path d="M12 2.5 L14.9 8.6 L21.5 9.4 L16.6 14 L17.9 20.6 L12 17.3 L6.1 20.6 L7.4 14 L2.5 9.4 L9.1 8.6Z" fill="' + (penuh ? '#FFC53D' : '#E7E0D2') + '" stroke="' + (penuh ? '#C98A00' : '#BFB6A2') + '" stroke-width="1.5" stroke-linejoin="round"/></svg>'; }

  return {bulat: bulat, pelanggan: pelanggan, barang: barang, wang: wang, ikon: ikon, hati: hati, bintang: bintang, nVarian: VARIAN.length};
})();
