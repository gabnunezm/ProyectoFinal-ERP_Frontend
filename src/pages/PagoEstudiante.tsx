import { useEffect, useState } from 'react'
import { useAuth } from '../auth'

type Pago = {
  id: number
  estudiante_id: number
  tipo_pago: 'matricula' | 'mensualidad' | 'otro'
  monto: number
  fecha_pago: string
  metodo_pago?: string
  referencia?: string
  estado: 'pagado' | 'pendiente' | 'anulado'
  creado_en?: string
}

export default function PagoEstudiante() {
  const auth = useAuth()
  const token = localStorage.getItem('token')
  const [pagos, setPagos] = useState<Pago[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [estudianteId, setEstudianteId] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    tipo_pago: 'mensualidad' as 'matricula' | 'mensualidad' | 'otro',
    monto: '',
    metodo_pago: '',
    referencia: '',
    // Campos de tarjeta
    numero_tarjeta: '',
    nombre_titular: '',
    fecha_vencimiento: '',
    cvv: '',
    // Campo para comprobante de transferencia
    comprobante_imagen: null as File | null
  })

  // Montos fijos por tipo de pago
  const MONTOS_FIJOS = {
    mensualidad: 850.00,
    matricula: 1500.00,
    otro: 250.00
  }

  // Actualizar monto cuando cambia el tipo de pago
  useEffect(() => {
    if (formData.tipo_pago) {
      const montoFijo = MONTOS_FIJOS[formData.tipo_pago]
      setFormData(prev => ({ ...prev, monto: montoFijo.toString() }))
    }
  }, [formData.tipo_pago])

  useEffect(() => {
    resolveEstudianteId()
  }, [])

  useEffect(() => {
    if (estudianteId) {
      fetchPagos()
    }
  }, [estudianteId])

  // Generar referencia única cuando se abre el formulario
  useEffect(() => {
    if (showForm && !formData.referencia) {
      const nuevaReferencia = generateReferencia()
      setFormData(prev => ({ ...prev, referencia: nuevaReferencia }))
    }
  }, [showForm])

  function generateReferencia(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `PAY-${timestamp}-${random}`
  }

  function headers() {
    return {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  }

  async function resolveEstudianteId() {
    const userId = auth.user?.id
    if (!userId) return

    try {
      // try to get estudiante_id from usuario_id
      const res = await fetch(`/api/estudiantes/usuario/${userId}`, { headers: headers() })
      if (res.ok) {
        const body = await res.json()
        const estId = body?.estudiante?.id || body?.id
        if (estId) {
          setEstudianteId(estId)
          return
        }
      }

      // fallback: get all estudiantes and find by usuario_id
      const resAll = await fetch('/api/estudiantes', { headers: headers() })
      if (resAll.ok) {
        const bodyAll = await resAll.json()
        const list = bodyAll.estudiantes || bodyAll || []
        const match = list.find((e: any) => e.usuario_id === userId)
        if (match) setEstudianteId(match.id)
      }
    } catch (e) {
      console.error('Error resolving estudiante_id:', e)
    }
  }

  async function fetchPagos() {
    if (!estudianteId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/pagos/estudiante/${estudianteId}`, { headers: headers() })
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!estudianteId) {
      setError('No se pudo identificar el estudiante')
      return
    }

    // Validaciones según método de pago
    if (formData.metodo_pago === 'tarjeta_credito' || formData.metodo_pago === 'tarjeta_debito') {
      if (!formData.numero_tarjeta || !formData.nombre_titular || !formData.fecha_vencimiento || !formData.cvv) {
        setError('Complete todos los campos de la tarjeta')
        return
      }
    }

    if (formData.metodo_pago === 'transferencia' && !formData.comprobante_imagen) {
      setError('Debe cargar el comprobante de transferencia')
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Preparar información adicional según método de pago
      let metodo_info = formData.metodo_pago
      if (formData.metodo_pago === 'tarjeta_credito' || formData.metodo_pago === 'tarjeta_debito') {
        // Solo guardar últimos 4 dígitos de la tarjeta por seguridad
        const ultimos4 = formData.numero_tarjeta.slice(-4)
        metodo_info = `${formData.metodo_pago === 'tarjeta_credito' ? 'Tarjeta Crédito' : 'Tarjeta Débito'} **** ${ultimos4}`
      } else if (formData.metodo_pago === 'transferencia') {
        metodo_info = 'Transferencia Bancaria'
      }

      const payload = {
        estudiante_id: estudianteId,
        tipo_pago: formData.tipo_pago,
        monto: parseFloat(formData.monto),
        fecha_pago: new Date().toISOString().split('T')[0],
        metodo_pago: metodo_info,
        referencia: formData.referencia,
        estado: 'pendiente'
      }

      const res = await fetch('/api/pagos', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Error ${res.status}`)
      }

      // TODO: Si hay comprobante de imagen, subirlo al servidor
      // Aquí podrías implementar upload de archivo si tienes endpoint para ello

      await fetchPagos()
      setShowForm(false)
      setFormData({
        tipo_pago: 'mensualidad',
        monto: '',
        metodo_pago: '',
        referencia: '',
        numero_tarjeta: '',
        nombre_titular: '',
        fecha_vencimiento: '',
        cvv: '',
        comprobante_imagen: null
      })
    } catch (e: any) {
      setError(e?.message || 'Error enviando pago')
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

  if (!auth.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Acceso Restringido</h3>
          <p className="text-gray-600">Debes iniciar sesión para acceder a tus pagos.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-purple-900 rounded-2xl shadow-2xl p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-3 justify-center sm:justify-start mb-2">
                <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white">Mis Pagos</h1>
                  <p className="text-blue-100 text-sm">Historial y gestión de pagos</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-blue-900 rounded-xl font-semibold hover:shadow-2xl transition-all hover:scale-105"
            >
              {showForm ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancelar
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Registrar Pago
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3 animate-slide-down">
            <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-semibold text-red-800">Error</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {loading && !showForm && (
          <div className="mb-6 flex items-center justify-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-blue-700 font-medium">Cargando pagos...</span>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 bg-white rounded-2xl shadow-xl p-6 border border-blue-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Registrar Nuevo Pago</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Pago</label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  value={formData.tipo_pago}
                  onChange={(e) => setFormData({ ...formData, tipo_pago: e.target.value as any })}
                  required
                >
                  <option value="mensualidad">📚 Mensualidad</option>
                  <option value="matricula">🎓 Matrícula</option>
                  <option value="otro">📋 Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Monto a Pagar</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                  <input
                    type="text"
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-semibold cursor-not-allowed"
                    value={Number(formData.monto || 0).toFixed(2)}
                    readOnly
                    disabled
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Monto establecido según el tipo de pago</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Método de Pago</label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  value={formData.metodo_pago}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    metodo_pago: e.target.value,
                    numero_tarjeta: '',
                    nombre_titular: '',
                    fecha_vencimiento: '',
                    cvv: '',
                    comprobante_imagen: null
                  })}
                  required
                >
                  <option value="">Seleccione un método</option>
                  <option value="tarjeta_credito">💳 Tarjeta de Crédito</option>
                  <option value="tarjeta_debito">💳 Tarjeta de Débito</option>
                  <option value="transferencia">🏦 Transferencia Bancaria</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Referencia</label>
                <div className="px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50">
                  <input
                    className="w-full bg-transparent outline-none text-sm font-mono text-gray-600"
                    value={formData.referencia}
                    readOnly
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Generada automáticamente</p>
                </div>
              </div>
            </div>

            {/* Campos de tarjeta de crédito/débito */}
            {(formData.metodo_pago === 'tarjeta_credito' || formData.metodo_pago === 'tarjeta_debito') && (
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 mb-6 animate-slide-down">
                <div className="flex items-center gap-3 mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <h4 className="font-bold text-lg text-blue-900">Información de la Tarjeta</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-blue-900 mb-2">Número de Tarjeta</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-mono"
                      placeholder="1234 5678 9012 3456"
                      value={formData.numero_tarjeta}
                      onChange={(e) => {
                        const valor = e.target.value.replace(/\D/g, '').slice(0, 16)
                        setFormData({ ...formData, numero_tarjeta: valor })
                      }}
                      maxLength={16}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-blue-900 mb-2">Nombre del Titular</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 uppercase"
                      placeholder="COMO APARECE EN LA TARJETA"
                      value={formData.nombre_titular}
                      onChange={(e) => setFormData({ ...formData, nombre_titular: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-900 mb-2">Fecha de Vencimiento</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-mono"
                      placeholder="MM/AA"
                      value={formData.fecha_vencimiento}
                      onChange={(e) => {
                        let valor = e.target.value.replace(/\D/g, '')
                        if (valor.length >= 2) {
                          valor = valor.slice(0, 2) + '/' + valor.slice(2, 4)
                        }
                        setFormData({ ...formData, fecha_vencimiento: valor })
                      }}
                      maxLength={5}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-900 mb-2">CVV</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-mono text-center"
                      placeholder="•••"
                      value={formData.cvv}
                      onChange={(e) => {
                        const valor = e.target.value.replace(/\D/g, '').slice(0, 3)
                        setFormData({ ...formData, cvv: valor })
                      }}
                      maxLength={3}
                      required
                    />
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-200/50 rounded-lg flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-xs text-blue-800">Tu información está protegida</p>
                </div>
              </div>
            )}

            {/* Campo de comprobante para transferencia */}
            {formData.metodo_pago === 'transferencia' && (
              <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 mb-6 animate-slide-down">
                <div className="flex items-center gap-3 mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h4 className="font-bold text-lg text-green-900">Comprobante de Transferencia</h4>
                </div>
                <div className="space-y-4">
                  <label className="block">
                    <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg cursor-pointer hover:shadow-xl transition-all hover:scale-105 text-center font-semibold">
                      {formData.comprobante_imagen ? (
                        <div className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Archivo seleccionado
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          Seleccionar comprobante
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null
                        setFormData({ ...formData, comprobante_imagen: file })
                      }}
                      required
                    />
                  </label>
                  {formData.comprobante_imagen && (
                    <div className="p-3 bg-green-200/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-green-800">{formData.comprobante_imagen.name}</p>
                          <p className="text-xs text-green-700">{(formData.comprobante_imagen.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Formatos aceptados: JPG, PNG. Máximo 5MB
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button 
                type="submit" 
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Enviar Pago
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Fecha</th>
                  <th className="px-6 py-4 text-left font-semibold">Tipo</th>
                  <th className="px-6 py-4 text-left font-semibold">Monto</th>
                  <th className="px-6 py-4 text-left font-semibold">Método</th>
                  <th className="px-6 py-4 text-left font-semibold">Referencia</th>
                  <th className="px-6 py-4 text-center font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {pagos.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium">No hay pagos registrados</p>
                          <p className="text-sm text-gray-500">Registra tu primer pago para comenzar</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                {pagos.map((pago, idx) => (
                  <tr key={pago.id} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-700">
                          {pago.fecha_pago 
                            ? new Date(pago.fecha_pago).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })
                            : pago.creado_en 
                              ? new Date(pago.creado_en).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })
                              : '-'
                          }
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
                        {pago.tipo_pago === 'mensualidad' && '📚'}
                        {pago.tipo_pago === 'matricula' && '🎓'}
                        {pago.tipo_pago === 'otro' && '📋'}
                        {pago.tipo_pago}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-gray-800">${Number(pago.monto || 0).toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 text-sm">{pago.metodo_pago || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-700">
                        {pago.referencia || '-'}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase ${getEstadoBadge(pago.estado)}`}>
                        {pago.estado === 'pagado' && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {pago.estado === 'pendiente' && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {pago.estado === 'anulado' && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        {pago.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
