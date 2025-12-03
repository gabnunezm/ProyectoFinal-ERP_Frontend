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

        <div className="overflow-x-auto shadow-lg rounded-xl border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Nombre
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Créditos
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cursos.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <p className="text-lg font-medium">No hay cursos registrados</p>
                    </div>
                  </td>
                </tr>
              )}
              {cursos.map((curso, idx) => (
                <tr key={curso.id} className={`hover:bg-purple-50 transition-colors ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      {curso.codigo || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {curso.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-lg text-sm font-semibold bg-indigo-100 text-indigo-800">
                      {curso.creditos || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditCurso(curso)}
                        className="inline-flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-sm hover:shadow-md font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteCurso(curso.id)}
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

        <div className="overflow-x-auto shadow-lg rounded-xl border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
                <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Curso
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Sección
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Docente
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Horario
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {secciones.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <p className="text-lg font-medium">No hay secciones registradas</p>
                    </div>
                  </td>
                </tr>
              )}
              {secciones.map((sec, idx) => {
                const curso = cursos.find((c) => c.id === sec.curso_id)
                const docente = docentes.find((d) => d.id === sec.docente_id)
                return (
                  <tr key={sec.id} className={`hover:bg-indigo-50 transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {curso?.nombre || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                        {sec.nombre_seccion}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {docente?.nombre || sec.docente_nombre || (
                        <span className="text-gray-400 italic">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {sec.horario || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditSeccion(sec)}
                          className="inline-flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-sm hover:shadow-md font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteSeccion(sec.id)}
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
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
