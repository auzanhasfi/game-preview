/* Siaga Merdeka: partikel (asap, api, debu, percikan, puing), ledakan, kilat moncong, getaran layar. */
'use strict';

var MAKS_PARTIKEL = 900;

function partikel(x, y, vx, vy, umur, jenis, ukuran) {
  if (G.part.length >= MAKS_PARTIKEL) G.part.shift();
  G.part.push({ x: x, y: y, vx: vx, vy: vy, umur: umur, maks: umur, jenis: jenis, u: ukuran || 4, rot: Math.random() * 6, z: 0, vz: 0 });
}
function percik(x, y, warna, n) { for (var i = 0; i < n; i++) { var a = Math.random() * 6.3, v = 30 + Math.random() * 60; G.part.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, umur: 0.18, maks: 0.18, jenis: 'percik', warna: warna, u: 1.5 }); } }
function kilatMoncong(x, y, a, s) { G.part.push({ x: x, y: y, vx: 0, vy: 0, umur: 0.06, maks: 0.06, jenis: 'kilat', a: a, u: 6 * s }); }

function ledakan(x, y, s) {
  s = s || 1;
  if (!terlihatTitik(x, y)) { return; }
  G.part.push({ x: x, y: y, vx: 0, vy: 0, umur: 0.25, maks: 0.25, jenis: 'bola', u: 16 * s });
  G.part.push({ x: x, y: y, vx: 0, vy: 0, umur: 0.35, maks: 0.35, jenis: 'cincin', u: 26 * s });
  for (var i = 0; i < 6 * s + 2; i++) { var a = Math.random() * 6.3, v = 20 + Math.random() * 60 * s; partikel(x, y, Math.cos(a) * v, Math.sin(a) * v - 10, 0.45 + Math.random() * 0.3, 'api', (5 + Math.random() * 6) * s); }
  for (var j = 0; j < 5 * s + 2; j++) { var a2 = Math.random() * 6.3, v2 = 10 + Math.random() * 30; partikel(x, y, Math.cos(a2) * v2, Math.sin(a2) * v2 - 15, 1.4 + Math.random(), 'asap', (8 + Math.random() * 8) * s); }
  for (var k = 0; k < 4 * s; k++) { var a3 = Math.random() * 6.3, v3 = 60 + Math.random() * 90; var p = { x: x, y: y, vx: Math.cos(a3) * v3, vy: Math.sin(a3) * v3, umur: 0.8, maks: 0.8, jenis: 'serpih', u: 2 + Math.random() * 2, z: 0, vz: 90 + Math.random() * 90, rot: Math.random() * 6 }; G.part.push(p); }
  bunyi(s > 1.1 ? 'ledak' : 'kanonR', x, y);
}
function ledakanBesar(x, y, s) {
  ledakan(x, y, 2); getar(10 + s * 3); bunyi('ledakBesar', x, y);
  G.part.push({ x: x, y: y, vx: 0, vy: 0, umur: 0.6, maks: 0.6, jenis: 'cincin', u: 60 + s * 20 });
  for (var i = 0; i < 18; i++) { var a = Math.random() * 6.3, v = 15 + Math.random() * 40; partikel(x + Math.cos(a) * 10, y + Math.sin(a) * 10, Math.cos(a) * v, Math.sin(a) * v - 20, 2.5 + Math.random() * 2, 'asap', 14 + Math.random() * 14); }
}
function puingBangunan(b) {
  var c = G.ctxTanah, x0 = b.tx * TS, y0 = b.ty * TS, w = b.w * TS, h = b.h * TS;
  bekasHangus(b.x, b.y, Math.max(w, h) * 0.75);
  for (var i = 0; i < b.w * b.h * 6; i++) {
    c.fillStyle = ['#4a4238', '#5d544a', '#3a332c', '#6e6458'][i % 4];
    var px = x0 + Math.random() * w, py = y0 + Math.random() * h, s = 2 + Math.random() * 6;
    c.save(); c.translate(px, py); c.rotate(Math.random() * 3); c.fillRect(-s / 2, -s / 3, s, s * 0.6); c.restore();
  }
  for (var j = 0; j < 4 + b.w * b.h; j++) G.bara.push({ x: x0 + Math.random() * w, y: y0 + Math.random() * h, t: 6 + Math.random() * 8 });
}

function getar(n) { G.getar = Math.min(18, (G.getar || 0) + n); }

function terlihatTitik(x, y) {
  var i = idx(Math.max(0, Math.min(G.mw - 1, Math.floor(x / TS))), Math.max(0, Math.min(G.mh - 1, Math.floor(y / TS))));
  return !!G.vis[i];
}
function terlihatLayar(e) {
  var z = G.zoom; return e.x > G.cam.x - 60 && e.y > G.cam.y - 60 && e.x < G.cam.x + G.view.w / z + 60 && e.y < G.cam.y + G.view.h / z + 60;
}

