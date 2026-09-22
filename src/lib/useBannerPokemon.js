import { getArtworkUrl } from '../api/pokemon3d'

// Elenco fixo do banner: Pokémon famosos e visualmente marcantes. Antes a lista
// saía das cartas em destaque, o que trazia Pokémon obscuros e modelos feios.
// Os dados da ficha ficam aqui, escritos à mão, em vez de virem de uma API: são
// só 11 Pokémon fixos, e assim o texto sai em português e o banner não depende
// de mais uma requisição de rede para renderizar.
const BANNER_POKEMON = [
  {
    dexId: 6,
    name: 'Charizard',
    types: ['Fogo', 'Voador'],
    height: '1,7 m',
    weight: '90,5 kg',
    blurb: 'Cospe um fogo tão quente que é capaz de derreter pedra.',
  },
  {
    dexId: 9,
    name: 'Blastoise',
    types: ['Água'],
    height: '1,6 m',
    weight: '85,5 kg',
    blurb: 'Os canhões nas costas disparam jatos de água com pontaria certeira.',
  },
  {
    dexId: 3,
    name: 'Venusaur',
    types: ['Planta', 'Venenoso'],
    height: '2,0 m',
    weight: '100,0 kg',
    blurb: 'A flor nas costas solta um aroma que acalma quem está por perto.',
  },
  {
    dexId: 150,
    name: 'Mewtwo',
    types: ['Psíquico'],
    height: '2,0 m',
    weight: '122,0 kg',
    blurb: 'Criado em laboratório a partir do DNA de Mew, com poder mental brutal.',
  },
  {
    dexId: 249,
    name: 'Lugia',
    types: ['Psíquico', 'Voador'],
    height: '5,2 m',
    weight: '216,0 kg',
    blurb: 'Guardião dos mares. Dizem que bater suas asas provoca tempestades.',
  },
  {
    dexId: 94,
    name: 'Gengar',
    types: ['Fantasma', 'Venenoso'],
    height: '1,5 m',
    weight: '40,5 kg',
    blurb: 'Nas noites de lua cheia, gosta de imitar a sombra das pessoas.',
  },
  {
    dexId: 149,
    name: 'Dragonite',
    types: ['Dragão', 'Voador'],
    height: '2,2 m',
    weight: '210,0 kg',
    blurb: 'Dá a volta no mundo em apenas dezesseis horas de voo.',
  },
  {
    dexId: 36,
    name: 'Clefable',
    types: ['Fada'],
    height: '1,3 m',
    weight: '40,0 kg',
    blurb: 'Audição tão apurada que escuta um alfinete cair a um quilômetro.',
  },
  {
    dexId: 445,
    name: 'Garchomp',
    types: ['Dragão', 'Terrestre'],
    height: '1,9 m',
    weight: '95,0 kg',
    blurb: 'Voa na velocidade de um jato; as escamas cortam o ar sem atrito.',
  },
  {
    dexId: 393,
    name: 'Piplup',
    types: ['Água'],
    height: '0,4 m',
    weight: '5,2 kg',
    blurb: 'Orgulhoso demais para aceitar comida na mão do treinador.',
  },
  {
    dexId: 658,
    name: 'Greninja',
    types: ['Água', 'Sombrio'],
    height: '1,5 m',
    weight: '40,0 kg',
    blurb: 'Move-se tão rápido que confunde o oponente com clones de água.',
  },
]

// Os 11 modelos deste elenco foram conferidos manualmente, então o banner não
// gasta mais uma rodada de requisições HEAD confirmando que cada .glb existe --
// eram 11 idas à rede bloqueando o banner antes dele sequer aparecer. Se algum
// modelo cair, o ErrorBoundary do ator remove aquele Pokémon sem quebrar o loop.
const SLIDES = BANNER_POKEMON.map((pokemon) => ({
  ...pokemon,
  artworkUrl: getArtworkUrl(pokemon.dexId),
}))

export function useBannerPokemon() {
  return { slides: SLIDES, status: 'ready' }
}
