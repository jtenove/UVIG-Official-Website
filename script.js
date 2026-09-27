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

/* ---- Calendar helpers ----
   Events with a "TBD" time default to 12:00 PM / 2-hour duration so a
   calendar entry can still be created — the description flags that the
   time is provisional. Update once real times are confirmed. */
function parseEventDateTime(ev) {
  let hours = 12, minutes = 0;
  const m = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(ev.time || '');
  if (m) {
    hours = parseInt(m[1], 10);
    minutes = parseInt(m[2], 10);
    if (/PM/i.test(m[3]) && hours < 12) hours += 12;
    if (/AM/i.test(m[3]) && hours === 12) hours = 0;
  }
  const start = new Date(ev.isoDate + 'T00:00:00');
  start.setHours(hours, minutes, 0, 0);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
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

function downloadICS(ev) {
  const { start, end } = parseEventDateTime(ev);
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//UVIG//Events//EN', 'BEGIN:VEVENT',
    `UID:${ev.id}@uvicinvestmentgroup.com`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${ev.title}`,
    `DESCRIPTION:${eventDescription(ev)}`,
    `LOCATION:${ev.venue || ''}`,
    'END:VEVENT', 'END:VCALENDAR'
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${ev.id}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ============================================================
   SITE-WIDE MOTION SYSTEM
   Runs once the page (including any inline scripts that render
   cards from data.js) has finished loading, so dynamically drawn
   cards get the same effects. Each piece is a no-op on pages
   without matching elements.
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
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

    track.innerHTML = reports.map(r => `
      <div class="fr-slide">
        <div class="featured-research-card">
          <div class="fr-image" style="background-image:url('${r.cover}');"></div>
          <div class="fr-body">
            <span class="sector-tag">${r.sector}</span>
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
    const total = reports.length;
    let index = 0;
    let dragging = false, startX = 0, startTranslate = 0, viewportWidth = 0;

    function update(animate) {
      viewportWidth = carousel.getBoundingClientRect().width;
      track.style.transition = animate === false ? 'none' : '';
      track.style.transform = `translateX(${-index * viewportWidth}px)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === index));
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index === total - 1;
    }
    function goTo(i) { index = Math.max(0, Math.min(total - 1, i)); update(); }

    prevBtn.addEventListener('click', () => goTo(index - 1));
    nextBtn.addEventListener('click', () => goTo(index + 1));
    dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));
    window.addEventListener('resize', () => update(false));

    track.addEventListener('pointerdown', (e) => {
      dragging = true;
      startX = e.clientX;
      viewportWidth = carousel.getBoundingClientRect().width;
      startTranslate = -index * viewportWidth;
      track.style.transition = 'none';
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      track.style.transform = `translateX(${startTranslate + dx}px)`;
    });
    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > viewportWidth * 0.18) goTo(index + (dx < 0 ? 1 : -1));
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
});
