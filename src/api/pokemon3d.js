// Cliente da Pokemon3D API (github.com/Pokemon-3D-api/assets) — modelos .glb
// usados no banner 3D da home. Ver TECNICO.md para a estratégia de fallback.

const BASE_URL = 'https://raw.githubusercontent.com/Pokemon-3D-api/assets/main'

// Nome do Pokémon em minúsculas (ex.: "pikachu") -> URL do modelo .glb.
// Ajustar o caminho conforme a estrutura real do repositório ao integrar.
export function getModelUrl(pokemonName) {
  return `${BASE_URL}/models/${pokemonName.toLowerCase()}.glb`
}

export async function modelExists(pokemonName) {
  try {
    const res = await fetch(getModelUrl(pokemonName), { method: 'HEAD' })
    return res.ok
  } catch {
    return false
  }
}
