/* ========================================
   Les Délices de Farinette — V2 Écrin Noir
   Hero carrousel + GSAP + Lenis
   ======================================== */

// --- Real viewport height for iOS (address bar) ---
function setVh() {
  document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px');
}
setVh();
window.addEventListener('resize', setVh);

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
// AVIS GOOGLE — note + avis à jour via /api/reviews
// En cas d'échec (API non configurée, réseau), les valeurs
// statiques du HTML restent affichées.
// ==========================================
(async () => {
  function esc(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  // "Jean Dupont" → "Jean D." (style des cartes du site)
  function shortName(name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length < 2) return parts[0];
    return parts[0] + ' ' + parts[1][0].toUpperCase() + '.';
  }

  try {
    const res = await fetch('/api/reviews');
    if (!res.ok) return;
    const data = await res.json();
    if (!data.rating || !data.count) return;

    const noteFr = String(data.rating).replace('.', ',');
    const stars = document.getElementById('avis-stars');
    const fill = document.getElementById('avis-stars-fill');
    const note = document.getElementById('avis-note');
    if (fill) fill.style.width = (data.rating / 5) * 100 + '%';
    if (stars) stars.setAttribute('aria-label', noteFr + ' sur 5');
    if (note) note.textContent = noteFr + ' sur Google · ' + data.count + ' avis';

    // 3 avis 5★ récents, longueur raisonnable pour tenir dans les cartes
    const good = (data.reviews || []).filter(
      (r) => r.rating === 5 && r.text && r.text.length >= 40 && r.text.length <= 280
    );
    const cards = document.getElementById('avis-cards');
    if (cards && good.length >= 3) {
      cards.innerHTML = good
        .slice(0, 3)
        .map(
          (r) => `
        <blockquote class="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
          <div class="flex items-center gap-0.5 text-dore text-xs mb-3">★★★★★</div>
          <p class="text-white/40 text-sm leading-relaxed italic mb-4">"${esc(r.text)}"</p>
          <footer class="text-white/25 text-xs">— ${esc(shortName(r.author))}</footer>
        </blockquote>`
        )
        .join('');
    }
  } catch (e) {
    // silencieux : le contenu statique reste en place
  }
})();

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

