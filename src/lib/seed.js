import { KEYS, readJSON, writeJSON } from './storage'

const SEED_USERS = [
  {
    id: 'admin-1',
    name: 'Admin',
    email: 'admin@pokedex.com',
    password: 'admin123',
    role: 'admin',
    balance: 5000,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-1',
    name: 'Ash',
    email: 'ash@pokedex.com',
    password: '123456',
    role: 'user',
    balance: 1000,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-2',
    name: 'Misty',
    email: 'misty@pokedex.com',
    password: '123456',
    role: 'user',
    balance: 1000,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
]

// Garante que os usuários fake existam antes de qualquer outra coisa rodar.
// A coleção inicial de cada um é seedada depois, quando o cache de cartas
// da Pokémon TCG API estiver disponível (ver src/api/pokemonTcg.js).
export function ensureSeed() {
  const users = readJSON(KEYS.users, null)
  if (!users) {
    writeJSON(KEYS.users, SEED_USERS)
  }

  if (readJSON(KEYS.collections, null) === null) writeJSON(KEYS.collections, {})
  if (readJSON(KEYS.listings, null) === null) writeJSON(KEYS.listings, [])
  if (readJSON(KEYS.transactions, null) === null) writeJSON(KEYS.transactions, [])
  if (readJSON(KEYS.cart, null) === null) writeJSON(KEYS.cart, [])
  if (readJSON(KEYS.session, null) === null) writeJSON(KEYS.session, { userId: null })
}
