// Chaves e helpers de acesso ao localStorage. Ver TECNICO.md para o schema de cada chave.

export const KEYS = {
  users: 'pokedex:users',
  session: 'pokedex:session',
  collections: 'pokedex:collections',
  listings: 'pokedex:listings',
  transactions: 'pokedex:transactions',
  cardsCache: 'pokedex:cardsCache',
  cart: 'pokedex:cart',
}

export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}
