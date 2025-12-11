import Hero from '../components/Hero'
import HighlightCard from '../components/HighlightCard'
import NewsList from '../components/NewsList'
import Footer from '../components/Footer'
import { useState } from 'react'
import { useAuth } from '../auth.tsx'
import { useNavigate } from 'react-router-dom'

function SolicitudInfoModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [formData, setFormData] = useState({ nombre: '', email: '', telefono: '', mensaje: '' })
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)

    try {
      // Obtener solicitudes existentes
      const existentes = JSON.parse(localStorage.getItem('solicitudes_informacion') || '[]')
      
      // Agregar nueva solicitud
      const nuevaSolicitud = {
        id: Date.now(),
        ...formData,
        fecha_solicitud: new Date().toISOString()
      }
      
      existentes.push(nuevaSolicitud)
      localStorage.setItem('solicitudes_informacion', JSON.stringify(existentes))
      
      setEnviado(true)
      setFormData({ nombre: '', email: '', telefono: '', mensaje: '' })
      setTimeout(() => {
        setEnviado(false)
        onClose()
      }, 3000)
    } catch (error) {
      console.error('❌ Error al enviar solicitud:', error)
    } finally {
      setEnviando(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Solicitar Información</h3>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {enviado ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Solicitud Enviada!</h3>
            <p className="text-gray-600">Nos pondremos en contacto contigo pronto.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(123) 456-7890"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mensaje *</label>
                <textarea
                  required
                  value={formData.mensaje}
                  onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="¿Qué información te gustaría recibir?"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={enviando}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg font-semibold disabled:opacity-50"
              >
                {enviando ? 'Enviando...' : 'Enviar Solicitud'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function LoginBox() {
  const auth = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (auth.user) {
    return null
  }

  async function submit(e: any) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await auth.login(email, password)
    } catch (err: any) {
      setError(err.message || 'Error login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-lg border border-blue-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h4 className="font-bold text-xl text-blue-950">Acceso al Portal</h4>
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
          <input 
            type="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
            placeholder="usuario@ejemplo.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
            placeholder="••••••••"
            required
          />
        </div>
        <button 
          disabled={loading} 
          className="w-full bg-gradient-to-r from-blue-700 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-800 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Iniciando sesión...
            </span>
          ) : (
            'Iniciar Sesión'
          )}
        </button>
      </div>
      <div className="mt-4 text-center">
        <a href="#" className="text-sm text-blue-700 hover:text-blue-800 font-medium">¿Olvidaste tu contraseña?</a>
      </div>
    </form>
  )
}

export default function Home() {
  const [showModalInfo, setShowModalInfo] = useState(false)
  const navigate = useNavigate()

  const news = [
    {
      id: 1,
      title: 'La Universidad abre nuevas plazas para el semestre de otoño',
      date: '2025-09-10',
      excerpt: 'Inscripciones abiertas para pregrado y posgrado. Conoce los requisitos y becas disponibles.'
    },
    {
      id: 2,
      title: 'Investigación: nuevo laboratorio de energías renovables',
      date: '2025-08-22',
      excerpt: 'El laboratorio impulsará proyectos con impacto regional en energía limpia.'
    },
    {
      id: 3,
      title: 'Jornadas culturales y deportivas este mes',
      date: '2025-07-30',
      excerpt: 'Actividades abiertas para estudiantes y la comunidad. Consulta el calendario.'
    }
  ]

  return (
    <div className="bg-gradient-to-b from-white to-stone-50">
      <Hero
        title="Universidad"
        subtitle="Formamos profesionales preparados para los retos del siglo XXI mediante una docencia innovadora, investigación con impacto y vinculación con la comunidad."
      />

      {/* Stats Banner */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 py-12 -mt-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            <div className="space-y-2">
              <div className="text-4xl font-bold">15,000+</div>
              <div className="text-blue-200">Estudiantes</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold">850+</div>
              <div className="text-blue-200">Docentes</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold">45+</div>
              <div className="text-blue-200">Programas</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold">50+</div>
              <div className="text-blue-200">Años</div>
            </div>
          </div>
        </div>
      </section>

      {/* Login Box */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <LoginBox />
        </div>
      </section>

      {/* Highlighted Areas */}
      <section id="programas" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-blue-950 mb-4">Descubre Nuestras Áreas</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explora las diferentes oportunidades que tenemos para ti en educación superior
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <HighlightCard 
            title="Admisiones" 
            description="Información sobre requisitos, plazos y proceso de matrícula para todos los programas." 
            onClick={() => navigate('/admisiones')}
          />
          <HighlightCard title="Programas Académicos" description="Ofrecemos programas de pregrado y posgrado en áreas como Ingeniería, Ciencias Sociales y Salud." />
          <HighlightCard title="Investigación" description="Líneas de investigación, grupos y proyectos con impacto local y global." />
        </div>
      </section>

      {/* Por qué Escogernos */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-950 mb-4">¿Por Qué Elegirnos?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Somos una institución comprometida con la excelencia y el desarrollo integral
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🎓', title: 'Excelencia Académica', desc: 'Programas acreditados internacionalmente' },
              { icon: '🔬', title: 'Investigación', desc: 'Proyectos de vanguardia con impacto social' },
              { icon: '🌍', title: 'Alcance Global', desc: 'Convenios con 50+ universidades mundiales' },
              { icon: '💼', title: 'Inserción Laboral', desc: '95% de graduados empleados en 6 meses' }
            ].map((item, idx) => (
              <div key={idx} className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all border border-blue-100 text-center">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-blue-950 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programas Académicos */}
      <section className="py-16 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-950 mb-4">Programas Académicos</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Encuentra el programa perfecto para alcanzar tus metas profesionales
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                area: 'Ingeniería y Tecnología', 
                programs: ['Ingeniería Civil', 'Ingeniería de Sistemas', 'Ingeniería Industrial'],
                color: 'from-blue-600 to-blue-700'
              },
              { 
                area: 'Ciencias Sociales', 
                programs: ['Administración', 'Economía', 'Psicología'],
                color: 'from-green-600 to-green-700'
              },
              { 
                area: 'Ciencias de la Salud', 
                programs: ['Medicina', 'Enfermería', 'Nutrición'],
                color: 'from-purple-600 to-purple-700'
              }
            ].map((area, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all">
                <div className={`bg-gradient-to-r ${area.color} text-white p-6`}>
                  <h3 className="text-2xl font-bold">{area.area}</h3>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {area.programs.map((program, pidx) => (
                      <li key={pidx} className="flex items-center gap-2 text-gray-700">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {program}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de Noticias */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-blue-950 mb-4">Últimas Noticias</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Mantente informado sobre las novedades y eventos de nuestra comunidad universitaria
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <NewsList items={news} />
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-purple-900 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl font-bold mb-4">¿Listo para Comenzar tu Futuro?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Solicita información o agenda una visita guiada a nuestro campus
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => setShowModalInfo(true)} className="bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg inline-flex items-center justify-center gap-2 cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Solicitar Información
              </button>
              <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition-colors inline-flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Agendar Visita al Campus
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-950 mb-4">Lo Que Dicen Nuestros Estudiantes</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { name: 'María González', program: 'Ingeniería Civil', quote: 'La calidad de los docentes y las instalaciones superaron mis expectativas. He crecido tanto profesional como personalmente.' },
              { name: 'Carlos Ramírez', program: 'Administración', quote: 'Las oportunidades de práctica profesional y networking me han abierto puertas increíbles en el mundo empresarial.' },
              { name: 'Ana Martínez', program: 'Psicología', quote: 'El ambiente inclusivo y el apoyo constante de la comunidad universitaria han hecho mi experiencia inolvidable.' }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-gradient-to-br from-stone-50 to-white p-6 rounded-xl shadow-lg border border-stone-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-blue-950">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.program}</div>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SolicitudInfoModal isOpen={showModalInfo} onClose={() => setShowModalInfo(false)} />

      <Footer />
    </div>
  )
}
