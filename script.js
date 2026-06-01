/* =====================================================
   OGA DAVE CONCEPTS — script.js v3
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

  function openMenu() {
    nav.classList.add('active');
    backdrop.classList.add('active');
    toggle.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    nav.classList.remove('active');
    backdrop.classList.remove('active');
    toggle.classList.remove('open');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', e => {
    e.stopPropagation();
    nav.classList.contains('active') ? closeMenu() : openMenu();
  });

  backdrop.addEventListener('click', closeMenu);
  nav.querySelectorAll('.nav-item').forEach(a => a.addEventListener('click', closeMenu));

  document.addEventListener('click', e => {
    if (nav.classList.contains('active') && !nav.contains(e.target) && !toggle.contains(e.target)) {
      closeMenu();
    }
  });

  let startX = 0;
  nav.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  nav.addEventListener('touchmove', e => {
    if (e.touches[0].clientX - startX > 80) closeMenu();
  }, { passive: true });
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
          card.style.display = '';
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

/* =====================================================
   FEATURE ADDITIONS
   Ticker · Calculator · Newsletter · Property Alert
   Resource Gate · PWA Install Banner
   ===================================================== */

const WA_NUMBER                   = '2348160693873';
const EMAILJS_SERVICE             = 'service_19uz7ao';
const EMAILJS_TEMPLATE_NEWSLETTER = 'template_mmslxri';
const EMAILJS_TEMPLATE_ALERT      = 'template_p78phbg';
const EMAILJS_PUBLIC_KEY          = 'DnTS1uoJNw9-FlVlr';
const CALENDLY_URL                = 'https://calendly.com/ogadaveconcepts/30min';

/* ─────────────────────────────
   1. CRYPTO TICKER + RATES
  Request BOTH usd AND ngn from CoinGecko directly.
   This gives us the real live Naira price — no manual
   conversion, no stale static rate ever again.
───────────────────────────── */
const COINS = [
  { id: 'bitcoin',     symbol: 'BTC',  name: 'Bitcoin',  icon: '₿' },
  { id: 'tether',      symbol: 'USDT', name: 'Tether',   icon: '₮' },
  { id: 'ethereum',    symbol: 'ETH',  name: 'Ethereum', icon: 'Ξ' },
  { id: 'binancecoin', symbol: 'BNB',  name: 'BNB',      icon: 'B' },
  { id: 'solana',      symbol: 'SOL',  name: 'Solana',   icon: '◎' },
  { id: 'ripple',      symbol: 'XRP',  name: 'XRP',      icon: '✕' },
  { id: 'usd-coin',    symbol: 'USDC', name: 'USDC',     icon: '◎' },
  { id: 'cardano',     symbol: 'ADA',  name: 'Cardano',  icon: '₳' },
];

/*
 * liveRates shape: { coinId: { usd: number, ngn: number, change: number } }
 * ngn comes directly from CoinGecko — always accurate, updates every 60s.
 */
let liveRates = {};

