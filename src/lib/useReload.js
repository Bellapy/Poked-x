import { useCallback, useState } from 'react'

// As operações de mercado escrevem direto no localStorage, fora do React.
// Este contador força a página a reler os dados depois de uma mutação.
export function useReload() {
  const [version, setVersion] = useState(0)
  return [version, useCallback(() => setVersion((v) => v + 1), [])]
}
