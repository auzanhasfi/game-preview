'use strict';
// Data klub. Nama pemain = gambaran skuad (bisa diubah di sini). Urutan pemain: GK, 4 bek, 3 gelandang, 3 penyerang.
// Statistik: [kecepatan, tembakan, umpan, bertahan] (GK: angka ke-4 = refleks kiper). Kit: baju, aksen (baju2), celana, kaos kaki, pola.
// pola: 'polos' | 'garis' (garis tegak) | 'tengah' (satu garis tengah) | 'lengan' (lengan beda warna)
(function () {
  const K = (id, n, k, kandang, tandang, kiper, p) => ({ id, n, k, kandang, tandang, kiper,
    pemain: p.map(([nama, no, s]) => ({ nama, no, st: { spd: s[0], sht: s[1], pas: s[2], def: s[3] } })) });
  G.KLUB = [
    K('mci', 'Manchester City', 'MCI', { baju: '#7cc3ec', baju2: '#1c2c5b', celana: '#f4f6fa', kaos: '#7cc3ec', pola: 'polos' }, { baju: '#1c2c5b', baju2: '#7cc3ec', celana: '#1c2c5b', kaos: '#1c2c5b', pola: 'polos' }, '#e6c43c', [
      ['Donnarumma', 25, [52, 40, 70, 89]], ['Nunes', 27, [82, 62, 76, 76]], ['Dias', 3, [70, 50, 72, 88]], ['Gvardiol', 24, [79, 66, 77, 85]], ["O'Reilly", 33, [80, 62, 74, 76]],
      ['Rodri', 16, [66, 78, 91, 86]], ['Reijnders', 4, [77, 80, 85, 70]], ['Foden', 47, [84, 86, 88, 55]],
      ['Doku', 11, [93, 76, 78, 35]], ['Haaland', 9, [89, 95, 68, 45]], ['Marmoush', 7, [87, 85, 76, 40]]]),
    K('mun', 'Manchester United', 'MUN', { baju: '#d4231c', baju2: '#ffffff', celana: '#f4f6fa', kaos: '#1b1b1f', pola: 'polos' }, { baju: '#f1f1ee', baju2: '#d4231c', celana: '#f1f1ee', kaos: '#f1f1ee', pola: 'polos' }, '#3dbb7a', [
      ['Lammens', 31, [50, 40, 66, 80]], ['Dalot', 2, [82, 65, 76, 76]], ['De Ligt', 4, [65, 55, 70, 84]], ['Maguire', 5, [55, 60, 68, 80]], ['Shaw', 23, [76, 60, 78, 77]],
      ['Mainoo', 37, [74, 72, 82, 76]], ['Casemiro', 18, [56, 75, 80, 82]], ['Fernandes', 8, [75, 86, 90, 65]],
      ['Mbeumo', 19, [85, 84, 80, 45]], ['Šeško', 30, [86, 84, 68, 42]], ['Cunha', 10, [84, 84, 80, 48]]]),
    K('rma', 'Real Madrid', 'RMA', { baju: '#f4f4f2', baju2: '#c9a33a', celana: '#f4f4f2', kaos: '#f4f4f2', pola: 'polos' }, { baju: '#1b2a4a', baju2: '#c9a33a', celana: '#1b2a4a', kaos: '#1b2a4a', pola: 'polos' }, '#2f8c6a', [
      ['Courtois', 1, [50, 40, 68, 89]], ['Alexander-Arnold', 12, [76, 74, 91, 74]], ['Militão', 3, [80, 55, 70, 85]], ['Huijsen', 24, [74, 55, 80, 82]], ['Carreras', 18, [82, 60, 76, 78]],
      ['Valverde', 8, [88, 82, 84, 78]], ['Tchouaméni', 14, [70, 72, 82, 85]], ['Bellingham', 5, [80, 87, 86, 72]],
      ['Güler', 15, [75, 84, 88, 50]], ['Mbappé', 10, [97, 93, 82, 36]], ['Vinícius', 7, [95, 85, 82, 30]]]),
    K('bar', 'Barcelona', 'BAR', { baju: '#a50044', baju2: '#1b4fa0', celana: '#1b3f86', kaos: '#a50044', pola: 'garis' }, { baju: '#f2d34b', baju2: '#a50044', celana: '#f2d34b', kaos: '#f2d34b', pola: 'polos' }, '#e8862f', [
      ['Joan García', 13, [52, 40, 70, 85]], ['Koundé', 23, [84, 62, 78, 84]], ['Cubarsí', 2, [72, 50, 82, 84]], ['Araujo', 4, [82, 55, 66, 85]], ['Balde', 3, [90, 60, 76, 74]],
      ['Pedri', 8, [76, 80, 93, 72]], ['De Jong', 21, [78, 72, 90, 77]], ['Fermín', 16, [80, 82, 82, 62]],
      ['Yamal', 10, [90, 87, 91, 40]], ['Lewandowski', 9, [72, 91, 78, 42]], ['Raphinha', 11, [88, 86, 84, 52]]]),
    K('liv', 'Liverpool', 'LIV', { baju: '#c8102e', baju2: '#f6eb61', celana: '#c8102e', kaos: '#c8102e', pola: 'polos' }, { baju: '#f2f2ee', baju2: '#c8102e', celana: '#f2f2ee', kaos: '#f2f2ee', pola: 'polos' }, '#8a5ad6', [
      ['Alisson', 1, [52, 40, 72, 88]], ['Frimpong', 30, [93, 70, 78, 72]], ['Konaté', 5, [82, 50, 66, 86]], ['Van Dijk', 4, [75, 65, 78, 90]], ['Kerkez', 6, [84, 62, 76, 76]],
      ['Szoboszlai', 8, [80, 84, 84, 74]], ['Mac Allister', 10, [68, 80, 86, 80]], ['Wirtz', 7, [80, 86, 90, 55]],
      ['Salah', 11, [88, 90, 84, 45]], ['Isak', 9, [86, 89, 78, 42]], ['Gakpo', 18, [84, 84, 78, 45]]]),
    K('ars', 'Arsenal', 'ARS', { baju: '#e8101c', baju2: '#ffffff', celana: '#f4f6fa', kaos: '#ffffff', pola: 'lengan' }, { baju: '#23305c', baju2: '#e8b23a', celana: '#23305c', kaos: '#23305c', pola: 'polos' }, '#3d8fd9', [
      ['Raya', 1, [52, 40, 74, 87]], ['Timber', 12, [80, 60, 76, 84]], ['Saliba', 2, [80, 50, 76, 90]], ['Gabriel', 6, [72, 62, 68, 88]], ['Calafiori', 33, [76, 64, 76, 80]],
      ['Ødegaard', 8, [74, 84, 92, 62]], ['Rice', 41, [78, 82, 86, 86]], ['Zubimendi', 36, [68, 72, 86, 84]],
      ['Saka', 7, [87, 86, 86, 58]], ['Gyökeres', 14, [88, 89, 72, 46]], ['Martinelli', 11, [90, 80, 76, 50]]]),
    K('che', 'Chelsea', 'CHE', { baju: '#0a4ea8', baju2: '#ffffff', celana: '#0a4ea8', kaos: '#ffffff', pola: 'polos' }, { baju: '#f2f2ee', baju2: '#0a4ea8', celana: '#f2f2ee', kaos: '#f2f2ee', pola: 'polos' }, '#e6c43c', [
      ['Sánchez', 1, [50, 40, 70, 80]], ['James', 24, [82, 78, 84, 80]], ['Fofana', 29, [78, 50, 64, 82]], ['Colwill', 6, [72, 55, 76, 82]], ['Cucurella', 3, [80, 58, 78, 80]],
      ['Caicedo', 25, [74, 70, 82, 88]], ['Enzo', 8, [72, 82, 86, 74]], ['Palmer', 10, [78, 88, 90, 50]],
      ['Estêvão', 41, [90, 82, 82, 36]], ['João Pedro', 20, [82, 84, 80, 44]], ['Neto', 7, [91, 78, 76, 46]]]),
    K('bay', 'Bayern München', 'BAY', { baju: '#dc052d', baju2: '#ffffff', celana: '#dc052d', kaos: '#dc052d', pola: 'polos' }, { baju: '#f2f2ee', baju2: '#dc052d', celana: '#f2f2ee', kaos: '#f2f2ee', pola: 'polos' }, '#2b9c6e', [
      ['Neuer', 1, [50, 40, 76, 86]], ['Kimmich', 6, [72, 76, 90, 82]], ['Upamecano', 2, [80, 50, 66, 84]], ['Tah', 4, [68, 52, 70, 86]], ['Davies', 19, [95, 64, 76, 76]],
      ['Pavlović', 45, [70, 72, 84, 80]], ['Goretzka', 8, [78, 80, 80, 76]], ['Musiala', 42, [84, 86, 88, 56]],
      ['Olise', 17, [85, 86, 88, 44]], ['Kane', 9, [70, 95, 86, 48]], ['Díaz', 14, [90, 84, 78, 52]]]),
    K('psg', 'Paris Saint-Germain', 'PSG', { baju: '#0b2a52', baju2: '#d81e2c', celana: '#0b2a52', kaos: '#0b2a52', pola: 'tengah' }, { baju: '#f2f2ee', baju2: '#d81e2c', celana: '#f2f2ee', kaos: '#f2f2ee', pola: 'tengah' }, '#e6c43c', [
      ['Chevalier', 30, [50, 40, 68, 82]], ['Hakimi', 2, [92, 76, 82, 78]], ['Marquinhos', 5, [72, 54, 76, 88]], ['Pacho', 51, [78, 48, 70, 84]], ['Mendes', 25, [90, 70, 78, 76]],
      ['Vitinha', 17, [72, 80, 92, 74]], ['João Neves', 87, [78, 74, 86, 80]], ['Zaïre-Emery', 33, [78, 74, 82, 76]],
      ['Doué', 14, [88, 84, 82, 42]], ['Dembélé', 10, [92, 89, 86, 42]], ['Kvaratskhelia', 7, [88, 85, 84, 45]]]),
    K('nas', 'Al Nassr', 'NAS', { baju: '#f5cf14', baju2: '#1d3f8f', celana: '#1d3f8f', kaos: '#f5cf14', pola: 'polos' }, { baju: '#1d3f8f', baju2: '#f5cf14', celana: '#1d3f8f', kaos: '#1d3f8f', pola: 'polos' }, '#3dbb7a', [
      ['Bento', 24, [50, 40, 66, 80]], ['Al-Ghannam', 2, [80, 58, 74, 74]], ['Simakan', 3, [80, 50, 64, 80]], ['Martínez', 26, [64, 58, 78, 82]], ['Al-Amri', 5, [70, 48, 62, 78]],
      ['Brozović', 77, [66, 74, 86, 78]], ['Al-Khaibari', 13, [70, 66, 74, 74]], ['João Félix', 11, [82, 82, 84, 44]],
      ['Mané', 10, [86, 84, 80, 44]], ['Ronaldo', 7, [80, 94, 80, 34]], ['Coman', 21, [90, 80, 80, 40]]])
  ];
  G.klub = id => G.KLUB.find(k => k.id === id) || G.KLUB[0];
  G.ratingKlub = k => Math.round(k.pemain.reduce((s, p, i) => s + (i === 0 ? p.st.def : Math.max(p.st.spd, p.st.sht, p.st.pas, p.st.def) * .55 + (p.st.spd + p.st.sht + p.st.pas + p.st.def) / 4 * .45), 0) / 11);
  G.bintangKlub = k => k.pemain.slice(1).sort((a, b) => b.st.sht + b.st.pas - a.st.sht - a.st.pas).slice(0, 3).map(p => p.nama);
  // formasi 4-3-3 dalam "bingkai serang": ax 0 = gawang sendiri → 1 = gawang lawan, ay 0..1 lebar
  G.FORMASI = [[.04, .5], [.22, .15], [.19, .38], [.19, .62], [.22, .85], [.44, .3], [.38, .5], [.44, .7], [.68, .18], [.73, .5], [.68, .82]];
  G.POSISI = ['GK', 'DF', 'DF', 'DF', 'DF', 'MF', 'MF', 'MF', 'FW', 'FW', 'FW'];
  G.KULIT = ['#f1c9a5', '#e0b08a', '#c68d63', '#a26b45', '#7a4b2e', '#5c3a24'];
  G.RAMBUT = ['#1f1a17', '#2f241c', '#4a3322', '#7b5a36', '#c9a46a', '#141414'];
})();
