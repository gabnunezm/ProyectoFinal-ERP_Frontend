import { useEffect, useState } from 'react'

type Estudiante = {
  id: number
  usuario_id: number
  codigo_estudiante?: string
  nombre_usuario?: string
  email?: string
  fecha_nacimiento?: string
  genero?: string
  telefono?: string
  direccion?: string
  activo?: number
}

export default function GestionEstudiantes() {
  const token = localStorage.getItem('token')
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  // form fields
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    codigo_estudiante: '',
    fecha_nacimiento: '',
    genero: 'O',
    telefono: '',
    direccion: ''
  })

  useEffect(() => {
    fetchEstudiantes()
  }, [])

  function headers() {
    return {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  }

  async function fetchEstudiantes() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/estudiantes', { headers: headers() })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const body = await res.json()
      const list = body.estudiantes || body || []
      setEstudiantes(Array.isArray(list) ? list : [])
    } catch (e: any) {
      setError(e?.message || 'Error cargando estudiantes')
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
      codigo_estudiante: '',
      fecha_nacimiento: '',
      genero: 'O',
      telefono: '',
      direccion: ''
    })
    setShowForm(true)
  }

  function openEdit(est: Estudiante) {
    setEditingId(est.id)
    setFormData({
      nombre: est.nombre_usuario || '',
      email: est.email || '',
      password: '',
      codigo_estudiante: est.codigo_estudiante || '',
      fecha_nacimiento: est.fecha_nacimiento || '',
      genero: est.genero || 'O',
      telefono: est.telefono || '',
      direccion: est.direccion || ''
    })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (editingId) {
        // update
        const payload = {
          codigo_estudiante: formData.codigo_estudiante,
          fecha_nacimiento: formData.fecha_nacimiento || null,
          genero: formData.genero,
          telefono: formData.telefono,
          direccion: formData.direccion
        }
        const res = await fetch(`/api/estudiantes/${editingId}`, {
          method: 'PATCH',
          headers: headers(),
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error(`Error ${res.status}`)
      } else {
        // create new student (need to create user first, then backend triggers will create estudiante record)
        // role_id for student is typically 4 or check your roles table
        const userPayload = {
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password,
          role_id: 4 // estudiante role (adjust to match your DB)
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
        // after user created, backend trigger should create estudiante row automatically
        // optionally update estudiante fields if needed
      }
      await fetchEstudiantes()
      setShowForm(false)
    } catch (e: any) {
      setError(e?.message || 'Error guardando estudiante')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este estudiante?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/estudiantes/${id}`, {
        method: 'DELETE',
        headers: headers()
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      await fetchEstudiantes()
    } catch (e: any) {
      setError(e?.message || 'Error eliminando estudiante')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Estudiantes</h3>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
        >
          Nuevo Estudiante
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {loading && <div className="text-gray-500">Cargando...</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded bg-stone-50">
          <h4 className="font-semibold mb-3">{editingId ? 'Editar' : 'Crear'} Estudiante</h4>
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
              placeholder="Código estudiante"
              value={formData.codigo_estudiante}
              onChange={(e) => setFormData({ ...formData, codigo_estudiante: e.target.value })}
            />
            <input
              type="date"
              className="px-3 py-2 border rounded"
              placeholder="Fecha nacimiento"
              value={formData.fecha_nacimiento}
              onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
            />
            <select
              className="px-3 py-2 border rounded"
              value={formData.genero}
              onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
            >
              <option value="O">Otro</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
            <input
              className="px-3 py-2 border rounded"
              placeholder="Teléfono"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            />
            <input
              className="px-3 py-2 border rounded md:col-span-2"
              placeholder="Dirección"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
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
            <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                  Código
                </div>
              </th>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Teléfono
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {estudiantes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="text-lg font-medium">No hay estudiantes registrados</p>
                  </div>
                </td>
              </tr>
            )}
            {estudiantes.map((est, idx) => (
              <tr key={est.id} className={`hover:bg-blue-50 transition-colors ${
                idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {est.codigo_estudiante || '-'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {est.nombre_usuario || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {est.email || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {est.telefono || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(est)}
                      className="inline-flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-sm hover:shadow-md font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(est.id)}
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
