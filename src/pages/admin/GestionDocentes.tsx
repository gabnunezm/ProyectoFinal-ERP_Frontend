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

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-stone-100">
              <th className="border p-2 text-left">Nombre</th>
              <th className="border p-2 text-left">Email</th>
              <th className="border p-2 text-left">Especialidad</th>
              <th className="border p-2 text-left">Teléfono</th>
              <th className="border p-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {docentes.map((doc) => (
              <tr key={doc.id}>
                <td className="border p-2">{doc.nombre || '-'}</td>
                <td className="border p-2">{doc.email || '-'}</td>
                <td className="border p-2">{doc.especialidad || '-'}</td>
                <td className="border p-2">{doc.telefono || '-'}</td>
                <td className="border p-2">
                  <button
                    onClick={() => openEdit(doc)}
                    className="px-2 py-1 bg-yellow-500 text-white rounded mr-2"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="px-2 py-1 bg-red-600 text-white rounded"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
