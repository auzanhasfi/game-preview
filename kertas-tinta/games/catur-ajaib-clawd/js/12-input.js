/* Catur Ajaib Clawd: seret & ketuk hero (papan ↔ bangku ↔ toko untuk jual), pasang item, tombol toko & alat */
'use strict';
function evPos(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
function unitAtPx(px, py) {
  /* sprite hero berdiri di atas petaknya: coba titik ketuk dan sedikit di bawahnya */
  var tries = [[px, py], [px, py + LY.cell * 0.45]];
  for (var i = 0; i < tries.length; i++) {
    var t = dropTarget(tries[i][0], tries[i][1]); if (!t) continue;
    var u = t.b === 'board' ? unitAt(G.me, 'board', t.x, t.y) : unitAt(G.me, 'bench', t.x);
    if (u) return u;
  }
  return null;
}
cv.addEventListener('pointerdown', function (e) {
  if (!G || G.modal || G.paused) return; audioInit();
  var p = evPos(e), u = unitAtPx(p.x, p.y);
  if (G.phase === 'tempur' && u && u.b === 'board') { G.sel = u; hudDirty = true; return; }
  if (u) { G.drag = { u: u, sx: p.x, sy: p.y, px: p.x, py: p.y, moved: false }; try { cv.setPointerCapture(e.pointerId); } catch (er) {} }
  else G.drag = { u: null, sx: p.x, sy: p.y, px: p.x, py: p.y, moved: false };
});
cv.addEventListener('pointermove', function (e) {
  if (!G || !G.drag || !G.drag.u) return; var p = evPos(e);
  G.drag.px = p.x; G.drag.py = p.y;
  if (!G.drag.moved && Math.hypot(p.x - G.drag.sx, p.y - G.drag.sy) > 8) {
    if (G.phase === 'tempur' && G.drag.u.b === 'board') return;
    G.drag.moved = true;
  }
  if (G.drag.moved) { var tk = $('toko').getBoundingClientRect(); $('toko').classList.toggle('jualSini', e.clientY >= tk.top); }
});
function endDrag(e) {
  if (!G || !G.drag) return;
  var d = G.drag, p = evPos(e), me = G.me; G.drag = null; $('toko').classList.remove('jualSini');
  if (d.u && d.moved) {
    var tk = $('toko').getBoundingClientRect();
    if (e.clientY >= tk.top && e.clientY <= tk.bottom) { sell(me, d.u); return; }
    var t = dropTarget(p.x, p.y); if (t) moveUnit(me, d.u, t.b, t.x, t.y);
    G.sel = d.u; hudDirty = true; return;
  }
  /* ketuk */
  var u = d.u;
  if (u) {
    if (G.selItem >= 0) { equip(me, G.selItem, u); G.selItem = -1; G.sel = u; hudDirty = true; return; }
    if (G.sel && G.sel !== u && G.phase === 'persiapan') { var s = G.sel; moveUnit(me, s, u.b, u.x, u.y); G.sel = null; hudDirty = true; return; }
    G.sel = G.sel === u ? null : u; sfx('tap'); hudDirty = true; return;
  }
  var tg = dropTarget(p.x, p.y);
  if (tg && G.sel && G.phase === 'persiapan') { moveUnit(me, G.sel, tg.b, tg.x, tg.y); G.sel = null; hudDirty = true; return; }
  G.sel = null; hudDirty = true;
}
cv.addEventListener('pointerup', endDrag);
cv.addEventListener('pointercancel', function () { if (G) { G.drag = null; $('toko').classList.remove('jualSini'); } });

$('shop').addEventListener('click', function (e) { var b = e.target.closest('button[data-i]'); if (!b || !G || G.phase !== 'persiapan') return; audioInit(); buy(G.me, +b.getAttribute('data-i')); });
$('bRoll').onclick = function () { audioInit(); if (G && G.phase === 'persiapan') reroll(G.me); };
$('bXp').onclick = function () { audioInit(); if (G && G.phase === 'persiapan') buyXp(G.me); };
$('bLock').onclick = function () { if (G && G.phase === 'persiapan') { G.locked = !G.locked; sfx('tap'); hudDirty = true; } };
$('bReady').onclick = function () { audioInit(); if (G) startBattle(); };
$('itemBar').addEventListener('click', function (e) { var b = e.target.closest('button[data-it]'); if (!b || !G) return; var i = +b.getAttribute('data-it'); G.selItem = G.selItem === i ? -1 : i; if (G.sel && G.selItem >= 0) { equip(G.me, G.selItem, G.sel); G.selItem = -1; } sfx('tap'); hudDirty = true; });
$('bSpeed').onclick = function () { if (G) { G.speed = G.speed === 1 ? 2 : 1; hudDirty = true; } };
$('bMute').onclick = function () { muted = !muted; try { localStorage.setItem('catur-ajaib-mute', muted ? '1' : '0'); } catch (e) {} if (muted) musicStop(); setMuteIcon(); };
function setMuteIcon() { $('bMute').innerHTML = ic(muted ? 'mute' : 'sound', 20); }
$('bPause').onclick = function () { openPause(); };
$('bKmd').onclick = function () { audioInit(); openKmd(); };
document.addEventListener('keydown', function (e) {
  if (!G || G.modal || document.getElementById('game').hidden) return;
  var k = e.key.toLowerCase();
  if (k === 'd') $('bRoll').click(); else if (k === 'f') $('bXp').click(); else if (k === ' ' && G.phase === 'persiapan') { e.preventDefault(); startBattle(); }
  else if ((k === 'e' || k === 'delete') && G.sel) { sell(G.me, G.sel); G.sel = null; }
  else if (k >= '1' && k <= '5') buy(G.me, +k - 1);
});