async function fetchLiveRates() {
  const ids = COINS.map(c => c.id).join(',');
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price` +
      `?ids=${ids}&vs_currencies=usd,ngn&include_24hr_change=true`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();

    COINS.forEach(c => {
      const d = data[c.id];
      if (!d) return;
      liveRates[c.id] = {
        usd:    d.usd    ?? 0,
        ngn:    d.ngn    ?? 0,           // ← live Naira from CoinGecko
        change: d.usd_24h_change ?? 0    // 24h % change is usd-based (same globally)
      };
    });

    renderTicker();
    renderRateCards();
    updateCalculatorRate();

  } catch (err) {
    console.warn('[Rates] Fetch failed:', err.message);
    renderTickerError();
  }
}

/* ── Formatters ── */
function fmtUSD(n) {
  if (!n && n !== 0) return '—';
  if (n >= 1000) return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (n >= 1)    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  return '$' + n.toFixed(6);
}

function fmtNGN(ngn) {
  /* ngn is the RAW Naira value from CoinGecko — just format it */
  if (!ngn && ngn !== 0) return '—';
  return '₦' + ngn.toLocaleString('en-NG', { maximumFractionDigits: 0 });
}

function changeClass(c)  { return c >= 0 ? 'up' : 'down'; }
function changeLabel(c)  { return (c >= 0 ? '+' : '') + c.toFixed(2) + '%'; }

/* ── Ticker bar ── */
function renderTicker() {
  const bars = document.querySelectorAll('.ticker-track');
  if (!bars.length) return;

  const items = COINS.map(coin => {
    const r = liveRates[coin.id];
    if (!r) return '';
    const wa = `https://wa.me/${WA_NUMBER}?text=Hello%20OGA%20DAVE,%20I%20want%20to%20buy%20or%20sell%20${coin.symbol}`;
    return `
      <div class="ticker-item">
        <div class="ticker-coin-info">
          <span class="ticker-coin-symbol">${coin.symbol}</span>
          <span class="ticker-coin-name">${coin.name}</span>
        </div>
        <div class="ticker-prices">
          <span class="ticker-usd">${fmtUSD(r.usd)}</span>
          <span class="ticker-ngn">${fmtNGN(r.ngn)}</span>
        </div>
        <span class="ticker-change ${changeClass(r.change)}">${changeLabel(r.change)}</span>
        <a href="${wa}" target="_blank" class="ticker-cta"><i class="fab fa-whatsapp"></i> Trade</a>
      </div>`;
  }).join('');

  /* Duplicate items for seamless infinite scroll */
  bars.forEach(track => { track.innerHTML = items + items; });

  document.querySelectorAll('.rates-last-updated').forEach(el => {
    el.textContent = 'Last updated: ' + new Date().toLocaleTimeString('en-NG');
  });
}

function renderTickerError() {
  document.querySelectorAll('.ticker-loading').forEach(el => {
    el.innerHTML = '<i class="fas fa-wifi"></i> Rates unavailable — refresh to retry';
  });
}

/* ── Full Rate Cards (cryptopreneur page) ── */
function renderRateCards() {
  const grid = document.getElementById('rates-grid');
  if (!grid) return;

  grid.innerHTML = '';

  COINS.forEach(coin => {
    const r = liveRates[coin.id];
    if (!r) return;

    const buyWA  = `https://wa.me/${WA_NUMBER}?text=Hello%20OGA%20DAVE,%20I%20want%20to%20BUY%20${coin.symbol}`;
    const sellWA = `https://wa.me/${WA_NUMBER}?text=Hello%20OGA%20DAVE,%20I%20want%20to%20SELL%20${coin.symbol}`;

    const card = document.createElement('div');
    card.className = 'rate-card';
    card.innerHTML = `
      <div class="rate-card-top">
        <div class="rate-coin-identity">
          <div class="rate-coin-icon">${coin.icon}</div>
          <div>
            <div class="rate-coin-name">${coin.name}</div>
            <div class="rate-coin-sym">${coin.symbol}</div>
          </div>
        </div>
        <span class="rate-change-badge ${changeClass(r.change)}">${changeLabel(r.change)}</span>
      </div>
      <div class="rate-prices">
        <div class="rate-usd">${fmtUSD(r.usd)}</div>
        <div class="rate-ngn">${fmtNGN(r.ngn)} / ${coin.symbol}</div>
      </div>
      <div class="rate-card-cta">
        <a href="${buyWA}"  target="_blank" class="rate-btn rate-btn-buy"><i class="fas fa-arrow-down"></i> Buy</a>
        <a href="${sellWA}" target="_blank" class="rate-btn rate-btn-sell"><i class="fas fa-arrow-up"></i> Sell</a>
      </div>`;
    grid.appendChild(card);
  });

  document.querySelectorAll('.rates-last-updated').forEach(el => {
    el.textContent = 'Prices from CoinGecko · Updated: ' + new Date().toLocaleTimeString('en-NG');
  });
}

/* ── Auto-refresh every 60 seconds ── */
(function initRates() {
  if (
    document.querySelector('.ticker-track') ||
    document.getElementById('rates-grid')   ||
    document.getElementById('calculatorWrap')
  ) {
    fetchLiveRates();
    setInterval(fetchLiveRates, 60000);
  }
})();

