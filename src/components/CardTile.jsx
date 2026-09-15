import { Link } from 'react-router-dom'

export default function CardTile({ card }) {
  return (
    <Link
      to={`/carta/${card.id}`}
      className="group flex flex-col items-center rounded-xl bg-white/5 p-3 transition hover:bg-white/10"
    >
      <img
        src={card.images.small}
        alt={card.name}
        className="w-full rounded-lg transition duration-300 group-hover:-translate-y-1 group-hover:scale-105"
        loading="lazy"
      />
      <p className="mt-2 text-sm font-medium text-center line-clamp-1">{card.name}</p>
      <p className="text-xs text-white/40">{card.rarity ?? 'Sem raridade'}</p>
    </Link>
  )
}
