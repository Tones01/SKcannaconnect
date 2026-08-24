/* ==========================================================================
   SK Cannabis Connect — shared behaviour
   Age/industry gate · header surface handling · newsletter form · testimonials
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. WHERE THE EMAIL SIGNUPS GO  ←  the one thing you need to configure
   --------------------------------------------------------------------------
   Set NEWSLETTER.mode and its matching field. Nothing else needs to change.

   'sheet'    — append each address as a row in a Google Sheet, via an Apps
                Script web app bound to that sheet. Free, and the list stays
                in your Drive. Set `sheetUrl` (the /exec URL Apps Script
                gives you on deploy) and `sheetToken` to match the SECRET in
                the script. Setup steps: tools/google-sheet-endpoint.gs

   'post'     — POST the address to a form or list provider that accepts JSON
                and sends permissive CORS headers:
                  Formspree   https://formspree.io/f/XXXXXXX
                  Buttondown  https://buttondown.com/api/emails/embed-subscribe/YOURNAME
                  Netlify / Cloudflare Worker / your own /api/subscribe

   'redirect' — hand the visitor off to a hosted form you already have
                (Typeform, Google Form, Mailchimp hosted signup) with the
                address they typed carried across in a query parameter.
                Set `redirectUrl` and `emailParam`.

   'mailto'   — no service. Opens the visitor's mail app with the address
                pre-filled and you add them to your list by hand. Zero setup,
                but it loses everyone who has no mail client configured.
                A stopgap, not the real answer.
   -------------------------------------------------------------------------- */

var NEWSLETTER = {
  mode: 'sheet',

  // mode: 'sheet' — paste the Apps Script /exec URL into sheetUrl to go live.
  // Until it is filled in, the form quietly falls back to mailto below.
  sheetUrl: '',
  sheetToken: 'm0a2bf3axcig9m433jixf0no374ze5i2',

  // mode: 'post'
  endpoint: '',

  // mode: 'redirect'
  redirectUrl: '',
  emailParam: 'email',

  // mode: 'mailto', and the address shown if a send fails
  mailto: 'etonnies@openfields.ca',
  mailtoSubject: 'SK Cannabis Connect 2027 — notify me'
};

