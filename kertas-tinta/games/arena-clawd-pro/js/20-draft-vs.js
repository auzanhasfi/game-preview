/* Arena Clawd Pro: draft ala ML (PILIH HERO → PERSIAPAN) + layar VS memuat sebelum arena */
'use strict';

var DF = null, dfTimer = null;
var DF_MIN = ['dekat', 'jauh', 'meriam', 'super'];
function mlDraft() {
  clearInterval(dfTimer);
  DF = { phase: 'pilih', t: 40, hero: SET.hero, skin: AKUN.pakai[SET.hero], tab: 'skin', sk: 2, role: 'semua' };
  musicStart('lobi'); renderDraft();
  dfTimer = setInterval(function () {
    if (mlScr !== 'draft') { clearInterval(dfTimer); return; }
    DF.t--; var el = document.getElementById('dfT'); if (el) el.textContent = Math.max(0, DF.t);
    if (DF.t <= 5 && DF.t > 0) sfx('tap');
    if (DF.t <= 0) { if (DF.phase === 'pilih') kunciHero(); else { clearInterval(dfTimer); mlVS(); } }
  }, 1000);
}
function kunciHero() { DF.phase = 'siap'; DF.t = 30; SET.hero = DF.hero; AKUN.pakai[DF.hero] = DF.skin; saveSet(); saveAkun(); sfx('ult'); renderDraft(); }
function renderDraft() {
  var H = HEROES[DF.hero], S = skinObj(DF.hero, DF.skin), sp = SPELLS[SET.spell], em = EMBLEM[AKUN.emblem], siap = DF.phase === 'siap';
  var bot;
  if (!siap) {
    var list = HERO_IDS.filter(function (h) { return DF.role === 'semua' || ROLE_OF[h] === DF.role; });
    bot = '<div class="tabs2">' + Object.keys(ROLE_TX).map(function (r) { return '<button data-dr="' + r + '" aria-selected="' + (r === DF.role) + '">' + tx(ROLE_TX[r]) + '</button>'; }).join('') + '</div>' +
      '<div class="hrow">' + list.map(function (h) { return '<button class="hcard" data-dh="' + h + '" data-uji="hero-' + h + '" aria-pressed="' + (h === DF.hero) + '">' + faceCv(h, AKUN.pakai[h]) + (h === 'nini' ? '<span class="baru">' + L('BARU', 'BAHARU') + '</span>' : '') + '<span class="nm"><small>' + tx(ROLE_TX[ROLE_OF[h]]) + '</small>' + tx(HEROES[h].nama).replace('Clawd ', '') + '</span></button>'; }).join('') + '</div>';
  } else {
    var T = DF.tab, body = '';
    if (T === 'skin') body = skinGridHtml(DF.hero, DF.skin);
    else if (T === 'spell') body = '<div class="spl">' + Object.keys(SPELLS).map(function (k) { var X = SPELLS[k]; return '<button data-ds="' + k + '" data-uji="spell-' + k + '" aria-pressed="' + (k === SET.spell) + '"><span>' + ic(X.ikon, 22) + '</span><b>' + tx(X.nama) + '</b><small class="dim">' + tx(X.t) + '</small></button>'; }).join('') + '</div>';
    else if (T === 'emblem') body = '<div class="spl">' + Object.keys(EMBLEM).map(function (k) { var X = EMBLEM[k]; return '<button data-de="' + k + '" aria-pressed="' + (k === AKUN.emblem) + '"><span>' + ic(X.ikon, 22) + '</span><b>' + tx(X.nama) + '</b><small class="dim">' + tx(X.t) + '</small></button>'; }).join('') + '</div>';
    else if (T === 'build') body = '<p class="fine">' + L('Urutan beli otomatis di arena (tombol beli cepat). Ubah di menu Item di lobi.', 'Urutan beli automatik di arena (butang beli pantas). Tukar di menu Item di lobi.') + '</p>' + buildHtml(DF.hero) + '<div class="acts" style="margin-top:6px">' + AKUN.build[DF.hero].map(function (id) { var it = itemById(id); return '<span class="chip">' + ic(it.ikon, 22) + ' ' + tx(it.nama) + '</span>'; }).join('') + '</div>';
    else body = soalPilih();
    bot = '<div class="prep"><div class="tabs2">' + [['skin', ['Skin', 'Skin']], ['spell', ['Spell', 'Spell']], ['emblem', ['Emblem', 'Emblem']], ['build', ['Build item', 'Build item']], ['soal', ['Soal', 'Soalan']]].map(function (t) { return '<button data-dt="' + t[0] + '" data-uji="prep-' + t[0] + '" aria-selected="' + (t[0] === T) + '">' + tx(t[1]) + '</button>'; }).join('') + '</div>' + body + (T === 'skin' && !punyaSkin(DF.hero, DF.skin) ? '<p class="fine">' + L('Skin terkunci hanya bisa dilihat. Beli di Toko Skin.', 'Skin berkunci hanya boleh dilihat. Beli di Kedai Skin.') + '</p>' : '') + '</div>';
  }
  var me = '<span class="pslot me">' + (siap || DF.hero ? faceCv(DF.hero, DF.skin) : '') + '</span>';
  mlShow('draft', '<div class="scr-pick" style="background:radial-gradient(90% 70% at 50% 40%, #24467e, #0a1428 75%)">' +
    '<div class="teams"><div class="team l"><span class="lbl">' + L('Tim Clawd', 'Pasukan Clawd') + '</span>' + me + DF_MIN.map(function (k, i) { return '<span class="pslot l' + (i > 1 ? ' x' : '') + '"><canvas data-art="minion" data-kind="' + k + '"></canvas></span>'; }).join('') + '</div>' +
      '<div class="timer"><b id="dfT">' + DF.t + '</b><small>' + (siap ? L('Persiapan', 'Persediaan') : L('Pilih hero', 'Pilih hero')) + '</small></div>' +
      '<div class="team r">' + DF_MIN.map(function (k, i) { return '<span class="pslot r' + (i > 1 ? ' x' : '') + '"><canvas data-art="comot" data-kind="' + k + '"></canvas></span>'; }).join('') + '<span class="pslot r"><canvas data-art="comot" data-kind="raja"></canvas></span><span class="lbl">' + L('Tim Comot', 'Pasukan Comot') + '</span></div></div>' +
    '<div class="pickmid"><canvas class="art" data-art="hero" data-anim data-nameless data-hero="' + DF.hero + '" data-skin="' + DF.skin + '" id="dfArt"></canvas>' +
      '<div class="pinfo"><span class="ttl">' + tx(ROLE_TX[ROLE_OF[DF.hero]]) + ' · <span class="trtag tr-' + S.tier + '">' + tx(TIER[S.tier]) + '</span></span><b class="nm">' + tx(H.nama) + '</b>' +
        '<div class="skrow">' + H.sk.map(function (s, i) { return '<button class="' + (i === 2 ? 'ult' : '') + '" data-dk="' + i + '" aria-pressed="' + (i === DF.sk) + '" aria-label="' + tx(s.n) + '">' + ic(s.i, 22) + '</button>'; }).join('') + '</div>' +
        '<p class="sktip"><b>' + tx(H.sk[DF.sk].n) + '</b> · ' + H.sk[DF.sk].cd + 's<br>' + tx(H.sk[DF.sk].t) + '</p></div>' +
      '<div class="spellbox"><span class="chip">' + ic(sp.ikon, 22) + ' ' + tx(sp.nama) + '</span><span class="chip">' + ic(em.ikon, 22) + ' ' + tx(em.nama) + '</span><span class="chip">' + ic('pencil', 14) + ' ' + tx(TOPIC_TX[SET.topik]) + '</span></div>' +
      '<button class="gbtn lockbtn" id="dfLock" data-uji="' + (siap ? 'siap' : 'kunci') + '">' + (siap ? L('Siap', 'Sedia') : L('Pilih', 'Pilih')) + ' ▸</button></div>' +
    '<div class="pickbot"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span class="ttl">' + (siap ? L('Atur sebelum bertarung', 'Atur sebelum bertarung') : L('Pilih hero Clawd', 'Pilih hero Clawd')) + '</span><button class="bbtn" id="dfOut" style="min-height:36px;padding:4px 12px !important;font-size:12px !important">' + L('Keluar', 'Keluar') + '</button></div>' + bot + '</div></div>');
  var art = document.getElementById('dfArt');
  setTimeout(function () { if (art.isConnected) playSkill(art, DF.sk); }, 150);
  onAll('[data-dk]', function (b) { DF.sk = +b.getAttribute('data-dk'); renderDraft(); });
  onAll('[data-dr]', function (b) { DF.role = b.getAttribute('data-dr'); renderDraft(); });
  onAll('[data-dh]', function (b) { DF.hero = b.getAttribute('data-dh'); DF.skin = AKUN.pakai[DF.hero]; renderDraft(); });
  onAll('[data-dt]', function (b) { DF.tab = b.getAttribute('data-dt'); renderDraft(); });
  onAll('[data-sk]', function (b) { DF.skin = b.getAttribute('data-sk'); if (punyaSkin(DF.hero, DF.skin)) { AKUN.pakai[DF.hero] = DF.skin; saveAkun(); } renderDraft(); });
  onAll('[data-ds]', function (b) { SET.spell = b.getAttribute('data-ds'); saveSet(); renderDraft(); });
  onAll('[data-de]', function (b) { AKUN.emblem = b.getAttribute('data-de'); saveAkun(); renderDraft(); });
  if (siap && DF.tab === 'soal') bindSoal(renderDraft);
  document.getElementById('dfLock').onclick = function () { if (DF.phase === 'pilih') kunciHero(); else { clearInterval(dfTimer); sfx('correct'); mlVS(); } };
  document.getElementById('dfOut').onclick = function () { clearInterval(dfTimer); sfx('tap'); mlLobi(); };
}

