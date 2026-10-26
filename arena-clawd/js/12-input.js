/* Arena Clawd: input sentuh & papan kekunci */
'use strict';
/* ---------- input ---------- */
var joy = { active: false, id: null, bx: 0, by: 0, kx: 0, ky: 0 }, pressedBtn = {}, ptrBtn = {};
function local(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
function hitBtn(p) {
  for (var i = BTN.length - 1; i >= 0; i--) { var b = BTN[i]; if (b.rect) { if (p.x >= b.rect[0] && p.x <= b.rect[0] + b.rect[2] && p.y >= b.rect[1] && p.y <= b.rect[1] + b.rect[3]) return b; } else if (Math.hypot(p.x - b.x, p.y - b.y) < b.r + 6) return b; }
  return null;
}
function pressBtn(id) {
  if (id === 'atk') { G.input.atk = true; heroAttack(); }
  else if (id === 'shop') openShop();
  else if (id === 'qbuy') quickBuy();
  else if (id === 'spell') { if (!useSpell()) sfx('tap'); }
  else if (id === 'recall') startRecall();
  else if (id.slice(0, 2) === 'up') upSkill(+id[2]);
  else if (!skill(+id[1])) sfx('tap');
}
function startRecall() { var h = G.hero; if (h.dead || h.recall > 0) return; G.input.x = G.input.y = 0; h.recall = 0.001; toast('Balik ke pangkalan… jangan bergerak 3 saat.'); }
cv.addEventListener('pointerdown', function (e) {
  audioInit(); if (!G || G.state !== 'main') return;
  e.preventDefault(); var p = local(e), b = hitBtn(p);
  if (b) { ptrBtn[e.pointerId] = b.id; pressedBtn[b.id] = true; pressBtn(b.id); try { cv.setPointerCapture(e.pointerId); } catch (er) {} return; }
  if (p.x < CW * 0.6 && !joy.active) { joy.active = true; joy.id = e.pointerId; joy.bx = p.x; joy.by = p.y; joy.kx = 0; joy.ky = 0; try { cv.setPointerCapture(e.pointerId); } catch (er) {} }
});
cv.addEventListener('pointermove', function (e) {
  if (!joy.active || e.pointerId !== joy.id || !G) return;
  var p = local(e), dx = p.x - joy.bx, dy = p.y - joy.by, d = Math.hypot(dx, dy), R = 58 * Math.max(0.78, Math.min(1.25, Math.min(CW, CH) / 430));
  if (d > R) { dx *= R / d; dy *= R / d; }
  joy.kx = dx; joy.ky = dy; G.input.x = dx / R; G.input.y = dy / R;
});
function up(e) {
  if (ptrBtn[e.pointerId]) { var id = ptrBtn[e.pointerId]; delete ptrBtn[e.pointerId]; pressedBtn[id] = false; if (id === 'atk' && G) G.input.atk = false; }
  if (joy.active && e.pointerId === joy.id) { joy.active = false; if (G) { G.input.x = 0; G.input.y = 0; } }
}
cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
var keys = {};
function keyInput() { if (!G || joy.active) return; G.input.x = (keys.right ? 1 : 0) - (keys.left ? 1 : 0); G.input.y = (keys.down ? 1 : 0) - (keys.up ? 1 : 0); G.input.atk = !!keys.atk; }
var KM = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right', j: 'atk', J: 'atk', ' ': 'atk' };
window.addEventListener('keydown', function (e) {
  if (!G) return;
  if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') { pause(G.state === 'main'); return; }
  if (G.state !== 'main') return;
  var k = KM[e.key]; if (k) { keys[k] = true; keyInput(); e.preventDefault(); }
  var sk = { q: 0, Q: 0, e: 1, E: 1, r: 2, R: 2, 1: 0, 2: 1, 3: 2 }[e.key]; if (sk !== undefined) { if (e.ctrlKey || e.shiftKey) upSkill(sk); else skill(sk); }
  if (e.key === 'f' || e.key === 'F') useSpell();
  if (e.key === 'b' || e.key === 'B') startRecall();
  if (e.key === 'i' || e.key === 'I') openShop();
  if (e.key === 'g' || e.key === 'G') quickBuy();
});
window.addEventListener('keyup', function (e) { var k = KM[e.key]; if (k) { keys[k] = false; keyInput(); } });
