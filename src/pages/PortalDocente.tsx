import { useEffect, useState } from 'react'
import { useAuth } from '../auth'

type Seccion = { seccion_id: number; nombre_seccion: string; horario?: string; curso_id: number; curso_nombre: string }
type Estudiante = { inscripcion_id: number; estudiante_id: number; codigo_estudiante?: string; nombre_estudiante: string; email?: string }

export default function PortalDocente() {
  const auth = useAuth()
  const token = auth.token
  const user = auth.user

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [secciones, setSecciones] = useState<Array<Seccion & { estudiantes?: Estudiante[] }>>([])
  const [activeSection, setActiveSection] = useState<number | null>(null)
  const [showGrades, setShowGrades] = useState(false)
  const [showAttendance, setShowAttendance] = useState(false)

  // estado del formulario de calificaciones
  const [gradeValue, setGradeValue] = useState<string>('')
  const [gradeDesc, setGradeDesc] = useState<string>('')

  // estado de asistencia
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().slice(0,10))
  const [attendanceState, setAttendanceState] = useState<'presente'|'ausente'|'tarde'>('presente')

  useEffect(() => {
    if (!user || !token) return
    fetchSections()
  }, [user, token])

  function headers() {
    return { Authorization: token ? `Bearer ${token}` : '', 'Content-Type': 'application/json' }
  }

  async function fetchSections() {
    setLoading(true); setError(null)
    try {
      // endpoint proporcionado por el backend: /api/portal/docente/:usuario_id
      const uid = user?.id
      const res = await fetch(`/api/portal/docente/${uid}`, { headers: headers() })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Error ${res.status}`)
      }
      const body = await res.json()
      const secs = body.secciones || body.secciones || body.sections || body.secciones || []
      // normalizar campos
      const normalized = secs.map((s: any) => ({
        seccion_id: s.seccion_id ?? s.id ?? s.seccionId,
        nombre_seccion: (s.nombre_seccion ?? s.nombre ?? ''),
        horario: s.horario,
        curso_id: s.curso_id ?? s.cursoId ?? null,
        curso_nombre: (s.curso_nombre ?? s.cursoNombre ?? s.curso_nombre ?? ''),
        estudiantes: s.estudiantes ?? s.alumnos ?? []
      }))
      setSecciones(normalized)
    } catch (e: any) {
      setError(e?.message || 'Error cargando secciones')
    } finally { setLoading(false) }
  }

  async function submitGrade(inscripcion_id: number) {
    if (!gradeValue) return alert('Ingrese una calificación')
    try {
      // Backend espera: { inscripcion_id, periodo_id, tipo, nota, peso }
      const payload = {
        inscripcion_id,
        periodo_id: null,
        tipo: gradeDesc || 'parcial',
        nota: Number(gradeValue),
        peso: 1 
      }
      // intentar envío al endpoint principal
      let res = await fetch('/api/calificaciones', { method: 'POST', headers: headers(), body: JSON.stringify(payload) })
      if (!res.ok) {
        // intentar envío al endpoint alternativo
        res = await fetch('/api/calificaciones/create', { method: 'POST', headers: headers(), body: JSON.stringify(payload) })
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Error ${res.status}`)
      }
      // recargar estudiantes/calificaciones de la sección volviendo a obtener las secciones
      await fetchSections()
      setGradeValue(''); setGradeDesc('')
      alert('Calificación registrada')
    } catch (e: any) {
      alert('Error al registrar calificación: ' + (e?.message || e))
    }
  }

  async function submitAttendance(inscripcion_id: number, seccion_id_param: number) {
    try {
      // Backend espera: { inscripcion_id, seccion_id, fecha, estado, anotaciones }
      const payload = { inscripcion_id, seccion_id: seccion_id_param, fecha: attendanceDate, estado: attendanceState, anotaciones: null }
      let res = await fetch('/api/asistencias', { method: 'POST', headers: headers(), body: JSON.stringify(payload) })
      if (!res.ok) {
        res = await fetch('/api/asistencias/create', { method: 'POST', headers: headers(), body: JSON.stringify(payload) })
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Error ${res.status}`)
      }
      await fetchSections()
      alert('Asistencia registrada')
    } catch (e: any) {
      alert('Error al registrar asistencia: ' + (e?.message || e))
    }
  }

  if (!user) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">Por favor, inicie sesión para acceder al portal.</p>
        </div>
      </div>
    </div>
  )
  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium">Cargando información...</p>
      </div>
    </div>
  )
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-900 via-green-800 to-emerald-900 text-white shadow-2xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <div>
                <h1 className="text-3xl font-bold">Portal Docente</h1>
                <p className="text-green-200 text-sm mt-1">Gestión de Secciones y Evaluaciones</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-semibold text-lg">{user?.nombre || 'Docente'}</p>
                  <p className="text-green-200 text-sm">{user?.email || ''}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-xl font-bold shadow-lg">
                  {(user?.nombre?.[0] || 'D').toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="container mx-auto px-6 py-8">

        {secciones.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-gray-500 text-lg">No tienes secciones asignadas</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {secciones.map(sec => (
              <div key={sec.seccion_id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                {/* Section Header */}
                <div className="bg-gradient-to-r from-green-700 to-emerald-700 px-6 py-5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 p-3 rounded-lg">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{sec.curso_nombre}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                            📚 {sec.nombre_seccion}
                          </span>
                          <span className="text-green-100 text-sm flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {sec.horario || 'Sin horario'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                          showGrades && activeSection === sec.seccion_id 
                            ? 'bg-white text-green-700 shadow-lg' 
                            : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                        onClick={() => { setActiveSection(sec.seccion_id); setShowGrades(true); setShowAttendance(false); }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Calificaciones
                      </button>
                      <button 
                        className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                          showAttendance && activeSection === sec.seccion_id 
                            ? 'bg-white text-green-700 shadow-lg' 
                            : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                        onClick={() => { setActiveSection(sec.seccion_id); setShowAttendance(true); setShowGrades(false); }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        Asistencia
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sección de Estudiantes */}
                {activeSection === sec.seccion_id && (sec.estudiantes && sec.estudiantes.length > 0) && (
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <svg className="w-6 h-6 text-green-700" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                      </svg>
                      <h4 className="text-lg font-bold text-gray-800">Estudiantes Inscritos ({sec.estudiantes.length})</h4>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gradient-to-r from-green-50 to-emerald-50">
                            <th className="text-left px-4 py-3 text-green-800 font-semibold">
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                </svg>
                                Estudiante
                              </div>
                            </th>
                            <th className="text-left px-4 py-3 text-green-800 font-semibold">
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                                </svg>
                                Código
                              </div>
                            </th>
                            <th className="text-left px-4 py-3 text-green-800 font-semibold">Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sec.estudiantes.map((st: any, idx: number) => (
                            <tr key={st.inscripcion_id} className={`border-b hover:bg-green-50 transition-colors ${
                              idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }`}>
                              <td className="px-4 py-3">
                                <div className="font-medium text-gray-800">{st.nombre_estudiante}</div>
                                {st.email && <div className="text-sm text-gray-500">{st.email}</div>}
                              </td>
                              <td className="px-4 py-3">
                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                  {st.codigo_estudiante || '-'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {showGrades && (
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <input 
                                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                                      placeholder="Nota" 
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={gradeValue} 
                                      onChange={e => setGradeValue(e.target.value)} 
                                    />
                                    <input 
                                      className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                                      placeholder="Descripción" 
                                      value={gradeDesc} 
                                      onChange={e => setGradeDesc(e.target.value)} 
                                    />
                                    <button 
                                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center gap-2"
                                      onClick={() => submitGrade(st.inscripcion_id)}
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      Guardar
                                    </button>
                                  </div>
                                )}

                                {showAttendance && (
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <input 
                                      type="date" 
                                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                                      value={attendanceDate} 
                                      onChange={e => setAttendanceDate(e.target.value)} 
                                    />
                                    <select 
                                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                                      value={attendanceState} 
                                      onChange={e => setAttendanceState(e.target.value as any)}
                                    >
                                      <option value="presente">✅ Presente</option>
                                      <option value="ausente">❌ Ausente</option>
                                      <option value="tarde">⏰ Tarde</option>
                                    </select>
                                    <button 
                                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center gap-2"
                                      onClick={() => submitAttendance(st.inscripcion_id, sec.seccion_id)}
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      Marcar
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
