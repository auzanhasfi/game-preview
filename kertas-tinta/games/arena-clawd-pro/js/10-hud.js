/* Arena Clawd Pro: HUD kanvas: peta mini, koin, tombol skill, joystick */
'use strict';

/* ---------- HUD ---------- */
function nextBuild() { if (!G || G.items.length >= 6) return null; for (var i = 0; i < G.build.length; i++) if (G.items.indexOf(G.build[i]) < 0) return itemById(G.build[i]); return null; }
var BTN = [], UPB = [];
function rbox(x, y, w, hgt, fill) { ctx.fillStyle = fill || 'rgba(250,248,242,0.92)'; ctx.fillRect(x, y, w, hgt); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.strokeRect(x, y, w, hgt); }
function drawHud() {
  var h = G.hero, H = HEROES[h.id], u = Math.max(0.78, Math.min(1.25, Math.min(CW, CH) / 430));
  var ms = Math.round(Math.min(160, Math.min(CW, CH) * 0.28)), mx = 10, my = 10, k = ms / WS;
  ctx.fillStyle = PAPER2; ctx.fillRect(mx - 3, my - 3, ms + 6, ms + 6);
  ctx.drawImage(MINI, mx, my, ms, ms); ctx.lineWidth = 1.5; ctx.strokeStyle = INK; ctx.strokeRect(mx - 1, my - 1, ms + 2, ms + 2);
  G.structs.forEach(function (s) { if (s.hp <= 0) return; var sz = s.kind === 'core' ? 10 : 7; ctx.fillStyle = s.team ? NAVY : CL; ctx.fillRect(mx + s.x * k - sz / 2, my + s.y * k - sz / 2, sz, sz); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(mx + s.x * k - sz / 2, my + s.y * k - sz / 2, sz, sz); });
  G.units.forEach(function (un) { if (!alive(un)) return; if (un.kind === 'minion') { var mz = un.mt === 'super' || un.mt === 'meriam' ? 4.5 : 3; ctx.fillStyle = un.team ? NAVY : CL; ctx.fillRect(mx + un.x * k - mz / 2, my + un.y * k - mz / 2, mz, mz); } else if (un.kind === 'monster') { ctx.fillStyle = { kelomang: '#f2b07a', merah: '#d9534a', biru: SKY, penyu: '#5f7d6a' }[un.type]; ctx.beginPath(); ctx.arc(mx + un.x * k, my + un.y * k, un.type === 'penyu' ? 5 : 3.5, 0, 6.3); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.stroke(); } });
  if (!h.dead) { ctx.fillStyle = H.col; ctx.beginPath(); ctx.arc(mx + h.x * k, my + h.y * k, 5.5, 0, 6.3); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke(); ctx.lineWidth = 1; ctx.strokeStyle = INK; ctx.stroke(); }
  var hw = CW / 2 / cam.z, hh = CH / 2 / cam.z; ctx.strokeStyle = 'rgba(46,38,32,0.7)'; ctx.lineWidth = 1; ctx.strokeRect(mx + (cam.x - hw) * k, my + (cam.y - hh) * k, hw * 2 * k, hh * 2 * k);
  /* level, XP, koin, toko */
  var by = my + ms + 10;
  rbox(mx - 3, by - 2, ms + 6, 34);
  ctx.font = '700 14px "Source Serif 4", Georgia, serif'; ctx.fillStyle = INK; ctx.textAlign = 'left'; ctx.fillText(tx(H.nama).replace('Clawd ', '') + ' · ' + L('Lv ', 'Thp ') + h.lvl, mx + 3, by + 14);
  var need = 90 + h.lvl * 60; ctx.fillStyle = '#e8e1d2'; ctx.fillRect(mx + 3, by + 20, ms - 6, 6); ctx.fillStyle = GOLD; ctx.fillRect(mx + 3, by + 20, (ms - 6) * Math.min(1, h.xp / need), 6); ctx.strokeRect(mx + 3, by + 20, ms - 6, 6);
  BTN = [];
  var sy = by + 40; rbox(mx - 3, sy, ms + 6, 38, '#fbefc9');
  ctx.font = '700 16px "IBM Plex Mono", monospace'; ctx.fillStyle = '#7a5410'; ctx.textAlign = 'left'; drawIcon('coin', mx + 13, sy + 19, 17, '#7a5410', 1.8); ctx.fillText(Math.floor(G.gold), mx + 26, sy + 25); ctx.font = '700 14px Geist, sans-serif'; ctx.fillStyle = INK; ctx.textAlign = 'right'; ctx.fillText(L('Toko', 'Kedai'), mx + ms - 2, sy + 25); drawIcon('bag', mx + ms - 4 - ctx.measureText(L('Toko', 'Kedai')).width - 12, sy + 19, 16, INK, 1.8);
  BTN.push({ id: 'shop', rect: [mx - 3, sy, ms + 6, 38] });
  var cheap = ITEMS.some(function (it) { return !it.potion && G.items.indexOf(it.id) < 0 && it.harga <= G.gold; }) && G.items.length < 6;
  if (cheap) { ctx.fillStyle = '#d9534a'; ctx.beginPath(); ctx.arc(mx + ms + 1, sy + 2, 6 + Math.sin(time * 6), 0, 6.3); ctx.fill(); }
  /* beli cepat: item berikutnya dari build (kanan atas, seperti rekomendasi item ML) */
  var nx = nextBuild();
  if (nx && !h.dead) {
    var qs = 58, qx = CW - qs - 10, qy = 62, can = G.gold >= nx.harga;
    if (can) { ctx.save(); ctx.globalAlpha = 0.35 + Math.sin(time * 6) * 0.15; ctx.fillStyle = GOLD; ctx.fillRect(qx - 4, qy - 4, qs + 8, qs + 22); ctx.restore(); }
    rbox(qx, qy, qs, qs + 14, can ? '#fbefc9' : 'rgba(250,248,242,0.85)');
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha = can ? 1 : 0.55; drawIcon(nx.ikon, qx + qs / 2, qy + 24, 28, INK, 1.9); ctx.globalAlpha = 1;
    ctx.font = '700 12px "IBM Plex Mono", monospace'; ctx.fillStyle = can ? '#7a5410' : '#8a8172'; ctx.fillText(nx.harga, qx + qs / 2, qy + 50);
    ctx.font = '800 9px Geist, sans-serif'; ctx.fillStyle = INK; ctx.fillText(can ? L('BELI', 'BELI') : L('NANTI', 'NANTI'), qx + qs / 2, qy + 64); ctx.textBaseline = 'alphabetic';
    BTN.push({ id: 'qbuy', rect: [qx, qy, qs, qs + 14] });
  }
  /* info tengah: waktu, menara, minion, kombo */
  var mm = Math.floor(G.t / 60), ss = Math.floor(G.t % 60), info = (mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss + '     ' + G.towers + '/' + G.towerTotal + '     ' + G.kills;
  ctx.font = '600 15px "IBM Plex Mono", monospace'; ctx.textAlign = 'center';
  var iw = ctx.measureText(info).width + 24, ix = Math.max(mx + ms + 12 + iw / 2, CW / 2), iy = 12;
  if (ix + iw / 2 > CW - 110) { ix = mx - 3 + iw / 2; iy = sy + 46; }
  rbox(ix - iw / 2, iy, iw, 30); ctx.fillStyle = INK; ctx.fillText(info, ix, iy + 20);
  (function () { var x0 = ix - ctx.measureText(info).width / 2, w1 = ctx.measureText((mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss + '  ').width, w2 = ctx.measureText((mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss + '     ' + G.towers + '/' + G.towerTotal + '  ').width; drawIcon('castle', x0 + w1 + 7, iy + 15, 14, INK, 1.8); drawIcon('swords', x0 + w2 + 7, iy + 15, 14, INK, 1.8); })();
  /* kombo: 3 kotak */
  var cy0 = iy + 36, cx0 = iy > 12 ? mx - 3 : ix - 66;
  rbox(cx0, cy0, 132, 26, G.combo ? '#fde7c8' : 'rgba(250,248,242,0.92)');
  ctx.font = '700 13px Geist, sans-serif'; ctx.fillStyle = INK; ctx.textAlign = 'left'; ctx.fillText(L('Kombo', 'Kombo'), cx0 + 6, cy0 + 18);
  for (var ci = 0; ci < 3; ci++) { ctx.beginPath(); ctx.arc(cx0 + 74 + ci * 20, cy0 + 13, 7, 0, 6.3); ctx.fillStyle = ci < G.combo ? '#e8703a' : '#e8e1d2'; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = INK; ctx.stroke(); }
  /* buff */
  var BL = [['merah', 'flame'], ['biru', 'drop'], ['kuasa', 'sword'], ['laju', 'wind'], ['perisai', 'shield'], ['pecut', 'wind'], ['penyu', 'turtle'], ['tembok', 'bricks']].filter(function (x) { return G.buffs[x[0]] > 0; });
  var buy = cy0 + 32, bx0 = cx0;
  BL.forEach(function (x, i) { var bx = bx0 + i * 64; rbox(bx, buy, 60, 24); ctx.font = '600 13px Geist, sans-serif'; ctx.fillStyle = INK; ctx.textAlign = 'center'; drawIcon(x[1], bx + 14, buy + 12, 14, INK, 1.8); ctx.fillText(Math.ceil(G.buffs[x[0]]) + 's', bx + 38, buy + 17); });
  /* bar inti musuh */
  var c1 = G.core1;
  if (alive(c1) && !h.dead && Math.hypot(h.x - c1.x, h.y - c1.y) < 650) {
    var narrow = CW < 600, bw = narrow ? CW - ms - 34 : Math.min(360, CW * 0.5), bx2 = narrow ? mx + ms + 12 + bw / 2 : CW / 2, byy = narrow ? CH * 0.42 : 96 + 60;
    ctx.font = '700 16px "Source Serif 4", serif'; ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.fillText(L('Inti Istana Comot', 'Inti Istana Comot') + (shielded(c1) ? L(' · terlindung', ' · dilindungi') : ''), bx2, byy - 4);
    ctx.fillStyle = 'rgba(46,38,32,0.8)'; ctx.fillRect(bx2 - bw / 2 - 2, byy, bw + 4, 14); ctx.fillStyle = shielded(c1) ? '#8d9bbf' : '#7a4a9a'; ctx.fillRect(bx2 - bw / 2, byy + 2, bw * c1.hp / c1.max, 10);
  }
  /* spanduk */
  if (G.banner) { var bt = G.banner.t, al = bt < 0.25 ? bt / 0.25 : (bt > 2 ? (2.4 - bt) / 0.4 : 1), sc = bt < 0.25 ? 1.6 - bt * 2.4 : 1; ctx.save(); ctx.globalAlpha = Math.max(0, al); ctx.translate(CW / 2, CH * 0.3); ctx.scale(sc, sc); ctx.rotate(-0.03); ctx.font = '700 ' + Math.round(34 * u) + 'px Caveat, cursive'; ctx.textAlign = 'center'; var tw = Math.min(CW - 30, ctx.measureText(G.banner.s).width + 40); ctx.fillStyle = INK; ctx.fillRect(-tw / 2 + 5, -30 * u + 5, tw, 52 * u); ctx.fillStyle = '#fbefc9'; ctx.fillRect(-tw / 2, -30 * u, tw, 52 * u); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.strokeRect(-tw / 2, -30 * u, tw, 52 * u); ctx.fillStyle = INK; ctx.fillText(G.banner.s, 0, 8 * u, tw - 16); ctx.restore(); }
  if (h.dead) { ctx.fillStyle = 'rgba(46,38,32,0.35)'; ctx.fillRect(0, 0, CW, CH); ctx.font = '700 ' + Math.round(40 * u) + 'px Caveat, cursive'; ctx.fillStyle = PAPER2; ctx.textAlign = 'center'; ctx.fillText(L('Clawd bangkit dalam ', 'Clawd bangkit dalam ') + Math.ceil(Math.max(0, h.respT)) + '…', CW / 2, CH / 2); }
  /* tombol */
  var ax = CW - 76 * u, ay = CH - 76 * u;
  BTN.push({ id: 'atk', x: ax, y: ay, r: 46 * u });
  [[-118, -8], [-96, -100], [-12, -128]].forEach(function (p, i) { BTN.push({ id: 's' + i, x: ax + p[0] * u, y: ay + p[1] * u, r: 32 * u }); });
  BTN.push({ id: 'spell', x: ax - 196 * u, y: ay + 18 * u, r: 25 * u });
  BTN.push({ id: 'recall', x: ax - 196 * u, y: ay - 52 * u, r: 22 * u });
  var gt = gempurTarget();
  if (gt) BTN.push({ id: 'gempur', x: ax - 30 * u, y: ay - 214 * u, r: 34 * u });
  BTN.forEach(function (bt) {
    if (bt.id === 'shop') return;
    var isAtk = bt.id === 'atk', isG = bt.id === 'gempur', si = /^s\d$/.test(bt.id) ? +bt.id[1] : -1, cd = 0, max = 1, icon = '', lab = '', fill = PAPER2, locked = false;
    if (isAtk) fill = H.col;
    else if (isG) { cd = Math.max(0, G.gempurCd); max = 20; icon = 'zap'; lab = 'G'; fill = '#f6d77a'; }
    else if (si >= 0) { cd = h.cd[si]; max = skillCd(si) || 1; icon = H.sk[si].i; lab = 'QER'[si]; fill = si === 2 ? GOLD : PAPER2; locked = h.sl[si] === 0; }
    else if (bt.id === 'spell') { cd = h.spellCd; max = SPELLS[SET.spell].cd; icon = SPELLS[SET.spell].ikon; lab = 'F'; fill = '#e8eef8'; }
    else { icon = 'home'; lab = 'B'; fill = h.recall > 0 ? '#cfe0f4' : PAPER2; }
    var pressed = (isAtk && G.input.atk) || pressedBtn[bt.id];
    ctx.save(); ctx.globalAlpha = h.dead ? 0.4 : 0.95;
    if (isG && cd <= 0) { ctx.save(); ctx.globalAlpha = 0.35 + Math.sin(time * 6) * 0.15; ctx.beginPath(); ctx.arc(bt.x, bt.y, bt.r + 9, 0, 6.3); ctx.fillStyle = GOLD; ctx.fill(); ctx.restore(); }
    ctx.beginPath(); ctx.arc(bt.x, bt.y + 3, bt.r, 0, 6.3); ctx.fillStyle = 'rgba(46,38,32,0.85)'; ctx.fill();
    ctx.beginPath(); ctx.arc(bt.x, bt.y + (pressed ? 2 : 0), bt.r, 0, 6.3); ctx.fillStyle = locked ? '#cfc8ba' : fill; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke();
    if (cd > 0) { ctx.beginPath(); ctx.moveTo(bt.x, bt.y); ctx.arc(bt.x, bt.y, bt.r, -Math.PI / 2, -Math.PI / 2 + 6.283 * Math.min(1, cd / max)); ctx.closePath(); ctx.fillStyle = 'rgba(46,38,32,0.55)'; ctx.fill(); }
    ctx.fillStyle = isAtk ? '#fff' : INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (isAtk) { ctx.font = '800 ' + Math.round(15 * u) + 'px Geist, sans-serif'; ctx.fillStyle = ['pemanah', 'perisai', 'nini'].indexOf(h.id) >= 0 ? INK : '#fff'; ctx.fillText(L('SERANG', 'SERANG'), bt.x, bt.y + 1); }
    else {
      ctx.font = '800 ' + Math.round((si >= 0 || isG ? 24 : 18) * u) + 'px Geist, sans-serif'; var iy2 = bt.y - (isG ? 5 * u : 0); if (cd > 0 && !locked) ctx.fillText(Math.ceil(cd), bt.x, iy2); else drawIcon(locked ? 'lock' : icon, bt.x, iy2, (si >= 0 || isG ? 26 : 20) * u, INK, 2);
      if (isG) { ctx.font = '800 ' + Math.round(10 * u) + 'px Geist, sans-serif'; ctx.fillText(L('SOAL', 'SOALAN'), bt.x, bt.y + 15 * u); }
      ctx.font = '600 ' + Math.round(10 * u) + 'px "IBM Plex Mono", monospace'; ctx.fillStyle = INK; ctx.fillText(lab, bt.x + bt.r * 0.75, bt.y + bt.r * 0.75);
      if (si >= 0 && h.sl[si] > 0) { for (var d = 0; d < h.sl[si]; d++) { ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(bt.x - (h.sl[si] - 1) * 4 + d * 8, bt.y + bt.r + 7, 2.6, 0, 6.3); ctx.fill(); ctx.lineWidth = 0.8; ctx.strokeStyle = INK; ctx.stroke(); } }
      if (si === 2 && !locked) { ctx.font = '800 ' + Math.round(9 * u) + 'px Geist, sans-serif'; ctx.fillStyle = INK; drawIcon('pencil', bt.x - bt.r * 0.75, bt.y + bt.r * 0.7, 12 * u, INK, 1.8); }
    }
    ctx.restore();
    if (si >= 0 && canUp(si) && !h.dead) { var ux = bt.x - bt.r * 0.8, uy = bt.y - bt.r * 0.8, ur = 13 * u; UPB.push({ id: 'up' + si, x: ux, y: uy, r: ur }); ctx.beginPath(); ctx.arc(ux, uy, ur + Math.sin(time * 6) * 1.2, 0, 6.3); ctx.fillStyle = GOLD; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke(); ctx.fillStyle = INK; ctx.font = '800 ' + Math.round(18 * u) + 'px Geist, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('+', ux, uy + 1); }
  });
  BTN = BTN.concat(UPB); UPB = [];
  ctx.textBaseline = 'alphabetic';
  var jb = joy.active ? joy : { bx: 90 * u, by: CH - 90 * u, kx: 0, ky: 0 };
  ctx.save(); ctx.globalAlpha = joy.active ? 0.9 : 0.45;
  ctx.beginPath(); ctx.arc(jb.bx, jb.by, 58 * u, 0, 6.3); ctx.fillStyle = 'rgba(250,248,242,0.6)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.setLineDash([6, 6]); ctx.stroke(); ctx.setLineDash([]);
  ctx.beginPath(); ctx.arc(jb.bx + jb.kx, jb.by + jb.ky, 26 * u, 0, 6.3); ctx.fillStyle = H.col; ctx.fill(); ctx.strokeStyle = INK; ctx.stroke();
  ctx.restore();
}
