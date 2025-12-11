import { useEffect, useState } from 'react'

// Función para formatear valores
function formatearValor(valor: string): string {
  if (!valor) return valor
  
  const mapaValores: { [key: string]: string } = {
    // Género
    'masculino': 'Masculino',
    'femenino': 'Femenino',
    'prefiero_no_decir': 'Prefiero no decir',
    
    // Estado Civil
    'soltero': 'Soltero(a)',
    'casado': 'Casado(a)',
    'divorciado': 'Divorciado(a)',
    'viudo': 'Viudo(a)',
    
    // Modalidad
    'presencial': 'Presencial',
    'hibrida': 'Híbrida',
    'virtual': 'Virtual',
    
    // Nivel de Educación
    'bachillerato_cursando': 'Bachillerato (Cursando)',
    'bachillerato_completo': 'Bachillerato (Completo)',
    'tecnico': 'Técnico',
    'licenciatura': 'Licenciatura',
    'posgrado': 'Posgrado',
    
    // Programas
    'ingenieria_civil': 'Ingeniería Civil',
    'ingenieria_sistemas': 'Ingeniería de Sistemas',
    'ingenieria_industrial': 'Ingeniería Industrial',
    'administracion': 'Administración de Empresas',
    'economia': 'Economía',
    'psicologia': 'Psicología',
    'medicina': 'Medicina',
    'enfermeria': 'Enfermería',
    'nutricion': 'Nutrición',
    
    // Cómo conoció
    'redes_sociales': 'Redes Sociales',
    'recomendacion': 'Recomendación',
    'feria_educativa': 'Feria Educativa',
    'busqueda_internet': 'Búsqueda en Internet',
    'publicidad': 'Publicidad',
    
    // Requiere Beca
    'si': 'Sí',
    'no': 'No',
    
    // Otros
    'otro': 'Otro'
  }
  
  // Si existe en el mapa, retornar el valor formateado
  if (mapaValores[valor.toLowerCase()]) {
    return mapaValores[valor.toLowerCase()]
  }
  
  // Si no está en el mapa, formatear snake_case a título
  return valor
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

type SolicitudAdmision = {
  id: number
  nombres: string
  apellidos: string
  documento_identidad: string
  fecha_nacimiento: string
  genero: string
  estado_civil: string
  nacionalidad: string
  email: string
  telefono: string
  telefono_emergencia: string
  direccion: string
  ciudad: string
  codigo_postal: string
  programa_interes: string
  modalidad: string
  nivel_educacion: string
  institucion_procedencia: string
  promedio_academico: string
  como_conocio: string
  requiere_beca: string
  informacion_adicional: string
  fecha_solicitud: string
  estado?: string
}

type SolicitudInformacion = {
  id: number
  nombre: string
  email: string
  telefono: string
  mensaje: string
  fecha_solicitud: string
}

export default function GestionSolicitudes() {
  const [filter, setFilter] = useState<'admisiones' | 'informacion'>('admisiones')
  const [admisiones, setAdmisiones] = useState<SolicitudAdmision[]>([])
  const [informacion, setInformacion] = useState<SolicitudInformacion[]>([])
  const [loading, setLoading] = useState(false)
  const [showRespuesta, setShowRespuesta] = useState(false)
  const [showEditar, setShowEditar] = useState(false)
  const [showDetalleMensaje, setShowDetalleMensaje] = useState(false)
  const [showDetalleAdmision, setShowDetalleAdmision] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [selectedSolicitud, setSelectedSolicitud] = useState<any>(null)
  const [mensajeDetalle, setMensajeDetalle] = useState<SolicitudInformacion | null>(null)
  const [admisionDetalle, setAdmisionDetalle] = useState<SolicitudAdmision | null>(null)
  const [respuestaTexto, setRespuestaTexto] = useState('')
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [editFormData, setEditFormData] = useState<SolicitudAdmision | null>(null)

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  async function fetchData() {
    setLoading(true)
    try {
      if (filter === 'admisiones') {
        const data = JSON.parse(localStorage.getItem('solicitudes_admisiones') || '[]')
        setAdmisiones(data)
      } else {
        const data = JSON.parse(localStorage.getItem('solicitudes_informacion') || '[]')
        setInformacion(data)
      }
    } catch (error) {
      console.error('Error al cargar solicitudes:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: number, tipo: 'admisiones' | 'informacion') {
    if (!confirm('¿Está seguro de eliminar esta solicitud?')) return

    try {
      const key = tipo === 'admisiones' ? 'solicitudes_admisiones' : 'solicitudes_informacion'
      const data = JSON.parse(localStorage.getItem(key) || '[]')
      const filtered = data.filter((item: any) => item.id !== id)
      localStorage.setItem(key, JSON.stringify(filtered))
      
      showNotification('success', 'Solicitud eliminada exitosamente')
      fetchData()
    } catch (error) {
      showNotification('error', 'Error al eliminar solicitud')
    }
  }

  async function handleResponder() {
    if (!respuestaTexto.trim()) {
      showNotification('error', 'Por favor ingrese una respuesta')
      return
    }

    try {
      showNotification('success', '✅ La solicitud fue respondida exitosamente')
      setShowRespuesta(false)
      setRespuestaTexto('')
      setSelectedSolicitud(null)
    } catch (error) {
      showNotification('error', 'Error al enviar respuesta')
    }
  }

  async function handleActualizar() {
    if (!editFormData) return

    try {
      const data = JSON.parse(localStorage.getItem('solicitudes_admisiones') || '[]')
      const index = data.findIndex((item: any) => item.id === editFormData.id)
      
      if (index !== -1) {
        data[index] = editFormData
        localStorage.setItem('solicitudes_admisiones', JSON.stringify(data))
        
        showNotification('success', 'Solicitud actualizada exitosamente')
        setShowEditar(false)
        setEditFormData(null)
        fetchData()
      } else {
        showNotification('error', 'Error al actualizar solicitud')
      }
    } catch (error) {
      showNotification('error', 'Error al actualizar solicitud')
    }
  }

  function showNotification(type: 'success' | 'error', message: string) {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 4000)
  }

  function openRespuesta(solicitud: any) {
    setSelectedSolicitud(solicitud)
    setShowRespuesta(true)
  }

  function openDetalleMensaje(solicitud: SolicitudInformacion) {
    setMensajeDetalle(solicitud)
    setShowDetalleMensaje(true)
  }

  function openDetalleAdmision(solicitud: SolicitudAdmision) {
    setAdmisionDetalle({ ...solicitud })
    setModoEdicion(false)
    setShowDetalleAdmision(true)
  }

  function handleActualizarAdmision() {
    if (!admisionDetalle) return

    try {
      const data = JSON.parse(localStorage.getItem('solicitudes_admisiones') || '[]')
      const index = data.findIndex((item: any) => item.id === admisionDetalle.id)
      
      if (index !== -1) {
        data[index] = admisionDetalle
        localStorage.setItem('solicitudes_admisiones', JSON.stringify(data))
        
        showNotification('success', 'Solicitud actualizada exitosamente')
        setModoEdicion(false)
        fetchData()
      } else {
        showNotification('error', 'Error al actualizar solicitud')
      }
    } catch (error) {
      showNotification('error', 'Error al actualizar solicitud')
    }
  }

  return (
    <div className="p-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-20 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl animate-slide-down ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white flex items-center gap-3`}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            {notification.type === 'success' ? (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            )}
          </svg>
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Solicitudes</h2>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setFilter('admisiones')}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              filter === 'admisiones'
                ? 'bg-white text-indigo-700 shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Admisiones
          </button>
          <button
            onClick={() => setFilter('informacion')}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              filter === 'informacion'
                ? 'bg-white text-purple-700 shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Información
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando solicitudes...</p>
        </div>
      )}

      {/* Admisiones Table */}
      {!loading && filter === 'admisiones' && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Nombre Completo</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Teléfono</th>
                  <th className="px-4 py-3 text-left">Programa</th>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {admisiones.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                      <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="font-medium">No hay solicitudes de admisión</p>
                    </td>
                  </tr>
                ) : (
                  admisiones.map((sol, idx) => (
                    <tr key={sol.id} className={`border-b hover:bg-indigo-50 transition-colors ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                      <td className="px-4 py-3 font-medium text-gray-800">{sol.nombres} {sol.apellidos}</td>
                      <td className="px-4 py-3 text-gray-600">{sol.email}</td>
                      <td className="px-4 py-3 text-gray-600">{sol.telefono}</td>
                      <td className="px-4 py-3 text-gray-600">{formatearValor(sol.programa_interes)}</td>
                      <td className="px-4 py-3 text-gray-600 text-sm">{new Date(sol.fecha_solicitud).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openDetalleAdmision(sol)}
                            className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                            title="Ver Detalle"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(sol.id, 'admisiones')}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Información Table */}
      {!loading && filter === 'informacion' && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Teléfono</th>
                  <th className="px-4 py-3 text-left">Mensaje</th>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {informacion.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                      <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="font-medium">No hay solicitudes de información</p>
                    </td>
                  </tr>
                ) : (
                  informacion.map((sol, idx) => (
                    <tr key={sol.id} className={`border-b hover:bg-purple-50 transition-colors ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                      <td className="px-4 py-3 font-medium text-gray-800">{sol.nombre}</td>
                      <td className="px-4 py-3 text-gray-600">{sol.email}</td>
                      <td className="px-4 py-3 text-gray-600">{sol.telefono || '-'}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{sol.mensaje}</td>
                      <td className="px-4 py-3 text-gray-600 text-sm">{new Date(sol.fecha_solicitud).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openDetalleMensaje(sol)}
                            className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                            title="Ver Detalle"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openRespuesta(sol)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Responder"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(sol.id, 'informacion')}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Detalle Admisión */}
      {showDetalleAdmision && admisionDetalle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between sticky top-0">
              <h3 className="text-xl font-bold text-white">
                {modoEdicion ? 'Editar Solicitud de Admisión' : 'Detalle de Solicitud de Admisión'}
              </h3>
              <button 
                onClick={() => {
                  setShowDetalleAdmision(false)
                  setModoEdicion(false)
                }}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {/* Datos Personales */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-indigo-900 mb-4 pb-2 border-b-2 border-indigo-200">Datos Personales</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nombres</label>
                    {modoEdicion ? (
                      <input
                        type="text"
                        value={admisionDetalle.nombres}
                        onChange={(e) => setAdmisionDetalle({ ...admisionDetalle, nombres: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{admisionDetalle.nombres}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Apellidos</label>
                    {modoEdicion ? (
                      <input
                        type="text"
                        value={admisionDetalle.apellidos}
                        onChange={(e) => setAdmisionDetalle({ ...admisionDetalle, apellidos: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{admisionDetalle.apellidos}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Documento de Identidad</label>
                    {modoEdicion ? (
                      <input
                        type="text"
                        value={admisionDetalle.documento_identidad}
                        onChange={(e) => setAdmisionDetalle({ ...admisionDetalle, documento_identidad: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900">{admisionDetalle.documento_identidad}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de Nacimiento</label>
                    {modoEdicion ? (
                      <input
                        type="date"
                        value={admisionDetalle.fecha_nacimiento}
                        onChange={(e) => setAdmisionDetalle({ ...admisionDetalle, fecha_nacimiento: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900">{new Date(admisionDetalle.fecha_nacimiento).toLocaleDateString('es-ES')}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Género</label>
                    {modoEdicion ? (
                      <input
                        type="text"
                        value={admisionDetalle.genero}
                        onChange={(e) => setAdmisionDetalle({ ...admisionDetalle, genero: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900">{formatearValor(admisionDetalle.genero)}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Estado Civil</label>
                    {modoEdicion ? (
                      <input
                        type="text"
                        value={admisionDetalle.estado_civil}
                        onChange={(e) => setAdmisionDetalle({ ...admisionDetalle, estado_civil: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900">{formatearValor(admisionDetalle.estado_civil)}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nacionalidad</label>
                    {modoEdicion ? (
                      <input
                        type="text"
                        value={admisionDetalle.nacionalidad}
                        onChange={(e) => setAdmisionDetalle({ ...admisionDetalle, nacionalidad: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900">{admisionDetalle.nacionalidad}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-indigo-900 mb-4 pb-2 border-b-2 border-indigo-200">Información de Contacto</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                    {modoEdicion ? (
                      <input
                        type="email"
                        value={admisionDetalle.email}
                        onChange={(e) => setAdmisionDetalle({ ...admisionDetalle, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900">{admisionDetalle.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
                    {modoEdicion ? (
                      <input
                        type="text"
                        value={admisionDetalle.telefono}
                        onChange={(e) => setAdmisionDetalle({ ...admisionDetalle, telefono: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900">{admisionDetalle.telefono}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono de Emergencia</label>
                    {modoEdicion ? (
                      <input
                        type="text"
                        value={admisionDetalle.telefono_emergencia}
                        onChange={(e) => setAdmisionDetalle({ ...admisionDetalle, telefono_emergencia: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900">{admisionDetalle.telefono_emergencia}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Ciudad</label>
                    {modoEdicion ? (
                      <input
                        type="text"
                        value={admisionDetalle.ciudad}
                        onChange={(e) => setAdmisionDetalle({ ...admisionDetalle, ciudad: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900">{admisionDetalle.ciudad}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Dirección</label>
                    {modoEdicion ? (
                      <input
                        type="text"
                        value={admisionDetalle.direccion}
                        onChange={(e) => setAdmisionDetalle({ ...admisionDetalle, direccion: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900">{admisionDetalle.direccion}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Código Postal</label>
                    {modoEdicion ? (
                      <input
                        type="text"
                        value={admisionDetalle.codigo_postal}
                        onChange={(e) => setAdmisionDetalle({ ...admisionDetalle, codigo_postal: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900">{admisionDetalle.codigo_postal}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Información Académica */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-indigo-900 mb-4 pb-2 border-b-2 border-indigo-200">Información Académica</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Programa de Interés</label>
                    {modoEdicion ? (
                      <input
                        type="text"
                        value={admisionDetalle.programa_interes}
                        onChange={(e) => setAdmisionDetalle({ ...admisionDetalle, programa_interes: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{formatearValor(admisionDetalle.programa_interes)}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Modalidad</label>
                    {modoEdicion ? (
                      <input
                        type="text"
                        value={admisionDetalle.modalidad}
                        onChange={(e) => setAdmisionDetalle({ ...admisionDetalle, modalidad: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900">{formatearValor(admisionDetalle.modalidad)}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nivel de Educación</label>
                    {modoEdicion ? (
                      <input
                        type="text"
                        value={admisionDetalle.nivel_educacion}
                        onChange={(e) => setAdmisionDetalle({ ...admisionDetalle, nivel_educacion: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900">{formatearValor(admisionDetalle.nivel_educacion)}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Institución de Procedencia</label>
                    {modoEdicion ? (
                      <input
                        type="text"
                        value={admisionDetalle.institucion_procedencia}
                        onChange={(e) => setAdmisionDetalle({ ...admisionDetalle, institucion_procedencia: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900">{admisionDetalle.institucion_procedencia}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Promedio Académico</label>
                    {modoEdicion ? (
                      <input
                        type="text"
                        value={admisionDetalle.promedio_academico}
                        onChange={(e) => setAdmisionDetalle({ ...admisionDetalle, promedio_academico: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900">{admisionDetalle.promedio_academico}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Información Adicional */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-indigo-900 mb-4 pb-2 border-b-2 border-indigo-200">Información Adicional</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">¿Cómo conoció la Universidad?</label>
                    {modoEdicion ? (
                      <input
                        type="text"
                        value={admisionDetalle.como_conocio}
                        onChange={(e) => setAdmisionDetalle({ ...admisionDetalle, como_conocio: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900">{formatearValor(admisionDetalle.como_conocio)}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Requiere Beca</label>
                    {modoEdicion ? (
                      <input
                        type="text"
                        value={admisionDetalle.requiere_beca}
                        onChange={(e) => setAdmisionDetalle({ ...admisionDetalle, requiere_beca: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900">{formatearValor(admisionDetalle.requiere_beca)}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Información Adicional</label>
                    {modoEdicion ? (
                      <textarea
                        value={admisionDetalle.informacion_adicional}
                        onChange={(e) => setAdmisionDetalle({ ...admisionDetalle, informacion_adicional: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-gray-900 whitespace-pre-wrap">{admisionDetalle.informacion_adicional || 'N/A'}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de Solicitud</label>
                    <p className="text-gray-900">{new Date(admisionDetalle.fecha_solicitud).toLocaleString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                {modoEdicion ? (
                  <>
                    <button
                      onClick={handleActualizarAdmision}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
                    >
                      Guardar Cambios
                    </button>
                    <button
                      onClick={() => setModoEdicion(false)}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setModoEdicion(true)}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg font-semibold flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setShowDetalleAdmision(false)
                        openRespuesta(admisionDetalle)
                      }}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Responder
                    </button>
                    <button
                      onClick={() => {
                        setShowDetalleAdmision(false)
                        setModoEdicion(false)
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                    >
                      Cerrar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle Solicitud */}
      {showDetalleMensaje && mensajeDetalle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Detalle de Solicitud</h3>
              <button 
                onClick={() => setShowDetalleMensaje(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
                  <p className="text-gray-900 font-medium">{mensajeDetalle.nombre}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{mensajeDetalle.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
                    <p className="text-gray-900">{mensajeDetalle.telefono || 'No proporcionado'}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de Solicitud</label>
                  <p className="text-gray-900">{new Date(mensajeDetalle.fecha_solicitud).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mensaje Completo</label>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{mensajeDetalle.mensaje}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowDetalleMensaje(false)
                    openRespuesta(mensajeDetalle)
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg font-semibold flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Responder
                </button>
                <button
                  onClick={() => setShowDetalleMensaje(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Responder */}
      {showRespuesta && selectedSolicitud && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Responder Solicitud</h3>
              <button
                onClick={() => { setShowRespuesta(false); setRespuestaTexto(''); }}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Para:</label>
                <div className="px-4 py-3 bg-gray-100 rounded-lg text-gray-800 font-medium">
                  {selectedSolicitud.email}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Respuesta:</label>
                <textarea
                  value={respuestaTexto}
                  onChange={(e) => setRespuestaTexto(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Escriba su respuesta aquí..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleResponder}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
                >
                  Enviar Respuesta
                </button>
                <button
                  onClick={() => { setShowRespuesta(false); setRespuestaTexto(''); }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {showEditar && editFormData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 px-6 py-4 flex items-center justify-between sticky top-0">
              <h3 className="text-xl font-bold text-white">Editar Solicitud de Admisión</h3>
              <button
                onClick={() => { setShowEditar(false); setEditFormData(null); }}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nombres</label>
                  <input
                    type="text"
                    value={editFormData.nombres}
                    onChange={(e) => setEditFormData({ ...editFormData, nombres: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Apellidos</label>
                  <input
                    type="text"
                    value={editFormData.apellidos}
                    onChange={(e) => setEditFormData({ ...editFormData, apellidos: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
                  <input
                    type="text"
                    value={editFormData.telefono}
                    onChange={(e) => setEditFormData({ ...editFormData, telefono: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Programa de Interés</label>
                  <input
                    type="text"
                    value={editFormData.programa_interes}
                    onChange={(e) => setEditFormData({ ...editFormData, programa_interes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Modalidad</label>
                  <input
                    type="text"
                    value={editFormData.modalidad}
                    onChange={(e) => setEditFormData({ ...editFormData, modalidad: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleActualizar}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
                >
                  Actualizar Solicitud
                </button>
                <button
                  onClick={() => { setShowEditar(false); setEditFormData(null); }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
