// Cliente da Pokémon TCG API (pokemontcg.io) com cache em localStorage.
// Sem API key funciona para volume baixo de requisições — ver TECNICO.md.

import { KEYS, readJSON, writeJSON } from '../lib/storage'

const BASE_URL = 'https://api.pokemontcg.io/v2'
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 // 24h

export async function getCards({ pageSize = 60 } = {}) {
  const cache = readJSON(KEYS.cardsCache, null)
  const isFresh = cache && Date.now() - new Date(cache.fetchedAt).getTime() < CACHE_TTL_MS

  if (isFresh) return cache.cards

  const res = await fetch(`${BASE_URL}/cards?pageSize=${pageSize}`)
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
