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

  /* ---- Use-as-App modal ---- */
  const appBtns = document.querySelectorAll('.use-as-app-trigger');
  const overlay = document.getElementById('appModalOverlay');
  const closeBtn = document.getElementById('appModalClose');
  const tabs = document.querySelectorAll('.modal-tab');
  const panels = document.querySelectorAll('.modal-steps');

  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const androidInstallBtn = document.getElementById('androidInstallBtn');
    if (androidInstallBtn) androidInstallBtn.style.display = 'inline-block';
  });

  if (appBtns.length && overlay) {
    appBtns.forEach(btn => btn.addEventListener('click', () => {
      overlay.classList.add('open');
      // Default to the tab matching the user's platform
      const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
      const targetTab = isIOS ? 'ios' : 'android';
      tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === targetTab));
      panels.forEach(p => p.classList.toggle('active', p.dataset.panel === targetTab));
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
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.querySelector(`.modal-steps[data-panel="${tab.dataset.tab}"]`).classList.add('active');
    });
  });
  const androidInstallBtn = document.getElementById('androidInstallBtn');
  if (androidInstallBtn) {
    androidInstallBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      androidInstallBtn.style.display = 'none';
    });
  }

  /* ---- Add to Calendar (event delegation) ---- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cal]');
    if (!btn || typeof UVIG_UPCOMING === 'undefined') return;
    const ev = UVIG_UPCOMING.find(x => x.id === btn.dataset.eventId);
    if (!ev) return;
    if (btn.dataset.cal === 'google') openGoogleCalendar(ev);
    if (btn.dataset.cal === 'ics') downloadICS(ev);
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
