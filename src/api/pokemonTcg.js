// Cliente da Pokémon TCG API (pokemontcg.io) com cache em localStorage.
// Sem API key, o servidor deles retorna 500/502 esporadicamente mesmo sob uso
// leve — por isso todo fetch passa por retry. Uma key gratuita (variável
// VITE_POKEMON_TCG_API_KEY) reduz bastante essas falhas — ver TECNICO.md.

import { KEYS, readJSON, writeJSON } from '../lib/storage'

const BASE_URL = 'https://api.pokemontcg.io/v2'
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 // 24h
const API_KEY = import.meta.env.VITE_POKEMON_TCG_API_KEY

// Rarezas consideradas "comuns" — qualquer outra conta como rara para os destaques.
const COMMON_RARITIES = new Set(['Common', 'Uncommon'])

// Rarezas de topo — ganham o brilho holográfico especial da vitrine (é o
// "efeito raro de verdade", por isso fica restrito a poucas rarezas).
const ULTRA_KEYWORDS = ['secret', 'rainbow', 'ultra', 'hyper', 'amazing', 'gold', 'shiny']

async function fetchWithRetry(url, { retries = 2, delayMs = 500 } = {}) {
  const headers = API_KEY ? { 'X-Api-Key': API_KEY } : undefined

  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers })
    if (res.ok) return res
    if (attempt >= retries) return res
    await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)))
  }
}

export async function getCards({ pageSize = 250 } = {}) {
  const cache = readJSON(KEYS.cardsCache, null)
  const isFresh = cache && Date.now() - new Date(cache.fetchedAt).getTime() < CACHE_TTL_MS

  if (isFresh) return cache.cards

  const res = await fetchWithRetry(`${BASE_URL}/cards?pageSize=${pageSize}`)
  if (!res.ok) {
    // Se a API falhar e ainda houver cache (mesmo expirado), usa como fallback.
    if (cache) return cache.cards
    throw new Error(`Falha ao buscar cartas: ${res.status}`)
  }

  const data = await res.json()
  const cards = data.data ?? []

  writeJSON(KEYS.cardsCache, { fetchedAt: new Date().toISOString(), cards })
  return cards
}

export async function getCardById(id) {
  const cached = readJSON(KEYS.cardsCache, null)
  const fromCache = cached?.cards.find((c) => c.id === id)
  if (fromCache) return fromCache

  const res = await fetchWithRetry(`${BASE_URL}/cards/${id}`)
  if (!res.ok) throw new Error(`Carta não encontrada: ${id}`)
  const data = await res.json()
  return data.data
}

export function isRare(card) {
  return !COMMON_RARITIES.has(card.rarity)
}

// Vitrine da carta na home: cor do brilho por trás dela, por raridade.
export function getRarityTier(card) {
  const rarity = card.rarity ?? ''
  if (COMMON_RARITIES.has(rarity)) return 'common'
  const normalized = rarity.toLowerCase()
  if (ULTRA_KEYWORDS.some((keyword) => normalized.includes(keyword))) return 'ultra'
  return 'rare'
}
