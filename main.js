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
  start: 'bottom top+=50',
  onEnterBack: () => navLogo.style.opacity = '0',
  onLeave: () => navLogo.style.opacity = '1',
});

// --- Mobile menu ---
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

menuToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  mobileMenu.classList.toggle('hidden');
});
mobileMenu.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    mobileMenu.classList.add('hidden');
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

// ==========================================
// PANIER — Cart system
// ==========================================
const cart = {};

const cartFloat = document.getElementById('cart-float');
const cartBadge = document.getElementById('cart-badge');
const cartOverlay = document.getElementById('cart-overlay');
const cartDrawer = document.getElementById('cart-drawer');
const cartClose = document.getElementById('cart-close');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartCheckout = document.getElementById('cart-checkout');

// Format price for display
function formatPrice(n) {
  return n.toFixed(2).replace('.', ',') + ' €';
}

// Update the floating badge + drawer contents
function updateCart() {
  const totalQty = Object.values(cart).reduce((s, i) => s + i.qty, 0);
  const totalPrice = Object.values(cart).reduce((s, i) => s + i.qty * i.unitPrice, 0);

  // Floating button visibility
  if (totalQty > 0) {
    cartFloat.style.transform = 'scale(1)';
    cartFloat.style.opacity = '1';
  } else {
    cartFloat.style.transform = 'scale(0)';
    cartFloat.style.opacity = '0';
  }
  cartBadge.textContent = totalQty;

  // Total
  cartTotal.textContent = formatPrice(totalPrice);
  cartCheckout.disabled = totalQty === 0;

  // Items list
  cartItems.innerHTML = '';
  if (totalQty === 0) {
    cartItems.innerHTML = '<p class="text-chocolat/40 text-center py-8 text-base">Votre panier est vide</p>';
    return;
  }

  Object.entries(cart).forEach(([priceId, item]) => {
    if (item.qty <= 0) return;
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between py-3 border-b border-dore/10';
    row.innerHTML = `
      <div class="flex-1 mr-4">
        <p class="font-serif italic text-base font-semibold text-chocolat">${item.name}</p>
        <p class="text-chocolat/40 text-sm">${formatPrice(item.unitPrice)} / pièce</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="drawer-minus w-8 h-8 rounded-full border border-chocolat/20 text-chocolat flex items-center justify-center hover:bg-chocolat hover:text-creme transition-colors" data-price="${priceId}">−</button>
        <span class="w-6 text-center font-semibold text-chocolat">${item.qty}</span>
        <button class="drawer-plus w-8 h-8 rounded-full bg-chocolat text-creme flex items-center justify-center hover:bg-dore transition-colors" data-price="${priceId}">+</button>
      </div>
      <p class="w-20 text-right font-semibold text-chocolat">${formatPrice(item.qty * item.unitPrice)}</p>
    `;
    cartItems.appendChild(row);
  });

  // Drawer +/- buttons
  cartItems.querySelectorAll('.drawer-minus').forEach(btn => {
    btn.addEventListener('click', () => changeQty(btn.dataset.price, -1));
  });
  cartItems.querySelectorAll('.drawer-plus').forEach(btn => {
    btn.addEventListener('click', () => changeQty(btn.dataset.price, 1));
  });
}

// Change quantity for a product
function changeQty(priceId, delta) {
  if (!cart[priceId]) return;
  cart[priceId].qty = Math.max(0, Math.min(10, cart[priceId].qty + delta));
  if (cart[priceId].qty === 0) delete cart[priceId];

  // Sync the product card qty display
  const card = document.querySelector(`[data-price="${priceId}"]`);
  if (card) {
    const qtyEl = card.querySelector('.cart-qty');
    if (qtyEl) qtyEl.textContent = cart[priceId] ? cart[priceId].qty : 0;
  }

  updateCart();
}

// Product card +/- buttons
document.querySelectorAll('.product-card[data-price]').forEach(card => {
  const priceId = card.dataset.price;
  const name = card.dataset.name;
  const unitPrice = parseFloat(card.dataset.unitPrice);
  const qtyEl = card.querySelector('.cart-qty');
  const minusBtn = card.querySelector('.cart-minus');
  const plusBtn = card.querySelector('.cart-plus');

  plusBtn.addEventListener('click', () => {
    if (!cart[priceId]) cart[priceId] = { name, unitPrice, qty: 0 };
    cart[priceId].qty = Math.min(10, cart[priceId].qty + 1);
    qtyEl.textContent = cart[priceId].qty;
    updateCart();
  });

  minusBtn.addEventListener('click', () => {
    if (!cart[priceId]) return;
    cart[priceId].qty = Math.max(0, cart[priceId].qty - 1);
    if (cart[priceId].qty === 0) delete cart[priceId];
    qtyEl.textContent = cart[priceId] ? cart[priceId].qty : 0;
    updateCart();
  });
});

// Open/close drawer
function openDrawer() {
  cartOverlay.classList.remove('pointer-events-none');
  cartOverlay.style.opacity = '1';
  cartDrawer.style.transform = 'translateX(0)';
  lenis.stop();
}

function closeDrawer() {
  cartOverlay.style.opacity = '0';
  cartOverlay.classList.add('pointer-events-none');
  cartDrawer.style.transform = 'translateX(100%)';
  lenis.start();
}

cartFloat.addEventListener('click', openDrawer);
cartClose.addEventListener('click', closeDrawer);
cartOverlay.addEventListener('click', closeDrawer);

// Checkout — call API
cartCheckout.addEventListener('click', async () => {
  const items = Object.entries(cart)
    .filter(([, item]) => item.qty > 0)
    .map(([price, item]) => ({ price, quantity: item.qty }));

  if (items.length === 0) return;

  cartCheckout.disabled = true;
  cartCheckout.textContent = 'Redirection…';

  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error(data.error || 'Erreur inconnue');
    }
  } catch (err) {
    alert('Erreur lors du paiement. Veuillez réessayer.');
    cartCheckout.disabled = false;
    cartCheckout.textContent = 'Payer ma commande';
  }
});

// Init
updateCart();
