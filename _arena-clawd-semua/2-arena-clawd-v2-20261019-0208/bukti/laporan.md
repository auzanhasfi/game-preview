# Laporan main-uji — game-arena-clawd-20261019-0208-hero-spell-kedai-hutan-bm

Masa: 2026-10-18T19:17:41.790Z  ·  Senario: uji/senario.json

## pahlawan · telefon (390×844)

- ✅ `buka` index.html 
- ✅ `tunggu` 900 
- ✅ `tangkap` 01-menu → bukti/pahlawan-telefon-01-menu.png
- ✅ `klik` [data-uji=mula] 
- ✅ `tunggu` 400 
- ✅ `nilai` window.__game.ke(560,700), window.__game.langkah(0.5), window.__game.monster('kelomang') = {"x":560,"y":560,"hp":520}
- ✅ `nilai` window.__game.langkah(6), window.__game.info = {"t":7,"hp":1150,"max":1150,"lvl":1,"sl":[1,1,0],"pts":0,"emas":311,"item":[],"menara":0,"bunuh":0,"monster":0,"buff":[],"boss":7000,"mati":false}
- ✅ `tangkap` 02-kelomang → bukti/pahlawan-telefon-02-kelomang.png
- ✅ `nilai` window.__game.ke(560,1000), window.__game.langkah(0.3), window.__game.skill(1), window.__game.langkah(0.15) = "main"
- ✅ `tangkap` 03-pusing-biru → bukti/pahlawan-telefon-03-pusing-biru.png
- ✅ `nilai` window.__game.langkah(10), window.__game.info = {"t":18,"hp":967,"max":1150,"lvl":1,"sl":[1,1,0],"pts":0,"emas":340,"item":[],"menara":0,"bunuh":0,"monster":0,"buff":[],"boss":7000,"mati":false}
- ✅ `nilai` window.__game.xp(600), window.__game.info = {"t":18,"hp":1400,"max":1400,"lvl":3,"sl":[1,1,0],"pts":2,"emas":340,"item":[],"menara":0,"bunuh":0,"monster":0,"buff":[],"boss":7000,"mati":false}
- ✅ `nilai` window.__game.naik(0) = true
- ✅ `nilai` window.__game.ke(900,1100), window.__game.gerak(0.7,-0.7), window.__game.langkah(8), window.__game.gerak(0,0), window.__game.langkah(3) = "main"
- ✅ `nilai` window.__game.skill(2), window.__game.langkah(0.25) = "main"
- ✅ `tangkap` 04-ult-lompat → bukti/pahlawan-telefon-04-ult-lompat.png
- ✅ `nilai` window.__game.langkah(0.4) = "main"
- ✅ `tangkap` 05-hentak → bukti/pahlawan-telefon-05-hentak.png
- ✅ `nilai` window.__game.emas(2000), window.__game.kedai(), window.__game.beli('pedang'), window.__game.beli('jaket') = true
- ✅ `tunggu` 300 
- ✅ `tangkap` 06-kedai → bukti/pahlawan-telefon-06-kedai.png
- ✅ `nilai` window.__game.tutupKedai(), window.__game.info = {"t":30,"hp":1265,"max":1875,"lvl":4,"sl":[2,1,1],"pts":1,"emas":1843,"item":["pedang","jaket"],"menara":0,"bunuh":3,"monster":0,"buff":[],"boss":7000,"mati":false}
- ✅ `nilai` window.__game.soalan(), window.__game.langkah(0.1) = "soalan"
- ✅ `tunggu` 400 
- ✅ `jangka` window.__game.keadaan === 'soalan' 
- ✅ `nilai` window.__game.jawabUji(true) = true
- ✅ `tunggu` 1600 
- ✅ `nilai` window.__game.runtuh(2), window.__game.ke(1560,520), window.__game.langkah(1.5) = "main"
- ✅ `tunggu` 300 
- ✅ `tangkap` 07-boss → bukti/pahlawan-telefon-07-boss.png
- ✅ `nilai` window.__game.pukulBoss(99999), window.__game.langkah(2) = "menang"
- ✅ `tunggu` 1800 
- ✅ `jangka` window.__game.keadaan === 'menang' 
- ✅ `tangkap` 08-menang → bukti/pahlawan-telefon-08-menang.png

## pahlawan · desktop (1366×768)

