// ============================================================
// Shared site behavior — nav, sticky header, Use-as-App modal
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Mobile nav toggle ---- */
  const menuBtn = document.getElementById('menuBtn');
  const nav = document.getElementById('primaryNav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuBtn.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', open);
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      menuBtn.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }));
  }

  /* ---- Sticky header: hide on scroll down, show on scroll up ---- */
  const header = document.querySelector('header.masthead');
  if (header) {
    let lastY = window.scrollY;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      header.classList.toggle('scrolled', y > 8);
      if (y > lastY && y > 120) {
        header.classList.add('hide');
      } else {
        header.classList.remove('hide');
      }
      lastY = y;
    }, { passive: true });
  }

  /* ---- Add to Calendar (minimal dropdown, event delegation) ---- */
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.cal-trigger');
    const menuBtn = e.target.closest('[data-cal]');

    if (trigger) {
      const dropdown = trigger.closest('.cal-dropdown');
      const wasOpen = dropdown.classList.contains('open');
      document.querySelectorAll('.cal-dropdown.open').forEach(d => d.classList.remove('open'));
      if (!wasOpen) dropdown.classList.add('open');
      return;
    }

    if (menuBtn && typeof UVIG_UPCOMING !== 'undefined') {
      const ev = UVIG_UPCOMING.find(x => x.id === menuBtn.dataset.eventId);
      if (ev) {
        if (menuBtn.dataset.cal === 'google') openGoogleCalendar(ev);
        if (menuBtn.dataset.cal === 'ics') downloadICS(ev);
      }
      menuBtn.closest('.cal-dropdown').classList.remove('open');
      return;
    }

    // Click outside any dropdown closes all of them
    if (!e.target.closest('.cal-dropdown')) {
      document.querySelectorAll('.cal-dropdown.open').forEach(d => d.classList.remove('open'));
    }
  });
});

/* ---- Venue with optional photos ----
   If an event has venuePhotos (or a single venuePhoto), the venue becomes a
   button that opens them in a swipeable lightbox (see the handlers below). */
