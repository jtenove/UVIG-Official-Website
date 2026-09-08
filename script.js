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

  /* ---- UVIG App modal (Coming Soon preview) ---- */
  const appBtns = document.querySelectorAll('.use-as-app-trigger');
  const overlay = document.getElementById('appModalOverlay');
  const closeBtn = document.getElementById('appModalClose');

  if (appBtns.length && overlay) {
    appBtns.forEach(btn => btn.addEventListener('click', () => {
      overlay.classList.add('open');
      // Close the mobile nav if it was open
      if (nav) nav.classList.remove('open');
      if (menuBtn) { menuBtn.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
    }));
  }
  if (closeBtn && overlay) {
    closeBtn.addEventListener('click', () => overlay.classList.remove('open'));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
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
    desc += ' (Time TBD — check the website closer to the date for the confirmed time.)';
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
