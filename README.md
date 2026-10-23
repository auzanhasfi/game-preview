# game-preview

Preview game & app yang bisa dimainkan, dipisah dari situs Prompt Generator (repo `auzanhasfi/prompt-generator`).
Situs statik tanpa build: deploy ke Netlify dari repo ini (publish = `.`).

- Isi = salinan folder `contoh/` dari prompt-generator, ditaruh di akar: `/<id-game>/`, `/kertas-tinta/games/<id>/`, `/app/<id>/`, `/arena-clawd/`.
- Kit bersama: `_kit/` (edu.js/css) dan `kertas-tinta/kit/`.
- Halaman depan = daftar 56 game & app (cari + tab kategori), sampul di `sampul/`. Cara jana ulang: `_build/BACA.txt`.
- Link balik ke generator sengaja dihapus; situs ini `noindex`.
- Prompt Generator mengarahkan semua link "Main"/"Buka" dan URL lama `/contoh/*` ke https://preview.edugamelabs.com
  (`PREVIEW_BASE` di `js/preview.js` + redirect di `netlify.toml` repo prompt-generator). Ganti keduanya bila domain berubah.
