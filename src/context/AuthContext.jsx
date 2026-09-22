import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { KEYS, readJSON, writeJSON } from '../lib/storage'

const AuthContext = createContext(null)

const INITIAL_BALANCE = 1000

function loadSessionUser() {
  const { userId } = readJSON(KEYS.session, { userId: null })
  if (!userId) return null
  return readJSON(KEYS.users, []).find((u) => u.id === userId) ?? null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadSessionUser)

  // O `user` em memória é uma cópia: qualquer operação de mercado que mexa em
  // saldo/coleção precisa chamar isto para a interface não mostrar dado velho.
  const refreshUser = useCallback(() => {
    setUser(loadSessionUser())
  }, [])

  const login = useCallback((email, password) => {
    const users = readJSON(KEYS.users, [])
    const found = users.find((u) => u.email === email && u.password === password)
    if (!found) return { ok: false, error: 'E-mail ou senha inválidos.' }
    if (found.status === 'blocked') return { ok: false, error: 'Esta conta está bloqueada.' }

    writeJSON(KEYS.session, { userId: found.id })
    setUser(found)
    return { ok: true }
  }, [])

  const register = useCallback(({ name, email, password }) => {
    const users = readJSON(KEYS.users, [])
    if (users.some((u) => u.email === email)) {
      return { ok: false, error: 'Já existe uma conta com esse e-mail.' }
    }

    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
      role: 'user',
      balance: INITIAL_BALANCE,
      status: 'active',
      createdAt: new Date().toISOString(),
    }

    writeJSON(KEYS.users, [...users, newUser])
    writeJSON(KEYS.session, { userId: newUser.id })
    setUser(newUser)
    return { ok: true }
  }, [])

  const logout = useCallback(() => {
    writeJSON(KEYS.session, { userId: null })
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, login, register, logout, refreshUser }),
    [user, login, register, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de um AuthProvider')
  return ctx
}
