// Camada de domínio do marketplace: tudo que lê/escreve estado de negócio no
// localStorage passa por aqui. As páginas nunca mexem no storage diretamente.
//
// Desvio consciente do TECNICO.md: cada item de coleção ganha um `id` próprio e
// o anúncio referencia esse `itemId`. Sem isso, duas cópias da mesma carta no
// mesmo estado de conservação são indistinguíveis na hora de anunciar/transferir.

import { getRarityTier } from './cardRarity'
import { KEYS, readJSON, writeJSON } from './storage'

export const CONDITIONS = ['Nova', 'Seminova', 'Usada', 'Danificada']

// Um anúncio pode aceitar dinheiro, troca, ou os dois. Todo lugar que decide se
// dá para comprar ou propor troca passa por estes dois helpers — comparar com
// 'sale'/'trade' na mão é o que faria 'both' cair fora de um dos fluxos.
export const LISTING_TYPES = {
  sale: 'Venda',
  trade: 'Troca',
  both: 'Venda ou troca',
}

export const isForSale = (listing) => listing.type === 'sale' || listing.type === 'both'
export const isForTrade = (listing) => listing.type === 'trade' || listing.type === 'both'

const CONDITION_MULTIPLIER = { Nova: 1, Seminova: 0.85, Usada: 0.6, Danificada: 0.35 }
const RARITY_BASE = { common: 40, rare: 140, ultra: 420 }

// PokeCoins não têm lastro real; quando a API traz preço de mercado usamos ele
// numa escala 10x, senão caímos na raridade. O estado de conservação desconta.
export function estimateValue(card, condition = 'Nova') {
  const quoted =
    card?.cardmarket?.prices?.averageSellPrice ?? card?.tcgplayer?.prices?.holofoil?.market
  const base = quoted ? quoted * 10 : RARITY_BASE[getRarityTier(card)]
  return Math.max(10, Math.round(base * (CONDITION_MULTIPLIER[condition] ?? 1)))
}

// --- Usuários ---

export function getUsers() {
  return readJSON(KEYS.users, [])
}

export function getUser(id) {
  return getUsers().find((u) => u.id === id) ?? null
}

export function updateUser(id, patch) {
  const users = getUsers().map((u) => (u.id === id ? { ...u, ...patch } : u))
  writeJSON(KEYS.users, users)
}

export function adjustBalance(id, delta) {
  const user = getUser(id)
  if (!user) return
  updateUser(id, { balance: user.balance + delta })
}

// --- Coleções ---

export function getCollections() {
  return readJSON(KEYS.collections, {})
}

export function getCollection(userId) {
  return getCollections()[userId] ?? []
}

export function setCollection(userId, items) {
  writeJSON(KEYS.collections, { ...getCollections(), [userId]: items })
}

export function addToCollection(userId, { cardId, condition }) {
  const entry = {
    id: crypto.randomUUID(),
    cardId,
    condition,
    acquiredAt: new Date().toISOString(),
  }
  setCollection(userId, [...getCollection(userId), entry])
  return entry
}

export function removeFromCollection(userId, itemId) {
  setCollection(
    userId,
    getCollection(userId).filter((item) => item.id !== itemId),
  )
}

// --- Anúncios ---

export function getListings() {
  return readJSON(KEYS.listings, [])
}

export function getListing(id) {
  return getListings().find((l) => l.id === id) ?? null
}

export function getListingByItem(itemId) {
  return getListings().find((l) => l.itemId === itemId) ?? null
}

export function createListing({ ownerId, itemId, cardId, condition, type, price }) {
  if (getListingByItem(itemId)) {
    return { ok: false, error: 'Esta carta já está anunciada.' }
  }

  const listing = {
    id: crypto.randomUUID(),
    ownerId,
    itemId,
    cardId,
    condition,
    type,
    price: type === 'trade' ? null : price,
    createdAt: new Date().toISOString(),
  }

  // O vendedor confirma a conservação ao anunciar; o item na coleção precisa
  // acompanhar, senão o comprador recebe um estado diferente do anunciado.
  setCollection(
    ownerId,
    getCollection(ownerId).map((i) => (i.id === itemId ? { ...i, condition } : i)),
  )

  writeJSON(KEYS.listings, [...getListings(), listing])
  return { ok: true, listing }
}

export function updateListing(id, patch) {
  writeJSON(
    KEYS.listings,
    getListings().map((l) => (l.id === id ? { ...l, ...patch } : l)),
  )
}

export function removeListing(id) {
  writeJSON(
    KEYS.listings,
    getListings().filter((l) => l.id !== id),
  )
}