function langkahEfek(dt) {
  for (var i = G.part.length - 1; i >= 0; i--) {
    var p = G.part[i]; p.umur -= dt;
    if (p.umur <= 0) { G.part.splice(i, 1); continue; }
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.jenis === 'asap' || p.jenis === 'asapPutih' || p.jenis === 'asapTipis') { p.vx *= 0.98; p.vy = p.vy * 0.98 - 6 * dt; p.u += dt * 6; p.x += 8 * dt; }
    else if (p.jenis === 'api') { p.vx *= 0.92; p.vy *= 0.92; p.vy -= 20 * dt; }
    else if (p.jenis === 'serpih') { p.z += p.vz * dt; p.vz -= 320 * dt; if (p.z < 0) { p.z = 0; p.vz *= -0.3; p.vx *= 0.5; p.vy *= 0.5; } p.rot += dt * 8; }
    else if (p.jenis === 'debu' || p.jenis === 'rempah' || p.jenis === 'kunci') { p.vx *= 0.94; p.vy *= 0.94; p.u += dt * 4; }
  }
  for (var j = G.jejak.length - 1; j >= 0; j--) { G.jejak[j].t -= dt; if (G.jejak[j].t <= 0) G.jejak.splice(j, 1); }
  for (var k = G.gugur.length - 1; k >= 0; k--) { G.gugur[k].t -= dt; if (G.gugur[k].t <= 0) G.gugur.splice(k, 1); }
  for (var m = G.bangkai.length - 1; m >= 0; m--) {
    var b = G.bangkai[m]; b.t -= dt; if (b.t <= 0) { G.bangkai.splice(m, 1); continue; }
    if (Math.random() < dt * 5) partikel(b.x, b.y - 4, 3, -14, 1.8, 'asap', 6);
    if (b.t > 6 && Math.random() < dt * 6) partikel(b.x, b.y - 2, 0, -20, 0.4, 'api', 4);
  }
  for (var n = G.bara.length - 1; n >= 0; n--) {
    var a = G.bara[n]; a.t -= dt; if (a.t <= 0) { G.bara.splice(n, 1); continue; }
    if (Math.random() < dt * 1.5) partikel(a.x, a.y, 2, -12, 1.6, 'asap', 5);
    if (Math.random() < dt * 2) partikel(a.x, a.y, 0, -15, 0.35, 'api', 3);
  }
  G.getar = Math.max(0, (G.getar || 0) - dt * 30);
}

function lukisPartikel(c, lapis) {
  for (var i = 0; i < G.part.length; i++) {
    var p = G.part[i], f = p.umur / p.maks;
    var atas = p.jenis === 'asap' || p.jenis === 'asapPutih' || p.jenis === 'asapTipis';
    if ((lapis === 'atas') !== atas) continue;
    switch (p.jenis) {
      case 'asap': c.fillStyle = 'rgba(40,38,34,' + (0.42 * f) + ')'; c.beginPath(); c.arc(p.x, p.y, p.u, 0, 7); c.fill(); break;
      case 'asapPutih': c.fillStyle = 'rgba(225,225,215,' + (0.32 * f) + ')'; c.beginPath(); c.arc(p.x, p.y, p.u, 0, 7); c.fill(); break;
      case 'asapTipis': c.fillStyle = 'rgba(200,200,190,' + (0.35 * f) + ')'; c.beginPath(); c.arc(p.x, p.y, p.u * (1.5 - f), 0, 7); c.fill(); break;
      case 'api': c.fillStyle = f > 0.6 ? 'rgba(255,240,170,' + f + ')' : 'rgba(255,' + Math.round(120 + f * 150) + ',40,' + f + ')'; c.beginPath(); c.arc(p.x, p.y, p.u * (0.5 + f * 0.5), 0, 7); c.fill(); break;
      case 'debu': c.fillStyle = 'rgba(150,130,95,' + (0.4 * f) + ')'; c.beginPath(); c.arc(p.x, p.y, p.u, 0, 7); c.fill(); break;
      case 'rempah': c.fillStyle = 'rgba(214,110,40,' + f + ')'; c.fillRect(p.x, p.y, 3, 3); break;
      case 'kunci': c.fillStyle = 'rgba(140,220,120,' + f + ')'; c.fillRect(p.x - 1, p.y - 4, 2, 8); c.fillRect(p.x - 4, p.y - 1, 8, 2); break;
      case 'percik': c.fillStyle = p.warna; c.globalAlpha = f; c.fillRect(p.x, p.y, 2, 2); c.globalAlpha = 1; break;
      case 'serpih': c.save(); c.translate(p.x, p.y - p.z); c.rotate(p.rot); c.fillStyle = '#2b2620'; c.fillRect(-p.u, -p.u / 2, p.u * 2, p.u); c.restore(); break;
      case 'bola': var g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.u * (1.3 - f * 0.3));
        g.addColorStop(0, 'rgba(255,255,220,' + f + ')'); g.addColorStop(0.4, 'rgba(255,190,70,' + f + ')'); g.addColorStop(1, 'rgba(255,90,20,0)');
        c.fillStyle = g; c.beginPath(); c.arc(p.x, p.y, p.u * (1.3 - f * 0.3), 0, 7); c.fill(); break;
      case 'cincin': c.strokeStyle = 'rgba(255,230,180,' + (f * 0.6) + ')'; c.lineWidth = 2 + f * 3; c.beginPath(); c.arc(p.x, p.y, p.u * (1 - f), 0, 7); c.stroke(); break;
      case 'kilat': c.save(); c.translate(p.x, p.y); c.rotate(p.a); c.fillStyle = 'rgba(255,230,140,0.95)';
        c.beginPath(); c.moveTo(0, -p.u * 0.35); c.lineTo(p.u * 1.6, 0); c.lineTo(0, p.u * 0.35); c.fill();
        c.fillStyle = 'rgba(255,255,230,0.9)'; c.beginPath(); c.arc(0, 0, p.u * 0.45, 0, 7); c.fill(); c.restore(); break;
    }
  }
}
