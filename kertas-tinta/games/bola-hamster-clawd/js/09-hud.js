/* 09 — Antara muka DOM: menu trek, HUD, papan soalan, toast, kad trek, skrin tamat. */
var $ = function (id) { return document.getElementById(id); };

HB.show = function (id) { ['menu', 'game', 'end'].forEach(function (s) { $(s).hidden = s !== id; }); };

HB.menuTrek = function () {
  var T = HB.T, open = +(store('hb-buka') || 1);
  $('tracks').innerHTML = HB.TREK.map(function (t, i) {
    var lock = i >= open;
    return '<li class="' + (lock ? 'lock' : '') + '"><i class="sw" style="background:' + t.sw + '"></i><span><em>' + T('track') + ' ' + (i + 1) + (lock ? ' · ' + T('locked') : '') + '</em>' + T('tr')[i].n + '</span></li>';
  }).join('');
  ['mudah', 'sederhana', 'mencabar'].forEach(function (d) {
    var b = +(store('hb-best-' + d) || 0), st = +(store('hb-star-' + d) || 0);
    $('b-' + d).innerHTML = b ? Array.apply(null, Array(3)).map(function (_, k) { return '<i data-ic="star" style="width:14px;height:14px;' + (k < st ? '' : 'color:var(--line)') + '"></i>'; }).join('') + '&nbsp;' + T('best') + ' ' + b : '';
  });
  HB.paintIcons($('menu'));
};

HB.hud = function (G) {
  var T = HB.T;
  $('hTr').textContent = T('track') + ' ' + (G.trek + 1) + '/' + HB.TREK.length;
  var h = '';
  for (var i = 0; i < 5; i++) h += '<i data-ic="' + (i < G.nyawa ? 'heart' : 'heartO') + '" class="' + (i < G.nyawa ? '' : 'off') + '"></i>';
  if ($('hH').getAttribute('data-n') !== String(G.nyawa)) { $('hH').innerHTML = h; $('hH').setAttribute('data-n', G.nyawa); HB.paintIcons($('hH')); }
  $('hSeed').textContent = G.biji;
  $('hTime').textContent = fmtTime(G.masa);
  $('hScore').textContent = G.markah;
};

var qShown = 'x';
HB.papanSoal = function (g, selesai) {
  var key = g ? g.r + ':' + g.runs.map(function (r) { return r.wrong ? 1 : 0; }).join('') + HB.lang : (selesai ? 'F' : 'R') + HB.lang;
  if (key === qShown) return;
  var isNew = !g || qShown.split(':')[0] !== String(g.r);
  qShown = key;
  var qt = $('qText'), qo = $('qOpts');
  if (g) {
    qt.className = ''; qt.textContent = g.q.q;
    qo.innerHTML = g.runs.map(function (ru, j) { return '<span class="' + (ru.wrong ? 'x' : '') + '"><b>' + 'ABC'[j] + '</b>' + ru.val + '</span>'; }).join('');
  } else {
    qt.className = 'goal'; qt.textContent = selesai ? HB.T('goalFinish') : HB.T('goalRoll'); qo.innerHTML = '';
  }
  if (isNew) { qt.classList.remove('pop'); void qt.offsetWidth; qt.classList.add('pop'); }
};
HB.resetPapan = function () { qShown = 'x'; };

var toastT = 0;
HB.toast = function (msg, kind) {
  var t = $('toast');
  t.className = 'toast ' + (kind || '');
  t.innerHTML = (kind ? '<i data-ic="' + (kind === 'ok' ? 'check' : kind === 'bad' ? 'x' : 'flag') + '"></i>' : '') + '<span></span>';
  t.querySelector('span').textContent = msg;
  HB.paintIcons(t);
  t.hidden = false; void t.offsetWidth;
  clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 2600);
};
HB.hint = function (msg) { var h = $('hint'); if (msg) { h.textContent = msg; h.hidden = false; } else h.hidden = true; };

HB.kadTrek = function (i, onGo) {
  var T = HB.T, d = T('tr')[i];
  $('cTag').textContent = T('trackOf')(i + 1, HB.TREK.length);
  $('cTitle').textContent = d.n; $('cFact').textContent = d.f; $('cGoal').textContent = d.g;
  $('cGo').textContent = T('go');
  $('ccard').hidden = false;
  HB.kadGo = onGo;
  setTimeout(function () { try { $('cGo').focus({ preventScroll: true }); } catch (e) { /* abaikan */ } }, 50);
};
HB.tutupKad = function () { $('ccard').hidden = true; };

HB.skrinTamat = function (G, menang) {
  var T = HB.T;
  var total = G.soal.length, first = G.soal.filter(function (s) { return s.cubaan === 1; }).length;
  var ratio = total ? first / total : 0;
  var stars = menang ? (ratio >= 0.85 && G.nyawa >= 3 ? 3 : ratio >= 0.6 ? 2 : 1) : 0;
  $('eTag').textContent = menang ? T('winTag') : T('loseTag');
  $('eh').textContent = menang ? T('winH') : T('loseH');
  $('eMsg').textContent = menang ? T('winMsg')(stars) : T('loseMsg');
  $('eStars').innerHTML = [0, 1, 2].map(function (k) { return '<i data-ic="star" class="' + (k < stars ? '' : 'off') + '"></i>'; }).join('');
  $('eScore').textContent = G.markah; $('eOk').textContent = first + '/' + total; $('eSeed').textContent = G.biji; $('eTime').textContent = fmtTime(G.masaJumlah + G.masa);
  $('eRecap').innerHTML = G.soal.map(function (s) { return '<span class="' + (s.cubaan > 1 ? 'no' : '') + '">' + s.how + '</span>'; }).join('');
  if (menang) {
    var best = +(store('hb-best-' + G.tahap) || 0);
    if (G.markah > best) { store('hb-best-' + G.tahap, G.markah); best = G.markah; }
    if (stars > +(store('hb-star-' + G.tahap) || 0)) store('hb-star-' + G.tahap, stars);
    $('eBest').textContent = T('bestOf')(best);
  } else $('eBest').textContent = '';
  $('bAgain').textContent = T('again'); $('bRetry').textContent = T('retry'); $('bMenu').textContent = T('menu');
  $('bRetry').hidden = menang;
  HB.paintIcons($('end'));
  HB.show('end');
  return stars;
};
