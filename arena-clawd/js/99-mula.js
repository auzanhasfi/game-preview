/* Arena Clawd: gelung & kait ujian */
'use strict';
/* ---------- gelung ---------- */
var last = performance.now();
function tick(dt) { update(dt); if (!document.getElementById('menu').hidden) drawMenuHero(); else draw(); }
function loop(now) { var dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now; tick(dt); requestAnimationFrame(loop); }
requestAnimationFrame(loop);

/* ---------- kait ujian ---------- */
window.__game = {
  get keadaan() { return G ? G.state : 'menu'; },
  get info() { if (!G) return null; var h = G.hero; return { t: Math.round(G.t), hp: Math.round(h.hp), max: Math.round(h.max), lvl: h.lvl, sl: h.sl.slice(), pts: h.pts, emas: Math.floor(G.gold), item: G.items.slice(), menara: G.towers, bunuh: G.kills, monster: G.monsKilled, buff: Object.keys(G.buffs).filter(function (k) { return G.buffs[k] > 0; }), boss: Math.round(G.boss.hp), mati: h.dead }; },
  langkah: function (s) { for (var i = 0; i < s * 30; i++) tick(1 / 30); return G ? G.state : 'menu'; },
  gerak: function (x, y) { G.input.x = x; G.input.y = y; },
  ke: function (x, y) { G.hero.x = x; G.hero.y = y; cam.x = x; cam.y = y; },
  skill: skill, spell: useSpell, naik: upSkill, beli: buy, kedai: openShop, tutupKedai: closeShop, balik: startRecall,
  xp: function (n) { gainXp(n); return G.hero.lvl; }, emas: function (n) { G.gold += n; },
  soalan: function () { G.qT = 0; },
  rival: function () { var R = G.rival; return R ? { x: Math.round(R.x), y: Math.round(R.y), hp: Math.round(R.hp), max: Math.round(R.max), lvl: R.lvl, mati: R.dead, lari: R.lari, sasaran: R.foe ? R.foe.kind : null, tumbang: G.rk, tele: !!R.tele } : null; },
  pukulRival: function (n) { hurt(G.rival, n, G.hero); return Math.round(G.rival.hp); },
  pilih: function (o) { if (o.hero) pickHero = o.hero; if (o.spell) pickSpell = o.spell; if (o.bakat) pickBakat = o.bakat; if (o.lawan) pickLawan = o.lawan; renderPicks(); },
  cd: function () { G.hero.cd = [0, 0, 0]; G.hero.spellCd = 0; },
  jawabUji: function (betul) { if (!curQ || curQ.done) return false; var b = [].filter.call(document.querySelectorAll('#opts button'), function (x) { return (+x.getAttribute('data-v') === curQ.ans) === !!betul; })[0]; if (b) answer(b); return !!b; },
  runtuh: function (n) { G.structs.filter(function (s) { return s.team === 1 && s.hp > 0; }).slice(0, n).forEach(function (s) { s.hp = 1; hurt(s, 5, G.hero); }); },
  cedera: function (n) { hurt(G.hero, n, G.boss); },
  pukulBoss: function (n) { hurt(G.boss, n, G.hero); return Math.round(G.boss.hp); },
  monster: function (type) { var m = G.units.filter(function (u) { return u.kind === 'monster' && u.type === type && !u.dead; })[0]; return m ? { x: m.x, y: m.y, hp: Math.round(m.hp) } : null; }
};
