import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

// Numa SPA a troca de rota não mexe no scroll: sem isto, abrir uma carta a
// partir do fim do mercado deixa você no fim da página nova.
//
// O voltar/avançar do navegador fica de fora de propósito — ali o esperado é
// cair de volta onde você estava, e o próprio navegador tenta restaurar essa
// posição.
export default function ScrollToTop() {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (navigationType === 'POP') return
    window.scrollTo(0, 0)
  }, [pathname, navigationType])

  return null
}
