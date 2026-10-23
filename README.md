# game-preview

Preview game & app yang bisa dimainkan, dipisah dari situs Prompt Generator (repo `auzanhasfi/prompt-generator`).
Situs statik tanpa build: deploy ke Netlify dari repo ini (publish = `.`).

- Isi = salinan folder `contoh/` dari prompt-generator, ditaruh di akar: `/<id-game>/`, `/kertas-tinta/games/<id>/`, `/app/<id>/`, `/arena-clawd/`.
- Kit bersama: `_kit/` (edu.js/css) dan `kertas-tinta/kit/`.
- Link balik ke generator sengaja dihapus; situs ini `noindex`.
- Prompt Generator mengarahkan semua link "Main"/"Buka" dan URL lama `/contoh/*` ke domain situs ini
  (`PREVIEW_BASE` di `js/preview.js` + redirect di `netlify.toml` repo prompt-generator). Ganti keduanya bila domain berubah.
