/* Turbo Clawd: lintasan plastik oranye — kurva, bingkai (T/U/R) per sampel, loop, lompatan, kemiringan tikungan, mesh */
import * as THREE from 'three';

export const W = 7;            // setengah lebar jalan
export const CELAH = 26;       // panjang celah lompatan
const Y = new THREE.Vector3(0, 1, 0);

function teksturJalan() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 256;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 128, 0);
  grd.addColorStop(0, '#e8590c'); grd.addColorStop(0.08, '#ff7a1a'); grd.addColorStop(0.5, '#ff8a2a'); grd.addColorStop(0.92, '#ff7a1a'); grd.addColorStop(1, '#e8590c');
  g.fillStyle = grd; g.fillRect(0, 0, 128, 256);
  // alur halus plastik
  g.fillStyle = 'rgba(255,255,255,0.05)'; for (let y = 0; y < 256; y += 8) g.fillRect(0, y, 128, 2);
  // garis lajur (3 lajur = 3 pilihan jawaban)
  g.fillStyle = 'rgba(255,236,200,0.55)';
  for (let y = 0; y < 256; y += 64) { g.fillRect(41, y, 4, 36); g.fillRect(83, y, 4, 36); }
  g.fillStyle = 'rgba(120,30,0,0.35)'; g.fillRect(4, 0, 3, 256); g.fillRect(121, 0, 3, 256);
  const t = new THREE.CanvasTexture(c); t.wrapS = THREE.ClampToEdgeWrapping; t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
