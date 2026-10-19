/* ============================================================
   UVIG ADMIN — content editor for the public site
   Every editable section is described by a small schema below;
   the form builder turns that into cards, inputs, reordering and
   uploads. The site's layout stays in the HTML — admins only
   change the content those pages render.

   Two backends:
     * Supabase (when supabase-config.js has a url + anonKey)
     * Demo mode (when it doesn't) — everything stays in this
       browser, nothing is published. Useful for trying it out.
   ============================================================ */
(function () {
  'use strict';

  var CFG = window.UVIG_SUPABASE || {};
  var CONFIGURED = !!(CFG.url && CFG.anonKey);
  var PREVIEW_KEY = 'uvig_admin_preview';
  var clone = function (v) { return v === undefined ? undefined : JSON.parse(JSON.stringify(v)); };
  var same = function (a, b) { return JSON.stringify(a) === JSON.stringify(b); };

  // ---------- Icons (static, trusted markup) ----------
  var ICONS = {
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    doc: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h7"/>',
    people: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c.6-3.4 3-5.5 6-5.5s5.4 2.1 6 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M16.5 14.6c2.3.3 4 2 4.5 5.4"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    building: '<path d="M4 21V5l8-2v18M12 8h8v13M8 9h.01M8 13h.01M8 17h.01M16 12h.01M16 16h.01"/>',
    text: '<path d="M4 6h16M4 12h10M4 18h13"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    puzzle: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',
    survey: '<path d="M9 5h10M9 12h10M9 19h10"/><path d="M4 5l1 1 2-2M4 12l1 1 2-2M4 19l1 1 2-2"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    chev: '<path d="M9 6l6 6-6 6"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',
    reset: '<path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.6"/><path d="M4 4v4.6h4.6"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    sort: '<path d="M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4"/>'
  };
  function icon(name) {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none');
    s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '1.8');
    s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round');
    s.innerHTML = ICONS[name] || '';
    return s;
  }

  // ---------- Tiny DOM builder (text always via textContent) ----------
  function h(tag, props) {
    var el = document.createElement(tag);
    if (props) Object.keys(props).forEach(function (k) {
      var v = props[k];
      if (v === undefined || v === null || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'style') el.setAttribute('style', v);
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else if (k === 'value') el.value = v;
      else if (k === 'checked' || k === 'disabled' || k === 'hidden' || k === 'selected') el[k] = !!v;
      else el.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function append(el, c) {
    if (c === null || c === undefined || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { append(el, x); }); return; }
    el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  function iconBtn(name, title, onclick, cls) {
    return h('button', { type: 'button', class: 'icon-btn' + (cls ? ' ' + cls : ''), title: title, 'aria-label': title, onclick: onclick }, icon(name));
  }
  function btn(label, cls, onclick, iconName) {
    return h('button', { type: 'button', class: 'btn ' + cls, onclick: onclick }, iconName ? icon(iconName) : null, label);
  }

  function toast(msg, kind) {
    var t = h('div', { class: 'toast' + (kind ? ' ' + kind : ''), text: msg, title: 'Dismiss', onclick: function () { t.remove(); } });
    document.getElementById('toasts').appendChild(t);
    setTimeout(function () { t.remove(); }, kind === 'err' ? 6500 : 3200);
  }

  // ---------- Helpers ----------
  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  function dateDisplayFrom(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    return m ? MONTHS[parseInt(m[2], 10) - 1] + ' ' + parseInt(m[3], 10) : '';
  }
  function slugify(s) {
    return String(s || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  }
  function todayISO() { return new Date().toISOString().slice(0, 10); }
  function plusDaysISO(n) { var d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
  function timeAgo(ts) {
    if (!ts) return '';
    var s = (Date.now() - new Date(ts).getTime()) / 1000;
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + ' min ago';
    if (s < 86400) return Math.floor(s / 3600) + ' h ago';
    if (s < 86400 * 7) return Math.floor(s / 86400) + ' d ago';
    return new Date(ts).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  function fmtDateTime(ts) {
    return new Date(ts).toLocaleString('en-CA', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  }
  function isBlank(v) {
    return v === undefined || v === null || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && !v.length);
  }
  function resolveUrl(u) {
    if (!u) return '';
    if (/^(https?:|blob:|data:image\/)/i.test(u)) return u;
    return u.replace(/^\/+/, '');
  }
  function humanize(k) {
    return String(k).replace(/([a-z])([A-Z0-9])/g, '$1 $2').replace(/[-_]/g, ' ')
      .replace(/^./, function (c) { return c.toUpperCase(); }).replace(/\b(\d)\b/g, ' $1').replace(/\s+/g, ' ').trim();
  }

  // ============================================================
  // SECTION SCHEMAS
  // Field types: text, textarea, date, number, select, checkbox,
  // image, file, stringList, imageList, list, object, optionIndex.
  // `required` / `showIf` may be functions of the containing object.
  // ============================================================
  var STATUS_OPTIONS = [
    { value: 'confirmed', label: 'Confirmed: shown on the site' },
    { value: 'planned', label: 'Planned: hidden until confirmed' }
  ];

  var personFields = function (extra) {
    return [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'role', label: 'Role / title', type: 'text', required: true }
    ].concat(extra || []);
  };
  var studentExtra = [
    { name: 'major', label: 'Program', type: 'text', required: true, placeholder: 'BCom' },
    { name: 'year', label: 'Grad year', type: 'text', required: true, placeholder: "'28" }
  ];

  var crosswordSchema = {
    type: 'object', fields: [
      { name: 'title', label: 'Puzzle title', type: 'text', required: true },
      { name: 'estimate', label: 'Time estimate', type: 'text', placeholder: '~5 min' },
      { name: 'words', label: 'Words & clues', type: 'list', wide: true,
        hint: 'Aim for 11 to 13 words, 3 to 9 letters each. The grid is built automatically.',
        addLabel: 'Add word',
        newItem: function () { return { answer: '', clue: '' }; },
        summary: function (w) { return { title: (w.answer || 'New word').toUpperCase(), sub: w.clue }; },
        item: { type: 'object', fields: [
          { name: 'answer', label: 'Answer', type: 'text', required: true, mono: true, hint: 'Letters only. Spaces and punctuation are removed.' },
          { name: 'clue', label: 'Clue', type: 'text', required: true, wide: true }
        ] } }
    ]
  };
  var triviaSchema = {
    type: 'object', fields: [
      { name: 'title', label: 'Round title', type: 'text', required: true },
      { name: 'questions', label: 'Questions', type: 'list', wide: true, addLabel: 'Add question',
        newItem: function () { return { q: '', options: ['', '', '', ''], answer: 0, explain: '' }; },
        summary: function (q) { return { title: q.q || 'New question', sub: q.options && q.options[q.answer] ? 'Answer: ' + q.options[q.answer] : '' }; },
        item: { type: 'object', fields: [
          { name: 'q', label: 'Question', type: 'text', required: true, wide: true },
          { name: 'options', label: 'Answer options', type: 'stringList', required: true, wide: true, minItems: 2, addLabel: 'Add option' },
          { name: 'answer', label: 'Correct answer', type: 'optionIndex', from: 'options', required: true, wide: true },
          { name: 'explain', label: 'Explanation (shown after answering)', type: 'textarea', wide: true }
        ] } }
    ]
  };

  var SECTIONS = [
    { key: 'upcoming_events', group: 'Events', title: 'Upcoming events', icon: 'calendar', view: 'events.html',
      desc: 'This season’s events. Confirmed events appear on the homepage and Events page, and move to “Past events” automatically after their date.',
      schema: { type: 'list', addLabel: 'Add event', sortHint: 'The site orders events by date automatically.',
        newItem: function () {
          var iso = plusDaysISO(14);
          return { id: '', title: '', dateDisplay: dateDisplayFrom(iso), isoDate: iso, time: 'TBD', venue: 'TBD', partner: 'TBD', speakers: 'TBD', blurb: '', status: 'planned' };
        },
        summary: function (e) {
          var past = e.isoDate && e.isoDate < todayISO();
          return {
            title: e.title || 'Untitled event',
            sub: [e.dateDisplay || e.isoDate, e.time, e.venue].filter(Boolean).join(' · '),
            thumb: e.flyer,
            badge: past ? { text: 'Past', cls: '' } : e.status === 'confirmed' ? { text: 'Live', cls: 'green' } : { text: 'Planned', cls: 'brass' }
          };
        },
        item: { type: 'object',
          afterChange: function (e, field, prev) {
            if (field === 'isoDate' && (!e.dateDisplay || e.dateDisplay === dateDisplayFrom(prev))) e.dateDisplay = dateDisplayFrom(e.isoDate);
            if (field === 'title' && (!e.id || e.id === slugify(prev))) e.id = slugify(e.title);
          },
          fields: [
            { name: 'title', label: 'Event title', type: 'text', required: true, wide: true },
            { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, required: true },
            { name: 'isoDate', label: 'Date', type: 'date', required: true },
            { name: 'dateDisplay', label: 'Date as shown', type: 'text', required: true, hint: 'Fills in from the date. Change it for things like “Oct 27 & Feb 24”.' },
            { name: 'time', label: 'Time', type: 'text', required: true, placeholder: '6:00 PM', hint: 'Use a format like 6:00 PM so “Add to calendar” works. TBD is fine.' },
            { name: 'venue', label: 'Venue', type: 'text', required: true },
            { name: 'partner', label: 'Co-host / partner', type: 'text', required: true, hint: 'Use TBD if there’s no partner.' },
            { name: 'speakers', label: 'Speakers', type: 'text', required: true, wide: true },
            { name: 'blurb', label: 'Description', type: 'textarea', required: true, wide: true },
            { name: 'flyer', label: 'Flyer image (optional)', type: 'image', wide: true },
            { name: 'rsvpUrl', label: 'RSVP link (optional)', type: 'text', wide: true, placeholder: 'https://forms.gle/…', hint: 'Adds an RSVP button next to “Add to calendar”.' },
            { name: 'id', label: 'Link ID', type: 'text', mono: true, wide: true, required: true, hint: 'Used in links like events.html#this-id. Fills in from the title; changing it breaks old links.' }
          ] } } },

    { key: 'past_events', group: 'Events', title: 'Past events', icon: 'clock', view: 'events.html#past',
      desc: 'The hand-picked highlights in the “Past events” grid, shown in this order after any recently finished events.',
      schema: { type: 'list', addLabel: 'Add past event', addTop: true,
        newItem: function () { return { title: '', dateDisplay: '', venue: '', tag: 'Panel', blurb: '' }; },
        summary: function (e) { return { title: e.title || 'Untitled event', sub: [e.dateDisplay, e.venue].filter(Boolean).join(' · '), thumb: e.photos && e.photos[0], badge: e.highlight ? { text: 'Highlighted', cls: 'brass' } : { text: e.tag || '', cls: '' } }; },
        item: { type: 'object', fields: [
          { name: 'title', label: 'Event title', type: 'text', required: true, wide: true },
          { name: 'dateDisplay', label: 'Date as shown', type: 'text', required: true, placeholder: 'October 21' },
          { name: 'venue', label: 'Venue', type: 'text', required: true },
          { name: 'tag', label: 'Tag', type: 'text', required: true, placeholder: 'Panel, Workshop, Social…' },
          { name: 'highlight', label: 'Highlight this card', type: 'checkbox', sub: 'Gives it the accent border.' },
          { name: 'blurb', label: 'Description', type: 'textarea', required: true, wide: true },
          { name: 'speakers', label: 'Speakers (optional)', type: 'stringList', wide: true, addLabel: 'Add speaker', placeholder: 'Name, CFA: Title, Firm' },
          { name: 'photos', label: 'Photos (optional)', type: 'imageList', wide: true, addLabel: 'Add photo' }
        ] } } },

    { key: 'reports', group: 'Content', title: 'Research reports', icon: 'doc', view: 'research.html',
      desc: 'Sector reports on the Research page. Published reports also appear in the homepage carousel.',
      schema: { type: 'list', addLabel: 'Add report', addTop: true,
        newItem: function () { return { title: 'Sector Report: ', sector: '', authors: '', date: '', blurb: '', pdf: '', cover: '' }; },
        summary: function (r) { return { title: r.title || 'Untitled report', sub: [r.sector, r.date].filter(Boolean).join(' · '), thumb: r.cover, badge: r.pending ? { text: 'Coming soon', cls: 'brass' } : { text: 'Published', cls: 'green' } }; },
        item: { type: 'object', fields: [
          { name: 'pending', label: 'Coming soon placeholder', type: 'checkbox', wide: true, sub: 'Shows a greyed-out “check back soon” card instead of a report.',
            onToggle: function (r) { if (r.pending) r.comingSoon = true; else delete r.comingSoon; } },
          { name: 'title', label: 'Title', type: 'text', required: true, wide: true },
          { name: 'sector', label: 'Sector', type: 'text', required: true },
          { name: 'date', label: 'Published', type: 'text', placeholder: 'October 2025', required: function (r) { return !r.pending; }, showIf: function (r) { return !r.pending; } },
          { name: 'authors', label: 'Authors', type: 'text', wide: true, required: function (r) { return !r.pending; }, showIf: function (r) { return !r.pending; } },
          { name: 'blurb', label: 'Summary', type: 'textarea', wide: true, required: function (r) { return !r.pending; }, showIf: function (r) { return !r.pending; } },
          { name: 'pdf', label: 'Report PDF', type: 'file', accept: 'application/pdf', wide: true, required: function (r) { return !r.pending; }, showIf: function (r) { return !r.pending; } },
          { name: 'cover', label: 'Cover image', type: 'image', wide: true, required: function (r) { return !r.pending; }, showIf: function (r) { return !r.pending; } }
        ] } } },

    { key: 'team', group: 'Content', title: 'Team', icon: 'people', view: 'team.html',
      desc: 'Everyone on the Team page. Use the arrows to set the order people appear in.',
      schema: { type: 'object', layout: 'tabs', fields: [
        { name: 'presidents', label: 'Co-Presidents', type: 'list', addLabel: 'Add president',
          newItem: function () { return { name: '', role: 'Co-President', major: '', year: '' }; },
          summary: function (p) { return { title: p.name || 'New person', sub: p.role }; },
          item: { type: 'object', fields: personFields(studentExtra.map(function (f) { return Object.assign({}, f, { required: false }); })) } },
        { name: 'board', label: 'Board of Directors', type: 'list', addLabel: 'Add director',
          newItem: function () { return { name: '', role: 'Director', firm: '' }; },
          summary: function (p) { return { title: p.name || 'New person', sub: [p.role, p.firm].filter(Boolean).join(' · ') }; },
          item: { type: 'object', fields: personFields([{ name: 'firm', label: 'Firm / background', type: 'text', required: true, wide: true }]) } },
        { name: 'external', label: 'External team', type: 'list', addLabel: 'Add member',
          newItem: function () { return { name: '', role: '', major: 'BCom', year: '' }; },
          summary: function (p) { return { title: p.name || 'New person', sub: p.role, badge: p.featured ? { text: 'Featured', cls: 'brass' } : null }; },
          item: { type: 'object', fields: personFields(studentExtra.concat([{ name: 'featured', label: 'Feature this person', type: 'checkbox', sub: 'Shown in a larger card at the top of the tab.', wide: true }])) } },
        { name: 'internal', label: 'Internal team', type: 'list', addLabel: 'Add member',
          newItem: function () { return { name: '', role: 'Analyst', major: 'BCom', year: '' }; },
          summary: function (p) { return { title: p.name || 'New person', sub: p.role, badge: p.featured ? { text: 'Featured', cls: 'brass' } : null }; },
          item: { type: 'object', fields: personFields(studentExtra.concat([{ name: 'featured', label: 'Feature this person', type: 'checkbox', sub: 'Shown in a larger card at the top of the tab.', wide: true }])) } }
      ] } },

    { key: 'speakers', group: 'Content', title: 'Past speakers', icon: 'mic', view: 'events.html#firms',
      desc: 'The speaker directory on the Events page, grouped by category.',
      schema: { type: 'list', addLabel: 'Add category',
        newItem: function () { return { category: '', people: [] }; },
        summary: function (g) { return { title: g.category || 'New category', sub: (g.people || []).length + ' speakers' }; },
        item: { type: 'object', fields: [
          { name: 'category', label: 'Category name', type: 'text', required: true, wide: true },
          { name: 'people', label: 'Speakers', type: 'list', wide: true, addLabel: 'Add speaker', sortable: 'name',
            newItem: function () { return { name: '', role: '' }; },
            summary: function (p) { return { title: p.name || 'New speaker', sub: p.role }; },
            item: { type: 'object', fields: personFields() } }
        ] } } },

    { key: 'firms', group: 'Content', title: 'Firms we’ve hosted', icon: 'building', view: 'events.html#firms',
      desc: 'The scrolling list of firm names on the Events page.',
      schema: { type: 'stringList', addLabel: 'Add firm', placeholder: 'Firm name', sortable: true } },

    { key: 'site_text', group: 'Site', title: 'Page text & images', icon: 'text', view: 'index.html',
      desc: 'Headlines, paragraphs, buttons, stats and photos on every page. Leave a field as it is to keep the original.',
      custom: 'siteText' },

    { key: 'interests', group: 'Site', title: 'Join form interests', icon: 'star', view: 'join.html',
      desc: 'The “What areas of finance interest you?” choices on the Join form. Answers are saved to the member sheet by name, so renaming one starts a new answer.',
      schema: { type: 'list', addLabel: 'Add interest',
        newItem: function () { return { area: '', careers: '' }; },
        summary: function (i) { return { title: i.area || 'New interest', sub: i.careers }; },
        item: { type: 'object', fields: [
          { name: 'area', label: 'Interest area', type: 'text', required: true, wide: true },
          { name: 'careers', label: 'Example careers (small text)', type: 'text', required: true, wide: true }
        ] } } },

    { key: 'puzzles', group: 'Games', title: 'Weekly puzzles', icon: 'puzzle', view: 'crossword.html',
      desc: 'This week’s crossword and trivia. Change the week code each week so everyone gets a fresh grid.',
      schema: { type: 'object', fields: [
        { name: 'week', label: 'Week code', type: 'text', required: true, mono: true, placeholder: '2026-W43', hint: 'Any new value gives a new grid layout. Year-week works well.', suggest: function () {
          var d = new Date(); var t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
          var day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day);
          var y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
          return t.getUTCFullYear() + '-W' + String(Math.ceil(((t - y0) / 86400000 + 1) / 7)).padStart(2, '0');
        } },
        { name: 'crossword', label: 'Crossword', type: 'object', layout: 'tabs', wide: true, fields: [
          Object.assign({ name: 'easy', label: 'Easy crossword' }, crosswordSchema),
          Object.assign({ name: 'hard', label: 'Hard crossword' }, crosswordSchema)
        ] },
        { name: 'trivia', label: 'Trivia', type: 'object', layout: 'tabs', wide: true, fields: [
          Object.assign({ name: 'easy', label: 'Easy trivia' }, triviaSchema),
          Object.assign({ name: 'hard', label: 'Hard trivia' }, triviaSchema)
        ] }
      ] } },

    { key: 'survey', group: 'Games', title: 'Feedback survey', icon: 'survey', view: 'survey.html',
      desc: 'The questions on /survey. Responses go to the “Survey” tab of the Google Sheet, one column per question label.',
      schema: { type: 'object', fields: [
        { name: 'title', label: 'Survey title', type: 'text', required: true },
        { name: 'estimate', label: 'Time estimate', type: 'text', placeholder: 'About 1 minute' },
        { name: 'intro', label: 'Intro text', type: 'textarea', wide: true },
        { name: 'id', label: 'Survey round ID', type: 'text', required: true, mono: true, wide: true, hint: 'Change this when you start a new round (e.g. each term) so responses can be told apart.' },
        { name: 'questions', label: 'Questions', type: 'list', wide: true, addLabel: 'Add question',
          newItem: function () { return { type: 'choice', label: '', q: '', options: ['', ''] }; },
          summary: function (q) { return { title: q.q || 'New question', sub: q.label, badge: { text: ({ rating: '1–5 rating', choice: 'Pick one', multi: 'Pick any', text: 'Written' })[q.type] || q.type, cls: '' } }; },
          item: { type: 'object', fields: [
            { name: 'type', label: 'Question type', type: 'select', required: true, rerender: true, options: [
              { value: 'choice', label: 'Pick one option' }, { value: 'multi', label: 'Pick any options' },
              { value: 'rating', label: 'Rating from 1 to 5' }, { value: 'text', label: 'Written answer' } ] },
            { name: 'label', label: 'Sheet column name', type: 'text', required: true, hint: 'Keep it the same between rounds so answers line up.' },
            { name: 'q', label: 'Question', type: 'text', required: true, wide: true },
            { name: 'options', label: 'Options', type: 'stringList', wide: true, minItems: 2, addLabel: 'Add option',
              required: function (q) { return q.type === 'choice' || q.type === 'multi'; }, showIf: function (q) { return q.type === 'choice' || q.type === 'multi'; } },
            { name: 'low', label: 'Label for 1', type: 'text', placeholder: 'Not useful', showIf: function (q) { return q.type === 'rating'; } },
            { name: 'high', label: 'Label for 5', type: 'text', placeholder: 'Very useful', showIf: function (q) { return q.type === 'rating'; } },
            { name: 'placeholder', label: 'Placeholder text', type: 'text', wide: true, showIf: function (q) { return q.type === 'text'; } },
            { name: 'required', label: 'Required', type: 'checkbox', wide: true, sub: 'People can’t skip this question.' }
          ] } }
      ] } },

    { key: '_editors', group: 'Settings', title: 'Editors', icon: 'key', custom: 'editors',
      desc: 'Who can sign in here and edit the site. New editors create their own password with “First time here?” on the sign-in screen.' }
  ];

  var SECTION_BY_KEY = {};
  SECTIONS.forEach(function (s) { SECTION_BY_KEY[s.key] = s; });

  // Built-in content (from the data files loaded on this page).
  var DEFAULTS = {
    upcoming_events: clone(UVIG_UPCOMING), past_events: clone(UVIG_PAST), reports: clone(UVIG_REPORTS),
    team: clone(UVIG_TEAM), speakers: clone(UVIG_SPEAKERS), firms: clone(UVIG_FIRMS),
    interests: clone(UVIG_INTERESTS), puzzles: clone(PUZZLES), survey: clone(SURVEY),
    site_text: {}   // stored as overrides only; originals live in SITE_DEFAULTS
  };
  var SITE_DEFAULTS = {}; // page-text key -> original text, read from the pages

  // ============================================================
  // BACKENDS
  // ============================================================
  function supabaseApi() {
    var lib = window.supabase;
    if (!lib || !lib.createClient) throw new Error('Couldn’t load the Supabase library. Check your connection and refresh.');
    var sb = lib.createClient(CFG.url, CFG.anonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    var redirect = location.origin + location.pathname;
    function chk(res) { if (res.error) throw res.error; return res.data; }
    return {
      demo: false,
      client: sb,
      session: function () { return sb.auth.getSession().then(function (r) { var s = r.data && r.data.session; return s ? { email: s.user.email } : null; }); },
      onAuth: function (cb) { sb.auth.onAuthStateChange(function (ev, s) { cb(ev, s ? { email: s.user.email } : null); }); },
      signIn: function (email, pw) { return sb.auth.signInWithPassword({ email: email, password: pw }).then(chk); },
      signUp: function (email, pw) { return sb.auth.signUp({ email: email, password: pw, options: { emailRedirectTo: redirect } }).then(chk); },
      resetPassword: function (email) { return sb.auth.resetPasswordForEmail(email, { redirectTo: redirect }).then(chk); },
      updatePassword: function (pw) { return sb.auth.updateUser({ password: pw }).then(chk); },
      signOut: function () { return sb.auth.signOut(); },
      isAdmin: function () { return sb.rpc('is_site_admin').then(chk).then(function (d) { return d === true; }); },
      loadAll: function () {
        return sb.from('site_content').select('key,value,updated_at,updated_by').then(chk).then(function (rows) {
          var out = {}; (rows || []).forEach(function (r) { out[r.key] = r; }); return out;
        });
      },
      save: function (key, value) {
        return sb.from('site_content').upsert({ key: key, value: value }).select('key,value,updated_at,updated_by').single().then(chk);
      },
      reset: function (key) { return sb.from('site_content').delete().eq('key', key).then(chk); },
      history: function (key, limit) {
        var q = sb.from('site_content_history').select('id,key,value,action,edited_by,edited_at').order('edited_at', { ascending: false }).limit(limit || 30);
        if (key) q = q.eq('key', key);
        return q.then(chk);
      },
      upload: function (file) {
        var ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
        var path = 'uploads/' + new Date().toISOString().slice(0, 10) + '/' + Date.now().toString(36) + '-' + (slugify(file.name.replace(/\.[^.]+$/, '')) || 'file') + '.' + ext;
        return sb.storage.from('site-files').upload(path, file, { contentType: file.type, upsert: false }).then(chk).then(function () {
          return sb.storage.from('site-files').getPublicUrl(path).data.publicUrl;
        });
      },
      editors: function () { return sb.from('site_admins').select('email,added_at,added_by').order('added_at').then(chk); },
      addEditor: function (email) { return sb.from('site_admins').insert({ email: email.toLowerCase() }).then(chk); },
      removeEditor: function (email) { return sb.from('site_admins').delete().eq('email', email).then(chk); }
    };
  }

  // Demo backend: everything in this browser's localStorage.
  function demoApi() {
    var KEY = 'uvig_admin_demo';
    function db() { try { return JSON.parse(localStorage.getItem(KEY) || 'null') || { content: {}, history: [], editors: [] }; } catch (e) { return { content: {}, history: [], editors: [] }; } }
    function put(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
    var who = 'demo@uvig.local';
    var ok = function (v) { return Promise.resolve(v); };
    return {
      demo: true,
      session: function () { return ok({ email: who }); },
      onAuth: function () {},
      signOut: function () { return ok(); },
      isAdmin: function () { return ok(true); },
      loadAll: function () { return ok(db().content); },
      save: function (key, value) {
        var d = db(); var row = { key: key, value: value, updated_at: new Date().toISOString(), updated_by: who };
        d.content[key] = row; d.history.unshift({ id: Date.now(), key: key, value: value, action: 'save', edited_by: who, edited_at: row.updated_at });
        d.history = d.history.slice(0, 200); put(d); return ok(row);
      },
      reset: function (key) {
        var d = db(); delete d.content[key];
        d.history.unshift({ id: Date.now(), key: key, value: null, action: 'reset', edited_by: who, edited_at: new Date().toISOString() });
        put(d); return ok();
      },
      history: function (key, limit) { return ok(db().history.filter(function (r) { return !key || r.key === key; }).slice(0, limit || 30)); },
      upload: function (file) {
        if (file.size > 1.5 * 1024 * 1024) return Promise.reject(new Error('Demo mode keeps uploads in this browser, so files must be under 1.5 MB. Once Supabase is connected, uploads up to 15 MB work.'));
        return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(r.result); }; r.onerror = rej; r.readAsDataURL(file); });
      },
      editors: function () { return ok([{ email: 'jtenove1@gmail.com' }, { email: '24georgemurray@gmail.com' }, { email: 'willhansen66@gmail.com' }].concat(db().editors)); },
      addEditor: function (email) { var d = db(); d.editors.push({ email: email.toLowerCase(), added_at: new Date().toISOString() }); put(d); return ok(); },
      removeEditor: function (email) { var d = db(); d.editors = d.editors.filter(function (e) { return e.email !== email; }); put(d); return ok(); }
    };
  }

  // ============================================================
  // STATE
  // ============================================================
  var api;
  var S = {
    user: null,
    rows: {},          // key -> { value, updated_at, updated_by } as saved on the server
    draft: {},         // key -> working copy
    dirty: {},         // key -> true
    current: 'home',
    siteFields: null,  // parsed from the pages: [{ key, kind, def, page, label, multiline }]
    textPage: 'home',
    textSearch: ''
  };

  function published(key) {
    var r = S.rows[key];
    return r && r.value !== undefined && r.value !== null ? r.value : DEFAULTS[key];
  }
  function ensureDraft(key) {
    if (!(key in S.draft)) S.draft[key] = clone(published(key));
    return S.draft[key];
  }
  function markDirty(key) {
    S.dirty[key] = !same(S.draft[key], published(key));
    updateChrome();
  }
  function anyDirty() { return Object.keys(S.dirty).some(function (k) { return S.dirty[k]; }); }

  window.addEventListener('beforeunload', function (e) {
    if (anyDirty()) { e.preventDefault(); e.returnValue = ''; }
  });

  // ============================================================
  // FORM BUILDER
  // ctx: { key, changed(), rerender() }
  // ============================================================
  function req(field, obj) { return typeof field.required === 'function' ? field.required(obj) : !!field.required; }

  function renderObject(schema, obj, ctx) {
    var syncers = [];
    var wrap = h('div');
    function refresh() { syncers.forEach(function (fn) { fn(); }); }
    var objCtx = {
      key: ctx.key,
      changed: function (fieldName, prev) {
        if (schema.afterChange && fieldName) schema.afterChange(obj, fieldName, prev);
        refresh();
        ctx.changed();
      },
      rerender: ctx.rerender
    };

    if (schema.layout === 'tabs') {
      var active = 0;
      var seg = h('div', { class: 'seg' });
      var holder = h('div');
      var showTab = function (i) {
        active = i;
        [].forEach.call(seg.children, function (b, j) { b.classList.toggle('on', j === i); });
        holder.innerHTML = '';
        var f = schema.fields[i];
        if (obj[f.name] === undefined) obj[f.name] = f.type === 'object' ? {} : [];
        holder.appendChild(renderField(f, obj, objCtx, true));
      };
      schema.fields.forEach(function (f, i) {
        seg.appendChild(h('button', { type: 'button', text: f.label, onclick: function () { showTab(i); } }));
      });
      wrap.appendChild(h('div', { class: 'tabs-wrap' }, seg));
      wrap.appendChild(holder);
      showTab(active);
      return wrap;
    }

    var grid = h('div', { class: 'grid2' });
    schema.fields.forEach(function (f) {
      var el = renderField(f, obj, objCtx);
      if (f.wide || f.type === 'list' || f.type === 'object') el.classList.add('wide');
      if (f.showIf) syncers.push(function () { el.hidden = !f.showIf(obj); });
      if (el._sync) syncers.push(el._sync);
      grid.appendChild(el);
    });
    refresh();
    wrap.appendChild(grid);
    return wrap;
  }

  function fieldShell(f, obj, control, noLabel) {
    var label = noLabel ? null : h('div', { class: 'f-label' }, f.label, req(f, obj) ? h('span', { class: 'req', text: '*', title: 'Required' }) : null);
    return h('div', { class: 'f' }, label, control, f.hint ? h('div', { class: 'f-hint', text: f.hint }) : null);
  }

  function setVal(obj, name, v, f) {
    if ((v === '' || v === undefined) && !req(f, obj)) delete obj[name];
    else obj[name] = v;
  }

  function renderField(f, obj, ctx, inTab) {
    var name = f.name;
    var t = f.type;

    if (t === 'object') {
      if (!obj[name] || typeof obj[name] !== 'object') obj[name] = {};
      var inner = renderObject(f, obj[name], ctx);
      if (inTab) return inner;
      return h('div', { class: 'fieldset' }, h('div', { class: 'fs-title', text: f.label }), inner);
    }
    if (t === 'list') {
      if (!Array.isArray(obj[name])) obj[name] = [];
      var listEl = renderList(f, obj[name], ctx);
      if (inTab) return listEl;
      return fieldShell(f, obj, listEl);
    }
    if (t === 'stringList' || t === 'imageList') {
      if (!Array.isArray(obj[name])) obj[name] = [];
      var sl = renderStringList(f, obj, name, ctx);
      return fieldShell(f, obj, sl);
    }
    if (t === 'checkbox') {
      var cb = h('input', { type: 'checkbox', checked: !!obj[name], onchange: function () {
        if (cb.checked) obj[name] = true; else delete obj[name];
        if (f.onToggle) f.onToggle(obj);
        ctx.changed(name);
      } });
      var el = h('div', { class: 'f' }, h('label', { class: 'check' }, cb, h('div', null, h('b', { text: f.label }), f.sub ? h('span', { text: f.sub }) : null)));
      el._sync = function () { cb.checked = !!obj[name]; };
      return el;
    }
    if (t === 'select') {
      var sel = h('select', { class: 'in', onchange: function () {
        var prev = obj[name]; setVal(obj, name, sel.value, f); ctx.changed(name, prev);
        if (f.rerender) ctx.rerender();
      } }, f.options.map(function (o) { return h('option', { value: o.value, text: o.label, selected: obj[name] === o.value }); }));
      if (obj[name] === undefined && f.options[0]) { /* keep undefined until chosen */ sel.selectedIndex = -1; }
      var se = fieldShell(f, obj, sel);
      se._sync = function () { if (document.activeElement !== sel && obj[name] !== undefined) sel.value = obj[name]; };
      return se;
    }
    if (t === 'optionIndex') {
      var os = h('select', { class: 'in', onchange: function () { obj[name] = parseInt(os.value, 10); ctx.changed(name); } });
      var fill = function () {
        var opts = obj[f.from] || [];
        var cur = typeof obj[name] === 'number' ? obj[name] : 0;
        os.innerHTML = '';
        opts.forEach(function (o, i) { os.appendChild(h('option', { value: String(i), text: (i + 1) + '. ' + (o || '(empty option)'), selected: i === cur })); });
        if (cur >= opts.length && opts.length) { obj[name] = 0; os.value = '0'; }
      };
      fill();
      var oe = fieldShell(f, obj, os);
      oe._sync = function () { if (document.activeElement !== os) fill(); };
      return oe;
    }
    if (t === 'image' || t === 'file') {
      var fe = renderUpload(f, obj, name, ctx);
      return fieldShell(f, obj, fe);
    }

    // text / textarea / date / number
    var input;
    var onInput = function () {
      var prev = obj[name];
      var v = input.value;
      if (t === 'number') v = v === '' ? '' : Number(v);
      setVal(obj, name, v, f);
      input.classList.remove('invalid');
      ctx.changed(name, prev);
    };
    if (t === 'textarea') input = h('textarea', { class: 'in', rows: 4, placeholder: f.placeholder, oninput: onInput });
    else input = h('input', { class: 'in' + (f.mono ? ' mono' : ''), type: t === 'date' ? 'date' : t === 'number' ? 'number' : 'text', placeholder: f.placeholder, oninput: onInput });
    input.value = obj[name] === undefined || obj[name] === null ? '' : String(obj[name]);
    input.dataset.field = name;
    var control = input;
    if (f.suggest) {
      control = h('div', { style: 'display:flex; gap:6px;' }, input,
        btn('Use this week', 'btn-ghost', function () { var prev = obj[name]; input.value = f.suggest(); onInput(); toast('Set to ' + input.value + '. Saving publishes a fresh grid.'); void prev; }));
    }
    var te = fieldShell(f, obj, control);
    te._sync = function () {
      if (document.activeElement === input) return;
      var v = obj[name] === undefined || obj[name] === null ? '' : String(obj[name]);
      if (input.value !== v) input.value = v;
    };
    return te;
  }

  function renderUpload(f, obj, name, ctx) {
    var isImg = f.type === 'image';
    var prev = h('div', { class: 'img-prev' + (isImg ? '' : ' pdf') });
    var urlIn = h('input', { class: 'in mono', type: 'text', placeholder: isImg ? 'photo.jpg or https://…' : 'report.pdf or https://…' });
    urlIn.value = obj[name] || '';
    function paint() {
      var u = obj[name];
      if (isImg) {
        prev.style.backgroundImage = u ? 'url("' + resolveUrl(u).replace(/"/g, '%22') + '")' : '';
        prev.textContent = u ? '' : 'No image';
      } else {
        prev.textContent = u ? 'PDF' : 'No file';
      }
    }
    urlIn.addEventListener('input', function () { setVal(obj, name, urlIn.value.trim(), f); paint(); ctx.changed(name); });
    var file = h('input', { type: 'file', accept: f.accept || (isImg ? 'image/*' : '*/*'), hidden: true });
    var upBtn = btn(isImg ? 'Upload image' : 'Upload file', 'btn-ghost', function () { file.click(); }, 'upload');
    file.addEventListener('change', function () {
      var fl = file.files && file.files[0];
      if (!fl) return;
      if (fl.size > 15 * 1024 * 1024) { toast('That file is over 15 MB. Try compressing it first.', 'err'); return; }
      upBtn.disabled = true; upBtn.lastChild.textContent = 'Uploading…';
      api.upload(fl).then(function (url) {
        obj[name] = url; urlIn.value = url; paint(); ctx.changed(name);
        toast('Uploaded. Remember to save.', 'ok');
      }).catch(function (e) { toast('Upload failed: ' + (e.message || e), 'err'); })
        .then(function () { upBtn.disabled = false; upBtn.lastChild.textContent = isImg ? 'Upload image' : 'Upload file'; file.value = ''; });
    });
    var btns = h('div', { class: 'img-btns' }, upBtn,
      obj[name] || !req(f, obj) ? btn('Open', 'btn-quiet', function () { if (obj[name]) window.open(resolveUrl(obj[name]), '_blank', 'noopener'); }, 'ext') : null,
      !req(f, obj) ? btn('Remove', 'btn-quiet', function () { delete obj[name]; urlIn.value = ''; paint(); ctx.changed(name); }, 'x') : null);
    paint();
    return h('div', { class: 'img-field' }, prev, h('div', { class: 'img-main' }, urlIn, btns, file));
  }

  function renderStringList(f, obj, name, ctx) {
    var arr = obj[name];
    var wrap = h('div', { class: 'slist' });
    var isImg = f.type === 'imageList';
    function draw(focusIdx) {
      wrap.innerHTML = '';
      arr.forEach(function (v, i) {
        var row;
        if (isImg) {
          var holder = { v: v };
          var up = renderUpload({ type: 'image', required: true }, holder, 'v', { changed: function () { arr[i] = holder.v || ''; ctx.changed(name); } });
          row = h('div', { class: 'slist-row' }, h('div', { style: 'flex:1; min-width:0;' }, up));
        } else {
          var inp = h('input', { class: 'in', type: 'text', placeholder: f.placeholder || '', oninput: function () { arr[i] = inp.value; ctx.changed(name); } });
          inp.value = v;
          inp.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { e.preventDefault(); arr.splice(i + 1, 0, ''); ctx.changed(name); draw(i + 1); }
          });
          row = h('div', { class: 'slist-row' }, inp);
        }
        row.appendChild(iconBtn('up', 'Move up', function () { if (i > 0) { arr.splice(i - 1, 0, arr.splice(i, 1)[0]); ctx.changed(name); draw(); } }));
        row.lastChild.disabled = i === 0;
        row.appendChild(iconBtn('down', 'Move down', function () { if (i < arr.length - 1) { arr.splice(i + 1, 0, arr.splice(i, 1)[0]); ctx.changed(name); draw(); } }));
        row.lastChild.disabled = i === arr.length - 1;
        row.appendChild(iconBtn('trash', 'Remove', function () { arr.splice(i, 1); ctx.changed(name); draw(); }, 'danger'));
        wrap.appendChild(row);
      });
      var tools = h('div', { style: 'display:flex; gap:8px; flex-wrap:wrap;' },
        btn(f.addLabel || 'Add', 'btn-ghost slist-add', function () { arr.push(''); ctx.changed(name); draw(arr.length - 1); }, 'plus'),
        f.sortable && arr.length > 2 ? btn('Sort A–Z', 'btn-quiet slist-add', function () {
          arr.sort(function (a, b) { return String(a).localeCompare(String(b)); }); ctx.changed(name); draw();
        }, 'sort') : null);
      wrap.appendChild(tools);
      if (focusIdx !== undefined) {
        var target = wrap.querySelectorAll('.slist-row input.in')[focusIdx];
        if (target) target.focus();
      }
    }
    draw();
    return wrap;
  }

  function renderList(f, arr, ctx) {
    var wrap = h('div');
    var openSet = new Set();
    var listCtxKey = ctx.key;

    function draw(flashIdx) {
      wrap.innerHTML = '';
      var tools = h('div', { class: 'list-tools' }, h('span', { class: 'count', text: arr.length + (arr.length === 1 ? ' item' : ' items') + (f.sortHint ? ' · ' + f.sortHint : '') }));
      if (arr.length > 1) {
        tools.appendChild(btn('Expand all', 'btn-quiet', function () { arr.forEach(function (_, i) { openSet.add(i); }); draw(); }));
        tools.appendChild(btn('Collapse all', 'btn-quiet', function () { openSet.clear(); draw(); }));
      }
      if (f.sortable && arr.length > 2) tools.appendChild(btn('Sort A–Z', 'btn-quiet', function () {
        arr.sort(function (a, b) { return String(a[f.sortable] || '').localeCompare(String(b[f.sortable] || '')); });
        openSet.clear(); ctx.changed(); draw();
      }, 'sort'));
      if (f.addTop) tools.appendChild(btn(f.addLabel || 'Add', 'btn-ghost', function () { add(0); }, 'plus'));
      wrap.appendChild(tools);

      var list = h('div', { class: 'list' });
      if (!arr.length) list.appendChild(h('div', { class: 'empty', text: 'Nothing here yet.' }));
      arr.forEach(function (item, i) { list.appendChild(card(item, i, i === flashIdx)); });
      wrap.appendChild(list);
      wrap.appendChild(h('div', { style: 'margin-top:10px;' },
        h('button', { type: 'button', class: 'add-row', onclick: function () { add(arr.length); } }, icon('plus'), f.addLabel || 'Add')));
    }

    function add(at) {
      var item = f.newItem ? f.newItem() : {};
      arr.splice(at, 0, item);
      // keep open-state aligned with shifted indexes
      var next = new Set(); openSet.forEach(function (i) { next.add(i >= at ? i + 1 : i); }); openSet = next;
      openSet.add(at);
      ctx.changed();
      draw(at);
      var c = wrap.querySelectorAll(':scope > .list > .card')[at];
      if (c) { c.scrollIntoView({ behavior: 'smooth', block: 'center' }); var first = c.querySelector('.card-body .in'); if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 250); }
    }

    function move(i, d) {
      var j = i + d;
      if (j < 0 || j >= arr.length) return;
      arr.splice(j, 0, arr.splice(i, 1)[0]);
      var oi = openSet.has(i), oj = openSet.has(j);
      openSet.delete(i); openSet.delete(j);
      if (oi) openSet.add(j); if (oj) openSet.add(i);
      ctx.changed();
      draw(j);
    }

    function card(item, i, flash) {
      var sum = f.summary ? f.summary(item) : { title: 'Item ' + (i + 1) };
      var tEl = h('div', { class: 't', text: sum.title || '' });
      var sEl = h('div', { class: 's', text: sum.sub || '' });
      var bEl = h('span', { class: 'badge' + (sum.badge && sum.badge.cls ? ' ' + sum.badge.cls : ''), text: sum.badge ? sum.badge.text : '' });
      bEl.hidden = !(sum.badge && sum.badge.text);
      var thumb = sum.thumb !== undefined ? h('div', { class: 'thumb' }) : null;
      function paintThumb(u) { if (thumb) thumb.style.backgroundImage = u ? 'url("' + resolveUrl(u).replace(/"/g, '%22') + '")' : ''; }
      paintThumb(sum.thumb);

      var el = h('div', { class: 'card' + (openSet.has(i) ? ' open' : '') + (flash ? ' flash' : '') });
      var body = h('div', { class: 'card-body' });
      var bodyBuilt = false;
      function buildBody() {
        if (bodyBuilt) return;
        bodyBuilt = true;
        var itemCtx = {
          key: listCtxKey,
          changed: function () {
            var s2 = f.summary ? f.summary(item) : null;
            if (s2) {
              tEl.textContent = s2.title || ''; sEl.textContent = s2.sub || '';
              bEl.hidden = !(s2.badge && s2.badge.text);
              if (s2.badge) { bEl.textContent = s2.badge.text; bEl.className = 'badge' + (s2.badge.cls ? ' ' + s2.badge.cls : ''); }
              paintThumb(s2.thumb);
            }
            ctx.changed();
          },
          rerender: function () { body.innerHTML = ''; bodyBuilt = false; buildBody(); }
        };
        if (f.item.type === 'object') body.appendChild(renderObject(f.item, item, itemCtx));
      }
      if (openSet.has(i)) buildBody();

      var actions = h('div', { class: 'card-actions' },
        iconBtn('up', 'Move up', function (e) { e.stopPropagation(); move(i, -1); }),
        iconBtn('down', 'Move down', function (e) { e.stopPropagation(); move(i, 1); }),
        iconBtn('copy', 'Duplicate', function (e) {
          e.stopPropagation();
          var c = clone(item);
          if (c.id) c.id = c.id + '-copy';
          if (c.title) c.title = c.title + ' (copy)';
          arr.splice(i + 1, 0, c);
          var next = new Set(); openSet.forEach(function (k) { next.add(k > i ? k + 1 : k); }); openSet = next; openSet.add(i + 1);
          ctx.changed(); draw(i + 1);
        }),
        iconBtn('trash', 'Delete', function (e) {
          e.stopPropagation();
          if (!confirm('Delete “' + (sum.title || 'this item') + '”? You can still Discard before saving.')) return;
          arr.splice(i, 1);
          var next = new Set(); openSet.forEach(function (k) { if (k !== i) next.add(k > i ? k - 1 : k); }); openSet = next;
          ctx.changed(); draw();
        }, 'danger'));
      actions.children[0].disabled = i === 0;
      actions.children[1].disabled = i === arr.length - 1;

      var head = h('div', { class: 'card-head', onclick: function () {
        var open = !el.classList.contains('open');
        el.classList.toggle('open', open);
        if (open) { openSet.add(i); buildBody(); } else openSet.delete(i);
      } },
        h('span', { class: 'num', text: String(i + 1) }), thumb,
        h('div', { class: 'txt' }, tEl, sEl), bEl, actions, h('span', { class: 'chev icon-btn' }, icon('chev')));
      el.appendChild(head);
      el.appendChild(body);
      if (flash) setTimeout(function () { el.classList.remove('flash'); }, 900);
      el._open = function () { el.classList.add('open'); openSet.add(i); buildBody(); };
      return el;
    }

    draw();
    wrap._openPath = function (i) { var c = wrap.querySelectorAll(':scope > .list > .card')[i]; if (c && c._open) c._open(); return c; };
    return wrap;
  }

  // ---------- Validation ----------
  function validate(schema, value, path, errors) {
    if (!schema) return;
    if (schema.type === 'list') {
      (value || []).forEach(function (item, i) {
        var label = (schema.summary ? schema.summary(item).title : '') || ('item ' + (i + 1));
        validate(schema.item, item, path.concat(['#' + (i + 1) + ' “' + label + '”']), errors);
      });
      if (schema.item && schema.item.fields && schema.item.fields.some(function (f) { return f.name === 'id'; })) {
        var seen = {};
        (value || []).forEach(function (item) {
          if (item.id && seen[item.id]) errors.push(path.concat(['Two items share the Link ID “' + item.id + '”']).join(' › '));
          seen[item.id] = 1;
        });
      }
      return;
    }
    if (schema.type === 'stringList' || schema.type === 'imageList') {
      if (schema.minItems && (value || []).filter(function (v) { return String(v).trim(); }).length < schema.minItems) errors.push(path.concat(['needs at least ' + schema.minItems + ' filled-in entries']).join(' › '));
      return;
    }
    if (schema.type === 'object') {
      schema.fields.forEach(function (f) {
        if (f.showIf && !f.showIf(value)) return;
        var v = value ? value[f.name] : undefined;
        var p = path.concat([f.label]);
        if (req(f, value) && isBlank(v)) { errors.push(p.join(' › ') + ' is required'); return; }
        if (f.type === 'list' || f.type === 'object' || f.type === 'stringList' || f.type === 'imageList') {
          if (f.type === 'stringList' && f.minItems && !req(f, value)) return;
          validate(f, v, p, errors);
        }
        if (f.type === 'date' && v && !/^\d{4}-\d{2}-\d{2}$/.test(v)) errors.push(p.join(' › ') + ' must be a date');
      });
    }
  }

  // Trim stray blank strings out of string lists before saving.
  function tidy(v) {
    if (Array.isArray(v)) {
      return v.map(tidy).filter(function (x) { return !(typeof x === 'string' && !x.trim()); });
    }
    if (v && typeof v === 'object') {
      var o = {}; Object.keys(v).forEach(function (k) { o[k] = tidy(v[k]); }); return o;
    }
    return typeof v === 'string' ? v.replace(/\s+$/, '') : v;
  }

  // ============================================================
  // SITE TEXT (scanned from the pages themselves)
  // ============================================================
  var TEXT_PAGES = [
    { id: 'home', file: 'index.html', label: 'Homepage' },
    { id: 'events', file: 'events.html', label: 'Events' },
    { id: 'research', file: 'research.html', label: 'Research' },
    { id: 'team', file: 'team.html', label: 'Team' },
    { id: 'newsletter', file: 'newsletter.html', label: 'Newsletter' },
    { id: 'join', file: 'join.html', label: 'Join' },
    { id: 'footer', file: 'index.html', label: 'Footer (every page)' }
  ];
  var GROUP_NAMES = {
    hero: 'Top banner', events: 'Upcoming events', research: 'Featured research', banner: 'Photo banner',
    about: 'What is UVIG?', stats: 'Stats', card1: 'Feature card 1', card2: 'Feature card 2', card3: 'Feature card 3',
    involved: 'Get involved', involved1: 'Get involved: card 1', involved2: 'Get involved: card 2', involved3: 'Get involved: card 3',
    newsletter: 'Newsletter promo', puzzles: 'Puzzles promo', upcoming: 'This season', past: 'Past events', hosted: 'Who we’ve hosted',
    reports: 'Sector reports', board: 'Board tab', external: 'External tab', internal: 'Internal tab', members: 'Members tab',
    block1: 'Section 1', block2: 'Section 2', block3: 'Section 3', cta: 'Sign-up box', intro: 'Intro', perks: 'Member perks',
    tagline: 'Footer', copyright: 'Footer'
  };

  function loadSiteFields() {
    if (S.siteFields) return Promise.resolve(S.siteFields);
    var files = [];
    TEXT_PAGES.forEach(function (p) { if (files.indexOf(p.file) < 0) files.push(p.file); });
    return Promise.all(files.map(function (file) {
      return fetch(file, { cache: 'no-store' }).then(function (r) { return r.ok ? r.text() : ''; }).catch(function () { return ''; })
        .then(function (html) { return { file: file, doc: new DOMParser().parseFromString(html, 'text/html') }; });
    })).then(function (docs) {
      var seen = {}; var out = [];
      docs.forEach(function (d) {
        d.doc.querySelectorAll('[data-content],[data-content-counter],[data-content-bg],[data-content-img]').forEach(function (el) {
          [['data-content', 'text'], ['data-content-counter', 'number'], ['data-content-bg', 'image'], ['data-content-img', 'image']].forEach(function (pair) {
            var key = el.getAttribute(pair[0]);
            if (!key || seen[key]) return;
            seen[key] = 1;
            var def;
            if (pair[1] === 'text') def = el.textContent.replace(/\s+/g, ' ').trim();
            else if (pair[1] === 'number') def = el.getAttribute('data-counter') || '';
            else if (pair[0] === 'data-content-img') def = el.getAttribute('src') || '';
            else { var m = /url\(['"]?(.*?)['"]?\)/.exec(el.getAttribute('style') || ''); def = m ? m[1] : ''; }
            var parts = key.split('.');
            var tag = el.tagName.toLowerCase();
            out.push({
              key: key, kind: pair[1], def: def, page: parts[0],
              group: parts.length > 2 ? parts[1] : parts[1],
              label: pair[1] === 'number' ? humanize(parts[parts.length - 1]) + ' (number)' : humanize(parts[parts.length - 1]),
              multiline: pair[1] === 'text' && (tag === 'p' || tag === 'li' || def.length > 90),
              file: d.file
            });
          });
        });
      });
      out.forEach(function (f) { SITE_DEFAULTS[f.key] = f.def; });
      S.siteFields = out;
      return out;
    });
  }

  // site_text is stored as overrides only: { key: value } for changed fields.
  function siteTextValue(key) {
    var d = ensureDraft('site_text');
    return d[key] !== undefined ? d[key] : (SITE_DEFAULTS[key] || '');
  }

  function renderSiteText(container) {
    container.appendChild(h('div', { class: 'empty', text: 'Reading the pages…' }));
    loadSiteFields().then(function (fields) {
      container.innerHTML = '';
      if (!fields.length) { container.appendChild(h('div', { class: 'empty', text: 'Couldn’t read the pages. Refresh to try again.' })); return; }
      var draft = ensureDraft('site_text');
      // older saves may still hold keys equal to defaults; the editor treats them the same
      var seg = h('div', { class: 'seg' });
      var search = h('input', { class: 'in', type: 'search', placeholder: 'Search all page text…', value: S.textSearch });
      var body = h('div');
      TEXT_PAGES.forEach(function (p) {
        var n = fields.filter(function (f) { return f.page === p.id && draft[f.key] !== undefined && draft[f.key] !== f.def; }).length;
        seg.appendChild(h('button', { type: 'button', class: S.textPage === p.id ? 'on' : '', onclick: function () { S.textPage = p.id; S.textSearch = ''; search.value = ''; paint(); [].forEach.call(seg.children, function (b, j) { b.classList.toggle('on', TEXT_PAGES[j].id === p.id); }); } },
          p.label + (n ? ' · ' + n : '')));
      });
      search.addEventListener('input', function () { S.textSearch = search.value; paint(); });
      container.appendChild(h('div', { class: 'st-tools' }, h('div', { class: 'st-search' }, icon('search'), search)));
      container.appendChild(h('div', { class: 'tabs-wrap' }, seg));
      container.appendChild(body);

      function paint() {
        body.innerHTML = '';
        var q = S.textSearch.trim().toLowerCase();
        var list = fields.filter(function (f) {
          if (q) return (f.label + ' ' + f.def + ' ' + siteTextValue(f.key) + ' ' + f.key).toLowerCase().indexOf(q) >= 0;
          return f.page === S.textPage;
        });
        seg.parentNode.hidden = !!q;
        if (!list.length) { body.appendChild(h('div', { class: 'empty', text: 'No matching text.' })); return; }
        var groups = [];
        list.forEach(function (f) {
          var gname = (q ? (TEXT_PAGES.filter(function (p) { return p.id === f.page; })[0] || {}).label + ': ' : '') + (GROUP_NAMES[f.group] || humanize(f.group));
          var g = groups.filter(function (x) { return x.name === gname; })[0];
          if (!g) { g = { name: gname, file: f.file, fields: [] }; groups.push(g); }
          g.fields.push(f);
        });
        groups.forEach(function (g) {
          var box = h('div', { class: 'st-group' },
            h('h3', null, g.name, h('a', { href: g.file + '?preview', target: '_blank', rel: 'noopener', text: 'Preview page ↗', onclick: function () { writePreview(); } })));
          g.fields.forEach(function (f) { box.appendChild(siteField(f)); });
          body.appendChild(box);
        });
      }

      function siteField(f) {
        var changedTag = h('span', { class: 'changed', text: 'Edited' });
        var resetBtn = h('button', { type: 'button', class: 'linkbtn', text: 'Reset to original' });
        function refreshTag() {
          var edited = draft[f.key] !== undefined && draft[f.key] !== f.def;
          changedTag.hidden = !edited; resetBtn.hidden = !edited;
        }
        function setV(v) {
          if (v === f.def || v === '') delete draft[f.key]; else draft[f.key] = v;
          refreshTag(); markDirty('site_text');
        }
        var control;
        if (f.kind === 'image') {
          var holder = { v: siteTextValue(f.key) };
          control = renderUpload({ type: 'image', required: true }, holder, 'v', { changed: function () { setV(holder.v || ''); } });
          resetBtn.addEventListener('click', function () { setV(''); var nc = siteField(f); el.replaceWith(nc); });
        } else {
          var inp = f.multiline ? h('textarea', { class: 'in', rows: 3 }) : h('input', { class: 'in', type: f.kind === 'number' ? 'number' : 'text' });
          inp.value = siteTextValue(f.key);
          inp.placeholder = f.def;
          inp.addEventListener('input', function () { setV(inp.value); });
          resetBtn.addEventListener('click', function () { inp.value = f.def; setV(f.def); });
          control = inp;
        }
        var el = h('div', { class: 'st-field' }, h('div', { class: 'top' }, h('label', { text: f.label }), h('div', { style: 'display:flex; gap:10px; align-items:center;' }, changedTag, resetBtn)), control);
        refreshTag();
        return el;
      }
      paint();
    });
  }

  // ============================================================
  // PREVIEW (unsaved drafts → ?preview on the real pages)
  // ============================================================
  function writePreview() {
    var p = {};
    var keys = Object.keys(S.rows).concat(Object.keys(S.draft));
    keys.forEach(function (k) {
      if (k.charAt(0) === '_' || !(k in DEFAULTS)) return;
      var v = k in S.draft ? S.draft[k] : published(k);
      // page text: send every field, so a field reset in the draft also reverts on the preview
      p[k] = k === 'site_text' ? Object.assign({}, SITE_DEFAULTS, v) : tidy(v);
    });
    try { localStorage.setItem(PREVIEW_KEY, JSON.stringify(p)); } catch (e) { toast('Preview is too large for this browser. Save instead.', 'err'); }
  }

  // ============================================================
  // SCREENS
  // ============================================================
  var root = document.getElementById('root');
  function mount(el) { root.innerHTML = ''; root.appendChild(el); }

  function authShell(title, sub, content) {
    return h('div', { class: 'auth-wrap' }, h('div', { class: 'auth-card' },
      h('div', { class: 'auth-brand' }, h('img', { src: 'icon-192.png', alt: '' }), h('div', null, h('b', { text: 'UVic Investment Group' }), h('small', { text: 'Site admin' }))),
      h('h1', { text: title }), sub ? h('p', { class: 'sub', text: sub }) : null, content));
  }

  function friendlyAuthError(e) {
    var m = (e && (e.message || e.error_description)) || String(e);
    if (/Invalid login credentials/i.test(m)) return 'Wrong email or password. First time here? Use “First time here?” to create your password.';
    if (/Email not confirmed/i.test(m)) return 'Confirm your email first: open the link we emailed you, then sign in.';
    if (/Database error saving new user|not on the UVIG editors list/i.test(m)) return 'That email isn’t on the editors list. Ask an existing editor to add you under Editors.';
    if (/already registered/i.test(m)) return 'You already have an account. Sign in, or use “Forgot password?”.';
    if (/rate limit|security purposes/i.test(m)) return 'Too many attempts. Wait a minute and try again.';
    if (/Password should be/i.test(m)) return m;
    return m;
  }

  function loginScreen(mode, notice) {
    mode = mode || 'signin';
    var msg = h('div', { class: 'auth-msg', hidden: !notice });
    if (notice) { msg.className = 'auth-msg ' + notice.kind; msg.textContent = notice.text; }
    function show(text, kind) { msg.hidden = false; msg.className = 'auth-msg ' + kind; msg.textContent = text; }
    var email = h('input', { class: 'in', type: 'email', autocomplete: 'email', placeholder: 'you@example.com', required: true });
    var pw = h('input', { class: 'in', type: 'password', autocomplete: mode === 'signup' ? 'new-password' : 'current-password', placeholder: mode === 'signup' ? 'At least 8 characters' : 'Password', required: true });
    var go = h('button', { type: 'submit', class: 'btn btn-primary btn-block', text: mode === 'signup' ? 'Create password' : mode === 'forgot' ? 'Email me a reset link' : 'Sign in' });
    var form = h('form', { onsubmit: function (e) {
      e.preventDefault();
      var em = email.value.trim().toLowerCase();
      if (!em) return;
      if (mode !== 'forgot' && pw.value.length < 8) { show('Passwords need at least 8 characters.', 'err'); return; }
      go.disabled = true;
      var p = mode === 'signup' ? api.signUp(em, pw.value) : mode === 'forgot' ? api.resetPassword(em) : api.signIn(em, pw.value);
      p.then(function (data) {
        if (mode === 'forgot') { show('If that email is an editor, a reset link is on its way. Open it on this device.', 'ok'); return; }
        if (mode === 'signup' && !(data && data.session)) { show('Almost done: check your inbox for a confirmation email, click the link, then sign in here.', 'ok'); return; }
        boot();
      }).catch(function (err) { show(friendlyAuthError(err), 'err'); })
        .then(function () { go.disabled = false; });
    } },
      h('div', { class: 'f' }, h('label', { text: 'Email' }), email),
      mode === 'forgot' ? null : h('div', { class: 'f' }, h('label', { text: mode === 'signup' ? 'Choose a password' : 'Password' }), pw),
      go);
    var tabs = mode === 'forgot' ? null : h('div', { class: 'auth-tabs' },
      h('button', { type: 'button', class: mode === 'signin' ? 'on' : '', text: 'Sign in', onclick: function () { mount(loginScreen('signin')); } }),
      h('button', { type: 'button', class: mode === 'signup' ? 'on' : '', text: 'First time here?', onclick: function () { mount(loginScreen('signup')); } }));
    var links = h('div', { class: 'auth-links' },
      mode === 'forgot' ? h('button', { type: 'button', class: 'linkbtn', text: '← Back to sign in', onclick: function () { mount(loginScreen('signin')); } })
        : h('button', { type: 'button', class: 'linkbtn', text: 'Forgot password?', onclick: function () { mount(loginScreen('forgot')); } }),
      h('a', { href: 'index.html', text: 'Back to site' }));
    var sub = mode === 'signup' ? 'Editors only. Use the email the club added to the editors list and choose your own password.'
      : mode === 'forgot' ? 'We’ll email you a link to choose a new password.' : 'Sign in to edit events, research, team and page text.';
    return authShell(mode === 'signup' ? 'Create your password' : mode === 'forgot' ? 'Reset your password' : 'Welcome back', sub, h('div', null, tabs, msg, form, links));
  }

  function setPasswordScreen(email) {
    var msg = h('div', { class: 'auth-msg', hidden: true });
    var pw = h('input', { class: 'in', type: 'password', autocomplete: 'new-password', placeholder: 'At least 8 characters' });
    var pw2 = h('input', { class: 'in', type: 'password', autocomplete: 'new-password', placeholder: 'Type it again' });
    var go = h('button', { type: 'submit', class: 'btn btn-primary btn-block', text: 'Save password' });
    return authShell('Choose a new password', email ? 'For ' + email : null, h('form', { onsubmit: function (e) {
      e.preventDefault();
      if (pw.value.length < 8) { msg.hidden = false; msg.className = 'auth-msg err'; msg.textContent = 'Use at least 8 characters.'; return; }
      if (pw.value !== pw2.value) { msg.hidden = false; msg.className = 'auth-msg err'; msg.textContent = 'Those don’t match.'; return; }
      go.disabled = true;
      api.updatePassword(pw.value).then(function () {
        history.replaceState(null, '', location.pathname);
        toast('Password saved.', 'ok'); boot();
      }).catch(function (err) { msg.hidden = false; msg.className = 'auth-msg err'; msg.textContent = friendlyAuthError(err); go.disabled = false; });
    } }, msg, h('div', { class: 'f' }, h('label', { text: 'New password' }), pw), h('div', { class: 'f' }, h('label', { text: 'Confirm password' }), pw2), go));
  }

  function notAllowedScreen(email) {
    return authShell('Not on the editors list', 'You’re signed in as ' + email + ', but that email can’t edit the site.',
      h('div', null, h('p', { style: 'font-size:14px; color:var(--muted); margin:0 0 16px;', text: 'Ask an existing editor to add this email under Editors, or sign in with a different account.' }),
        btn('Sign out', 'btn-primary btn-block', function () { api.signOut().then(function () { mount(loginScreen('signin')); }); })));
  }

  // ---------- Main app shell ----------
  var navEls = {};
  var shell = {};
  var keysBound = false;

  function appShell() {
    var side = h('aside', { class: 'side' },
      h('a', { class: 'side-brand', href: '#', onclick: function (e) { e.preventDefault(); go('home'); } }, h('img', { src: 'icon-192.png', alt: '' }), h('span', null, h('b', { text: 'UVIG Admin' }), h('small', { text: api.demo ? 'Demo mode' : 'Content editor' }))));
    navEls = {};
    function navItem(key, label, ic) {
      var b = h('button', { type: 'button', class: 'nav-item', onclick: function () { go(key); } }, icon(ic), h('span', { text: label }), h('span', { class: 'dot', title: 'Unsaved changes' }));
      navEls[key] = b; return b;
    }
    side.appendChild(navItem('home', 'Overview', 'home'));
    var lastGroup = null;
    SECTIONS.forEach(function (s) {
      if (s.group !== lastGroup) { side.appendChild(h('div', { class: 'side-group', text: s.group })); lastGroup = s.group; }
      side.appendChild(navItem(s.key, s.title, s.icon));
    });
    side.appendChild(h('div', { class: 'side-foot' },
      h('div', { class: 'who', text: S.user ? S.user.email : '' }),
      h('div', { class: 'row' },
        h('a', { href: 'index.html', target: '_blank', rel: 'noopener', class: 'hide-m', text: 'View site ↗' }),
        api.demo ? null : h('button', { type: 'button', class: 'linkbtn', style: 'color:#C9D3E1', text: 'Sign out', onclick: function () {
          if (anyDirty() && !confirm('You have unsaved changes. Sign out anyway?')) return;
          S.dirty = {}; api.signOut().then(function () { mount(loginScreen('signin')); });
        } }))));

    shell.main = h('main', { class: 'main' });
    shell.saveMsg = h('span', { class: 'msg', text: 'Unsaved changes' });
    shell.saveBtn = btn('Save & publish', 'btn-primary', function () { saveCurrent(); });
    shell.discardBtn = btn('Discard', 'btn-ghost', function () { discardCurrent(); });
    shell.previewBtn = btn('Preview', 'btn-ghost', function () { previewCurrent(); }, 'eye');
    shell.savebar = h('div', { class: 'savebar' }, shell.saveMsg, shell.discardBtn, shell.previewBtn, shell.saveBtn);
    shell.scrim = h('div', { class: 'scrim', onclick: closeDrawer });
    shell.drawer = h('div', { class: 'drawer', role: 'dialog', 'aria-modal': 'true' });
    if (!keysBound) document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); if (S.dirty[S.current]) saveCurrent(); }
      if (e.key === 'Escape') closeDrawer();
    });
    keysBound = true;
    return h('div', { class: 'app' }, side, shell.main, shell.savebar, shell.scrim, shell.drawer);
  }

  function updateChrome() {
    Object.keys(navEls).forEach(function (k) {
      navEls[k].classList.toggle('on', k === S.current);
      navEls[k].classList.toggle('dirty', !!S.dirty[k]);
    });
    var d = !!S.dirty[S.current];
    if (shell.savebar) shell.savebar.classList.toggle('show', d);
  }

  function go(key) {
    S.current = key;
    var url = key === 'home' ? location.pathname : location.pathname + '#' + key;
    history.replaceState(null, '', url);
    render();
    window.scrollTo(0, 0);
  }

  function sectionMeta(key) {
    var r = S.rows[key];
    if (!r || !r.updated_at) return 'Using the original content';
    return 'Last saved ' + timeAgo(r.updated_at) + (r.updated_by ? ' by ' + r.updated_by : '');
  }

  function render() {
    var m = shell.main;
    m.innerHTML = '';
    if (api.demo) m.appendChild(h('div', { class: 'demo-banner', text: 'Demo mode: Supabase isn’t connected yet, so changes are only saved in this browser and visitors don’t see them. Use Preview to see them on the real pages.' }));
    if (S.current === 'home') renderHome(m);
    else {
      var s = SECTION_BY_KEY[S.current];
      if (!s) { S.current = 'home'; return render(); }
      renderSection(s, m);
    }
    updateChrome();
  }

  function renderHome(m) {
    var first = S.user && S.user.email ? S.user.email.split('@')[0] : '';
    m.appendChild(h('div', { class: 'page-head' }, h('div', null,
      h('h1', { text: 'Hi' + (first ? ', ' + first : '') + '.' }),
      h('p', { text: 'Pick what you want to update. Changes go live for everyone as soon as you hit Save & publish. Every save is kept, so you can always roll back.' }))));

    var upcoming = (published('upcoming_events') || []).filter(function (e) { return e.status === 'confirmed' && e.isoDate >= todayISO(); })
      .sort(function (a, b) { return a.isoDate < b.isoDate ? -1 : 1; })[0];
    if (upcoming) {
      var d = new Date(upcoming.isoDate + 'T00:00:00');
      m.appendChild(h('div', { class: 'panel', style: 'margin-top:0; margin-bottom:22px;' },
        h('div', { class: 'next-up' },
          h('div', { class: 'date' }, h('b', { text: String(d.getDate()) }), h('span', { text: d.toLocaleString('en-US', { month: 'short' }).toUpperCase() })),
          h('div', { style: 'flex:1; min-width:200px;' }, h('div', { style: 'font-size:12px; letter-spacing:.1em; color:var(--faint); text-transform:uppercase;', text: 'Next event on the homepage' }),
            h('div', { style: 'font:600 17px/1.3 var(--serif); margin-top:2px;', text: upcoming.title }),
            h('div', { style: 'font-size:13px; color:var(--muted);', text: [upcoming.time, upcoming.venue].filter(Boolean).join(' · ') })),
          btn('Edit events', 'btn-ghost', function () { go('upcoming_events'); }, 'calendar'))));
    }

    var grid = h('div', { class: 'dash-grid' });
    SECTIONS.forEach(function (s) {
      grid.appendChild(h('button', { type: 'button', class: 'dash-card', onclick: function () { go(s.key); } },
        h('div', { class: 'ic' }, icon(s.icon)), h('b', { text: s.title }), h('span', { text: s.desc.split('. ')[0].replace(/\.$/, '') + '.' }),
        s.key.charAt(0) === '_' ? null : h('small', { text: sectionMeta(s.key) })));
    });
    m.appendChild(grid);

    var act = h('ul', { class: 'activity' }, h('li', null, h('span', { text: 'Loading…', style: 'color:var(--faint)' })));
    m.appendChild(h('div', { class: 'panel' }, h('h2', { text: 'Recent changes' }), act));
    api.history(null, 12).then(function (rows) {
      act.innerHTML = '';
      if (!rows || !rows.length) { act.appendChild(h('li', null, h('span', { text: 'No changes yet. Everything is showing the original content.', style: 'color:var(--faint)' }))); return; }
      rows.forEach(function (r) {
        var s = SECTION_BY_KEY[r.key];
        act.appendChild(h('li', null, h('span', null, h('b', { text: (r.edited_by || 'Someone') }), r.action === 'reset' ? ' reset ' : ' updated ',
          h('a', { href: '#' + r.key, text: s ? s.title : r.key, onclick: function (e) { e.preventDefault(); go(r.key); } })),
          h('span', { class: 'when', text: timeAgo(r.edited_at) })));
      });
    }).catch(function () { act.innerHTML = ''; act.appendChild(h('li', null, h('span', { text: 'Couldn’t load recent changes.', style: 'color:var(--faint)' }))); });
  }

  function renderSection(s, m) {
    var isContent = s.key.charAt(0) !== '_';
    var actions = h('div', { class: 'head-actions' });
    if (s.view) actions.appendChild(h('a', { class: 'btn btn-ghost', href: s.view, target: '_blank', rel: 'noopener' }, icon('ext'), 'View on site'));
    if (isContent) {
      actions.appendChild(btn('History', 'btn-ghost', function () { openHistory(s); }, 'history'));
      actions.appendChild(btn('Reset to original', 'btn-quiet', function () { resetSection(s); }, 'reset'));
    }
    m.appendChild(h('div', { class: 'page-head' },
      h('div', null, h('h1', { text: s.title }), h('p', { text: s.desc }), isContent ? h('div', { class: 'meta', text: sectionMeta(s.key) }) : null),
      actions));

    var body = h('div');
    m.appendChild(body);
    if (s.custom === 'siteText') { renderSiteText(body); return; }
    if (s.custom === 'editors') { renderEditors(body); return; }

    var draft = ensureDraft(s.key);
    var ctx = { key: s.key, changed: function () { markDirty(s.key); }, rerender: function () { render(); } };
    if (s.schema.type === 'list') body.appendChild(renderList(s.schema, draft, ctx));
    else if (s.schema.type === 'stringList') {
      var holder = { v: draft };
      body.appendChild(h('div', { class: 'fieldset' }, renderStringList(s.schema, holder, 'v', ctx)));
    } else if (s.schema.type === 'object') body.appendChild(h('div', { class: s.schema.layout === 'tabs' ? '' : 'fieldset' }, renderObject(s.schema, draft, ctx)));
  }

  // ---------- Save / discard / reset / history ----------
  function saveCurrent() {
    var s = SECTION_BY_KEY[S.current];
    if (!s || !S.dirty[s.key]) return;
    var value = tidy(S.draft[s.key]);
    if (s.schema) {
      var errors = [];
      validate(s.schema, value, [], errors);
      if (errors.length) {
        toast('Fix ' + (errors.length === 1 ? 'this' : 'these ' + errors.length) + ' before saving: ' + errors.slice(0, 3).join('; ') + (errors.length > 3 ? '…' : ''), 'err');
        highlightInvalid();
        return;
      }
    }
    if (s.key === 'site_text') {
      // store only real overrides
      Object.keys(value).forEach(function (k) { if (value[k] === SITE_DEFAULTS[k] || value[k] === '') delete value[k]; });
    }
    shell.saveBtn.disabled = true; shell.saveBtn.lastChild.textContent = 'Saving…';
    api.save(s.key, value).then(function (row) {
      S.rows[s.key] = row;
      S.draft[s.key] = clone(row.value);
      S.dirty[s.key] = false;
      toast('Saved. It’s live on the site.', 'ok');
      render();
    }).catch(function (e) {
      toast('Couldn’t save: ' + (e.message || e) + (/(row-level|permission|JWT)/i.test(e.message || '') ? ' (try signing out and in again)' : ''), 'err');
    }).then(function () { shell.saveBtn.disabled = false; shell.saveBtn.lastChild.textContent = 'Save & publish'; });
  }

  // Open cards holding empty required inputs and outline them.
  function highlightInvalid() {
    var main = shell.main;
    main.querySelectorAll('.card:not(.open) > .card-head').forEach(function (hd) { hd.click(); });
    setTimeout(function () {
      var firstBad = null;
      main.querySelectorAll('.f').forEach(function (f) {
        if (f.closest('[hidden]')) return;
        var star = f.querySelector(':scope > .f-label .req');
        var input = f.querySelector(':scope > .in, :scope > div > .in, :scope .img-main > .in');
        if (star && input && !String(input.value || '').trim()) { input.classList.add('invalid'); if (!firstBad) firstBad = input; }
      });
      if (firstBad) { firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' }); firstBad.focus({ preventScroll: true }); }
    }, 30);
  }

  function discardCurrent() {
    var k = S.current;
    if (!confirm('Throw away your unsaved changes here?')) return;
    delete S.draft[k]; S.dirty[k] = false;
    render();
  }

  function previewCurrent() {
    writePreview();
    var s = SECTION_BY_KEY[S.current];
    var page = (s && s.view) || 'index.html';
    var parts = page.split('#');
    window.open(parts[0] + '?preview' + (parts[1] ? '#' + parts[1] : ''), '_blank', 'noopener');
  }

  function resetSection(s) {
    if (!confirm('Go back to the original built-in ' + s.title.toLowerCase() + '? Your current version stays in History, so you can undo this.')) return;
    var after = function () {
      delete S.rows[s.key]; delete S.draft[s.key]; S.dirty[s.key] = false;
      toast('Back to the original.', 'ok'); render();
    };
    if (!S.rows[s.key]) { after(); return; }
    api.reset(s.key).then(after).catch(function (e) { toast('Couldn’t reset: ' + (e.message || e), 'err'); });
  }

  function closeDrawer() { if (shell.drawer) { shell.drawer.classList.remove('show'); shell.scrim.classList.remove('show'); } }
  function openDrawer(title, content) {
    shell.drawer.innerHTML = '';
    shell.drawer.appendChild(h('div', { class: 'drawer-head' }, h('h2', { text: title }), iconBtn('x', 'Close', closeDrawer)));
    shell.drawer.appendChild(h('div', { class: 'drawer-body' }, content));
    shell.drawer.classList.add('show'); shell.scrim.classList.add('show');
  }

  function openHistory(s) {
    var list = h('div', null, h('div', { class: 'empty', text: 'Loading…' }));
    openDrawer('History: ' + s.title, list);
    api.history(s.key, 40).then(function (rows) {
      list.innerHTML = '';
      list.appendChild(h('p', { style: 'font-size:13px; color:var(--muted); margin:4px 0 10px;', text: 'Load any version into the editor, check it, then Save & publish to bring it back.' }));
      list.appendChild(h('div', { class: 'ver' }, h('div', null, h('b', { text: 'Original built-in content' }), h('span', { text: 'From the site’s data files' })),
        btn('Load', 'btn-ghost', function () { loadVersion(s, DEFAULTS[s.key]); })));
      (rows || []).forEach(function (r, i) {
        list.appendChild(h('div', { class: 'ver' },
          h('div', null, h('b', { text: fmtDateTime(r.edited_at) + (i === 0 && S.rows[s.key] ? ' (live now)' : '') }), h('span', { text: (r.action === 'reset' ? 'Reset to original by ' : 'Saved by ') + (r.edited_by || 'unknown') })),
          r.action === 'reset' ? null : btn('Load', 'btn-ghost', function () { loadVersion(s, r.value); })));
      });
      if (!rows || !rows.length) list.appendChild(h('div', { class: 'empty', text: 'No saved versions yet.' }));
    }).catch(function (e) { list.innerHTML = ''; list.appendChild(h('div', { class: 'empty', text: 'Couldn’t load history: ' + (e.message || e) })); });
  }

  function loadVersion(s, value) {
    S.draft[s.key] = clone(value === null || value === undefined ? DEFAULTS[s.key] : value);
    closeDrawer();
    S.current = s.key;
    render();
    markDirty(s.key);
    toast(S.dirty[s.key] ? 'Version loaded. Review it, then Save & publish.' : 'That version matches what’s live now.');
  }

  // ---------- Editors ----------
  function renderEditors(body) {
    var list = h('div', { class: 'list' }, h('div', { class: 'empty', text: 'Loading…' }));
    var email = h('input', { class: 'in', type: 'email', placeholder: 'new.editor@example.com' });
    var add = btn('Add editor', 'btn-primary', function () {
      var em = email.value.trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { toast('Enter a full email address.', 'err'); return; }
      add.disabled = true;
      api.addEditor(em).then(function () { email.value = ''; toast(em + ' can now create a password and sign in.', 'ok'); load(); })
        .catch(function (e) { toast(/duplicate/i.test(e.message || '') ? 'That email is already an editor.' : 'Couldn’t add: ' + (e.message || e), 'err'); })
        .then(function () { add.disabled = false; });
    }, 'plus');
    email.addEventListener('keydown', function (e) { if (e.key === 'Enter') add.click(); });
    body.appendChild(h('div', { class: 'fieldset' }, h('div', { class: 'fs-title', text: 'Add an editor' }),
      h('div', { style: 'display:flex; gap:8px; flex-wrap:wrap;' }, h('div', { style: 'flex:1; min-width:220px;' }, email), add),
      h('div', { class: 'f-hint', text: 'Then tell them to open this page, choose “First time here?” and set their own password. Never share passwords.' })));
    body.appendChild(list);
    function load() {
      api.editors().then(function (rows) {
        list.innerHTML = '';
        rows.forEach(function (r) {
          var me = S.user && r.email === String(S.user.email).toLowerCase();
          list.appendChild(h('div', { class: 'card' }, h('div', { class: 'card-head', style: 'cursor:default' },
            h('div', { class: 'txt' }, h('div', { class: 't', text: r.email }), h('div', { class: 's', text: r.added_at ? 'Added ' + timeAgo(r.added_at) + (r.added_by && r.added_by !== 'setup' ? ' by ' + r.added_by : '') : '' })),
            me ? h('span', { class: 'badge green', text: 'You' }) : iconBtn('trash', 'Remove editor', function () {
              if (!confirm('Remove ' + r.email + '? They won’t be able to edit anymore.')) return;
              api.removeEditor(r.email).then(function () { toast('Removed.', 'ok'); load(); }).catch(function (e) { toast('Couldn’t remove: ' + (e.message || e), 'err'); });
            }, 'danger'))));
        });
      }).catch(function (e) { list.innerHTML = ''; list.appendChild(h('div', { class: 'empty', text: 'Couldn’t load editors: ' + (e.message || e) })); });
    }
    load();
  }

  // ============================================================
  // BOOT
  // ============================================================
  var hashAtLoad = location.hash;
  var recoveryFlow = /type=(recovery|invite)/.test(hashAtLoad);
  var hashError = /error_description=([^&]+)/.exec(hashAtLoad);

  function startApp(user) {
    S.user = user;
    return api.loadAll().then(function (rows) {
      S.rows = rows || {};
      mount(appShell());
      var want = (location.hash || '').slice(1);
      S.current = SECTION_BY_KEY[want] ? want : 'home';
      render();
      loadSiteFields();
    });
  }

  function boot() {
    mount(h('div', { class: 'loading', text: 'Loading admin…' }));
    if (!api) {
      try { api = CONFIGURED ? supabaseApi() : demoApi(); }
      catch (e) { mount(authShell('Can’t load the editor', e.message, null)); return; }
      api.onAuth(function (ev) {
        if (ev === 'PASSWORD_RECOVERY') { recoveryFlow = true; api.session().then(function (u) { mount(setPasswordScreen(u && u.email)); }); }
      });
    }
    api.session().then(function (user) {
      if (!user) {
        var note = hashError ? { kind: 'err', text: decodeURIComponent(hashError[1].replace(/\+/g, ' ')) + '. Try again below.' } : null;
        hashError = null;
        mount(loginScreen('signin', note));
        return;
      }
      if (recoveryFlow) { recoveryFlow = false; mount(setPasswordScreen(user.email)); return; }
      return api.isAdmin().then(function (ok) {
        if (!ok) { mount(notAllowedScreen(user.email)); return; }
        return startApp(user);
      });
    }).catch(function (e) {
      mount(authShell('Something went wrong', (e && e.message) || String(e), btn('Try again', 'btn-primary btn-block', boot)));
    });
  }

  boot();
})();
