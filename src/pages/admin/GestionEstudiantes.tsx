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

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-stone-100">
              <th className="border p-2 text-left">Código</th>
              <th className="border p-2 text-left">Nombre</th>
              <th className="border p-2 text-left">Email</th>
              <th className="border p-2 text-left">Teléfono</th>
              <th className="border p-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {estudiantes.map((est) => (
              <tr key={est.id}>
                <td className="border p-2">{est.codigo_estudiante || '-'}</td>
                <td className="border p-2">{est.nombre_usuario || '-'}</td>
                <td className="border p-2">{est.email || '-'}</td>
                <td className="border p-2">{est.telefono || '-'}</td>
                <td className="border p-2">
                  <button
                    onClick={() => openEdit(est)}
                    className="px-2 py-1 bg-yellow-500 text-white rounded mr-2"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(est.id)}
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
