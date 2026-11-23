/* Uji fisika Node: dari bola tertahan di tiap flipper, tekan pada berbagai waktu, catat tembakan yang tercapai + bola lolos meja */
import { Fisika } from '../js/05-fisika.js';
const hasil = {}; let lolos = 0, total = 0;
for (const sisi of [0, 1]) {
  for (let pos = 0; pos < 12; pos++) for (let jeda = 0; jeda < 10; jeda++) {
    const ev = [];
    const f = new Fisika((n, d) => ev.push([n, typeof d === 'number' ? d : d && d.i]));
    // bola jatuh dari inlane ke flipper
    const x0 = sisi ? 409 : 81;
    const b = f.tambahBola(x0, 760, 0, 200 + pos * 40);
    f.flip[sisi].tekan = false;
    let t = 0; const tekanPada = 0.1 + jeda * 0.035 + pos * 0.01;
    // biarkan menggelinding; tekan
    while (t < 4) {
      if (t > tekanPada && t < tekanPada + 0.35) f.flip[sisi].tekan = true; else f.flip[sisi].tekan = false;
      f.langkah(1 / 60); t += 1 / 60;
      for (const bb of f.bola) { if (bb.x < 10 || bb.x > 515 || bb.y < 5) { lolos++; bb.y = 2000; } }
      if (f.kotakTahan) f.lepasKotak();
    }
    total++;
    const k = new Set(ev.filter(e => ['orbit','ramp','kotak','lajur','bumper','target','clawd'].includes(e[0])).map(e => e[0] + (e[1] ?? '')));
    for (const x of k) hasil[sisi + ':' + x] = (hasil[sisi + ':' + x] || 0) + 1;
  }
}
console.log(JSON.stringify(hasil, null, 0)); console.log('lolos', lolos, 'dari', total);
