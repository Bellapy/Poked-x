import { Link } from 'react-router-dom'

const LINKS = [
  { to: '/', label: 'Mercado' },
  { to: '/perfil', label: 'Minha coleção' },
  { to: '/carrinho', label: 'Carrinho' },
]

export default function Footer() {
  return (
    <footer className="mt-24 px-6 pb-10">
      <div className="glass mx-auto max-w-[1600px] rounded-3xl px-10 py-12">
        <div className="flex flex-wrap items-start justify-between gap-10">
          <div className="max-w-sm">
            <span className="text-gradient font-display text-2xl font-bold tracking-tight">
              Pokedéx
            </span>
            <p className="mt-3 text-sm font-light leading-relaxed text-ink-muted">
              Marketplace simulado de cartas Pokémon. Compra, venda e troca acontecem inteiramente
              no seu navegador.
            </p>
          </div>

          <nav className="flex flex-col gap-3">
            {LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-light text-ink-muted transition-colors duration-300 hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-10 border-t border-arcade-panel-light pt-6">
          <p className="text-xs font-light leading-relaxed text-ink-muted">
            Projeto acadêmico sem fins comerciais. Imagens e dados das cartas vêm da Pokémon TCG API
            e os modelos 3D da Pokemon3D API; Pokémon é propriedade da The Pokémon Company, Nintendo
            e Game Freak.
          </p>
        </div>
      </div>
    </footer>
  )
}