(function () {
  'use strict';

  var EASE_OK = !window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     Verification gate
     Both boxes must be ticked. Confirmation is remembered for the browser
     session only, so every new visit re-verifies.
     ------------------------------------------------------------------------ */

  var STORAGE_KEY = 'skcc-verified';

  function stored(key) {
    try { return sessionStorage.getItem(key); } catch (e) { return null; }
  }
  function store(key, value) {
    try { sessionStorage.setItem(key, value); } catch (e) { /* storage blocked */ }
  }

  function initGate() {
    var gate = document.getElementById('gate');
    if (!gate) return;

    var ask = gate.querySelector('[data-gate-ask]');
    var denied = gate.querySelector('[data-gate-denied]');
    var boxes = gate.querySelectorAll('[data-gate-check]');
    var enter = gate.querySelector('[data-gate-enter]');
    var decline = gate.querySelector('[data-gate-decline]');
    var back = gate.querySelector('[data-gate-back]');

    if (stored(STORAGE_KEY) === 'yes') {
      gate.hidden = true;
      return;
    }

    document.body.classList.add('gate-locked');

    function allChecked() {
      for (var i = 0; i < boxes.length; i++) {
        if (!boxes[i].checked) return false;
      }
      return true;
    }

    function sync() { enter.disabled = !allChecked(); }

    for (var i = 0; i < boxes.length; i++) {
      boxes[i].addEventListener('change', sync);
    }
    sync();

    enter.addEventListener('click', function () {
      if (!allChecked()) return;
      store(STORAGE_KEY, 'yes');
      gate.hidden = true;
      document.body.classList.remove('gate-locked');
      document.removeEventListener('keydown', trap, true);
    });

    decline.addEventListener('click', function () {
      ask.hidden = true;
      denied.hidden = false;
      gate.setAttribute('aria-labelledby', 'gate-denied-title');
      back.focus();
    });

    back.addEventListener('click', function () {
      denied.hidden = true;
      ask.hidden = false;
      gate.setAttribute('aria-labelledby', 'gate-title');
      for (var j = 0; j < boxes.length; j++) boxes[j].checked = false;
      sync();
      boxes[0].focus();
    });

    /* Keep focus inside the dialog while it is up. */
    function focusables() {
      var pane = ask.hidden ? denied : ask;
      return Array.prototype.filter.call(
        pane.querySelectorAll('input, button, a[href]'),
        function (el) { return !el.disabled && el.offsetParent !== null; }
      );
    }

    function trap(e) {
      if (gate.hidden || e.key !== 'Tab') return;
      var list = focusables();
      if (!list.length) return;
      var first = list[0];
      var last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', trap, true);
    boxes[0].focus();
  }

  /* ------------------------------------------------------------------------
     Header: glass on scroll, ink inversion over light bands
     ------------------------------------------------------------------------ */

  function initHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    var lights = document.querySelectorAll('[data-surface="light"]');
    var PROBE = 96;

    /* Publish the real header height so the photo heroes pull under it by
       exactly the right amount at every breakpoint. */
    function publishHeight() {
      document.documentElement.style.setProperty(
        '--header-h', Math.round(header.getBoundingClientRect().height) + 'px');
    }
    publishHeight();
    window.addEventListener('resize', publishHeight, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(publishHeight);
    var atTop = null;
    var onLight = null;

    function measure() {
      var top = (window.scrollY || window.pageYOffset || 0) < 24;
      if (top !== atTop) {
        atTop = top;
        header.classList.toggle('is-top', top);
      }

      var light = false;
      for (var i = 0; i < lights.length; i++) {
        var r = lights[i].getBoundingClientRect();
        if (r.top < PROBE && r.bottom > PROBE * 0.5) { light = true; break; }
      }
      if (light !== onLight) {
        onLight = light;
        header.classList.toggle('on-light', light);
      }
    }

    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    measure();
  }

  /* ------------------------------------------------------------------------
     Newsletter form
     ------------------------------------------------------------------------ */

  function initNewsletter() {
    var form = document.querySelector('[data-notify-form]');
    if (!form) return;

    var input = form.querySelector('input[type="email"]');
    var button = form.querySelector('button[type="submit"]');
    var fine = document.querySelector('[data-notify-fine]');
    var done = document.querySelector('[data-notify-done]');
    var error = document.querySelector('[data-notify-error]');

    function confirmSignup() {
      form.hidden = true;
      if (fine) fine.hidden = true;
      if (error) error.hidden = true;
      if (done) done.hidden = false;
    }

    function fail(message) {
      if (!error) return;
      error.textContent = message;
      error.hidden = false;
    }

    function send(url, contentType, payload) {
      button.disabled = true;
      if (error) error.hidden = true;
      /* text/plain keeps this a "simple" request, so the browser skips the
         CORS preflight — Apps Script web apps do not answer one. */
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': contentType, 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (!res.ok) throw new Error(res.status);
        confirmSignup();
      }).catch(function () {
        button.disabled = false;
        fail('That did not go through. Email ' + NEWSLETTER.mailto + ' and we will add you.');
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      /* Bots fill the hidden field; people never see it. Look successful and
         drop it on the floor. */
      var trap = form.querySelector('[data-notify-trap]');
      if (trap && trap.value) { confirmSignup(); return; }

      var email = (input.value || '').trim();
      if (!email) return;

      var payload = {
        email: email,
        source: 'skcannaconnect.ca',
        page: window.location.pathname
      };

      if (NEWSLETTER.mode === 'sheet' && NEWSLETTER.sheetUrl) {
        payload.token = NEWSLETTER.sheetToken;
        send(NEWSLETTER.sheetUrl, 'text/plain;charset=utf-8', payload);
        return;
      }

      if (NEWSLETTER.mode === 'post' && NEWSLETTER.endpoint) {
        send(NEWSLETTER.endpoint, 'application/json', payload);
        return;
      }

      if (NEWSLETTER.mode === 'redirect' && NEWSLETTER.redirectUrl) {
        var joiner = NEWSLETTER.redirectUrl.indexOf('?') === -1 ? '?' : '&';
        window.location.href = NEWSLETTER.redirectUrl + joiner +
          encodeURIComponent(NEWSLETTER.emailParam) + '=' + encodeURIComponent(email);
        return;
      }

      /* Default: hand off to the visitor's mail client. */
      window.location.href = 'mailto:' + NEWSLETTER.mailto +
        '?subject=' + encodeURIComponent(NEWSLETTER.mailtoSubject) +
        '&body=' + encodeURIComponent('Please add ' + email + ' to the SK Cannabis Connect 2027 list.');
      confirmSignup();
    });
  }

  /* ------------------------------------------------------------------------
     Testimonial rotator
     Controls stay hidden until there is more than one quote.
     ------------------------------------------------------------------------ */

  function initTestimonials() {
    var root = document.querySelector('[data-testimonials]');
    if (!root) return;

    var items = JSON.parse(root.getAttribute('data-testimonials') || '[]');
    if (items.length < 2) return;

    var quote = root.querySelector('[data-t-quote]');
    var name = root.querySelector('[data-t-name]');
    var role = root.querySelector('[data-t-role]');
    var controls = root.querySelector('[data-t-controls]');
    var dotRow = root.querySelector('[data-t-dots]');
    var prev = root.querySelector('[data-t-prev]');
    var next = root.querySelector('[data-t-next]');
    var i = 0;
    var timer = null;

    var dots = items.map(function (_, n) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Testimonial ' + (n + 1) + ' of ' + items.length);
      b.addEventListener('click', function () { go(n); restart(); });
      dotRow.appendChild(b);
      return b;
    });

    controls.hidden = false;

    function paint() {
      var t = items[i];
      quote.textContent = t.quote;
      name.textContent = t.name;
      role.textContent = t.role + ', ' + t.company;
      dots.forEach(function (d, n) { d.setAttribute('aria-current', n === i ? 'true' : 'false'); });
    }

    function go(n) {
      i = ((n % items.length) + items.length) % items.length;
      if (!EASE_OK) { paint(); return; }
      quote.classList.add('is-fading');
      window.setTimeout(function () {
        paint();
        quote.classList.remove('is-fading');
      }, 320);
    }

    function start() {
      if (!EASE_OK) return;
      timer = window.setInterval(function () { go(i + 1); }, 8000);
    }
    function stop() { window.clearInterval(timer); timer = null; }
    function restart() { stop(); start(); }

    prev.addEventListener('click', function () { go(i - 1); restart(); });
    next.addEventListener('click', function () { go(i + 1); restart(); });

    /* Pause while the reader is engaging with it. */
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);

    paint();
    start();
  }

  function boot() {
    initGate();
    initHeader();
    initNewsletter();
    initTestimonials();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
