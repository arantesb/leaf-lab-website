/* =========================================================
   LEAF LAB — Shared JavaScript
   ========================================================= */

// ── Apply color theme from content/settings.json ────────────
(function applySettings() {
  const CSS_SECTION_MAP = {
    'nav_bg':          v => `.nav{background:${v}!important}`,
    'hero_bg':         v => `.hero{background:${v}!important}`,
    'pageHero_bg':     v => `.page-hero{background:${v}!important}`,
    'sectionAlt_bg':   v => `.section--alt{background:${v}!important}`,
    'sectionDark_bg':  v => `.section--dark{background:${v}!important}`,
    'footer_bg':       v => `.footer{background:${v}!important}`,
    'btnPrimary_bg':   v => `.btn-primary{background:${v}!important}`,
    'btnPrimary_text': v => `.btn-primary{color:${v}!important}`
  };

  fetch('content/settings.json')
    .then(r => r.json())
    .then(s => {
      // Global CSS variables
      if (s.colors) {
        const vars = Object.entries(s.colors).map(([k, v]) => `${k}:${v}`).join(';');
        const el = document.createElement('style');
        el.textContent = `:root{${vars}}`;
        document.head.appendChild(el);
      }
      // Per-section overrides
      if (s.sectionColors) {
        const css = Object.entries(s.sectionColors)
          .filter(([k, v]) => CSS_SECTION_MAP[k] && v)
          .map(([k, v]) => CSS_SECTION_MAP[k](v))
          .join('');
        if (css) {
          const el2 = document.createElement('style');
          el2.textContent = css;
          document.head.appendChild(el2);
        }
      }
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
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('button[type=submit]');
      btn.textContent = 'Message Sent ✓';
      btn.style.background = 'var(--canopy)';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = 'Send Message';
        btn.style.background = '';
        btn.disabled = false;
        form.reset();
      }, 3000);
    });
  }

});
