import { useParams } from 'react-router-dom'

export default function CardDetails() {
  const { id } = useParams()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Detalhes da carta</h1>
      <p className="text-white/50 mt-2">Carta #{id} — em construção.</p>
    </div>
  )
}