/* ---------- VS memuat ---------- */
function mlVS() {
  clearInterval(dfTimer); musicStop();
  /* skin terkunci tidak dipakai di arena */
  if (!punyaSkin(SET.hero, AKUN.pakai[SET.hero])) AKUN.pakai[SET.hero] = 'dasar';
  var S = heroSkin(SET.hero), r = rankInfo(AKUN.bintang), sp = SPELLS[SET.spell];
  function card(inner, nm, sub, big, i) { return '<div class="vcard' + (big ? ' big' : '') + '" style="animation-delay:' + (i * 0.08) + 's">' + inner + '<span class="pc" data-pc>0%</span><span class="nm"><small>' + sub + '</small>' + nm + '</span><i class="ld" data-ld style="width:0"></i></div>'; }
  var nmMin = { dekat: L('Minion', 'Minion'), jauh: L('Pemanah', 'Pemanah'), meriam: L('Meriam', 'Meriam'), super: L('Super', 'Super') };
  mlShow('vs', '<div class="scr-vs" style="background:linear-gradient(105deg, #5a2414 0%, #2a1209 49.6%, #e2a93b 49.8%, #e2a93b 50.2%, #0e1d3c 50.4%, #081227 100%)">' +
    '<div class="vsrow"><div class="vsteam">' + card(faceCv(SET.hero, S.id, true), esc(AKUN.nama), r.nama + ' · ' + ic(sp.ikon, 22) + ' ' + tx(sp.nama), true, 0) + DF_MIN.map(function (k, i) { return card('<canvas data-art="minion" data-kind="' + k + '" data-anim></canvas>', nmMin[k], L('Tim Clawd', 'Pasukan Clawd'), false, i + 1); }).join('') + '</div>' +
    '<div class="vs">VS</div>' +
    '<div class="vsteam">' + card('<canvas data-art="comot" data-kind="raja" data-anim></canvas>', L('Raja Comot', 'Raja Comot'), L('Istana Comot', 'Istana Comot'), true, 0) + DF_MIN.map(function (k, i) { return card('<canvas data-art="comot" data-kind="' + k + '" data-anim></canvas>', 'Comot ' + nmMin[k].toLowerCase(), L('Tim Comot', 'Pasukan Comot'), false, i + 1); }).join('') + '</div></div>' +
    '<p class="vstip">' + tx(pick(TIPS)) + '</p></div>');
  var pcs = [].slice.call(mlEl.querySelectorAll('[data-pc]')), lds = [].slice.call(mlEl.querySelectorAll('[data-ld]')), v = pcs.map(function () { return 0; });
  sfx('ult');
  var iv = setInterval(function () {
    if (mlScr !== 'vs') { clearInterval(iv); return; }
    var done = true;
    v.forEach(function (x, i) { v[i] = Math.min(100, x + Math.random() * 9); if (v[i] < 100) done = false; pcs[i].textContent = Math.floor(v[i]) + '%'; lds[i].style.width = v[i] + '%'; });
    if (done) { clearInterval(iv); setTimeout(function () { if (mlScr === 'vs') startGame(); }, 450); }
  }, 90);
}
