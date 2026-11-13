
(() => {
  const menuButton = document.querySelector('.menu-button');
  const mobileMenu = document.querySelector('.mobile-menu');
  const progress = document.querySelector('.reading-progress');
  const year = document.querySelector('#year');

  if (year) year.textContent = new Date().getFullYear();

  function closeMenu() {
    if (!menuButton || !mobileMenu) return;

    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    mobileMenu.hidden = true;
    document.body.classList.remove('menu-open');
  }

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      const opening =
        menuButton.getAttribute('aria-expanded') !== 'true';

      menuButton.setAttribute('aria-expanded', String(opening));
      menuButton.setAttribute(
        'aria-label',
        opening ? 'Close navigation' : 'Open navigation'
      );

      mobileMenu.hidden = !opening;
      document.body.classList.toggle('menu-open', opening);
    });

    mobileMenu.querySelectorAll('a').forEach(link =>
      link.addEventListener('click', closeMenu)
    );

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', () => {
      if (innerWidth > 960) closeMenu();
    });
  }

  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const max =
        document.documentElement.scrollHeight - innerHeight;

      if (progress) {
        progress.style.transform =
          `scaleX(${max > 0 ? scrollY / max : 0})`;
      }

      document.body.classList.toggle(
        'scrolled',
        scrollY > 25
      );

      ticking = false;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const revealEls = document.querySelectorAll('.reveal');

  if (
    !('IntersectionObserver' in window) ||
    matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) {
          target.classList.add('is-visible');
          obs.unobserve(target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -35px 0px'
    });

    revealEls.forEach(el => observer.observe(el));
  }

  const navLinks = [
    ...document.querySelectorAll('.desktop-nav a')
  ];

  const targets = navLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && targets.length) {
    const activeObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.toggle(
              'active',
              link.getAttribute('href') === '#' + entry.target.id
            );
          });
        }
      });
    }, {
      rootMargin: '-24% 0px -60% 0px'
    });

    targets.forEach(section =>
      activeObserver.observe(section)
    );
  }
})();