- ✅ `buka` index.html 
- ✅ `tunggu` 900 
- ✅ `tangkap` 01-menu → bukti/pahlawan-desktop-01-menu.png
- ✅ `klik` [data-uji=mula] 
- ✅ `tunggu` 400 
- ✅ `nilai` window.__game.ke(560,700), window.__game.langkah(0.5), window.__game.monster('kelomang') = {"x":560,"y":560,"hp":520}
- ✅ `nilai` window.__game.langkah(6), window.__game.info = {"t":7,"hp":1150,"max":1150,"lvl":1,"sl":[1,1,0],"pts":0,"emas":311,"item":[],"menara":0,"bunuh":0,"monster":0,"buff":[],"boss":7000,"mati":false}
- ✅ `tangkap` 02-kelomang → bukti/pahlawan-desktop-02-kelomang.png
- ✅ `nilai` window.__game.ke(560,1000), window.__game.langkah(0.3), window.__game.skill(1), window.__game.langkah(0.15) = "main"
- ✅ `tangkap` 03-pusing-biru → bukti/pahlawan-desktop-03-pusing-biru.png
- ✅ `nilai` window.__game.langkah(10), window.__game.info = {"t":18,"hp":967,"max":1150,"lvl":1,"sl":[1,1,0],"pts":0,"emas":328,"item":[],"menara":0,"bunuh":0,"monster":0,"buff":[],"boss":7000,"mati":false}
- ✅ `nilai` window.__game.xp(600), window.__game.info = {"t":18,"hp":1400,"max":1400,"lvl":3,"sl":[1,1,0],"pts":2,"emas":328,"item":[],"menara":0,"bunuh":0,"monster":0,"buff":[],"boss":7000,"mati":false}
- ✅ `nilai` window.__game.naik(0) = true
- ✅ `nilai` window.__game.ke(900,1100), window.__game.gerak(0.7,-0.7), window.__game.langkah(8), window.__game.gerak(0,0), window.__game.langkah(3) = "main"
- ✅ `nilai` window.__game.skill(2), window.__game.langkah(0.25) = "main"
- ✅ `tangkap` 04-ult-lompat → bukti/pahlawan-desktop-04-ult-lompat.png
- ✅ `nilai` window.__game.langkah(0.4) = "main"
- ✅ `tangkap` 05-hentak → bukti/pahlawan-desktop-05-hentak.png
- ✅ `nilai` window.__game.emas(2000), window.__game.kedai(), window.__game.beli('pedang'), window.__game.beli('jaket') = true
- ✅ `tunggu` 300 
- ✅ `tangkap` 06-kedai → bukti/pahlawan-desktop-06-kedai.png
- ✅ `nilai` window.__game.tutupKedai(), window.__game.info = {"t":30,"hp":1448,"max":1875,"lvl":4,"sl":[2,1,1],"pts":1,"emas":1827,"item":["pedang","jaket"],"menara":0,"bunuh":2,"monster":0,"buff":[],"boss":7000,"mati":false}
- ✅ `nilai` window.__game.soalan(), window.__game.langkah(0.1) = "soalan"
- ✅ `tunggu` 400 
- ✅ `jangka` window.__game.keadaan === 'soalan' 
- ✅ `nilai` window.__game.jawabUji(true) = true
- ✅ `tunggu` 1600 
- ✅ `nilai` window.__game.runtuh(2), window.__game.ke(1560,520), window.__game.langkah(1.5) = "main"
- ✅ `tunggu` 300 
- ✅ `tangkap` 07-boss → bukti/pahlawan-desktop-07-boss.png
- ✅ `nilai` window.__game.pukulBoss(99999), window.__game.langkah(2) = "menang"
- ✅ `tunggu` 1800 
- ✅ `jangka` window.__game.keadaan === 'menang' 
- ✅ `tangkap` 08-menang → bukti/pahlawan-desktop-08-menang.png

## sihir · telefon (390×844)

- ✅ `buka` index.html 
- ✅ `tunggu` 500 
- ✅ `klik` [data-uji=hero-sihir] 
- ✅ `klik` [data-uji=spell-hukuman] 
- ✅ `tunggu` 200 
- ✅ `tangkap` 01-pilih → bukti/sihir-telefon-01-pilih.png
- ✅ `klik` [data-uji=mula] 
- ✅ `tunggu` 300 
- ✅ `nilai` window.__game.gerak(0.7,-0.7), window.__game.langkah(5.5), window.__game.gerak(0,0), window.__game.langkah(9), window.__game.info = {"t":15,"hp":0,"max":820,"lvl":1,"sl":[1,1,0],"pts":0,"emas":351,"item":[],"menara":0,"bunuh":1,"monster":0,"buff":[],"boss":7000,"mati":true}
- ✅ `nilai` window.__game.skill(1), window.__game.langkah(0.08) = "main"
- ✅ `tangkap` 02-kilat → bukti/sihir-telefon-02-kilat.png
- ✅ `nilai` window.__game.skill(0), window.__game.langkah(0.35) = "main"
- ✅ `tangkap` 03-bola → bukti/sihir-telefon-03-bola.png
- ✅ `nilai` window.__game.ke(1480,1000), window.__game.langkah(0.3), window.__game.spell(), window.__game.langkah(0.1) = "main"
- ✅ `tangkap` 04-hukuman-merah → bukti/sihir-telefon-04-hukuman-merah.png
- ✅ `nilai` window.__game.langkah(6), window.__game.info = {"t":22,"hp":820,"max":820,"lvl":1,"sl":[1,1,0],"pts":0,"emas":363,"item":[],"menara":0,"bunuh":1,"monster":0,"buff":[],"boss":7000,"mati":false}

