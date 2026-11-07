/* USMAN GHAFFAR — PORTFOLIO INTERACTIONS
   Framework-free, lightweight, supports touch and reduced-motion settings. */
(() => {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

  // Persist visitor's theme preference. Only the editorial sections change theme.
  const themeButton = $('#themeToggle');
  let savedTheme = null;
  try { savedTheme = localStorage.getItem('usman-portfolio-theme'); } catch (_) {}
  if (savedTheme === 'dark') document.body.classList.add('dark-mode');
  function updateThemeButton() {
    const dark = document.body.classList.contains('dark-mode');
    themeButton.innerHTML = dark ? '<i class="fas fa-sun" aria-hidden="true"></i>' : '<i class="fas fa-moon" aria-hidden="true"></i>';
    themeButton.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
    themeButton.title = `Switch to ${dark ? 'light' : 'dark'} mode`;
  }
  updateThemeButton();
  themeButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    try { localStorage.setItem('usman-portfolio-theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light'); } catch (_) {}
    updateThemeButton();
  });

  // Compact mobile navigation with Esc, inert state and focus restoration.
  const menuButton = $('#menuToggle');
  const mobileMenu = $('#mobileMenu');
  function setMenu(open, restoreFocus = false) {
    menuButton.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.inert = !open;
    document.body.classList.toggle('no-scroll', open);
    if (open) $('a', mobileMenu)?.focus();
    else if (restoreFocus) menuButton.focus();
  }
  menuButton.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('is-open')));
  $$('a', mobileMenu).forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobileMenu.classList.contains('is-open')) setMenu(false, true);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1010 && mobileMenu.classList.contains('is-open')) setMenu(false);
  }, { passive: true });

  // Progress indicator and highlighted desktop navigation.
  const progressBar = $('#pageProgress');
  const header = $('#siteHeader');
  const navLinks = $$('.desktop-nav .nav-anchor');
  const navSections = ['home', 'about', 'skills', 'projects', 'process'].map(id => document.getElementById(id));
  let scrollFrame = null;
  function updateScrollState() {
    scrollFrame = null;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = `${maxScroll > 0 ? Math.min(100, window.scrollY / maxScroll * 100) : 0}%`;
    header.classList.toggle('is-scrolled', window.scrollY > 40);
    let activeId = 'home';
    navSections.forEach(section => {
      if (section && section.getBoundingClientRect().top <= window.innerHeight * .42) activeId = section.id;
    });
    navLinks.forEach(link => {
      const selected = link.getAttribute('href') === `#${activeId}`;
      link.classList.toggle('is-active', selected);
      if (selected) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollState);
  }, { passive: true });
  updateScrollState();

  // Scroll entrance animations: content remains visible without JavaScript.
  if (!reduceMotion && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js-motion');
    const revealables = $$('[data-reveal]');
    $$('.service-card, .project-card, .process-step').forEach((el, index) => {
      el.style.setProperty('--delay', `${(index % 3) * 85}ms`);
    });
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .08, rootMargin: '0px 0px -45px 0px' });
    revealables.forEach(el => revealObserver.observe(el));
  }

  // Hero: preserve the previous animated portrait, count-up, parallax and typewriter.
  const hero = $('#home');
  if (hero) {
    const stage = $('#hxStage');
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        hero.classList.toggle('hx-off', !entries[0].isIntersecting);
      }, { threshold: .01 }).observe(hero);
    }
    const numbers = $$('[data-count]', hero);
    if (!reduceMotion) {
      numbers.forEach(num => { num.textContent = '0'; });
      const startTime = performance.now() + 1150;
      function count(time) {
        if (time < startTime) { requestAnimationFrame(count); return; }
        const p = Math.min(1, (time - startTime) / 1500);
        const eased = 1 - Math.pow(1 - p, 3);
        numbers.forEach(num => { num.textContent = Math.round(Number(num.dataset.count) * eased); });
        if (p < 1) requestAnimationFrame(count);
      }
      requestAnimationFrame(count);
    }
    const typedText = $('#hxType');
    if (typedText && !reduceMotion) {
      const phrases = [
        'logos people remember.',
        'social posts that get noticed.',
        'beautiful print and packaging.',
        'visual identities with impact.',
        'creative content that connects.'
      ];
      let phraseIndex = 0, length = 0, deleting = false;
      typedText.textContent = '';
      function tickType() {
        if (hero.classList.contains('hx-off')) {
          window.setTimeout(tickType, 550);
          return;
        }
        const phrase = phrases[phraseIndex];
        length += deleting ? -1 : 1;
        typedText.textContent = phrase.slice(0, length);
        let delay = deleting ? 27 : 58;
        if (!deleting && length >= phrase.length) { deleting = true; delay = 1850; }
        else if (deleting && length <= 0) { deleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; delay = 325; }
        window.setTimeout(tickType, delay);
      }
      tickType();
    }
    if (finePointer && !reduceMotion && stage) {
      let scheduled = false;
      hero.addEventListener('pointermove', event => {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
          const stageRect = stage.getBoundingClientRect();
          const heroRect = hero.getBoundingClientRect();
          const px = Math.max(-1.2, Math.min(1.2, (event.clientX - (stageRect.left + stageRect.width / 2)) / (window.innerWidth / 2)));
          const py = Math.max(-1.2, Math.min(1.2, (event.clientY - (stageRect.top + stageRect.height / 2)) / (window.innerHeight / 2)));
          stage.style.setProperty('--px', px.toFixed(3));
          stage.style.setProperty('--py', py.toFixed(3));
          hero.style.setProperty('--sx', `${event.clientX - heroRect.left}px`);
          hero.style.setProperty('--sy', `${event.clientY - heroRect.top}px`);
          scheduled = false;
        });
      }, { passive: true });
      hero.addEventListener('pointerleave', () => {
        stage.style.setProperty('--px', 0);
        stage.style.setProperty('--py', 0);
      });
    }
  }

  // Filters let visitors discover work without loading another page.
  const filterButtons = $$('.filter-btn');
  const projectCards = $$('.project-card');
  filterButtons.forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach(other => {
      const selected = other === button;
      other.classList.toggle('is-selected', selected);
      other.setAttribute('aria-pressed', String(selected));
    });
    projectCards.forEach(card => {
      card.hidden = filter !== 'all' && card.dataset.category !== filter;
      if (!card.hidden) card.classList.add('is-visible');
    });
    const grid = $('#projectsGrid');
    if (!reduceMotion && grid.animate) {
      grid.animate([{ opacity: .72, transform: 'translateY(9px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 320, easing: 'ease-out' });
    }
  }));

  // Native <dialog> lightbox with close button, backdrop click and Escape support.
  const modal = $('#projectModal');
  const modalImage = $('#modalImage');
  const modalTitle = $('#modalTitle');
  const modalDescription = $('#modalDescription');
  let lastOpenedCard = null;
  if (modal && typeof modal.showModal === 'function') {
    projectCards.forEach(card => card.addEventListener('click', () => {
      lastOpenedCard = card;
      modalImage.src = card.dataset.image;
      modalImage.alt = $(`img`, card)?.alt || card.dataset.title;
      modalTitle.textContent = card.dataset.title;
      modalDescription.textContent = card.dataset.description;
      modal.showModal();
      document.body.classList.add('modal-open');
    }));
    $('#modalClose').addEventListener('click', () => modal.close());
    $('#modalCta').addEventListener('click', () => modal.close());
    modal.addEventListener('click', event => {
      if (event.target === modal) modal.close();
    });
    modal.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
      lastOpenedCard?.focus({ preventScroll: true });
    });
  }

  // Desktop-only decorative effects. The core UX works equally well on mobile.
  if (finePointer && !reduceMotion) {
    const glow = $('#cursorGlow');
    let glowFrame = null;
    document.addEventListener('pointermove', event => {
      if (glowFrame) cancelAnimationFrame(glowFrame);
      glowFrame = requestAnimationFrame(() => {
        glow.style.left = `${event.clientX}px`;
        glow.style.top = `${event.clientY}px`;
      });
    }, { passive: true });
    $$('.service-card').forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        card.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`);
        card.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`);
        card.style.setProperty('--ry', `${((x - .5) * 4).toFixed(2)}deg`);
        card.style.setProperty('--rx', `${((.5 - y) * 4).toFixed(2)}deg`);
      }, { passive: true });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
    $$('.magnetic').forEach(element => {
      element.addEventListener('pointermove', event => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * .10;
        const y = (event.clientY - rect.top - rect.height / 2) * .12;
        element.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      }, { passive: true });
      element.addEventListener('pointerleave', () => { element.style.transform = ''; });
    });
  }

  $('#year').textContent = new Date().getFullYear();
})();
