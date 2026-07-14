// Avis Google à jour via l'API Places officielle.
// Nécessite GOOGLE_PLACES_API_KEY (et optionnellement GOOGLE_PLACE_ID) dans Vercel.
// Réponse mise en cache par le CDN Vercel 6h : le quota gratuit Google suffit largement.

const SEARCH_QUERY = 'Les Délices de Farinette Vias Plage';

// Résolu une fois puis mémorisé le temps de vie de la lambda
let cachedPlaceId = null;

async function resolvePlaceId(apiKey) {
  if (process.env.GOOGLE_PLACE_ID) return process.env.GOOGLE_PLACE_ID;
  if (cachedPlaceId) return cachedPlaceId;

  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.id',
    },
    body: JSON.stringify({ textQuery: SEARCH_QUERY }),
  });
  const data = await res.json();
  cachedPlaceId = data.places && data.places[0] && data.places[0].id;
  if (!cachedPlaceId) throw new Error('Établissement introuvable via searchText');
  return cachedPlaceId;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    // Clé absente : le front garde les valeurs statiques du HTML
    return res.status(503).json({ error: 'API non configurée' });
  }

  try {
    const placeId = await resolvePlaceId(apiKey);

    const r = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?languageCode=fr`,
      {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'rating,userRatingCount,reviews',
        },
      }
    );
    const place = await r.json();
    if (!r.ok) throw new Error(place.error ? place.error.message : 'Erreur Places API');

    const reviews = (place.reviews || []).map((rev) => ({
      author: rev.authorAttribution ? rev.authorAttribution.displayName : 'Client Google',
      rating: rev.rating,
      text: rev.text ? rev.text.text : '',
      relativeTime: rev.relativePublishTimeDescription || '',
    }));

    // Cache CDN 6h + service de l'ancienne version pendant revalidation
    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400');
    return res.status(200).json({
      rating: place.rating,
      count: place.userRatingCount,
      reviews,
    });
  } catch (err) {
    console.error('Reviews API error:', err.message);
    return res.status(500).json({ error: 'Impossible de récupérer les avis' });
  }
};
