/* ============================================
   PUNTA GORDA MARTIAL ARTS — Interactions
   ============================================ */

(function () {
  'use strict';

  // -----------------------------
  // Navigation: scrolled state
  // -----------------------------
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 30) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // -----------------------------
  // Mobile menu
  // -----------------------------
  const burger = document.querySelector('.burger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (burger && mobileMenu) {
    const toggle = () => {
      const open = burger.classList.toggle('open');
      mobileMenu.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', toggle);
    mobileMenu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        if (a.getAttribute('href') && !a.getAttribute('href').startsWith('#submenu')) {
          burger.classList.remove('open');
          mobileMenu.classList.remove('open');
          document.body.style.overflow = '';
        }
      });
    });
  }

  // Mobile menu — close button
  const mobileClose = document.querySelector('.mobile-menu-close');
  if (mobileClose && burger && mobileMenu) {
    mobileClose.addEventListener('click', () => {
      burger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  // Mobile menu — Programs submenu toggle
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });
  }

  // Optional: auto-expand the Programs submenu if the user is currently on a program page
  const activeSubLink = document.querySelector('.mobile-menu-sub a.active');
  if (activeSubLink && mobileToggle) {
    mobileToggle.setAttribute('aria-expanded', 'true');
  }

  // -----------------------------
  // Scroll reveal — IntersectionObserver
  // -----------------------------
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('.reveal, .reveal-stagger').forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll('.reveal, .reveal-stagger').forEach((el) => el.classList.add('in'));
  }

  // -----------------------------
  // Stat counter animation
  // -----------------------------
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && !reduceMotion) {
    const counterIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseFloat(el.dataset.count);
          const decimals = (el.dataset.count.split('.')[1] || '').length;
          const duration = 1600;
          const start = performance.now();
          const step = (now) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            const current = target * eased;
            el.textContent = decimals
              ? current.toFixed(decimals)
              : Math.round(current).toLocaleString();
            if (t < 1) requestAnimationFrame(step);
            else el.textContent = decimals ? target.toFixed(decimals) : target.toLocaleString();
          };
          requestAnimationFrame(step);
          counterIO.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((c) => counterIO.observe(c));
  } else {
    counters.forEach((c) => {
      const target = parseFloat(c.dataset.count);
      const decimals = (c.dataset.count.split('.')[1] || '').length;
      c.textContent = decimals ? target.toFixed(decimals) : target.toLocaleString();
    });
  }

  // -----------------------------
  // FAQ accordion
  // -----------------------------
  document.querySelectorAll('.faq-item').forEach((item) => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', () => {
      const open = item.classList.toggle('open');
      if (open) {
        a.style.maxHeight = a.scrollHeight + 'px';
      } else {
        a.style.maxHeight = '0px';
      }
    });
  });

  // -----------------------------
  // Schedule tabs — filter desktop grid + mobile day-cards
  // -----------------------------
  const scheduleTabs = document.querySelectorAll('.schedule-tab');
  const scheduleTable = document.querySelector('.schedule-table');
  const scheduleMobile = document.querySelector('.schedule-mobile');

  function updateMobileSchedule(filter) {
    if (!scheduleMobile) return;
    const dayCards = scheduleMobile.querySelectorAll('.schedule-day-card');
    dayCards.forEach((card) => {
      const rows = card.querySelectorAll('.schedule-class-row');
      let visibleCount = 0;
      rows.forEach((row) => {
        const cat = row.dataset.cat;
        const visible =
          filter === 'all' ||
          (filter === 'adults' && cat === 'adults') ||
          (filter === 'kids' && cat === 'kids');
        if (visible) visibleCount++;
      });
      card.classList.toggle('is-empty', visibleCount === 0);
      const countEl = card.querySelector('.day-count');
      if (countEl) {
        countEl.textContent = visibleCount === 0
          ? 'No classes'
          : visibleCount + (visibleCount === 1 ? ' class' : ' classes');
      }
    });
  }

  if (scheduleTabs.length) {
    scheduleTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        scheduleTabs.forEach((t) => t.classList.toggle('active', t === tab));

        // Desktop grid
        if (scheduleTable) {
          scheduleTable.classList.remove('filter-adults', 'filter-kids');
          if (target === 'adults') scheduleTable.classList.add('filter-adults');
          else if (target === 'kids') scheduleTable.classList.add('filter-kids');
        }

        // Mobile day-cards
        if (scheduleMobile) {
          scheduleMobile.classList.remove('filter-adults', 'filter-kids');
          if (target === 'adults') scheduleMobile.classList.add('filter-adults');
          else if (target === 'kids') scheduleMobile.classList.add('filter-kids');
          updateMobileSchedule(target);
        }
      });
    });

    // Set initial counts
    updateMobileSchedule('all');
  }

  // Highlight today's day card
  const todayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const todayKey = todayMap[new Date().getDay()];
  const todayCard = document.querySelector('.schedule-day-card[data-day="' + todayKey + '"]');
  if (todayCard) {
    todayCard.classList.add('today');
  }

  // -----------------------------
  // Form: simple inline validation/feedback (no backend)
  // -----------------------------
  const form = document.querySelector('[data-trial-form]');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Honeypot: silently fake success if filled by a bot
      const honeypot = form.querySelector('input[name="website"]');
      if (honeypot && honeypot.value.trim()) {
        const btn = form.querySelector('button[type="submit"]');
        if (btn) { btn.innerHTML = '✓ Thanks — we\'ll be in touch'; btn.style.background = '#16a34a'; btn.style.color = '#fff'; form.reset(); }
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      const original = btn.innerHTML;
      btn.innerHTML = 'Sending… <span class="arrow">→</span>';
      btn.disabled = true;
      setTimeout(() => {
        btn.innerHTML = '✓ Thanks — we\'ll be in touch';
        btn.style.background = '#16a34a';
        btn.style.color = '#fff';
        form.reset();
        setTimeout(() => {
          btn.innerHTML = original;
          btn.disabled = false;
          btn.style.background = '';
          btn.style.color = '';
        }, 3500);
      }, 800);
    });
  }

  // -----------------------------
  // Marquee — duplicate content for seamless loop
  // -----------------------------
  document.querySelectorAll('.marquee-track').forEach((track) => {
    if (track.dataset.duplicated) return;
    const clone = track.innerHTML;
    track.innerHTML = clone + clone;
    track.dataset.duplicated = 'true';
  });

  // -----------------------------
  // Smooth anchor scroll (offset for fixed nav)
  // -----------------------------
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === '#' || href.length < 2) return;
    link.addEventListener('click', (e) => {
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  // -----------------------------
  // Trial class modal — inject HTML, intercept CTAs
  // -----------------------------
  const modalHTML = `
<div class="pgma-modal-overlay" id="pgmaTrialModal" aria-hidden="true">
  <div class="pgma-modal" role="dialog" aria-modal="true" aria-labelledby="pgmaModalTitle">
    <button class="pgma-modal-close" aria-label="Close form">&#x2715;</button>
    <div class="pgma-modal-inner">
      <span class="eyebrow">Free Trial Class</span>
      <h2 class="pgma-modal-title" id="pgmaModalTitle">Claim your<br><span class="text-gold">free class.</span></h2>
      <p class="pgma-modal-sub">No experience needed. No gear required. No commitment.</p>
      <form class="pgma-modal-form" id="pgmaModalForm" novalidate>
        <div class="pgma-form-row">
          <label class="pgma-form-field">
            <span>First Name <em>*</em></span>
            <input type="text" name="first_name" required autocomplete="given-name" placeholder="Jane" />
            <span class="pgma-field-error">Please enter your first name.</span>
          </label>
          <label class="pgma-form-field">
            <span>Last Name <em>*</em></span>
            <input type="text" name="last_name" required autocomplete="family-name" placeholder="Smith" />
            <span class="pgma-field-error">Please enter your last name.</span>
          </label>
        </div>
        <label class="pgma-form-field">
          <span>Email <em>*</em></span>
          <input type="email" name="email" required autocomplete="email" placeholder="jane@example.com" />
          <span class="pgma-field-error">Please enter a valid email address.</span>
        </label>
        <label class="pgma-form-field">
          <span>Phone <small>(optional)</small></span>
          <input type="tel" name="phone" autocomplete="tel" placeholder="(941) 555-0000" />
        </label>
        <div class="pgma-honeypot" aria-hidden="true">
          <label>Leave this blank <input type="text" name="website" tabindex="-1" autocomplete="off" /></label>
        </div>
        <div class="pgma-form-field" id="pgmaProgramField">
          <span>Choose Your Program(s) <em>*</em></span>
          <div class="pgma-multi-dropdown">
            <button type="button" class="pgma-multi-trigger" aria-haspopup="listbox" aria-expanded="false">
              <span class="pgma-multi-value">Select program(s)...</span>
              <svg class="pgma-multi-chevron" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4.5L7 9.5L12 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <div class="pgma-multi-panel" role="listbox" aria-multiselectable="true" hidden>
              <label class="pgma-multi-option"><input type="checkbox" name="program" value="adults-teens" /><span class="pgma-multi-check"></span><span class="pgma-multi-text">Adults &amp; Teens BJJ<small>Ages 13+</small></span></label>
              <label class="pgma-multi-option"><input type="checkbox" name="program" value="young-grapplers" /><span class="pgma-multi-check"></span><span class="pgma-multi-text">Young Grapplers<small>Ages 7–12</small></span></label>
              <label class="pgma-multi-option"><input type="checkbox" name="program" value="mighty-grapplers" /><span class="pgma-multi-check"></span><span class="pgma-multi-text">Mighty Grapplers<small>Ages 5–6</small></span></label>
              <label class="pgma-multi-option"><input type="checkbox" name="program" value="homeschool" /><span class="pgma-multi-check"></span><span class="pgma-multi-text">Homeschool BJJ<small>Ages 6–14</small></span></label>
              <label class="pgma-multi-option"><input type="checkbox" name="program" value="private-lessons" /><span class="pgma-multi-check"></span><span class="pgma-multi-text">Private Lessons<small>Any age, 1-on-1</small></span></label>
              <label class="pgma-multi-option"><input type="checkbox" name="program" value="not-sure" /><span class="pgma-multi-check"></span><span class="pgma-multi-text">Not sure yet<small>We'll help you pick</small></span></label>
            </div>
          </div>
          <span class="pgma-field-error">Please choose at least one program.</span>
        </div>
        <button type="submit" class="btn btn-primary btn-lg pgma-modal-submit">
          Send My Free Class Request <span class="arrow">&#x2192;</span>
        </button>
        <p class="pgma-form-fineprint">We'll never sell your info or spam you.</p>
      </form>
      <div class="pgma-modal-success" hidden>
        <div class="pgma-success-icon">&#x2713;</div>
        <h3>You're on the list!</h3>
        <p>We'll text or email you within a few hours with class options that fit your schedule.</p>
        <button class="btn btn-primary pgma-success-close">Done <span class="arrow">&#x2192;</span></button>
      </div>
    </div>
  </div>
</div>`;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const trialOverlay    = document.getElementById('pgmaTrialModal');
  const trialModalEl    = trialOverlay.querySelector('.pgma-modal');
  const trialCloseBtn   = trialOverlay.querySelector('.pgma-modal-close');
  const trialForm       = document.getElementById('pgmaModalForm');
  const trialSuccess    = trialOverlay.querySelector('.pgma-modal-success');
  const successCloseBtn = trialOverlay.querySelector('.pgma-success-close');

  function openTrialModal() {
    trialOverlay.setAttribute('aria-hidden', 'false');
    trialOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      const first = trialOverlay.querySelector('input[type="text"]');
      if (first) first.focus();
    }, 380);
  }

  function closeTrialModal() {
    trialOverlay.classList.remove('open');
    trialOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // Reset form after animation finishes
    setTimeout(() => {
      if (trialForm) {
        trialForm.reset();
        trialForm.hidden = false;
        trialForm.querySelectorAll('.pgma-has-error').forEach((f) => f.classList.remove('pgma-has-error'));
        trialForm.querySelectorAll('.pgma-error').forEach((el) => el.classList.remove('pgma-error'));
        const btn = trialForm.querySelector('.pgma-modal-submit');
        if (btn) { btn.textContent = ''; btn.innerHTML = 'Send My Free Class Request <span class="arrow">&#x2192;</span>'; btn.disabled = false; }
      }
      if (trialSuccess) trialSuccess.hidden = true;
    }, 350);
  }

  // Close on overlay backdrop click
  trialOverlay.addEventListener('click', (e) => {
    if (e.target === trialOverlay) closeTrialModal();
  });
  trialCloseBtn.addEventListener('click', closeTrialModal);
  if (successCloseBtn) successCloseBtn.addEventListener('click', closeTrialModal);

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && trialOverlay.classList.contains('open')) closeTrialModal();
  });

  // Intercept all primary CTA links that go to contact.html or #trial-form
  document.querySelectorAll('a.btn-primary, a.mobile-cta').forEach((link) => {
    const href = (link.getAttribute('href') || '').trim();
    if (!href || href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('http')) return;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      // Close mobile nav if open
      if (burger && mobileMenu && mobileMenu.classList.contains('open')) {
        burger.classList.remove('open');
        mobileMenu.classList.remove('open');
      }
      openTrialModal();
    });
  });

  // Intro-strip "open-trial-popup" links
  document.querySelectorAll('.open-trial-popup').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      openTrialModal();
    });
  });

  // Form validation + submission
  if (trialForm) {
    trialForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Honeypot: if filled, silently fake success (bot detected)
      const honeypot = trialForm.querySelector('input[name="website"]');
      if (honeypot && honeypot.value.trim()) {
        trialForm.hidden = true;
        if (trialSuccess) trialSuccess.hidden = false;
        return;
      }

      let valid = true;

      // Text / email fields
      trialForm.querySelectorAll('input[required]:not([type="checkbox"])').forEach((input) => {
        const field = input.closest('.pgma-form-field');
        const bad = !input.value.trim() ||
          (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()));
        field.classList.toggle('pgma-has-error', bad);
        input.classList.toggle('pgma-error', bad);
        if (bad) valid = false;
      });

      // Program selection
      const programField  = document.getElementById('pgmaProgramField');
      const programPicked = !!trialForm.querySelector('input[name="program"]:checked');
      programField.classList.toggle('pgma-has-error', !programPicked);
      const multiTrigger = trialForm.querySelector('.pgma-multi-trigger');
      if (multiTrigger) multiTrigger.classList.toggle('pgma-error', !programPicked);
      if (!programPicked) valid = false;

      if (!valid) return;

      const btn = trialForm.querySelector('.pgma-modal-submit');
      btn.innerHTML = 'Sending\u2026';
      btn.disabled = true;

      setTimeout(() => {
        trialForm.hidden = true;
        if (trialSuccess) trialSuccess.hidden = false;
        // Scroll modal to top so success screen is visible
        trialModalEl.scrollTo({ top: 0, behavior: 'smooth' });
        // Redirect to booking page after a brief moment on the success screen
        setTimeout(() => { window.location.href = 'booking.html'; }, 1800);
      }, 800);
    });

    // Live clear errors
    trialForm.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]').forEach((input) => {
      input.addEventListener('input', () => {
        const field = input.closest('.pgma-form-field');
        if (field) { field.classList.remove('pgma-has-error'); input.classList.remove('pgma-error'); }
      });
    });

    trialForm.querySelectorAll('input[name="program"]').forEach((cb) => {
      cb.addEventListener('change', () => {
        const pf = document.getElementById('pgmaProgramField');
        const mt = trialForm.querySelector('.pgma-multi-trigger');
        if (pf) pf.classList.remove('pgma-has-error');
        if (mt) mt.classList.remove('pgma-error');
      });
    });
  }

  // Init all multi-select dropdowns on the page
  function initMultiDropdowns(root) {
    (root || document).querySelectorAll('.pgma-multi-dropdown').forEach((dd) => {
      const trigger = dd.querySelector('.pgma-multi-trigger');
      const panel   = dd.querySelector('.pgma-multi-panel');
      const valueEl = dd.querySelector('.pgma-multi-value');
      if (!trigger || !panel) return;

      function updateLabel() {
        const checked = dd.querySelectorAll('input[type="checkbox"]:checked');
        if (checked.length === 0) {
          valueEl.textContent = 'Select program(s)...';
        } else {
          const labels = Array.from(checked).map((c) => {
            const textEl = c.closest('.pgma-multi-option').querySelector('.pgma-multi-text');
            return textEl ? textEl.firstChild.textContent.trim() : c.value;
          });
          valueEl.textContent = labels.join(', ');
        }
      }

      function openPanel() {
        panel.hidden = false;
        trigger.setAttribute('aria-expanded', 'true');
        trigger.classList.add('open');
      }

      function closePanel() {
        panel.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
        trigger.classList.remove('open');
      }

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.hidden ? openPanel() : closePanel();
      });

      dd.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
        cb.addEventListener('change', updateLabel);
      });

      document.addEventListener('click', (e) => {
        if (!dd.contains(e.target)) closePanel();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closePanel();
      });
    });
  }

  initMultiDropdowns(document);

})();

// Booking page — program tabs
(function () {
  const bookingTabs = document.querySelectorAll('.booking-tab');
  const bookingPanels = document.querySelectorAll('.booking-panel');
  if (!bookingTabs.length || !bookingPanels.length) return;
  bookingTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.booking;
      bookingTabs.forEach((t) => t.classList.toggle('active', t === tab));
      bookingPanels.forEach((p) => {
        p.classList.toggle('active', p.dataset.bookingPanel === target);
      });
      // Smooth scroll into view on mobile after switching
      if (window.innerWidth < 768) {
        const activePanel = document.querySelector('.booking-panel.active');
        if (activePanel) {
          setTimeout(() => activePanel.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
        }
      }
    });
  });
}());
