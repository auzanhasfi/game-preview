/* Dunia Clawd: bahasa (Melayu lalai, English, Indonesia) */
export const BAHASA = { ms: 'Melayu', en: 'English', id: 'Indonesia' };
let kini = 'ms';
export function setBahasa(l) { kini = BAHASA[l] ? l : 'ms'; document.documentElement.lang = kini; }
export function bahasa() { return kini; }
/* t('melayu', 'english', 'indonesia'); nilai ketiga boleh ditinggal kalau sama dengan Melayu */
export function t(ms, en, id) { return kini === 'en' ? en : kini === 'id' ? (id ?? ms) : ms; }
/* teks data berbentuk [ms, en, id] */
export function tx(v) { return typeof v === 'string' ? v : t(v[0], v[1], v[2]); }
export function nombor(n) { n = Math.floor(n); if (n >= 1e6) return (n / 1e6).toFixed(1).replace('.0', '') + 'M'; if (n >= 1e4) return (n / 1e3).toFixed(1).replace('.0', '') + 'K'; return n.toLocaleString('en-US'); }
