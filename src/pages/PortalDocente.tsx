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

  // grade form state
  const [gradeValue, setGradeValue] = useState<string>('')
  const [gradeWeight, setGradeWeight] = useState<string>('1')
  const [gradeDesc, setGradeDesc] = useState<string>('')

  // attendance state
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
      // endpoint provided by backend: /api/portal/docente/:usuario_id
      const uid = user?.id
      const res = await fetch(`/api/portal/docente/${uid}`, { headers: headers() })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Error ${res.status}`)
      }
      const body = await res.json()
      const secs = body.secciones || body.secciones || body.sections || body.secciones || []
      // normalize fields
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

  // (no-op placeholder removed)

  async function submitGrade(inscripcion_id: number) {
    if (!gradeValue) return alert('Ingrese una calificación')
    try {
      // Backend expects: { inscripcion_id, periodo_id, tipo, nota, peso }
      const payload = {
        inscripcion_id,
        periodo_id: null,
        tipo: gradeDesc || 'parcial',
        nota: Number(gradeValue),
        peso: Number(gradeWeight)
      }
      // try common endpoints
      let res = await fetch('/api/calificaciones', { method: 'POST', headers: headers(), body: JSON.stringify(payload) })
      if (!res.ok) {
        // try alternate
        res = await fetch('/api/calificaciones/create', { method: 'POST', headers: headers(), body: JSON.stringify(payload) })
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Error ${res.status}`)
      }
      // reload section students/grades by refetching sections
      await fetchSections()
      setGradeValue(''); setGradeWeight('1'); setGradeDesc('')
      alert('Calificación registrada')
    } catch (e: any) {
      alert('Error al registrar calificación: ' + (e?.message || e))
    }
  }

  async function submitAttendance(inscripcion_id: number, seccion_id_param: number) {
    try {
      // Backend expects: { inscripcion_id, seccion_id, fecha, estado, anotaciones }
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

  if (!user) return <div className="p-6">Acceso no autorizado. Inicie sesión.</div>
  if (loading) return <div className="p-6">Cargando...</div>
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-semibold text-blue-900">Portal Docente</h2>
        <p className="text-sm text-gray-600">Secciones asignadas</p>

        <div className="mt-4 grid gap-4">
          {secciones.length === 0 && <div className="text-gray-500">Sin secciones asignadas</div>}
          {secciones.map(sec => (
            <div key={sec.seccion_id} className="border rounded p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-blue-900">{sec.curso_nombre}</div>
                  <div className="text-sm text-gray-600">Sección: {sec.nombre_seccion} — {sec.horario}</div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-blue-700 text-white rounded" onClick={() => { setActiveSection(sec.seccion_id); setShowGrades(true); setShowAttendance(false); }}>
                    Ver Calificaciones
                  </button>
                  <button className="px-3 py-1 bg-stone-200 text-gray-800 rounded" onClick={() => { setActiveSection(sec.seccion_id); setShowAttendance(true); setShowGrades(false); }}>
                    Registrar Asistencia
                  </button>
                </div>
              </div>

              {activeSection === sec.seccion_id && (sec.estudiantes && sec.estudiantes.length > 0) && (
                <div className="mt-4">
                  <h4 className="font-semibold">Estudiantes inscritos</h4>
                  <div className="mt-2 grid gap-2">
                    {sec.estudiantes.map((st: any) => (
                      <div key={st.inscripcion_id} className="flex items-center justify-between bg-stone-50 p-2 rounded">
                        <div>
                          <div className="font-medium">{st.nombre_estudiante}</div>
                          <div className="text-sm text-gray-600">Código: {st.codigo_estudiante || '-'}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {showGrades && (
                            <div className="flex items-center gap-2">
                              <input className="w-20 px-2 py-1 border rounded" placeholder="Nota" value={gradeValue} onChange={e => setGradeValue(e.target.value)} />
                              <input className="w-16 px-2 py-1 border rounded" placeholder="Peso" value={gradeWeight} onChange={e => setGradeWeight(e.target.value)} />
                              <input className="w-40 px-2 py-1 border rounded" placeholder="Desc" value={gradeDesc} onChange={e => setGradeDesc(e.target.value)} />
                              <button className="px-3 py-1 bg-blue-700 text-white rounded" onClick={() => submitGrade(st.inscripcion_id)}>Guardar</button>
                            </div>
                          )}

                          {showAttendance && (
                            <div className="flex items-center gap-2">
                              <input type="date" className="px-2 py-1 border rounded" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} />
                              <select className="px-2 py-1 border rounded" value={attendanceState} onChange={e => setAttendanceState(e.target.value as any)}>
                                <option value="presente">Presente</option>
                                <option value="ausente">Ausente</option>
                                <option value="tarde">Tarde</option>
                              </select>
                              <button className="px-3 py-1 bg-blue-700 text-white rounded" onClick={() => submitAttendance(st.inscripcion_id, sec.seccion_id)}>Marcar</button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
