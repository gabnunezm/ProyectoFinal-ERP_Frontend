import { useEffect, useState } from 'react'

type Curso = {
  id: number
  codigo?: string
  nombre: string
  descripcion?: string
  creditos?: number
}

type Seccion = {
  id: number
  curso_id: number
  nombre_seccion: string
  docente_id?: number | null
  jornada?: string
  horario?: string
  curso_nombre?: string
  docente_nombre?: string
}

type Docente = {
  id: number
  usuario_id: number
  nombre?: string
  especialidad?: string
}

export default function GestionAsignaturas() {
  const token = localStorage.getItem('token')
  const [cursos, setCursos] = useState<Curso[]>([])
  const [secciones, setSecciones] = useState<Seccion[]>([])
  const [docentes, setDocentes] = useState<Docente[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCursoForm, setShowCursoForm] = useState(false)
  const [showSeccionForm, setShowSeccionForm] = useState(false)
  const [editingCursoId, setEditingCursoId] = useState<number | null>(null)
  const [editingSeccionId, setEditingSeccionId] = useState<number | null>(null)

  const [cursoForm, setCursoForm] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    creditos: 0
  })

  const [seccionForm, setSeccionForm] = useState({
    curso_id: 0,
    nombre_seccion: '',
    docente_id: null as number | null,
    jornada: '',
    horario: ''
  })

  useEffect(() => {
    fetchCursos()
    fetchSecciones()
    fetchDocentes()
  }, [])

  function headers() {
    return {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  }

  async function fetchCursos() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/cursos', { headers: headers() })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const body = await res.json()
      const list = body.cursos || body || []
      setCursos(Array.isArray(list) ? list : [])
    } catch (e: any) {
      setError(e?.message || 'Error cargando cursos')
    } finally {
      setLoading(false)
    }
  }

  async function fetchSecciones() {
    setLoading(true)
    try {
      const res = await fetch('/api/secciones', { headers: headers() })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const body = await res.json()
      const list = body.secciones || body || []
      setSecciones(Array.isArray(list) ? list : [])
    } catch (e: any) {
      setError(e?.message || 'Error cargando secciones')
    } finally {
      setLoading(false)
    }
  }

  async function fetchDocentes() {
    setLoading(true)
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

  function openCreateCurso() {
    setEditingCursoId(null)
    setCursoForm({ codigo: '', nombre: '', descripcion: '', creditos: 0 })
    setShowCursoForm(true)
  }

  function openEditCurso(curso: Curso) {
    setEditingCursoId(curso.id)
    setCursoForm({
      codigo: curso.codigo || '',
      nombre: curso.nombre || '',
      descripcion: curso.descripcion || '',
      creditos: curso.creditos || 0
    })
    setShowCursoForm(true)
  }

  async function handleCursoSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const payload = {
        codigo: cursoForm.codigo,
        nombre: cursoForm.nombre,
        descripcion: cursoForm.descripcion,
        creditos: Number(cursoForm.creditos)
      }
      if (editingCursoId) {
        const res = await fetch(`/api/cursos/${editingCursoId}`, {
          method: 'PATCH',
          headers: headers(),
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error(`Error ${res.status}`)
      } else {
        const res = await fetch('/api/cursos', {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify(payload)
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error || `Error ${res.status}`)
        }
      }
      await fetchCursos()
      setShowCursoForm(false)
    } catch (e: any) {
      setError(e?.message || 'Error guardando curso')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteCurso(id: number) {
    if (!confirm('¿Eliminar este curso?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/cursos/${id}`, {
        method: 'DELETE',
        headers: headers()
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      await fetchCursos()
    } catch (e: any) {
      setError(e?.message || 'Error eliminando curso')
    } finally {
      setLoading(false)
    }
  }

  function openCreateSeccion() {
    setEditingSeccionId(null)
    setSeccionForm({
      curso_id: cursos[0]?.id || 0,
      nombre_seccion: '',
      docente_id: null,
      jornada: '',
      horario: ''
    })
    setShowSeccionForm(true)
  }

  function openEditSeccion(sec: Seccion) {
    setEditingSeccionId(sec.id)
    setSeccionForm({
      curso_id: sec.curso_id,
      nombre_seccion: sec.nombre_seccion || '',
      docente_id: sec.docente_id || null,
      jornada: sec.jornada || '',
      horario: sec.horario || ''
    })
    setShowSeccionForm(true)
  }

  async function handleSeccionSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const payload = {
        curso_id: Number(seccionForm.curso_id),
        nombre_seccion: seccionForm.nombre_seccion,
        docente_id: seccionForm.docente_id ? Number(seccionForm.docente_id) : null,
        jornada: seccionForm.jornada,
        horario: seccionForm.horario
      }
      if (editingSeccionId) {
        const res = await fetch(`/api/secciones/${editingSeccionId}`, {
          method: 'PATCH',
          headers: headers(),
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error(`Error ${res.status}`)
      } else {
        const res = await fetch('/api/secciones', {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify(payload)
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error || `Error ${res.status}`)
        }
      }
      await fetchSecciones()
      setShowSeccionForm(false)
    } catch (e: any) {
      setError(e?.message || 'Error guardando sección')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteSeccion(id: number) {
    if (!confirm('¿Eliminar esta sección?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/secciones/${id}`, {
        method: 'DELETE',
        headers: headers()
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      await fetchSecciones()
    } catch (e: any) {
      setError(e?.message || 'Error eliminando sección')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {loading && <div className="mb-4 text-gray-500">Cargando...</div>}

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Cursos / Asignaturas</h3>
          <button
            onClick={openCreateCurso}
            className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
          >
            Nuevo Curso
          </button>
        </div>

        {showCursoForm && (
          <form onSubmit={handleCursoSubmit} className="mb-4 p-4 border rounded bg-stone-50">
            <h4 className="font-semibold mb-3">{editingCursoId ? 'Editar' : 'Crear'} Curso</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="px-3 py-2 border rounded"
                placeholder="Código"
                value={cursoForm.codigo}
                onChange={(e) => setCursoForm({ ...cursoForm, codigo: e.target.value })}
              />
              <input
                className="px-3 py-2 border rounded"
                placeholder="Nombre"
                value={cursoForm.nombre}
                onChange={(e) => setCursoForm({ ...cursoForm, nombre: e.target.value })}
                required
              />
              <input
                className="px-3 py-2 border rounded md:col-span-2"
                placeholder="Descripción"
                value={cursoForm.descripcion}
                onChange={(e) => setCursoForm({ ...cursoForm, descripcion: e.target.value })}
              />
              <input
                type="number"
                className="px-3 py-2 border rounded"
                placeholder="Créditos"
                value={cursoForm.creditos}
                onChange={(e) => setCursoForm({ ...cursoForm, creditos: Number(e.target.value) })}
              />
            </div>
            <div className="mt-3 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-700 text-white rounded">
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setShowCursoForm(false)}
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
                <th className="border p-2 text-left">Créditos</th>
                <th className="border p-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cursos.map((curso) => (
                <tr key={curso.id}>
                  <td className="border p-2">{curso.codigo || '-'}</td>
                  <td className="border p-2">{curso.nombre}</td>
                  <td className="border p-2">{curso.creditos || 0}</td>
                  <td className="border p-2">
                    <button
                      onClick={() => openEditCurso(curso)}
                      className="px-2 py-1 bg-yellow-500 text-white rounded mr-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteCurso(curso.id)}
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

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Secciones (Asignación de Docentes)</h3>
          <button
            onClick={openCreateSeccion}
            className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
          >
            Nueva Sección
          </button>
        </div>

        {showSeccionForm && (
          <form onSubmit={handleSeccionSubmit} className="mb-4 p-4 border rounded bg-stone-50">
            <h4 className="font-semibold mb-3">{editingSeccionId ? 'Editar' : 'Crear'} Sección</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                className="px-3 py-2 border rounded"
                value={seccionForm.curso_id}
                onChange={(e) => setSeccionForm({ ...seccionForm, curso_id: Number(e.target.value) })}
                required
              >
                <option value="">Seleccione curso</option>
                {cursos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              <input
                className="px-3 py-2 border rounded"
                placeholder="Nombre de sección"
                value={seccionForm.nombre_seccion}
                onChange={(e) => setSeccionForm({ ...seccionForm, nombre_seccion: e.target.value })}
                required
              />
              <select
                className="px-3 py-2 border rounded"
                value={seccionForm.docente_id ?? ''}
                onChange={(e) =>
                  setSeccionForm({ ...seccionForm, docente_id: e.target.value ? Number(e.target.value) : null })
                }
              >
                <option value="">Sin docente asignado</option>
                {docentes.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre || `Docente ${d.id}`} {d.especialidad ? `(${d.especialidad})` : ''}
                  </option>
                ))}
              </select>
              <input
                className="px-3 py-2 border rounded"
                placeholder="Jornada"
                value={seccionForm.jornada}
                onChange={(e) => setSeccionForm({ ...seccionForm, jornada: e.target.value })}
              />
              <input
                className="px-3 py-2 border rounded md:col-span-2"
                placeholder="Horario (ej: Lunes 8-10am)"
                value={seccionForm.horario}
                onChange={(e) => setSeccionForm({ ...seccionForm, horario: e.target.value })}
              />
            </div>
            <div className="mt-3 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-700 text-white rounded">
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setShowSeccionForm(false)}
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
                <th className="border p-2 text-left">Curso</th>
                <th className="border p-2 text-left">Sección</th>
                <th className="border p-2 text-left">Docente</th>
                <th className="border p-2 text-left">Horario</th>
                <th className="border p-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {secciones.map((sec) => {
                const curso = cursos.find((c) => c.id === sec.curso_id)
                const docente = docentes.find((d) => d.id === sec.docente_id)
                return (
                  <tr key={sec.id}>
                    <td className="border p-2">{curso?.nombre || '-'}</td>
                    <td className="border p-2">{sec.nombre_seccion}</td>
                    <td className="border p-2">{docente?.nombre || sec.docente_nombre || '-'}</td>
                    <td className="border p-2">{sec.horario || '-'}</td>
                    <td className="border p-2">
                      <button
                        onClick={() => openEditSeccion(sec)}
                        className="px-2 py-1 bg-yellow-500 text-white rounded mr-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteSeccion(sec.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
