/* =====================================================
   OGA DAVE CONCEPTS — script.js v2
   Works on: index.html + all sub-pages
   ===================================================== */

'use strict';

/* ─────────────────────────────
   PRELOADER (index only)
───────────────────────────── */
const preloader = document.getElementById('preloader');
if (preloader) {
  window.addEventListener('load', () => {
    setTimeout(() => preloader.classList.add('hidden'), 1800);
  });
}

/* ─────────────────────────────
   CUSTOM CURSOR (desktop only)
───────────────────────────── */
(function () {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring || window.matchMedia('(max-width: 768px)').matches) return;

  let dotX = 0, dotY = 0, ringX = 0, ringY = 0;

  document.addEventListener('mousemove', e => { dotX = e.clientX; dotY = e.clientY; });

  (function loop() {
    dot.style.left  = dotX + 'px';
    dot.style.top   = dotY + 'px';
    ringX += (dotX - ringX) * 0.12;
    ringY += (dotY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(loop);
  })();

  document.querySelectorAll('a, button, .portfolio-card, .service-card, .feature-card, .property-card, .testimonial-card, input, textarea, select')
    .forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
})();

/* ─────────────────────────────
   NAVBAR — scroll + mobile menu
───────────────────────────── */
(function () {
  const navbar   = document.getElementById('navbar');
  const toggle   = document.getElementById('menuToggle');
  const nav      = document.getElementById('navLinks');
  const backdrop = document.getElementById('navBackdrop');
  if (!navbar) return;

  /* Scroll: shrink + active link */
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);

    /* back-to-top visibility */
    const btn = document.getElementById('backToTop');
    if (btn) btn.classList.toggle('visible', window.scrollY > 400);

    /* active nav link (index page only) */
    const sections = document.querySelectorAll('section[id]');
    if (!sections.length) return;
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 220) current = s.id;
    });
    document.querySelectorAll('.nav-item').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }, { passive: true });

  /* Mobile menu open / close */
  if (!toggle || !nav || !backdrop) return;

  function openMenu()  { nav.classList.add('active'); backdrop.classList.add('active'); toggle.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function closeMenu() { nav.classList.remove('active'); backdrop.classList.remove('active'); toggle.classList.remove('open'); document.body.style.overflow = ''; }

  toggle.addEventListener('click', () => nav.classList.contains('active') ? closeMenu() : openMenu());
  backdrop.addEventListener('click', closeMenu);
  nav.querySelectorAll('.nav-item').forEach(a => a.addEventListener('click', closeMenu));

  /* Swipe right to close */
  let startX = 0;
  nav.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  nav.addEventListener('touchmove',  e => { if (e.touches[0].clientX - startX > 80) closeMenu(); }, { passive: true });
})();

/* ─────────────────────────────
   BACK TO TOP
───────────────────────────── */
(function () {
  const btn = document.getElementById('backToTop');
  if (btn) btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ─────────────────────────────
   SCROLL REVEAL
───────────────────────────── */
(function () {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const delay = parseInt(entry.target.dataset.delay || 0);
      setTimeout(() => entry.target.classList.add('revealed'), delay);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('[data-reveal], [data-reveal="left"], [data-reveal="right"], [data-reveal-delay]')
    .forEach(el => observer.observe(el));
})();

/* ─────────────────────────────
   COUNTER ANIMATION (stats bar)
───────────────────────────── */
(function () {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target);
      const start  = performance.now();
      const dur    = 1800;
      (function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      })(start);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
})();

/* ─────────────────────────────
   PORTFOLIO FILTER
───────────────────────────── */
(function () {
  const btns  = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.portfolio-card');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        if (show) {
          card.style.display   = '';
          /* small tick so display:'' takes effect before opacity */
          requestAnimationFrame(() => { card.style.opacity = '1'; card.style.transform = ''; });
        } else {
          card.style.opacity   = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => { if (card.style.opacity === '0') card.style.display = 'none'; }, 300);
        }
      });
    });
  });
})();

/* ─────────────────────────────
   CONTACT FORM (Formspree)
───────────────────────────── */
(function () {
  const form   = document.getElementById('contactForm');
  const status = document.getElementById('form-status');
  if (!form || !status) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const btnText    = form.querySelector('.btn-text');
    const btnLoading = form.querySelector('.btn-loading');
    const submitBtn  = form.querySelector('.form-submit');

    if (btnText)    btnText.style.display    = 'none';
    if (btnLoading) btnLoading.style.display = 'inline-flex';
    if (submitBtn)  submitBtn.disabled       = true;
    status.textContent = '';
    status.className   = 'form-status';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
        status.textContent = '✓ Message sent! We\'ll get back to you within 24 hours.';
        status.className   = 'form-status success';
        form.reset();
        setTimeout(() => { status.textContent = ''; status.className = 'form-status'; }, 6000);
      } else {
        throw new Error('Server error');
      }
    } catch {
      status.textContent = '✕ Something went wrong. Please try again or chat on WhatsApp.';
      status.className   = 'form-status error';
    } finally {
      if (btnText)    btnText.style.display    = '';
      if (btnLoading) btnLoading.style.display = 'none';
      if (submitBtn)  submitBtn.disabled       = false;
    }
  });
})();

/* ─────────────────────────────
   FOOTER YEAR
───────────────────────────── */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();