function teksturCatur() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 32; const g = c.getContext('2d');
  for (let i = 0; i < 16; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? '#14182b' : '#ffffff'; g.fillRect(i * 8, j * 8, 8, 8); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; return t;
}
function teksturPanah() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 128; const g = c.getContext('2d');
  g.fillStyle = '#18d3ff'; g.fillRect(0, 0, 64, 128);
  g.strokeStyle = '#ffffff'; g.lineWidth = 9; g.lineJoin = 'round';
  for (let k = 0; k < 3; k++) { const y = 100 - k * 34; g.beginPath(); g.moveTo(10, y); g.lineTo(32, y - 22); g.lineTo(54, y); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function bangunTrek(def) {
  /* 1. titik kontrol + sisipan loop; tiap titik membawa petunjuk "atas" (hint) */
  const pts = [], hint = [], diLoop = [], lompatTitik = [];
  const SK = 1.5;                       // skala lintasan
  const nd = def.titik.map(([x, z, y, f]) => [x * SK, z * SK, y, f]);
  const tambah = (p, h, l) => { pts.push(p); hint.push(h.clone()); diLoop.push(l); };
  for (let i = 0; i < nd.length; i++) {
    const [x, z, y, f] = nd[i];
    const A = new THREE.Vector3(x, y, z);
    if (f === 'L') {
      const nb = nd[(i + 1) % nd.length];
      const d = new THREE.Vector3(nb[0] - x, 0, nb[1] - z).normalize();
      const side = new THREE.Vector3().crossVectors(d, Y).normalize();
      const r = 13, w = 15, n = 30;
      tambah(A.clone().addScaledVector(d, -14), Y, 0);
      for (let k = 0; k < n; k++) {
        const th = k / n * Math.PI * 2;
        const normal = d.clone().multiplyScalar(-Math.sin(th)).addScaledVector(Y, Math.cos(th));
        tambah(A.clone().addScaledVector(d, r * Math.sin(th)).addScaledVector(Y, r * (1 - Math.cos(th))).addScaledVector(side, w * th / (Math.PI * 2)), normal, 1);
      }
      for (let k = 0; k <= 4; k++) { const u = k / 4, sm = 1 - u * u * (3 - 2 * u); tambah(A.clone().addScaledVector(d, 3 + u * 44).addScaledVector(side, w * sm), Y, 0); }
    } else {
      tambah(A, Y, 0);
      if (f === 'J') lompatTitik.push(A.clone());
    }
  }
  const kurva = new THREE.CatmullRomCurve3(pts, true, 'centripetal');
  const L = kurva.getLength();
  const N = Math.round(L / 0.8), ds = L / N;
  const sp = [], hintS = [], loopS = new Uint8Array(N), np = pts.length;
  for (let i = 0; i < N; i++) {
    const tt = kurva.getUtoTmapping(i / N);
    sp.push(kurva.getPoint(tt));
    const seg = tt * np, j = Math.floor(seg) % np, j2 = (j + 1) % np, f = seg - Math.floor(seg);
    hintS.push(hint[j].clone().lerp(hint[j2], f));
    loopS[i] = diLoop[j] || diLoop[j2] ? 1 : 0;
  }

  const P = new Float32Array(N * 3), T = new Float32Array(N * 3), U = new Float32Array(N * 3), R = new Float32Array(N * 3);
  const K = new Float32Array(N), loop = new Uint8Array(N), celah = new Uint8Array(N);
  const v = (arr, i) => new THREE.Vector3(arr[i * 3], arr[i * 3 + 1], arr[i * 3 + 2]);
  const set = (arr, i, q) => { arr[i * 3] = q.x; arr[i * 3 + 1] = q.y; arr[i * 3 + 2] = q.z; };
  for (let i = 0; i < N; i++) set(P, i, sp[i]);
  for (let i = 0; i < N; i++) { const a = sp[(i - 1 + N) % N], b = sp[(i + 1) % N]; set(T, i, b.clone().sub(a).normalize()); }

  /* 2. vektor atas dari petunjuk, dibuat tegak lurus arah lintasan */
  for (let i = 0; i < N; i++) {
    const ti = v(T, i), h = hintS[i].clone();
    h.addScaledVector(ti, -h.dot(ti));
    if (h.lengthSq() < 1e-4) h.copy(Y).addScaledVector(ti, -Y.dot(ti));
    set(U, i, h.normalize());
  }
  /* 3. kelengkungan lateral + kemiringan tikungan */
  const k0 = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const ti = v(T, i), ui = v(U, i), ri = new THREE.Vector3().crossVectors(ti, ui);
    const d = v(T, (i + 2) % N).sub(v(T, (i - 2 + N) % N)).divideScalar(4 * ds);
    k0[i] = d.dot(ri);
    loop[i] = loopS[i];
  }
  // tandai zona loop lebih lebar sedikit
  const lp2 = loop.slice();
  for (let i = 0; i < N; i++) if (lp2[i]) for (let j = -25; j <= 25; j++) loop[(i + j + N) % N] = 1;
  const win = 22;
  for (let i = 0; i < N; i++) { let s = 0; for (let j = -win; j <= win; j++) s += k0[(i + j + N) % N]; K[i] = loop[i] ? 0 : s / (2 * win + 1); }
  for (let i = 0; i < N; i++) {
    if (loop[i]) { const ti = v(T, i), ui = v(U, i); set(R, i, new THREE.Vector3().crossVectors(ti, ui).normalize()); continue; }
    const ti = v(T, i), ui = v(U, i), ri = new THREE.Vector3().crossVectors(ti, ui).normalize();
    const b = Math.max(-0.42, Math.min(0.42, K[i] * 11));
    const u2 = ui.clone().multiplyScalar(Math.cos(b)).addScaledVector(ri, Math.sin(b)).normalize();
    set(U, i, u2); set(R, i, new THREE.Vector3().crossVectors(ti, u2).normalize());
  }

  /* 4. celah lompatan */
  const zonaLompat = [];
  for (const A of lompatTitik) {
    let best = 0, bd = 1e9;
    for (let i = 0; i < N; i++) { const d = v(P, i).distanceToSquared(A); if (d < bd) { bd = d; best = i; } }
    const s0 = best * ds - CELAH / 2;
    zonaLompat.push({ s0, s1: s0 + CELAH });
    for (let i = Math.floor(s0 / ds); i <= Math.ceil((s0 + CELAH) / ds); i++) celah[(i + N) % N] = 1;
  }

  const trek = { def, L, N, ds, P, T, U, R, K, loop, celah, zonaLompat, kurva };

  /* bingkai ter-interpolasi pada jarak s */
  trek.bingkai = (s, o) => {
    s = ((s % L) + L) % L;
    const f = s / ds, i0 = Math.floor(f) % N, i1 = (i0 + 1) % N, a = f - Math.floor(f), b = 1 - a;
    for (const [k, arr] of [['p', P], ['t', T], ['u', U], ['r', R]]) {
      o[k].set(arr[i0 * 3] * b + arr[i1 * 3] * a, arr[i0 * 3 + 1] * b + arr[i1 * 3 + 1] * a, arr[i0 * 3 + 2] * b + arr[i1 * 3 + 2] * a);
    }
    o.u.normalize(); o.r.normalize(); o.t.normalize();
    o.k = K[i0] * b + K[i1] * a; o.loop = loop[i0]; o.celah = celah[i0];
    return o;
  };
  trek.idx = (s) => Math.floor((((s % L) + L) % L) / ds) % N;
  trek.aman = (frac, pjg = 30) => {   // geser posisi sampai bebas loop/celah
    let s = frac * L;
    for (let n = 0; n < 400; n++) {
      let ok = true;
      for (let d = -12; d <= pjg; d += 2) { const i = trek.idx(s + d); if (loop[i] || celah[i]) { ok = false; break; } }
      if (ok) return s; s += 6;
    }
    return frac * L;
  };
  return trek;
}

