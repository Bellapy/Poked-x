// Classificação de raridade a partir do payload da carta. É lógica pura sobre o
// dado, sem relação com o transporte HTTP — por isso vive aqui e não no cliente
// da API.

// Rarezas consideradas "comuns" — qualquer outra conta como rara para os destaques.
const COMMON_RARITIES = new Set(['Common', 'Uncommon'])

// Rarezas de topo — ganham o brilho holográfico especial da vitrine (é o
// "efeito raro de verdade", por isso fica restrito a poucas rarezas).
const ULTRA_KEYWORDS = ['secret', 'rainbow', 'ultra', 'hyper', 'amazing', 'gold', 'shiny']

export function isRare(card) {
  return !COMMON_RARITIES.has(card.rarity)
}

export function getRarityTier(card) {
  const rarity = card.rarity ?? ''
  if (COMMON_RARITIES.has(rarity)) return 'common'
  const normalized = rarity.toLowerCase()
  if (ULTRA_KEYWORDS.some((keyword) => normalized.includes(keyword))) return 'ultra'
  return 'rare'
}
