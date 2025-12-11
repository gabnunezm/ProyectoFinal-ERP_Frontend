import { useState } from 'react'

type HeroProps = {
  title: string
  subtitle: string
}

export default function Hero({ title, subtitle }: HeroProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    descripcion: ''
  })
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Obtener solicitudes existentes de localStorage
      const existentes = JSON.parse(localStorage.getItem('solicitudes_informacion') || '[]')
      
      // Crear nueva solicitud con los datos del formulario
      const nuevaSolicitud = {
        id: Date.now(),
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        mensaje: formData.descripcion,
        fecha_solicitud: new Date().toISOString()
      }
      
      // Agregar la nueva solicitud al array
      existentes.push(nuevaSolicitud)
      
      // Guardar en localStorage
      localStorage.setItem('solicitudes_informacion', JSON.stringify(existentes))
      
      setIsSubmitting(false)
      setShowSuccess(true)
      
      // Limpiar formulario
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        descripcion: ''
      })

      // Ocultar notificación después de 4 segundos
      setTimeout(() => {
        setShowSuccess(false)
      }, 4000)
    } catch (error) {
      console.error('❌ Error al enviar solicitud desde Hero:', error)
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <section className="relative bg-gradient-to-r from-blue-950 via-blue-800 to-blue-700 text-white py-24 px-6 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-block mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-semibold">
              🎓 Formando líderes desde 1975
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
              {title}
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mb-8 leading-relaxed">
              {subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <a 
                href="/admisiones" 
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-900 px-8 py-4 rounded-lg font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Proceso de Admisión
              </a>
              <a 
                href="#programas" 
                className="inline-flex items-center justify-center gap-2 border-2 border-white/80 backdrop-blur-sm px-8 py-4 rounded-lg font-bold text-white hover:bg-white hover:text-blue-900 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Explorar Programas
              </a>
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-2xl relative">
              {/* Notificación de éxito */}
              {showSuccess && (
                <div className="absolute top-4 left-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-down z-10">
                  <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-bold">¡Solicitud enviada!</div>
                    <div className="text-sm text-green-100">Nos pondremos en contacto contigo pronto.</div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-2xl">Solicita Información</h3>
              </div>
              <p className="text-blue-100 mb-6">
                Déjanos tus datos y un asesor te contactará con información sobre admisiones, becas y programas.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input 
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 placeholder-blue-200 text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all" 
                    placeholder="Nombre completo"
                    required
                  />
                </div>
                <div>
                  <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 placeholder-blue-200 text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all" 
                    placeholder="Correo electrónico"
                    required
                  />
                </div>
                <div>
                  <input 
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 placeholder-blue-200 text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all" 
                    placeholder="Teléfono"
                    required
                  />
                </div>
                <div>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 placeholder-blue-200 text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all resize-none"
                    placeholder="Cuéntanos qué información te gustaría recibir"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-white text-blue-900 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Enviar Solicitud
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
