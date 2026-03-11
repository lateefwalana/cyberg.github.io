/**
 * CyberGlobe LTD — script.js
 * Interactive features for the consulting website.
 *
 * Features:
 *  - Mobile menu toggle with overlay
 *  - Sticky header scroll state
 *  - Active nav link on scroll (IntersectionObserver)
 *  - Scroll reveal animations
 *  - Smooth scroll (polyfill for JS-triggered scrolls)
 *  - Contact form validation
 *  - Back-to-top button
 *  - Footer year auto-update
 */

'use strict';

/* ================================================================
   UTILITIES
   ================================================================ */

/**
 * Shorthand querySelector
 * @param {string} selector
 * @param {Element} [ctx=document]
 * @returns {Element|null}
 */
const $ = (selector, ctx = document) => ctx.querySelector(selector);

/**
 * Shorthand querySelectorAll
 * @param {string} selector
 * @param {Element} [ctx=document]
 * @returns {NodeList}
 */
const $$ = (selector, ctx = document) => ctx.querySelectorAll(selector);

/**
 * Add multiple event listeners in one call
 * @param {Element} el
 * @param {string[]} events
 * @param {Function} handler
 */
const onEvents = (el, events, handler) => {
  events.forEach(e => el.addEventListener(e, handler, { passive: true }));
};


/* ================================================================
   STATE
   ================================================================ */

const state = {
  menuOpen:  false,
  scrolled:  false,
  scrollTop: 0,
};


/* ================================================================
   DOM REFERENCES
   ================================================================ */

const header        = $('#site-header');
const menuToggle    = $('#menu-toggle');
const mainNav       = $('#main-nav');
const mobileOverlay = $('#mobile-overlay');
const backToTopBtn  = $('#back-to-top');
const footerYear    = $('#footer-year');
const contactForm   = $('#contact-form');
const submitBtn     = $('#submit-btn');
const formSuccess   = $('#form-success');
const navLinks      = $$('.nav-link');


/* ================================================================
   01. FOOTER YEAR
   ================================================================ */

if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}


/* ================================================================
   02. MOBILE MENU
   ================================================================ */

/**
 * Open the mobile navigation menu
 */
function openMenu() {
  state.menuOpen = true;
  menuToggle.classList.add('is-open');
  menuToggle.setAttribute('aria-expanded', 'true');
  mainNav.classList.add('is-open');
  mobileOverlay.classList.add('is-active');
  mobileOverlay.removeAttribute('aria-hidden');
  document.body.style.overflow = 'hidden';
}

/**
 * Close the mobile navigation menu
 */
function closeMenu() {
  state.menuOpen = false;
  menuToggle.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  mainNav.classList.remove('is-open');
  mobileOverlay.classList.remove('is-active');
  mobileOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    state.menuOpen ? closeMenu() : openMenu();
  });
}

if (mobileOverlay) {
  mobileOverlay.addEventListener('click', closeMenu);
}

// Close menu when a nav link is clicked
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (state.menuOpen) closeMenu();
  });
});

// Close menu on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && state.menuOpen) closeMenu();
});

// Close menu if window is resized past mobile breakpoint
window.addEventListener('resize', () => {
  if (window.innerWidth > 768 && state.menuOpen) closeMenu();
}, { passive: true });


/* ================================================================
   03. STICKY HEADER
   ================================================================ */

function updateHeader() {
  const scrollY = window.scrollY;
  const shouldBeScrolled = scrollY > 20;

  if (shouldBeScrolled !== state.scrolled) {
    state.scrolled = shouldBeScrolled;
    header.classList.toggle('is-scrolled', shouldBeScrolled);
  }
}

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader(); // Run on load


/* ================================================================
   04. ACTIVE NAV LINK ON SCROLL (IntersectionObserver)
   ================================================================ */

/**
 * Map of section IDs to nav link elements
 */
const sectionMap = {};

navLinks.forEach(link => {
  const sectionId = link.getAttribute('data-section');
  if (sectionId) {
    const section = document.getElementById(sectionId);
    if (section) sectionMap[sectionId] = { section, link };
  }
});

// IntersectionObserver — tracks which section is in view
const navObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Remove active from all links
        navLinks.forEach(l => l.classList.remove('is-active'));

        // Find and activate the matching link
        const id = entry.target.id;
        if (sectionMap[id]) {
          sectionMap[id].link.classList.add('is-active');
        }
      }
    });
  },
  {
    rootMargin: '-30% 0px -60% 0px',
    threshold: 0,
  }
);

// Observe all mapped sections
Object.values(sectionMap).forEach(({ section }) => {
  navObserver.observe(section);
});


/* ================================================================
   05. SCROLL REVEAL ANIMATIONS
   ================================================================ */

const revealElements = $$('.reveal');

if (revealElements.length > 0) {
  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Unobserve after revealing to save resources
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealElements.forEach(el => revealObserver.observe(el));
}


/* ================================================================
   06. SMOOTH SCROLL — Nav links
   ================================================================ */

// Handles smooth scroll for all internal anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (!targetId || targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();

    const headerHeight = header ? header.offsetHeight : 72;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight;

    window.scrollTo({
      top: targetTop,
      behavior: 'smooth',
    });

    // Update URL without jumping (optional)
    history.pushState(null, null, targetId);
  });
});


/* ================================================================
   07. BACK TO TOP
   ================================================================ */

