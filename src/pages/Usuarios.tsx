import { useEffect, useState, useRef } from 'react'

type Usuario = {
  id?: number
  nombre: string
  email: string
  role: string
  password?: string
  activo?: number | boolean
}

// Prefer Vite env var (VITE_API_BASE) or fallback to relative '/api' so the dev proxy works.
const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [editing, setEditing] = useState<Usuario | null>(null)
  const [form, setForm] = useState<Usuario>({ nombre: '', email: '', role: 'user' })
  const [saving, setSaving] = useState(false)

  // keep internal role values matching backend, but show human labels
  const roles = ['admin', 'editor', 'user']
  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    editor: 'Docente',
    user: 'Estudiante',
    // accept some alternative keys the backend might send
    administrativo: 'Administrador',
    docente: 'Docente',
    estudiante: 'Estudiante',
  }
  // map role keys to role_id expected by backend (adjust if your backend uses different ids)
  const roleToId: Record<string, number> = {
    admin: 1,
    editor: 2,
    user: 3,
    administrativo: 1,
    docente: 2,
    estudiante: 3,
  }
  // reverse map for role_id -> role key
  const idToRole: Record<string, string> = Object.fromEntries(
    Object.entries(roleToId).map(([k, v]) => [String(v), k])
  )

  function normalizeUsuario(raw: any): Usuario {
    const id = raw.id ?? raw._id
    const nombre = raw.nombre ?? raw.name ?? ''
    const email = raw.email ?? raw.mail ?? ''
    // prefer explicit role string, otherwise map role_id -> role key
    let role: string = ''
    if (raw.role && typeof raw.role === 'string') role = raw.role
    else if (raw.role_id != null) role = idToRole[String(raw.role_id)] ?? String(raw.role_id)
    else if (raw.role != null) role = String(raw.role)
    else role = 'user'

    // activo flag: backend may use 1/0 or true/false
    const activo = raw.activo ?? raw.active ?? raw.enabled ?? 1

    return { id, nombre, email, role, activo }
  }
  const formRef = useRef<HTMLDivElement | null>(null)

  function getAuthToken(): string | null {
    // try common storage keys; adjust if your app uses a different key
    return (
      localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('accessToken') || null
    )
  }

  function buildHeaders(withJson = true) {
    const token = getAuthToken()
    const headers: Record<string, string> = {}
    if (withJson) headers['Content-Type'] = 'application/json'
    if (token) headers['Authorization'] = `Bearer ${token}`
    return headers
  }

  useEffect(() => {
    // debug
    // eslint-disable-next-line no-console
    console.log('Usuarios mounted')
    fetchUsuarios()
  }, [])

  async function fetchUsuarios() {
    setLoading(true)
    setError(null)
    try {
  const res = await fetch(`${API_BASE}/usuarios`, { headers: buildHeaders(false) })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const data = await res.json()
      // backend may return array or wrapped object — handle common shapes
      if (Array.isArray(data)) {
        setUsuarios(data.map(normalizeUsuario).filter((u) => u.activo !== 0))
      } else if (data && Array.isArray((data as any).data)) {
        setUsuarios((data as any).data.map(normalizeUsuario).filter((u: Usuario) => u.activo !== 0))
      } else if (data && Array.isArray((data as any).usuarios)) {
        setUsuarios((data as any).usuarios.map(normalizeUsuario).filter((u: Usuario) => u.activo !== 0))
      } else {
        // unexpected shape — log for debugging and show message
        // keep usuarios as empty array to avoid runtime errors
        // eslint-disable-next-line no-console
        console.error('fetchUsuarios: unexpected response shape', data)
        setUsuarios([])
        setError('Respuesta inesperada del servidor al listar usuarios')
      }
    } catch (err: any) {
      setError(err.message || 'Error cargando usuarios')
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    // debug
    // eslint-disable-next-line no-console
    console.log('openCreate called')
    setEditing(null)
    setForm({ nombre: '', email: '', role: 'user' })
    // scroll to form
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  function openEdit(u: Usuario) {
    setEditing(u)
    setForm({ nombre: u.nombre, email: u.email, role: u.role })
    // scroll to form
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  async function save() {
    // basic validation
    setError(null)
    setSuccess(null)
    if (!form.nombre.trim() || !form.email.trim()) {
      setError('Nombre y email son obligatorios')
      return
    }

    // when creating (not editing), require a password
    if (!editing && !(form.password && form.password.trim())) {
      setError('La contraseña es obligatoria para nuevos usuarios')
      return
    }

  setSaving(true)
  let passwordUpdated = false
  let fieldsUpdated = false
    try {
      const method = editing?.id ? 'PATCH' : 'POST'
      const url = editing?.id ? `${API_BASE}/usuarios/${editing.id}` : `${API_BASE}/usuarios`

      // Build payload matching backend expectations: nombre, email, password?, role_id
      const payload: any = {
        nombre: form.nombre,
        email: form.email,
        role_id: roleToId[form.role] ?? roleToId['user'],
      }
      if (form.password && form.password.trim()) {
        payload.password = form.password
      }


      // If editing, backend may expect password updates at /:id/password.
      // We'll first PATCH the main resource (nombre, email, role_id) and then, if a new password was provided,
      // call the password endpoint separately.
      let resJson: any = null
      if (editing?.id) {
        const fieldsPayload: any = {
          nombre: form.nombre,
          email: form.email,
          role_id: roleToId[form.role] ?? roleToId['user'],
        }

        // debug
        // eslint-disable-next-line no-console
        console.log('Updating user fields', editing.id, fieldsPayload)

        const fieldsRes = await fetch(`${API_BASE}/usuarios/${editing.id}`, {
          method: 'PATCH',
          headers: buildHeaders(true),
          body: JSON.stringify(fieldsPayload),
        })
        // eslint-disable-next-line no-console
        console.log('Fields update status', fieldsRes.status)
        try { resJson = await fieldsRes.json() } catch (e) { /* ignore */ }
        if (!fieldsRes.ok) {
          const msg = resJson?.message || resJson?.error || `${fieldsRes.status} ${fieldsRes.statusText}`
          throw new Error(msg)
        }
        // mark that fields update succeeded
        fieldsUpdated = true

        // If a new password was provided, call the dedicated endpoint
    if (form.password && form.password.trim()) {
          // debug
          // eslint-disable-next-line no-console
          console.log('Updating password for user', editing.id)
          const passRes = await fetch(`${API_BASE}/usuarios/${editing.id}/password`, {
            method: 'PATCH',
            headers: buildHeaders(true),
            // backend expects `newPassword` for this endpoint
            body: JSON.stringify({ newPassword: form.password }),
          })
          // eslint-disable-next-line no-console
          console.log('Password update status', passRes.status)
          let passJson: any = null
          try { passJson = await passRes.json() } catch (e) { /* ignore */ }
          if (!passRes.ok) {
            const msg = passJson?.message || passJson?.error || `${passRes.status} ${passRes.statusText}`
            throw new Error(msg)
          }
            // mark that password was updated
            passwordUpdated = true
            // prefer a more detailed response if returned
            if (passJson) resJson = passJson
        }
      } else {
        // creating new user: POST with password included
        // debug
        // eslint-disable-next-line no-console
        console.log('Creating user', payload)
        const res = await fetch(url, {
          method,
          headers: buildHeaders(true),
          body: JSON.stringify(payload),
        })
        // debug
        // eslint-disable-next-line no-console
        console.log('Create response status', res.status)
        try { resJson = await res.json() } catch (e) { /* ignore */ }
        if (!res.ok) {
          const msg = resJson?.message || resJson?.error || `${res.status} ${res.statusText}`
          throw new Error(msg)
        }
        // creation counts as fields update
        fieldsUpdated = true
      }

      // Update local list: created or updated
      if (resJson && typeof resJson === 'object') {
        const maybe = resJson.usuario || resJson.user || (resJson.data && !Array.isArray(resJson.data) && resJson.data) || resJson
        const id = maybe?.id ?? maybe?._id
        if (id) {
          const raw = maybe.id ? maybe : { id: maybe._id, ...maybe }
          const normalized = normalizeUsuario(raw)
          setUsuarios((prev) => {
            if (editing?.id) {
              // replace existing (but if backend returned inactive, remove it)
              if (normalized.activo === 0) return prev.filter((p) => p.id !== normalized.id)
              return prev.map((p) => (p.id === normalized.id ? (normalized as any) : p))
            }
            // add new at top only if active
            if (normalized.activo === 0) return prev
            return [normalized as any, ...prev]
          })
        } else {
          await fetchUsuarios()
        }
      } else {
        await fetchUsuarios()
      }

      setEditing(null)
      setForm({ nombre: '', email: '', role: 'user' })
      // Build a concatenated message depending on what changed
      if (fieldsUpdated && passwordUpdated) {
        setSuccess('Usuario actualizado. Contraseña actualizada')
      } else if (fieldsUpdated) {
        // differentiate creation vs update could be added; keep simple
        setSuccess('Usuario actualizado')
      } else if (passwordUpdated) {
        setSuccess('Contraseña actualizada')
      } else {
        setSuccess('Usuario guardado correctamente')
      }
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Error guardando usuario')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id?: number) {
    if (!id) return
    if (!confirm('¿Eliminar usuario?')) return
    setError(null)
    try {
  const res = await fetch(`${API_BASE}/usuarios/${id}`, { method: 'DELETE', headers: buildHeaders(false) })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      await fetchUsuarios()
      setSuccess('Usuario eliminado')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Error eliminando usuario')
    }
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between py-6">
        <h2 className="text-2xl font-semibold text-blue-950">Gestión de usuarios</h2>
        <div>
          <button onClick={openCreate} className="bg-blue-700 text-white px-3 py-2 rounded">Nuevo usuario</button>
        </div>
      </div>

  {error && <div className="mb-4 text-red-600">{error}</div>}
  {success && <div className="mb-4 text-green-600">{success}</div>}

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-stone-200">
            <tr>
              <th className="p-3">Nombre</th>
              <th className="p-3">Email</th>
              <th className="p-3">Rol</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="p-4 text-center">Cargando...</td>
              </tr>
            )}
            {!loading && usuarios.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">No hay usuarios</td>
              </tr>
            )}
            {usuarios.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.nombre}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{roleLabels[u.role] ?? (u.role || 'Sin rol')}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(u)} className="px-2 py-1 bg-stone-200 text-blue-900 rounded">Editar</button>
                    <button onClick={() => remove(u.id)} className="px-2 py-1 bg-red-600 text-white rounded">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form area */}
  <div ref={(el) => { formRef.current = el }} className="mt-6 bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">{editing ? 'Editar usuario' : 'Crear usuario'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="p-2 border rounded" placeholder="Nombre" />
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="p-2 border rounded" placeholder="Email" />
          <input value={form.password ?? ''} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" className="p-2 border rounded" placeholder={editing ? 'Dejar vacío para mantener contraseña' : 'Contraseña'} />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="p-2 border rounded">
            {roles.map((r) => (
              <option key={r} value={r}>{roleLabels[r] ?? r}</option>
            ))}
          </select>
        </div>
        <div className="mt-4 flex gap-3">
          <button disabled={saving} onClick={save} className="bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded">{saving ? 'Guardando...' : 'Guardar'}</button>
          <button onClick={() => { setEditing(null); setForm({ nombre: '', email: '', role: 'user' }) }} className="border px-4 py-2 rounded">Cancelar</button>
        </div>
      </div>
    </div>
  )
}
