import { createContext, useContext, useEffect, useState } from 'react'
import { KEYS, readJSON, writeJSON } from '../lib/storage'
import { ensureSeed } from '../lib/seed'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    ensureSeed()
    const session = readJSON(KEYS.session, { userId: null })
    if (session.userId) {
      const users = readJSON(KEYS.users, [])
      setUser(users.find((u) => u.id === session.userId) ?? null)
    }
  }, [])

  function login(email, password) {
    const users = readJSON(KEYS.users, [])
    const found = users.find((u) => u.email === email && u.password === password)
    if (!found) return { ok: false, error: 'E-mail ou senha inválidos.' }
    if (found.status === 'blocked') return { ok: false, error: 'Esta conta está bloqueada.' }

    writeJSON(KEYS.session, { userId: found.id })
    setUser(found)
    return { ok: true }
  }

  function register({ name, email, password }) {
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
      balance: 1000,
      status: 'active',
      createdAt: new Date().toISOString(),
    }

    writeJSON(KEYS.users, [...users, newUser])
    writeJSON(KEYS.session, { userId: newUser.id })
    setUser(newUser)
    return { ok: true }
  }

  function logout() {
    writeJSON(KEYS.session, { userId: null })
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de um AuthProvider')
  return ctx
}
