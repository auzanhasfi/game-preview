# Laporan main-uji — game-arena-clawd-20261019-0153-moba-matematik-bm

Masa: 2026-10-18T19:01:19.627Z  ·  Senario: uji/senario.json

## arena · telefon (390×844)

- ✅ `buka` index.html 
- ✅ `tunggu` 900 
- ✅ `tangkap` 01-menu → bukti/arena-telefon-01-menu.png
- ✅ `klik` [data-uji=mula] 
- ✅ `tunggu` 500 
- ✅ `nilai` window.__game.gerak(0.7,-0.7), window.__game.langkah(9) = "main"
- ✅ `nilai` window.__game.info = {"t":10,"hp":0,"lvl":1,"minion":24,"menara":0,"bunuh":0,"boss":7000,"mati":true}
- ✅ `tangkap` 02-lorong → bukti/arena-telefon-02-lorong.png
- ✅ `nilai` window.__game.gerak(0.7,-0.7), window.__game.langkah(8), window.__game.gerak(0,0), window.__game.langkah(10) = "main"
- ✅ `nilai` window.__game.info = {"t":28,"hp":780,"lvl":1,"minion":10,"menara":0,"bunuh":3,"boss":7000,"mati":false}
- ✅ `tangkap` 03-perang → bukti/arena-telefon-03-perang.png
- ✅ `nilai` window.__game.skill(0), window.__game.skill(1), window.__game.skill(2), window.__game.langkah(0.3) = "main"
- ✅ `tangkap` 04-skill → bukti/arena-telefon-04-skill.png
- ✅ `nilai` window.__game.soalan(), window.__game.langkah(0.1) = "soalan"
- ✅ `tunggu` 500 
- ✅ `jangka` window.__game.keadaan === 'soalan' 
- ✅ `tangkap` 05-soalan → bukti/arena-telefon-05-soalan.png
- ✅ `nilai` window.__game.jawabUji(true) = true
- ✅ `tunggu` 1600 
- ✅ `jangka` window.__game.keadaan === 'main' 
- ✅ `nilai` window.__game.cedera(99999) = undefined
- ✅ `tunggu` 1300 
- ✅ `tangkap` 06-tumbang → bukti/arena-telefon-06-tumbang.png
- ✅ `nilai` window.__game.jawabUji(false) = true
- ✅ `tunggu` 2200 
- ✅ `nilai` window.__game.langkah(12) = "main"
- ✅ `nilai` window.__game.info = {"t":42,"hp":900,"lvl":1,"minion":25,"menara":0,"bunuh":4,"boss":7000,"mati":false}
- ✅ `nilai` window.__game.runtuh(2), window.__game.ke(1560, 520), window.__game.langkah(1.5) = "main"
- ✅ `tunggu` 300 
- ✅ `tangkap` 07-boss → bukti/arena-telefon-07-boss.png
- ✅ `nilai` window.__game.pukulBoss(99999) = -93074
- ✅ `nilai` window.__game.langkah(2) = "menang"
- ✅ `tunggu` 1800 
- ✅ `jangka` window.__game.keadaan === 'menang' 
- ✅ `tangkap` 08-menang → bukti/arena-telefon-08-menang.png

## arena · desktop (1366×768)

- ✅ `buka` index.html 
- ✅ `tunggu` 900 
- ✅ `tangkap` 01-menu → bukti/arena-desktop-01-menu.png
- ✅ `klik` [data-uji=mula] 
- ✅ `tunggu` 500 
- ✅ `nilai` window.__game.gerak(0.7,-0.7), window.__game.langkah(9) = "main"
- ✅ `nilai` window.__game.info = {"t":10,"hp":0,"lvl":1,"minion":24,"menara":0,"bunuh":0,"boss":7000,"mati":true}
- ✅ `tangkap` 02-lorong → bukti/arena-desktop-02-lorong.png
- ✅ `nilai` window.__game.gerak(0.7,-0.7), window.__game.langkah(8), window.__game.gerak(0,0), window.__game.langkah(10) = "main"
- ✅ `nilai` window.__game.info = {"t":28,"hp":780,"lvl":1,"minion":10,"menara":0,"bunuh":2,"boss":7000,"mati":false}
- ✅ `tangkap` 03-perang → bukti/arena-desktop-03-perang.png
- ✅ `nilai` window.__game.skill(0), window.__game.skill(1), window.__game.skill(2), window.__game.langkah(0.3) = "main"
- ✅ `tangkap` 04-skill → bukti/arena-desktop-04-skill.png
- ✅ `nilai` window.__game.soalan(), window.__game.langkah(0.1) = "soalan"
- ✅ `tunggu` 500 
- ✅ `jangka` window.__game.keadaan === 'soalan' 
- ✅ `tangkap` 05-soalan → bukti/arena-desktop-05-soalan.png
- ✅ `nilai` window.__game.jawabUji(true) = true
- ✅ `tunggu` 1600 
- ✅ `jangka` window.__game.keadaan === 'main' 
- ✅ `nilai` window.__game.cedera(99999) = undefined
- ✅ `tunggu` 1300 
- ✅ `tangkap` 06-tumbang → bukti/arena-desktop-06-tumbang.png
- ✅ `nilai` window.__game.jawabUji(false) = true
- ✅ `tunggu` 2200 
- ✅ `nilai` window.__game.langkah(12) = "main"
- ✅ `nilai` window.__game.info = {"t":42,"hp":900,"lvl":1,"minion":26,"menara":0,"bunuh":3,"boss":7000,"mati":false}
- ✅ `nilai` window.__game.runtuh(2), window.__game.ke(1560, 520), window.__game.langkah(1.5) = "main"
- ✅ `tunggu` 300 
- ✅ `tangkap` 07-boss → bukti/arena-desktop-07-boss.png
- ✅ `nilai` window.__game.pukulBoss(99999) = -93074
- ✅ `nilai` window.__game.langkah(2) = "menang"
- ✅ `tunggu` 1800 
- ✅ `jangka` window.__game.keadaan === 'menang' 
- ✅ `tangkap` 08-menang → bukti/arena-desktop-08-menang.png

**Semua senario lulus, tiada ralat.** Baca gambar dalam bukti/ sebelum kata siap.