// --- Histórico ---

export function getTransactions() {
  return readJSON(KEYS.transactions, [])
}

export function getUserTransactions(userId) {
  return getTransactions()
    .filter((t) => t.userId === userId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

function addTransaction(tx) {
  writeJSON(KEYS.transactions, [
    ...getTransactions(),
    { id: crypto.randomUUID(), status: 'completed', date: new Date().toISOString(), ...tx },
  ])
}

// --- Operações ---

// Move um item da coleção de um usuário para a de outro, preservando a carta e
// o estado de conservação mas gerando um id novo no destino.
function transferItem(fromUserId, toUserId, itemId) {
  const item = getCollection(fromUserId).find((i) => i.id === itemId)
  if (!item) return null

  removeFromCollection(fromUserId, itemId)
  return addToCollection(toUserId, { cardId: item.cardId, condition: item.condition })
}

export function buyListing({ buyerId, listingId }) {
  const listing = getListing(listingId)
  if (!listing) return { ok: false, error: 'Anúncio não está mais disponível.' }
  if (!isForSale(listing)) return { ok: false, error: 'Esta carta não está à venda.' }
  if (listing.ownerId === buyerId) return { ok: false, error: 'Você não pode comprar sua própria carta.' }

  const buyer = getUser(buyerId)
  if (!buyer) return { ok: false, error: 'Comprador não encontrado.' }
  if (buyer.balance < listing.price) return { ok: false, error: 'Saldo insuficiente em PokeCoins.' }

  if (!transferItem(listing.ownerId, buyerId, listing.itemId)) {
    return { ok: false, error: 'O vendedor não possui mais esta carta.' }
  }

  adjustBalance(buyerId, -listing.price)
  adjustBalance(listing.ownerId, listing.price)
  removeListing(listing.id)

  addTransaction({
    type: 'purchase',
    userId: buyerId,
    counterpartyId: listing.ownerId,
    cards: [listing.cardId],
    value: listing.price,
  })
  addTransaction({
    type: 'sale',
    userId: listing.ownerId,
    counterpartyId: buyerId,
    cards: [listing.cardId],
    value: listing.price,
  })

  return { ok: true }
}

// Regra automática de aceite: não há uma pessoa real do outro lado, então a
// troca fecha quando o valor somado do que foi ofertado cobre a carta desejada.
export function evaluateTrade({ offeredValue, targetValue }) {
  return offeredValue >= targetValue
}

export function executeTrade({ proposerId, listingId, offeredItemIds, offeredValue, targetValue }) {
  const listing = getListing(listingId)
  if (!listing) return { ok: false, error: 'Anúncio não está mais disponível.' }
  if (!isForTrade(listing)) {
    return { ok: false, error: 'Esta carta não está aberta para troca.' }
  }
  if (listing.ownerId === proposerId) {
    return { ok: false, error: 'Você não pode trocar com você mesmo.' }
  }
  if (offeredItemIds.length === 0) {
    return { ok: false, error: 'Ofereça ao menos uma carta da sua coleção.' }
  }
  if (!evaluateTrade({ offeredValue, targetValue })) {
    return {
      ok: false,
      error: `Proposta recusada: sua oferta vale ${offeredValue} PokeCoins e a carta desejada vale ${targetValue}.`,
    }
  }

  // Valida tudo antes de mover qualquer carta — uma troca parcial deixaria as
  // duas coleções inconsistentes e não há transação para desfazer.
  const proposerItems = getCollection(proposerId)
  const offered = offeredItemIds.map((itemId) => proposerItems.find((i) => i.id === itemId))
  if (offered.some((item) => !item)) {
    return { ok: false, error: 'Alguma das cartas ofertadas não está mais na sua coleção.' }
  }
  if (!getCollection(listing.ownerId).some((i) => i.id === listing.itemId)) {
    return { ok: false, error: 'O dono não possui mais esta carta.' }
  }

  for (const itemId of offeredItemIds) transferItem(proposerId, listing.ownerId, itemId)
  transferItem(listing.ownerId, proposerId, listing.itemId)

  const offeredCardIds = offered.map((item) => item.cardId)

  removeListing(listing.id)

  addTransaction({
    type: 'trade_sent',
    userId: proposerId,
    counterpartyId: listing.ownerId,
    cards: offeredCardIds,
    value: offeredValue,
  })
  addTransaction({
    type: 'trade_received',
    userId: listing.ownerId,
    counterpartyId: proposerId,
    cards: [listing.cardId],
    value: targetValue,
  })

  return { ok: true }
}