/* ─────────────────────────────
   2. CRYPTO RATE CALCULATOR
   FIX: Use r.ngn directly from liveRates — no conversion math.
───────────────────────────── */
(function initCalculator() {
  const wrap = document.getElementById('calculatorWrap');
  if (!wrap) return;

  let mode         = 'buy'; // 'buy' = NGN→Crypto | 'sell' = Crypto→NGN
  let selectedCoin = 'bitcoin';

  const ngnInput   = document.getElementById('calcNGN');
  const coinInput  = document.getElementById('calcCoin');
  const coinSelect = document.getElementById('calcCoinSelect');
  const resultVal  = document.getElementById('calcResultValue');
  const resultSub  = document.getElementById('calcResultSub');
  const rateNote   = document.getElementById('calcRateNote');
  const buyBtn     = document.getElementById('calcModeBuy');
  const sellBtn    = document.getElementById('calcModeSell');
  const swapBtn    = document.getElementById('calcSwapBtn');
  const ctaBtn     = document.getElementById('calcCTABtn');

  /* Get the live NGN price per coin directly — no multiplication needed */
  function getLiveNGN() {
    return liveRates[selectedCoin]?.ngn ?? null;
  }

  function calculate() {
    const ngnPerCoin = getLiveNGN();

    if (!ngnPerCoin) {
      if (resultVal) resultVal.textContent = '—';
      if (resultSub) resultSub.textContent = 'Fetching live rate...';
      return;
    }

    const coin = COINS.find(c => c.id === selectedCoin);

    if (mode === 'buy') {
      const ngn = parseFloat(ngnInput?.value);
      if (!ngn || ngn <= 0) {
        if (resultVal) resultVal.textContent = '—';
        if (resultSub) resultSub.textContent = '';
        return;
      }
      const cryptoAmt = ngn / ngnPerCoin;
      if (resultVal) resultVal.textContent = cryptoAmt < 0.001
        ? cryptoAmt.toFixed(8) + ' ' + coin.symbol
        : cryptoAmt.toFixed(6) + ' ' + coin.symbol;
      if (resultSub) resultSub.textContent = `≈ ${fmtUSD(liveRates[selectedCoin].usd * cryptoAmt)} USD`;
      if (rateNote)  rateNote.innerHTML    = `1 ${coin.symbol} = <span>${fmtNGN(ngnPerCoin)}</span> (live rate)`;
    } else {
      const coinAmt = parseFloat(coinInput?.value);
      if (!coinAmt || coinAmt <= 0) {
        if (resultVal) resultVal.textContent = '—';
        if (resultSub) resultSub.textContent = '';
        return;
      }
      const ngnAmt = coinAmt * ngnPerCoin;
      if (resultVal) resultVal.textContent = '₦' + ngnAmt.toLocaleString('en-NG', { maximumFractionDigits: 0 });
      if (resultSub) resultSub.textContent = `≈ ${fmtUSD(liveRates[selectedCoin].usd * coinAmt)} USD`;
      if (rateNote)  rateNote.innerHTML    = `1 ${coin.symbol} = <span>${fmtNGN(ngnPerCoin)}</span> (live rate)`;
    }
  }

  function syncCoinSelectors(val) {
    const sellSelect = document.getElementById('calcCoinSelectSell');
    if (coinSelect && coinSelect.value !== val) coinSelect.value = val;
    if (sellSelect  && sellSelect.value  !== val) sellSelect.value  = val;
  }

  function setMode(m) {
    mode = m;
    const coin = COINS.find(c => c.id === selectedCoin);

    if (buyBtn)  buyBtn.classList.toggle('active',  m === 'buy');
    if (sellBtn) sellBtn.classList.toggle('active', m === 'sell');

    const buyRow  = document.getElementById('calcBuyRow');
    const sellRow = document.getElementById('calcSellRow');
    if (buyRow)  buyRow.style.display  = m === 'buy'  ? '' : 'none';
    if (sellRow) sellRow.style.display = m === 'sell' ? '' : 'none';

    if (ctaBtn) ctaBtn.innerHTML =
      m === 'buy'
        ? `<i class="fab fa-whatsapp"></i> Buy ${coin?.symbol || 'Crypto'} on WhatsApp`
        : `<i class="fab fa-whatsapp"></i> Sell ${coin?.symbol || 'Crypto'} on WhatsApp`;

    if (swapBtn) swapBtn.innerHTML =
      `<i class="fas fa-arrows-rotate"></i> Switch to ${m === 'buy' ? 'Sell' : 'Buy'} Mode`;

    calculate();
  }

  buyBtn?.addEventListener('click',  () => setMode('buy'));
  sellBtn?.addEventListener('click', () => setMode('sell'));
  swapBtn?.addEventListener('click', () => setMode(mode === 'buy' ? 'sell' : 'buy'));
  ngnInput?.addEventListener('input',  calculate);
  coinInput?.addEventListener('input', calculate);

  coinSelect?.addEventListener('change', () => {
    selectedCoin = coinSelect.value;
    syncCoinSelectors(selectedCoin);
    setMode(mode);
  });

  document.getElementById('calcCoinSelectSell')?.addEventListener('change', function () {
    selectedCoin = this.value;
    syncCoinSelectors(selectedCoin);
    setMode(mode);
  });

  ctaBtn?.addEventListener('click', () => {
    const coin = COINS.find(c => c.id === selectedCoin);
    const amt  = mode === 'buy' ? ngnInput?.value : coinInput?.value;
    const msg  = mode === 'buy'
      ? `Hello OGA DAVE, I want to BUY ${coin.symbol}. I have ₦${amt} to spend.`
      : `Hello OGA DAVE, I want to SELL ${amt} ${coin.symbol}.`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  });

  /* Called by fetchLiveRates() after rates arrive */
  window.updateCalculatorRate = calculate;
})();

