import { CONDITIONS, createListing, estimateValue, getCollections, setCollection } from './market'
import { shuffle } from './shuffle'
import { KEYS, readJSON, writeJSON } from './storage'

// Coleção enxuta de quem só compra (Ilana, admin, contas novas).
const STARTER_COLLECTION_SIZE = 10

// Vendedores carregam estoque: 7 vendedores × 14 anúncios = 98 cartas no
// mercado. Espalhar entre muitos donos é proposital — com tudo na mão de um ou
// dois usuários, logar como um deles transformaria boa parte da vitrine em
// "seu anúncio", que não dá para comprar.
const SELLER_COLLECTION_SIZE = 18
const LISTINGS_PER_SELLER = 14

const SEEDED_FLAG = 'pokedex:marketSeeded'
const VERSION_KEY = 'pokedex:dataVersion'

// Todo anúncio do seed aceita PokeCoins: uns só vendem, outros também aceitam
// troca. Nenhum é só-troca, para não existir carta na vitrine que não dê para
// comprar — os de tipo "both" é que abastecem a seção de trocas.
const LISTING_KINDS = ['sale', 'sale', 'both']

// Suba esta versão sempre que o formato das chaves mudar. Como não há migração
// (projeto acadêmico, dados descartáveis), a troca de versão zera tudo em vez
// de deixar o app lendo um schema antigo e quebrando.
const DATA_VERSION = 5

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
    name: 'Rafael Martins',
    email: 'rafael@pokedex.com',
    password: '123456',
    role: 'user',
    balance: 3000,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-2',
    name: 'Ilana Malmann',
    email: 'ilana@pokedex.com',
    password: '123456',
    role: 'user',
    balance: 1000,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-3',
    name: 'Bruno Sato',
    email: 'bruno@pokedex.com',
    password: '123456',
    role: 'user',
    balance: 2000,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-4',
    name: 'Carla Nunes',
    email: 'carla@pokedex.com',
    password: '123456',
    role: 'user',
    balance: 2000,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-5',
    name: 'Diego Prado',
    email: 'diego@pokedex.com',
    password: '123456',
    role: 'user',
    balance: 2000,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-6',
    name: 'Elisa Rocha',
    email: 'elisa@pokedex.com',
    password: '123456',
    role: 'user',
    balance: 2000,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-7',
    name: 'Felipe Antunes',
    email: 'felipe@pokedex.com',
    password: '123456',
    role: 'user',
    balance: 2000,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-8',
    name: 'Gabriela Lima',
    email: 'gabriela@pokedex.com',
    password: '123456',
    role: 'user',
    balance: 2000,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
]

// Quem abastece o mercado. Ilana fica DE FORA de propósito: ela é a persona
// compradora, então começa com coleção pequena e nenhum anúncio — é o que
// diferencia a jornada dela da do Rafael, que é a persona vendedora.
const SELLER_IDS = new Set(['user-1', 'user-3', 'user-4', 'user-5', 'user-6', 'user-7', 'user-8'])

// Roda antes do primeiro render: garante que as chaves existam e que os usuários
// fake estejam lá. A coleção de cada um depende do catálogo da TCG API, então é
// semeada depois, por ensureMarketSeed.
export function ensureSeed() {
  if (readJSON(VERSION_KEY, null) !== DATA_VERSION) {
    // Preserva o cache da TCG API: ele é só espelho da API, não muda de formato
    // e refazer o fetch custa caro (rate limit).
    for (const key of Object.values(KEYS)) {
      if (key !== KEYS.cardsCache) localStorage.removeItem(key)
    }
    localStorage.removeItem(SEEDED_FLAG)
    writeJSON(VERSION_KEY, DATA_VERSION)
  }

  if (readJSON(KEYS.users, null) === null) writeJSON(KEYS.users, SEED_USERS)
  if (readJSON(KEYS.collections, null) === null) writeJSON(KEYS.collections, {})
  if (readJSON(KEYS.listings, null) === null) writeJSON(KEYS.listings, [])
  if (readJSON(KEYS.transactions, null) === null) writeJSON(KEYS.transactions, [])
  if (readJSON(KEYS.cart, null) === null) writeJSON(KEYS.cart, [])
  if (readJSON(KEYS.session, null) === null) writeJSON(KEYS.session, { userId: null })
}

function randomCondition() {
  return CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)]
}

function buildCollection(cards, size) {
  return shuffle(cards)
    .slice(0, size)
    .map((card) => ({
      id: crypto.randomUUID(),
      cardId: card.id,
      condition: randomCondition(),
      acquiredAt: new Date().toISOString(),
    }))
}

// Dá uma coleção inicial a todo usuário que ainda não tem uma (inclui quem
// acabou de se registrar) e, na primeira vez, publica anúncios dos usuários fake
// para o mercado não nascer vazio.
export function ensureMarketSeed(cards) {
  if (cards.length === 0) return

  const users = readJSON(KEYS.users, [])
  const collections = getCollections()

  for (const user of users) {
    if (collections[user.id]) continue
    const size = SELLER_IDS.has(user.id) ? SELLER_COLLECTION_SIZE : STARTER_COLLECTION_SIZE
    setCollection(user.id, buildCollection(cards, size))
  }

  if (readJSON(SEEDED_FLAG, false)) return
  writeJSON(SEEDED_FLAG, true)

  const cardsById = new Map(cards.map((card) => [card.id, card]))

  for (const user of users.filter((u) => SELLER_IDS.has(u.id))) {
    for (const item of getCollections()[user.id].slice(0, LISTINGS_PER_SELLER)) {
      const card = cardsById.get(item.cardId)
      if (!card) continue

      const type = LISTING_KINDS[Math.floor(Math.random() * LISTING_KINDS.length)]
      createListing({
        ownerId: user.id,
        itemId: item.id,
        cardId: item.cardId,
        condition: item.condition,
        type,
        price: type === 'trade' ? null : estimateValue(card, item.condition),
      })
    }
  }
}
