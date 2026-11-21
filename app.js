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
    users: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.6" fill="currentColor"/><path d="M2.5 20c.6-3.8 3.2-6 6.5-6s5.9 2.2 6.5 6z" fill="currentColor"/><circle cx="17" cy="9" r="2.8" fill="currentColor"/><path d="M15.8 13.4c3 .2 5.2 2.3 5.7 5.6h-4.3c-.3-2-1-3.9-1.4-5.6z" fill="currentColor"/></svg>'
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
    show: { marks: true, bases: true, cities: true }
  });
  let state = DEFAULT_STATE();

  function persistable() {
    return { v: 1, level: state.level, metric: state.metric, A: state.A, marks: state.marks, bases: state.bases, show: state.show };
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

  function baseCalc(u, A) {
    const cutoff = NOW - A.minAge;
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
  }

  function metricValue(lvl, id, metric) {
    const r = R[lvl].get(id);
    return r ? r[metric || state.metric] : 0;
  }

  function rankOf(lvl, id, metric) {
    const v = metricValue(lvl, id, metric);
    let k = 1;
    for (const [oid, r] of R[lvl]) if (oid !== id && r[metric] > v) k++;
    return k;
  }

  // ---------------------------------------------------------------- klasy choropletu
  let BREAKS = { br: [], min: 0, max: 0 };
  function computeBreaks() {
    const vals = [...R[state.level].values()].map((r) => r[state.metric]).filter((v) => isFinite(v)).sort((a, b) => a - b);
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
    map.on('zoomend', rafThrottle(() => { drawCities(); drawMarks(); }));
    map.on('moveend', rafThrottle(drawCities));
  }

  function fillStyle(lvl, id) {
    const v = metricValue(lvl, id);
    return { fillColor: RAMP[classOf(v)], fillOpacity: 1, color: '#ffffff', weight: lvl === 'woj' ? 1.6 : 0.7, opacity: 1 };
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
    const m = METRICS[state.metric];
    const r = R[lvl].get(id);
    const total = R[lvl].size;
    const mk = state.marks[lvl][id];
    const box = h('div', null,
      h('div', { class: 'tt-v' }, m.fmt(r[state.metric])),
      h('div', { class: 'tt-n' }, unitTitle(lvl, id)),
      h('div', { class: 'tt-s' }, m.legend + ' · miejsce ' + rankOf(lvl, id, state.metric) + ' z ' + total)
    );
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
    if (!state.show.marks) return;
    const lvl = state.level;
    const ids = Object.keys(state.marks[lvl]).filter((id) => state.marks[lvl][id].s && FEAT[lvl].has(id));
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
    const m = METRICS[state.metric];
    lg.classList.toggle('collapsed', legendCollapsed);
    lg.append(h('div', { class: 'legend-head' }, h('h4', null, m.legend), h('button', { type: 'button', class: 'legend-toggle', 'aria-expanded': String(!legendCollapsed), onclick: () => { legendCollapsed = !legendCollapsed; renderLegend(); } }, legendCollapsed ? 'Pokaż' : 'Ukryj')));
    if (legendCollapsed) return;
    const rows = null;
    const edges = [BREAKS.min].concat(BREAKS.br, [BREAKS.max]);
    const box = h('div', { class: 'ramp' });
    RAMP.forEach((c) => box.append(h('i', { style: 'background:' + c })));
    lg.append(box);
    const labels = h('div', { class: 'ramp-labels' });
    for (let k = 0; k < 6; k++) labels.append(h('span', { title: m.fmt(edges[k]) + ' – ' + m.fmt(edges[k + 1]) }, shortFmt(edges[k])));
    lg.append(labels);
    lg.append(h('div', { class: 'legend-note' }, 'Każdy kolor to szósta część ' + (state.level === 'woj' ? 'województw' : 'powiatów') + ', od najniższych wartości (dolna granica pod kolorem). Najwyżej: ' + m.fmt(BREAKS.max) + (state.metric === 'income' && state.level === 'pow' ? '. Powiaty mają wartość swojego województwa.' : '.')));
    const keys = h('div', { class: 'keys' });
    const usedStatuses = STATUS_KEYS.filter((k) => Object.values(state.marks[state.level]).some((x) => x.s === k));
    if (state.show.marks) usedStatuses.forEach((k) => keys.append(h('span', { class: 'key' }, lineKey(STATUS[k].color, STATUS[k].dash), STATUS[k].label)));
    if (state.show.bases && state.bases.length) keys.append(h('span', { class: 'key' }, lineKey('#0a0a0a', '5 4'), 'Zasięg bazy'));
    if (keys.childNodes.length) lg.append(keys);
    void rows;
  }
  function shortFmt(v) {
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
    openTab('region');
    if (zoom && FEAT[lvl].has(id)) {
      map.flyToBounds(FEAT[lvl].get(id).layer.getBounds(), { padding: [60, 60], maxZoom: lvl === 'woj' ? 7.25 : 9, duration: 0.6 });
    }
  }

  // ---------------------------------------------------------------- zakładki
  function openTab(name) {
    state.tab = name;
    document.querySelectorAll('.tabs [role=tab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === name)));
    ['region', 'ranking', 'bazy', 'zalozenia'].forEach((t) => { $('tab-' + t).hidden = t !== name; });
    renderPanel();
  }
  function renderPanel() {
    if (state.tab === 'region') renderRegion();
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
    if (!s) { renderPoland(box); return; }
    const lvl = s.lvl, id = s.id;
    const u = lvl === 'woj' ? WOJ_BY_ID.get(id) : POW_BY_ID.get(id);
    const r = R[lvl].get(id);
    const total = R[lvl].size;
    const rank = rankOf(lvl, id, state.metric);
    const head = h('div', { class: 'region-head' },
      h('div', null,
        h('div', { class: 'eyebrow' }, lvl === 'woj' ? 'Województwo' : (u.city ? 'Miasto na prawach powiatu' : 'Powiat')),
        h('h2', null, lvl === 'woj' ? u.name : u.name.replace(/^pow\.\s*/, 'powiat ').replace(/^m\.\s*/, ''))
      ),
      h('div', { class: 'rank-chip', title: METRICS[state.metric].label }, '#' + rank + ' z ' + total)
    );
    box.append(head);
    if (lvl === 'pow') {
      const w = WOJ_BY_ID.get(u.woj);
      box.append(h('div', { class: 'region-sub' }, 'woj. ', h('a', { href: '#', onclick: (e) => { e.preventDefault(); select('woj', w.id, true); } }, w.name)));
    }
    box.append(statusEditor(lvl, id));

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
          save(); drawMarks(); renderLegend(); renderRegion();
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
    const m = METRICS[state.metric];
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
      const rows = [...R[lvl].entries()].map(([id, r]) => [id, r[state.metric]]).sort((a, b) => b[1] - a[1]);
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
        top.length ? h('div', { class: 'base-top' }, 'Najwięcej potencjału w zasięgu: ' + top.join(', ')) : null
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

  // ---------------------------------------------------------------- KPI i formuła
  function renderKPIs() {
    const k = $('kpis');
    k.textContent = '';
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
  }

  // ---------------------------------------------------------------- przeliczenia po zmianach
  function onAssumptionChange(full) {
    computeAll();
    refreshFills();
    renderKPIs();
    renderFormula();
    drawCurve();
    renderCalibOut();
    if (state.tab !== 'zalozenia' || full) { if (state.tab !== 'zalozenia') renderPanel(); }
    save();
  }
  function onDataChange(light) {
    computeAll();
    refreshFills();
    drawBases();
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
        $('metric').value = state.metric;
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
    for (const k in METRICS) sel.append(h('option', { value: k }, METRICS[k].label));
    sel.value = state.metric;
    sel.addEventListener('change', () => { state.metric = sel.value; refreshFills(); renderPanel(); save(); });
    document.querySelectorAll('#level-seg button').forEach((b) => b.addEventListener('click', () => {
      if (state.level === b.dataset.level) return;
      state.level = b.dataset.level;
      if (state.selected && state.selected.lvl !== state.level) state.selected = null;
      rankQuery = '';
      applyLevel();
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
