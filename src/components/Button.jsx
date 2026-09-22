import { Link } from 'react-router-dom'

const VARIANTS = {
  primary:
    'bg-gradient-to-r from-glow-common via-magenta to-glow-ultra-b text-white shadow-[0_10px_30px_-10px_var(--color-magenta)] hover:shadow-[0_16px_40px_-10px_var(--color-magenta)] hover:scale-[1.02]',
  ghost:
    'border border-arcade-panel-light bg-arcade-panel text-ink backdrop-blur-md hover:border-glow-ultra-a hover:text-white',
  danger: 'text-[#ff7a85] hover:bg-[#ff7a85]/10',
}

const SIZES = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
}

// Botão único do app, em três pesos: `primary` para a ação principal da tela,
// `ghost` para ações secundárias e `danger` para remoções.
export default function Button({
  variant = 'primary',
  size = 'md',
  to,
  className = '',
  children,
  ...props
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-40 ${VARIANTS[variant]} ${SIZES[size]} ${className}`

  // Um <Link> ignora `disabled`, então nesse caso cai para <button>: sem isso a
  // navegação aconteceria mesmo com o botão aparentando estar desativado.
  if (to && !props.disabled) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
