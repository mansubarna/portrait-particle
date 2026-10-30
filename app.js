/**
 * Particle Portrait - Interactive Image Particle Simulation Engine
 * Replicated and enhanced with high-performance 32-bit pixel buffer rendering,
 * entrance physics, cursor flow turbulence, ambient dust, color palettes,
 * backdrop removal, video/image export, and responsive controls.
 */

(() => {
  'use strict';

  // --- Default Configuration & Live State ---
  const DEF = {
    spacing: 3,         // Spacing / density step (2.5 to 8)
    size: 1.6,          // Particle draw size (0.8 to 5)
    radius: 40,         // Cursor hover radius in CSS pixels (15 to 160)
    soft: 0.5,          // Edge softness falloff (0 to 1)
    lift: 1.0,          // Lift height factor (0.2 to 3)
    speed: 1.0,         // Flow & return velocity factor (0.3 to 3)
    jitter: 1.0,        // Particle jitter (0 to 3)
    shimmer: 1.0,       // Sine wave brightness modulation (0 to 2)
    fuzz: 1.0,          // Ambient dust particle quantity (0 to 2)
    fuzzSize: 1.0,      // Ambient dust particle size (1 to 4)
    tint: 1.0,          // Color tint variation (0 to 3)
    spread: 1.0,        // Luminance spread contrast (0 to 2)
    bright: 1.15,       // Master brightness multiplier (0.5 to 2)
    cutoff: 28,         // Dark background cutoff threshold (0 to 120)
    auto: 1,            // Auto-detect & strip uniform backdrop (0 or 1)
    mode: 'original',   // 'original', 'mono', 'aurora', 'ember'
    cw: 0,              // Custom canvas width in CSS px (0 = responsive auto)
    ch: 0,              // Custom canvas height in CSS px (0 = responsive auto)
    fit: 'contain'      // 'contain', 'cover', 'stretch'
  };

  const P = { ...DEF };

  // --- Tools Registry for Horizontal Carousel ---
  // actionType: 0 = live variable update, 1 = debounced resample init(true), 2 = recolor(), 3 = setDust()
  const TOOLS = [
    {
      id: 'size',
      name: 'Size',
      key: 'size',
      min: 0.8,
      max: 5.0,
      step: 0.1,
      action: 0,
      icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>'
    },
    {
      id: 'spacing',
      name: 'Density',
      key: 'spacing',
      min: 2.5,
      max: 8.0,
      step: 0.5,
      action: 1,
      icon: '<svg viewBox="0 0 24 24"><circle cx="6" cy="6" r="2" fill="currentColor"/><circle cx="12" cy="6" r="2" fill="currentColor"/><circle cx="18" cy="6" r="2" fill="currentColor"/><circle cx="6" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="18" cy="12" r="2" fill="currentColor"/><circle cx="6" cy="18" r="2" fill="currentColor"/><circle cx="12" cy="18" r="2" fill="currentColor"/><circle cx="18" cy="18" r="2" fill="currentColor"/></svg>'
    },
    {
      id: 'radius',
      name: 'Radius',
      key: 'radius',
      min: 15,
      max: 160,
      step: 1,
      action: 0,
      icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="1" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="1" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="23" y2="12"/></svg>'
    },
    {
      id: 'soft',
      name: 'Softness',
      key: 'soft',
      min: 0.0,
      max: 1.0,
      step: 0.05,
      action: 0,
      icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke-dasharray="3 3"/><circle cx="12" cy="12" r="4"/></svg>'
    },
    {
      id: 'lift',
      name: 'Lift',
      key: 'lift',
      min: 0.2,
      max: 3.0,
      step: 0.1,
      action: 0,
      icon: '<svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/><line x1="12" y1="9" x2="12" y2="21"/></svg>'
    },
    {
      id: 'speed',
      name: 'Speed',
      key: 'speed',
      min: 0.3,
      max: 3.0,
      step: 0.1,
      action: 0,
      icon: '<svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>'
    },
    {
      id: 'jitter',
      name: 'Jitter',
      key: 'jitter',
      min: 0.0,
      max: 3.0,
      step: 0.1,
      action: 0,
      icon: '<svg viewBox="0 0 24 24"><polyline points="2 12 6 8 10 16 14 9 18 14 22 12"/></svg>'
    },
    {
      id: 'shimmer',
      name: 'Shimmer',
      key: 'shimmer',
      min: 0.0,
      max: 2.0,
      step: 0.1,
      action: 0,
      icon: '<svg viewBox="0 0 24 24"><path d="M12 2l2.4 5.6L20 10l-4.5 4 1.4 6-4.9-3-4.9 3 1.4-6L4 10l5.6-2.4z"/></svg>'
    },
    {
      id: 'bright',
      name: 'Bright',
      key: 'bright',
      min: 0.5,
      max: 2.0,
      step: 0.05,
      action: 2,
      icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
    },
    {
      id: 'cutoff',
      name: 'Cutoff',
      key: 'cutoff',
      min: 0,
      max: 120,
      step: 1,
      action: 1,
      icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/></svg>'
    },
    {
      id: 'fuzz',
      name: 'Dust',
      key: 'fuzz',
      min: 0.0,
      max: 2.0,
      step: 0.05,
      action: 3,
      icon: '<svg viewBox="0 0 24 24"><circle cx="8" cy="8" r="3"/><circle cx="17" cy="15" r="4"/><circle cx="18" cy="6" r="2"/></svg>'
    },
    {
      id: 'fuzzSize',
      name: 'Dust Size',
      key: 'fuzzSize',
      min: 1.0,
      max: 4.0,
      step: 0.5,
      action: 0,
      icon: '<svg viewBox="0 0 24 24"><circle cx="7" cy="12" r="2"/><circle cx="17" cy="12" r="5"/></svg>'
    },
    {
      id: 'tint',
      name: 'Tint',
      key: 'tint',
      min: 0.0,
      max: 3.0,
      step: 0.1,
      action: 2,
      icon: '<svg viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.67 1.5-1.5 0-.39-.14-.75-.38-1.04-.23-.28-.38-.63-.38-1.04 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-5.52-4.48-9.92-10-9.92z"/><circle cx="12" cy="7" r="1" fill="currentColor"/><circle cx="16" cy="11" r="1" fill="currentColor"/><circle cx="8" cy="12" r="1" fill="currentColor"/></svg>'
    },
    {
      id: 'spread',
      name: 'Contrast',
      key: 'spread',
      min: 0.0,
      max: 2.0,
      step: 0.1,
      action: 2,
      icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 3v18c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/></svg>'
    },
    {
      id: 'palette',
      name: 'Palette',
      type: 'palette',
      icon: '<svg viewBox="0 0 24 24"><path d="M2 12h20M12 2a10 10 0 0 1 10 10M12 22a10 10 0 0 1-10-10"/></svg>'
    },
    {
      id: 'canvas',
      name: 'Canvas',
      type: 'canvas',
      icon: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>'
    },
    {
      id: 'export',
      name: 'Export',
      type: 'export',
      icon: '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
    }
  ];

  let activeToolId = 'size';

  // DOM Elements
  const cv = document.getElementById('canvas') || document.getElementById('c');
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  const panel = document.getElementById('controls') || document.getElementById('panel');
  const emptyState = document.getElementById('empty');
  const hintEl = document.getElementById('hint');
  const fpsEl = document.getElementById('fps-counter');
  const particleInfoEl = document.getElementById('particle-info');
  const resInfoEl = document.getElementById('res-info');
  const msgEl = document.getElementById('export-msg') || document.getElementById('xm');
  const renderActionsBar = document.getElementById('render-actions-bar');
  const motivateBanner = document.getElementById('motivate-banner');

  // Simulation state variables
  let W = 0, H = 0, dpr = 1;
  let n = 0; // Total active particles
  let hx, hy, ox, oy, al, sd, qq, vv, dl, en;
  let r0, g0, b0, cr, cg, cb;
  let buf, imgd, ds = 2;
  let raf = null, fr = 0;
  let mx = -1e9, my = -1e9, sx = -1e9, sy = -1e9;
  let DN = 0, DNmax = 0, dX, dY, dVX, dVY, dP;
  let resampleTimer = null;
  let isRecording = false;

  // FPS calculation
  let lastTime = performance.now();
  let frameCount = 0;
  let currentFps = 60;

  // Source Image & Default Path
  const DEFAULT_IMAGE_PATH = 'default.jpg';
  const im = new Image();
  im.crossOrigin = 'anonymous';
  im.onload = () => {
    if (emptyState) emptyState.style.display = 'none';
    init(false);
  };
  im.onerror = () => {
    console.warn('Default image could not be loaded, falling back to procedural portrait.');
    im.src = createDemoPortrait();
  };

  // --- Utility Functions ---

  function showMsg(text, isError = false) {
    if (!msgEl) return;
    msgEl.textContent = text;
    msgEl.style.color = isError ? '#ff6b6b' : '#00d4aa';
    clearTimeout(msgEl._timer);
    msgEl._timer = setTimeout(() => {
      msgEl.textContent = '';
    }, 4500);
  }

  function showRenderedActions() {
    if (renderActionsBar) {
      renderActionsBar.classList.remove('hidden');
    }
  }

  function hsl(h, s, l) {
    const a = s * Math.min(l, 1 - l);
    const f = kNum => {
      const k = (kNum + h / 30) % 12;
      return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };
    return [f(0) * 255, f(8) * 255, f(4) * 255];
  }

  // Detect uniform light/colored backdrop so arbitrary photo backgrounds are removed cleanly
  function bgEst(d) {
    let r = 0, g = 0, b = 0, count = 0;
    const L = [];
    const addSample = (x, y) => {
      const k = (y * W + x) * 4;
      if (d[k + 3] < 200) return;
      r += d[k];
      g += d[k + 1];
      b += d[k + 2];
      count++;
      L.push(0.3 * d[k] + 0.59 * d[k + 1] + 0.11 * d[k + 2]);
    };

    for (let x = 0; x < W; x += 7) {
      addSample(x, 0);
      addSample(x, H - 1);
    }
    for (let y = 0; y < H; y += 7) {
      addSample(0, y);
      addSample(W - 1, y);
    }

    if (count < 10) return null;
    r /= count;
    g /= count;
    b /= count;
    const mean = L.reduce((acc, c) => acc + c, 0) / count;
    const stdDev = Math.sqrt(L.reduce((acc, c) => acc + (c - mean) * (c - mean), 0) / count);
    return stdDev < 30 && mean >= 40 ? [r, g, b] : null;
  }

  // --- Recolor Function ---
  function recolor() {
    if (!n) return;
    const ta = P.tint;
    const a1 = 0.14 * ta;
    const a2 = a1 + 0.1 * ta;
    const a3 = a2 + 0.06 * ta;
    const a4 = a3 + 0.05 * ta;
    const br = P.bright;

    for (let i = 0; i < n; i++) {
      let r = r0[i], g = g0[i], b = b0[i];
      const l = 0.3 * r + 0.59 * g + 0.11 * b;

      if (P.mode === 'mono') {
        r = g = b = l;
      } else if (P.mode === 'cyber') {
        const c = hsl((l > 120 ? 180 : 305) + (hx[i] / W) * 50, 0.95, 0.15 + 0.65 * (l / 255));
        r = c[0];
        g = c[1];
        b = c[2];
      } else if (P.mode === 'matrix') {
        r = l * 0.12;
        g = Math.min(255, l * 1.55);
        b = l * 0.22;
      } else if (P.mode === 'sepia') {
        r = Math.min(255, l * 1.26);
        g = Math.min(255, l * 0.98);
        b = Math.min(255, l * 0.68);
      } else if (P.mode === 'ember') {
        r = l * 1.9;
        g = Math.max(0, l * 1.5 - 60);
        b = Math.max(0, l * 1.2 - 170);
      } else if (P.mode === 'aurora') {
        const c = hsl((hx[i] / W * 260 + (1 - hy[i] / H) * 80 + 190) % 360, 0.85, 0.25 + 0.5 * l / 255);
        r = c[0];
        g = c[1];
        b = c[2];
      }

      let tr = 1, tg = 1, tb = 1;
      const q = qq[i];
      if (P.mode === 'original') {
        if (q < a1) {
          tr = 0.7; tg = 0.9; tb = 1.2;
        } else if (q < a2) {
          tr = 1.2; tg = 0.92; tb = 0.68;
        } else if (q < a3) {
          tr = 1.12; tg = 0.72; tb = 1.15;
        } else if (q < a4) {
          tr = 0.72; tg = 1.12; tb = 0.95;
        }
      }

      const v = 1 + (vv[i] - 0.5) * 0.5 * P.spread;
      cr[i] = Math.min(255, r * br * v * tr);
      cg[i] = Math.min(255, g * br * v * tg);
      cb[i] = Math.min(255, b * br * v * tb);
    }
  }

  function setDust() {
    DN = Math.min(DNmax, Math.round(DNmax / 2 * P.fuzz));
  }

  // --- Initialization & Resampling ---
  function init(skipEntrance = false) {
    if (!im.naturalWidth) return;

    if (emptyState) emptyState.style.display = 'none';
    cancelAnimationFrame(raf);
    fr = skipEntrance ? 400 : 0;

    // Mobile optimization: clamp DPR to 1.5 on mobile to keep solid 60 FPS
    const isMobile = window.innerWidth < 768;
    dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);

    const custom = P.cw > 0 && P.ch > 0;
    let w, h;
    if (custom) {
      w = P.cw;
      h = P.ch;
    } else {
      const ar = im.width / im.height;
      h = window.innerHeight;
      w = h * ar;
      if (w > window.innerWidth) {
        w = window.innerWidth;
        h = w / ar;
      }
    }

    dpr = Math.min(dpr, 4096 / Math.max(w, h));
    cv.style.width = Math.round(w) + 'px';
    cv.style.height = Math.round(h) + 'px';
    W = cv.width = Math.round(w * dpr);
    H = cv.height = Math.round(h * dpr);

    if (resInfoEl) {
      resInfoEl.textContent = `${W} × ${H} (${Math.round(w)} × ${Math.round(h)} CSS)`;
    }

    const cwInput = document.getElementById('cw');
    const chInput = document.getElementById('ch');
    if (cwInput) cwInput.placeholder = Math.round(w);
    if (chInput) chInput.placeholder = Math.round(h);

    // Offscreen sampling canvas
    const o = document.createElement('canvas');
    o.width = W;
    o.height = H;
    const oc = o.getContext('2d', { willReadFrequently: true });

    if (custom && P.fit !== 'stretch') {
      const k = P.fit === 'cover'
        ? Math.max(W / im.width, H / im.height)
        : Math.min(W / im.width, H / im.height);
      const dw = im.width * k;
      const dh = im.height * k;
      oc.drawImage(im, (W - dw) / 2, (H - dh) / 2, dw, dh);
    } else {
      oc.drawImage(im, 0, 0, W, H);
    }

    const imgData = oc.getImageData(0, 0, W, H);
    const d = imgData.data;
    const step = Math.max(2, Math.round(P.spacing * dpr), Math.ceil(Math.sqrt(W * H / 160000)));
    const maxParticles = Math.ceil(W / step) * Math.ceil(H / step);

    const F = () => new Float32Array(maxParticles);
    const U = () => new Uint8Array(maxParticles);

    hx = F(); hy = F(); ox = F(); oy = F(); al = F(); sd = F(); dl = F(); qq = F(); vv = F();
    en = U(); r0 = U(); g0 = U(); b0 = U(); cr = U(); cg = U(); cb = U();
    n = 0;

    const bgc = P.auto ? bgEst(d) : null;

    for (let y = 0; y < H - 4; y += step) {
      for (let x = 0; x < W - 4; x += step) {
        const k = (y * W + x) * 4;
        const r = d[k];
        const g = d[k + 1];
        const b = d[k + 2];
        const l = 0.3 * r + 0.59 * g + 0.11 * b;

        if (d[k + 3] < 40) continue;

        if (bgc) {
          const e0 = r - bgc[0], e1 = g - bgc[1], e2 = b - bgc[2];
          if (e0 * e0 + e1 * e1 + e2 * e2 < 1800) continue;
        } else if (l < P.cutoff) {
          continue;
        }

        hx[n] = x;
        hy[n] = y;
        r0[n] = r;
        g0[n] = g;
        b0[n] = b;
        sd[n] = Math.random();
        qq[n] = Math.random();
        vv[n] = Math.random();

        if (skipEntrance) {
          al[n] = 1;
        } else {
          // Entrance stagger: scatter randomly, assemble top to bottom
          ox[n] = (Math.random() - 0.5) * W * 0.9;
          oy[n] = (Math.random() - 0.5) * H * 0.8 + H * 0.12;
          dl[n] = (y / H) * 80 + Math.random() * 50;
          en[n] = 1;
        }
        n++;
      }
    }

    recolor();

    // Ambient floating dust
    DNmax = Math.min(2200, Math.round(W * H / (dpr * dpr) / 450 * 2));
    setDust();
    dX = new Float32Array(DNmax);
    dY = new Float32Array(DNmax);
    dVX = new Float32Array(DNmax);
    dVY = new Float32Array(DNmax);
    dP = new Float32Array(DNmax);

    for (let j = 0; j < DNmax; j++) {
      dX[j] = Math.random() * (W - 4);
      dY[j] = Math.random() * (H - 4);
      dP[j] = Math.random() * 6.28;
    }

    buf = new Uint32Array(W * H);
    imgd = new ImageData(new Uint8ClampedArray(buf.buffer), W, H);

    if (particleInfoEl) {
      particleInfoEl.textContent = `Particles: ${n.toLocaleString()}`;
    }

    // Reveal floating action buttons once rendered
    showRenderedActions();

    loop();
  }

  // --- Main Animation Loop ---
  function loop(t = 0) {
    fr++;

    // FPS Meter
    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 500) {
      currentFps = Math.round((frameCount * 1000) / (now - lastTime));
      if (fpsEl) fpsEl.textContent = `FPS: ${currentFps}`;
      frameCount = 0;
      lastTime = now;
    }

    // Cursor smoothing
    if (mx < -1e8) {
      sx = sy = -1e9;
    } else if (sx < -1e8) {
      sx = mx; sy = my;
    } else {
      sx += (mx - sx) * 0.12;
      sy += (my - sy) * 0.12;
    }

    const K = dpr;
    const sp = P.speed;
    const R = P.radius * K;
    const RO = R * (1 + 0.6 * P.soft);
    const RO2 = RO * RO;
    const kk = 1 + (1 - P.soft) * 1.6;
    const ca = Math.cos(0.05), sa = Math.sin(0.05);
    ds = Math.max(1, Math.round(P.size * K));
    const shA = 0.2 * P.shimmer;
    const shB = 1 - shA;
    const lift = 90 * K * P.lift;

    // Fast clear to 32-bit black ABGR
    buf.fill(0xff000000);

    // Particle dynamics
    for (let i = 0; i < n; i++) {
      if (fr < dl[i]) continue;
      const s = sd[i];
      const dx = hx[i] - sx;
      const dy = hy[i] - sy;
      let X = ox[i], Y = oy[i], a = al[i];
      let f = 0;
      const dd = dx * dx + dy * dy;

      if (dd < RO2) {
        const u = Math.min(1, (1 - Math.sqrt(dd) / RO) * kk);
        f = u * u * (3 - 2 * u); // Smoothstep falloff
      }

      if (f > 0.01) {
        // Cursor hover repulsion & fluid upward lift
        const w = 1 - f;
        const tg = 1 - f;
        const dec = 1 - Math.min(0.5, 0.02 * sp * w);
        Y += (-(lift + s * 160 * K * P.lift) - Y) * Math.min(0.5, 0.018 * sp) * f;
        X += ((s - 0.5) * 60 * K - X) * Math.min(0.5, 0.016 * sp) * f;
        Y *= dec;
        X *= dec;
        a += (tg - a) * Math.min(0.5, (tg < a ? 0.03 : 0.02) * sp);
        if (f > 0.05) en[i] = 0;
      } else if (en[i]) {
        // Spiral entrance condensation
        const g = s > 0.5 ? 1 : -1;
        const nx = X * ca - g * Y * sa;
        const ny = g * X * sa + Y * ca;
        X = nx * 0.955;
        Y = ny * 0.955;
        a += (1 - a) * 0.05;
        if (Math.abs(X) + Math.abs(Y) < 1.5) en[i] = 0;
      } else {
        // Return to home position
        const dec = 1 - Math.min(0.5, 0.02 * sp);
        X *= dec;
        Y *= dec;
        a += (1 - a) * Math.min(0.5, 0.02 * sp);
      }

      ox[i] = X;
      oy[i] = Y;
      al[i] = a;

      if (a < 0.03) continue;

      const fz = (Math.min(3, (Math.abs(X) + Math.abs(Y)) * 0.035) + 0.35) * K * P.jitter;
      const x = (hx[i] + X + (Math.random() - 0.5) * fz) | 0;
      const y = (hy[i] + Y + (Math.random() - 0.5) * fz) | 0;

      if (x < 0 || y < 0 || x > W - ds || y > H - ds) continue;

      const m = a * (shB + shA * Math.sin(t * 0.003 + s * 40));
      // Little-endian ABGR 32-bit packing
      const c = 0xff000000 | ((cb[i] * m | 0) << 16) | ((cg[i] * m | 0) << 8) | (cr[i] * m | 0);

      for (let j = 0; j < ds; j++) {
        const row = (y + j) * W + x;
        for (let k = 0; k < ds; k++) {
          buf[row + k] = c;
        }
      }
    }

    // Drifting ambient dust particles
    const dk = Math.min(1, fr / 150);
    const DR = R * 1.8;
    const z = Math.max(1, Math.round(P.fuzzSize * K * 0.7));

    for (let j = 0; j < DN; j++) {
      let ux = dVX[j] + (Math.random() - 0.5) * 0.09 * K;
      let uy = dVY[j] + (Math.random() - 0.5) * 0.09 * K - 0.004 * K;

      if (sx > -1e8) {
        const ddx = dX[j] - sx, ddy = dY[j] - sy;
        const dd = ddx * ddx + ddy * ddy;
        if (dd < DR * DR) {
          const d = Math.sqrt(dd) + 0.01;
          const f = 1 - d / DR;
          ux += (ddx / d * 0.6 - ddy / d * 0.5) * f * K;
          uy += (ddy / d * 0.6 + ddx / d * 0.5) * f * K;
        }
      }

      ux *= 0.96;
      uy *= 0.96;
      dVX[j] = ux;
      dVY[j] = uy;

      let x = dX[j] + ux;
      let y = dY[j] + uy;

      if (x < 0) x = W - z - 1; else if (x > W - z) x = 0;
      if (y < 0) y = H - z - 1; else if (y > H - z) y = 0;

      dX[j] = x;
      dY[j] = y;

      const l = ((28 + (0.5 + 0.5 * Math.sin(t * 0.004 + dP[j])) * 80) * dk) | 0;
      const hh = dP[j];
      const rr = Math.min(255, l * (0.85 + 0.3 * Math.cos(hh)) | 0);
      const bb = Math.min(255, l * (0.85 + 0.3 * Math.sin(hh)) | 0);
      const c = 0xff000000 | (bb << 16) | (l << 8) | rr;
      const px = x | 0, py = y | 0;

      for (let q = 0; q < z; q++) {
        const row = (py + q) * W + px;
        for (let k = 0; k < z; k++) {
          buf[row + k] = c;
        }
      }
    }

    ctx.putImageData(imgd, 0, 0);
    raf = requestAnimationFrame(loop);
  }

  // --- Apply Settings Changes ---
  function applyAction(actionType) {
    if (actionType === 1) {
      clearTimeout(resampleTimer);
      resampleTimer = setTimeout(() => init(true), 140);
    } else if (actionType === 2) {
      recolor();
    } else if (actionType === 3) {
      setDust();
    }
  }

  // --- File Loading ---
  function loadFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      showMsg('Please drop or select a valid image file', true);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      im.src = reader.result;
      showMsg(`Loaded ${file.name}`);
      if (motivateBanner) motivateBanner.classList.add('dismissed');
    };
    reader.readAsDataURL(file);
  }

  // --- High-Quality Built-in Demo Portrait Generator ---
  function createDemoPortrait() {
    const sw = 800, sh = 1000;
    const canvas = document.createElement('canvas');
    canvas.width = sw;
    canvas.height = sh;
    const c = canvas.getContext('2d');

    // Deep gradient background with soft studio vignette
    const bgGrad = c.createRadialGradient(sw * 0.5, sh * 0.45, 80, sw * 0.5, sh * 0.5, 600);
    bgGrad.addColorStop(0, '#1a1829');
    bgGrad.addColorStop(0.5, '#0c0a14');
    bgGrad.addColorStop(1, '#000000');
    c.fillStyle = bgGrad;
    c.fillRect(0, 0, sw, sh);

    c.save();
    c.translate(sw * 0.5, sh * 0.48);

    // Glowing rim light behind head
    const aura = c.createRadialGradient(0, -60, 50, 0, -60, 260);
    aura.addColorStop(0, 'rgba(0, 212, 170, 0.28)');
    aura.addColorStop(0.6, 'rgba(126, 231, 255, 0.12)');
    aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
    c.fillStyle = aura;
    c.beginPath();
    c.arc(0, -60, 260, 0, Math.PI * 2);
    c.fill();

    // Shoulders & Chest
    c.fillStyle = '#222633';
    c.beginPath();
    c.moveTo(-240, 420);
    c.quadraticCurveTo(-140, 230, -75, 170);
    c.lineTo(75, 170);
    c.quadraticCurveTo(140, 230, 240, 420);
    c.closePath();
    c.fill();

    // Neck
    const neckGrad = c.createLinearGradient(0, 70, 0, 180);
    neckGrad.addColorStop(0, '#d9a679');
    neckGrad.addColorStop(1, '#8c593b');
    c.fillStyle = neckGrad;
    c.beginPath();
    c.moveTo(-45, 70);
    c.lineTo(45, 70);
    c.lineTo(55, 180);
    c.lineTo(-55, 180);
    c.closePath();
    c.fill();

    // Head / Face Base Shape
    const faceGrad = c.createRadialGradient(20, -50, 30, 0, -30, 190);
    faceGrad.addColorStop(0, '#f7cca0');
    faceGrad.addColorStop(0.5, '#e0a977');
    faceGrad.addColorStop(0.85, '#a3633d');
    faceGrad.addColorStop(1, '#5e321e');
    c.fillStyle = faceGrad;
    c.beginPath();
    c.moveTo(-105, -90);
    c.bezierCurveTo(-110, 40, -60, 140, 0, 145);
    c.bezierCurveTo(60, 140, 110, 40, 105, -90);
    c.bezierCurveTo(105, -200, -105, -200, -105, -90);
    c.closePath();
    c.fill();

    // Facial Features - Shading, Cheekbones & Nose
    c.strokeStyle = 'rgba(74, 38, 20, 0.45)';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(0, -30);
    c.lineTo(8, 25);
    c.lineTo(-6, 35);
    c.stroke();

    // Lips
    c.fillStyle = '#c85a53';
    c.beginPath();
    c.moveTo(-24, 70);
    c.quadraticCurveTo(0, 62, 24, 70);
    c.quadraticCurveTo(0, 85, -24, 70);
    c.fill();

    // Eyes & Eyebrows
    const drawEye = (x, flip) => {
      c.save();
      c.translate(x, -25);
      if (flip) c.scale(-1, 1);
      // Eyebrow
      c.strokeStyle = '#2b170e';
      c.lineWidth = 5;
      c.beginPath();
      c.moveTo(-35, -22);
      c.quadraticCurveTo(-10, -32, 28, -20);
      c.stroke();
      // Eye
      c.fillStyle = '#fbf5ee';
      c.beginPath();
      c.moveTo(-28, 0);
      c.quadraticCurveTo(0, -14, 28, 0);
      c.quadraticCurveTo(0, 14, -28, 0);
      c.fill();
      // Iris & Pupil
      const iris = c.createRadialGradient(2, 0, 2, 2, 0, 9);
      iris.addColorStop(0, '#7ee7ff');
      iris.addColorStop(0.6, '#009688');
      iris.addColorStop(1, '#0e2b27');
      c.fillStyle = iris;
      c.beginPath();
      c.arc(2, 0, 9, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#060a09';
      c.beginPath();
      c.arc(2, 0, 4.5, 0, Math.PI * 2);
      c.fill();
      // Catchlight
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.arc(0, -3, 2.5, 0, Math.PI * 2);
      c.fill();
      c.restore();
    };
    drawEye(-42, false);
    drawEye(42, true);

    // Sculptural Hair with Radiant Cyan/Gold Highlights
    c.fillStyle = '#18141e';
    c.beginPath();
    c.moveTo(-115, -60);
    c.bezierCurveTo(-150, -180, -70, -250, 0, -245);
    c.bezierCurveTo(90, -250, 160, -170, 125, -50);
    c.bezierCurveTo(100, -140, 40, -180, -20, -180);
    c.bezierCurveTo(-70, -180, -95, -120, -115, -60);
    c.closePath();
    c.fill();

    // Hair luminous highlights
    c.strokeStyle = '#00d4aa';
    c.lineWidth = 4;
    c.beginPath();
    c.moveTo(-100, -140);
    c.quadraticCurveTo(0, -230, 95, -150);
    c.stroke();

    c.strokeStyle = '#ffb300';
    c.lineWidth = 2.5;
    c.beginPath();
    c.moveTo(-80, -165);
    c.quadraticCurveTo(10, -215, 80, -170);
    c.stroke();

    c.restore();
    return canvas.toDataURL('image/png');
  }

  // --- Save / Export Helper ---
  async function saveFile(filename, data) {
    try {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(data instanceof Blob ? data : new Blob([data]));
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showMsg(`Exported ${filename}`);
    } catch (err) {
      showMsg(`Export failed: ${err.message || err}`, true);
    }
  }

  // --- Export PNG ---
  async function exportPNG(isTransparent = false) {
    if (!buf) {
      showMsg('Please load an image first', true);
      return;
    }
    let srcCanvas = cv;

    if (isTransparent) {
      // Unpremultiply: brightest channel maps to alpha for clean transparency
      const tCanvas = document.createElement('canvas');
      tCanvas.width = W;
      tCanvas.height = H;
      const tCtx = tCanvas.getContext('2d');
      const imgData = tCtx.createImageData(W, H);
      const outBuf = new Uint32Array(imgData.data.buffer);

      for (let i = 0; i < buf.length; i++) {
        const c = buf[i];
        const r = c & 255;
        const g = (c >> 8) & 255;
        const b = (c >> 16) & 255;
        const m = Math.max(r, g, b);
        if (!m) {
          outBuf[i] = 0;
          continue;
        }
        const scale = 255 / m;
        outBuf[i] = ((m << 24) | (((b * scale) | 0) << 16) | (((g * scale) | 0) << 8) | ((r * scale) | 0)) >>> 0;
      }
      tCtx.putImageData(imgData, 0, 0);
      srcCanvas = tCanvas;
    }

    const blob = await new Promise(resolve => srcCanvas.toBlob(resolve, 'image/png'));
    saveFile('particle-portrait.png', blob);
  }

  // --- Export WebM Video Recording ---
  async function recordVideo(seconds = 6, includeEntrance = true) {
    if (isRecording) return;
    if (!buf) {
      showMsg('Please load an image first', true);
      return;
    }

    const mime = window.MediaRecorder && cv.captureStream
      ? ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find(m => MediaRecorder.isTypeSupported(m))
      : null;

    if (!mime) {
      showMsg('WebM video recording is not supported in this browser', true);
      return;
    }

    const duration = Math.max(2, Math.min(30, seconds));
    if (includeEntrance) {
      init(false);
    }

    const stream = cv.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: mime,
      videoBitsPerSecond: 8000000
    });
    const chunks = [];

    mediaRecorder.ondataavailable = e => {
      if (e.data.size) chunks.push(e.data);
    };

    const completionPromise = new Promise(resolve => {
      mediaRecorder.onstop = resolve;
    });

    isRecording = true;
    mediaRecorder.start(250);

    let remaining = duration;
    showMsg(`Recording video... ${remaining}s (move your cursor!)`);
    const interval = setInterval(() => {
      remaining--;
      if (remaining > 0) {
        showMsg(`Recording video... ${remaining}s (move your cursor!)`);
      }
    }, 1000);

    setTimeout(() => {
      mediaRecorder.stop();
    }, duration * 1000);

    await completionPromise;
    clearInterval(interval);
    isRecording = false;

    saveFile('particle-portrait.webm', new Blob(chunks, { type: 'video/webm' }));
  }

  // --- Export Settings JSON ---
  function exportSettings() {
    const jsonStr = JSON.stringify(P, null, 2);
    saveFile('particle-settings.json', new Blob([jsonStr], { type: 'application/json' }));
  }

  // --- Bind UI Controls & Horizontal Tool Carousel ---
  function setupControls() {
    const labelEl = document.getElementById('active-tool-label');
    const valEl = document.getElementById('active-tool-value');
    const sliderView = document.getElementById('tool-slider-view');
    const paletteView = document.getElementById('tool-palette-view');
    const canvasView = document.getElementById('tool-canvas-view');
    const exportView = document.getElementById('tool-export-view');
    const activeSlider = document.getElementById('active-slider');
    const sliderMinEl = document.getElementById('active-slider-min');
    const sliderMaxEl = document.getElementById('active-slider-max');
    const carouselEl = document.getElementById('tools-carousel');

    function syncPaletteChips() {
      document.querySelectorAll('.palette-chips .chip-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === P.mode);
      });
    }

    function setActiveTool(toolId) {
      const tool = TOOLS.find(t => t.id === toolId);
      if (!tool) return;
      activeToolId = toolId;

      // Update active state in carousel
      document.querySelectorAll('.carousel-tool').forEach(btn => {
        const isMatch = btn.dataset.toolId === toolId;
        btn.classList.toggle('active', isMatch);
        if (isMatch) {
          btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      });

      // Switch views
      if (sliderView) sliderView.classList.remove('active');
      if (paletteView) paletteView.classList.remove('active');
      if (canvasView) canvasView.classList.remove('active');
      if (exportView) exportView.classList.remove('active');

      if (tool.type === 'palette') {
        if (labelEl) labelEl.textContent = 'Palette Mode';
        if (valEl) valEl.textContent = P.mode.toUpperCase();
        if (paletteView) paletteView.classList.add('active');
        syncPaletteChips();
      } else if (tool.type === 'canvas') {
        if (labelEl) labelEl.textContent = 'Canvas & Fit';
        if (valEl) valEl.textContent = (P.cw && P.ch) ? `${P.cw} × ${P.ch}` : 'Auto';
        if (canvasView) canvasView.classList.add('active');
      } else if (tool.type === 'export') {
        if (labelEl) labelEl.textContent = 'Export Portrait';
        if (valEl) valEl.textContent = 'PNG / Video / JSON';
        if (exportView) exportView.classList.add('active');
      } else {
        // Universal slider tool
        if (labelEl) labelEl.textContent = tool.name;
        if (valEl) valEl.textContent = P[tool.key];
        if (sliderView) sliderView.classList.add('active');

        if (activeSlider) {
          activeSlider.min = tool.min;
          activeSlider.max = tool.max;
          activeSlider.step = tool.step;
          activeSlider.value = P[tool.key];
        }
        if (sliderMinEl) sliderMinEl.textContent = tool.min;
        if (sliderMaxEl) sliderMaxEl.textContent = tool.max;
      }
    }

    // Build the horizontal carousel dynamically
    if (carouselEl) {
      carouselEl.innerHTML = '';
      TOOLS.forEach(tool => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `carousel-tool ${tool.id === activeToolId ? 'active' : ''}`;
        btn.dataset.toolId = tool.id;
        btn.setAttribute('aria-label', tool.name);
        btn.innerHTML = `
          <span class="carousel-tool-icon">${tool.icon}</span>
          <span class="carousel-tool-name">${tool.name}</span>
        `;
        btn.addEventListener('click', () => {
          setActiveTool(tool.id);
        });
        carouselEl.appendChild(btn);
      });
    }

    // Active Slider Input Listener
    if (activeSlider) {
      activeSlider.addEventListener('input', () => {
        const tool = TOOLS.find(t => t.id === activeToolId);
        if (!tool || !tool.key) return;
        P[tool.key] = parseFloat(activeSlider.value);
        if (valEl) valEl.textContent = P[tool.key];
        applyAction(tool.action);
      });
    }

    // Palette Chips Listener
    document.querySelectorAll('.palette-chips .chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        P.mode = btn.dataset.mode;
        syncPaletteChips();
        if (valEl) valEl.textContent = P.mode.toUpperCase();
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        recolor();
      });
    });

    // Canvas & Fit Controls
    const cwInput = document.getElementById('cw');
    const chInput = document.getElementById('ch');
    const fitSelect = document.getElementById('fit');
    const autoSizeBtn = document.getElementById('auto-size');

    const handleCanvasDimensionChange = () => {
      const w = cwInput ? parseInt(cwInput.value, 10) || 0 : 0;
      const h = chInput ? parseInt(chInput.value, 10) || 0 : 0;
      if (w >= 100 && h >= 100) {
        P.cw = Math.min(3000, w);
        P.ch = Math.min(3000, h);
      } else {
        P.cw = P.ch = 0;
      }
      if (valEl && activeToolId === 'canvas') {
        valEl.textContent = (P.cw && P.ch) ? `${P.cw} × ${P.ch}` : 'Auto';
      }
      applyAction(1);
    };

    if (cwInput) cwInput.addEventListener('change', handleCanvasDimensionChange);
    if (chInput) chInput.addEventListener('change', handleCanvasDimensionChange);
    if (fitSelect) {
      fitSelect.value = P.fit;
      fitSelect.addEventListener('change', () => {
        P.fit = fitSelect.value;
        applyAction(1);
      });
    }
    if (autoSizeBtn) {
      autoSizeBtn.addEventListener('click', () => {
        P.cw = P.ch = 0;
        if (cwInput) cwInput.value = '';
        if (chInput) chInput.value = '';
        if (valEl && activeToolId === 'canvas') valEl.textContent = 'Auto';
        init(true);
      });
    }

    // Export & Share Handlers
    const exportPngBtn = document.getElementById('export-png-btn');
    const transCheckbox = document.getElementById('transparent-png');
    if (exportPngBtn) {
      exportPngBtn.addEventListener('click', () => {
        exportPNG(transCheckbox ? transCheckbox.checked : false);
      });
    }

    const exportWebmBtn = document.getElementById('export-webm-btn');
    if (exportWebmBtn) {
      exportWebmBtn.addEventListener('click', () => {
        recordVideo(6, true);
      });
    }

    const exportJsonBtn = document.getElementById('export-settings-btn');
    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', exportSettings);
    }

    // Reset All Settings Button (Working with Visual Explosion & Reassembly)
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        Object.assign(P, DEF);
        P.cw = 0;
        P.ch = 0;
        P.fit = 'contain';
        P.mode = 'original';

        if (cwInput) cwInput.value = '';
        if (chInput) chInput.value = '';
        if (fitSelect) fitSelect.value = 'contain';

        syncPaletteChips();
        setActiveTool(activeToolId);

        recolor();
        setDust();
        init(false); // Triggers full visual scatter & reassembly animation!
        showMsg('Settings reset to default');
      });
    }

    // Replay Animation Button in bottom actions bar
    const quickReplayBtn = document.getElementById('quick-replay-btn');
    if (quickReplayBtn) {
      quickReplayBtn.addEventListener('click', () => init(false));
    }

    const quickSaveBtn = document.getElementById('quick-save-btn');
    if (quickSaveBtn) {
      quickSaveBtn.addEventListener('click', () => {
        const trans = transCheckbox ? transCheckbox.checked : false;
        exportPNG(trans);
      });
    }

    // Customize Console Open / Close Handlers (No dark overlay: Canvas stays 100% visible)
    const closePanelBtn = document.getElementById('close-panel-btn');
    const quickCustomizeBtn = document.getElementById('quick-customize-btn');

    function openConsole() {
      if (panel) {
        panel.classList.remove('collapsed');
        panel.classList.add('open');
      }
      if (quickCustomizeBtn) quickCustomizeBtn.setAttribute('aria-expanded', 'true');
    }

    function closeConsole() {
      if (panel) {
        panel.classList.add('collapsed');
        panel.classList.remove('open');
      }
      if (quickCustomizeBtn) quickCustomizeBtn.setAttribute('aria-expanded', 'false');
    }

    if (quickCustomizeBtn) {
      quickCustomizeBtn.addEventListener('click', e => {
        e.stopPropagation();
        if (panel && !panel.classList.contains('collapsed')) {
          closeConsole();
        } else {
          openConsole();
        }
      });
    }

    if (closePanelBtn) {
      closePanelBtn.addEventListener('click', closeConsole);
    }

    // File Input Handlers
    document.querySelectorAll('input[type="file"]').forEach(inp => {
      inp.addEventListener('change', e => {
        if (e.target.files && e.target.files[0]) {
          loadFile(e.target.files[0]);
        }
      });
    });

    // Set initial tool view
    setActiveTool('size');
  }

  // --- Pointer & Input Event Listeners ---
  function setupInputEvents() {
    const isUIElement = el => el && el.closest && el.closest('#controls, #panel, .panel, .app-header, .render-actions-bar, .motivate-banner, button, input, select, label');

    const handlePointerMove = e => {
      if (isUIElement(e.target)) {
        mx = my = -1e9;
        return;
      }
      const rect = cv.getBoundingClientRect();
      mx = (e.clientX - rect.left) * dpr;
      my = (e.clientY - rect.top) * dpr;
      if (hintEl) hintEl.style.opacity = '0';
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerdown', handlePointerMove);

    document.addEventListener('mouseleave', () => {
      mx = my = -1e9;
    });

    window.addEventListener('pointerup', e => {
      if (e.pointerType === 'touch') {
        mx = my = -1e9;
      }
    });

    // Direct, buttery-smooth mobile touch listeners (no gesture delay, no scroll bounce)
    const handleTouch = e => {
      if (isUIElement(e.target)) return;
      if (e.touches && e.touches.length > 0) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = cv.getBoundingClientRect();
        mx = (touch.clientX - rect.left) * dpr;
        my = (touch.clientY - rect.top) * dpr;
        if (hintEl) hintEl.style.opacity = '0';
      }
    };

    const handleTouchEnd = e => {
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = cv.getBoundingClientRect();
        mx = (touch.clientX - rect.left) * dpr;
        my = (touch.clientY - rect.top) * dpr;
      } else {
        mx = my = -1e9;
      }
    };

    cv.addEventListener('touchstart', handleTouch, { passive: false });
    cv.addEventListener('touchmove', handleTouch, { passive: false });
    cv.addEventListener('touchend', handleTouchEnd, { passive: false });
    cv.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    // Drag and Drop
    window.addEventListener('dragover', e => {
      e.preventDefault();
      document.body.classList.add('drag');
    });

    window.addEventListener('dragleave', e => {
      if (!e.relatedTarget) {
        document.body.classList.remove('drag');
      }
    });

    window.addEventListener('drop', e => {
      e.preventDefault();
      document.body.classList.remove('drag');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        loadFile(e.dataTransfer.files[0]);
      }
    });

    // Clipboard Paste
    window.addEventListener('paste', e => {
      if (!e.clipboardData || !e.clipboardData.items) return;
      for (const item of e.clipboardData.items) {
        if (item.type.startsWith('image/')) {
          loadFile(item.getAsFile());
          break;
        }
      }
    });

    // Debounced Resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (im.naturalWidth) init(true);
      }, 200);
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        init(false); // Replay entrance
      } else if (e.key === 'c' || e.key === 'C') {
        const custBtn = document.getElementById('quick-customize-btn');
        if (custBtn) custBtn.click();
      } else if (e.key === 'Escape') {
        const closeBtn = document.getElementById('close-panel-btn');
        if (closeBtn) closeBtn.click();
      }
    });
  }

  // --- Bootstrap ---
  function start() {
    setupControls();
    setupInputEvents();

    // Load initial default image with graceful procedural fallback
    im.src = DEFAULT_IMAGE_PATH;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