function renderVenue(ev) {
  const venue = ev.venue || '';
  const photos = (ev.venuePhotos && ev.venuePhotos.length ? ev.venuePhotos : ev.venuePhoto ? [ev.venuePhoto] : []).filter(Boolean);
  if (!photos.length) return venue;
  const attr = s => String(s).replace(/"/g, '&quot;');
  return `<button type="button" class="venue-link" data-venue-photos="${attr(photos.join('|'))}" data-venue-name="${attr(venue)}" aria-haspopup="dialog">${venue}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg></button>`;
}

let venueLightboxState = null;
function openVenueLightbox(srcs, name) {
  closeVenueLightbox();
  srcs = [].concat(srcs).filter(Boolean);
  if (!srcs.length) return;
  const box = document.createElement('div');
  box.className = 'venue-lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', name || 'Event photos');
  const many = srcs.length > 1;
  box.innerHTML = '<div class="venue-lightbox-inner">' +
    '<button type="button" class="venue-lightbox-close" aria-label="Close">&times;</button>' +
    '<div class="vl-viewport"><div class="vl-track">' + srcs.map(() => '<div class="vl-slide"><img alt=""></div>').join('') + '</div>' +
    (many ? '<button type="button" class="vl-nav vl-prev" aria-label="Previous photo">&#8249;</button><button type="button" class="vl-nav vl-next" aria-label="Next photo">&#8250;</button>' : '') + '</div>' +
    '<div class="venue-lightbox-cap"></div>' +
    (many ? '<div class="vl-dots">' + srcs.map((_, i) => '<button type="button" class="vl-dot" aria-label="Photo ' + (i + 1) + '"></button>').join('') + '</div>' : '') +
    '</div>';
  const imgs = box.querySelectorAll('.vl-slide img');
  srcs.forEach((s, i) => { imgs[i].src = s; imgs[i].alt = (name ? 'Photo of ' + name : 'Event photo') + (many ? ' (' + (i + 1) + ' of ' + srcs.length + ')' : ''); });
  box.querySelector('.venue-lightbox-cap').textContent = name || '';
  const track = box.querySelector('.vl-track');
  const dots = [...box.querySelectorAll('.vl-dot')];
  const state = venueLightboxState = { i: 0, n: srcs.length };
  state.go = idx => {
    state.i = Math.max(0, Math.min(state.n - 1, idx));
    track.style.transition = '';
    track.style.transform = 'translateX(' + (-state.i * 100) + '%)';
    dots.forEach((d, k) => d.classList.toggle('active', k === state.i));
    const p = box.querySelector('.vl-prev'), n = box.querySelector('.vl-next');
    if (p) p.disabled = state.i === 0;
    if (n) n.disabled = state.i === state.n - 1;
  };
  // Swipe (touch or mouse drag)
  let startX = null, dx = 0;
  const vp = box.querySelector('.vl-viewport');
  vp.addEventListener('pointerdown', e => { if (!many || e.target.closest('.vl-nav')) return; startX = e.clientX; dx = 0; track.style.transition = 'none'; vp.setPointerCapture(e.pointerId); });
  vp.addEventListener('pointermove', e => { if (startX === null) return; dx = e.clientX - startX; track.style.transform = 'translateX(calc(' + (-state.i * 100) + '% + ' + dx + 'px))'; });
  const end = () => { if (startX === null) return; const w = vp.clientWidth || 1; startX = null; state.go(state.i + (dx < -w * 0.15 ? 1 : dx > w * 0.15 ? -1 : 0)); };
  vp.addEventListener('pointerup', end); vp.addEventListener('pointercancel', end);
  box.addEventListener('click', e => {
    if (e.target.closest('.vl-prev')) state.go(state.i - 1);
    else if (e.target.closest('.vl-next')) state.go(state.i + 1);
    else if (e.target.closest('.vl-dot')) state.go(dots.indexOf(e.target.closest('.vl-dot')));
    else if (e.target === box || e.target.closest('.venue-lightbox-close') || (e.target.classList.contains('vl-slide') && Math.abs(dx) < 4)) closeVenueLightbox();
  });
  document.body.appendChild(box);
  state.go(0);
  requestAnimationFrame(() => box.classList.add('show'));
  box.querySelector('.venue-lightbox-close').focus();
}
function closeVenueLightbox() {
  venueLightboxState = null;
  document.querySelectorAll('.venue-lightbox').forEach(b => b.remove());
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeVenueLightbox();
  else if (venueLightboxState && e.key === 'ArrowRight') venueLightboxState.go(venueLightboxState.i + 1);
  else if (venueLightboxState && e.key === 'ArrowLeft') venueLightboxState.go(venueLightboxState.i - 1);
});
document.addEventListener('click', e => {
  const photo = e.target.closest('.past-card .photo-row img');
  if (photo) { openVenueLightbox(photo.currentSrc || photo.src, photo.alt.replace(/^Photo from /, '')); return; }
  const link = e.target.closest('.venue-link');
  if (link) openVenueLightbox(link.dataset.venuePhotos.split('|'), link.dataset.venueName);
});

/* ---- Calendar helpers ----
   Events with a "TBD" time default to 12:00 PM / 2-hour duration so a
   calendar entry can still be created — the description flags that the
   time is provisional. Update once real times are confirmed. */
function parseEventDateTime(ev) {
  // "7:00 PM" or "7:00 PM to 10:00 PM": the second time, if any, is the end.
  const toHM = m => {
    let h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    if (/PM/i.test(m[3]) && h < 12) h += 12;
    if (/AM/i.test(m[3]) && h === 12) h = 0;
    return [h, min];
  };
  const times = [...(ev.time || '').matchAll(/(\d{1,2}):(\d{2})\s*(AM|PM)/gi)].map(toHM);
  const [hours, minutes] = times[0] || [12, 0];
  const start = new Date(ev.isoDate + 'T00:00:00');
  start.setHours(hours, minutes, 0, 0);
  let end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  if (times[1]) {
    const e = new Date(start);
    e.setHours(times[1][0], times[1][1], 0, 0);
    if (e > start) end = e;
  }
  return { start, end };
}

function toICSDate(d) {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function eventDescription(ev) {
  let desc = ev.blurb || '';
  if (!/\d{1,2}:\d{2}\s*(AM|PM)/i.test(ev.time || '')) {
    desc += ' (Time TBD. Check the website closer to the date for the confirmed time.)';
  }
  return desc;
}

function openGoogleCalendar(ev) {
  const { start, end } = parseEventDateTime(ev);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: ev.title,
    dates: `${toICSDate(start)}/${toICSDate(end)}`,
    details: eventDescription(ev),
    location: ev.venue || ''
  });
  window.open(`https://www.google.com/calendar/render?${params.toString()}`, '_blank', 'noopener');
}

