/* 10 — Kawalan: papan kekunci (anak panah/WASD) + kayu bedik terapung (seret jari/tetikus di kanvas). */
HB.input = { keys: {}, jx: 0, jy: 0, joy: null, used: false };

HB.arah = function () {
  var I = HB.input, k = I.keys, x = 0, y = 0;
  if (k.ArrowLeft || k.KeyA) x -= 1; if (k.ArrowRight || k.KeyD) x += 1;
  if (k.ArrowUp || k.KeyW) y -= 1; if (k.ArrowDown || k.KeyS) y += 1;
  if (x || y) { var l = Math.hypot(x, y); return { x: x / l, y: y / l }; }
  return { x: I.jx, y: I.jy };
};

HB.pasangKawalan = function (cv) {
  var I = HB.input;
  window.addEventListener('keydown', function (e) {
    if (/^(Arrow|Key[WASD])/.test(e.code)) { I.keys[e.code] = true; I.used = true; if (!$('game').hidden) e.preventDefault(); }
    if ((e.code === 'Enter' || e.code === 'Space') && !$('ccard').hidden && HB.kadGo) { e.preventDefault(); HB.kadGo(); }
  });
  window.addEventListener('keyup', function (e) { I.keys[e.code] = false; });
  window.addEventListener('blur', function () { I.keys = {}; I.jx = I.jy = 0; I.joy = null; });

  function pos(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; }
  cv.addEventListener('pointerdown', function (e) {
    audioInit();
    var p = pos(e); I.joy = { id: e.pointerId, ox: p.x, oy: p.y, x: p.x, y: p.y }; I.used = true;
    try { cv.setPointerCapture(e.pointerId); } catch (er) { /* abaikan */ }
    e.preventDefault();
  });
  cv.addEventListener('pointermove', function (e) {
    if (!I.joy || I.joy.id !== e.pointerId) return;
    var p = pos(e), dx = p.x - I.joy.ox, dy = p.y - I.joy.oy, d = Math.hypot(dx, dy), R = 34;
    if (d > R) { I.joy.ox = p.x - dx / d * R; I.joy.oy = p.y - dy / d * R; d = R; dx = p.x - I.joy.ox; dy = p.y - I.joy.oy; }
    I.joy.x = p.x; I.joy.y = p.y;
    var m = d < 4 ? 0 : (d - 4) / (R - 4);
    I.jx = d ? dx / d * m : 0; I.jy = d ? dy / d * m : 0;
  });
  function up(e) { if (I.joy && I.joy.id === e.pointerId) { I.joy = null; I.jx = I.jy = 0; } }
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
};

/* lukis kayu bedik di atas kanvas */
HB.lukisJoy = function () {
  var j = HB.input.joy; if (!j) return;
  ctx.save(); ctx.globalAlpha = 0.55;
  ctx.beginPath(); ctx.arc(j.ox, j.oy, 34, 0, 6.29); ctx.fillStyle = 'rgba(250,248,242,0.5)'; ctx.fill(); stroke(1.4, INK);
  var dx = j.x - j.ox, dy = j.y - j.oy, d = Math.hypot(dx, dy), k = d > 34 ? 34 / d : 1;
  ctx.beginPath(); ctx.arc(j.ox + dx * k, j.oy + dy * k, 13, 0, 6.29); ctx.fillStyle = CL; ctx.fill(); stroke(1.4, INK);
  ctx.restore();
};
