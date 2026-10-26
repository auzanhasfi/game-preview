/* Catur Ajaib Clawd: HUD DOM (bar atas, toko, daftar komandan, sinergi, item, info hero, Soal Ajaib, spanduk & toast) */
'use strict';
var hudDirty = true, soalDirty = true, $ = function (id) { return document.getElementById(id); };
/* tulis innerHTML hanya bila berubah, supaya tombol tidak diganti di tengah ketukan */
function setH(el, html) { if (typeof el === 'string') el = $(el); if (el._h !== html) { el.innerHTML = html; el._h = html; } }

function renderHud() {
  if (!G) return;
  var me = G.me, pre = G.phase === 'persiapan';
  $('lbRonde').textContent = G.stage + '-' + G.round;
  $('lbFase').textContent = T('f_' + (G.phase === 'hasil' ? 'jeda' : G.phase)) + ' · ' + (G.type === 'pvp' && G.opp ? T('vs') + ' ' + G.opp.nama : T('t_' + G.type));
  setH('lbHp', ic('heart', 18) + '<b>' + Math.max(0, me.hp) + '</b>');
  setH('lbEmas', ic('coin', 18) + '<b data-uji="emas">' + me.gold + '</b>');
  setH('lbLv', ic('user', 18) + '<b>' + T('level') + ' ' + me.lvl + '</b><small>' + onBoard(me).length + '/' + boardLimit(me) + (me.lvl < MAXLV ? ' · ' + T('xp') + ' ' + me.xp + '/' + XPNEED[me.lvl] : '') + '</small>');
  /* tombol toko */
  setH('bRoll', ic('spin', 18) + '<span>' + T('segarkan') + '</span><b>' + (me.freeRoll > 0 ? T('gratis') : ROLL_COST) + '</b>');
  setH('bXp', ic('book', 18) + '<span>' + T('beliXp') + '</span><b>' + XP_COST + '</b>');
  setH('bLock', ic('lock', 18) + '<span>' + (G.locked ? T('buka') : T('kunci')) + '</span>');
  $('bLock').setAttribute('aria-pressed', G.locked ? 'true' : 'false');
  setH('bReady', ic('swords', 18) + '<span>' + T('siap') + '</span>');
  $('bRoll').disabled = !pre || (me.freeRoll <= 0 && me.gold < ROLL_COST);
  $('bXp').disabled = !pre || me.gold < XP_COST || me.lvl >= MAXLV;
  $('bLock').disabled = !pre; $('bReady').disabled = !pre;
  /* toko */
  setH('shop', G.shop.map(function (id, i) {
    if (!id) return '<div class="slot kosong"></div>';
    var H = HEROES[id], poor = me.gold < H.c;
    return '<button class="slot c' + H.c + (poor ? ' miskin' : '') + '" data-i="' + i + '" data-uji="beli' + i + '"' + (pre ? '' : ' disabled') + '>' +
      '<img src="' + portrait(id) + '" alt="">' +
      '<span class="nm">' + heroNama(id) + '</span>' +
      '<span class="tg">' + ic(FAKSI[H.f].ic, 13) + T('f_' + H.f) + '</span><span class="tg">' + ic(PERAN[H.p].ic, 13) + T('p_' + H.p) + '</span>' +
      '<b class="pr">' + ic('coin', 14) + H.c + '</b></button>';
  }).join(''));
  /* komandan */
  var ps = G.players.slice().sort(function (a, b) { return (b.alive - a.alive) || (b.hp - a.hp); });
  setH('lawanList', ps.map(function (p) {
    var max = opt.mode === 'penuh' ? 100 : 50;
    return '<div class="lw' + (p.human ? ' aku' : '') + (p === G.opp && G.type === 'pvp' ? ' vs' : '') + (p.alive ? '' : ' mati') + '"><i style="background:' + p.col + '"></i><span>' + p.nama + '</span>' +
      (p.alive ? '<b>' + Math.max(0, p.hp) + '</b><em style="width:' + Math.max(0, p.hp / max * 100) + '%"></em>' : '<b>#' + p.place + '</b>') + '</div>';
  }).join(''));
  /* sinergi */
  var cnt = synCount(onBoard(me)), keys = Object.keys(cnt).sort(function (a, b) { return (synTier(b, cnt[b]) - synTier(a, cnt[a])) || (cnt[b] - cnt[a]); });
  setH('sinergi', keys.length ? keys.map(function (k) {
    var S = FAKSI[k] || PERAN[k], t = synTier(k, cnt[k]), next = S.tier.filter(function (n) { return n > cnt[k]; })[0];
    return '<div class="sy' + (t >= 0 ? ' on t' + t : '') + '" title="' + synDesc(k, Math.max(0, t)) + '">' + ic(S.ic, 16) + '<span>' + T((FAKSI[k] ? 'f_' : 'p_') + k) + '</span><b>' + cnt[k] + (next ? '/' + next : '') + '</b><small>' + (t >= 0 ? synDesc(k, t) : synDesc(k, 0)) + '</small></div>';
  }).join('') : '<p class="muted small">' + T('kosongSin') + '</p>');
  /* item */
  setH('itemBar', me.items.length ? me.items.map(function (it, i) {
    return '<button class="it' + (G.selItem === i ? ' on' : '') + '" data-it="' + i + '" title="' + T('id_' + it) + '">' + ic(ITEMS[it].ic, 20) + '<span>' + T('i_' + it) + '</span></button>';
  }).join('') + (G.selItem >= 0 ? '<p class="small hintI">' + T('itemPilih', T('i_' + me.items[G.selItem])) + '</p>' : '') : '<p class="muted small">' + T('itemKosong') + '</p>');
  renderInfo();
  if (soalDirty) renderSoal();
  /* tombol skill komandan */
  var kb = $('bKmd'); kb.hidden = !(G.phase === 'tempur' && !G.kmdUsed && !G.sim.done);
  kb.innerHTML = ic(KOMANDAN[opt.kmd].ic, 20) + '<span>' + T('kmdBtn') + '</span>';
  $('bSpeed').textContent = '×' + G.speed;
  hudDirty = false;
}
function renderTimer() {
  if (!G) return;
  var show = G.phase === 'persiapan';
  $('lbT').textContent = show ? Math.ceil(G.t) : G.phase === 'tempur' ? Math.floor(G.sim ? G.sim.t : 0) + 's' : '';
  $('lbTimer').style.width = show ? (G.t / G.tMax * 100) + '%' : '0%';
}
function nIt(u, n) { return u.items.filter(function (x) { return x === n; }).length; }
function renderInfo() {
  var u = G.sel, el = $('info');
  if (!u) { setH(el, '<p class="muted small">' + T('infoKosong') + '</p>'); return; }
  var H = HEROES[u.id], k = STAR_K[u.star];
  setH(el, '<div class="hi"><img src="' + portrait(u.id) + '" alt=""><div><b>' + heroNama(u.id) + ' <span class="st">' + Array(u.star + 1).join('★') + '</span></b>' +
    '<span class="tg">' + ic(FAKSI[H.f].ic, 13) + T('f_' + H.f) + '</span> <span class="tg">' + ic(PERAN[H.p].ic, 13) + T('p_' + H.p) + '</span></div></div>' +
    '<div class="stl"><span>' + T('stHp') + ' <b>' + Math.round(H.hp * k + nIt(u, 'kalung') * 180) + '</b></span><span>' + T('stAtk') + ' <b>' + Math.round(H.atk * k + nIt(u, 'pedang') * 15) + '</b></span><span>' + T('stRng') + ' <b>' + H.rng + '</b></span><span>' + T('stAs') + ' <b>' + (1 / H.as).toFixed(2) + '</b></span></div>' +
    '<p class="small">' + T('sk_' + H.sk, Math.round(H.pw * SK_K[u.star])) + '</p>' +
    (u.items.length ? '<p class="small">' + u.items.map(function (it) { return ic(ITEMS[it].ic, 14) + ' ' + T('i_' + it); }).join(' · ') + '</p>' : '') +
    (G.phase !== 'tempur' || u.b === 'bench' ? '<button class="jual" data-uji="jual" id="bJual">' + ic('coin', 16) + T('jual', sellValue(u)) + '</button>' : ''));
  var bj = $('bJual'); if (bj) bj.onclick = function () { sell(G.me, u); G.sel = null; hudDirty = true; };
}
function renderSoal() {
  soalDirty = false;
  var el = $('soalP');
  if (curQ && curQ.q === G.soal && (G.phase !== 'persiapan' || G.soalDone)) curQ = null;
  if (!G.soal || G.phase !== 'persiapan') { setH(el, '<h4>' + ic('sparkle', 16) + T('soalAjaib') + '</h4><p class="muted small">' + T('soalSudah') + '</p>'); return; }
  if (G.soalDone) { setH(el, '<h4>' + ic('sparkle', 16) + T('soalAjaib') + '</h4><p class="small">' + G.soalMsg + '</p><p class="muted small">' + T('soalSudah') + '</p>'); return; }
  setH(el, '<h4>' + ic('sparkle', 16) + T('soalAjaib') + (G.combo ? ' <span class="combo">' + G.combo + '×</span>' : '') + '</h4><p class="muted small">' + T('soalAjaibD') + '</p>' + qHTML(G.soal, 'optsA'));
  bindQ(el, G.soal, function (ok) {
    if (ok) { G.me.gold += 2; G.combo++; var extra = ''; if (G.combo % 3 === 0) { G.me.freeRoll++; extra = ' · ' + T('segarkan') + ' ' + T('gratis'); } G.soalMsg = T('benar') + ' ' + T('plusEmas', 2) + extra; sfx('coin'); }
    else { G.combo = 0; G.soalMsg = T('salah', G.soal.ans); }
    hudDirty = true;
    setTimeout(function () { if (G && !G.soalDone) { G.soalDone = true; soalDirty = true; hudDirty = true; } }, 1100);
  });
}

/* ---------- toast & spanduk ---------- */
var toastQ = [], toastT = 0;
function toast(msg, kind) { if (!G || G.auto) return; toastQ.push({ m: msg, k: kind || '' }); if (toastQ.length > 3) toastQ.shift(); }
function updToast(dt) {
  var el = $('toast'); toastT -= dt;
  if (toastT <= 0) {
    if (toastQ.length) { var x = toastQ.shift(); el.textContent = x.m; el.className = 'toast ' + x.k; el.hidden = false; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; toastT = 1.5; }
    else el.hidden = true;
  }
}
var bannerT = 0;
function banner(title, sub, good) {
  if (G && G.auto) return;
  var el = $('banner'); el.innerHTML = '<b>' + title + '</b>' + (sub ? '<span>' + sub + '</span>' : ''); el.className = 'banner ' + (good ? 'ok' : 'no'); el.hidden = false; bannerT = 2.2;
}
function updBanner(dt) { if (bannerT > 0) { bannerT -= dt; if (bannerT <= 0) $('banner').hidden = true; } }
