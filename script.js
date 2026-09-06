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
});
