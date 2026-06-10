// Theme toggle + persistence + system preference. Shared across all pages.
(function () {
    const KEY = 'omo-theme';
    const root = document.documentElement;

    // SVG icon definitions
    const sunSVG = '<svg class="icon-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
    const moonSVG = '<svg class="icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

    function apply(theme) {
        root.setAttribute('data-theme', theme);
        const btn = document.querySelector('.theme-toggle');
        if (btn) {
            btn.innerHTML = theme === 'dark' ? sunSVG : moonSVG;
        }
    }

    const saved = localStorage.getItem(KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    apply(saved || (prefersDark ? 'dark' : 'light'));

    document.addEventListener('click', function (e) {
        if (!e.target.closest('.theme-toggle')) return;
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        localStorage.setItem(KEY, next);
        apply(next);
    });

    // Mobile menu toggle
    document.addEventListener('click', function (e) {
        const menuBtn = e.target.closest('.nav__menu-btn');
        if (!menuBtn) return;
        const navLinks = menuBtn.closest('.nav').querySelector('.nav__links');
        const isOpen = navLinks.classList.toggle('open');
        menuBtn.setAttribute('aria-expanded', isOpen);
    });

    // Nav scroll shadow
    var lastScroll = 0;
    window.addEventListener('scroll', function () {
        var nav = document.querySelector('.nav');
        if (!nav) return;
        if (window.scrollY > 10) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }, { passive: true });

    // Fade-in animation on scroll
    var fadeEls = document.querySelectorAll('.fade-in');
    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        fadeEls.forEach(function (el) {
            observer.observe(el);
        });
    } else {
        // Fallback: show all immediately
        fadeEls.forEach(function (el) {
            el.classList.add('visible');
        });
    }
})();