function renderCalDropdown(eventId) {
  return `
    <div class="cal-dropdown">
      <button class="cal-trigger" type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
        Add to calendar
      </button>
      <div class="cal-menu">
        <button type="button" data-cal="google" data-event-id="${eventId}">Google Calendar</button>
        <button type="button" data-cal="ics" data-event-id="${eventId}">Apple / Outlook (.ics)</button>
      </div>
    </div>
  `;
}

// RFC 5545: escape text values, and fold lines longer than 75 octets so Apple
// Calendar, Outlook and others all accept the file.
function icsEscape(t) {
  return String(t == null ? '' : t).replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
}
function icsFold(line) {
  const enc = new TextEncoder(), dec = new TextDecoder();
  const bytes = enc.encode(line);
  if (bytes.length <= 75) return line;
  const out = [];
  let i = 0, limit = 75;
  while (i < bytes.length) {
    let end = Math.min(i + limit, bytes.length);
    while (end < bytes.length && (bytes[end] & 0xC0) === 0x80) end--; // don't split a multi-byte character
    out.push((i ? ' ' : '') + dec.decode(bytes.slice(i, end)));
    i = end; limit = 74;
  }
  return out.join('\r\n');
}

function downloadICS(ev) {
  const { start, end } = parseEventDateTime(ev);
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//UVIG//Events//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${ev.id}@uvicinvestmentgroup.com`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${icsEscape(ev.title)}`,
    `DESCRIPTION:${icsEscape(eventDescription(ev))}`,
    `LOCATION:${icsEscape(ev.venue || '')}`,
    'END:VEVENT', 'END:VCALENDAR'
  ].map(icsFold);
  const ics = lines.join('\r\n') + '\r\n';
  const filename = `${ev.id}.ics`;

  // iPhone / iPad (Safari and in-app browsers) ignore the download attribute for generated
  // files, but opening a calendar data URL hands the event straight to Apple Calendar.
  const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS) {
    window.location.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
    return;
  }
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000); // revoking right away cancels the download in Safari
}

