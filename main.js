/* ========================================
   Les Délices de Farinette — V2 Écrin Noir
   Hero carrousel + GSAP + Lenis
   ======================================== */

// --- Lenis smooth scroll ---
const lenis = new Lenis({
  duration: 1.4,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// --- Navbar scroll ---
const navbar = document.getElementById('navbar');
const navLogo = document.getElementById('nav-logo');
ScrollTrigger.create({
  start: 'top -80',
  onUpdate: (self) => {
    const scrolled = self.scroll() > 80;
    navbar.classList.toggle('scrolled', scrolled);
  },
});

// --- Nav logo : apparaît quand le hero n'est plus visible ---
ScrollTrigger.create({
  trigger: '#hero',
  start: 'bottom top+=80',
  onEnterBack: () => navLogo.style.opacity = '0',
  onLeave: () => navLogo.style.opacity = '1',
});

// --- Mobile menu fullscreen fade ---
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

function toggleMenu() {
  const isOpen = mobileMenu.classList.toggle('open');
  menuToggle.classList.toggle('active', isOpen);
  if (isOpen) {
    lenis.stop();
  } else {
    lenis.start();
  }
}

menuToggle.addEventListener('click', toggleMenu);

mobileMenu.querySelectorAll('.mobile-menu-link').forEach((link) => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    menuToggle.classList.remove('active');
    lenis.start();
  });
});

// --- Anchor smooth scroll via Lenis ---
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) lenis.scrollTo(target, { offset: -80 });
  });
});

// --- Hero video parallax on scroll ---
gsap.to('.hero-video-wrap', {
  yPercent: 20,
  ease: 'none',
  scrollTrigger: {
    trigger: '#hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
  },
});

// ==========================================
// HERO ANIMATIONS
// ==========================================
const heroElements = document.querySelectorAll('[data-hero-anim]');
const heroTl = gsap.timeline({ delay: 0.5 });

heroTl.to(heroElements, {
  opacity: 1,
  y: 0,
  duration: 1.2,
  stagger: 0.2,
  ease: 'power2.out',
});

// Hero content fade out on scroll
gsap.to('.hero-content', {
  opacity: 0,
  y: -30,
  ease: 'none',
  scrollTrigger: {
    trigger: '#hero',
    start: 'top top',
    end: '50% top',
    scrub: true,
  },
});

// ==========================================
// REVEAL ANIMATIONS — plus douces, organiques
// ==========================================
document.querySelectorAll('.reveal').forEach((el) => {
  const isInGrid = el.closest('.grid') || el.closest('.flex.gap-6');
  const siblings = isInGrid ? [...isInGrid.querySelectorAll('.reveal')] : null;
  const indexInGrid = siblings ? siblings.indexOf(el) : 0;

  gsap.from(el, {
    opacity: 0,
    y: 30,
    duration: 1.2,
    delay: isInGrid ? indexInGrid * 0.12 : 0,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 88%',
      toggleActions: 'play none none none',
    },
  });
});

// ==========================================
// SECTION ORNAMENTS — fade in au scroll
// ==========================================
document.querySelectorAll('.section-ornament').forEach((el) => {
  ScrollTrigger.create({
    trigger: el,
    start: 'top 90%',
    onEnter: () => el.classList.add('visible'),
  });
});

// ==========================================
// CREATION SCROLL — drag to scroll
// ==========================================
const scrollContainer = document.querySelector('.creation-scroll');
if (scrollContainer) {
  let isDown = false;
  let startX;
  let scrollLeft;

  scrollContainer.addEventListener('mousedown', (e) => {
    isDown = true;
    scrollContainer.style.cursor = 'grabbing';
    startX = e.pageX - scrollContainer.offsetLeft;
    scrollLeft = scrollContainer.scrollLeft;
  });

  scrollContainer.addEventListener('mouseleave', () => {
    isDown = false;
    scrollContainer.style.cursor = '';
  });

  scrollContainer.addEventListener('mouseup', () => {
    isDown = false;
    scrollContainer.style.cursor = '';
  });

  scrollContainer.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - scrollContainer.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainer.scrollLeft = scrollLeft - walk;
  });
}