## sihir · desktop (1366×768)

- ✅ `buka` index.html 
- ✅ `tunggu` 500 
- ✅ `klik` [data-uji=hero-sihir] 
- ✅ `klik` [data-uji=spell-hukuman] 
- ✅ `tunggu` 200 
- ✅ `tangkap` 01-pilih → bukti/sihir-desktop-01-pilih.png
- ✅ `klik` [data-uji=mula] 
- ✅ `tunggu` 300 
- ✅ `nilai` window.__game.gerak(0.7,-0.7), window.__game.langkah(5.5), window.__game.gerak(0,0), window.__game.langkah(9), window.__game.info = {"t":15,"hp":0,"max":820,"lvl":1,"sl":[1,1,0],"pts":0,"emas":351,"item":[],"menara":0,"bunuh":1,"monster":0,"buff":[],"boss":7000,"mati":true}
- ✅ `nilai` window.__game.skill(1), window.__game.langkah(0.08) = "main"
- ✅ `tangkap` 02-kilat → bukti/sihir-desktop-02-kilat.png
- ✅ `nilai` window.__game.skill(0), window.__game.langkah(0.35) = "main"
- ✅ `tangkap` 03-bola → bukti/sihir-desktop-03-bola.png
- ✅ `nilai` window.__game.ke(1480,1000), window.__game.langkah(0.3), window.__game.spell(), window.__game.langkah(0.1) = "main"
- ✅ `tangkap` 04-hukuman-merah → bukti/sihir-desktop-04-hukuman-merah.png
- ✅ `nilai` window.__game.langkah(6), window.__game.info = {"t":22,"hp":820,"max":820,"lvl":1,"sl":[1,1,0],"pts":0,"emas":363,"item":[],"menara":0,"bunuh":1,"monster":0,"buff":[],"boss":7000,"mati":false}

## pemanah · telefon (390×844)

- ✅ `buka` index.html 
- ✅ `tunggu` 500 
- ✅ `klik` [data-uji=hero-pemanah] 
- ✅ `klik` [data-uji=mula] 
- ✅ `tunggu` 300 
- ✅ `nilai` window.__game.gerak(0.7,-0.7), window.__game.langkah(5.5), window.__game.gerak(0,0), window.__game.langkah(9), window.__game.xp(500) = 3
- ✅ `nilai` window.__game.skill(0), window.__game.skill(2), window.__game.langkah(0.4) = "main"
- ✅ `tangkap` 01-panah → bukti/pemanah-telefon-01-panah.png
- ✅ `nilai` window.__game.langkah(3), window.__game.info = {"t":18,"hp":348,"max":1050,"lvl":3,"sl":[1,1,0],"pts":2,"emas":425,"item":[],"menara":0,"bunuh":3,"monster":0,"buff":[],"boss":7000,"mati":false}

## pemanah · desktop (1366×768)

- ✅ `buka` index.html 
- ✅ `tunggu` 500 
- ✅ `klik` [data-uji=hero-pemanah] 
- ✅ `klik` [data-uji=mula] 
- ✅ `tunggu` 300 
- ✅ `nilai` window.__game.gerak(0.7,-0.7), window.__game.langkah(5.5), window.__game.gerak(0,0), window.__game.langkah(9), window.__game.xp(500) = 3
- ✅ `nilai` window.__game.skill(0), window.__game.skill(2), window.__game.langkah(0.4) = "main"
- ✅ `tangkap` 01-panah → bukti/pemanah-desktop-01-panah.png
- ✅ `nilai` window.__game.langkah(3), window.__game.info = {"t":18,"hp":275,"max":1050,"lvl":3,"sl":[1,1,0],"pts":2,"emas":425,"item":[],"menara":0,"bunuh":3,"monster":0,"buff":[],"boss":7000,"mati":false}

**Semua senario lulus, tiada ralat.** Baca gambar dalam bukti/ sebelum kata siap.