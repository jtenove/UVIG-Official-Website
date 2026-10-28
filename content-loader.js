/* ============================================================
   UVIG CONTENT LOADER
   Pulls the latest content saved from /admin (Supabase) and
   swaps it into the same globals data.js / puzzles-data.js /
   survey-feedback-data.js define, BEFORE any page renders.

   Pages wrap their rendering code in UVIG_READY(fn) so it runs
   once content is in place. If Supabase isn't configured, is
   slow, or is down, the page falls back to the last copy this
   browser saw, then to the built-in defaults — the site never
   breaks because of the admin backend.

   Load order on each page:
     data.js (and/or puzzles-data.js, survey-feedback-data.js)
     supabase-config.js
     content-loader.js
     script.js + the page's own script
   ============================================================ */
(function () {
  var CACHE_KEY = 'uvig_content_cache_v1';
  var TIMEOUT_MS = 3500;

  // Content key in the database -> the global it replaces.
  // typeof guards: each page only loads the data files it needs.
  var TARGETS = {
    upcoming_events: function () { return typeof UVIG_UPCOMING !== 'undefined' ? UVIG_UPCOMING : null; },
    past_events:     function () { return typeof UVIG_PAST !== 'undefined' ? UVIG_PAST : null; },
    reports:         function () { return typeof UVIG_REPORTS !== 'undefined' ? UVIG_REPORTS : null; },
    team:            function () { return typeof UVIG_TEAM !== 'undefined' ? UVIG_TEAM : null; },
    speakers:        function () { return typeof UVIG_SPEAKERS !== 'undefined' ? UVIG_SPEAKERS : null; },
    firms:           function () { return typeof UVIG_FIRMS !== 'undefined' ? UVIG_FIRMS : null; },
    interests:       function () { return typeof UVIG_INTERESTS !== 'undefined' ? UVIG_INTERESTS : null; },
    puzzles:         function () { return typeof PUZZLES !== 'undefined' ? PUZZLES : null; },
    survey:          function () { return typeof SURVEY !== 'undefined' ? SURVEY : null; }
  };

  // Fields holding a link or file path rather than display text.
  var URL_FIELDS = { flyer: 1, venuePhoto: 1, cover: 1, pdf: 1, rsvpUrl: 1, photos: 1, image: 1, url: 1, href: 1 };

  // Pages build HTML from these values with template strings, so
  // neutralize the few characters that could turn text into markup.
  // Admins are trusted, but this keeps a stray "<" or quote from
  // ever breaking a page.
  function cleanText(s) {
    return s
      .replace(/</g, '‹').replace(/>/g, '›')
      .replace(/(^|[\s(\[{-])"/g, '$1“').replace(/"/g, '”');
  }
  function cleanUrl(s) {
    s = String(s).trim();
    if (/^(javascript|vbscript|data):/i.test(s.replace(/[\s\u0000-\u001f]/g, ''))) return '';
    return s.replace(/["'<>\s]/g, function (c) { return encodeURIComponent(c); });
  }
  function sanitize(v, isUrl) {
    if (typeof v === 'string') return isUrl ? cleanUrl(v) : cleanText(v);
    if (Array.isArray(v)) return v.map(function (x) { return sanitize(x, isUrl); });
    if (v && typeof v === 'object') {
      var out = {};
      Object.keys(v).forEach(function (k) { out[k] = sanitize(v[k], !!URL_FIELDS[k]); });
      return out;
    }
    return v;
  }

  // Mutate in place — the globals are `const`, so they can't be
  // reassigned, but their contents can.
  function replaceInPlace(target, value) {
    if (Array.isArray(target)) {
      if (!Array.isArray(value)) return;
      target.length = 0;
      value.forEach(function (x) { target.push(x); });
    } else if (target && typeof target === 'object') {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return;
      Object.keys(target).forEach(function (k) { delete target[k]; });
      Object.assign(target, value);
    }
  }

  // ---- Page text: elements tagged data-content="page.key" etc. ----
  function applySiteText(map) {
    if (!map || typeof map !== 'object') return;
    document.querySelectorAll('[data-content]').forEach(function (el) {
      var v = map[el.getAttribute('data-content')];
      if (typeof v === 'string' && v.trim()) el.textContent = v;
    });
    document.querySelectorAll('[data-content-counter]').forEach(function (el) {
      var v = map[el.getAttribute('data-content-counter')];
      if (v !== undefined && v !== '' && !isNaN(parseInt(v, 10))) el.dataset.counter = String(parseInt(v, 10));
    });
    document.querySelectorAll('[data-content-bg]').forEach(function (el) {
      var v = map[el.getAttribute('data-content-bg')];
      if (typeof v === 'string' && v.trim()) {
        var u = cleanUrl(v);
        if (u) el.style.backgroundImage = "url('" + u + "')";
      }
    });
    document.querySelectorAll('[data-content-img]').forEach(function (el) {
      var v = map[el.getAttribute('data-content-img')];
      if (typeof v === 'string' && v.trim()) {
        var u = cleanUrl(v);
        if (u) el.src = u;
      }
    });
  }

  function apply(rows) {
    if (!rows || typeof rows !== 'object') return;
    Object.keys(TARGETS).forEach(function (key) {
      if (rows[key] === undefined || rows[key] === null) return;
      var target = TARGETS[key]();
      if (target) replaceInPlace(target, sanitize(rows[key], false));
    });
    if (rows.site_text) applySiteText(rows.site_text);
  }

  function readCache() {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch (e) { return null; }
  }
  function writeCache(rows) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(rows)); } catch (e) { /* storage full / private mode */ }
  }

  function fetchRemote(cfg) {
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, TIMEOUT_MS);
    var base = cfg.url.replace(/\/+$/, '');
    return fetch(base + '/rest/v1/site_content?select=key,value', {
      headers: { apikey: cfg.anonKey, Authorization: 'Bearer ' + cfg.anonKey },
      signal: ctrl ? ctrl.signal : undefined,
      cache: 'no-store'
    }).then(function (res) {
      clearTimeout(timer);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function (list) {
      var rows = {};
      (list || []).forEach(function (r) { if (r && r.key) rows[r.key] = r.value; });
      return rows;
    });
  }

  // ---- Preview: /admin's "Preview" button opens a page with
  // ?preview, showing that editor's unsaved draft (stored in their
  // own browser only) on top of the published content. ----
  var preview = null;
  if (/[?&]preview(=|&|$)/.test(location.search)) {
    try { preview = JSON.parse(localStorage.getItem('uvig_admin_preview') || 'null'); } catch (e) { preview = null; }
  }
  function applyPreview() {
    if (!preview || typeof preview !== 'object') return;
    apply(preview);
    var bar = document.createElement('div');
    bar.textContent = 'Preview of unsaved changes from /admin. Visitors don\u2019t see this until you save.';
    bar.setAttribute('style', 'position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:9999;' +
      'background:#B99A5B;color:#0A1F3D;font:600 13px/1.4 "IBM Plex Sans",sans-serif;padding:10px 16px;' +
      'border-radius:999px;box-shadow:0 8px 24px rgba(0,0,0,.25);max-width:calc(100% - 32px);text-align:center;');
    document.body.appendChild(bar);
  }

  var cfg = window.UVIG_SUPABASE || {};
  var ready;

  if (!cfg.url || !cfg.anonKey) {
    ready = Promise.resolve();
  } else {
    // Text first from this browser's last copy, so headings don't
    // visibly flip once the fresh copy arrives a moment later.
    var cached = readCache();
    if (cached && cached.site_text) applySiteText(cached.site_text);

    ready = fetchRemote(cfg).then(function (rows) {
      writeCache(rows);
      apply(rows);
    }).catch(function (err) {
      console.warn('UVIG content: using saved/default content (' + err.message + ')');
      if (cached) apply(cached);
    });
  }
  ready = ready.then(applyPreview);

  // Run fn once content is in place. Callbacks run in the order
  // they were registered, so page renders (registered while the
  // page parses) always run before script.js's motion effects
  // (registered at DOMContentLoaded).
  window.UVIG_READY = function (fn) {
    ready.then(function () {
      try { fn(); } catch (e) { console.error(e); }
    });
  };
})();
