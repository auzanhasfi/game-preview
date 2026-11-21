/* 8 tahap. lapisan x 10 cm = tinggi sasaran. w0 = lebar blok awal, min = lebar minimum, v = rad/s, tol = cm "tepat sempurna". */
(function (root) {
  const T = [
    { lap: 6,  w0: 120, min: 30, v: 1.3, tol: 4 },
    { lap: 8,  w0: 120, min: 35, v: 1.5, tol: 4 },
    { lap: 10, w0: 110, min: 35, v: 1.7, tol: 3.5 },
    { lap: 12, w0: 110, min: 40, v: 1.9, tol: 3.5 },
    { lap: 14, w0: 100, min: 40, v: 2.1, tol: 3 },
    { lap: 16, w0: 100, min: 40, v: 2.3, tol: 3 },
    { lap: 18, w0: 90,  min: 40, v: 2.5, tol: 2.5 },
    { lap: 20, w0: 90,  min: 40, v: 2.7, tol: 2.5 }
  ];
  root.DATA = { tahap: T, PALET: ['#ff7a7a', '#ffb347', '#ffd84d', '#7bd88f', '#4fc3d9', '#8a8cff', '#d782e8'] };
})(window);
