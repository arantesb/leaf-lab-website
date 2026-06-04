/* =========================================================
   LEAF LAB — Shared JavaScript
   ========================================================= */

// ── Apply color theme from content/settings.json ────────────
(function applySettings() {
  fetch('content/settings.json')
    .then(r => r.json())
    .then(s => {
      if (!s.colors) return;
      const vars = Object.entries(s.colors).map(([k, v]) => `${k}:${v}`).join(';');
      const el = document.createElement('style');
      el.textContent = `:root{${vars}}`;
      document.head.appendChild(el);
    })
    .catch(() => {});
})();

document.addEventListener('DOMContentLoaded', () => {

  // ── Active nav link ──────────────────────────────────────
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // ── Hamburger menu ───────────────────────────────────────
  const ham = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav__links');
  if (ham && navLinks) {
    ham.addEventListener('click', () => navLinks.classList.toggle('open'));
    document.addEventListener('click', e => {
      if (!ham.contains(e.target) && !navLinks.contains(e.target))
        navLinks.classList.remove('open');
    });
  }

  // ── Scroll-reveal (fade-up) ──────────────────────────────
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: .12 });
  document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));

  // ── Publication filter ───────────────────────────────────
  const filterBtns = document.querySelectorAll('.filter-btn');
  const pubItems   = document.querySelectorAll('.pub-item');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const type = btn.dataset.filter;
      pubItems.forEach(item => {
        item.style.display = (type === 'all' || item.dataset.type === type) ? '' : 'none';
      });
    });
  });

  // ── Contact form (demo) ──────────────────────────────────
  const form = document.getElementById('contactForm');
  if (form) {
    form.add