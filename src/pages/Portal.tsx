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
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-blue-950">Portal Estudiante</h2>
            <p className="text-sm text-gray-600">Bienvenido, <span className="font-medium">{displayName}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-700 text-white flex items-center justify-center font-semibold">{(displayName||'U').charAt(0).toUpperCase()}</div>
          </div>
        </div>

        <div className="mt-6">
          <nav className="flex gap-2 flex-wrap" aria-label="Portal tabs">
            {(['perfil','inscripcion','materias','calificaciones','historial','asistencia'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${tab===t ? 'bg-blue-700 text-white' : 'bg-stone-100 text-blue-900'}`}
              >
                {t === 'perfil' ? 'Perfil' : t === 'inscripcion' ? 'Inscripción' : t === 'materias' ? 'Materias' : t === 'calificaciones' ? 'Calificaciones' : t === 'historial' ? 'Historial' : 'Asistencia'}
              </button>
            ))}
          </nav>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-stone-50 p-4 rounded">
                {tab === 'perfil' && (
                  <div>
                    <h3 className="text-lg font-semibold">Datos personales</h3>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                      <div><span className="font-medium">Nombre: </span>{perfil?.nombre_usuario || perfil?.nombre || '-'}</div>
                      <div><span className="font-medium">Email: </span>{perfil?.email || '-'}</div>
                      <div><span className="font-medium">Código: </span>{perfil?.codigo_estudiante || perfil?.codigo || '-'}</div>
                      <div><span className="font-medium">Estado: </span>{perfil?.activo ? 'Activo' : 'Inactivo'}</div>
                    </div>
                  </div>
                )}

                {tab === 'inscripcion' && (
                  <div>
                    <h3 className="text-lg font-semibold">Inscripción</h3>
                    <p className="text-sm text-gray-600 mt-1">Selecciona las secciones a las que deseas inscribirte.</p>
                    <form onSubmit={handleEnroll} className="mt-4 flex gap-2">
                      <input className="border rounded px-3 py-2 w-full" placeholder="ID de sección" value={seccionIdToEnroll} onChange={e => setSeccionIdToEnroll(e.target.value)} />
                      <button className="bg-blue-700 text-white px-4 py-2 rounded" type="submit">Inscribir</button>
                    </form>
                    {actionMsg && <div className="mt-3 text-sm text-red-600">{actionMsg}</div>}
                  </div>
                )}

                {tab === 'materias' && (
                  <div>
                    <h3 className="text-lg font-semibold">Materias / Inscripciones</h3>
                    <div className="mt-4 grid gap-3">
                      {inscripciones.length === 0 ? (
                        <div className="text-sm text-gray-500">No estás inscrito en materias.</div>
                      ) : (
                        inscripciones.map(ins => (
                          <div key={ins.inscripcion_id} className="p-3 bg-white rounded shadow-sm flex items-center justify-between">
                            <div>
                              <div className="font-medium text-blue-900">{ins.curso_nombre}</div>
                              <div className="text-sm text-gray-600">Sección: {ins.nombre_seccion} (ID: {ins.seccion_id})</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">Nota final</div>
                              <div className="text-xl font-semibold">{ins.nota_final ?? '—'}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {tab === 'calificaciones' && (
                  <div>
                    <h3 className="text-lg font-semibold">Calificaciones</h3>
                    <div className="mt-4">
                      {inscripciones.length === 0 ? <div className="text-sm text-gray-500">Sin calificaciones</div> : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-gray-600">
                              <th className="pb-2">Asignatura</th>
                              <th className="pb-2">Sección</th>
                              <th className="pb-2">Nota final</th>
                              <th className="pb-2">Componentes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {inscripciones.map(ins => (
                              <tr key={ins.inscripcion_id} className="border-t">
                                <td className="py-3">{ins.curso_nombre}</td>
                                <td>{ins.nombre_seccion}</td>
                                <td className="font-semibold">{ins.nota_final ?? '—'}</td>
                                <td>{ins.calificaciones_count}</td>
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
                    <h3 className="text-lg font-semibold">Historial</h3>
                    <div className="mt-4">
                      {pagos ? (
                        <div className="grid gap-3">
                          <div className="p-3 bg-white rounded shadow-sm">
                            <div className="text-sm text-gray-600">Total pagado</div>
                            <div className="font-semibold text-blue-900">{pagos.total_pagado ?? 0}</div>
                          </div>
                          <div className="p-3 bg-white rounded shadow-sm">
                            <div className="text-sm text-gray-600">Total pendiente</div>
                            <div className="font-semibold text-red-600">{pagos.total_pendiente ?? 0}</div>
                          </div>
                          <div className="p-3 bg-white rounded shadow-sm">
                            <div className="text-sm text-gray-600">Movimientos</div>
                            <ul className="mt-2 text-sm">
                              {(pagos.historico || []).map((p: any) => (
                                <li key={p.id || Math.random()} className="py-1">{p.creado_en}: {p.monto} — <span className="capitalize">{p.estado}</span></li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : <div className="text-sm text-gray-500">Sin historial disponible</div>}
                    </div>
                  </div>
                )}

                {tab === 'asistencia' && (
                  <div>
                    <h3 className="text-lg font-semibold">Asistencia</h3>
                    <div className="mt-4 grid gap-3">
                      {inscripciones.length === 0 ? (
                        <div className="text-sm text-gray-500">Sin registros de asistencia</div>
                      ) : (
                        inscripciones.map(ins => (
                          <div key={ins.inscripcion_id} className="p-3 bg-white rounded shadow-sm flex items-center justify-between">
                            <div>
                              <div className="font-medium text-blue-900">{ins.curso_nombre}</div>
                              <div className="text-sm text-gray-600">Sección: {ins.nombre_seccion}</div>
                            </div>
                            <div className="text-sm text-gray-700">
                              {ins.asistencia ? Object.entries(ins.asistencia).map(([k,v]) => (
                                <span key={k} className="inline-block ml-2 px-2 py-1 bg-stone-100 rounded">{k}: {v}</span>
                              )) : <span className="text-gray-500">Sin registro</span>}
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
              <div className="bg-white p-4 rounded shadow-sm">
                <h4 className="font-semibold text-sm text-gray-700">Resumen</h4>
                <div className="mt-3 text-sm text-gray-600">
                  <div>Inscripciones: <span className="font-medium text-blue-900">{inscripciones.length}</span></div>
                  <div className="mt-2">Pagos pendientes: <span className="font-medium text-red-600">{pagos?.total_pendiente ?? 0}</span></div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}