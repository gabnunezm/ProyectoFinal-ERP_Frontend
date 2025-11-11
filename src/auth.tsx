import React, { createContext, useContext, useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

type AuthUser = {
  id?: number
  nombre?: string
  email?: string
  role?: string
}

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem('user')
      if (!raw) return null
      try {
        const parsed = JSON.parse(raw)
        // normalize stored user shape on load
        return normalizeUser(parsed)
      } catch {
        return null
      }
    } catch {
      return null
    }
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))

  useEffect(() => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }, [token])

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user))
    else localStorage.removeItem('user')
  }, [user])

  // if we have a token but the stored user is empty (e.g. {}), try to decode token to populate user
  useEffect(() => {
    if ((!user || Object.keys(user).length === 0) && token) {
      ;(async () => {
        try {
          const payload = parseJwt(token) || {}
          const roleId = payload?.role_id ?? payload?.roleId ?? payload?.role
          const mappedRole = roleId ? idToRole[String(roleId)] : undefined
          const baseUser = { id: payload?.id ?? null, nombre: payload?.nombre ?? payload?.name ?? '', email: payload?.email ?? '', role: mappedRole ?? (payload?.role ? String(payload.role) : '') }
          setUser(baseUser)

          // fetch profile to enrich nombre if missing
          if ((!baseUser.nombre || baseUser.nombre === '') && payload?.id) {
            try {
              const profileRes = await fetch(`${API_BASE}/usuarios/${payload.id}`, { headers: { Authorization: `Bearer ${token}` } })
              if (profileRes.ok) {
                const profileBody = await profileRes.json().catch(() => null)
                const remote = profileBody?.usuario || profileBody?.user || profileBody?.data || profileBody
                if (remote) setUser(normalizeUser(remote))
              }
            } catch (e) {
              // ignore profile fetch errors
            }
          }
        } catch (e) {
          // ignore
        }
      })()
    }
  }, [])

  async function login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body?.message || body?.error || `${res.status} ${res.statusText}`)
    }
  const body = await res.json()
  // Try multiple shapes
  const tokenValue = body.token || body.accessToken || body.data?.token || body.tokenAccess
  // only treat explicit user fields as userValue; don't fallback to `body` because token-only responses
  // commonly arrive as { token: '...' } and are truthy
  const userValue = body.user || body.usuario || body.data?.user || body.data?.usuario || null

    if (!tokenValue) throw new Error('No token recibido')
    setToken(tokenValue)
    if (userValue) {
      setUser(normalizeUser(userValue))
    } else {
      // try to decode token payload to extract id/email/role_id
      try {
        const payload = parseJwt(tokenValue) || {}
        const roleId = payload?.role_id ?? payload?.roleId ?? payload?.role
        const mappedRole = roleId ? idToRole[String(roleId)] : undefined
        // ensure we set explicit values (avoid undefined-only object)
        const baseUser = { id: payload?.id ?? null, nombre: payload?.nombre ?? payload?.name ?? '', email: payload?.email ?? '', role: mappedRole ?? (payload?.role ? String(payload.role) : '') }
        setUser(baseUser)

        // If nombre is missing, try to fetch full profile from backend
        if ((!baseUser.nombre || baseUser.nombre === '') && payload?.id) {
          try {
            const profileRes = await fetch(`${API_BASE}/usuarios/${payload.id}`, { headers: { Authorization: `Bearer ${tokenValue}` } })
            if (profileRes.ok) {
              const profileBody = await profileRes.json().catch(() => null)
              const remote = profileBody?.usuario || profileBody?.user || profileBody?.data || profileBody
              if (remote) setUser(normalizeUser(remote))
            }
          } catch (e) {
            // ignore profile fetch errors
          }
        }
      } catch (e) {
        setUser(null)
      }
    }
  }

  function logout() {
    setToken(null)
    setUser(null)
  }

  function normalizeUser(raw: any): AuthUser {
    return {
      id: raw.id ?? raw._id,
      nombre: raw.nombre ?? raw.name,
      email: raw.email ?? raw.mail,
      // prefer explicit role string, otherwise map role_id -> role key
      role: raw.role ?? (raw.role_id ? idToRole[String(raw.role_id)] : undefined) ?? (raw.role ? String(raw.role) : undefined),
    }
  }

  // helper to decode a JWT without verification (client-side only)
  function parseJwt(token: string) {
    const parts = token.split('.')
    if (parts.length < 2) return null
    try {
      const payload = parts[1]
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
      return JSON.parse(decodeURIComponent(escape(json)))
    } catch (e) {
      try {
        return JSON.parse(atob(parts[1]))
      } catch {
        return null
      }
    }
  }

  // mapping role_id -> role key (keep in sync with backend)
  const idToRole: Record<string, string> = {
    '1': 'admin',
    '2': 'editor',
    '3': 'user',
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthProvider
