import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Button from '../components/Button'
import { PokeballIcon } from '../components/icons'
import { useAuth } from '../context/AuthContext'
import { useCards } from '../context/CardsContext'
import { estimateValue, getCollection, getListings } from '../lib/market'

const HEADINGS = {
  trade: {
    title: 'Qual carta você quer colocar para troca?',
    subtitle: 'Escolha uma da sua coleção. Você define as condições no próximo passo.',
  },
  sale: {
    title: 'Qual carta você quer vender?',
    subtitle: 'Escolha uma da sua coleção. Você define o preço no próximo passo.',
  },
  default: {
    title: 'Qual carta você quer anunciar?',
    subtitle: 'Escolha uma da sua coleção. Venda, troca ou os dois — você decide a seguir.',
  },
}

// Passo 1 de anunciar: escolher a carta. O passo 2 (preço, conservação, tipo)
// fica em /publicar/:itemId. Antes só existia o passo 2, alcançável apenas pela
// aba de coleção no perfil.
export default function PickCardToList() {
  const { user } = useAuth()
  const { getCard, status, marketVersion } = useCards()
  const [searchParams] = useSearchParams()

  const tipo = searchParams.get('tipo')
  const heading = HEADINGS[tipo] ?? HEADINGS.default

  // Carta já anunciada não pode ser anunciada de novo.
  const available = useMemo(() => {
    if (status !== 'ready') return []
    const listedItemIds = new Set(getListings().map((l) => l.itemId))
    return getCollection(user.id).filter((item) => !listedItemIds.has(item.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, user.id, marketVersion])

  if (status === 'loading') {
    return <div className="px-8 py-16 font-light text-ink-muted">Carregando sua coleção...</div>
  }

  const nextUrl = (itemId) => `/publicar/${itemId}${tipo ? `?tipo=${tipo}` : ''}`

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-14">
      <h1 className="text-4xl font-bold tracking-tight text-ink">{heading.title}</h1>
      <p className="mt-2 font-light text-ink-muted">{heading.subtitle}</p>

      {available.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="glass mt-12 rounded-3xl border border-arcade-panel-light px-12 py-16 text-center"
        >
          <PokeballIcon width={56} height={56} className="mx-auto text-ink-muted" />
          <p className="mt-6 font-light text-ink-muted">
            Todas as cartas da sua coleção já estão anunciadas.
          </p>
          <Button to="/perfil" variant="ghost" className="mt-8">
            Ver meus anúncios
          </Button>
        </motion.div>
      ) : (
        <>
          <p className="mt-8 font-mono-tabular text-xs text-ink-muted">
            {available.length} carta(s) disponíveis
          </p>

          <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
            {available.map((item, i) => {
              const card = getCard(item.cardId)

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(i, 10) * 0.04 }}
                >
                  <Link to={nextUrl(item.id)} className="group block">
                    {card && (
                      <img
                        src={card.images.small ?? card.images.large}
                        alt={card.name}
                        loading="lazy"
                        className="w-full transition-transform duration-500 ease-out group-hover:-translate-y-3"
                        style={{
                          borderRadius: '4.55% / 3.5%',
                          boxShadow: '0 18px 40px -18px rgba(0,0,0,0.9)',
                        }}
                      />
                    )}

                    <p className="mt-3 truncate px-1 text-[15px] font-medium text-ink">
                      {card?.name ?? item.cardId}
                    </p>
                    <p className="px-1 text-xs font-light text-ink-muted">
                      {item.condition}
                      {card && ` · ~${estimateValue(card, item.condition)} PC`}
                    </p>

                    <span className="mt-3 block rounded-full bg-gradient-to-r from-glow-common via-magenta to-glow-ultra-b py-2 text-center text-xs font-semibold text-white">
                      Escolher esta
                    </span>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
