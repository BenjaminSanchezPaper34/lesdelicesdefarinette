const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Prix valides (sécurité : on n'accepte que ces IDs)
const VALID_PRICES = new Set([
  'price_1TrhzQKNVCaTtYJEVOT02CcC', // Entremet Fraise 6.90€
  'price_1TrhzRKNVCaTtYJEHGmVByrS', // Entremet Mangue 6.90€
  'price_1TrhzSKNVCaTtYJET45baNyG', // Entremet Citron 6.90€
  'price_1TrhzTKNVCaTtYJENMhmYplX', // Entremet Pistache 6.90€
  'price_1TrhzVKNVCaTtYJEo5BIaPwn', // Entremet Pécan 6.90€ (ex Noix de Cajou)
  'price_1TrhzWKNVCaTtYJEdg8rxaEP', // Entremet Pêche 6.90€
  'price_1TrhzXKNVCaTtYJElbd3UcBW', // Entremet Arachide 6.90€
  'price_1TrhzZKNVCaTtYJEbBTavLs2', // Entremet Vanille 6.90€
  'price_1TrhzaKNVCaTtYJEf36J9rII', // Entremet Pomme 6.90€
  'price_1TrhzbKNVCaTtYJE3v3VCZkK', // Entremet Framboise 6.90€
  'price_1TrhzdKNVCaTtYJEMuUHMuFv', // Entremet Coco 6.90€
  'price_1TrhzeKNVCaTtYJEn2a87Po0', // Entremet Cabosse 6.90€
  'price_1TrhzfKNVCaTtYJEqZB8OYh3', // Entremet Myrtille 6.90€
  'price_1TrhzhKNVCaTtYJEVwlmRXtR', // Entremet Tulipe 6.90€
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
      success_url: 'https://lesdelicesdefarinette.fr/commander.html?success=true',
      cancel_url: 'https://lesdelicesdefarinette.fr/commander.html',
      locale: 'fr',
      // Click & Collect : infos de retrait demandées sur la page de paiement
      phone_number_collection: { enabled: true },
      custom_fields: [
        {
          key: 'nom_retrait',
          label: { type: 'custom', custom: 'Nom pour le retrait' },
          type: 'text',
        },
        {
          key: 'date_retrait',
          label: { type: 'custom', custom: 'Date de retrait (commander la veille avant 18h)' },
          type: 'text',
        },
        {
          key: 'creneau_retrait',
          label: { type: 'custom', custom: 'Créneau de retrait' },
          type: 'dropdown',
          dropdown: {
            options: [
              { label: 'Matin (9h - 12h)', value: 'matin' },
              { label: 'Après-midi (14h - 19h)', value: 'apresmidi' },
            ],
          },
        },
      ],
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err.message, err.type || '');
    return res.status(500).json({ error: 'Erreur lors de la création du paiement' });
  }
};
