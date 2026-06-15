/* RENO Works — interactions: mobile nav, scroll reveal, form validation */
(function () {
  'use strict';

  /* ---- Current year ---- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---- Mobile navigation ---- */
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.getElementById('mobile-nav');

  function closeNav() {
    if (!toggle || !mobileNav) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    mobileNav.hidden = true;
  }

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      mobileNav.hidden = open;
    });
    mobileNav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* ---- Scroll reveal ---- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---- Quote form validation ---- */
  var form = document.getElementById('quote-form');
  if (!form) return;

  function setError(field, message) {
    var input = form.querySelector('#' + field);
    var errorEl = form.querySelector('.error[data-for="' + field + '"]');
    if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (errorEl) errorEl.textContent = message || '';
    return !message;
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    var firstInvalid = null;

    var name = form.querySelector('#name').value.trim();
    if (!setError('name', name ? '' : 'Please enter your name.')) { ok = false; firstInvalid = firstInvalid || 'name'; }

    var phone = form.querySelector('#phone').value.trim();
    if (!setError('phone', phone ? '' : 'A contact number helps us reach you.')) { ok = false; firstInvalid = firstInvalid || 'phone'; }

    var email = form.querySelector('#email').value.trim();
    if (email && !validEmail(email)) {
      setError('email', 'Please enter a valid email address.');
      ok = false; firstInvalid = firstInvalid || 'email';
    } else {
      setError('email', '');
    }

    var success = document.getElementById('form-success');
    if (!ok) {
      if (firstInvalid) form.querySelector('#' + firstInvalid).focus();
      if (success) success.hidden = true;
      return;
    }

    if (success) success.hidden = false;
    form.reset();
  });

  /* Clear an error as soon as the user corrects the field */
  ['name', 'phone', 'email'].forEach(function (id) {
    var input = form.querySelector('#' + id);
    if (input) input.addEventListener('input', function () {
      if (input.getAttribute('aria-invalid') === 'true') setError(id, '');
    });
  });
})();
