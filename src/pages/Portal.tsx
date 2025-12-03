import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth';

type Inscripcion = {
  inscripcion_id: number;
  seccion_id: number;
  curso_id: number;
  curso_nombre: string;
  nombre_seccion: string;
  nota_final: number | null;
  calificaciones_count: number;
  asistencia?: Record<string, number>;
};

export default function Portal() {
  const auth = useAuth();
  const user = auth.user || null;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [perfil, setPerfil] = useState<any>(null);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [pagos, setPagos] = useState<any>(null);
  const [estudianteId, setEstudianteId] = useState<number | null>(null);

  const [tab, setTab] = useState<'perfil'|'inscripcion'|'materias'|'calificaciones'|'historial'|'asistencia'>('perfil');

  // Inscripción simple: seccion_id input
  const [seccionIdToEnroll, setSeccionIdToEnroll] = useState<string>('');
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !token) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  async function fetchData() {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      // Try calling portal with the user.id first (some systems may store estudiante id there).
      const tryId = estudianteId ?? user.id
      let res = await fetch(`/api/portal/estudiante/${tryId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      // If we get 404 'Estudiante no encontrado', try to resolve estudiante id from usuario id
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        const msg = json?.error || json?.message || '';
        if ((res.status === 404 && /estudiante no encontrado/i.test(String(msg))) || /Estudiante no encontrado/i.test(String(msg))) {
          // attempt to resolve estudiante id by usuario id
          const resolved = await resolveEstudianteId(Number(user.id));
          if (resolved) {
            setEstudianteId(resolved);
            res = await fetch(`/api/portal/estudiante/${resolved}`, {
              headers: { Authorization: token ? `Bearer ${token}` : '', 'Content-Type': 'application/json' }
            });
          }
        }
        if (!res.ok) {
          throw new Error(json.error || `Error ${res.status}`);
        }
      }
      const body = await res.json();
      setPerfil(body.perfil || null);
      setInscripciones(body.inscripciones || []);
      setPagos(body.pagos || null);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }

  async function resolveEstudianteId(usuarioId: number): Promise<number | null> {
    // Try multiple heuristics to find estudiante id for a given usuario id
    try {
      // 1) dedicated route: /api/estudiantes/usuario/:usuario_id
      let res = await fetch(`/api/estudiantes/usuario/${usuarioId}`, { headers: { Authorization: token ? `Bearer ${token}` : '' } });
      if (res.ok) {
        const body = await res.json().catch(() => null);
        const e = body?.estudiante || body || null;
        if (e?.id) return Number(e.id);
      }

      // 2) query route: /api/estudiantes?usuario_id=...
      res = await fetch(`/api/estudiantes?usuario_id=${usuarioId}`, { headers: { Authorization: token ? `Bearer ${token}` : '' } });
      if (res.ok) {
        const list = await res.json().catch(() => null);
        const items = list?.estudiantes || list || [];
        if (Array.isArray(items) && items.length > 0) {
          const found = items[0];
          if (found?.id) return Number(found.id);
        }
      }

      // 3) list all estudiantes and find by usuario_id
      res = await fetch(`/api/estudiantes`, { headers: { Authorization: token ? `Bearer ${token}` : '' } });
      if (res.ok) {
        const list = await res.json().catch(() => null);
        const items = list?.estudiantes || list || [];
        if (Array.isArray(items)) {
          const found = items.find((it: any) => Number(it.usuario_id) === Number(usuarioId) || Number(it.usuarioId) === Number(usuarioId));
          if (found && found.id) return Number(found.id);
        }
      }
    } catch (e) {
      // ignore errors and return null
    }
    return null;
  }

  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault();
    setActionMsg(null);
    if (!seccionIdToEnroll) return setActionMsg('Indica id de sección para inscribir');
    if (!user) return setActionMsg('Usuario no autenticado');
    try {
      // ensure we have estudiante id
      let eid = estudianteId;
      if (!eid) {
        const resolved = await resolveEstudianteId(Number(user.id));
        if (!resolved) return setActionMsg('No se pudo resolver estudiante para inscribir');
        eid = resolved;
        setEstudianteId(eid);
      }

      const res = await fetch('/api/inscripciones', {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          estudiante_id: eid,
          seccion_id: Number(seccionIdToEnroll)
        })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActionMsg(json.error || `Error ${res.status}`);
      } else {
        setActionMsg('Inscripción realizada correctamente');
        setSeccionIdToEnroll('');
        await fetchData();
      }
    } catch (err: any) {
      setActionMsg(err?.message || 'Error en inscripción');
    }
  }

  if (!user) return <div>Acceso no autorizado. Inicie sesión como estudiante.</div>;
  if (loading) return <div>Cargando portal...</div>;
  if (error) return <div>Error: {error}</div>;

  const displayName = perfil?.nombre_usuario || perfil?.nombre || user.nombre || user.email;
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-purple-900 rounded-2xl shadow-2xl p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Portal Estudiante</h1>
              <p className="text-blue-100 text-lg">Bienvenido, <span className="font-semibold text-white">{displayName}</span></p>
              <div className="mt-3 flex flex-wrap gap-3 justify-center sm:justify-start">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                  <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-white">{perfil?.email || user.email}</span>
                </div>
                {perfil?.codigo_estudiante && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                    <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                    <span className="text-sm text-white">{perfil.codigo_estudiante}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white flex items-center justify-center font-bold text-3xl sm:text-4xl shadow-xl ring-4 ring-white/20">
                  {(displayName||'U').charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-4 border-blue-900"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-6">
          <nav className="flex gap-2 flex-wrap" aria-label="Portal tabs">
            {(['perfil','inscripcion','materias','calificaciones','historial','asistencia'] as const).map(t => {
              const icons = {
                perfil: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
                inscripcion: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
                materias: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
                calificaciones: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
                historial: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
                asistencia: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              };
              const labels = {
                perfil: 'Perfil',
                inscripcion: 'Inscripción',
                materias: 'Materias',
                calificaciones: 'Calificaciones',
                historial: 'Historial',
                asistencia: 'Asistencia'
              };
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    tab===t 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                  }`}
                >
                  {icons[t]}
                  <span className="hidden sm:inline">{labels[t]}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                {tab === 'perfil' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">Datos Personales</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Nombre Completo</span>
                        <p className="mt-1 text-lg font-semibold text-gray-800">{perfil?.nombre_usuario || perfil?.nombre || '-'}</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                        <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Email</span>
                        <p className="mt-1 text-lg font-semibold text-gray-800 break-all">{perfil?.email || '-'}</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200">
                        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Código Estudiante</span>
                        <p className="mt-1 text-lg font-semibold text-gray-800">{perfil?.codigo_estudiante || perfil?.codigo || 'No asignado'}</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                        <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">Estado</span>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-lg font-bold text-green-700">Activo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {tab === 'inscripcion' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">Inscripción</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
                      💡 Ingresa el ID de la sección a la que deseas inscribirte
                    </p>
                    <form onSubmit={handleEnroll} className="flex flex-col sm:flex-row gap-3">
                      <input 
                        className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                        placeholder="ID de sección" 
                        value={seccionIdToEnroll} 
                        onChange={e => setSeccionIdToEnroll(e.target.value)} 
                      />
                      <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-xl transition-all hover:scale-105" type="submit">
                        Inscribir
                      </button>
                    </form>
                    {actionMsg && (
                      <div className={`mt-4 p-4 rounded-lg ${actionMsg.includes('correctamente') ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                        {actionMsg}
                      </div>
                    )}
                  </div>
                )}

                {tab === 'materias' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">Materias Inscritas</h3>
                    </div>
                    <div className="grid gap-4">
                      {inscripciones.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <p className="text-gray-500 font-medium">No estás inscrito en ninguna materia</p>
                        </div>
                      ) : (
                        inscripciones.map(ins => (
                          <div key={ins.inscripcion_id} className="p-5 bg-gradient-to-r from-white to-blue-50 rounded-xl shadow-md border border-blue-100 hover:shadow-xl transition-all">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-bold text-xl text-blue-900">{ins.curso_nombre}</h4>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    Sección: {ins.nombre_seccion}
                                  </span>
                                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                    ID: {ins.seccion_id}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4 text-center">
                                <div className="text-xs text-gray-500 mb-1">Nota Final</div>
                                <div className={`text-3xl font-bold ${ins.nota_final && ins.nota_final >= 70 ? 'text-green-600' : ins.nota_final ? 'text-red-600' : 'text-gray-400'}`}>
                                  {ins.nota_final ?? '—'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {tab === 'calificaciones' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">Calificaciones</h3>
                    </div>
                    <div className="overflow-x-auto">
                      {inscripciones.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <p className="text-gray-500 font-medium">Sin calificaciones registradas</p>
                        </div>
                      ) : (
                        <table className="w-full text-sm">
                          <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                            <tr>
                              <th className="px-4 py-3 text-left rounded-tl-lg">Asignatura</th>
                              <th className="px-4 py-3 text-left">Sección</th>
                              <th className="px-4 py-3 text-center">Nota Final</th>
                              <th className="px-4 py-3 text-center rounded-tr-lg">Componentes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {inscripciones.map((ins, idx) => (
                              <tr key={ins.inscripcion_id} className={`border-b ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                                <td className="px-4 py-4 font-semibold text-gray-800">{ins.curso_nombre}</td>
                                <td className="px-4 py-4 text-gray-600">{ins.nombre_seccion}</td>
                                <td className="px-4 py-4 text-center">
                                  <span className={`inline-block px-3 py-1 rounded-full font-bold ${ins.nota_final && ins.nota_final >= 70 ? 'bg-green-100 text-green-700' : ins.nota_final ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {ins.nota_final ?? '—'}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                    {ins.calificaciones_count}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}

                {tab === 'historial' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">Historial de Pagos</h3>
                    </div>
                    {pagos ? (
                      <div className="grid gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 shadow-md">
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-green-500 rounded-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <div>
                                <div className="text-sm text-green-600 font-semibold uppercase">Total Pagado</div>
                                <div className="text-3xl font-bold text-green-700">${pagos.total_pagado ?? 0}</div>
                              </div>
                            </div>
                          </div>
                          <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-2 border-red-200 shadow-md">
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-red-500 rounded-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div>
                                <div className="text-sm text-red-600 font-semibold uppercase">Total Pendiente</div>
                                <div className="text-3xl font-bold text-red-700">${pagos.total_pendiente ?? 0}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-md">
                          <h4 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Movimientos Recientes
                          </h4>
                          {(pagos.historico || []).length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No hay movimientos registrados</p>
                          ) : (
                            <ul className="space-y-3">
                              {(pagos.historico || []).map((p: any) => (
                                <li key={p.id || Math.random()} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${p.estado === 'pagado' ? 'bg-green-500' : p.estado === 'pendiente' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                                    <span className="text-sm text-gray-600">{p.creado_en}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="font-bold text-gray-800">${p.monto}</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${p.estado === 'pagado' ? 'bg-green-100 text-green-700' : p.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                      {p.estado}
                                    </span>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-gray-500 font-medium">Sin historial disponible</p>
                      </div>
                    )}
                  </div>
                )}

                {tab === 'asistencia' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">Registro de Asistencia</h3>
                    </div>
                    <div className="grid gap-4">
                      {inscripciones.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-gray-500 font-medium">Sin registros de asistencia</p>
                        </div>
                      ) : (
                        inscripciones.map(ins => (
                          <div key={ins.inscripcion_id} className="p-5 bg-gradient-to-r from-white to-purple-50 rounded-xl shadow-md border border-purple-100 hover:shadow-xl transition-all">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="font-bold text-xl text-purple-900">{ins.curso_nombre}</h4>
                                <p className="text-sm text-gray-600 mt-1">Sección: {ins.nombre_seccion}</p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {ins.asistencia ? Object.entries(ins.asistencia).map(([k,v]) => (
                                  <span key={k} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold ${
                                    k === 'presente' ? 'bg-green-100 text-green-700' :
                                    k === 'ausente' ? 'bg-red-100 text-red-700' :
                                    k === 'tarde' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-blue-100 text-blue-700'
                                  }`}>
                                    <span className="capitalize">{k}</span>
                                    <span className="bg-white px-2 py-0.5 rounded-full">{v}</span>
                                  </span>
                                )) : <span className="text-gray-500 italic">Sin registro</span>}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <aside className="hidden lg:block">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                <h4 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Resumen
                </h4>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700 font-semibold">Inscripciones</span>
                      <span className="text-2xl font-bold text-blue-900">{inscripciones.length}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-red-700 font-semibold">Pagos Pendientes</span>
                      <span className="text-2xl font-bold text-red-900">${pagos?.total_pendiente ?? 0}</span>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                    <p className="text-xs text-purple-700 font-semibold mb-2">💡 Consejo</p>
                    <p className="text-sm text-gray-700">Mantén tus pagos al día para evitar restricciones en tu matrícula.</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
      </div>
    </div>
  );
}