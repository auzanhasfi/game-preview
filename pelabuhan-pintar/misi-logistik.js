// Lapisan edukasi "Pelabuhan Pintar": soal hitungan & geografi di atas simulasi pelabuhan 3D.
(function () {
  var SOAL = [
    { q: 'Kapal membawa 1.200 kontainer. 4 crane membongkar sama rata. Berapa kontainer per crane?', o: ['300', '400', '250'], a: 0, w: '1.200 ÷ 4 = 300 kontainer.' },
    { q: 'Satu crane memindahkan 30 kontainer per jam. Berapa jam untuk 240 kontainer?', o: ['6 jam', '8 jam', '10 jam'], a: 1, w: '240 ÷ 30 = 8 jam.' },
    { q: 'Terminal Pasir Panjang di peta ini berada di negara…', o: ['Malaysia', 'Indonesia', 'Singapura'], a: 2, w: 'Pasir Panjang adalah terminal peti kemas di Singapura.' },
    { q: 'Selat sibuk antara Sumatra dan Semenanjung Malaysia yang dilewati kapal ke Singapura adalah…', o: ['Selat Malaka', 'Selat Sunda', 'Selat Bali'], a: 0, w: 'Selat Malaka salah satu jalur laut tersibuk di dunia.' },
    { q: 'Dari 800 kontainer, 25% berisi makanan beku. Berapa kontainer makanan beku?', o: ['150', '200', '250'], a: 1, w: '25% × 800 = 200 kontainer.' },
    { q: 'Kapal berlayar 18 knot (mil laut per jam) selama 5 jam. Berapa jarak tempuhnya?', o: ['90 mil laut', '23 mil laut', '72 mil laut'], a: 0, w: '18 × 5 = 90 mil laut.' }
  ];
  var css = '#mlx{position:fixed;right:72px;top:72px;z-index:99999;width:min(380px,calc(100vw - 32px));background:#fffdf7;color:#14212b;border:1px solid #d9d2c3;border-radius:16px;box-shadow:0 18px 40px -16px rgba(0,0,0,.45);font:14px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;overflow:hidden}' +
    '#mlx .hd{display:flex;align-items:center;gap:8px;padding:10px 14px;background:#0f3b57;color:#fff}#mlx .hd b{flex:1;font-size:13px;letter-spacing:.04em}#mlx .hd span{font:600 12px ui-monospace,Menlo,monospace;background:rgba(255,255,255,.16);padding:2px 8px;border-radius:99px}' +
    '#mlx .bd{padding:12px 14px 14px}#mlx .q{font-weight:650;margin-bottom:10px}#mlx .o{display:grid;gap:6px}#mlx button{font:inherit;text-align:left;padding:9px 12px;border-radius:10px;border:1px solid #c9d6de;background:#f2f7fa;color:#14212b;cursor:pointer}#mlx button:hover:not(:disabled){border-color:#0f3b57}' +
    '#mlx button.ok{background:#d9f2e3;border-color:#1f8a52}#mlx button.no{background:#fbe0dc;border-color:#c0392b}#mlx .fb{margin-top:8px;font-size:13px;min-height:19px;color:#3a4a55}#mlx .nx{margin-top:8px;background:#0f3b57;color:#fff;border-color:#0f3b57;text-align:center;font-weight:650}#mlx.min .bd{display:none}#mlx .tg{background:none;border:0;color:#fff;padding:0 4px;font-size:16px}';
  var i = 0, skor = 0, jawab = 0;
  function el(h) { var d = document.createElement('div'); d.innerHTML = h; return d.firstChild; }
  function render(box) {
    var s = SOAL[i % SOAL.length];
    box.querySelector('.bd').innerHTML = '<div class="q">' + (i % SOAL.length + 1) + '. ' + s.q + '</div><div class="o">' + s.o.map(function (o, k) { return '<button data-k="' + k + '">' + String.fromCharCode(65 + k) + '. ' + o + '</button>'; }).join('') + '</div><div class="fb"></div>';
    box.querySelectorAll('.o button').forEach(function (b) {
      b.onclick = function () {
        var k = +b.dataset.k; jawab++; if (k === s.a) skor++;
        box.querySelectorAll('.o button').forEach(function (x, j) { x.disabled = true; if (j === s.a) x.classList.add('ok'); });
        if (k !== s.a) b.classList.add('no');
        box.querySelector('.fb').textContent = (k === s.a ? 'Benar! ' : 'Belum tepat. ') + s.w;
        box.querySelector('.hd span').textContent = 'Skor ' + skor + '/' + jawab;
        var n = el('<button class="nx">Soal berikutnya →</button>'); n.onclick = function () { i++; render(box); }; box.querySelector('.bd').appendChild(n);
      };
    });
  }
  function start() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var box = el('<div id="mlx"><div class="hd"><b>🚢 MISI LOGISTIK · Matematika & Geografi</b><span>Skor 0/0</span><button class="tg" title="Kecilkan">–</button></div><div class="bd"></div></div>');
    document.body.appendChild(box); render(box);
    box.querySelector('.tg').onclick = function () { box.classList.toggle('min'); };
    window.MLX = { box: box, jawab: function (k) { var b = box.querySelectorAll('.o button')[k]; if (b) b.click(); }, next: function () { var n = box.querySelector('.nx'); if (n) n.click(); } };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(start, 1200); }); else setTimeout(start, 1200);
})();
