document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle (initial theme is applied by the inline script in <head>)
    const themeToggle = document.getElementById('theme-toggle');

    const applyThemeIcon = () => {
        if (!themeToggle) return;
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        themeToggle.innerHTML = isDark
            ? '<i class="fa-solid fa-sun" aria-hidden="true"></i>'
            : '<i class="fa-solid fa-moon" aria-hidden="true"></i>';
        themeToggle.setAttribute('aria-label', isDark
            ? 'Εναλλαγή σε φωτεινό θέμα'
            : 'Εναλλαγή σε σκούρο θέμα');
    };

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            try {
                localStorage.setItem('theme', next);
            } catch (e) {
                // localStorage unavailable (e.g. privacy mode) - theme just won't persist
            }
            applyThemeIcon();
        });
        applyThemeIcon();
    }

    // Reveal Animations on Scroll
    const revealElements = document.querySelectorAll('[data-reveal]');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-delay') || '0s';
                entry.target.style.transitionDelay = delay;
                entry.target.classList.add('revealed');
            } else {
                // Remove class to allow re-animation when scrolling back
                entry.target.classList.remove('revealed');
            }
        });
    }, {
        threshold: 0.1
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // Sticky Header Reference
    const header = document.getElementById('main-header');

    // Mobile Menu Toggle
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const closeBtn = document.querySelector('.close-menu');
    const menuOverlay = document.querySelector('.mobile-menu-overlay');
    const menuLinks = document.querySelectorAll('.mobile-nav a');

    const toggleMenu = () => {
        const isActive = menuOverlay.classList.toggle('active');
        document.body.style.overflow = isActive ? 'hidden' : 'auto';
        menuBtn.setAttribute('aria-expanded', String(isActive));

        if (isActive) {
            const items = menuOverlay.querySelectorAll('li');
            items.forEach((item, index) => {
                item.style.transitionDelay = `${0.1 * (index + 1)}s`;
            });
            const firstLink = menuOverlay.querySelector('a');
            if (firstLink) firstLink.focus();
        } else {
            menuBtn.focus();
        }
    };

    menuBtn.addEventListener('click', toggleMenu);
    closeBtn.addEventListener('click', toggleMenu);
    menuLinks.forEach(link => link.addEventListener('click', toggleMenu));

    // Close the mobile menu with the Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menuOverlay.classList.contains('active')) {
            toggleMenu();
        }
    });

    // Counter Animation for Stats
    const stats = document.querySelectorAll('.stat-number');
    const statsSection = document.getElementById('excellence');
    let animated = false;
    let animationFrameIds = [];

    const animateStats = () => {
        if (animated) return;
        animated = true;

        stats.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            const isPercent = stat.getAttribute('data-target') === "100";
            const duration = 1500; // 1.5 seconds for a snappy feel
            let startTime = null;

            const step = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                const currentCount = Math.floor(progress * target);

                stat.innerText = currentCount + (isPercent ? '%' : '');

                if (progress < 1) {
                    animationFrameIds.push(requestAnimationFrame(step));
                } else {
                    stat.innerText = target + (isPercent ? '%' : '');
                }
            };
            animationFrameIds.push(requestAnimationFrame(step));
        });
    };

    const statsObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            animateStats();
        } else {
            animated = false;
            animationFrameIds.forEach(id => cancelAnimationFrame(id));
            animationFrameIds = [];
            stats.forEach(stat => {
                const isPercent = stat.getAttribute('data-target') === "100";
                stat.innerText = '0' + (isPercent ? '%' : '');
            });
        }
    }, { threshold: 0.1 });

    if (statsSection) statsObserver.observe(statsSection);

    // Optimized Scroll Listener
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
            requestAnimationFrame(() => {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                scrollTimeout = false;
            });
            scrollTimeout = true;
        }
    }, { passive: true });

    // Handle initial URL hash navigation with a slight delay
    // This allows the DOM to render and layout to settle before scrolling
    if (window.location.hash) {
        setTimeout(() => {
            const targetId = window.location.hash.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // If the target has a reveal animation, reveal it immediately so it takes up proper space
                if (targetElement.hasAttribute('data-reveal')) {
                    targetElement.classList.add('revealed');
                    targetElement.style.transition = 'none'; // Temporarily disable transition for instant reveal
                }

                // Also reveal any animated children immediately
                const childReveals = targetElement.querySelectorAll('[data-reveal]');
                childReveals.forEach(el => {
                    el.classList.add('revealed');
                    el.style.transition = 'none';
                });

                // Scroll to the element
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

                // Re-enable transitions after a short delay
                setTimeout(() => {
                     if (targetElement.hasAttribute('data-reveal')) targetElement.style.transition = '';
                     childReveals.forEach(el => el.style.transition = '');
                }, 500);
            }
        }, 150); // 150ms delay is usually enough for the browser to calculate initial layout
    }

    // Handle gallery items target on mobile
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                this.removeAttribute('target');
            } else {
                this.setAttribute('target', '_blank');
            }
        });
    });

    // Hero Image Slider (alternates base images every 5 seconds)
    const heroSlides = document.querySelectorAll('.hero-image .hero-slide');
    if (heroSlides.length > 1) {
        let currentSlide = 0;
        setInterval(() => {
            heroSlides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % heroSlides.length;
            heroSlides[currentSlide].classList.add('active');
        }, 5000);
    }

    // Keep the footer copyright year current
    const footerYear = document.getElementById('footer-year');
    if (footerYear) footerYear.textContent = new Date().getFullYear();
});
