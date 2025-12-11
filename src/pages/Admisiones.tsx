import { useState } from 'react'

export default function Admisiones() {
  const [formData, setFormData] = useState({
    // Datos Personales
    nombres: '',
    apellidos: '',
    documento_identidad: '',
    fecha_nacimiento: '',
    genero: '',
    estado_civil: '',
    nacionalidad: '',
    
    // Contacto
    email: '',
    telefono: '',
    telefono_emergencia: '',
    direccion: '',
    ciudad: '',
    codigo_postal: '',
    
    // Información Académica
    programa_interes: '',
    modalidad: '',
    nivel_educacion: '',
    institucion_procedencia: '',
    promedio_academico: '',
    
    // Información Adicional
    como_conocio: '',
    requiere_beca: '',
    informacion_adicional: ''
  })

  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Obtener solicitudes existentes
      const existentes = JSON.parse(localStorage.getItem('solicitudes_admisiones') || '[]')
      
      // Agregar nueva solicitud
      const nuevaSolicitud = {
        id: Date.now(),
        ...formData,
        fecha_solicitud: new Date().toISOString()
      }
      
      existentes.push(nuevaSolicitud)
      localStorage.setItem('solicitudes_admisiones', JSON.stringify(existentes))
      
      setShowSuccess(true)
      
      // Limpiar formulario
      setFormData({
        nombres: '',
        apellidos: '',
        documento_identidad: '',
        fecha_nacimiento: '',
        genero: '',
        estado_civil: '',
        nacionalidad: '',
        email: '',
        telefono: '',
        telefono_emergencia: '',
        direccion: '',
        ciudad: '',
        codigo_postal: '',
        programa_interes: '',
        modalidad: '',
        nivel_educacion: '',
        institucion_procedencia: '',
        promedio_academico: '',
        como_conocio: '',
        requiere_beca: '',
        informacion_adicional: ''
      })

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })

      // Ocultar notificación
      setTimeout(() => {
        setShowSuccess(false)
      }, 4000)
    } catch (error) {
      console.error('Error al enviar solicitud:', error)
      alert('Error al enviar la solicitud. Por favor intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white py-12">
      <div className="container mx-auto px-4">
        {/* Notificación de éxito */}
        {showSuccess && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md animate-slide-down">
            <div className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg mb-1">¡Solicitud Enviada Exitosamente!</div>
                <p className="text-sm text-green-100">
                  Hemos recibido tu solicitud de admisión. Nuestro equipo revisará tu información y te contactaremos pronto.
                </p>
              </div>
              <button onClick={() => setShowSuccess(false)} className="flex-shrink-0 hover:bg-green-600 rounded-lg p-1 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
            </svg>
          </div>
          <h1 className="text-5xl font-bold text-blue-950 mb-4">Solicitud de Admisión</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Completa el siguiente formulario para iniciar tu proceso de admisión a la Universidad. 
            Todos los campos marcados con (*) son obligatorios.
          </p>
        </div>

        {/* Pasos */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Datos Personales' },
              { num: 2, label: 'Contacto' },
              { num: 3, label: 'Información Académica' },
              { num: 4, label: 'Finalizar' }
            ].map((step, idx) => (
              <div key={idx} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    {step.num}
                  </div>
                  <span className="text-sm font-medium text-gray-700 mt-2 hidden md:block">{step.label}</span>
                </div>
                {idx < 3 && (
                  <div className="flex-1 h-1 bg-gradient-to-r from-blue-600 to-blue-700 mx-2"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
          {/* Datos Personales */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-blue-100">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-blue-950">Datos Personales</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombres <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Juan Carlos"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Apellidos <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="García López"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Documento de Identidad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="documento_identidad"
                  value={formData.documento_identidad}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="1234567890"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha de Nacimiento <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="fecha_nacimiento"
                  value={formData.fecha_nacimiento}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Género <span className="text-red-500">*</span>
                </label>
                <select
                  name="genero"
                  value={formData.genero}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                  <option value="prefiero_no_decir">Prefiero no decir</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Estado Civil <span className="text-red-500">*</span>
                </label>
                <select
                  name="estado_civil"
                  value={formData.estado_civil}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="soltero">Soltero(a)</option>
                  <option value="casado">Casado(a)</option>
                  <option value="divorciado">Divorciado(a)</option>
                  <option value="viudo">Viudo(a)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nacionalidad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nacionalidad"
                  value={formData.nacionalidad}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Ej: Mexicana, Colombiana, etc."
                  required
                />
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-blue-100">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-blue-950">Información de Contacto</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Correo Electrónico <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Teléfono de Emergencia <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="telefono_emergencia"
                  value={formData.telefono_emergencia}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="+1 (555) 987-6543"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ciudad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Ciudad"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dirección Completa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Calle, Número, Colonia, etc."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Código Postal
                </label>
                <input
                  type="text"
                  name="codigo_postal"
                  value={formData.codigo_postal}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="12345"
                />
              </div>
            </div>
          </div>

          {/* Información Académica */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-blue-100">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-blue-950">Información Académica</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Programa de Interés <span className="text-red-500">*</span>
                </label>
                <select
                  name="programa_interes"
                  value={formData.programa_interes}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Seleccionar programa</option>
                  <optgroup label="Ingeniería y Tecnología">
                    <option value="ingenieria_civil">Ingeniería Civil</option>
                    <option value="ingenieria_sistemas">Ingeniería de Sistemas</option>
                    <option value="ingenieria_industrial">Ingeniería Industrial</option>
                  </optgroup>
                  <optgroup label="Ciencias Sociales">
                    <option value="administracion">Administración de Empresas</option>
                    <option value="economia">Economía</option>
                    <option value="psicologia">Psicología</option>
                  </optgroup>
                  <optgroup label="Ciencias de la Salud">
                    <option value="medicina">Medicina</option>
                    <option value="enfermeria">Enfermería</option>
                    <option value="nutricion">Nutrición</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Modalidad de Estudio <span className="text-red-500">*</span>
                </label>
                <select
                  name="modalidad"
                  value={formData.modalidad}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="presencial">Presencial</option>
                  <option value="hibrida">Híbrida</option>
                  <option value="virtual">Virtual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nivel de Educación Actual <span className="text-red-500">*</span>
                </label>
                <select
                  name="nivel_educacion"
                  value={formData.nivel_educacion}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="bachillerato_cursando">Bachillerato (Cursando)</option>
                  <option value="bachillerato_completo">Bachillerato (Completo)</option>
                  <option value="tecnico">Técnico</option>
                  <option value="licenciatura">Licenciatura</option>
                  <option value="posgrado">Posgrado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Promedio Académico <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="promedio_academico"
                  value={formData.promedio_academico}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  max="10"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="8.5"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Institución de Procedencia <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="institucion_procedencia"
                  value={formData.institucion_procedencia}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Nombre de la institución educativa"
                  required
                />
              </div>
            </div>
          </div>

          {/* Información Adicional */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-blue-100">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-blue-950">Información Adicional</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ¿Cómo conociste la Universidad? <span className="text-red-500">*</span>
                </label>
                <select
                  name="como_conocio"
                  value={formData.como_conocio}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="redes_sociales">Redes Sociales</option>
                  <option value="recomendacion">Recomendación</option>
                  <option value="feria_educativa">Feria Educativa</option>
                  <option value="busqueda_internet">Búsqueda en Internet</option>
                  <option value="publicidad">Publicidad</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ¿Requieres Beca o Financiamiento? <span className="text-red-500">*</span>
                </label>
                <select
                  name="requiere_beca"
                  value={formData.requiere_beca}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                  <option value="mas_informacion">Me gustaría más información</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Información Adicional o Comentarios
                </label>
                <textarea
                  name="informacion_adicional"
                  value={formData.informacion_adicional}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Cuéntanos más sobre ti, tus intereses o cualquier pregunta que tengas..."
                />
              </div>
            </div>
          </div>

          {/* Términos y Condiciones */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terminos"
                required
                className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="terminos" className="text-sm text-gray-700">
                Acepto los <a href="#" className="text-blue-700 font-semibold hover:underline">términos y condiciones</a> y 
                la <a href="#" className="text-blue-700 font-semibold hover:underline">política de privacidad</a>. 
                Autorizo a la Universidad a usar mis datos personales para el proceso de admisión y comunicaciones relacionadas.
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting} 
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Enviando Solicitud...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Enviar Solicitud
                </>
              )}
            </button>
          </div>
        </form>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-200 text-center">
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-blue-950 mb-2">Respuesta en 48 horas</h3>
            <p className="text-gray-600 text-sm">Revisaremos tu solicitud y te contactaremos pronto</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl border border-green-200 text-center">
            <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-green-900 mb-2">Datos Seguros</h3>
            <p className="text-gray-600 text-sm">Tu información está segura con nosotros</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-200 text-center">
            <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-purple-900 mb-2">Asesoría Gratuita</h3>
            <p className="text-gray-600 text-sm">Te ayudamos en cada paso del proceso</p>
          </div>
        </div>
      </div>
    </div>
  )
}