export function bingkaiBaru() { return { p: new THREE.Vector3(), t: new THREE.Vector3(), u: new THREE.Vector3(), r: new THREE.Vector3(), k: 0, loop: 0, celah: 0 }; }

/* mesh lintasan */
export function meshTrek(trek, warnaTiang = '#4a6fd8') {
  const g = new THREE.Group();
  const { N, P, U, R, celah, ds } = trek;
  const strip = (profil, uvU) => {
    // profil: daftar [lat, tinggi]; tiap pasangan berurutan = satu pita
    const pos = [], uv = [], idx = [];
    const pita = profil.length - 1;
    for (let i = 0; i <= N; i++) {
      const j = i % N;
      for (let k = 0; k < profil.length; k++) {
        const [lat, h] = profil[k];
        pos.push(P[j * 3] + R[j * 3] * lat + U[j * 3] * h, P[j * 3 + 1] + R[j * 3 + 1] * lat + U[j * 3 + 1] * h, P[j * 3 + 2] + R[j * 3 + 2] * lat + U[j * 3 + 2] * h);
        uv.push(uvU ? uvU[k] : k / pita, i * ds / 16);
      }
    }
    const n = profil.length;
    for (let i = 0; i < N; i++) {
      if (celah[i] || celah[(i + 1) % N]) continue;
      for (let k = 0; k < pita; k++) {
        const a = i * n + k, b = a + 1, c = a + n, d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx); geo.computeVertexNormals();
    return geo;
  };
  const jalan = new THREE.Mesh(strip([[-W, 0], [W, 0]], [0, 1]), new THREE.MeshStandardMaterial({ map: teksturJalan(), roughness: 0.38, metalness: 0.05, side: THREE.DoubleSide }));
  g.add(jalan);
  const matPagar = new THREE.MeshStandardMaterial({ color: '#e0560a', roughness: 0.42, side: THREE.DoubleSide });
  for (const sg of [-1, 1]) {
    g.add(new THREE.Mesh(strip([[sg * W, -0.02], [sg * W, 1.15], [sg * (W + 0.55), 1.15], [sg * (W + 0.55), -0.55], [0, -0.55]]), matPagar));
  }
  // sambungan biru setiap 40 unit + tiang penyangga
  const matSambung = new THREE.MeshStandardMaterial({ color: '#1e3a8a', roughness: 0.5 });
  const geoSambung = new THREE.BoxGeometry(2 * W, 0.05, 1.1), geoJepit = new THREE.BoxGeometry(0.9, 1.7, 1.2);
  const matTiang = new THREE.MeshStandardMaterial({ color: warnaTiang, roughness: 0.6 });
  const geoTiang = new THREE.CylinderGeometry(0.45, 0.6, 1, 8);
  const tmp = bingkaiBaru(), m = new THREE.Matrix4(), nt = new THREE.Vector3();
  for (let s = 20; s < trek.L; s += 40) {
    trek.bingkai(s, tmp); if (tmp.celah) continue;
    const b = new THREE.Mesh(geoSambung, matSambung);
    nt.copy(tmp.t).negate(); m.makeBasis(tmp.r, tmp.u, nt);
    b.quaternion.setFromRotationMatrix(m); b.position.copy(tmp.p).addScaledVector(tmp.u, 0.03); g.add(b);
    for (const sg of [-1, 1]) { const j = new THREE.Mesh(geoJepit, matSambung); j.quaternion.copy(b.quaternion); j.position.copy(tmp.p).addScaledVector(tmp.r, sg * (W + 0.3)).addScaledVector(tmp.u, 0.35); g.add(j); }
  }
  for (let s = 8; s < trek.L; s += 26) {
    trek.bingkai(s, tmp); if (tmp.celah || tmp.loop || tmp.p.y < 1.6) continue;
    const h = tmp.p.y - 0.5;
    const c = new THREE.Mesh(geoTiang, matTiang); c.scale.y = h; c.position.set(tmp.p.x, h / 2, tmp.p.z); g.add(c);
  }
  // tiang loop
  for (let i = 0; i < N; i += 40) if (trek.loop[i] && P[i * 3 + 1] > 6 && U[i * 3 + 1] < -0.6) {
    for (const sg of [-1, 1]) {
      const x = P[i * 3] + R[i * 3] * sg * (W + 1.5), z = P[i * 3 + 2] + R[i * 3 + 2] * sg * (W + 1.5), h = P[i * 3 + 1] + 1;
      const c = new THREE.Mesh(geoTiang, matTiang); c.scale.y = h; c.position.set(x, h / 2, z); g.add(c);
    }
  }
  // garis start/finis + gapura
  trek.bingkai(0, tmp); nt.copy(tmp.t).negate(); m.makeBasis(tmp.r, tmp.u, nt);
  const q = new THREE.Quaternion().setFromRotationMatrix(m);
  const garis = new THREE.Mesh(new THREE.PlaneGeometry(2 * W, 3), new THREE.MeshBasicMaterial({ map: teksturCatur() }));
  garis.quaternion.copy(q).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2));
  garis.position.copy(tmp.p).addScaledVector(tmp.u, 0.04); g.add(garis);
  const gap = new THREE.Group(); gap.quaternion.copy(q); gap.position.copy(tmp.p);
  const matG = new THREE.MeshStandardMaterial({ color: '#14182b', roughness: 0.5 });
  for (const sg of [-1, 1]) { const t = new THREE.Mesh(new THREE.BoxGeometry(0.8, 9, 0.8), matG); t.position.set(sg * (W + 1.2), 4.5, 0); gap.add(t); }
  const pap = new THREE.Mesh(new THREE.BoxGeometry(2 * W + 3.2, 1.8, 0.5), new THREE.MeshBasicMaterial({ map: teksturCatur() })); pap.position.y = 9; gap.add(pap);
  g.add(gap);
  // pad turbo
  trek.pads = [];
  const matPad = new THREE.MeshBasicMaterial({ map: teksturPanah(), transparent: true, opacity: 0.92 });
  for (const f of trek.def.pad) {
    const s = trek.aman(f, 10), lat = 0;
    trek.bingkai(s + 3, tmp); nt.copy(tmp.t).negate(); m.makeBasis(tmp.r, tmp.u, nt);
    const pd = new THREE.Mesh(new THREE.PlaneGeometry(5, 6), matPad);
    pd.quaternion.setFromRotationMatrix(m).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2));
    pd.position.copy(tmp.p).addScaledVector(tmp.r, lat).addScaledVector(tmp.u, 0.05); g.add(pd);
    trek.pads.push({ s, x: lat });
  }
  return g;
}
