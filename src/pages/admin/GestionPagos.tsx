import { useEffect, useState } from 'react'

type Pago = {
  id: number
  estudiante_id: number
  estudiante_nombre?: string
  estudiante_codigo?: string
  tipo_pago: 'matricula' | 'mensualidad' | 'otro'
  monto: number
  fecha_pago: string
  metodo_pago?: string
  referencia?: string
  estado: 'pagado' | 'pendiente' | 'anulado'
  creado_en?: string
}

export default function GestionPagos() {
  const token = localStorage.getItem('token')
  const [pagos, setPagos] = useState<Pago[]>([])
  const [filteredPagos, setFilteredPagos] = useState<Pago[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')

  useEffect(() => {
    fetchPagos()
  }, [])

  useEffect(() => {
    if (filtroEstado === 'todos') {
      setFilteredPagos(pagos)
    } else {
      setFilteredPagos(pagos.filter((p) => p.estado === filtroEstado))
    }
  }, [filtroEstado, pagos])

  function headers() {
    return {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  }

  async function fetchPagos() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/pagos', { headers: headers() })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const body = await res.json()
      const list = body.pagos || body || []
      setPagos(Array.isArray(list) ? list : [])
    } catch (e: any) {
      setError(e?.message || 'Error cargando pagos')
    } finally {
      setLoading(false)
    }
  }

  async function handleEstadoChange(pagoId: number, nuevoEstado: 'pagado' | 'pendiente' | 'anulado') {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/pagos/${pagoId}`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ estado: nuevoEstado })
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      await fetchPagos()
    } catch (e: any) {
      setError(e?.message || 'Error actualizando estado')
    } finally {
      setLoading(false)
    }
  }

  function getEstadoBadge(estado: string) {
    const colors = {
      pagado: 'bg-green-100 text-green-800',
      pendiente: 'bg-yellow-100 text-yellow-800',
      anulado: 'bg-red-100 text-red-800'
    }
    return colors[estado as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Gestión de Pagos</h3>
        <div className="flex gap-2 items-center">
          <label className="text-sm text-gray-600">Filtrar por estado:</label>
          <select
            className="px-3 py-2 border rounded"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="pagado">Pagado</option>
            <option value="anulado">Anulado</option>
          </select>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {loading && <div className="mb-4 text-gray-500">Cargando...</div>}

      <div className="overflow-x-auto shadow-lg rounded-xl border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-orange-600 to-orange-700 text-white">
              <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Estudiante
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">Código</th>
              <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Fecha
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">Tipo</th>
              <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Monto
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">Método</th>
              <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">Referencia</th>
              <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">Estado</th>
              <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPagos.length === 0 && (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-lg font-medium">
                      No hay pagos {filtroEstado !== 'todos' ? `con estado "${filtroEstado}"` : 'registrados'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
            {filteredPagos.map((pago, idx) => (
              <tr key={pago.id} className={`hover:bg-orange-50 transition-colors ${
                idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{pago.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {pago.estudiante_nombre || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800">
                    {pago.estudiante_codigo || '-'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {pago.fecha_pago 
                    ? new Date(pago.fecha_pago).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      })
                    : pago.creado_en 
                      ? new Date(pago.creado_en).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        })
                      : '-'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-800 capitalize">
                    {pago.tipo_pago === 'mensualidad' && '📚'}
                    {pago.tipo_pago === 'matricula' && '📝'}
                    {pago.tipo_pago === 'otro' && '💼'}
                    {pago.tipo_pago}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-700">
                  ${Number(pago.monto || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {pago.metodo_pago || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                  {pago.referencia || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getEstadoBadge(pago.estado)}`}>
                    {pago.estado === 'pagado' && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {pago.estado === 'pendiente' && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    )}
                    {pago.estado === 'anulado' && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    {pago.estado}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    value={pago.estado}
                    onChange={(e) => handleEstadoChange(pago.id, e.target.value as any)}
                    disabled={loading}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="pagado">Pagado</option>
                    <option value="anulado">Anulado</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Total Pagos</p>
            <p className="text-2xl font-bold text-blue-950">{pagos.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-600">
              {pagos.filter((p) => p.estado === 'pendiente').length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Pagados</p>
            <p className="text-2xl font-bold text-green-600">
              {pagos.filter((p) => p.estado === 'pagado').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