if (backToTopBtn) {
  // Show/hide on scroll
  window.addEventListener('scroll', () => {
    backToTopBtn.classList.toggle('is-visible', window.scrollY > 600);
  }, { passive: true });

  // Smooth scroll to top on click
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


/* ================================================================
   08. CONTACT FORM VALIDATION
   ================================================================ */

/**
 * Validation rules for each field
 */
const validators = {
  name: {
    validate: val => val.trim().length >= 2,
    message:  'Please enter your full name (at least 2 characters).',
  },
  email: {
    validate: val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()),
    message:  'Please enter a valid email address.',
  },
  service: {
    validate: val => val !== '' && val !== undefined,
    message:  'Please select a service area.',
  },
  message: {
    validate: val => val.trim().length >= 20,
    message:  'Please provide a brief description (at least 20 characters).',
  },
};

/**
 * Validate a single field, show/clear its error message
 * @param {HTMLElement} input
 * @param {string} fieldName
 * @returns {boolean} is valid
 */
function validateField(input, fieldName) {
  const rule  = validators[fieldName];
  const error = $(`#${fieldName}-error`);
  if (!rule) return true;

  const isValid = rule.validate(input.value);

  input.classList.toggle('has-error', !isValid);

  if (error) {
    error.textContent = isValid ? '' : rule.message;
  }

  return isValid;
}

/**
 * Validate all form fields
 * @returns {boolean}
 */
function validateForm() {
  let allValid = true;

  Object.keys(validators).forEach(fieldName => {
    const input = $(`#${fieldName}`, contactForm);
    if (input && !validateField(input, fieldName)) {
      allValid = false;
    }
  });

  return allValid;
}

if (contactForm) {
  // Live validation on blur for each field
  Object.keys(validators).forEach(fieldName => {
    const input = $(`#${fieldName}`, contactForm);
    if (input) {
      onEvents(input, ['blur', 'change'], () => validateField(input, fieldName));

      // Clear error on input (after first submission attempt)
      input.addEventListener('input', () => {
        if (input.classList.contains('has-error')) {
          validateField(input, fieldName);
        }
      });
    }
  });

  // Form submission handler
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) {
      // Focus the first invalid field
      const firstError = contactForm.querySelector('.has-error');
      if (firstError) firstError.focus();
      return;
    }

    // Perform real submission via Formspree
    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;

    const formData = new FormData(contactForm);
    const endpoint  = contactForm.getAttribute('action');

    fetch(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(response => {
      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;

      if (response.ok) {
        // success
        formSuccess.hidden = false;
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        contactForm.reset();
        Object.keys(validators).forEach(fieldName => {
          const input = $(`#${fieldName}`, contactForm);
          if (input) input.classList.remove('has-error');
          const error = $(`#${fieldName}-error`);
          if (error) error.textContent = '';
        });
        setTimeout(() => { formSuccess.hidden = true; }, 8000);
      } else {
        response.json().then(data => {
          alert('Submission failed: ' + (data.error || 'Please try again later.'));
        });
      }
    })
    .catch(() => {
      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
      alert('Network error – please try again later.');
    });

  });
}


/* ================================================================
   09. SUBTLE HERO PARALLAX (lightweight)
   ================================================================ */

const heroGlows = $$('.hero-glow');
const heroOrb   = $('.hero-orb');

if (heroGlows.length && heroOrb && window.matchMedia('(min-width: 768px)').matches) {
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const factor  = Math.min(scrollY / window.innerHeight, 1);

        heroGlows.forEach((glow, i) => {
          const dir = i === 0 ? -1 : 1;
          glow.style.transform = `translateY(${scrollY * 0.15 * dir}px)`;
        });

        if (heroOrb) {
          heroOrb.style.transform = `translateY(calc(-50% + ${scrollY * 0.08}px))`;
        }

        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}


/* ================================================================
   10. SERVICE CARD — icon hover ripple
   ================================================================ */

$$('.service-card').forEach(card => {
  card.addEventListener('mouseenter', function () {
    const icon = this.querySelector('.service-card__icon');
    if (icon) {
      icon.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      icon.style.transform  = 'scale(1.08) rotate(-3deg)';
    }
  });

  card.addEventListener('mouseleave', function () {
    const icon = this.querySelector('.service-card__icon');
    if (icon) {
      icon.style.transform = 'scale(1) rotate(0deg)';
    }
  });
});


/* ================================================================
   11. TAG HOVER — staggered entrance on expertise load
   ================================================================ */

const expertiseSections = $$('.expertise-category');

if (expertiseSections.length) {
  const tagObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const tags = $$('.tag', entry.target);
          tags.forEach((tag, i) => {
            setTimeout(() => {
              tag.style.opacity = '1';
              tag.style.transform = 'translateY(0)';
            }, i * 40);
          });
          tagObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  expertiseSections.forEach(section => {
    // Set initial state for tags
    $$('.tag', section).forEach(tag => {
      tag.style.opacity = '0';
      tag.style.transform = 'translateY(8px)';
      tag.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
    });

    tagObserver.observe(section);
  });
}


/* ================================================================
   12. PROCESS STEP — number highlight on scroll
   ================================================================ */

$$('.process-step').forEach(step => {
  const num = step.querySelector('.step-number');
  if (!num) return;

  const stepObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        num.style.background    = 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,255,148,0.08))';
        num.style.borderColor   = 'rgba(0,212,255,0.5)';
        num.style.color         = 'var(--col-cyan)';
      }
    },
    { threshold: 0.6 }
  );

  stepObserver.observe(step);
});


/* ================================================================
   INITIALISATION COMPLETE
   ================================================================ */

console.info('%cCyberGlobe LTD — Site loaded', 'color: #00d4ff; font-weight: bold;');
