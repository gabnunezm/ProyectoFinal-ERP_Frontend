import { useEffect, useState } from 'react'

type Docente = {
  id: number
  usuario_id: number
  nombre?: string
  email?: string
  especialidad?: string
  telefono?: string
}

export default function GestionDocentes() {
  const token = localStorage.getItem('token')
  const [docentes, setDocentes] = useState<Docente[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  // form fields
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    especialidad: '',
    telefono: ''
  })

  useEffect(() => {
    fetchDocentes()
  }, [])

  function headers() {
    return {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  }

  async function fetchDocentes() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/docentes', { headers: headers() })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const body = await res.json()
      const list = body.docentes || body || []
      setDocentes(Array.isArray(list) ? list : [])
    } catch (e: any) {
      setError(e?.message || 'Error cargando docentes')
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditingId(null)
    setFormData({
      nombre: '',
      email: '',
      password: '',
      especialidad: '',
      telefono: ''
    })
    setShowForm(true)
  }

  function openEdit(doc: Docente) {
    setEditingId(doc.id)
    setFormData({
      nombre: doc.nombre || '',
      email: doc.email || '',
      password: '',
      especialidad: doc.especialidad || '',
      telefono: doc.telefono || ''
    })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (editingId) {
        // update docente
        const payload = {
          especialidad: formData.especialidad,
          telefono: formData.telefono
        }
        const res = await fetch(`/api/docentes/${editingId}`, {
          method: 'PATCH',
          headers: headers(),
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error(`Error ${res.status}`)
      } else {
        // create new docente (need to create user first with role_id for docente)
        // role_id for docente is typically 2
        const userPayload = {
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password,
          role_id: 2 // docente role
        }
        const resUser = await fetch('/api/usuarios', {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify(userPayload)
        })
        if (!resUser.ok) {
          const body = await resUser.json().catch(() => ({}))
          throw new Error(body.error || `Error ${resUser.status}`)
        }
        // backend trigger should create docente row automatically
        // optionally update docente fields if needed
        const userData = await resUser.json()
        const userId = userData?.usuario?.id || userData?.id
        
        if (userId && (formData.especialidad || formData.telefono)) {
          // fetch docente_id for this usuario_id and update
          try {
            const docRes = await fetch(`/api/docentes/usuario/${userId}`, { headers: headers() })
            if (docRes.ok) {
              const docData = await docRes.json()
              const docenteId = docData?.docente?.id || docData?.id
              if (docenteId) {
                await fetch(`/api/docentes/${docenteId}`, {
                  method: 'PATCH',
                  headers: headers(),
                  body: JSON.stringify({
                    especialidad: formData.especialidad,
                    telefono: formData.telefono
                  })
                })
              }
            }
          } catch (e) {
            // ignore update errors
          }
        }
      }
      await fetchDocentes()
      setShowForm(false)
    } catch (e: any) {
      setError(e?.message || 'Error guardando docente')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este docente?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/docentes/${id}`, {
        method: 'DELETE',
        headers: headers()
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      await fetchDocentes()
    } catch (e: any) {
      setError(e?.message || 'Error eliminando docente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Docentes</h3>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
        >
          Nuevo Docente
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {loading && <div className="text-gray-500">Cargando...</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded bg-stone-50">
          <h4 className="font-semibold mb-3">{editingId ? 'Editar' : 'Crear'} Docente</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {!editingId && (
              <>
                <input
                  className="px-3 py-2 border rounded"
                  placeholder="Nombre completo"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
                <input
                  type="email"
                  className="px-3 py-2 border rounded"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <input
                  type="password"
                  className="px-3 py-2 border rounded"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </>
            )}
            <input
              className="px-3 py-2 border rounded"
              placeholder="Especialidad"
              value={formData.especialidad}
              onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
            />
            <input
              className="px-3 py-2 border rounded"
              placeholder="Teléfono"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-700 text-white rounded">
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto shadow-lg rounded-xl border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-green-600 to-green-700 text-white">
              <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Nombre
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  Especialidad
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Teléfono
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {docentes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-lg font-medium">No hay docentes registrados</p>
                  </div>
                </td>
              </tr>
            )}
            {docentes.map((doc, idx) => (
              <tr key={doc.id} className={`hover:bg-green-50 transition-colors ${
                idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {doc.nombre || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {doc.email || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {doc.especialidad ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {doc.especialidad}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {doc.telefono || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(doc)}
                      className="inline-flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-sm hover:shadow-md font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="inline-flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-sm hover:shadow-md font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
