// Cliente da Pokémon TCG API (pokemontcg.io) com cache em localStorage.
// Sem API key, o servidor deles retorna 500/502 esporadicamente mesmo sob uso
// leve — por isso todo fetch passa por retry. Uma key gratuita (variável
// VITE_POKEMON_TCG_API_KEY) reduz bastante essas falhas — ver TECNICO.md.

import { KEYS, readJSON, writeJSON } from '../lib/storage'

const BASE_URL = 'https://api.pokemontcg.io/v2'

// Só os campos que o app realmente consome. O payload padrão traz ataques,
// regras, legalidades, textos de sabor e histórico de preços de cada carta —
// peso morto que atrasa o primeiro carregamento em conexão lenta.
const FIELDS = ['id', 'name', 'rarity', 'types', 'number', 'images', 'set', 'cardmarket', 'tcgplayer']
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 // 24h
const API_KEY = import.meta.env.VITE_POKEMON_TCG_API_KEY

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

  const res = await fetchWithRetry(
    `${BASE_URL}/cards?pageSize=${pageSize}&select=${FIELDS.join(',')}`,
  )
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