/* ============================================================
   SITE-WIDE MOTION SYSTEM
   Runs once the page (including any inline scripts that render
   cards from data.js) has finished loading, so dynamically drawn
   cards get the same effects. Each piece is a no-op on pages
   without matching elements.
   Waits for content-loader.js (content saved from /admin) so the
   effects attach to the final, rendered cards.
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => (window.UVIG_READY || (fn => fn()))(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- 1. Reveal on scroll, both directions. Elements with .stagger animate their children one by one. ----
  (function () {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      reveals.forEach(el => el.classList.add('revealed'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const el = entry.target;
        if (entry.isIntersecting) {
          if (el.classList.contains('stagger')) {
            [...el.children].forEach((child, i) => { child.style.transitionDelay = Math.min(i * 0.07, 0.56) + 's'; });
          }
          el.classList.add('revealed');
        } else {
          if (el.classList.contains('stagger')) {
            [...el.children].forEach(child => { child.style.transitionDelay = '0s'; });
          }
          el.classList.remove('revealed');
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => observer.observe(el));
  })();

  // ---- 2. Animated number counters (elements with data-counter="130") ----
  (function () {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;
    const finalText = el => el.dataset.counter + (el.dataset.counterSuffix || '');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      counters.forEach(el => { el.textContent = finalText(el); });
      return;
    }
    function animateCounter(el) {
      const target = parseInt(el.dataset.counter, 10);
      const suffix = el.dataset.counterSuffix || '';
      const duration = 1100;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => observer.observe(el));
  })();

  // ---- 2b. Featured Research carousel (home page only): swipeable, arrows + dots ----
  (function () {
    const track = document.getElementById('frTrack');
    if (!track || typeof UVIG_REPORTS === 'undefined') return;
    const reports = UVIG_REPORTS.filter(r => !r.pending);
    if (!reports.length) return;
    // A report marked "isNew" opens centered, with neighbours peeking in on both sides.
    const newIdx = reports.findIndex(r => r.isNew);
    if (newIdx > -1 && reports.length > 2) {
      const [fresh] = reports.splice(newIdx, 1);
      reports.splice(Math.floor((reports.length) / 2), 0, fresh);
    }

    track.innerHTML = reports.map(r => `
      <div class="fr-slide">
        <div class="featured-research-card">
          <div class="fr-image" style="background-image:url('${r.cover}');">${r.isNew ? '<span class="new-sticker">NEW</span>' : ''}</div>
          <div class="fr-body">
            ${r.date ? `<span class="report-date fr-date">${r.date}</span>` : ''}
            <h3>${r.title}</h3>
            <p>${r.blurb}</p>
            <a href="${r.pdf}" target="_blank" class="read-link">Read the full report (PDF) →</a>
          </div>
        </div>
      </div>
    `).join('');

    const carousel = track.closest('.fr-carousel');
    const dotsEl = document.getElementById('frDots');
    const prevBtn = document.getElementById('frPrev');
    const nextBtn = document.getElementById('frNext');
    if (reports.length < 2) { prevBtn.style.display = 'none'; nextBtn.style.display = 'none'; return; }

    dotsEl.innerHTML = reports.map((_, i) => `<button class="fr-dot${i === 0 ? ' active' : ''}" aria-label="Go to report ${i + 1}"></button>`).join('');
    const dots = [...dotsEl.children];
    const slides = [...track.children];
    const total = reports.length;
    let index = Math.max(0, reports.findIndex(r => r.isNew));
    if (index === 0 && !reports[0].isNew) index = Math.floor((total - 1) / 2); // otherwise open on the middle report
    let dragging = false, startX = 0, startOffset = 0;

    // Centers the active slide in the viewport, so its neighbors peek in on either side.
    function offsetFor(i) {
      const slideWidth = slides[0].getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      const viewportWidth = carousel.getBoundingClientRect().width;
      return (viewportWidth - slideWidth) / 2 - i * (slideWidth + gap);
    }
    // Nav arrows are centered on the image's actual rendered height (it scales
    // with card width via aspect-ratio, so this is re-measured on every resize).
    function positionNav() {
      const img = slides[0].querySelector('.fr-image');
      if (img) carousel.style.setProperty('--fr-image-h', img.getBoundingClientRect().height + 'px');
    }
    function update(animate) {
      track.style.transition = animate === false ? 'none' : '';
      track.style.transform = `translateX(${offsetFor(index)}px)`;
      slides.forEach((s, i) => s.classList.toggle('active', i === index));
      dots.forEach((d, i) => d.classList.toggle('active', i === index));
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index === total - 1;
      positionNav();
    }
    function goTo(i) { index = Math.max(0, Math.min(total - 1, i)); update(); }

    prevBtn.addEventListener('click', () => goTo(index - 1));
    nextBtn.addEventListener('click', () => goTo(index + 1));
    dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));
    slides.forEach((s, i) => s.addEventListener('click', () => { if (i !== index) goTo(i); }));
    window.addEventListener('resize', () => update(false));

    track.addEventListener('pointerdown', (e) => {
      dragging = true;
      startX = e.clientX;
      startOffset = offsetFor(index);
      track.style.transition = 'none';
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      track.style.transform = `translateX(${startOffset + dx}px)`;
    });
    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      const dx = e.clientX - startX;
      const slideWidth = slides[0].getBoundingClientRect().width;
      if (Math.abs(dx) > slideWidth * 0.18) goTo(index + (dx < 0 ? 1 : -1));
      else update();
    }
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);

    update(false);
  })();

  // ---- 3. Subtle 3D tilt on card hover (elements with .tilt-card), desktop only ----
  (function () {
    const cards = document.querySelectorAll('.tilt-card');
    if (!cards.length || reduceMotion) return;
    if (window.matchMedia('(hover: none)').matches) return;
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  })();

  // ---- 4. Gentle parallax on background images (elements with .parallax-bg) ----
  // The shift is capped by how much extra photo exists beyond the box ("slack"),
  // so the image edge is never exposed, e.g. on tall, narrow phone layouts.
  (function () {
    const layers = [...document.querySelectorAll('.parallax-bg')];
    if (!layers.length || reduceMotion) return;
    const sizes = new Map();
    let ticking = false;
    function slack(el) {
      const s = sizes.get(el);
      if (!s) return 0;
      const W = el.clientWidth, H = el.clientHeight;
      const scale = Math.max(W / s.w, H / s.h);
      return Math.max(0, s.h * scale - H);
    }
    function updateParallax() {
      layers.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const max = slack(el) / 2;
        const raw = (rect.top - window.innerHeight / 2) * 0.08;
        const offset = Math.max(-max, Math.min(max, raw));
        el.style.backgroundPosition = `center calc(50% + ${offset.toFixed(1)}px)`;
      });
      ticking = false;
    }
    const request = () => { if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; } };
    layers.forEach(el => {
      const m = getComputedStyle(el).backgroundImage.match(/url\(["']?(.*?)["']?\)/);
      if (!m) return;
      const img = new Image();
      img.onload = () => { sizes.set(el, { w: img.naturalWidth, h: img.naturalHeight }); request(); };
      img.src = m[1];
    });
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
  })();
}));