/* ─────────────────────────────
   3. EMAIL NEWSLETTER (EmailJS)
───────────────────────────── */
(function initNewsletter() {
  const forms = document.querySelectorAll('.newsletter-form');
  if (!forms.length) return;

  /* Load EmailJS SDK once */
  const script  = document.createElement('script');
  script.src    = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
  script.onload = () => { if (window.emailjs) emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY }); };
  document.head.appendChild(script);

  forms.forEach(form => {
    const input = form.querySelector('.newsletter-input');
    const btn   = form.querySelector('.newsletter-submit');
    const msgEl = form.closest('.newsletter-wrap')?.querySelector('.newsletter-msg');

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const email = input?.value?.trim();

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showMsg(msgEl, 'Please enter a valid email address.', 'error');
        return;
      }

      btn.disabled    = true;
      btn.textContent = 'Subscribing...';

      try {
        /* 1. Save to Firestore */
        if (window._db) {
          const { collection: col, addDoc, serverTimestamp } =
            await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
          await addDoc(col(window._db, 'newsletter'), { email, date: serverTimestamp() });
        }

        /* 2. Send welcome email via EmailJS — no guard needed, key is set */
        await emailjs.send(
          EMAILJS_SERVICE,
          EMAILJS_TEMPLATE_NEWSLETTER,
          { to_email: email }
        );

        showMsg(msgEl, '🎉 You\'re subscribed! Check your inbox for a welcome message.', 'success');
        input.value = '';

      } catch (err) {
        console.error('[Newsletter]', err);
        showMsg(msgEl, 'Something went wrong. Please try again.', 'error');
      }

      btn.disabled    = false;
      btn.textContent = 'Subscribe Free';
    });
  });
})();

/* ─────────────────────────────
   4. PROPERTY ALERT FORM
───────────────────────────── */
(function initPropertyAlert() {
  const form = document.getElementById('propertyAlertForm');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('.btn-submit');
    const msg = document.getElementById('alertMsg');
    setLoading(btn, true);

    const data = {
      name:      form.querySelector('#alertName')?.value?.trim(),
      email:     form.querySelector('#alertEmail')?.value?.trim(),
      phone:     form.querySelector('#alertPhone')?.value?.trim(),
      budget:    form.querySelector('#alertBudget')?.value,
      type:      form.querySelector('#alertType')?.value,
      plotSize:  form.querySelector('#alertPlotSize')?.value,
      purpose:   form.querySelector('#alertPurpose')?.value,
      notes:     form.querySelector('#alertNotes')?.value?.trim(),
      locations: [...form.querySelectorAll('.location-check:checked')]
                   .map(c => c.value).join(', ') || 'Not specified',
    };

    if (!data.name || !data.email || !data.phone) {
      showMsg(msg, 'Please fill in your name, email and phone number.', 'error');
      setLoading(btn, false);
      return;
    }

    try {
      /* 1. Save to Firestore */
      if (window._db) {
        const { collection: col, addDoc, serverTimestamp } =
          await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
        await addDoc(col(window._db, 'propertyAlerts'), { ...data, date: serverTimestamp() });
      }

      /* 2. Notify OGA DAVE via EmailJS — no guard needed, key is set */
      await emailjs.send(
        EMAILJS_SERVICE,
        EMAILJS_TEMPLATE_ALERT,
        {
          client_name:  data.name,
          client_email: data.email,
          client_phone: data.phone,
          budget:       data.budget   || 'Not specified',
          locations:    data.locations,
          type:         data.type     || 'Not specified',
          notes:        data.notes    || 'None',
        }
      );

      showMsg(msg, '✅ Alert registered! We\'ll notify you when a matching property is available.', 'success');
      form.reset();

    } catch (err) {
      console.error('[PropertyAlert]', err);
      showMsg(msg, 'Something went wrong. Please try WhatsApp instead.', 'error');
    }

    setLoading(btn, false);
  });
})();

