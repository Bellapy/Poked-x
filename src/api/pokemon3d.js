// Cliente da Pokemon3D API (github.com/Pokemon-3D-api/assets) — modelos .glb
// usados no banner 3D da home. Arquivos vivem em models/opt/<categoria>/<n. da
// pokédex nacional>.glb (ex.: models/opt/regular/25.glb para o Pikachu).
// Cobertura é parcial (~971/1028 na categoria "regular"), por isso todo uso
// passa por modelExists antes de tentar carregar — ver TECNICO.md.

const BASE_URL = 'https://raw.githubusercontent.com/Pokemon-3D-api/assets/main/models/opt'

// Artwork oficial em alta resolução, por número da pokédex nacional — usado
// como fundo desfocado do banner. Fonte separada do modelo 3D (sempre existe
// para qualquer Pokémon, ao contrário dos modelos).
const ARTWORK_BASE_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork'

const existenceCache = new Map()

export function getModelUrl(dexId, category = 'regular') {
  return `${BASE_URL}/${category}/${dexId}.glb`
}

export function getArtworkUrl(dexId) {
  return `${ARTWORK_BASE_URL}/${dexId}.png`
}

export async function modelExists(dexId, category = 'regular') {
  const cacheKey = `${category}/${dexId}`
  if (existenceCache.has(cacheKey)) return existenceCache.get(cacheKey)

  const promise = fetch(getModelUrl(dexId, category), { method: 'HEAD' })
    .then((res) => res.ok)
    .catch(() => false)

  existenceCache.set(cacheKey, promise)
  return promise
}
