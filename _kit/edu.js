/* =========================================================
   EDU KIT: dipakai bersama oleh 20 contoh game edukasi.
   Isi: suara, HUD, layar judul/hasil, bank soal, mode demo (?demo=1).
   Kode buatan sendiri, bebas dipakai.
   ========================================================= */
(function(){
var E = window.EDU = {};
var qp = new URLSearchParams(location.search);
E.demo = qp.get('demo') === '1';
if(E.demo)document.documentElement.classList.add('demo');
E.rand = function(a,b){return a+Math.floor(Math.random()*(b-a+1))};
E.pick = function(a){return a[Math.floor(Math.random()*a.length)]};
E.shuffle = function(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a};
E.$ = function(s){return document.querySelector(s)};

/* ---------- suara (Web Audio, tanpa file) ---------- */
var ac=null, muted=false;
try{muted=localStorage.getItem('edu_mute')==='1'}catch(e){}
function ctx(){if(!ac){try{ac=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}return ac}
E.sfx = function(type){
  if(muted||E.demo)return; var a=ctx(); if(!a)return;
  var seq={ok:[[660,.07],[880,.09]],bad:[[220,.12],[160,.16]],pop:[[520,.05]],win:[[523,.1],[659,.1],[784,.1],[1046,.2]],tick:[[1200,.02]],boom:[[90,.25]]}[type]||[[440,.08]];
  var t=a.currentTime;
  seq.forEach(function(s){var o=a.createOscillator(),g=a.createGain();o.type=type==='boom'?'sawtooth':type==='bad'?'square':'triangle';o.frequency.value=s[0];
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.18,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+s[1]);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+s[1]+.02);t+=s[1]*.85});
};

/* ---------- HUD ---------- */
E.hud = function(o){
  var h=document.createElement('div'); h.className='edu-hud';
  h.innerHTML='<b class="edu-title">'+o.title+'</b><span class="edu-q" id="eduQ"></span><span class="edu-sp"></span>'+
    '<span class="edu-stat">⭐ <b id="eduScore">0</b></span>'+(o.lives?'<span class="edu-stat" id="eduLives"></span>':'')+(o.timer?'<span class="edu-stat">⏱ <b id="eduTime"></b></span>':'')+
    '<button class="edu-mute" id="eduMute" aria-label="Suara">'+(muted?'🔇':'🔊')+'</button>';
  document.body.appendChild(h);
  E.$('#eduMute').onclick=function(){muted=!muted;try{localStorage.setItem('edu_mute',muted?'1':'0')}catch(e){}this.textContent=muted?'🔇':'🔊';if(!muted)ctx()};
  if(o.credit){var c=document.createElement('div');c.className='edu-credit';c.innerHTML=o.credit;document.body.appendChild(c)}
};
E.setQ = function(t){var q=E.$('#eduQ');if(q){q.innerHTML=t;q.classList.remove('flash');void q.offsetWidth;q.classList.add('flash')}};
E.setScore = function(v){var s=E.$('#eduScore');if(s){s.textContent=v;s.parentNode.classList.remove('bump');void s.offsetWidth;s.parentNode.classList.add('bump')}};
E.setLives = function(n,max){var l=E.$('#eduLives');if(l){var s='';for(var i=0;i<(max||3);i++)s+=i<n?'❤️':'🤍';l.textContent=s}};
E.setTime = function(v){var t=E.$('#eduTime');if(t)t.textContent=v};

/* ---------- toast & partikel teks ---------- */
E.toast = function(t,good){
  var d=document.createElement('div');d.className='edu-toast '+(good===false?'bad':good?'good':'');d.innerHTML=t;document.body.appendChild(d);setTimeout(function(){d.remove()},1500);
};
E.floatText = function(x,y,t,good){
  var d=document.createElement('div');d.className='edu-float '+(good?'good':'bad');d.textContent=t;d.style.left=x+'px';d.style.top=y+'px';document.body.appendChild(d);setTimeout(function(){d.remove()},900);
};

/* ---------- maskot Si Bulat ---------- */
E.bulat = function(mood){
  var ink='#5E1B08', f={happy:'<path d="M58 84 Q74 66 90 84"/><path d="M110 84 Q126 66 142 84"/><path d="M52 100 Q100 154 148 100"/>',
    wow:'<circle cx="76" cy="84" r="8" fill="'+ink+'" stroke="none"/><circle cx="124" cy="84" r="8" fill="'+ink+'" stroke="none"/><ellipse cx="100" cy="124" rx="14" ry="17"/>'}[mood||'happy'];
  return '<svg viewBox="0 0 200 200" aria-hidden="true"><path d="M104 12 C156 6 192 50 186 100 C180 152 146 190 96 188 C46 186 10 148 12 96 C14 46 52 18 104 12 Z" fill="#FD5E2B"/><g fill="none" stroke="'+ink+'" stroke-width="11" stroke-linecap="round" stroke-linejoin="round">'+f+'</g></svg>';
};

/* ---------- layar judul & hasil ---------- */
E.title = function(o, onStart){
  if(E.demo){setTimeout(onStart,60);return}
  var w=document.createElement('div');w.className='edu-ov';
  w.innerHTML='<div class="edu-card"><div class="edu-mas">'+E.bulat('happy')+'</div><small>'+(o.mapel||'')+'</small><h1>'+o.title+'</h1><p>'+o.desc+'</p>'+
    '<ol>'+o.how.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ol>'+(o.extra||'')+'<button class="edu-btn" id="eduGo">▶ Main</button>'+
    '<div class="edu-best">Skor terbaik: <b>'+E.best(o.key)+'</b></div></div>';
  document.body.appendChild(w);
  var go=function(){ctx();w.remove();onStart()};
  E.$('#eduGo').onclick=go;
  document.addEventListener('keydown',function k(e){if((e.key==='Enter'||e.key===' ')&&document.body.contains(w)){e.preventDefault();document.removeEventListener('keydown',k);go()}});
};
E.best = function(key,v){try{var b=+localStorage.getItem('edu_best_'+key)||0;if(v!=null&&v>b){localStorage.setItem('edu_best_'+key,v);return v}return b}catch(e){return 0}};
E.end = function(o, onAgain){
  var best=E.best(o.key,o.score), stars=o.max?Math.max(1,Math.min(3,Math.ceil(o.score/o.max*3))):3;
  E.sfx('win');
  var w=document.createElement('div');w.className='edu-ov';
  w.innerHTML='<div class="edu-card"><div class="edu-mas">'+E.bulat('wow')+'</div><small>Selesai!</small><h1>'+(o.head||'Hebat!')+'</h1><div class="edu-stars">'+'★★★'.slice(0,stars)+'<i>'+'★★★'.slice(stars)+'</i></div>'+
    '<div class="edu-res"><div><b>'+o.score+'</b><span>Skor</span></div>'+(o.benar!=null?'<div><b>'+o.benar+'</b><span>Benar</span></div><div><b>'+(o.salah||0)+'</b><span>Salah</span></div>':'')+'<div><b>'+best+'</b><span>Terbaik</span></div></div>'+
    (o.note||'')+'<button class="edu-btn" id="eduAgain">↻ Main lagi</button></div>';
  document.body.appendChild(w);
  E.$('#eduAgain').onclick=function(){w.remove();onAgain()};
  if(E.demo)setTimeout(function(){if(document.body.contains(w)){w.remove();onAgain()}},2500);
};

/* ---------- bank soal ---------- */
E.Q = {
  kali: function(a,b){a=a||E.rand(2,9);b=b||E.rand(2,9);return {q:a+' × '+b,a:a*b}},
  tambah: function(m){m=m||50;var a=E.rand(5,m),b=E.rand(3,m);return {q:a+' + '+b,a:a+b}},
  kurang: function(m){m=m||50;var a=E.rand(10,m),b=E.rand(1,a);return {q:a+' − '+b,a:a-b}},
  bagi: function(){var b=E.rand(2,9),a=b*E.rand(2,9);return {q:a+' ÷ '+b,a:a/b}},
  campur: function(){return E.pick([E.Q.kali,E.Q.tambah,E.Q.kurang,E.Q.bagi])()},
  /* pengecoh dekat jawaban */
  opsi: function(ans,n){var s={},o=[ans];s[ans]=1;var tries=0;while(o.length<(n||3)&&tries++<99){var d=ans+E.pick([-10,-2,-1,1,2,3,10,-3]);if(d>=0&&!s[d]){s[d]=1;o.push(d)}}return E.shuffle(o)}
};
/* kosakata Inggris → Indonesia */
E.VOCAB = [['apple','apel'],['house','rumah'],['water','air'],['chair','kursi'],['table','meja'],['book','buku'],['window','jendela'],['bread','roti'],['green','hijau'],['happy','senang'],
  ['river','sungai'],['plant','tanaman'],['clock','jam'],['shoes','sepatu'],['tiger','harimau'],['sleep','tidur'],['school','sekolah'],['friend','teman'],['kitchen','dapur'],['cloud','awan'],
  ['teacher','guru'],['pencil','pensil'],['flower','bunga'],['mother','ibu'],['father','ayah'],['rain','hujan'],['bird','burung'],['fish','ikan'],['milk','susu'],['door','pintu']];
/* soal pilihan ganda IPA SD/SMP */
E.IPA = [
  {q:'Bagian tumbuhan yang menyerap air dari tanah adalah…',o:['Akar','Daun','Bunga','Batang'],a:0},
  {q:'Proses tumbuhan membuat makanan dengan bantuan cahaya matahari disebut…',o:['Respirasi','Fotosintesis','Evaporasi','Kondensasi'],a:1},
  {q:'Hewan pemakan tumbuhan disebut…',o:['Karnivora','Omnivora','Herbivora','Insektivora'],a:2},
  {q:'Air yang berubah menjadi es disebut…',o:['Membeku','Mencair','Menguap','Menyublim'],a:0},
  {q:'Planet terdekat dengan Matahari adalah…',o:['Venus','Bumi','Mars','Merkurius'],a:3},
  {q:'Organ yang memompa darah ke seluruh tubuh adalah…',o:['Paru-paru','Jantung','Hati','Ginjal'],a:1},
  {q:'Contoh benda gas adalah…',o:['Batu','Susu','Udara','Kayu'],a:2},
  {q:'Sumber energi utama bagi Bumi adalah…',o:['Bulan','Matahari','Angin','Air'],a:1},
  {q:'Alat pernapasan ikan adalah…',o:['Insang','Paru-paru','Trakea','Kulit'],a:0},
  {q:'Gaya yang menarik benda jatuh ke bawah adalah…',o:['Gaya magnet','Gaya gesek','Gaya gravitasi','Gaya pegas'],a:2},
  {q:'Perubahan wujud gas menjadi cair disebut…',o:['Kondensasi','Evaporasi','Sublimasi','Deposisi'],a:0},
  {q:'Hewan yang berkembang biak dengan bertelur disebut…',o:['Vivipar','Ovipar','Ovovivipar','Mamalia'],a:1}
];
/* kata benda & kata kerja */
E.BENDA = ['meja','buku','sepeda','pohon','kucing','pensil','rumah','bola','tas','apel','kursi','pintu','gunung','sungai'];
E.KERJA = ['berlari','makan','menulis','tidur','membaca','melompat','minum','bernyanyi','menari','memasak','berenang','menangis'];
})();