/* ─────────────────────────────
   5. RESOURCE GATE MODAL
───────────────────────────── */
(function initResourceGate() {
  const modal = document.getElementById('gateModal');
  if (!modal) return;

  let pendingUrl   = '';
  let pendingTitle = '';

  window.openGate = (url, title) => {
    pendingUrl   = url;
    pendingTitle = title;
    const titleEl = document.getElementById('gateResourceTitle');
    if (titleEl) titleEl.textContent = title;
    modal.classList.add('show');
    document.getElementById('gateName')?.focus();
  };

  window.closeGate = () => {
    modal.classList.remove('show');
    pendingUrl = pendingTitle = '';
  };

  modal.addEventListener('click', e => { if (e.target === modal) window.closeGate(); });

  const form = document.getElementById('gateForm');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn   = form.querySelector('.gate-submit');
    const msg   = document.getElementById('gateMsg');
    const name  = document.getElementById('gateName')?.value?.trim();
    const email = document.getElementById('gateEmail')?.value?.trim();

    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showMsg(msg, 'Please enter your name and a valid email.', 'error');
      return;
    }

    btn.disabled    = true;
    btn.textContent = 'Getting access...';

    try {
      if (window._db) {
        const { collection: col, addDoc, serverTimestamp } =
          await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
        await addDoc(col(window._db, 'resourceLeads'), {
          name, email, resource: pendingTitle, date: serverTimestamp()
        });
      }

      showMsg(msg, '🎉 Access granted! Your download is starting...', 'success');
      setTimeout(() => {
        window.open(pendingUrl, '_blank');
        window.closeGate();
        form.reset();
        if (msg) msg.textContent = '';
      }, 1500);

    } catch (err) {
      console.error('[Gate]', err);
      /* Still allow download even if Firestore save fails */
      window.open(pendingUrl, '_blank');
      window.closeGate();
    }

    btn.disabled    = false;
    btn.textContent = 'Get Free Access';
  });
})();

/* ─────────────────────────────
   6. PWA INSTALL BANNER
───────────────────────────── */
(function initPWA() {
  let deferredPrompt = null;
  const banner = document.getElementById('pwaBanner');
  if (!banner) return;

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    if (!sessionStorage.getItem('pwa-dismissed')) {
      setTimeout(() => banner.classList.add('show'), 4000);
    }
  });

  document.getElementById('pwaInstallBtn')?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') banner.classList.remove('show');
    deferredPrompt = null;
  });

  document.getElementById('pwaDismissBtn')?.addEventListener('click', () => {
    banner.classList.remove('show');
    sessionStorage.setItem('pwa-dismissed', '1');
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .catch(err => console.warn('[SW] Registration failed:', err));
    });
  }
})();

/* ─────────────────────────────
   UTILITIES
───────────────────────────── */
function showMsg(el, text, type) {
  if (!el) return;
  el.textContent = text;
  /* Assign the right class regardless of which component owns the element */
  const base = el.classList.contains('gate-msg')  ? 'gate-msg'  :
               el.classList.contains('alert-msg') ? 'alert-msg' :
               'newsletter-msg';
  el.className = base + ' ' + type;
  if (type === 'success') setTimeout(() => { if (el) { el.textContent = ''; el.className = base; } }, 6000);
}

function setLoading(btn, loading) {
  if (!btn) return;
  btn.disabled = loading;
  btn.classList.toggle('loading', loading);
}