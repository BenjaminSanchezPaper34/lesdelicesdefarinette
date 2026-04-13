const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Prix valides (sécurité : on n'accepte que ces IDs)
const VALID_PRICES = new Set([
  'price_1TLqK3KNVCaTtYJEYLSCyebI', // Entremet Fraise 8.50€
  'price_1TLqKQKNVCaTtYJEy4XN6scw', // Entremet Mangue 8.50€
  'price_1TLqKRKNVCaTtYJEhYUx8OmO', // Entremet Citron 8.50€
  'price_1TLqKSKNVCaTtYJE0geDcME2', // Entremet Pistache 8.50€
  'price_1TLqKTKNVCaTtYJEcD8l0bLp', // Ube Latte 5.50€
  'price_1TLqKUKNVCaTtYJEPaa3yycw', // Matcha Latte 5.50€
  'price_1TLqKVKNVCaTtYJEZ7KYKMoO', // Ice Latte 5.00€
  'price_1TLqKWKNVCaTtYJEbRZXuYcy', // Formule Classique 8.90€
  'price_1TLqKXKNVCaTtYJEJRpB4MFN', // Formule Gourmande 12.90€
]);

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Panier vide' });
    }

    // Valider chaque item
    const line_items = [];
    for (const item of items) {
      if (!VALID_PRICES.has(item.price)) {
        return res.status(400).json({ error: `Prix invalide: ${item.price}` });
      }
      const qty = Math.min(Math.max(Math.round(item.quantity), 1), 10);
      line_items.push({ price: item.price, quantity: qty });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: 'https://lesdelicesdefarinette.fr/#commander?success=true',
      cancel_url: 'https://lesdelicesdefarinette.fr/#commander',
      locale: 'fr',
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err.message, err.type || '');
    return res.status(500).json({ error: 'Erreur lors de la création du paiement' });
  }
};
