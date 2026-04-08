/* ========================================
   Les Délices de Farinette — Animations
   GSAP + ScrollTrigger + Lenis
   ======================================== */

// --- Lenis smooth scroll ---
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Connect Lenis to GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// --- Navbar scroll effect ---
const navbar = document.getElementById('navbar');
ScrollTrigger.create({
  start: 'top -80',
  onUpdate: (self) => {
    if (self.scroll() > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  },
});

// --- Mobile menu toggle ---
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

menuToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  mobileMenu.classList.toggle('hidden');
});

// Close mobile menu on link click
mobileMenu.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    mobileMenu.classList.add('hidden');
  });
});

// --- Smooth scroll for anchor links ---
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      lenis.scrollTo(target, { offset: -80 });
    }
  });
});

// --- Hero animations ---
const heroElements = document.querySelectorAll('[data-hero-anim]');
const heroTl = gsap.timeline({ delay: 0.3 });

heroTl.to(heroElements, {
  opacity: 1,
  y: 0,
  duration: 1,
  stagger: 0.15,
  ease: 'power3.out',
});

// Hero parallax on scroll
gsap.to('.hero-bg', {
  yPercent: 30,
  ease: 'none',
  scrollTrigger: {
    trigger: '#hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
  },
});

// Hero content fade out on scroll
gsap.to('.hero-content', {
  opacity: 0,
  scale: 0.95,
  ease: 'none',
  scrollTrigger: {
    trigger: '#hero',
    start: 'top top',
    end: '60% top',
    scrub: true,
  },
});

// Scroll indicator fade out
gsap.to('.scroll-indicator', {
  opacity: 0,
  ease: 'none',
  scrollTrigger: {
    trigger: '#hero',
    start: '10% top',
    end: '30% top',
    scrub: true,
  },
});

// --- Reveal animations ---
const reveals = document.querySelectorAll('.reveal');

reveals.forEach((el, i) => {
  // Check if element is inside a staggered parent (grid)
  const isInGrid = el.closest('.grid');
  const siblings = isInGrid ? [...isInGrid.querySelectorAll('.reveal')] : null;
  const indexInGrid = siblings ? siblings.indexOf(el) : 0;

  gsap.from(el, {
    opacity: 0,
    y: 40,
    duration: 1,
    delay: isInGrid ? indexInGrid * 0.15 : 0,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
      toggleActions: 'play none none none',
    },
  });
});

// --- CTA buttons entrance ---
const ctaBtns = document.querySelectorAll('.cta-btn');
ctaBtns.forEach((btn, i) => {
  gsap.from(btn, {
    opacity: 0,
    y: 20,
    duration: 0.8,
    delay: i * 0.1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: btn,
      start: 'top 90%',
      toggleActions: 'play none none none',
    },
  });
});
