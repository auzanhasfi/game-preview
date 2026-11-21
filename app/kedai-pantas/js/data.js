'use strict';
/* Data kedai ikut negara + penjana pesanan. Semua nilai dalam unit terkecil (sen / rupiah). */
var NEGARA = {
  ms: {
    kod: 'MY', unit: 10, minJumlah: 60, maksJumlah: 1800,
    bayar: [500, 1000, 2000],
    denom: [10, 20, 50, 100, 500, 1000, 2000],
    fmt: function (v) { return 'RM ' + (v / 100).toFixed(2); },
    fmtDenom: function (v) { return v < 100 ? v + ' sen' : 'RM' + (v / 100); },
    barang: [
      {id: 'roti', nama: 'Roti', harga: 260}, {id: 'telur', nama: 'Telur', harga: 90},
      {id: 'susu', nama: 'Susu', harga: 350}, {id: 'air', nama: 'Air mineral', harga: 100},
      {id: 'biskut', nama: 'Biskut', harga: 180}, {id: 'pisang', nama: 'Pisang', harga: 120},
      {id: 'nasi', nama: 'Nasi lemak', harga: 200}, {id: 'mi', nama: 'Mi segera', harga: 140}
    ]
  },
  id: {
    kod: 'ID', unit: 500, minJumlah: 1500, maksJumlah: 18000,
    bayar: [5000, 10000, 20000],
    denom: [500, 1000, 2000, 5000, 10000, 20000],
    fmt: function (v) { return 'Rp ' + String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); },
    fmtDenom: function (v) { return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); },
    barang: [
      {id: 'roti', nama: 'Roti', harga: 6000}, {id: 'telur', nama: 'Telur', harga: 2000},
      {id: 'susu', nama: 'Susu kotak', harga: 5000}, {id: 'air', nama: 'Air mineral', harga: 3000},
      {id: 'biskut', nama: 'Biskuit', harga: 4000}, {id: 'pisang', nama: 'Pisang', harga: 2500},
      {id: 'tempe', nama: 'Tempe', harga: 3500}, {id: 'mi', nama: 'Mi instan', harga: 3000}
    ]
  }
};

/* jenis wang: syiling atau not */
function jenisWang(neg, v) { return (neg === 'ms' ? v < 100 : v < 2000) ? 'syiling' : 'not'; }

var TAHAP = [
  {id: 1, pelanggan: 6,  sabar: 30, jenis: [1, 1], qty: [1, 3], diskaun: 0,   notaLebih: 0},
  {id: 2, pelanggan: 8,  sabar: 26, jenis: [2, 3], qty: [1, 2], diskaun: 0,   notaLebih: 0.35},
  {id: 3, pelanggan: 10, sabar: 22, jenis: [1, 3], qty: [1, 3], diskaun: 0.8, notaLebih: 0.35}
];

function mulberry(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function acak(arr, rnd) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}
function bulat(v, unit) { return Math.round(v / unit) * unit; }
function hargaBarang(neg, id) {
  var b = NEGARA[neg].barang; for (var i = 0; i < b.length; i++) if (b[i].id === id) return b[i].harga; return 0;
}

/* Pesanan: {baris:[{id,qty}], jumlah, diskaun(%), bayarJumlah, nota, baki, opsiDisk:[...]} */
function buatPesanan(neg, cfg, rnd) {
  var N = NEGARA[neg];
  for (var cuba = 0; cuba < 3000; cuba++) {
    var nj = cfg.jenis[0] + Math.floor(rnd() * (cfg.jenis[1] - cfg.jenis[0] + 1));
    var baris = acak(N.barang, rnd).slice(0, nj).map(function (b) {
      return {id: b.id, qty: cfg.qty[0] + Math.floor(rnd() * (cfg.qty[1] - cfg.qty[0] + 1))};
    });
    var jumlah = 0; baris.forEach(function (r) { jumlah += r.qty * hargaBarang(neg, r.id); });
    if (jumlah < N.minJumlah || jumlah > N.maksJumlah) continue;
    var disk = 0;
    if (cfg.diskaun && rnd() < cfg.diskaun) disk = [10, 20, 25, 50][Math.floor(rnd() * 4)];
    var bayarJ = disk ? jumlah * (100 - disk) / 100 : jumlah;
    if (bayarJ % N.unit !== 0) continue;
    var notas = N.bayar.filter(function (n) { return n > bayarJ; });
    if (!notas.length) continue;
    var nota = notas[0]; if (notas[1] && rnd() < cfg.notaLebih) nota = notas[1];
    var p = {baris: baris, jumlah: jumlah, diskaun: disk, bayarJumlah: bayarJ, nota: nota, baki: nota - bayarJ, opsiDisk: []};
    if (disk) {
      var c = [jumlah, bulat(jumlah * (100 - 2 * disk) / 100, N.unit), bulat(jumlah * disk / 100, N.unit), bulat(jumlah * (100 + disk) / 100, N.unit), bulat(jumlah * (100 - disk / 2) / 100, N.unit)];
      var seen = {}; seen[bayarJ] = 1; var lain = [jumlah];
      seen[jumlah] = 1;
      acak(c.slice(1), rnd).forEach(function (v) { if (v > 0 && !seen[v] && lain.length < 2) { seen[v] = 1; lain.push(v); } });
      p.opsiDisk = acak([bayarJ].concat(lain), rnd);
    }
    return p;
  }
  var b0 = N.barang[0].harga; var n0 = N.bayar.filter(function (n) { return n > b0; })[0];
  return {baris: [{id: N.barang[0].id, qty: 1}], jumlah: b0, diskaun: 0, bayarJumlah: b0, nota: n0, baki: n0 - b0, opsiDisk: []};
}
