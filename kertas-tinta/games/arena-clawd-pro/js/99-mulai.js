/* Arena Clawd Pro: Gelung utama + kait uji window.__game */
'use strict';

/* ---------- gelung ---------- */
buildMap(SET.mode);
try { document.fonts.ready.then(function () { if (!G) buildMap(SET.mode); else buildMap(); drawIcons(); artAll(true); }); } catch (e) {}
mlLoad();
var last = performance.now();
function tick(dt) { update(dt); artDt = dt; if (G && !document.getElementById('game').hidden) draw(); else if (!mlEl.hidden || document.getElementById('mlsheet')) artAll(false); else if (!document.getElementById('menu').hidden) drawMenuHero(); }
function loop(now) { var dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now; tick(dt); requestAnimationFrame(loop); }
requestAnimationFrame(loop);

/* ---------- kait ujian ---------- */
window.__game = {
  get keadaan() { return G ? G.state : 'menu'; },
  get info() { if (!G) return null; var h = G.hero; return { mode: mode, t: Math.round(G.t), hp: Math.round(h.hp), max: Math.round(h.max), lvl: h.lvl, sl: h.sl.slice(), pts: h.pts, cd: h.cd.map(function (c) { return Math.round(c * 10) / 10; }), emas: Math.floor(G.gold), item: G.items.slice(), menara: G.towers, menaraTotal: G.towerTotal, bunuh: G.kills, monster: G.monsKilled, buff: Object.keys(G.buffs).filter(function (k) { return G.buffs[k] > 0; }), inti: Math.round(G.core1.hp), intiPerisai: shielded(G.core1), mati: h.dead, kombo: G.combo, komboMaks: G.comboMax, ledakan: G.combos, gempurCd: Math.max(0, Math.round(G.gempurCd)), gempurSiap: !!gempurTarget() && G.gempurCd <= 0, soal: G.asked, benar: G.correct, tersembunyi: heroHidden(), semak: h.inBush, minion: G.units.filter(function (u) { return u.kind === 'minion' && alive(u); }).map(function (u) { return u.team + ':' + u.mt; }).reduce(function (a, k) { a[k] = (a[k] || 0) + 1; return a; }, {}) }; },
  get soalIni() { return curQ ? { teks: qText(curQ), jawab: curQ.ans, ty: curQ.ty, lv: curQ.lv, why: curQ.why, penjelasan: explain(curQ) } : null; },
  langkah: function (s) { for (var i = 0; i < s * 30; i++) tick(1 / 30); return G ? G.state : 'menu'; },
  gerak: function (x, y) { G.input.x = x; G.input.y = y; },
  ke: function (x, y) { G.hero.x = x; G.hero.y = y; cam.x = x; cam.y = y; },
  skill: function (n, direct) { return skill(n, direct); }, spell: useSpell, naik: upSkill, beli: buy, kedai: openShop, tutupKedai: closeShop, balik: startRecall,
  xp: function (n) { gainXp(n); return G.hero.lvl; }, emas: function (n) { G.gold += n; },
  soalan: function () { G.qT = 0; },
  jawabUji: function (betul) { if (!curQ || curQ.done) return false; var b = [].filter.call(document.querySelectorAll('#opts button'), function (x) { return (+x.getAttribute('data-v') === curQ.ans) === !!betul; })[0]; if (b) answer(b); return !!b; },
  lanjut: function () { if (curQ && curQ.done && !curQ.closed) { finishQ(); return true; } return false; },
  runtuh: function (n) { for (var i = 0; i < n; i++) { var s = G.structs.filter(function (x) { return x.team === 1 && x.kind === 'turret' && x.hp > 0 && !shielded(x); }).sort(function (a, b) { return a.tier - b.tier; })[0]; if (!s) break; s.hp = 1; hurt(s, 5, G.hero); } return G.towers; },
  gempur: function () { G.gempurCd = 0; return gempur(); },
  hancurInti: function () { while (G.structs.some(function (x) { return x.team === 1 && x.kind === 'turret' && x.hp > 0; })) { var before = G.towers; window.__game.runtuh(1); if (G.towers === before) break; } G.core1.hp = 1; hurt(G.core1, 5, G.hero); return G.state; },
  hancurKita: function () { var g = G; ['turret', 'core'].forEach(function (k) { [1, 2, 3].forEach(function (tier) { g.structs.forEach(function (s) { if (s.team === 0 && s.kind === k && (k === 'core' || s.tier === tier) && s.hp > 0 && !shielded(s)) { s.hp = 1; hurt(s, 5, g.structs[0]); } }); }); }); return G.state; },
  cedera: function (n) { hurt(G.hero, n, G.structs[0]); },
  monster: function (type) { var m = G.units.filter(function (u) { return u.kind === 'monster' && u.type === type && !u.dead; })[0]; return m ? { x: m.x, y: m.y, hp: Math.round(m.hp) } : null; },
  semak: function (i) { var b = BUSHES[i || 0]; G.hero.x = b.x; G.hero.y = b.y; G.hero.lastAtk = -9; G.input.x = G.input.y = 0; tick(1 / 30); return { dalam: G.hero.inBush, tersembunyi: heroHidden() }; }
};
