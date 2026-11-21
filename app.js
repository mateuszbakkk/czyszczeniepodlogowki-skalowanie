/* Mapa potencjału skalowania · czyszczeniepodlogowki.pl
   Statyczna aplikacja (GitHub Pages). Dane: GUS BDL i NSP 2021, przeliczone w potencjal.json.
   Oznaczenia, bazy i założenia trzymamy w localStorage przeglądarki (oraz w linku do skopiowania). */
(function () {
  'use strict';

  // ---------------------------------------------------------------- stałe
  const Y0 = 1995;
  const NOW = 2026;
  const STORE_KEY = 'cp-skalowanie-v1';
  const RAMP = ['#80b3fe', '#569bff', '#1b81ff', '#0f62cc', '#014da9', '#123b7a'];
  const COL_ELIGIBLE = '#0f62cc';
  const COL_YOUNG = '#80b3fe';
  const PL_BOUNDS = [[49.0, 14.1], [54.85, 24.15]];

  const ICON = {
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" fill="currentColor"/></svg>',
    flask: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/></svg>',
    dash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.6a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2z" fill="currentColor"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
    target: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="12" cy="12" r="2.6" fill="currentColor"/></svg>',
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.2L12 4l9 7.2V20a1 1 0 0 1-1 1h-5.5v-6h-5v6H4a1 1 0 0 1-1-1z" fill="currentColor"/></svg>',
    coins: '<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="6" rx="7" ry="3" fill="currentColor"/><path d="M5 9.5c0 1.7 3.1 3 7 3s7-1.3 7-3V12c0 1.7-3.1 3-7 3s-7-1.3-7-3zm0 5c0 1.7 3.1 3 7 3s7-1.3 7-3V17c0 1.7-3.1 3-7 3s-7-1.3-7-3z" fill="currentColor"/></svg>',
    users: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.6" fill="currentColor"/><path d="M2.5 20c.6-3.8 3.2-6 6.5-6s5.9 2.2 6.5 6z" fill="currentColor"/><circle cx="17" cy="9" r="2.8" fill="currentColor"/><path d="M15.8 13.4c3 .2 5.2 2.3 5.7 5.6h-4.3c-.3-2-1-3.9-1.4-5.6z" fill="currentColor"/></svg>',
    wrench: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    headset: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    person: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7.6" r="4" fill="currentColor"/><path d="M4 21c.7-4.3 3.9-7 8-7s7.3 2.7 8 7z" fill="currentColor"/></svg>'
  };

  const STATUS = {
    active: { label: 'Działamy', color: '#1baf7a', dash: null, icon: 'check' },
    next: { label: 'Następny', color: '#eda100', dash: null, icon: 'star' },
    test: { label: 'Testujemy', color: '#e87ba4', dash: '9 7', icon: 'flask' },
    later: { label: 'Nie teraz', color: '#8a94a6', dash: '1 7', icon: 'pause' }
  };
  const STATUS_KEYS = ['active', 'next', 'test', 'later'];

  const DEFAULTS = {
    s1995: 5, s2005: 20, s2015: 45, s2025: 75,
    minAge: 8, cycle: 9, retro: 2,
    adopt: 20, share: 30, price: 2200, capacity: 400,
    wPot: 40, wDen: 35, wInc: 15, wDyn: 10,
    calibBase: 'b1', calibOrders: 0
  };

  const METRICS = {
    revenue: { label: 'Potencjał: rynek realny (zł rocznie)', legend: 'Rynek realny, zł rocznie', fmt: (v) => fmtMoney(v) },
    density: { label: 'Gęstość: domy z podłogówką do czyszczenia na 100 km²', legend: 'Domy do czyszczenia na 100 km²', fmt: (v) => fmtInt(v) },
    score: { label: 'Wskaźnik skalowania (0–100)', legend: 'Wskaźnik skalowania (0–100)', fmt: (v) => fmtInt(v) },
    pool: { label: 'Domy z podłogówką w wieku do czyszczenia', legend: 'Domy z podłogówką do czyszczenia', fmt: (v) => fmtCompact(v) },
    pipe: { label: 'Dynamika: młodsze podłogówki, które dojdą do czyszczenia', legend: 'Podłogówki, które dojdą w kolejnych latach', fmt: (v) => fmtCompact(v) },
    hh: { label: 'Gospodarstwa domowe (NSP 2021)', legend: 'Gospodarstwa domowe (NSP 2021)', fmt: (v) => fmtCompact(v) },
    popDen: { label: 'Zaludnienie (osób na km²)', legend: 'Osób na km² (NSP 2021)', fmt: (v) => fmtInt(v) },
    income: { label: 'Dochód na osobę (Polska = 100)', legend: 'Dochód rozporządzalny na osobę, Polska = 100', fmt: (v) => fmtDec(v, 1) }
  };

  // tryb „Model biznesowy” (dokładka, tryb potencjału działa bez zmian)
  const BIZ_DEFAULTS = {
    year: 2026, perDay: 2, days: 21, price: 1900, vat: 8,
    close: 10, cpl: 3, leadsPerRep: 250,
    techCost: 11500, techBonus: 100, jobCost: 150,
    repCost: 9650, repBonus: 100, fee: 450
  };
  const BIZ_METRICS = {
    bTech: { label: 'Ekipy techników (etaty)', legend: 'Ekipy techników (etaty)', fmt: (v) => fmtCrew(v), short: (v) => fmtCrew(v), icon: 'wrench' },
    bProfit: { label: 'Zysk firmy miesięcznie', legend: 'Zysk firmy, zł miesięcznie', fmt: (v) => fmtMoney(v), short: (v) => shortMoney(v), icon: 'coins', signed: true },
    bRev: { label: 'Przychód netto miesięcznie', legend: 'Przychód netto, zł miesięcznie', fmt: (v) => fmtMoney(v), short: (v) => shortMoney(v), icon: 'coins' },
    bJobs: { label: 'Zlecenia miesięcznie', legend: 'Zlecenia miesięcznie', fmt: (v) => fmtDec(v, v < 10 ? 1 : 0), short: (v) => fmtDec(v, v < 10 ? 1 : 0), icon: 'home' },
    bLeads: { label: 'Leady potrzebne miesięcznie', legend: 'Leady potrzebne miesięcznie', fmt: (v) => fmtInt(v), short: (v) => fmtCompact(v), icon: 'target' },
    bReps: { label: 'Opiekunowie klienta (etaty)', legend: 'Opiekunowie klienta (etaty)', fmt: (v) => fmtDec(v, 1), short: (v) => fmtDec(v, 1), icon: 'headset' },
    bAds: { label: 'Budżet reklam miesięcznie', legend: 'Budżet reklam, zł miesięcznie', fmt: (v) => fmtMoney(v), short: (v) => shortMoney(v), icon: 'target' },
    bFee: { label: 'Twoja prowizja miesięcznie', legend: 'Twoja prowizja, zł miesięcznie', fmt: (v) => fmtMoney(v), short: (v) => shortMoney(v), icon: 'coins' },
    bSat: { label: 'Jaką część realnego rynku bierzesz', legend: 'Część realnego rynku, którą bierzesz', fmt: (v) => fmtDec(v * 100, 0) + '%', short: (v) => fmtDec(v * 100, 0) + '%', icon: 'target' }
  };
  const PLAN_KEYS = ['active', 'next', 'test'];

  // ---------------------------------------------------------------- formatowanie
  const nf0 = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 });
  const nf1 = new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  function fmtInt(v) { return nf0.format(Math.round(v || 0)); }
  function fmtDec(v, d) { return new Intl.NumberFormat('pl-PL', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v || 0); }
  function fmtCompact(v) {
    const a = Math.abs(v || 0);
    if (a >= 1e6) return nf1.format(v / 1e6) + ' mln';
    if (a >= 1e4) return nf0.format(v / 1e3) + ' tys.';
    return nf0.format(Math.round(v || 0));
  }
  function fmtMoney(v) {
    const a = Math.abs(v || 0);
    if (a >= 1e6) return nf1.format(v / 1e6) + ' mln zł';
    if (a >= 1e4) return nf0.format(v / 1e3) + ' tys. zł';
    return nf0.format(Math.round(v || 0)) + ' zł';
  }
  function fmtTech(v) { return v >= 10 ? nf0.format(v) : nf1.format(v); }
  function plural(n, one, few, many) {
    const k = Math.abs(Math.round(n));
    if (k === 1) return one;
    const d = k % 10, dd = k % 100;
    if (d >= 2 && d <= 4 && !(dd >= 12 && dd <= 14)) return few;
    return many;
  }

  // ---------------------------------------------------------------- DOM helper
  function h(tag, attrs) {
    const e = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v == null || v === false) continue;
        if (k === 'class') e.className = v;
        else if (k === 'style') e.style.cssText = v;
        else if (k === 'icon') e.insertAdjacentHTML('afterbegin', ICON[v] || '');
        else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
        else if (k === 'value') e.value = v;
        else e.setAttribute(k, v === true ? '' : v);
      }
    }
    for (let i = 2; i < arguments.length; i++) append(e, arguments[i]);
    return e;
  }
  function append(e, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach((x) => append(e, x)); return; }
    e.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  function svgEl(tag, attrs) {
    const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  const $ = (id) => document.getElementById(id);
  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 2600);
  }
  function rafThrottle(fn) {
    let queued = false;
    return function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; fn(); });
    };
  }
  function debounce(fn, ms) {
    let t;
    return function () { const args = arguments; clearTimeout(t); t = setTimeout(() => fn.apply(null, args), ms); };
  }

  // ---------------------------------------------------------------- stan
  const DEFAULT_STATE = () => ({
    level: 'woj',
    metric: 'revenue',
    tab: 'region',
    selected: null,
    A: Object.assign({}, DEFAULTS),
    marks: {
      woj: { '30': { s: 'active', n: 'Baza Konin, dojazd do 100 km. Pierwszy realizator usługi.' } },
      pow: { '3010': { s: 'active', n: '' }, '3062': { s: 'active', n: '' } }
    },
    bases: [{ id: 'b1', name: 'Konin', lat: 52.223, lng: 18.2511, r: 100 }],
    show: { marks: true, bases: true, cities: true },
    mode: 'pot',
    bizMetric: 'bTech',
    B: Object.assign({}, BIZ_DEFAULTS),
    ovr: { woj: {}, pow: {} },
    crews: { woj: {}, pow: {} }
  });
  let state = DEFAULT_STATE();

  function persistable() {
    return { v: 1, level: state.level, metric: state.metric, A: state.A, marks: state.marks, bases: state.bases, show: state.show, mode: state.mode, bizMetric: state.bizMetric, B: state.B, ovr: state.ovr, crews: state.crews };
  }
  function applyLoaded(o) {
    if (!o || typeof o !== 'object') return;
    if (o.level === 'woj' || o.level === 'pow') state.level = o.level;
    if (o.metric && METRICS[o.metric]) state.metric = o.metric;
    if (o.A && typeof o.A === 'object') {
      for (const k in DEFAULTS) if (o.A[k] != null && typeof o.A[k] === typeof DEFAULTS[k]) state.A[k] = o.A[k];
      if (o.A.calibBase === null) state.A.calibBase = null;
    }
    if (o.marks && o.marks.woj && o.marks.pow) state.marks = sanitizeMarks(o.marks);
    if (Array.isArray(o.bases)) state.bases = o.bases.filter((b) => b && isFinite(b.lat) && isFinite(b.lng)).map((b, i) => ({
      id: String(b.id || 'b' + (i + 1)).slice(0, 20), name: String(b.name || 'Baza').slice(0, 40), lat: +b.lat, lng: +b.lng, r: Math.min(250, Math.max(10, +b.r || 80))
    }));
    if (o.show) state.show = Object.assign({ marks: true, bases: true, cities: true }, o.show);
    if (o.mode === 'pot' || o.mode === 'biz') state.mode = o.mode;
    if (o.bizMetric && BIZ_METRICS[o.bizMetric]) state.bizMetric = o.bizMetric;
    if (o.B && typeof o.B === 'object') for (const k in BIZ_DEFAULTS) if (typeof o.B[k] === 'number' && isFinite(o.B[k])) state.B[k] = o.B[k];
    if (o.ovr && typeof o.ovr === 'object') state.ovr = sanitizeOvr(o.ovr);
    if (o.crews && typeof o.crews === 'object') state.crews = sanitizeCrews(o.crews);
  }
  function sanitizeMarks(m) {
    const out = { woj: {}, pow: {} };
    ['woj', 'pow'].forEach((lvl) => {
      for (const id in m[lvl]) {
        const x = m[lvl][id] || {};
        const s = STATUS[x.s] ? x.s : null;
        const n = typeof x.n === 'string' ? x.n.slice(0, 2000) : '';
        if (s || n) out[lvl][String(id).slice(0, 8)] = { s, n };
      }
    });
    return out;
  }
  const save = debounce(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(persistable())); } catch (e) { /* tryb prywatny itp. */ }
  }, 250);
  function loadStored() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) applyLoaded(JSON.parse(raw));
    } catch (e) { /* ignore */ }
  }
  function b64urlEncode(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    bytes.forEach((b) => { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function b64urlDecode(s) {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    const bin = atob(s);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }
  function loadFromHash() {
    const m = location.hash.match(/^#s=([A-Za-z0-9_-]+)/);
    if (!m) return false;
    try {
      const o = JSON.parse(b64urlDecode(m[1]));
      try { const prev = localStorage.getItem(STORE_KEY); if (prev) localStorage.setItem(STORE_KEY + '-kopia', prev); } catch (e) { /* ignore */ }
      applyLoaded(o);
      history.replaceState(null, '', location.pathname + location.search);
      return true;
    } catch (e) { return false; }
  }

  // ---------------------------------------------------------------- dane i model
  let DATA = null, GEO = {};
  const WOJ_BY_ID = new Map(), POW_BY_ID = new Map();
  const FEAT = { woj: new Map(), pow: new Map() };
  const R = { woj: new Map(), pow: new Map() };
  let TOTAL = null;
  let baseFrac = new Map(), unionFrac = new Map(), calibRate = null;

  function shareAt(y, A) {
    const pts = [[1995, A.s1995], [2005, A.s2005], [2015, A.s2015], [2025, A.s2025]];
    if (y <= 1995) return A.s1995 / 100;
    if (y >= 2025) return A.s2025 / 100;
    for (let i = 0; i < 3; i++) {
      const a = pts[i][0], va = pts[i][1], b = pts[i + 1][0], vb = pts[i + 1][1];
      if (y <= b) return (va + (vb - va) * (y - a) / (b - a)) / 100;
    }
    return A.s2025 / 100;
  }

  function baseCalc(u, A, now) {
    const cutoff = (now || NOW) - A.minAge;
    let poolNew = 0, pipe = 0, built = 0;
    const ufh = new Array(u.houses.length);
    for (let i = 0; i < u.houses.length; i++) {
      const y = Y0 + i, hh = u.houses[i], f = hh * shareAt(y, A);
      ufh[i] = f;
      if (y <= cutoff) poolNew += f; else pipe += f;
      if (y <= 2020) built += hh; else if (y === 2021) built += 0.25 * hh; // NSP: stan na 31.03.2021
    }
    const old = Math.max(0, (u.sf21 || 0) - built);
    const retro = old * A.retro / 100;
    const pool = poolNew + retro;
    const last5 = u.houses.slice(2021 - Y0, 2026 - Y0);
    return {
      pool, poolNew, retro, old, pipe, ufh, cutoff,
      theo: pool / Math.max(1, A.cycle),
      newAvg: last5.reduce((a, b) => a + b, 0) / Math.max(1, last5.length)
    };
  }

  function hav(lat1, lng1, lat2, lng2) {
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad, dLng = (lng2 - lng1) * rad;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
    return 12742 * Math.asin(Math.sqrt(a));
  }

  function computeBaseCoverage() {
    baseFrac = new Map();
    unionFrac = new Map();
    const covered = new Map();
    for (const b of state.bases) {
      const m = new Map();
      for (const p of DATA.pow) {
        if (hav(b.lat, b.lng, p.c[0], p.c[1]) > b.r + 110) continue;
        let k = 0;
        for (let i = 0; i < p.pts.length; i++) {
          const pt = p.pts[i];
          if (hav(b.lat, b.lng, pt[0], pt[1]) <= b.r) {
            k++;
            let s = covered.get(p.id);
            if (!s) { s = new Set(); covered.set(p.id, s); }
            s.add(i);
          }
        }
        if (k > 0) m.set(p.id, k / p.pts.length);
      }
      baseFrac.set(b.id, m);
    }
    for (const [pid, s] of covered) unionFrac.set(pid, s.size / POW_BY_ID.get(pid).pts.length);
  }

  function finalize(r, u, A, rate, lvl) {
    r.market = r.theo * A.adopt / 100;
    r.revenue = r.market * A.price;
    r.ours = rate != null ? r.theo * rate : r.market * A.share / 100;
    r.oursRevenue = r.ours * A.price;
    r.techs = r.ours / Math.max(1, A.capacity);
    r.density = u.area ? r.pool / u.area * 100 : 0;
    r.popDen = u.area ? u.pop / u.area : 0;
    r.hh = u.hh; r.pop = u.pop; r.area = u.area; r.sf21 = u.sf21;
    const w = lvl === 'woj' ? u : WOJ_BY_ID.get(u.woj);
    r.income = w.incIdx; r.incomeZl = w.inc;
    r.dyn = r.pool > 0 ? r.pipe / r.pool : 0;
  }

  function computeScores(lvl) {
    const ids = [...R[lvl].keys()];
    const n = ids.length;
    const comps = { pot: 'pool', den: 'density', inc: 'income', dyn: 'dyn' };
    const pr = {};
    for (const k in comps) {
      const field = comps[k];
      const sorted = ids.map((id) => [id, R[lvl].get(id)[field]]).sort((a, b) => a[1] - b[1]);
      const m = new Map();
      let i = 0;
      while (i < n) {
        let j = i;
        while (j + 1 < n && sorted[j + 1][1] === sorted[i][1]) j++;
        const rank = n > 1 ? (i + j) / 2 / (n - 1) : 1;
        for (let t = i; t <= j; t++) m.set(sorted[t][0], rank);
        i = j + 1;
      }
      pr[k] = m;
    }
    const A = state.A;
    const ws = (A.wPot + A.wDen + A.wInc + A.wDyn) || 1;
    for (const id of ids) {
      const r = R[lvl].get(id);
      r.score = 100 * (A.wPot * pr.pot.get(id) + A.wDen * pr.den.get(id) + A.wInc * pr.inc.get(id) + A.wDyn * pr.dyn.get(id)) / ws;
    }
  }

  function sumStats(entries) {
    const t = { pool: 0, poolNew: 0, retro: 0, theo: 0, market: 0, revenue: 0, ours: 0, oursRevenue: 0, techs: 0, hh: 0, pipe: 0, pop: 0, area: 0 };
    for (const [r, f] of entries) for (const k in t) t[k] += (r[k] || 0) * f;
    return t;
  }

  function computeAll() {
    const A = state.A;
    for (const u of DATA.woj) R.woj.set(u.id, baseCalc(u, A));
    for (const u of DATA.pow) R.pow.set(u.id, baseCalc(u, A));
    computeBaseCoverage();
    calibRate = null;
    if (A.calibOrders > 0 && A.calibBase && baseFrac.has(A.calibBase)) {
      let t = 0;
      for (const [pid, f] of baseFrac.get(A.calibBase)) t += R.pow.get(pid).theo * f;
      if (t > 0) calibRate = (A.calibOrders * 12) / t;
    }
    for (const u of DATA.woj) finalize(R.woj.get(u.id), u, A, calibRate, 'woj');
    for (const u of DATA.pow) finalize(R.pow.get(u.id), u, A, calibRate, 'pow');
    computeScores('woj');
    computeScores('pow');
    TOTAL = sumStats(DATA.woj.map((u) => [R.woj.get(u.id), 1]));
    TOTAL.ufh = DATA.woj[0].houses.map((_, i) => DATA.woj.reduce((s, u) => s + R.woj.get(u.id).ufh[i], 0));
    TOTAL.houses = DATA.woj[0].houses.map((_, i) => DATA.woj.reduce((s, u) => s + u.houses[i], 0));
    TOTAL.cutoff = NOW - A.minAge;
    TOTAL.covered = sumStats([...unionFrac].map(([pid, f]) => [R.pow.get(pid), f]));
    computeBiz();
  }

  function metricValue(lvl, id, metric) {
    const r = R[lvl].get(id);
    if (!r) return 0;
    return metric ? r[metric] : curVal(r);
  }

  function rankOf(lvl, id, metric) {
    const v = metricValue(lvl, id, metric);
    const get = metric ? (r) => r[metric] : curVal;
    let k = 1;
    for (const [oid, r] of R[lvl]) if (oid !== id && get(r) > v) k++;
    return k;
  }

  // ---------------------------------------------------------------- klasy choropletu
  let BREAKS = { br: [], min: 0, max: 0 };
  function computeBreaks() {
    const vals = [...R[state.level].values()].map(curVal).filter((v) => isFinite(v)).sort((a, b) => a - b);
    const n = vals.length;
    const br = [];
    for (let k = 1; k < 6; k++) br.push(vals[Math.min(n - 1, Math.floor(k * n / 6))]);
    BREAKS = { br, min: vals[0], max: vals[n - 1] };
  }
  function classOf(v) {
    let c = 0;
    for (const b of BREAKS.br) if (v >= b) c++;
    return Math.min(5, c);
  }

  // ---------------------------------------------------------------- mapa
  let map, layers = {};
  let legendCollapsed = window.matchMedia('(max-width: 720px)').matches;
  function initMap() {
    map = L.map('map', {
      zoomControl: false, zoomSnap: 0.25, zoomDelta: 0.5, minZoom: 5, maxZoom: 11,
      maxBounds: [[46.5, 9.5], [57.8, 29]], maxBoundsViscosity: 0.7, attributionControl: true
    });
    L.control.zoom({ position: 'topright', zoomInTitle: 'Przybliż', zoomOutTitle: 'Oddal' }).addTo(map);
    map.attributionControl.setPrefix(false);
    map.attributionControl.addAttribution('Dane: GUS (BDL, NSP 2021) · granice: PRG GUGiK');
    const panes = ['fills', 'lines', 'marks', 'sel', 'bases', 'labels'];
    panes.forEach((n, i) => { const p = map.createPane(n); p.style.zIndex = String(400 + i * 10); });
    ['lines', 'marks', 'sel', 'bases', 'labels'].forEach((n) => { map.getPane(n).style.pointerEvents = 'none'; });
    map.fitBounds(PL_BOUNDS, { padding: [10, 10] });

    layers.woj = L.geoJSON(GEO.woj, { pane: 'fills', style: (f) => fillStyle('woj', f.properties.id), onEachFeature: (f, l) => bindRegion('woj', f, l) });
    layers.pow = L.geoJSON(GEO.pow, { pane: 'fills', style: (f) => fillStyle('pow', f.properties.id), onEachFeature: (f, l) => bindRegion('pow', f, l) });
    layers.wojLines = L.geoJSON(GEO.woj, { pane: 'lines', interactive: false, style: { color: '#0c2b5c', weight: 1.6, opacity: 0.55, fill: false } });
    layers.marks = L.layerGroup();
    layers.sel = L.layerGroup();
    layers.bases = L.layerGroup();
    layers.cities = L.layerGroup();
    [layers.marks, layers.sel, layers.bases, layers.cities].forEach((l) => l.addTo(map));

    map.on('click', (e) => { if (addingBase) addBase(e.latlng); });
    map.on('zoomend', rafThrottle(() => { drawMarks(); drawCities(); }));
    map.on('moveend', rafThrottle(drawCities));
  }

  function fillStyle(lvl, id) {
    const v = metricValue(lvl, id);
    return { fillColor: state.mode === 'biz' && v < 0 ? NEG_FILL : RAMP[classOf(v)], fillOpacity: 1, color: '#ffffff', weight: lvl === 'woj' ? 1.6 : 0.7, opacity: 1 };
  }

  function bindRegion(lvl, f, layer) {
    const id = f.properties.id;
    FEAT[lvl].set(id, { feature: f, layer });
    layer.bindTooltip(() => tooltipEl(lvl, id), { sticky: true, direction: 'top', offset: [0, -10], className: 'tt', opacity: 1 });
    layer.on('mouseover', () => {
      if (addingBase) return;
      layer.setStyle({ color: '#0a0a0a', weight: lvl === 'woj' ? 2.4 : 1.6 });
      layer.bringToFront();
    });
    layer.on('mouseout', () => { layer.setStyle(fillStyle(lvl, id)); });
    layer.on('click', (e) => {
      if (addingBase) { addBase(e.latlng); L.DomEvent.stopPropagation(e); return; }
      L.DomEvent.stopPropagation(e);
      select(lvl, id, false);
    });
  }

  function unitName(lvl, id) {
    if (lvl === 'woj') return WOJ_BY_ID.get(id).name;
    return POW_BY_ID.get(id).name;
  }
  function unitTitle(lvl, id) {
    const n = unitName(lvl, id);
    return lvl === 'woj' ? 'woj. ' + n : n;
  }

  function tooltipEl(lvl, id) {
    const m = curMetric();
    const r = R[lvl].get(id);
    const total = R[lvl].size;
    const mk = state.marks[lvl][id];
    const box = h('div', null,
      h('div', { class: 'tt-v' }, m.fmt(curVal(r))),
      h('div', { class: 'tt-n' }, unitTitle(lvl, id)),
      h('div', { class: 'tt-s' }, m.legend + ' · miejsce ' + rankOf(lvl, id) + ' z ' + total)
    );
    if (state.mode === 'biz' && r.b) box.append(h('div', { class: 'tt-s' }, bizLine(r.b)));
    if (mk && mk.s) {
      const st = STATUS[mk.s];
      box.append(h('div', { class: 'tt-st' }, h('span', { class: 'st-dot', style: 'background:' + st.color, icon: st.icon }), st.label));
    }
    return box;
  }

  function refreshFills() {
    computeBreaks();
    layers.woj.setStyle((f) => fillStyle('woj', f.properties.id));
    layers.pow.setStyle((f) => fillStyle('pow', f.properties.id));
    renderLegend();
  }

  function applyLevel() {
    if (state.level === 'woj') {
      map.removeLayer(layers.pow); map.removeLayer(layers.wojLines);
      layers.woj.addTo(map);
    } else {
      map.removeLayer(layers.woj);
      layers.pow.addTo(map); layers.wojLines.addTo(map);
    }
    document.querySelectorAll('#level-seg button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.level === state.level)));
    refreshFills();
    drawMarks();
    drawSelection();
    drawCities();
  }

  function outlineLayers(feature, color, weight, dash, pane) {
    const casing = L.geoJSON(feature, { pane, interactive: false, style: { color: '#ffffff', weight: weight + 3.5, opacity: 1, fill: false, lineJoin: 'round' } });
    const stroke = L.geoJSON(feature, { pane, interactive: false, style: { color, weight, opacity: 1, fill: false, dashArray: dash || null, lineCap: 'round', lineJoin: 'round' } });
    return [casing, stroke];
  }

  function drawMarks() {
    layers.marks.clearLayers();
    pillAnchors = [];
    const biz = state.mode === 'biz';
    if (!state.show.marks && !biz) return;
    const lvl = state.level;
    const ids = state.show.marks ? Object.keys(state.marks[lvl]).filter((id) => state.marks[lvl][id].s && FEAT[lvl].has(id)) : [];
    const z = map.getZoom();
    const showLabel = lvl === 'woj' || z >= 7.5 || ids.length <= 12;
    const placed = [];
    const hit = (b) => placed.some((o) => !(b.x2 < o.x1 || b.x1 > o.x2 || b.y2 < o.y1 || b.y1 > o.y2));
    if (state.show.bases) {
      for (const b of state.bases) {
        const pt = map.latLngToContainerPoint([b.lat, b.lng]);
        const w = (b.name.length + 9) * 7.5;
        placed.push({ x1: pt.x - 22, x2: pt.x + 22, y1: pt.y - 22, y2: pt.y + 22 });
        placed.push({ x1: pt.x - w / 2, x2: pt.x + w / 2, y1: pt.y + 22, y2: pt.y + 48 });
      }
    }
    const order = ids.map((id) => [id, (R[lvl].get(id) || {}).pool || 0]).sort((a, b) => b[1] - a[1]).map((x) => x[0]);
    for (const id of order) {
      const st = STATUS[state.marks[lvl][id].s];
      const f = FEAT[lvl].get(id).feature;
      outlineLayers(f, st.color, lvl === 'woj' ? 4 : 3, st.dash, 'marks').forEach((l) => layers.marks.addLayer(l));
      if (biz) continue;
      const u = lvl === 'woj' ? WOJ_BY_ID.get(id) : POW_BY_ID.get(id);
      const at = lvl === 'woj' ? [u.c[0] + 0.42, u.c[1]] : u.c;
      const pt = map.latLngToContainerPoint(at);
      let label = showLabel, dx = 0, dy = 0, ok = false;
      const tries = [[0, 0], [0, 28], [0, -28], [0, 56], [0, -56]];
      for (const small of (label ? [false, true] : [true])) {
        const w = small ? 24 : st.label.length * 7.4 + 34;
        for (const [ox, oy] of tries) {
          const box = { x1: pt.x + ox - w / 2, x2: pt.x + ox + w / 2, y1: pt.y + oy - 12, y2: pt.y + oy + 12 };
          if (!hit(box)) { placed.push(box); dx = ox; dy = oy; label = !small; ok = true; break; }
        }
        if (ok) break;
      }
      if (!ok) { label = false; dx = 0; dy = 0; }
      const badge = h('div', { class: 'status-badge' + (label ? '' : ' small'), style: 'background:' + st.color + ';transform:translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px))', icon: st.icon, title: st.label + ': ' + unitTitle(lvl, id) }, label ? st.label : '');
      layers.marks.addLayer(L.marker(at, { pane: 'labels', interactive: false, keyboard: false, icon: L.divIcon({ className: '', html: badge, iconSize: [0, 0] }) }));
    }
    if (biz) drawBizPills(lvl, placed, hit);
  }

  function drawSelection() {
    layers.sel.clearLayers();
    const s = state.selected;
    if (!s || s.lvl !== state.level || !FEAT[s.lvl].has(s.id)) return;
    outlineLayers(FEAT[s.lvl].get(s.id).feature, '#0a0a0a', 3, null, 'sel').forEach((l) => layers.sel.addLayer(l));
  }

  function drawCities() {
    layers.cities.clearLayers();
    if (!state.show.cities) return;
    const z = map.getZoom();
    const minPop = z >= 7.75 ? 0 : z >= 6.75 ? 50000 : 200000;
    const placed = [];
    const overlaps = (b) => placed.some((o) => !(b.x2 < o.x1 || b.x1 > o.x2 || b.y2 < o.y1 || b.y1 > o.y2));
    if (state.show.bases) {
      for (const b of state.bases) {
        const pt = map.latLngToContainerPoint([b.lat, b.lng]);
        const w = (b.name.length + 9) * 7.5;
        placed.push({ x1: pt.x - Math.max(24, w / 2), x2: pt.x + Math.max(24, w / 2), y1: pt.y - 22, y2: pt.y + 48 });
      }
    }
    if (state.mode === 'biz') for (const a of pillAnchors) { const q = map.latLngToContainerPoint(a.ll); placed.push({ x1: q.x + a.dx - a.w / 2, x2: q.x + a.dx + a.w / 2, y1: q.y + a.dy - 13, y2: q.y + a.dy + 13 }); }
    const baseNames = new Set(state.bases.map((b) => b.name.toLowerCase()));
    const cands = DATA.pow.filter((p) => p.city && p.pop >= minPop).sort((a, b) => b.pop - a.pop);
    for (const p of cands) {
      const name = p.name.replace(/^m\.\s*/, '');
      if (state.show.bases && baseNames.has(name.toLowerCase())) continue;
      const pt = map.latLngToContainerPoint(p.c);
      const w = name.length * 7 + 8;
      const box = { x1: pt.x - w / 2, x2: pt.x + w / 2, y1: pt.y - 5, y2: pt.y + 22 };
      if (overlaps(box)) continue;
      placed.push(box);
      const lab = h('div', { class: 'city-label' + (p.pop > 400000 ? ' big' : '') }, h('div', { class: 'city-dot' }), name);
      layers.cities.addLayer(L.marker(p.c, { pane: 'labels', interactive: false, keyboard: false, icon: L.divIcon({ className: '', html: lab, iconSize: [0, 0] }) }));
    }
  }

  function drawBases() {
    layers.bases.clearLayers();
    if (!state.show.bases) return;
    for (const b of state.bases) {
      layers.bases.addLayer(L.circle([b.lat, b.lng], { pane: 'bases', radius: b.r * 1000, color: '#0a0a0a', weight: 2, dashArray: '8 7', fillColor: '#0a0a0a', fillOpacity: 0.05, interactive: false }));
      const pin = h('div', { class: 'base-pin', title: 'Przeciągnij, żeby przesunąć bazę', icon: 'pin' });
      const mk = L.marker([b.lat, b.lng], { draggable: true, autoPan: true, keyboard: true, title: b.name, icon: L.divIcon({ className: '', html: pin, iconSize: [38, 38], iconAnchor: [19, 19] }) });
      mk.on('dragend', () => {
        const ll = mk.getLatLng();
        b.lat = Math.round(ll.lat * 10000) / 10000; b.lng = Math.round(ll.lng * 10000) / 10000;
        onDataChange();
      });
      mk.on('click', () => openTab('bazy'));
      layers.bases.addLayer(mk);
      const tag = h('div', { class: 'base-tag' }, b.name + ' · ' + b.r + ' km');
      layers.bases.addLayer(L.marker([b.lat, b.lng], { pane: 'labels', interactive: false, keyboard: false, icon: L.divIcon({ className: '', html: tag, iconSize: [0, 0], iconAnchor: [0, -24] }) }));
    }
  }

  function renderLegend() {
    const lg = $('legend');
    lg.textContent = '';
    const m = curMetric();
    lg.classList.toggle('collapsed', legendCollapsed);
    lg.append(h('div', { class: 'legend-head' }, h('h4', null, legendTitle(m)), h('button', { type: 'button', class: 'legend-toggle', 'aria-expanded': String(!legendCollapsed), onclick: () => { legendCollapsed = !legendCollapsed; renderLegend(); } }, legendCollapsed ? 'Pokaż' : 'Ukryj')));
    if (legendCollapsed) return;
    const rows = null;
    const edges = [BREAKS.min].concat(BREAKS.br, [BREAKS.max]);
    const box = h('div', { class: 'ramp' });
    RAMP.forEach((c) => box.append(h('i', { style: 'background:' + c })));
    lg.append(box);
    const labels = h('div', { class: 'ramp-labels' });
    for (let k = 0; k < 6; k++) labels.append(h('span', { title: m.fmt(edges[k]) + ' – ' + m.fmt(edges[k + 1]) }, shortFmt(edges[k])));
    lg.append(labels);
    lg.append(h('div', { class: 'legend-note' }, 'Każdy kolor to szósta część ' + (state.level === 'woj' ? 'województw' : 'powiatów') + ', od najniższych wartości (dolna granica pod kolorem). Najwyżej: ' + m.fmt(BREAKS.max) + (state.mode !== 'biz' && state.metric === 'income' && state.level === 'pow' ? '. Powiaty mają wartość swojego województwa.' : '.') + (state.mode === 'biz' ? ' Plakietki pokazują wartość ' + (state.level === 'woj' ? 'województwa.' : 'oznaczonych powiatów.') : '')));
    const keys = h('div', { class: 'keys' });
    const usedStatuses = STATUS_KEYS.filter((k) => Object.values(state.marks[state.level]).some((x) => x.s === k));
    if (state.show.marks) usedStatuses.forEach((k) => keys.append(h('span', { class: 'key' }, lineKey(STATUS[k].color, STATUS[k].dash), STATUS[k].label)));
    if (state.show.bases && state.bases.length) keys.append(h('span', { class: 'key' }, lineKey('#0a0a0a', '5 4'), 'Zasięg bazy'));
    if (state.mode === 'biz' && BREAKS.min < 0) keys.append(h('span', { class: 'key' }, h('i', { class: 'neg-sw' }), 'Strata'));
    if (keys.childNodes.length) lg.append(keys);
    void rows;
  }
  function shortFmt(v) {
    if (state.mode === 'biz') return curMetric().short(v);
    if (state.metric === 'revenue') {
      const a = Math.abs(v);
      if (a >= 1e6) return nf1.format(v / 1e6) + ' mln';
      if (a >= 1e3) return nf0.format(v / 1e3) + ' tys.';
      return nf0.format(v);
    }
    if (state.metric === 'income') return fmtDec(v, 0);
    return fmtCompact(v);
  }
  function lineKey(color, dash) {
    const s = svgEl('svg', { viewBox: '0 0 26 10' });
    s.append(svgEl('line', { x1: 2, y1: 5, x2: 24, y2: 5, stroke: '#fff', 'stroke-width': 6, 'stroke-linecap': 'round' }));
    const ln = svgEl('line', { x1: 2, y1: 5, x2: 24, y2: 5, stroke: color, 'stroke-width': 3, 'stroke-linecap': 'round' });
    if (dash) ln.setAttribute('stroke-dasharray', dash);
    s.append(ln);
    return s;
  }

  // ---------------------------------------------------------------- wybór regionu
  function select(lvl, id, zoom) {
    state.selected = { lvl, id };
    if (lvl !== state.level) { state.level = lvl; applyLevel(); save(); }
    drawSelection();
    if (state.mode === 'biz' && lvl === 'pow') redrawOverlays();
    openTab('region');
    if (zoom && FEAT[lvl].has(id)) {
      map.flyToBounds(FEAT[lvl].get(id).layer.getBounds(), { padding: [60, 60], maxZoom: lvl === 'woj' ? 7.25 : 9, duration: 0.6 });
    }
  }

  // ---------------------------------------------------------------- zakładki
  function openTab(name) {
    state.tab = name;
    document.querySelectorAll('.tabs [role=tab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === name)));
    ['region', 'plan', 'ranking', 'bazy', 'zalozenia'].forEach((t) => { $('tab-' + t).hidden = t !== name; });
    renderPanel();
  }
  function renderPanel() {
    if (state.tab === 'region') renderRegion();
    else if (state.tab === 'plan') renderPlan();
    else if (state.tab === 'ranking') renderRanking();
    else if (state.tab === 'bazy') renderBases();
    else if (state.tab === 'zalozenia') renderAssumptions();
  }

  function statPair(v, l, cls) { return h('div', { class: 'stat' + (cls ? ' ' + cls : '') }, h('div', { class: 'v' }, v), h('div', { class: 'l' }, l)); }

  function oursLabel() {
    return calibRate != null ? 'Twoje zlecenia rocznie (tempo jak w bazie ' + baseName(state.A.calibBase) + ')' : 'Twoje zlecenia rocznie (' + state.A.share + '% rynku realnego)';
  }
  function baseName(id) { const b = state.bases.find((x) => x.id === id); return b ? b.name : '?'; }

  function renderRegion() {
    const box = $('tab-region');
    box.textContent = '';
    const s = state.selected;
    if (!s) { if (state.mode === 'biz') renderBizPoland(box); else renderPoland(box); return; }
    const lvl = s.lvl, id = s.id;
    const u = lvl === 'woj' ? WOJ_BY_ID.get(id) : POW_BY_ID.get(id);
    const r = R[lvl].get(id);
    const total = R[lvl].size;
    const rank = rankOf(lvl, id);
    const head = h('div', { class: 'region-head' },
      h('div', null,
        h('div', { class: 'eyebrow' }, lvl === 'woj' ? 'Województwo' : (u.city ? 'Miasto na prawach powiatu' : 'Powiat')),
        h('h2', null, lvl === 'woj' ? u.name : u.name.replace(/^pow\.\s*/, 'powiat ').replace(/^m\.\s*/, ''))
      ),
      h('div', { class: 'rank-chip', title: curMetric().label }, '#' + rank + ' z ' + total)
    );
    box.append(head);
    if (lvl === 'pow') {
      const w = WOJ_BY_ID.get(u.woj);
      box.append(h('div', { class: 'region-sub' }, 'woj. ', h('a', { href: '#', onclick: (e) => { e.preventDefault(); select('woj', w.id, true); } }, w.name)));
    }
    box.append(statusEditor(lvl, id));
    if (state.mode === 'biz') { renderBizRegion(box, lvl, id); return; }

    const grid = h('div', { class: 'stat-grid' });
    grid.append(statPair(fmtMoney(r.revenue), 'rynek realny rocznie: ' + fmtInt(r.market) + ' ' + plural(r.market, 'zlecenie', 'zlecenia', 'zleceń'), 'hl'));
    grid.append(statPair(fmtTech(r.techs), 'techników do obsłużenia Twoich zleceń (' + fmtInt(state.A.capacity) + ' zleceń na etat rocznie)', 'yl'));
    grid.append(statPair(fmtInt(r.ours), oursLabel()));
    grid.append(statPair(fmtMoney(r.oursRevenue), 'Twój przychód rocznie przy tej liczbie zleceń'));
    grid.append(statPair(fmtInt(r.pool), 'domów z podłogówką w wieku do czyszczenia (' + state.A.minAge + '+ lat)'));
    grid.append(statPair(fmtInt(r.pipe), 'młodszych podłogówek, które dojdą do czyszczenia w ciągu ' + state.A.minAge + ' lat'));
    grid.append(statPair(fmtInt(r.density), 'domów do czyszczenia na 100 km² (gęstość tras)'));
    grid.append(statPair(fmtInt(r.score), 'wskaźnik skalowania (0–100), miejsce ' + rankOf(lvl, id, 'score') + ' z ' + total));
    box.append(grid);

    box.append(h('div', { class: 'section-title' }, 'Podłogówki według roku budowy domu (szacunek)'));
    box.append(barChart(r.ufh, u.houses, r.cutoff));

    box.append(h('div', { class: 'section-title' }, 'Dane GUS dla regionu'));
    const t = h('table', { class: 'kv' });
    const row = (k, v, src) => t.append(h('tr', null, h('td', null, k, src ? h('span', { class: 'src' }, src) : null), h('td', null, v)));
    row('Gospodarstwa domowe', fmtInt(u.hh), 'NSP 2021');
    row('Ludność w gospodarstwach domowych', fmtInt(u.pop), 'NSP 2021');
    row('Zaludnienie', fmtInt(r.popDen) + ' os./km²', 'NSP 2021, powierzchnia 2024');
    row('Domy jednorodzinne zamieszkane', fmtInt(u.sf21), 'NSP 2021, budynki z 1 mieszkaniem');
    row('Nowe domy rocznie', fmtInt(r.newAvg), 'średnia 2021–2025, GUS BDL (przeliczone)');
    row('Domy zbudowane przed 1995 r.', fmtInt(r.old), 'szacunek: NSP 2021 minus nowe domy od 1995');
    row('Powierzchnia', fmtInt(u.area) + ' km²', 'GUS, 2024');
    const w = lvl === 'woj' ? u : WOJ_BY_ID.get(u.woj);
    row('Dochód na osobę miesięcznie', fmtInt(w.inc) + ' zł (Polska = 100: ' + fmtDec(w.incIdx, 1) + ')', 'GUS 2025' + (lvl === 'pow' ? ', wartość dla województwa' : ''));
    box.append(t);

    if (lvl === 'woj') {
      const top = DATA.pow.filter((p) => p.woj === id).map((p) => [p, R.pow.get(p.id)]).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 8);
      box.append(h('div', { class: 'section-title' }, 'Powiaty z największym potencjałem'));
      const ul = h('ul', { class: 'list-clean mini-list' });
      top.forEach(([p, rr]) => ul.append(h('li', null, h('button', { type: 'button', onclick: () => select('pow', p.id, true) }, p.name), h('span', null, fmtMoney(rr.revenue)))));
      box.append(ul);
      const marked = DATA.pow.filter((p) => p.woj === id && state.marks.pow[p.id] && state.marks.pow[p.id].s);
      if (marked.length) {
        box.append(h('div', { class: 'section-title' }, 'Oznaczone powiaty'));
        const ul2 = h('ul', { class: 'list-clean mini-list' });
        marked.forEach((p) => { const st = STATUS[state.marks.pow[p.id].s]; ul2.append(h('li', null, h('button', { type: 'button', onclick: () => select('pow', p.id, true) }, p.name), h('span', null, st.label))); });
        box.append(ul2);
      }
    }
  }

  function renderPoland(box) {
    box.append(h('div', { class: 'region-head' },
      h('div', null, h('div', { class: 'eyebrow' }, 'Cała Polska'), h('h2', null, 'Polska')),
      h('div', { class: 'rank-chip' }, R[state.level].size + ' ' + (state.level === 'woj' ? 'województw' : 'powiatów'))
    ));
    box.append(h('p', { class: 'hint', style: 'margin-top:10px' }, 'Kliknij województwo albo powiat na mapie, żeby zobaczyć jego liczby, oznaczyć go i dopisać notatkę.'));
    const T = TOTAL;
    const grid = h('div', { class: 'stat-grid' });
    grid.append(statPair(fmtMoney(T.revenue), 'rynek realny rocznie: ' + fmtInt(T.market) + ' zleceń', 'hl'));
    grid.append(statPair(fmtTech(T.techs), 'techników przy Twoim udziale w rynku', 'yl'));
    grid.append(statPair(fmtCompact(T.pool), 'domów z podłogówką w wieku do czyszczenia'));
    grid.append(statPair(fmtCompact(T.pipe), 'młodszych podłogówek, które dojdą do czyszczenia'));
    box.append(grid);
    box.append(h('div', { class: 'section-title' }, 'Podłogówki według roku budowy domu (szacunek)'));
    box.append(barChart(T.ufh, T.houses, T.cutoff));
    const top = DATA.woj.map((u) => [u, R.woj.get(u.id)]).sort((a, b) => b[1].score - a[1].score).slice(0, 5);
    box.append(h('div', { class: 'section-title' }, 'Najwyższy wskaźnik skalowania'));
    const ul = h('ul', { class: 'list-clean mini-list' });
    top.forEach(([u, r]) => ul.append(h('li', null, h('button', { type: 'button', onclick: () => select('woj', u.id, true) }, u.name), h('span', null, fmtInt(r.score) + ' / 100'))));
    box.append(ul);
  }

  function statusEditor(lvl, id) {
    const wrap = h('div');
    const cur = state.marks[lvl][id] || { s: null, n: '' };
    const row = h('div', { class: 'status-row', role: 'group', 'aria-label': 'Oznaczenie regionu' });
    const mk = (key, label, color, icon) => {
      const pressed = (cur.s || null) === key;
      return h('button', {
        type: 'button', class: 'chip' + (key ? '' : ' none'), 'aria-pressed': String(pressed),
        onclick: () => {
          const m = state.marks[lvl][id] || { s: null, n: '' };
          m.s = key;
          if (!m.s && !m.n) delete state.marks[lvl][id]; else state.marks[lvl][id] = m;
          save(); if (state.mode === 'biz') { redrawOverlays(); renderKPIs(); } else drawMarks(); renderLegend(); renderRegion();
        }
      }, h('span', { class: 'dot', style: color ? 'background:' + color : '', icon }), label);
    };
    row.append(mk(null, 'Brak', null, 'dash'));
    STATUS_KEYS.forEach((k) => row.append(mk(k, STATUS[k].label, STATUS[k].color, STATUS[k].icon)));
    wrap.append(row);
    const saved = h('div', { class: 'note-saved' });
    const ta = h('textarea', { class: 'note', placeholder: 'Notatka: kto tu działa, ceny, konkurencja, następny krok…', 'aria-label': 'Notatka do regionu', maxlength: '2000' });
    ta.value = cur.n || '';
    const commit = debounce(() => {
      const m = state.marks[lvl][id] || { s: null, n: '' };
      m.n = ta.value;
      if (!m.s && !m.n) delete state.marks[lvl][id]; else state.marks[lvl][id] = m;
      save();
      saved.textContent = 'Zapisano w tej przeglądarce';
      setTimeout(() => { saved.textContent = ''; }, 1600);
    }, 500);
    ta.addEventListener('input', commit);
    wrap.append(ta, saved);
    return wrap;
  }

  // wykres słupkowy: podłogówki wg roku budowy
  function barChart(ufh, houses, cutoff) {
    const box = h('div', { class: 'chart-box' });
    const W = 360, H = 150, ml = 38, mr = 6, mt = 8, mb = 20;
    const n = ufh.length;
    const max = Math.max.apply(null, ufh) || 1;
    const nice = niceMax(max);
    const s = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Szacowana liczba domów z podłogówką według roku budowy, 1995–2025' });
    const pw = W - ml - mr, ph = H - mt - mb;
    [0, 0.5, 1].forEach((f) => {
      const y = mt + ph - f * ph;
      s.append(svgEl('line', { x1: ml, x2: W - mr, y1: y, y2: y, stroke: f === 0 ? '#c3d3df' : '#e8f0f5', 'stroke-width': 1 }));
      const tx = svgEl('text', { x: ml - 6, y: y + 3.5, 'text-anchor': 'end', 'font-size': 10, fill: '#7a879c', 'font-family': 'Inter, sans-serif' });
      tx.textContent = fmtCompact(nice * f);
      s.append(tx);
    });
    const step = pw / n, bw = Math.max(2, step - 2);
    for (let i = 0; i < n; i++) {
      const v = ufh[i], bh = v / nice * ph;
      const x = ml + i * step + 1, y = mt + ph - bh;
      const rr = Math.min(3, bw / 2, bh);
      const d = 'M' + x + ',' + (mt + ph) + 'V' + (y + rr) + 'Q' + x + ',' + y + ' ' + (x + rr) + ',' + y + 'H' + (x + bw - rr) + 'Q' + (x + bw) + ',' + y + ' ' + (x + bw) + ',' + (y + rr) + 'V' + (mt + ph) + 'Z';
      s.append(svgEl('path', { d, fill: (Y0 + i) <= cutoff ? COL_ELIGIBLE : COL_YOUNG }));
    }
    [1995, 2005, 2015, 2025].forEach((y) => {
      const tx = svgEl('text', { x: ml + (y - Y0 + 0.5) * step, y: H - 5, 'text-anchor': 'middle', 'font-size': 10, fill: '#7a879c', 'font-family': 'Inter, sans-serif' });
      tx.textContent = String(y);
      s.append(tx);
    });
    const hover = svgEl('rect', { x: 0, y: 0, width: 0, height: ph, fill: 'rgba(10,10,10,0.06)', rx: 3, visibility: 'hidden' });
    s.insertBefore(hover, s.firstChild);
    box.append(s);
    const tip = h('div', { class: 'chart-tip', hidden: true });
    box.append(tip);
    function onMove(ev) {
      const rect = s.getBoundingClientRect();
      const sx = (ev.clientX - rect.left) / rect.width * W;
      const i = Math.floor((sx - ml) / step);
      if (i < 0 || i >= n) { tip.hidden = true; hover.setAttribute('visibility', 'hidden'); return; }
      const y = Y0 + i;
      hover.setAttribute('x', ml + i * step); hover.setAttribute('y', mt); hover.setAttribute('width', step); hover.setAttribute('visibility', 'visible');
      tip.textContent = '';
      tip.append(h('b', null, fmtInt(ufh[i]) + ' z podłogówką'), y + ' r. · nowe domy: ' + fmtInt(houses[i]), h('br'), y <= cutoff ? 'w wieku do czyszczenia' : 'do czyszczenia od ' + (y + state.A.minAge) + ' r.');
      tip.hidden = false;
      const bx = box.getBoundingClientRect();
      let left = ev.clientX - bx.left + 12;
      if (left + 170 > bx.width) left = ev.clientX - bx.left - 180;
      tip.style.left = left + 'px';
      tip.style.top = (ev.clientY - bx.top - 50) + 'px';
    }
    s.addEventListener('pointermove', onMove);
    s.addEventListener('pointerleave', () => { tip.hidden = true; hover.setAttribute('visibility', 'hidden'); });
    box.append(h('div', { class: 'chart-legend' },
      h('span', null, h('i', { style: 'background:' + COL_ELIGIBLE }), 'w wieku do czyszczenia (zbudowane do ' + cutoff + ' r.)'),
      h('span', null, h('i', { style: 'background:' + COL_YOUNG }), 'młodsze, dojdą później')
    ));
    return box;
  }
  function niceMax(v) {
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    const m = v / p;
    const k = m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10;
    return k * p;
  }

  // ---------------------------------------------------------------- ranking
  let rankQuery = '';
  function renderRanking() {
    const box = $('tab-ranking');
    box.textContent = '';
    const lvl = state.level;
    const m = curMetric();
    box.append(h('p', { class: 'hint' }, 'Ranking ', h('b', null, lvl === 'woj' ? 'województw' : 'powiatów'), ' według: ', h('b', null, m.label), '. Kliknij, żeby pokazać na mapie. Kolejność zmienisz polem „Kolor mapy”.'));
    if (lvl === 'pow') {
      const inp = h('input', { type: 'search', placeholder: 'Szukaj powiatu albo miasta…', 'aria-label': 'Szukaj powiatu', value: rankQuery });
      inp.addEventListener('input', () => { rankQuery = inp.value; fillList(); });
      box.append(h('div', { class: 'rank-tools' }, inp));
    }
    const meta = h('div', { class: 'rank-meta' });
    const list = h('div', { role: 'list' });
    box.append(meta, list);
    function fillList() {
      list.textContent = '';
      const rows = [...R[lvl].entries()].map(([id, r]) => [id, curVal(r)]).sort((a, b) => b[1] - a[1]);
      const max = rows.length ? rows[0][1] : 1;
      const q = rankQuery.trim().toLowerCase();
      let shown = 0;
      const frag = document.createDocumentFragment();
      rows.forEach(([id, v], i) => {
        const name = unitName(lvl, id);
        const wname = lvl === 'pow' ? WOJ_BY_ID.get(POW_BY_ID.get(id).woj).name : '';
        if (q && !(name.toLowerCase().includes(q) || wname.includes(q))) return;
        shown++;
        const mk = state.marks[lvl][id];
        const st = mk && mk.s ? STATUS[mk.s] : null;
        const sel = state.selected && state.selected.lvl === lvl && state.selected.id === id;
        frag.append(h('button', { type: 'button', role: 'listitem', class: 'rank-row' + (sel ? ' sel' : ''), onclick: () => select(lvl, id, true), title: lvl === 'pow' ? 'woj. ' + wname : null },
          h('span', { class: 'pos' }, String(i + 1)),
          h('span', { class: 'nm' }, st ? h('span', { class: 'st-dot', style: 'background:' + st.color, icon: st.icon, title: st.label }) : null, name),
          h('span', { class: 'val' }, m.fmt(v)),
          h('span', { class: 'bar' }, h('i', { style: 'width:' + Math.max(1, v / (max || 1) * 100).toFixed(1) + '%' }))
        ));
      });
      list.append(frag);
      meta.textContent = q ? 'Znaleziono: ' + shown : (lvl === 'woj' ? '16 województw' : rows.length + ' powiatów, w tym 66 miast na prawach powiatu');
    }
    fillList();
  }

  // ---------------------------------------------------------------- bazy
  let addingBase = false;
  function setAdding(on) {
    addingBase = on;
    $('map-hint').hidden = !on;
    $('map-card').classList.toggle('map-adding', on);
    if (on) toast('Kliknij na mapie miejsce bazy');
  }
  function nearestCityName(lat, lng) {
    let best = null, bd = 1e9;
    for (const p of DATA.pow) {
      if (!p.city) continue;
      const d = hav(lat, lng, p.c[0], p.c[1]);
      if (d < bd) { bd = d; best = p; }
    }
    return best && bd < 20 ? best.name.replace(/^m\.\s*/, '') : null;
  }
  function addBase(latlng, name) {
    setAdding(false);
    const id = 'b' + Date.now().toString(36);
    const nm = name || nearestCityName(latlng.lat, latlng.lng) || 'Baza ' + (state.bases.length + 1);
    state.bases.push({ id, name: nm, lat: Math.round(latlng.lat * 10000) / 10000, lng: Math.round(latlng.lng * 10000) / 10000, r: 80 });
    onDataChange();
    openTab('bazy');
    toast('Dodano bazę: ' + nm);
  }
  function renderBases() {
    const box = $('tab-bazy');
    box.textContent = '';
    box.append(h('p', { class: 'hint' }, 'Baza to miejsce, z którego jeździ technik. Koło pokazuje zasięg dojazdu w standardowej cenie. Pinezkę możesz przeciągnąć na mapie.'));
    const T = TOTAL.covered;
    const share = TOTAL.pool ? T.pool / TOTAL.pool * 100 : 0;
    box.append(h('div', { class: 'base-total' },
      h('div', { class: 't' }, 'Wszystkie bazy razem (bez liczenia podwójnie nakładających się kół)'),
      h('div', { class: 'row' },
        h('div', null, h('div', { class: 'v' }, fmtDec(share, 1) + '%'), h('div', { class: 'l' }, 'potencjału Polski w zasięgu')),
        h('div', null, h('div', { class: 'v' }, fmtInt(T.ours)), h('div', { class: 'l' }, 'Twoich zleceń rocznie')),
        h('div', null, h('div', { class: 'v' }, fmtTech(T.techs)), h('div', { class: 'l' }, 'techników'))
      )
    ));
    if (state.mode === 'biz') box.append(baseBizBlock(unionFrac, 'Wszystkie bazy razem · model biznesowy · ' + state.B.year + ' r.'));
    state.bases.forEach((b) => {
      const fm = baseFrac.get(b.id) || new Map();
      const st = sumStats([...fm].map(([pid, f]) => [R.pow.get(pid), f]));
      const top = [...fm].map(([pid, f]) => [pid, R.pow.get(pid).pool * f]).sort((a, c) => c[1] - a[1]).slice(0, 5).map(([pid]) => POW_BY_ID.get(pid).name);
      const nameInp = h('input', { class: 'base-name', value: b.name, 'aria-label': 'Nazwa bazy', maxlength: '40' });
      nameInp.addEventListener('change', () => { b.name = nameInp.value.trim() || b.name; save(); drawBases(); drawCities(); renderLegend(); });
      const rLabel = h('b', null, b.r + ' km');
      const range = h('input', { type: 'range', min: '20', max: '200', step: '5', value: String(b.r), 'aria-label': 'Promień dojazdu w km' });
      const liveR = rafThrottle(() => { b.r = +range.value; rLabel.textContent = b.r + ' km'; onDataChange(true); });
      range.addEventListener('input', liveR);
      range.addEventListener('change', () => renderBases());
      box.append(h('div', { class: 'base-card' },
        h('div', { class: 'row1' },
          h('span', { class: 'pin-mini', icon: 'pin' }),
          nameInp,
          h('button', { type: 'button', class: 'icon-btn', title: 'Pokaż na mapie', 'aria-label': 'Pokaż na mapie', icon: 'target', onclick: () => map.flyTo([b.lat, b.lng], 8, { duration: 0.6 }) }),
          h('button', { type: 'button', class: 'icon-btn', title: 'Usuń bazę', 'aria-label': 'Usuń bazę', icon: 'x', onclick: () => { state.bases = state.bases.filter((x) => x !== b); if (state.A.calibBase === b.id) state.A.calibBase = null; onDataChange(); renderBases(); } })
        ),
        h('div', { class: 'range-row' }, 'Promień dojazdu: ', rLabel, range),
        h('div', { class: 'base-stats' },
          h('div', null, h('b', null, fmtInt(st.pool)), h('span', null, 'domów z podłogówką do czyszczenia')),
          h('div', null, h('b', null, fmtInt(st.market)), h('span', null, 'zleceń rocznie na rynku realnym')),
          h('div', null, h('b', null, fmtInt(st.ours)), h('span', null, calibRate != null ? 'Twoich zleceń (tempo z kalibracji)' : 'Twoich zleceń (' + state.A.share + '% rynku)')),
          h('div', null, h('b', null, fmtTech(st.techs)), h('span', null, 'techników · ' + fmtMoney(st.oursRevenue) + ' rocznie'))
        ),
        top.length ? h('div', { class: 'base-top' }, 'Najwięcej potencjału w zasięgu: ' + top.join(', ')) : null,
        state.mode === 'biz' ? baseBizBlock(fm) : null
      ));
    });
    const citySel = h('select', { class: 'select-plain', 'aria-label': 'Dodaj bazę w mieście' });
    citySel.append(h('option', { value: '' }, '…albo dodaj bazę w mieście'));
    DATA.pow.filter((p) => p.city).map((p) => [p.name.replace(/^m\.\s*/, ''), p]).sort((a, c) => a[0].localeCompare(c[0], 'pl')).forEach(([nm, p]) => citySel.append(h('option', { value: p.id }, nm)));
    citySel.addEventListener('change', () => {
      const p = POW_BY_ID.get(citySel.value);
      if (p) addBase({ lat: p.c[0], lng: p.c[1] }, p.name.replace(/^m\.\s*/, ''));
    });
    box.append(h('div', { class: 'add-row' },
      h('button', { type: 'button', class: 'btn btn-yellow', onclick: () => setAdding(true) }, 'Postaw bazę na mapie ', h('span', { class: 'arrow' }, '↗')),
      citySel
    ));
  }

  // ---------------------------------------------------------------- założenia
  function slider(key, label, min, max, step, unit, src, fmt) {
    const A = state.A;
    const val = h('b', null, (fmt ? fmt(A[key]) : A[key]) + unit);
    const inp = h('input', { type: 'range', min: String(min), max: String(max), step: String(step), value: String(A[key]), 'aria-label': label });
    const update = rafThrottle(() => { state.A[key] = +inp.value; val.textContent = (fmt ? fmt(state.A[key]) : state.A[key]) + unit; onAssumptionChange(); });
    inp.addEventListener('input', update);
    return h('div', { class: 'as-row' }, h('div', { class: 'top' }, h('span', null, label), val), inp, src ? h('div', { class: 'src' }, src) : null);
  }
  function numberField(key, label, min, max, step, src) {
    const inp = h('input', { type: 'number', min: String(min), max: String(max), step: String(step), value: String(state.A[key]), 'aria-label': label });
    inp.addEventListener('change', () => {
      let v = +inp.value;
      if (!isFinite(v)) v = DEFAULTS[key];
      v = Math.min(max, Math.max(min, v));
      inp.value = String(v);
      state.A[key] = v;
      onAssumptionChange(true);
    });
    return h('div', { class: 'as-row' }, h('div', { class: 'top' }, h('span', null, label)), inp, src ? h('div', { class: 'src' }, src) : null);
  }
  let curveBox = null, calibOut = null;
  function renderAssumptions() {
    const box = $('tab-zalozenia');
    box.textContent = '';
    box.append(h('p', { class: 'hint' }, 'Zmiany przeliczają mapę od razu. Dane GUS są stałe, regulujesz tylko założenia rynkowe.'));

    curveBox = h('div', { class: 'curve' });
    box.append(h('div', { class: 'as-group' },
      h('h3', null, 'Ile nowych domów ma podłogówkę'),
      h('p', { class: 'gdesc' }, 'Odsetek domów oddanych w danym roku, które mają wodną podłogówkę choćby na parterze. Między punktami liczymy liniowo.'),
      slider('s1995', 'Domy z 1995 r.', 0, 60, 1, '%'),
      slider('s2005', 'Domy z 2005 r.', 0, 80, 1, '%'),
      slider('s2015', 'Domy z 2015 r.', 0, 100, 1, '%'),
      slider('s2025', 'Domy z 2025 r.', 0, 100, 1, '%', 'Szacunek: pompy ciepła prawie zawsze idą z podłogówką (PORT PC: 3% nowych domów w 2010, 12,5% w 2017, potem wyraźny wzrost), przy kotłach gazowych podłogówka jest częsta, ale nie zawsze.'),
      curveBox
    ));
    drawCurve();

    box.append(h('div', { class: 'as-group' },
      h('h3', null, 'Kiedy instalacja jest do czyszczenia'),
      slider('minAge', 'Minimalny wiek instalacji', 3, 15, 1, ' lat', 'Strona: „Ponad 8 lat bez czyszczenia” jako objaw; „co 8–10 lat warto czyścić instalację”.'),
      slider('cycle', 'Cykl czyszczenia', 3, 15, 1, ' lat', 'Rynek teoretyczny = domy do czyszczenia ÷ cykl. Strona podaje 8–10 lat.'),
      slider('retro', 'Starsze domy (sprzed 1995 r.) z podłogówką po remoncie', 0, 15, 0.5, '%', 'Założenie: część starszych domów ma podłogówkę dołożoną przy remoncie.', (v) => fmtDec(v, 1))
    ));

    box.append(h('div', { class: 'as-group' },
      h('h3', null, 'Ile z tego będzie zleceń'),
      slider('adopt', 'Właściciele, którzy w cyklu zamówią czyszczenie', 2, 80, 1, '%', 'Rynek realny. Strona: „Większość podłogówek nie była płukana nigdy”, więc dziś ten odsetek jest niski.'),
      slider('share', 'Twój udział w rynku realnym', 1, 100, 1, '%'),
      numberField('price', 'Średnia wartość zlecenia (zł brutto)', 500, 10000, 50, 'Strona: kompleksowe czyszczenie od 2 200 zł brutto (dom ok. 120–150 m²).'),
      numberField('capacity', 'Zleceń na jednego technika rocznie', 50, 1000, 10, '2 wizyty dziennie × ok. 200 dni pracy = 400.')
    ));

    const baseSel = h('select', { 'aria-label': 'Baza do kalibracji' });
    baseSel.append(h('option', { value: '' }, 'Wybierz bazę'));
    state.bases.forEach((b) => baseSel.append(h('option', { value: b.id, selected: state.A.calibBase === b.id ? true : null }, b.name)));
    baseSel.addEventListener('change', () => { state.A.calibBase = baseSel.value || null; onAssumptionChange(true); });
    const ord = h('input', { type: 'number', min: '0', max: '2000', step: '1', value: String(state.A.calibOrders || 0), 'aria-label': 'Opłacone zlecenia miesięcznie w tej bazie' });
    ord.addEventListener('change', () => { state.A.calibOrders = Math.max(0, +ord.value || 0); onAssumptionChange(true); });
    calibOut = h('div', { class: 'calib-out' });
    box.append(h('div', { class: 'as-group' },
      h('h3', null, 'Kalibracja z bazy, w której już działamy'),
      h('p', { class: 'gdesc' }, 'Wpisz, ile opłaconych czyszczeń miesięcznie robicie w danej bazie. Model przeliczy, jaki procent rynku teoretycznego tam zdobywacie, i przyłoży to tempo do każdego regionu. Wpisz 0, żeby wyłączyć.'),
      h('div', { class: 'as-row' }, h('div', { class: 'top' }, h('span', null, 'Baza')), baseSel),
      h('div', { class: 'as-row' }, h('div', { class: 'top' }, h('span', null, 'Opłacone zlecenia miesięcznie')), ord),
      calibOut
    ));
    renderCalibOut();

    box.append(h('details', { class: 'as-group adv' },
      h('summary', null, 'Wagi wskaźnika skalowania'),
      h('p', { class: 'gdesc' }, 'Wskaźnik 0–100 łączy pozycję regionu w czterech rankingach. Wagi są względne.'),
      slider('wPot', 'Wielkość rynku', 0, 100, 5, ''),
      slider('wDen', 'Gęstość (krótsze trasy techników)', 0, 100, 5, ''),
      slider('wInc', 'Zamożność (dochód na osobę)', 0, 100, 5, ''),
      slider('wDyn', 'Dynamika (młodsze podłogówki w drodze)', 0, 100, 5, '')
    ));

    box.append(h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' },
      h('button', { type: 'button', class: 'btn btn-ghost btn-small', onclick: () => { state.A = Object.assign({}, DEFAULTS, { calibBase: state.bases[0] ? state.bases[0].id : null }); onAssumptionChange(true); renderAssumptions(); toast('Przywrócono domyślne założenia'); } }, 'Przywróć domyślne założenia')
    ));
  }
  function renderCalibOut() {
    if (!calibOut) return;
    calibOut.textContent = '';
    if (calibRate == null) {
      calibOut.append('Kalibracja wyłączona. Twoje zlecenia liczymy jako ' + state.A.share + '% rynku realnego.');
      return;
    }
    const pctTheo = calibRate * 100;
    const equivShare = state.A.adopt > 0 ? calibRate / (state.A.adopt / 100) * 100 : 0;
    calibOut.append(h('b', null, 'Kalibracja aktywna. '), 'W bazie ' + baseName(state.A.calibBase) + ' zdobywacie rocznie ' + fmtDec(pctTheo, 1) + '% rynku teoretycznego (to tyle, co ' + fmtDec(equivShare, 0) + '% rynku realnego przy obecnym odsetku zamawiających). To tempo przykładamy do wszystkich regionów i baz.');
  }
  function drawCurve() {
    if (!curveBox) return;
    curveBox.textContent = '';
    const W = 320, H = 70, ml = 28, mr = 6, mt = 6, mb = 16;
    const s = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Krzywa udziału podłogówki w nowych domach' });
    const pw = W - ml - mr, ph = H - mt - mb;
    [0, 50, 100].forEach((v) => {
      const y = mt + ph - v / 100 * ph;
      s.append(svgEl('line', { x1: ml, x2: W - mr, y1: y, y2: y, stroke: v === 0 ? '#c3d3df' : '#e8f0f5' }));
      const t = svgEl('text', { x: ml - 5, y: y + 3.5, 'text-anchor': 'end', 'font-size': 9.5, fill: '#7a879c', 'font-family': 'Inter, sans-serif' });
      t.textContent = v + '%';
      s.append(t);
    });
    let d = '';
    for (let y = 1995; y <= 2025; y++) {
      const x = ml + (y - 1995) / 30 * pw, yy = mt + ph - shareAt(y, state.A) * ph;
      d += (y === 1995 ? 'M' : 'L') + x.toFixed(1) + ',' + yy.toFixed(1);
    }
    s.append(svgEl('path', { d, fill: 'none', stroke: '#0f62cc', 'stroke-width': 2, 'stroke-linejoin': 'round' }));
    [1995, 2005, 2015, 2025].forEach((y) => {
      const x = ml + (y - 1995) / 30 * pw, yy = mt + ph - shareAt(y, state.A) * ph;
      s.append(svgEl('circle', { cx: x, cy: yy, r: 4, fill: '#0f62cc', stroke: '#fff', 'stroke-width': 2 }));
      const t = svgEl('text', { x, y: H - 3, 'text-anchor': 'middle', 'font-size': 9.5, fill: '#7a879c', 'font-family': 'Inter, sans-serif' });
      t.textContent = String(y);
      s.append(t);
    });
    curveBox.append(s);
  }

  // ---------------------------------------------------------------- model biznesowy (tryb „Model biznesowy”)
  // Dokładka do mapy potencjału: te same dane, przeliczone na ekipy, opiekunów, leady i pieniądze.
  // Tryb potencjału działa bez zmian; wszystko poniżej włącza się tylko przy state.mode === 'biz'.
  const NEG_FILL = '#f2b8b3';
  const HERO_BIZ = {
    badge: 'Model biznesowy',
    title: 'Ilu ludzi potrzeba i ile z tego zostaje?',
    sub: 'Te same dane co na mapie potencjału, przeliczone na ekipy techników, opiekunów klienta, leady i pieniądze. Rozstaw ekipy w zakładce Plan albo przyciskami + i − w karcie województwa. Zmieniaj liczbę czyszczeń dziennie, ceny i koszty, a liczby przeliczą się od razu.'
  };
  const HERO_POT = {};
  const CREW_TARGET_DEFAULT = 16;
  let BT = null;
  let pillAnchors = [];
  let planA = null, planB = null, planS = null;

  function curMetric() { return state.mode === 'biz' ? BIZ_METRICS[state.bizMetric] : METRICS[state.metric]; }
  function curVal(r) {
    if (!r) return 0;
    if (state.mode === 'biz') return r.b ? r.b[state.bizMetric] : 0;
    return r[state.metric];
  }
  function legendTitle(m) { return state.mode === 'biz' ? m.legend + ' · ' + state.B.year + ' r.' : m.legend; }
  function shortMoney(v) {
    const a = Math.abs(v || 0);
    if (a >= 1e6) return nf1.format(v / 1e6) + ' mln';
    if (a >= 1e3) return nf0.format(v / 1e3) + ' tys.';
    return nf0.format(Math.round(v || 0));
  }
  function signedTxt(s, v) { return v > 0.5 ? '+' + s : s; }
  function jobsTxt(v) {
    if (v >= 10) return fmtInt(v) + ' ' + plural(v, 'zlecenie', 'zlecenia', 'zleceń');
    return fmtDec(v, 1) + ' zlecenia';
  }
  function fteTxt(v) { return fmtDec(v, 1) + ' etatu'; }
  // ekipy rozstawione ręcznie są całe, więc bez przecinka; etaty z popytu z jednym miejscem po przecinku
  function fmtCrew(v) { return v >= 1 && Math.abs(v - Math.round(v)) < 1e-9 ? fmtInt(v) : fmtDec(v, 1); }
  function jobsGen(v) { // dopełniacz: „z 33 zleceń”
    if (v >= 10) return fmtInt(v) + ' ' + (Math.round(v) === 1 ? 'zlecenia' : 'zleceń');
    return fmtDec(v, 1) + ' zlecenia';
  }

  function sanitizeOvr(o) {
    const out = { woj: {}, pow: {} };
    ['woj', 'pow'].forEach((lvl) => {
      const src = (o && o[lvl]) || {};
      for (const id in src) {
        const x = src[id] || {}, y = {};
        if (typeof x.price === 'number' && x.price >= 300 && x.price <= 20000) y.price = x.price;
        if (x.perDay === 1 || x.perDay === 2) y.perDay = x.perDay;
        if (typeof x.share === 'number' && x.share >= 0 && x.share <= 100) y.share = x.share;
        if (Object.keys(y).length) out[lvl][String(id).slice(0, 8)] = y;
      }
    });
    return out;
  }

  function sanitizeCrews(o) {
    const out = { woj: {}, pow: {} };
    ['woj', 'pow'].forEach((lvl) => {
      const src = (o && o[lvl]) || {};
      for (const id in src) { const v = Math.round(+src[id]); if (v >= 1 && v <= 60) out[lvl][String(id).slice(0, 8)] = v; }
    });
    return out;
  }

  // parametry regionu: własne ustawienie → ustawienie województwa (dla powiatu) → plan
  function inheritedParams(lvl, id) {
    const B = state.B;
    const p = { price: B.price, perDay: B.perDay, share: null, from: 'plan' };
    if (lvl === 'pow') {
      const wo = state.ovr.woj[POW_BY_ID.get(id).woj];
      if (wo) {
        if (wo.price != null) { p.price = wo.price; p.from = 'woj'; }
        if (wo.perDay != null) { p.perDay = wo.perDay; p.from = 'woj'; }
        if (wo.share != null) { p.share = wo.share; p.from = 'woj'; }
      }
    }
    return p;
  }
  function effParams(lvl, id) {
    const p = inheritedParams(lvl, id);
    const o = state.ovr[lvl] && state.ovr[lvl][id];
    if (o) {
      if (o.price != null) p.price = o.price;
      if (o.perDay != null) p.perDay = o.perDay;
      if (o.share != null) p.share = o.share;
    }
    return p;
  }

  // jedna komórka modelu: z liczby zleceń miesięcznie robimy zespół i rachunek
  function bizFromJobs(jobs, market, p) {
    const B = state.B;
    const cap = Math.max(0.1, p.perDay * B.days);
    const close = Math.max(0.1, B.close) / 100;
    const b = { jobs, market, price: p.price, perDay: p.perDay, p };
    b.tech = jobs / cap;
    b.leads = jobs / close;
    b.reps = b.leads / Math.max(1, B.leadsPerRep);
    b.rev = jobs * p.price / (1 + B.vat / 100);
    b.ads = b.leads * B.cpl;
    b.repC = b.reps * B.repCost + jobs * B.repBonus;
    b.techC = b.tech * B.techCost + jobs * B.techBonus;
    b.varC = jobs * B.jobCost;
    b.feeC = jobs * B.fee;
    b.cost = b.ads + b.repC + b.techC + b.varC + b.feeC;
    b.profit = b.rev - b.cost;
    b.margin = b.rev > 0 ? b.profit / b.rev : 0;
    b.shareEff = market > 0 ? jobs / market : 0;
    b.bTech = b.tech; b.bProfit = b.profit; b.bRev = b.rev; b.bJobs = jobs; b.bLeads = b.leads; b.bReps = b.reps; b.bAds = b.ads; b.bFee = b.feeC;
    return b;
  }

  // scenariusz ekip: co najmniej jedno województwo ma ekipy rozstawione przez użytkownika
  function scnActive() { return Object.keys(state.crews.woj).some((id) => state.crews.woj[id] > 0); }
  function computeBiz() {
    if (!DATA) return;
    const A = state.A, Y = state.B.year, days = state.B.days;
    const scn = scnActive();
    // 1) popyt w każdym regionie
    ['woj', 'pow'].forEach((lvl) => {
      for (const u of DATA[lvl]) {
        const r = R[lvl].get(u.id);
        let theo = r.theo, pool = r.pool;
        if (Y !== NOW) { const bc = baseCalc(u, A, Y); theo = bc.theo; pool = bc.pool; }
        const marketY = theo * A.adopt / 100;
        const p = effParams(lvl, u.id);
        const oursY = p.share != null ? marketY * p.share / 100 : (calibRate != null ? theo * calibRate : marketY * A.share / 100);
        r.bPool = pool;
        r.bTheo = theo / 12;
        r.b = bizFromJobs(oursY / 12, marketY / 12, p);
        r.bDem = r.b;
      }
    });
    // 2) ekipy w województwach; przy scenariuszu województwa bez ekip nie mają zleceń
    for (const u of DATA.woj) {
      const r = R.woj.get(u.id), n = state.crews.woj[u.id] || 0, d = r.bDem;
      if (n > 0) { r.b = bizFromJobs(n * d.p.perDay * days, d.market, d.p); r.b.crews = n; }
      else if (scn) { r.b = bizFromJobs(0, d.market, d.p); r.b.crews = 0; }
    }
    // 3) powiaty: własne ekipy albo, przy scenariuszu, część zleceń województwa według wielkości rynku
    const powMarket = new Map();
    if (scn) for (const u of DATA.pow) powMarket.set(u.woj, (powMarket.get(u.woj) || 0) + R.pow.get(u.id).bDem.market);
    for (const u of DATA.pow) {
      const r = R.pow.get(u.id), n = state.crews.pow[u.id] || 0, d = r.bDem;
      if (n > 0) { r.b = bizFromJobs(n * d.p.perDay * days, d.market, d.p); r.b.crews = n; }
      else if (scn) {
        const w = R.woj.get(u.woj).b, tot = powMarket.get(u.woj) || 0;
        r.b = bizFromJobs(tot > 0 ? w.jobs * d.market / tot : 0, d.market, d.p);
        r.b.fromWoj = true;
      }
    }
    ['woj', 'pow'].forEach((lvl) => {
      for (const u of DATA[lvl]) {
        const r = R[lvl].get(u.id);
        r.b.sat = r.b.market > 0 ? r.b.jobs / r.b.market : 0;
        r.b.satTheo = r.bTheo > 0 ? r.b.jobs / r.bTheo : 0;
        r.b.bSat = r.b.sat;
      }
    });
    BT = teamSummary(scn ? crewItems() : polandItems());
    BT.scn = scn;
  }

  function sumBiz(entries) {
    const t = { jobs: 0, market: 0, tech: 0, leads: 0, reps: 0, rev: 0, ads: 0, repC: 0, techC: 0, varC: 0, feeC: 0, cost: 0, profit: 0 };
    for (const [b, f] of entries) for (const k in t) t[k] += (b[k] || 0) * f;
    t.margin = t.rev > 0 ? t.profit / t.rev : 0;
    return t;
  }
  function peopleFor(x) { return x <= 0.05 ? 0 : Math.max(1, Math.ceil(x - 0.1)); }
  // pełne etaty: ekipy zaokrąglamy w górę w każdym województwie, opiekunów łącznie (dzwonią do wszystkich regionów)
  function teamSummary(items) {
    const t = sumBiz(items.map((x) => [x.b, 1]));
    const byWoj = new Map();
    items.forEach((x) => byWoj.set(x.woj, (byWoj.get(x.woj) || 0) + x.b.tech));
    let tp = 0;
    for (const v of byWoj.values()) tp += peopleFor(v);
    const rp = peopleFor(t.reps);
    t.tp = tp; t.rp = rp;
    t.fullProfit = t.profit - (tp - t.tech) * state.B.techCost - (rp - t.reps) * state.B.repCost;
    return t;
  }
  function planItems(lvl, keys) {
    const ks = keys || PLAN_KEYS;
    return Object.keys(state.marks[lvl]).filter((id) => ks.includes(state.marks[lvl][id].s) && R[lvl].has(id) && R[lvl].get(id).b)
      .map((id) => ({ id, lvl, s: state.marks[lvl][id].s, b: R[lvl].get(id).b, woj: lvl === 'woj' ? id : POW_BY_ID.get(id).woj }));
  }
  function polandItems() { return DATA.woj.map((u) => ({ id: u.id, lvl: 'woj', b: R.woj.get(u.id).b, woj: u.id })); }
  // regiony z ekipami ustawionymi przez użytkownika; ekipy powiatu liczymy tylko wtedy, gdy jego województwo nie ma własnych
  function crewItems() {
    const out = [], wojWith = new Set();
    for (const id in state.crews.woj) {
      if (state.crews.woj[id] > 0 && R.woj.has(id)) { wojWith.add(id); out.push({ id, lvl: 'woj', b: R.woj.get(id).b, woj: id }); }
    }
    for (const id in state.crews.pow) {
      if (!(state.crews.pow[id] > 0) || !R.pow.has(id)) continue;
      const w = POW_BY_ID.get(id).woj;
      if (!wojWith.has(w)) out.push({ id, lvl: 'pow', b: R.pow.get(id).b, woj: w });
    }
    return out;
  }
  function crewTotal(items) { return items.reduce((s, x) => s + (x.b.crews || 0), 0); }
  // scenariusz: N ekip po województwach według realnego rynku w wybranym roku. Każdą kolejną ekipę dostaje
  // województwo z największym rynkiem na ekipę (metoda D'Hondta), więc żadne nie jest bardziej nasycone niż trzeba.
  function distributeCrews(n) {
    n = Math.max(0, Math.min(200, Math.round(+n) || 0));
    const ws = DATA.woj.map((u) => ({ id: u.id, w: Math.max(0, R.woj.get(u.id).bDem.market || 0), f: 0 }));
    const out = {};
    if (ws.some((x) => x.w > 0)) {
      for (let i = 0; i < n; i++) {
        let best = null;
        for (const x of ws) if (x.f < 60 && (!best || x.w / (x.f + 1) > best.w / (best.f + 1))) best = x;
        if (!best) break;
        best.f += 1;
      }
      ws.forEach((x) => { if (x.f > 0) out[x.id] = x.f; });
    }
    state.crews = { woj: out, pow: {} };
  }
  // udział ekip w realnym rynku w innym roku (te same ekipy, rynek rośnie)
  function crewSatIn(items, y) {
    let jobs = 0, market = 0;
    for (const x of items) {
      const u = x.lvl === 'woj' ? WOJ_BY_ID.get(x.id) : POW_BY_ID.get(x.id);
      jobs += x.b.jobs;
      market += baseCalc(u, state.A, y).theo * state.A.adopt / 100 / 12;
    }
    return market > 0 ? jobs / market : 0;
  }

  // jedno czyszczenie przy ustawieniach planu
  function unitEcon(perDay) {
    const B = state.B;
    const pd = perDay || B.perDay;
    const close = Math.max(0.1, B.close) / 100;
    const net = B.price / (1 + B.vat / 100);
    const ads = B.cpl / close;
    const rep = B.repCost / (Math.max(1, B.leadsPerRep) * close) + B.repBonus;
    const tech = B.techCost / Math.max(0.1, pd * B.days) + B.techBonus;
    const profit = net - ads - rep - tech - B.jobCost - B.fee;
    const beforeCrew = net - ads - rep - B.techBonus - B.jobCost - B.fee;
    return { gross: B.price, vat: B.price - net, net, ads, rep, tech, mat: B.jobCost, fee: B.fee, profit, margin: net > 0 ? profit / net : 0, breakEven: beforeCrew > 0 ? B.techCost / beforeCrew : Infinity };
  }

  // ---------- elementy widoku
  function unitIcons(fte, max) {
    const wrap = h('div', { class: 'units', 'aria-hidden': 'true' });
    const n = Math.ceil(fte - 1e-9);
    const show = Math.min(n, max || 14);
    for (let i = 0; i < show; i++) {
      const f = Math.max(0, Math.min(1, fte - i));
      wrap.append(h('span', { class: 'unit', style: '--f:' + (f * 100).toFixed(0) + '%', icon: 'person' }));
    }
    if (n > show) wrap.append(h('span', { class: 'unit-more' }, '+' + (n - show)));
    return wrap;
  }
  function teamRow(icon, v, l, fte) {
    return h('div', { class: 'team-row' }, h('span', { class: 'ti', icon }), h('div', { class: 'tx' }, h('div', { class: 'tv' }, v), h('div', { class: 'tl' }, l)), fte > 0 ? unitIcons(fte) : null);
  }
  function flowRow(b) {
    const st = (v, l, cls) => h('div', { class: 'st' + (cls ? ' ' + cls : '') }, h('b', null, v), h('span', null, l));
    return h('div', { class: 'flow' },
      st(fmtInt(b.leads), plural(b.leads, 'lead', 'leady', 'leadów') + ' / mies. · reklamy ' + fmtMoney(b.ads)),
      st(fmtDec(b.jobs, b.jobs < 10 ? 1 : 0), 'zleceń / mies. (' + fmtDec(state.B.close, 0) + '% leadów)'),
      st(fmtMoney(b.rev), 'przychodu netto / mies.'),
      st(fmtMoney(b.profit), 'zysku firmy / mies.', b.profit < 0 ? 'neg' : 'ok')
    );
  }
  function waterfall(start, costs, endLabel, endNote) {
    let run = start.value, lo = 0;
    const hi = Math.max(start.value, 1);
    const segs = costs.map((c) => { const from = run; run -= c.value; lo = Math.min(lo, run); return Object.assign({ a: run, b: from }, c); });
    const end = run;
    const span = (hi - lo) || 1;
    const pos = (x) => (x - lo) / span * 100;
    const box = h('div', { class: 'wf', role: 'table', 'aria-label': 'Rachunek: ' + start.label + ' minus koszty' });
    const row = (cls, label, a, b, text, note) => box.append(h('div', { class: 'wf-row ' + cls, role: 'row' },
      h('div', { class: 'wf-l', role: 'cell' }, label, note ? h('span', { class: 'wf-note' }, note) : null),
      h('div', { class: 'wf-bar', role: 'presentation' }, h('i', { style: 'left:' + pos(Math.min(a, b)).toFixed(2) + '%;width:' + Math.max(0.8, Math.abs(pos(b) - pos(a))).toFixed(2) + '%' })),
      h('div', { class: 'wf-v', role: 'cell' }, text)
    ));
    row('start', start.label, 0, start.value, fmtMoney(start.value), start.note);
    segs.forEach((s) => row('cost', s.label, s.a, s.b, '−' + fmtMoney(s.value), s.note));
    row(end >= 0 ? 'end' : 'end neg', endLabel, 0, end, fmtMoney(end), endNote);
    return { el: box, end };
  }
  function pnlWaterfall(b) {
    const B = state.B;
    return waterfall({ label: 'Przychód netto', value: b.rev, note: 'cena bez VAT ' + B.vat + '%' }, [
      { label: 'Reklamy', value: b.ads, note: 'leady × ' + fmtDec(B.cpl, 2) + ' zł' },
      { label: 'Opiekunowie klienta', value: b.repC, note: 'etaty i premie od zleceń' },
      { label: 'Ekipy techników', value: b.techC, note: 'etaty i premie od czyszczeń' },
      { label: 'Chemia, inhibitor, dojazd', value: b.varC },
      { label: 'Twoja prowizja', value: b.feeC, note: fmtInt(B.fee) + ' zł od zlecenia' }
    ], 'Zysk firmy', b.rev > 0 ? 'marża ' + fmtDec(b.profit / b.rev * 100, 0) + '%' : null);
  }

  // ---------- mapa: plakietki z wartością
  function drawBizPills(lvl, placed, hit) {
    pillAnchors = [];
    const m = curMetric();
    let ids;
    if (lvl === 'woj') ids = DATA.woj.map((u) => u.id);
    else ids = Object.keys(state.marks.pow).filter((id) => state.marks.pow[id].s && R.pow.has(id));
    if (lvl === 'pow' && state.selected && state.selected.lvl === 'pow' && R.pow.has(state.selected.id) && !ids.includes(state.selected.id)) ids.push(state.selected.id);
    const order = ids.map((id) => [id, Math.abs(curVal(R[lvl].get(id)) || 0)]).sort((a, b) => b[1] - a[1]).map((x) => x[0]);
    const scn = scnActive();
    for (const id of order) {
      const r = R[lvl].get(id);
      if (scn && r.b && !(r.b.jobs > 0)) continue; // scenariusz: bez ekip, bez plakietki
      const v = curVal(r);
      const u = lvl === 'woj' ? WOJ_BY_ID.get(id) : POW_BY_ID.get(id);
      const pt = map.latLngToContainerPoint(u.c);
      const txt = m.signed ? signedTxt(m.short(v), v) : m.short(v);
      const w = txt.length * 8 + 36;
      let ok = false, dx = 0, dy = 0;
      for (const [ox, oy] of [[0, 0], [0, 26], [0, -26], [0, 52], [0, -52]]) {
        const box = { x1: pt.x + ox - w / 2, x2: pt.x + ox + w / 2, y1: pt.y + oy - 13, y2: pt.y + oy + 13 };
        if (!hit(box)) { placed.push(box); dx = ox; dy = oy; ok = true; break; }
      }
      if (!ok) continue;
      pillAnchors.push({ ll: u.c, dx, dy, w });
      const mk = state.marks[lvl][id];
      const st = mk && mk.s && state.show.marks ? STATUS[mk.s] : null;
      const pill = h('div', {
        class: 'val-pill' + (st ? ' st' : '') + (v < 0 ? ' neg' : ''),
        style: (st ? '--stc:' + st.color + ';' : '') + 'transform:translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px))',
        title: unitTitle(lvl, id) + ': ' + m.fmt(v)
      }, h('span', { class: 'pi', icon: m.icon }), txt);
      layers.marks.addLayer(L.marker(u.c, { pane: 'labels', interactive: false, keyboard: false, icon: L.divIcon({ className: '', html: pill, iconSize: [0, 0] }) }));
    }
  }
  function redrawOverlays() { drawMarks(); drawCities(); }
  function bizLine(b) {
    return fteTxt(b.tech) + ' ekip · ' + fmtInt(b.leads) + ' ' + plural(b.leads, 'lead', 'leady', 'leadów') + ' · zysk ' + fmtMoney(b.profit) + ' / mies.';
  }

  // ---------- panel: region
  function satBar(b) {
    const pct = b.sat * 100;
    const cls = pct <= 60 ? 'ok' : pct <= 100 ? 'warn' : 'bad';
    const txt = pct <= 60 ? 'bezpiecznie' : pct <= 100 ? 'ambitnie' : 'ponad cały realny rynek';
    return h('div', { class: 'sat ' + cls },
      h('div', { class: 'sat-bar' }, h('i', { style: 'width:' + Math.max(1, Math.min(100, pct)).toFixed(1) + '%' })),
      h('div', { class: 'sat-t' }, h('b', null, fmtDec(pct, 0) + '% realnego rynku'), ' · ' + txt + '. ' + jobsTxt(b.jobs) + ' z ok. ' + fmtDec(b.market, 0) + ' miesięcznie (' + fmtDec(b.satTheo * 100, 0) + '% rynku teoretycznego).'));
  }
  function crewsEditor(lvl, id, r) {
    const n = (state.crews[lvl] && state.crews[lvl][id]) || 0;
    const scn = scnActive();
    const base = Math.max(1, Math.ceil(r.bDem.tech - 0.1));
    const setN = (v) => { if (v > 0) state.crews[lvl][id] = Math.min(60, v); else delete state.crews[lvl][id]; onBizChange(); };
    let sub;
    if (n) sub = 'ustawione przez Ciebie, każda robi ' + r.b.perDay + ' ' + plural(r.b.perDay, 'czyszczenie', 'czyszczenia', 'czyszczeń') + ' dziennie';
    else if (scn && lvl === 'woj') sub = 'w Twoim scenariuszu nie ma tu ekip. Popyt przy Twoim udziale dałby ' + fteTxt(r.bDem.tech) + '. Kliknij +, żeby dodać ekipę.';
    else if (scn) sub = 'część ekip województwa według wielkości rynku: ' + fteTxt(r.b.tech) + '. Kliknij +, żeby ustawić ekipy tylko dla tego powiatu.';
    else sub = 'automatycznie z popytu: ' + fteTxt(r.bDem.tech) + '. Kliknij +, żeby rozstawić własne ekipy.';
    const box = h('div', { class: 'crews' },
      h('div', { class: 'crews-top' },
        h('div', null,
          h('div', { class: 'crews-l' }, 'Ekipy w tym regionie'),
          h('div', { class: 'crews-s' }, sub)),
        h('div', { class: 'stepper', role: 'group', 'aria-label': 'Liczba ekip w regionie' },
          h('button', { type: 'button', 'aria-label': 'Mniej ekip', onclick: () => setN(n ? n - 1 : base - 1) }, '−'),
          h('b', null, n ? String(n) : 'auto'),
          h('button', { type: 'button', 'aria-label': 'Więcej ekip', onclick: () => setN(n ? n + 1 : base) }, '+'))),
      satBar(r.b));
    if (n) box.append(h('button', { type: 'button', class: 'link-btn', onclick: () => setN(0) }, lvl === 'woj' && scn ? 'Usuń ekipy z tego województwa' : scn ? 'Wróć do ekip z województwa' : 'Wróć do liczenia z popytu'));
    return box;
  }
  function renderBizRegion(box, lvl, id) {
    const r = R[lvl].get(id), b = r.b, B = state.B, p = b.p;
    const fs = teamSummary([{ b, woj: 'x' }]);
    box.append(h('div', { class: 'section-title' }, 'Zespół i pieniądze w ' + B.year + ' r.'));
    box.append(crewsEditor(lvl, id, r));
    box.append(h('div', { class: 'team' },
      teamRow('wrench', (b.crews ? b.crews + ' ' + plural(b.crews, 'ekipa', 'ekipy', 'ekip') : fteTxt(b.tech) + ' ekip') + ' techników', 'przy ' + p.perDay + ' ' + plural(p.perDay, 'czyszczeniu', 'czyszczeniach', 'czyszczeniach') + ' dziennie i ' + B.days + ' dniach pracy w miesiącu · ' + jobsTxt(b.jobs) + ' / mies.', b.tech),
      teamRow('headset', fteTxt(b.reps) + ' opiekunów klienta', fmtInt(b.leads) + ' ' + plural(b.leads, 'lead', 'leady', 'leadów') + ' miesięcznie przy skuteczności ' + fmtDec(B.close, 0) + '% i ' + fmtInt(B.leadsPerRep) + ' leadach na osobę', b.reps)
    ));
    box.append(flowRow(b));
    box.append(h('div', { class: 'section-title' }, 'Rachunek miesięczny regionu'));
    box.append(pnlWaterfall(b).el);
    if (b.jobs > 0) box.append(h('p', { class: 'hint wf-foot' },
      'Gdyby ten region miał własny zespół na pełnych etatach (' + fs.tp + ' ' + plural(fs.tp, 'ekipa', 'ekipy', 'ekip') + ', ' + fs.rp + ' ' + plural(fs.rp, 'opiekun', 'opiekunów', 'opiekunów') + '): ',
      h('b', { class: fs.fullProfit < 0 ? 'neg' : null }, fmtMoney(fs.fullProfit) + ' zysku miesięcznie'), '. Rocznie: przychód netto ' + fmtMoney(b.rev * 12) + ', Twoja prowizja ' + fmtMoney(b.feeC * 12) + '.'));
    box.append(h('div', { class: 'section-title' }, 'Ustawienia dla tego regionu'));
    box.append(overrideEditor(lvl, id));
    box.append(h('div', { class: 'section-title' }, 'Rynek w regionie (' + B.year + ' r.)'));
    const t = h('table', { class: 'kv' });
    const row = (k, v, src) => t.append(h('tr', null, h('td', null, k, src ? h('span', { class: 'src' }, src) : null), h('td', null, v)));
    row('Twoje zlecenia miesięcznie', fmtDec(b.jobs, 1), p.share != null ? 'udział ustawiony dla regionu: ' + fmtInt(p.share) + '%' : (calibRate != null ? 'tempo z kalibracji (zakładka Założenia)' : state.A.share + '% realnego rynku'));
    row('Realny rynek miesięcznie', fmtDec(b.market, 1) + ' ' + plural(b.market, 'zlecenie', 'zlecenia', 'zleceń'), state.A.adopt + '% właścicieli w cyklu ' + state.A.cycle + ' lat');
    row('Rynek teoretyczny miesięcznie', fmtInt(r.bTheo), 'gdyby każdy dom był czyszczony co ' + state.A.cycle + ' lat');
    row('Domy z podłogówką do czyszczenia', fmtInt(r.bPool), 'instalacje z domów zbudowanych do ' + (B.year - state.A.minAge) + ' r.');
    box.append(t);
    if (B.year > NOW) {
      const now = r.pool, grow = now > 0 ? (r.bPool / now - 1) * 100 : 0;
      box.append(h('p', { class: 'hint', style: 'margin-top:8px' }, 'Prognoza: w ' + B.year + ' r. do czyszczenia będzie ' + fmtDec(grow, 0) + '% więcej domów niż dziś, bo dochodzą podłogówki z lat ' + (NOW - state.A.minAge + 1) + '–' + (B.year - state.A.minAge) + '.'));
    }
    if (lvl === 'woj') {
      const top = DATA.pow.filter((pp) => pp.woj === id).map((pp) => [pp, R.pow.get(pp.id).b]).sort((a, c) => c[1].profit - a[1].profit).slice(0, 6);
      box.append(h('div', { class: 'section-title' }, 'Powiaty z największym zyskiem'));
      const ul = h('ul', { class: 'list-clean mini-list' });
      top.forEach(([pp, bb]) => ul.append(h('li', null, h('button', { type: 'button', onclick: () => select('pow', pp.id, true) }, pp.name), h('span', null, fmtMoney(bb.profit) + ' / mies.'))));
      box.append(ul);
    }
  }
  function renderBizPoland(box) {
    const T = BT, scn = T.scn;
    box.append(h('div', { class: 'region-head' },
      h('div', null, h('div', { class: 'eyebrow' }, (scn ? 'Twoje ekipy · ' : 'Cała Polska · ') + state.B.year + ' r.'), h('h2', null, 'Polska')),
      h('div', { class: 'rank-chip' }, R[state.level].size + ' ' + (state.level === 'woj' ? 'województw' : 'powiatów'))
    ));
    box.append(h('p', { class: 'hint', style: 'margin-top:10px' }, scn
      ? 'Liczby to suma ekip, które rozstawiłeś. Województwa bez ekip nie mają zleceń. Kliknij województwo, żeby zmienić jego ekipy przyciskami + i −, albo wpisz inną liczbę w zakładce Plan.'
      : 'Kliknij województwo albo powiat na mapie, żeby zobaczyć jego zespół i rachunek. Sumę Twojego planu znajdziesz w zakładce Plan.'));
    box.append(h('div', { class: 'team' },
      teamRow('wrench', T.tp + ' ' + plural(T.tp, 'ekipa', 'ekipy', 'ekip'), scn
        ? 'rozstawionych przez Ciebie · ' + jobsTxt(T.jobs) + ' / mies., czyli ' + fmtDec(T.market > 0 ? T.jobs / T.market * 100 : 0, 0) + '% realnego rynku w województwach z ekipami'
        : 'w całej Polsce (' + fteTxt(T.tech) + ', zaokrąglone w każdym województwie) · ' + jobsTxt(T.jobs) + ' / mies.', T.tech),
      teamRow('headset', T.rp + ' ' + plural(T.rp, 'opiekun', 'opiekunów', 'opiekunów') + ' klienta', fmtInt(T.leads) + ' ' + plural(T.leads, 'lead', 'leady', 'leadów') + ' miesięcznie (' + fteTxt(T.reps) + ')', T.reps)
    ));
    box.append(flowRow(T));
    box.append(h('div', { class: 'section-title' }, scn ? 'Rachunek miesięczny Twoich ekip' : 'Rachunek miesięczny: cała Polska'));
    box.append(pnlWaterfall(T).el);
    box.append(h('p', { class: 'hint wf-foot' }, 'Przy pełnych etatach: ', h('b', { class: T.fullProfit < 0 ? 'neg' : null }, fmtMoney(T.fullProfit) + ' zysku miesięcznie'), '.'));
    const top = DATA.woj.map((u) => [u, R.woj.get(u.id).b]).sort((a, c) => c[1].profit - a[1].profit).slice(0, 6);
    box.append(h('div', { class: 'section-title' }, 'Województwa z największym zyskiem'));
    const ul = h('ul', { class: 'list-clean mini-list' });
    top.forEach(([u, bb]) => ul.append(h('li', null, h('button', { type: 'button', onclick: () => select('woj', u.id, true) }, u.name), h('span', null, fmtMoney(bb.profit) + ' / mies.'))));
    box.append(ul);
  }
  function overrideEditor(lvl, id) {
    const wrap = h('div', { class: 'ovr' });
    const own = (state.ovr[lvl] && state.ovr[lvl][id]) || {};
    const inh = inheritedParams(lvl, id);
    const inhShare = inh.share != null ? inh.share : (calibRate != null ? null : state.A.share);
    const fromTxt = lvl === 'pow' && inh.from === 'woj' ? 'jak w województwie' : 'jak w planie';
    const setO = (k, v) => {
      const o = state.ovr[lvl][id] || {};
      if (v == null) delete o[k]; else o[k] = v;
      if (Object.keys(o).length) state.ovr[lvl][id] = o; else delete state.ovr[lvl][id];
      onBizChange();
    };
    const price = h('input', { type: 'number', min: '300', max: '20000', step: '50', placeholder: fmtInt(inh.price) + ' zł (' + fromTxt + ')', 'aria-label': 'Cena brutto w regionie' });
    if (own.price != null) price.value = String(own.price);
    price.addEventListener('change', () => { const v = +price.value; setO('price', price.value === '' || !isFinite(v) ? null : Math.min(20000, Math.max(300, v))); });
    const seg = h('div', { class: 'seg seg-sm', role: 'group', 'aria-label': 'Czyszczeń dziennie na ekipę w regionie' });
    [[null, (fromTxt === 'jak w planie' ? 'Jak w planie' : 'Jak w województwie') + ' (' + inh.perDay + ')'], [1, '1 dziennie'], [2, '2 dziennie']].forEach(([v, l]) => {
      seg.append(h('button', { type: 'button', 'aria-pressed': String((own.perDay == null ? null : own.perDay) === v), onclick: () => setO('perDay', v) }, l));
    });
    const share = h('input', { type: 'number', min: '0', max: '100', step: '1', placeholder: inhShare != null ? fmtInt(inhShare) + '% (' + fromTxt + ')' : 'z kalibracji', 'aria-label': 'Twój udział w realnym rynku w regionie, w procentach' });
    if (own.share != null) share.value = String(own.share);
    share.addEventListener('change', () => { const v = +share.value; setO('share', share.value === '' || !isFinite(v) ? null : Math.min(100, Math.max(0, v))); });
    wrap.append(
      h('div', { class: 'as-row' }, h('div', { class: 'top' }, h('span', null, 'Czyszczeń dziennie na ekipę')), seg),
      h('div', { class: 'as-row' }, h('div', { class: 'top' }, h('span', null, 'Cena dla klienta w regionie (zł brutto)')), price),
      h('div', { class: 'as-row' }, h('div', { class: 'top' }, h('span', null, 'Twój udział w realnym rynku w regionie (%)')), share),
      h('p', { class: 'src', style: 'margin:8px 0 0' }, 'Puste pole znaczy: ' + fromTxt + '.' + (lvl === 'woj' ? ' Ustawienia województwa przejmują też jego powiaty.' : ''))
    );
    if (Object.keys(own).length) wrap.append(h('button', { type: 'button', class: 'btn btn-ghost btn-small', style: 'margin-top:10px', onclick: () => { delete state.ovr[lvl][id]; onBizChange(); } }, 'Wyczyść ustawienia regionu'));
    return wrap;
  }

  // ---------- panel: plan
  function bizSlider(key, label, min, max, step, unit, src, fmt) {
    const show = () => (fmt ? fmt(state.B[key]) : state.B[key]) + unit;
    const val = h('b', null, show());
    const inp = h('input', { type: 'range', min: String(min), max: String(max), step: String(step), value: String(state.B[key]), 'aria-label': label });
    const upd = rafThrottle(() => { state.B[key] = +inp.value; val.textContent = show(); onBizChange({ live: true }); });
    inp.addEventListener('input', upd);
    return h('div', { class: 'as-row' }, h('div', { class: 'top' }, h('span', null, label), val), inp, src ? h('div', { class: 'src' }, src) : null);
  }
  function bizNumber(key, label, min, max, step, src) {
    const inp = h('input', { type: 'number', min: String(min), max: String(max), step: String(step), value: String(state.B[key]), 'aria-label': label });
    inp.addEventListener('change', () => {
      let v = +inp.value;
      if (inp.value === '' || !isFinite(v)) v = BIZ_DEFAULTS[key];
      v = Math.min(max, Math.max(min, v));
      inp.value = String(v);
      state.B[key] = v;
      onBizChange();
    });
    return h('div', { class: 'as-row' }, h('div', { class: 'top' }, h('span', null, label)), inp, src ? h('div', { class: 'src' }, src) : null);
  }
  function perDaySeg() {
    const seg = h('div', { class: 'seg seg-sm', role: 'group', 'aria-label': 'Czyszczeń dziennie na ekipę' });
    [1, 2].forEach((v) => seg.append(h('button', { type: 'button', 'data-pd': String(v), 'aria-pressed': String(state.B.perDay === v), onclick: () => setPerDay(v) }, v + ' dziennie')));
    return seg;
  }
  function yearSelect() {
    const s = h('select', { class: 'select-plain', 'data-year': '1', 'aria-label': 'Rok prognozy' });
    for (let y = NOW; y <= NOW + 7; y++) s.append(h('option', { value: String(y) }, y === NOW ? y + ' (dziś)' : String(y)));
    s.value = String(state.B.year);
    s.addEventListener('change', () => setYear(+s.value));
    return s;
  }
  function renderPlan() {
    const box = $('tab-plan');
    box.textContent = '';
    planA = h('div');
    planB = h('div');
    planS = h('div');
    const B = state.B;
    const scnInput = h('input', { type: 'number', min: '1', max: '200', step: '1', value: String(crewTotal(crewItems()) || CREW_TARGET_DEFAULT), 'aria-label': 'Liczba ekip do rozstawienia' });
    const runScn = () => {
      const n = Math.max(1, Math.min(200, Math.round(+scnInput.value) || CREW_TARGET_DEFAULT));
      scnInput.value = String(n);
      distributeCrews(n);
      if (state.level !== 'woj') { state.level = 'woj'; if (state.selected && state.selected.lvl !== 'woj') state.selected = null; applyLevel(); }
      onBizChange();
      toast('Rozstawiono ' + n + ' ' + plural(n, 'ekipę', 'ekipy', 'ekip') + ' według wielkości rynku w województwach');
    };
    scnInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') runScn(); });
    const scnGroup = h('div', { class: 'as-group scn' },
      h('h3', null, 'Scenariusz: ile ekip'),
      h('p', { class: 'gdesc' }, 'Wpisz liczbę ekip i rozstaw je po województwach według wielkości realnego rynku. Potem poprawisz je przyciskami + i − w karcie województwa.'),
      h('div', { class: 'scn-row' }, scnInput, h('button', { type: 'button', class: 'btn btn-blue btn-small', onclick: runScn }, 'Rozstaw według rynku')),
      planS);
    const shareRow = (() => {
      const val = h('b', null, state.A.share + '%');
      const inp = h('input', { type: 'range', min: '1', max: '100', step: '1', value: String(state.A.share), 'aria-label': 'Twój udział w realnym rynku' });
      inp.addEventListener('input', rafThrottle(() => { state.A.share = +inp.value; val.textContent = state.A.share + '%'; onAssumptionChange(); }));
      return h('div', { class: 'as-row' }, h('div', { class: 'top' }, h('span', null, 'Twój udział w realnym rynku'), val), inp,
        h('div', { class: 'src' }, calibRate != null ? 'Kalibracja jest włączona (zakładka Założenia), więc zlecenia liczymy z tempa w bazie, a ten suwak nie działa.' : 'To samo założenie co w trybie potencjału. Konin dziś: ok. 30 zleceń miesięcznie wychodzi przy ok. 30%.'));
    })();
    box.append(
      scnGroup,
      planA,
      h('div', { class: 'as-group' },
        h('h3', null, 'Najważniejsze dźwignie'),
        h('div', { class: 'as-row' }, h('div', { class: 'top' }, h('span', null, 'Czyszczeń dziennie na ekipę')), perDaySeg(),
          h('div', { class: 'src' }, 'Strona: „1 dzień tyle trwa czyszczenie całego domu”, sama podłogówka 4–7 h. Kalendarz CP01 ma 2 okna dziennie (8–13 i 14–19).')),
        h('div', { class: 'as-row' }, h('div', { class: 'top' }, h('span', null, 'Rok prognozy')), yearSelect(),
          h('div', { class: 'src' }, 'Z każdym rokiem do czyszczenia dochodzą młodsze podłogówki, więc rynek rośnie.')),
        bizNumber('price', 'Cena dla klienta (zł brutto)', 300, 20000, 50, 'Strona: od 2 200 zł brutto. Średnia z zaplanowanych czyszczeń w Notion: ok. 2 180 zł.'),
        bizSlider('close', 'Skuteczność: leady, które kończą się zleceniem', 2, 40, 1, '%', 'Konin, listopad 2026: ok. 8% leadów, z którymi była rozmowa, umówiło czyszczenie, a 30 czeka po propozycji.'),
        bizNumber('cpl', 'Koszt leada (zł)', 0.5, 300, 0.5, 'Kampania Konin od 31.10.2026: 2,54 zł (280 leadów za 711 zł). Przy większym budżecie i nowych regionach licz więcej.'),
        shareRow
      ),
      planB,
      h('details', { class: 'as-group adv' },
        h('summary', null, 'Koszty i wydajność zespołu'),
        h('p', { class: 'gdesc' }, 'Stawki to założenia do zmiany. 8 000 zł brutto na umowie o pracę kosztuje pracodawcę ok. 9 650 zł miesięcznie (ze składkami ZUS pracodawcy).'),
        bizSlider('days', 'Dni pracy ekipy w miesiącu', 15, 26, 1, ' dni', 'Średnio ok. 21 dni roboczych minus urlopy.'),
        bizNumber('techCost', 'Koszt ekipy miesięcznie (zł): pensja z ZUS, auto, sprzęt', 0, 60000, 100),
        bizNumber('techBonus', 'Premia technika od czyszczenia (zł)', 0, 2000, 10),
        bizNumber('jobCost', 'Chemia, inhibitor i dojazd na czyszczenie (zł)', 0, 2000, 10),
        bizNumber('leadsPerRep', 'Leadów miesięcznie na jednego opiekuna klienta', 20, 2000, 10, 'Ile nowych leadów jedna osoba porządnie obsłuży: kilka prób dodzwonienia, SMS, propozycja, przypomnienie.'),
        bizNumber('repCost', 'Koszt opiekuna klienta miesięcznie (zł, z ZUS)', 0, 60000, 100),
        bizNumber('repBonus', 'Premia opiekuna od opłaconego zlecenia (zł)', 0, 2000, 10),
        bizNumber('fee', 'Twoja prowizja od opłaconego zlecenia (zł)', 0, 5000, 10),
        bizNumber('vat', 'VAT od ceny (%)', 0, 23, 1, 'Przy czyszczeniu instalacji w domu zwykle 8%; potwierdźcie stawkę z księgową.')
      ),
      h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' },
        h('button', { type: 'button', class: 'btn btn-ghost btn-small', onclick: () => { state.B = Object.assign({}, BIZ_DEFAULTS); onBizChange(); renderPlan(); syncBizControls(); toast('Przywrócono domyślne założenia modelu biznesowego'); } }, 'Przywróć domyślne założenia modelu')
      )
    );
    renderPlanOutputs();
  }
  function renderCrewScenario(box) {
    const B = state.B, ci = crewItems();
    if (!ci.length) {
      box.append(h('p', { class: 'src', style: 'margin:8px 0 0' }, 'Na razie nie masz rozstawionych ekip, więc mapa liczy ekipy z popytu przy Twoim udziale w rynku.'));
      return;
    }
    const S = teamSummary(ci);
    const theo = ci.reduce((s, x) => s + (R[x.lvl].get(x.id).bTheo || 0), 0);
    const pd = B.perDay + ' ' + plural(B.perDay, 'czyszczeniu', 'czyszczeniach', 'czyszczeniach') + ' dziennie';
    box.append(h('div', { class: 'team', style: 'margin-top:12px' },
      teamRow('wrench', S.tp + ' ' + plural(S.tp, 'ekipa', 'ekipy', 'ekip'), jobsTxt(S.jobs) + ' miesięcznie przy ' + pd + ' · ' + ci.length + ' ' + (ci.every((x) => x.lvl === 'woj') ? plural(ci.length, 'województwo', 'województwa', 'województw') : plural(ci.length, 'region', 'regiony', 'regionów')), S.tech),
      teamRow('headset', S.rp + ' ' + plural(S.rp, 'opiekun', 'opiekunów', 'opiekunów') + ' klienta', fmtInt(S.leads) + ' ' + plural(S.leads, 'lead', 'leady', 'leadów') + ' miesięcznie przy skuteczności ' + fmtDec(B.close, 0) + '% (budżet reklam ' + fmtMoney(S.ads) + ')', S.reps)
    ));
    box.append(satBar(Object.assign({}, S, { sat: S.market > 0 ? S.jobs / S.market : 0, satTheo: theo > 0 ? S.jobs / theo : 0 })));
    const later = [];
    for (const y of [NOW + 2, NOW + 4]) if (y > B.year && y <= NOW + 7) later.push('w ' + y + ' r. ' + fmtDec(crewSatIn(ci, y) * 100, 0) + '%');
    if (later.length) box.append(h('p', { class: 'src', style: 'margin:6px 0 0' }, 'Te same ekipy, a rynek rośnie: ' + later.join(', ') + ' realnego rynku.'));
    box.append(h('p', { class: 'hint wf-foot' }, 'Miesięcznie: przychód netto ' + fmtMoney(S.rev) + ', zysk firmy przy pełnych etatach ', h('b', { class: S.fullProfit < 0 ? 'neg' : null }, fmtMoney(S.fullProfit)), ', Twoja prowizja ' + fmtMoney(S.feeC) + '. Rocznie: przychód netto ' + fmtMoney(S.rev * 12) + ', zysk ' + fmtMoney(S.fullProfit * 12) + ', Twoja prowizja ' + fmtMoney(S.feeC * 12) + '.'));
    const ul = h('ul', { class: 'list-clean mini-list' });
    ci.slice().sort((a, c) => (c.b.crews || 0) - (a.b.crews || 0) || c.b.sat - a.b.sat).forEach((x) => ul.append(h('li', null,
      h('button', { type: 'button', onclick: () => select(x.lvl, x.id, true) }, unitName(x.lvl, x.id)),
      h('span', { class: x.b.sat > 1 ? 'neg' : null }, x.b.crews + ' ' + plural(x.b.crews, 'ekipa', 'ekipy', 'ekip') + ' · ' + fmtDec(x.b.sat * 100, 0) + '% rynku'))));
    box.append(ul);
    box.append(h('button', { type: 'button', class: 'link-btn', onclick: () => { state.crews = { woj: {}, pow: {} }; onBizChange(); toast('Wyczyszczono ekipy. Mapa liczy znowu z popytu.'); } }, 'Wyczyść ekipy i wróć do liczenia z popytu'));
  }
  function renderPlanOutputs() {
    if (!planA || !planB || !planA.isConnected) return;
    planA.textContent = '';
    planB.textContent = '';
    if (planS) { planS.textContent = ''; renderCrewScenario(planS); }
    const lvl = state.level, B = state.B;
    const withCrews = crewItems().length > 0;
    const items = withCrews ? [] : planItems(lvl);
    if (withCrews) {
      // scenariusz ekip zastępuje rachunek planu z oznaczeń
      planA.append(h('div', { class: 'calib-out', style: 'margin-bottom:12px' }, 'Masz rozstawione ekipy, więc mapa i liczby na górze pokazują scenariusz ekip. Rachunek planu z oznaczeń (Działamy, Następny, Testujemy) wróci po wyczyszczeniu ekip.'));
    } else {
      planA.append(h('p', { class: 'hint' }, 'Plan to ', h('b', null, lvl === 'woj' ? 'województwa' : 'powiaty'), ' oznaczone na mapie jako Działamy, Następny albo Testujemy. Status zmienisz w karcie regionu. Liczby na ' + B.year + ' r.'));
      if (lvl === 'pow' && items.length) planA.append(h('p', { class: 'hint' }, 'Przy powiatach liczymy popyt tylko z oznaczonych powiatów, a ekipa jeździ w promieniu ok. 100 km, więc ten rachunek zaniża plan. O liczbie ekip decyduj scenariuszem powyżej albo bazami w zakładce Bazy.'));
    }
    if (withCrews) {
      // nic więcej: podsumowanie ekip jest w scenariuszu powyżej
    } else if (!items.length) {
      planA.append(h('div', { class: 'calib-out', style: 'margin-bottom:12px' }, 'Na tym poziomie nie masz jeszcze regionów w planie. Kliknij region na mapie i oznacz go jako Działamy, Następny albo Testujemy.'));
    } else {
      const T = teamSummary(items);
      const tbl = h('table', { class: 'plan-table' });
      tbl.append(h('tr', null, h('th', null, 'Status'), h('th', null, 'Regiony'), h('th', null, 'Ekipy'), h('th', null, 'Opiekunowie'), h('th', null, 'Leady / mies.'), h('th', null, 'Zysk / mies.')));
      PLAN_KEYS.forEach((k) => {
        const its = items.filter((x) => x.s === k);
        if (!its.length) return;
        const t = sumBiz(its.map((x) => [x.b, 1]));
        tbl.append(h('tr', null,
          h('td', null, h('span', { class: 'st-dot', style: 'background:' + STATUS[k].color, icon: STATUS[k].icon }), STATUS[k].label),
          h('td', null, String(its.length)), h('td', null, fmtDec(t.tech, 1)), h('td', null, fmtDec(t.reps, 1)), h('td', null, fmtInt(t.leads)), h('td', { class: t.profit < 0 ? 'neg' : null }, fmtMoney(t.profit))));
      });
      tbl.append(h('tr', { class: 'total' }, h('td', null, 'Razem'), h('td', null, String(items.length)), h('td', null, fmtDec(T.tech, 1)), h('td', null, fmtDec(T.reps, 1)), h('td', null, fmtInt(T.leads)), h('td', { class: T.profit < 0 ? 'neg' : null }, fmtMoney(T.profit))));
      planA.append(h('div', { class: 'table-wrap' }, tbl));
      planA.append(h('div', { class: 'team', style: 'margin-top:12px' },
        teamRow('wrench', T.tp + ' ' + plural(T.tp, 'ekipa', 'ekipy', 'ekip') + ' do zatrudnienia', fteTxt(T.tech) + ' przy ' + B.perDay + ' ' + plural(B.perDay, 'czyszczeniu', 'czyszczeniach', 'czyszczeniach') + ' dziennie, zaokrąglone w górę w każdym województwie', T.tech),
        teamRow('headset', T.rp + ' ' + plural(T.rp, 'opiekun', 'opiekunów', 'opiekunów') + ' klienta', fteTxt(T.reps) + ' na ' + fmtInt(T.leads) + ' ' + plural(T.leads, 'lead', 'leady', 'leadów') + ' miesięcznie (budżet reklam ' + fmtMoney(T.ads) + ')', T.reps)
      ));
      planA.append(h('div', { class: 'section-title' }, 'Rachunek miesięczny planu'));
      planA.append(pnlWaterfall(T).el);
      planA.append(h('p', { class: 'hint wf-foot' }, 'Przy pełnych etatach (' + T.tp + ' ' + plural(T.tp, 'ekipa', 'ekipy', 'ekip') + ', ' + T.rp + ' ' + plural(T.rp, 'opiekun', 'opiekunów', 'opiekunów') + '): ',
        h('b', { class: T.fullProfit < 0 ? 'neg' : null }, fmtMoney(T.fullProfit) + ' zysku miesięcznie'), '. Rocznie: przychód netto ' + fmtMoney(T.rev * 12) + ', zysk ' + fmtMoney(T.fullProfit * 12) + ', Twoja prowizja ' + fmtMoney(T.feeC * 12) + '.'));
      planA.append(h('div', { class: 'section-title' }, 'Regiony w planie'));
      const ul = h('ul', { class: 'list-clean mini-list' });
      items.slice().sort((a, c) => c.b.profit - a.b.profit).slice(0, 20).forEach((x) => ul.append(h('li', null,
        h('button', { type: 'button', onclick: () => select(x.lvl, x.id, true) }, h('span', { class: 'st-dot', style: 'background:' + STATUS[x.s].color + ';margin-right:6px;vertical-align:-3px', icon: STATUS[x.s].icon }), unitName(x.lvl, x.id)),
        h('span', null, fmtDec(x.b.tech, 1) + ' ek. · ' + fmtMoney(x.b.profit)))));
      planA.append(ul);
    }
    const ue = unitEcon(), u1 = unitEcon(1), u2 = unitEcon(2);
    planB.append(h('div', { class: 'as-group' },
      h('h3', null, 'Jedno czyszczenie przy tych założeniach'),
      waterfall({ label: 'Cena dla klienta', value: ue.gross, note: 'brutto' }, [
        { label: 'VAT', value: ue.vat, note: B.vat + '%' },
        { label: 'Reklamy', value: ue.ads, note: fmtDec(100 / Math.max(0.1, B.close), 1) + ' leada na zlecenie' },
        { label: 'Opiekun klienta', value: ue.rep, note: 'czas na leady i premia' },
        { label: 'Ekipa', value: ue.tech, note: 'etat przy ' + B.perDay + ' dziennie i premia' },
        { label: 'Chemia, inhibitor, dojazd', value: ue.mat },
        { label: 'Twoja prowizja', value: ue.fee }
      ], 'Zysk firmy z czyszczenia', ue.net > 0 ? 'marża ' + fmtDec(ue.margin * 100, 0) + '% od ceny netto' : null).el,
      h('div', { class: 'compare' },
        h('div', { class: 'cmp' + (B.perDay === 1 ? ' on' : '') }, h('span', null, '1 czyszczenie dziennie'), h('b', { class: u1.profit < 0 ? 'neg' : null }, fmtMoney(u1.profit)), h('span', null, 'zysku z czyszczenia')),
        h('div', { class: 'cmp' + (B.perDay === 2 ? ' on' : '') }, h('span', null, '2 czyszczenia dziennie'), h('b', { class: u2.profit < 0 ? 'neg' : null }, fmtMoney(u2.profit)), h('span', null, 'zysku z czyszczenia'))
      ),
      h('p', { class: 'hint wf-foot' }, isFinite(ue.breakEven) ? 'Ekipa zarabia na siebie od ' + fmtInt(Math.ceil(ue.breakEven)) + ' ' + plural(Math.ceil(ue.breakEven), 'czyszczenia', 'czyszczeń', 'czyszczeń') + ' w miesiącu. Każde kolejne to ok. ' + fmtMoney(ue.net - ue.ads - ue.rep - B.techBonus - ue.mat - ue.fee) + ' dla firmy.' : 'Przy tych założeniach czyszczenie nie pokrywa kosztów nawet bez pensji ekipy.')
    ));
  }

  // ---------- bazy
  function baseBiz(fm) {
    let jobs = 0, market = 0;
    for (const [pid, f] of fm) { const b = R.pow.get(pid).b; if (b) { jobs += b.jobs * f; market += b.market * f; } }
    const b = bizFromJobs(jobs, market, { price: state.B.price, perDay: state.B.perDay, share: null });
    const t = teamSummary([{ b, woj: 'x' }]);
    b.tp = t.tp; b.rp = t.rp; b.fullProfit = t.fullProfit;
    return b;
  }
  function baseBizBlock(fm, title) {
    const b = baseBiz(fm);
    return h('div', { class: 'base-biz' },
      h('div', { class: 'bb-t' }, title || ('Model biznesowy · ' + state.B.year + ' r.')),
      h('div', { class: 'base-stats' },
        h('div', null, h('b', null, b.tp + ' ' + plural(b.tp, 'ekipa', 'ekipy', 'ekip')), h('span', null, fteTxt(b.tech) + ' przy ' + state.B.perDay + ' dziennie · ' + jobsTxt(b.jobs) + ' / mies.')),
        h('div', null, h('b', null, b.rp + ' ' + plural(b.rp, 'opiekun', 'opiekunów', 'opiekunów')), h('span', null, fteTxt(b.reps) + ' · ' + fmtInt(b.leads) + ' ' + plural(b.leads, 'lead', 'leady', 'leadów') + ' / mies.')),
        h('div', null, h('b', null, fmtMoney(b.rev)), h('span', null, 'przychodu netto / mies. · reklamy ' + fmtMoney(b.ads))),
        h('div', null, h('b', { class: b.fullProfit < 0 ? 'neg' : null }, fmtMoney(b.fullProfit)), h('span', null, 'zysku / mies. przy pełnych etatach · Twoja prowizja ' + fmtMoney(b.feeC)))
      )
    );
  }

  // ---------- KPI, formuła, przełączniki
  function renderBizKPIs(k) {
    const lvl = state.level, B = state.B;
    const pd = B.perDay + ' ' + plural(B.perDay, 'czyszczeniu', 'czyszczeniach', 'czyszczeniach') + ' dziennie';
    let items = crewItems(), techL;
    if (items.length) {
      const C = sumBiz(items.map((x) => [x.b, 1])), n = items.length;
      const where = items.every((x) => x.lvl === 'woj') ? plural(n, 'województwie', 'województwach', 'województwach') : plural(n, 'regionie', 'regionach', 'regionach');
      techL = 'techników przy ' + pd + ' w ' + n + ' ' + where + ' · ' + jobsTxt(C.jobs) + ' / mies., ' + fmtDec(C.market > 0 ? C.jobs / C.market * 100 : 0, 0) + '% realnego rynku tam (' + B.year + ' r.)';
    } else if ((items = planItems(lvl)).length) {
      techL = 'techników (' + fteTxt(sumBiz(items.map((x) => [x.b, 1])).tech) + ' przy ' + pd + ') · Twój plan: ' + items.length + ' ' + plural(items.length, 'region', 'regiony', 'regionów');
    } else {
      items = polandItems();
      techL = 'techników (' + fteTxt(sumBiz(items.map((x) => [x.b, 1])).tech) + ' przy ' + pd + ') · cała Polska';
    }
    const T = teamSummary(items);
    const tile = (icon, v, l, accent) => h('div', { class: 'kpi' + (accent ? ' kpi-accent' : '') }, h('div', null, h('div', { class: 'kpi-ico', icon }), h('div', { class: 'kpi-v' }, v)), h('div', { class: 'kpi-l' }, l));
    k.append(
      tile('wrench', T.tp + ' ' + plural(T.tp, 'ekipa', 'ekipy', 'ekip'), techL),
      tile('headset', T.rp + ' ' + plural(T.rp, 'opiekun', 'opiekunów', 'opiekunów'), 'klienta do obsługi ' + fmtInt(T.leads) + ' ' + plural(T.leads, 'leada', 'leadów', 'leadów') + ' miesięcznie (' + fteTxt(T.reps) + ')'),
      tile('coins', fmtMoney(T.rev), 'przychodu netto miesięcznie z ' + jobsGen(T.jobs) + ' (' + B.year + ' r.)'),
      tile('target', fmtMoney(T.fullProfit), 'zysku firmy miesięcznie przy pełnych etatach · Twoja prowizja ' + fmtMoney(T.feeC), true)
    );
  }
  function renderBizFormula() {
    const f = $('formula-biz');
    if (!f) return;
    f.textContent = '';
    if (state.mode !== 'biz') return;
    const B = state.B;
    f.append(h('b', null, 'Model biznesowy przy obecnych ustawieniach'));
    const ol = h('ol');
    ol.append(h('li', null, 'Zlecenia miesięcznie = Twoje zlecenia w roku ÷ 12, z rynku na ' + B.year + ' r. (do czyszczenia instalacje z domów zbudowanych do ' + (B.year - state.A.minAge) + ' r.).'));
    ol.append(h('li', null, 'Ekipy (etaty) = zlecenia ÷ (' + B.perDay + ' ' + plural(B.perDay, 'czyszczenie', 'czyszczenia', 'czyszczeń') + ' dziennie × ' + B.days + ' dni pracy w miesiącu).'));
    ol.append(h('li', null, 'Leady = zlecenia ÷ ' + fmtDec(B.close, 0) + '% skuteczności. Opiekunowie (etaty) = leady ÷ ' + fmtInt(B.leadsPerRep) + ' leadów na osobę miesięcznie.'));
    ol.append(h('li', null, 'Przychód netto = zlecenia × cena brutto (' + fmtInt(B.price) + ' zł, chyba że region ma własną) ÷ ' + fmtDec(1 + B.vat / 100, 2) + ' (VAT ' + B.vat + '%).'));
    ol.append(h('li', null, 'Koszty: reklamy = leady × ' + fmtDec(B.cpl, 2) + ' zł; opiekunowie = etaty × ' + fmtInt(B.repCost) + ' zł + ' + fmtInt(B.repBonus) + ' zł premii od zlecenia; ekipy = etaty × ' + fmtInt(B.techCost) + ' zł + ' + fmtInt(B.techBonus) + ' zł premii od czyszczenia; chemia i dojazd = ' + fmtInt(B.jobCost) + ' zł od czyszczenia; Twoja prowizja = ' + fmtInt(B.fee) + ' zł od zlecenia.'));
    ol.append(h('li', null, 'Zysk firmy = przychód netto minus koszty, przed podatkiem dochodowym i bez kosztów biura. W regionach etaty liczymy z ułamkami. Pełne etaty w planie: ekipy zaokrąglamy w górę osobno w każdym województwie, opiekunów łącznie, bo dzwonią do wszystkich regionów.'));
    f.append(ol);
  }
  function fillMetricSelect() {
    const sel = $('metric');
    sel.textContent = '';
    const defs = state.mode === 'biz' ? BIZ_METRICS : METRICS;
    for (const k in defs) sel.append(h('option', { value: k }, defs[k].label));
    sel.value = state.mode === 'biz' ? state.bizMetric : state.metric;
  }
  function syncBizControls() {
    document.querySelectorAll('[data-pd]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.pd === state.B.perDay)));
    document.querySelectorAll('select[data-year]').forEach((s) => { s.value = String(state.B.year); });
  }
  function applyModeUI() {
    const biz = state.mode === 'biz';
    document.body.classList.toggle('mode-biz', biz);
    document.querySelectorAll('#mode-seg button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === state.mode)));
    fillMetricSelect();
    if (!HERO_POT.title) { HERO_POT.badge = $('hero-badge').textContent; HERO_POT.title = $('hero-title').textContent; HERO_POT.sub = $('hero-sub').textContent; }
    const t = biz ? HERO_BIZ : HERO_POT;
    $('hero-badge').textContent = t.badge;
    $('hero-title').textContent = t.title;
    $('hero-sub').textContent = t.sub;
    $('map').setAttribute('aria-label', biz ? 'Mapa Polski z modelem biznesowym czyszczenia podłogówki' : 'Mapa Polski z potencjałem czyszczenia podłogówki');
    if (!biz && state.tab === 'plan') state.tab = 'region';
    syncBizControls();
  }
  function setMode(mode) {
    if (state.mode === mode) return;
    state.mode = mode;
    applyModeUI();
    refreshFills();
    redrawOverlays();
    renderKPIs();
    renderFormula();
    openTab(state.tab);
    save();
  }
  function setYear(y) { state.B.year = Math.min(NOW + 7, Math.max(NOW, y)); onBizChange(); syncBizControls(); }
  function setPerDay(v) { state.B.perDay = v === 2 ? 2 : 1; onBizChange(); syncBizControls(); }
  function onBizChange(opts) {
    computeBiz();
    if (state.mode === 'biz') { refreshFills(); redrawOverlays(); }
    renderKPIs();
    renderFormula();
    if (state.tab === 'plan') renderPlanOutputs();
    else if (!(opts && opts.live)) renderPanel();
    save();
  }
  function wireBizUI() {
    document.querySelectorAll('#mode-seg button').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
    const ys = $('biz-year');
    for (let y = NOW; y <= NOW + 7; y++) ys.append(h('option', { value: String(y) }, y === NOW ? y + ' (dziś)' : String(y)));
    ys.addEventListener('change', () => setYear(+ys.value));
    document.querySelectorAll('#perday-seg [data-pd]').forEach((b) => b.addEventListener('click', () => setPerDay(+b.dataset.pd)));
  }

  // ---------------------------------------------------------------- KPI i formuła
  function renderKPIs() {
    const k = $('kpis');
    k.textContent = '';
    if (state.mode === 'biz') { renderBizKPIs(k); return; }
    const T = TOTAL;
    const share = T.pool ? T.covered.pool / T.pool * 100 : 0;
    const tile = (icon, v, l, accent) => h('div', { class: 'kpi' + (accent ? ' kpi-accent' : '') }, h('div', null, h('div', { class: 'kpi-ico', icon }), h('div', { class: 'kpi-v' }, v)), h('div', { class: 'kpi-l' }, l));
    k.append(
      tile('home', fmtCompact(T.pool), 'domów z podłogówką w wieku do czyszczenia (instalacje ' + state.A.minAge + '+ lat)'),
      tile('coins', fmtMoney(T.revenue), 'rynek realny rocznie w Polsce: ' + fmtCompact(T.market) + ' zleceń'),
      tile('pin', fmtDec(share, 1) + '%', 'potencjału Polski w zasięgu Twoich baz (' + state.bases.length + ' ' + plural(state.bases.length, 'baza', 'bazy', 'baz') + ')'),
      tile('users', fmtTech(T.techs), calibRate != null ? 'techników w całej Polsce przy tempie z kalibracji' : 'techników w całej Polsce przy Twoim udziale ' + state.A.share + '%', true)
    );
  }
  function renderFormula() {
    const A = state.A;
    const f = $('formula');
    f.textContent = '';
    f.append(h('b', null, 'Wzór przy obecnych założeniach'));
    const ol = h('ol');
    ol.append(h('li', null, 'Nowe domy w roku = mieszkania oddane w budownictwie indywidualnym (GUS) × współczynnik województwa od 0,99 do 1,25, który dolicza domy deweloperskie (średnia 2012–2017).'));
    ol.append(h('li', null, 'Domy z podłogówką = nowe domy × udział podłogówki w danym roku (' + A.s1995 + '% w 1995, ' + A.s2005 + '% w 2005, ' + A.s2015 + '% w 2015, ' + A.s2025 + '% w 2025) + ' + fmtDec(A.retro, 1) + '% starszych domów.'));
    ol.append(h('li', null, 'Do czyszczenia = instalacje, które mają co najmniej ' + A.minAge + ' lat (domy zbudowane do ' + (NOW - A.minAge) + ' r.).'));
    ol.append(h('li', null, 'Rynek teoretyczny = domy do czyszczenia ÷ ' + A.cycle + ' lat cyklu. Rynek realny = ' + A.adopt + '% z tego. Przychód = zlecenia × ' + fmtInt(A.price) + ' zł.'));
    ol.append(h('li', null, calibRate != null ? 'Twoje zlecenia = rynek teoretyczny × tempo z bazy ' + baseName(A.calibBase) + ' (' + fmtDec(calibRate * 100, 1) + '% rocznie). Technicy = Twoje zlecenia ÷ ' + A.capacity + '.' : 'Twoje zlecenia = ' + A.share + '% rynku realnego. Technicy = Twoje zlecenia ÷ ' + A.capacity + ' zleceń na etat.'));
    f.append(ol);
    renderBizFormula();
  }

  // ---------------------------------------------------------------- przeliczenia po zmianach
  function onAssumptionChange(full) {
    computeAll();
    refreshFills();
    renderKPIs();
    renderFormula();
    drawCurve();
    renderCalibOut();
    if (state.mode === 'biz') redrawOverlays();
    if (state.tab === 'plan') renderPlanOutputs();
    else if (state.tab !== 'zalozenia' || full) { if (state.tab !== 'zalozenia') renderPanel(); }
    save();
  }
  function onDataChange(light) {
    computeAll();
    refreshFills();
    drawBases();
    if (state.mode === 'biz') drawMarks();
    drawCities();
    renderKPIs();
    renderFormula();
    if (!light) renderPanel();
    else if (state.tab === 'bazy') { /* pełne odświeżenie po puszczeniu suwaka */ }
    save();
  }

  // ---------------------------------------------------------------- eksport / import / link
  function copyLink() {
    const url = location.origin + location.pathname + '#s=' + b64urlEncode(JSON.stringify(persistable()));
    const done = () => toast('Skopiowano link z oznaczeniami i bazami');
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, () => { prompt('Skopiuj link:', url); });
    else prompt('Skopiuj link:', url);
  }
  function exportJson() {
    const blob = new Blob([JSON.stringify(persistable(), null, 2)], { type: 'application/json' });
    const a = h('a', { href: URL.createObjectURL(blob), download: 'skalowanie-oznaczenia-' + new Date().toISOString().slice(0, 10) + '.json' });
    document.body.append(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function exportMenu(btn) {
    let menu = document.getElementById('export-menu');
    if (menu) { menu.remove(); return; }
    const r = btn.getBoundingClientRect();
    menu = h('div', { id: 'export-menu', class: 'card', style: 'position:fixed;z-index:2500;top:' + (r.bottom + 8) + 'px;right:' + Math.max(12, window.innerWidth - r.right) + 'px;padding:10px;display:flex;flex-direction:column;gap:8px;min-width:260px' },
      h('button', { type: 'button', class: 'btn btn-ghost btn-small', onclick: () => { exportJson(); menu.remove(); } }, 'Pobierz plik z oznaczeniami (JSON)'),
      h('button', { type: 'button', class: 'btn btn-ghost btn-small', onclick: () => { $('import-file').click(); menu.remove(); } }, 'Wczytaj plik z oznaczeniami')
    );
    document.body.append(menu);
    setTimeout(() => document.addEventListener('click', function close(e) { if (!menu.contains(e.target) && e.target !== btn) { menu.remove(); document.removeEventListener('click', close); } }), 0);
  }
  function importJson(file) {
    const rd = new FileReader();
    rd.onload = () => {
      try {
        applyLoaded(JSON.parse(rd.result));
        save();
        applyModeUI();
        applyLevel();
        onDataChange();
        toast('Wczytano oznaczenia z pliku');
      } catch (e) { toast('Nie udało się wczytać pliku'); }
    };
    rd.readAsText(file);
  }

  // ---------------------------------------------------------------- start
  function wireUI() {
    const sel = $('metric');
    fillMetricSelect();
    sel.addEventListener('change', () => {
      if (state.mode === 'biz') { state.bizMetric = sel.value; refreshFills(); redrawOverlays(); }
      else { state.metric = sel.value; refreshFills(); }
      renderPanel(); save();
    });
    document.querySelectorAll('#level-seg button').forEach((b) => b.addEventListener('click', () => {
      if (state.level === b.dataset.level) return;
      state.level = b.dataset.level;
      if (state.selected && state.selected.lvl !== state.level) state.selected = null;
      rankQuery = '';
      applyLevel();
      if (state.mode === 'biz') renderKPIs();
      renderPanel();
      save();
    }));
    document.querySelectorAll('.tabs [role=tab]').forEach((b) => b.addEventListener('click', () => openTab(b.dataset.tab)));
    document.querySelectorAll('[data-open-tab]').forEach((a) => a.addEventListener('click', () => openTab(a.dataset.openTab)));
    [['t-marks', 'marks'], ['t-bases', 'bases'], ['t-cities', 'cities']].forEach(([elId, key]) => {
      const cb = $(elId);
      cb.checked = state.show[key];
      cb.addEventListener('change', () => { state.show[key] = cb.checked; drawMarks(); drawBases(); drawCities(); renderLegend(); save(); });
    });
    $('btn-add-base').addEventListener('click', () => setAdding(!addingBase));
    $('btn-cancel-base').addEventListener('click', () => setAdding(false));
    $('btn-copy-link').addEventListener('click', copyLink);
    $('btn-export').addEventListener('click', (e) => exportMenu(e.currentTarget));
    $('import-file').addEventListener('change', (e) => { const f = e.target.files[0]; if (f) importJson(f); e.target.value = ''; });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && addingBase) setAdding(false); });
    wireBizUI();
  }

  async function start() {
    loadStored();
    const fromLink = loadFromHash();
    const [d, gw, gp] = await Promise.all([
      fetch('potencjal.json').then((r) => r.json()),
      fetch('wojewodztwa.geojson').then((r) => r.json()),
      fetch('powiaty.geojson').then((r) => r.json())
    ]);
    DATA = d; GEO.woj = gw; GEO.pow = gp;
    DATA.woj.forEach((u) => WOJ_BY_ID.set(u.id, u));
    DATA.pow.forEach((u) => POW_BY_ID.set(u.id, u));
    if (state.A.calibBase && !state.bases.some((b) => b.id === state.A.calibBase)) state.A.calibBase = state.bases[0] ? state.bases[0].id : null;
    computeAll();
    computeBreaks();
    wireUI();
    applyModeUI();
    initMap();
    applyLevel();
    drawBases();
    renderKPIs();
    renderFormula();
    openTab('region');
    if (fromLink) { save(); toast('Wczytano oznaczenia z linku (poprzednie są w kopii w przeglądarce)'); }
  }

  start().catch((e) => {
    console.error(e);
    const m = document.getElementById('map');
    if (m) m.textContent = 'Nie udało się wczytać danych mapy. Odśwież stronę.';
  });
})();
