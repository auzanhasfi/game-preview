/* Arena Clawd: HUD kanvas */
'use strict';
/* ---------- HUD ---------- */
var BTN = [];
function drawHud() {
  var h = G.hero, H = HEROES[h.id], u = Math.max(0.78, Math.min(1.25, Math.min(CW, CH) / 430));
  var ms = Math.round(Math.min(160, Math.min(CW, CH) * 0.28)), mx = 10, my = 10, k = ms / WS;
  ctx.fillStyle = PAPER2; ctx.fillRect(mx - 3, my - 3, ms + 6, ms + 6);
  ctx.drawImage(MINI, mx, my, ms, ms); ctx.lineWidth = 1.5; ctx.strokeStyle = INK; ctx.strokeRect(mx - 1, my - 1, ms + 2, ms + 2);
  G.structs.forEach(function (s) { if (s.hp <= 0) return; var q = s.kind === 'mini' ? 2.5 : 3.5; ctx.fillStyle = s.kind === 'mini' ? '#5aa6a0' : (s.team ? NAVY : CL); ctx.fillRect(mx + s.x * k - q, my + s.y * k - q, q * 2, q * 2); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(mx + s.x * k - q, my + s.y * k - q, q * 2, q * 2); });
  G.units.forEach(function (un) { if (!alive(un)) return; if (un.kind === 'minion') { var q2 = un.naga ? 4 : 1.5; ctx.fillStyle = un.team ? NAVY : CL; ctx.fillRect(mx + un.x * k - q2, my + un.y * k - q2, q2 * 2, q2 * 2); } else if (un.kind === 'monster') { ctx.fillStyle = MON_COL[un.type]; ctx.beginPath(); ctx.arc(mx + un.x * k, my + un.y * k, un.type === 'penyu' || un.type === 'naga' ? 5 : 3.5, 0, 6.3); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.stroke(); } else if (un.kind === 'rival') { ctx.fillStyle = RIVAL; ctx.beginPath(); ctx.arc(mx + un.x * k, my + un.y * k, 5, 0, 6.3); ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = '#fff'; ctx.stroke(); } });
  if (alive(G.boss)) { ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(mx + G.boss.x * k, my + G.boss.y * k, 6, 0, 6.3); ctx.fill(); ctx.strokeStyle = INK; ctx.stroke(); }
  if (!h.dead) { ctx.fillStyle = H.col; ctx.beginPath(); ctx.arc(mx + h.x * k, my + h.y * k, 5.5, 0, 6.3); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke(); ctx.lineWidth = 1; ctx.strokeStyle = INK; ctx.stroke(); }
  var hw = CW / 2 / cam.z, hh = CH / 2 / cam.z; ctx.strokeStyle = 'rgba(46,38,32,0.7)'; ctx.lineWidth = 1; ctx.strokeRect(mx + (cam.x - hw) * k, my + (cam.y - hh) * k, hw * 2 * k, hh * 2 * k);
  /* tahap, XP, syiling, kedai */
  var by = my + ms + 10;
  ctx.fillStyle = 'rgba(250,248,242,0.92)'; ctx.fillRect(mx - 3, by - 2, ms + 6, 34); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.strokeRect(mx - 3, by - 2, ms + 6, 34);
  ctx.font = '700 14px "Source Serif 4", Georgia, serif'; ctx.fillStyle = INK; ctx.textAlign = 'left'; ctx.fillText(H.nama.replace('Clawd ', '') + ' · Tahap ' + h.lvl, mx + 3, by + 14);
  var need = 90 + h.lvl * 60; ctx.fillStyle = '#e8e1d2'; ctx.fillRect(mx + 3, by + 20, ms - 6, 6); ctx.fillStyle = GOLD; ctx.fillRect(mx + 3, by + 20, (ms - 6) * Math.min(1, h.xp / need), 6); ctx.strokeRect(mx + 3, by + 20, ms - 6, 6);
  BTN = [];
  var sy = by + 40; ctx.fillStyle = '#fbefc9'; ctx.fillRect(mx - 3, sy, ms + 6, 38); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.strokeRect(mx - 3, sy, ms + 6, 38);
  drawIcon('coin', mx + 12, sy + 19, 18, '#7a5410'); ctx.font = '700 16px "IBM Plex Mono", monospace'; ctx.fillStyle = '#7a5410'; ctx.textAlign = 'left'; ctx.fillText(Math.floor(G.gold), mx + 25, sy + 25);
  ctx.font = '700 14px Geist, sans-serif'; ctx.fillStyle = INK; ctx.textAlign = 'right'; ctx.fillText('Kedai', mx + ms - 2, sy + 25); drawIcon('bag', mx + ms - 50, sy + 19, 16, INK);
  BTN.push({ id: 'shop', x: mx + ms / 2, y: sy + 19, r: ms / 2, rect: [mx - 3, sy, ms + 6, 38] });
  var cheap = ITEMS.some(function (it) { return G.items.indexOf(it.id) < 0 && it.harga <= G.gold; }) && G.items.length < 6;
  if (cheap) { ctx.fillStyle = '#d9534a'; ctx.beginPath(); ctx.arc(mx + ms + 1, sy + 2, 6 + Math.sin(time * 6), 0, 6.3); ctx.fill(); }
  /* beli cepat: item seterusnya dalam binaan cadangan hero */
  var nx = nextBuild(), qy = sy + 44, below = sy + 46;
  if (nx && G.items.length < 6) {
    var can = G.gold >= nx.harga; below = qy + 40;
    ctx.fillStyle = can ? '#eef4e2' : 'rgba(250,248,242,0.88)'; ctx.fillRect(mx - 3, qy, ms + 6, 34); ctx.lineWidth = can ? 2 : 1.2; ctx.strokeStyle = can ? '#3f6b22' : INK; ctx.strokeRect(mx - 3, qy, ms + 6, 34);
    drawIcon(nx.ikon, mx + 12, qy + 17, 18, INK); ctx.textAlign = 'left'; ctx.font = '600 12px Geist, sans-serif'; ctx.fillStyle = INK; ctx.fillText((can ? 'Beli: ' : '') + nx.nama, mx + 26, qy + 14);
    ctx.font = '600 11px "IBM Plex Mono", monospace'; ctx.fillStyle = '#7a5410'; ctx.fillText(nx.harga + (can ? ' · ketik' : ' · kumpul lagi'), mx + 26, qy + 28);
    BTN.push({ id: 'qbuy', x: mx + ms / 2, y: qy + 17, r: 1, rect: [mx - 3, qy, ms + 6, 34] });
  }
  /* info tengah: masa, menara, minion, Pendekar tumbang/Clawd tumbang */
  var mm = Math.floor(G.t / 60), ss = Math.floor(G.t % 60), segs = [[null, (mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss], ['castle', G.towers + '/6'], ['swords', G.kills]];
  if (G.lawan !== 'tiada') segs.push(['trophy', G.rk + ' / ' + G.deaths]);
  ctx.font = '600 15px "IBM Plex Mono", monospace'; ctx.textAlign = 'left';
  var iw = 12; segs.forEach(function (sg) { iw += ctx.measureText(String(sg[1])).width + (sg[0] ? 22 : 0) + 14; }); iw += 0;
  var ix = Math.max(mx + ms + 12 + iw / 2, CW / 2), iy = 12;
  if (ix + iw / 2 > CW - 110) { ix = mx - 3 + iw / 2; iy = below; }
  ctx.fillStyle = 'rgba(250,248,242,0.92)'; ctx.fillRect(ix - iw / 2, iy, iw, 30); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.strokeRect(ix - iw / 2, iy, iw, 30);
  var cx0 = ix - iw / 2 + 12; segs.forEach(function (sg) { if (sg[0]) { drawIcon(sg[0], cx0 + 8, iy + 15, 16, INK, 1.8); cx0 += 22; } ctx.fillStyle = INK; ctx.fillText(sg[1], cx0, iy + 20); cx0 += ctx.measureText(String(sg[1])).width + 14; });
  /* buff */
  var BL = [['merah', 'flame'], ['biru', 'drop'], ['kuasa', 'swords'], ['laju', 'boot'], ['perisai', 'shield'], ['pecut', 'wind'], ['penyu', 'turtle'], ['semangat', 'leaf'], ['halimunan', 'shadow'], ['tembok', 'book'], ['bersih', 'sparkle']].filter(function (x) { return G.buffs[x[0]] > 0; });
  var buy = iy > 12 ? iy + 36 : 48, bx0 = iy > 12 ? mx - 3 : ix - BL.length * 29;
  BL.forEach(function (x, i) { var bx = bx0 + i * 58; ctx.fillStyle = 'rgba(250,248,242,0.92)'; ctx.fillRect(bx, buy, 54, 24); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.strokeRect(bx, buy, 54, 24); drawIcon(x[1], bx + 13, buy + 12, 14, INK, 1.8); ctx.font = '600 13px Geist, sans-serif'; ctx.fillStyle = INK; ctx.textAlign = 'left'; ctx.fillText(Math.ceil(G.buffs[x[0]]) + 's', bx + 24, buy + 17); });
  /* umpan berita (kill feed) */
  G.feed.forEach(function (f, i) { ctx.save(); ctx.globalAlpha = f.t > 4.3 ? Math.max(0, (5 - f.t) / 0.7) : 1; ctx.font = '600 13px Geist, sans-serif'; var tw = ctx.measureText(f.s).width + 22, fx = CW - 10 - tw, fy = 62 + i * 30; ctx.fillStyle = 'rgba(250,248,242,0.95)'; ctx.fillRect(fx, fy, tw, 24); ctx.fillStyle = f.col; ctx.fillRect(fx, fy, 5, 24); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(fx, fy, tw, 24); ctx.fillStyle = INK; ctx.textAlign = 'left'; ctx.fillText(f.s, fx + 13, fy + 17); ctx.restore(); });
  /* boss */
  var b = G.boss;
  if (alive(b) && !h.dead && Math.hypot(h.x - b.x, h.y - b.y) < 600) {
    var narrow = CW < 600, bw = narrow ? CW - ms - 34 : Math.min(360, CW * 0.5), bx2 = narrow ? mx + ms + 12 + bw / 2 : CW / 2, byy = narrow ? 84 : 96;
    ctx.font = '700 16px "Source Serif 4", serif'; ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.fillText('Raja Comot' + (shielded(b) ? ' · berperisai' : ''), bx2, byy - 4);
    ctx.fillStyle = 'rgba(46,38,32,0.8)'; ctx.fillRect(bx2 - bw / 2 - 2, byy, bw + 4, 14); ctx.fillStyle = shielded(b) ? '#8d9bbf' : '#7a4a9a'; ctx.fillRect(bx2 - bw / 2, byy + 2, bw * b.hp / b.max, 10);
  }
  /* sepanduk */
  if (G.banner) { var bt = G.banner.t, al = bt < 0.25 ? bt / 0.25 : (bt > 2 ? (2.4 - bt) / 0.4 : 1), sc = bt < 0.25 ? 1.6 - bt * 2.4 : 1; ctx.save(); ctx.globalAlpha = Math.max(0, al); ctx.translate(CW / 2, CH * 0.3); ctx.scale(sc, sc); ctx.rotate(-0.03); ctx.font = '700 ' + Math.round(38 * u) + 'px Caveat, cursive'; ctx.textAlign = 'center'; var tw = ctx.measureText(G.banner.s).width + 40; ctx.fillStyle = INK; ctx.fillRect(-tw / 2 + 5, -30 * u + 5, tw, 52 * u); ctx.fillStyle = '#fbefc9'; ctx.fillRect(-tw / 2, -30 * u, tw, 52 * u); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.strokeRect(-tw / 2, -30 * u, tw, 52 * u); ctx.fillStyle = INK; ctx.fillText(G.banner.s, 0, 8 * u); ctx.restore(); }
  if (h.dead) { ctx.fillStyle = 'rgba(46,38,32,0.35)'; ctx.fillRect(0, 0, CW, CH); ctx.font = '700 ' + Math.round(40 * u) + 'px Caveat, cursive'; ctx.fillStyle = PAPER2; ctx.textAlign = 'center'; ctx.fillText('Clawd bangkit dalam ' + Math.ceil(Math.max(0, h.respT)) + '…', CW / 2, CH / 2); }
  /* butang */
  var ax = CW - 76 * u, ay = CH - 76 * u;
  BTN.push({ id: 'atk', x: ax, y: ay, r: 46 * u });
  [[-118, -8], [-96, -100], [-12, -128]].forEach(function (p, i) { BTN.push({ id: 's' + i, x: ax + p[0] * u, y: ay + p[1] * u, r: 32 * u }); });
  BTN.push({ id: 'spell', x: ax - 196 * u, y: ay + 18 * u, r: 25 * u });
  BTN.push({ id: 'recall', x: ax - 196 * u, y: ay - 52 * u, r: 22 * u });
  BTN.forEach(function (bt) {
    if (bt.id === 'shop' || bt.id === 'qbuy') return;
    var isAtk = bt.id === 'atk', si = bt.id[0] === 's' && bt.id !== 'spell' ? +bt.id[1] : -1, cd = 0, max = 1, icon = '', lab = '', fill = PAPER2, locked = false;
    if (isAtk) fill = H.col;
    else if (si >= 0) { cd = h.cd[si]; max = skillCd(si) || 1; icon = H.sk[si].ic; lab = 'QER'[si]; fill = si === 2 ? GOLD : PAPER2; locked = h.sl[si] === 0; }
    else if (bt.id === 'spell') { cd = h.spellCd; max = SPELLS[pickSpell].cd; icon = SPELLS[pickSpell].ikon; lab = 'F'; fill = '#e8eef8'; }
    else { icon = 'home'; lab = 'B'; fill = h.recall > 0 ? '#cfe0f4' : PAPER2; }
    var pressed = (isAtk && G.input.atk) || pressedBtn[bt.id];
    ctx.save(); ctx.globalAlpha = h.dead ? 0.4 : 0.95;
    ctx.beginPath(); ctx.arc(bt.x, bt.y + 3, bt.r, 0, 6.3); ctx.fillStyle = 'rgba(46,38,32,0.85)'; ctx.fill();
    ctx.beginPath(); ctx.arc(bt.x, bt.y + (pressed ? 2 : 0), bt.r, 0, 6.3); ctx.fillStyle = locked ? '#cfc8ba' : fill; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke();
    if (cd > 0) { ctx.beginPath(); ctx.moveTo(bt.x, bt.y); ctx.arc(bt.x, bt.y, bt.r, -Math.PI / 2, -Math.PI / 2 + 6.283 * Math.min(1, cd / max)); ctx.closePath(); ctx.fillStyle = 'rgba(46,38,32,0.55)'; ctx.fill(); }
    ctx.fillStyle = isAtk ? '#fff' : INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (isAtk) { ctx.font = '800 ' + Math.round(15 * u) + 'px Geist, sans-serif'; ctx.fillStyle = h.id === 'pemanah' ? INK : '#fff'; ctx.fillText('SERANG', bt.x, bt.y + 1); }
    else {
      ctx.font = '800 ' + Math.round((si >= 0 ? 24 : 18) * u) + 'px Geist, sans-serif';
      if (locked) drawIcon('lock', bt.x, bt.y, bt.r * 0.8, INK, 2);
      else if (cd > 0) ctx.fillText(Math.ceil(cd), bt.x, bt.y);
      else drawIcon(icon, bt.x, bt.y, bt.r * (si >= 0 ? 0.95 : 0.85), INK, 2.2);
      ctx.font = '600 ' + Math.round(10 * u) + 'px "IBM Plex Mono", monospace'; ctx.fillStyle = INK; ctx.fillText(lab, bt.x + bt.r * 0.75, bt.y + bt.r * 0.75);
      if (si >= 0 && h.sl[si] > 0) { for (var d = 0; d < h.sl[si]; d++) { ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(bt.x - (h.sl[si] - 1) * 4 + d * 8, bt.y + bt.r + 7, 2.6, 0, 6.3); ctx.fill(); ctx.lineWidth = 0.8; ctx.strokeStyle = INK; ctx.stroke(); } }
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
var UPB = [];

function nextBuild() { var b = HEROES[G.hero.id].build; for (var i = 0; i < b.length; i++) if (G.items.indexOf(b[i]) < 0) return ITEMS.filter(function (x) { return x.id === b[i]; })[0]; return null; }
