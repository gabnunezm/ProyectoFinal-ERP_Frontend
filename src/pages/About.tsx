export default function About() {
  return (
    <div className="bg-gradient-to-b from-stone-50 to-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Sobre Nosotros</h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Comprometidos con la excelencia académica y la formación integral de nuestros estudiantes desde hace más de 50 años
            </p>
          </div>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl shadow-lg border border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-700 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-blue-950">Nuestra Misión</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Formar profesionales íntegros, competentes y comprometidos con el desarrollo social, a través de una educación de calidad que combine conocimientos teóricos, habilidades prácticas y valores éticos, preparándolos para enfrentar los desafíos del mundo globalizado.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-xl shadow-lg border border-green-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-green-900">Nuestra Visión</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Ser reconocidos como una institución educativa líder a nivel nacional e internacional, referente en innovación pedagógica, investigación científica y responsabilidad social, contribuyendo al progreso sostenible de nuestra sociedad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Valores Institucionales */}
      <section className="py-16 bg-stone-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-blue-950 mb-12">Valores Institucionales</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { titulo: 'Excelencia', icono: '⭐', descripcion: 'Compromiso con la calidad en todo lo que hacemos' },
              { titulo: 'Integridad', icono: '🛡️', descripcion: 'Actuamos con honestidad y transparencia' },
              { titulo: 'Innovación', icono: '💡', descripcion: 'Fomentamos el pensamiento creativo y crítico' },
              { titulo: 'Inclusión', icono: '🤝', descripcion: 'Respetamos la diversidad y promovemos la equidad' },
              { titulo: 'Responsabilidad', icono: '🌱', descripcion: 'Compromiso con el desarrollo sostenible' },
              { titulo: 'Colaboración', icono: '👥', descripcion: 'Trabajamos en equipo por objetivos comunes' },
              { titulo: 'Liderazgo', icono: '🎯', descripcion: 'Formamos agentes de cambio positivo' },
              { titulo: 'Servicio', icono: '❤️', descripcion: 'Orientados al bienestar de la comunidad' }
            ].map((valor, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-stone-200">
                <div className="text-4xl mb-3 text-center">{valor.icono}</div>
                <h3 className="text-xl font-bold text-blue-950 text-center mb-2">{valor.titulo}</h3>
                <p className="text-sm text-gray-600 text-center">{valor.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Historia */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-blue-950 mb-8 text-center">Nuestra Historia</h2>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-blue-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    1975
                  </div>
                </div>
                <div className="flex-grow pt-2">
                  <h3 className="text-2xl font-bold text-blue-950 mb-2">Fundación</h3>
                  <p className="text-gray-700">
                    Iniciamos como una pequeña institución educativa con apenas 150 estudiantes y 12 docentes, con el sueño de ofrecer educación de calidad accesible para todos.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    1990
                  </div>
                </div>
                <div className="flex-grow pt-2">
                  <h3 className="text-2xl font-bold text-green-900 mb-2">Expansión</h3>
                  <p className="text-gray-700">
                    Alcanzamos más de 2,000 estudiantes y ampliamos nuestra oferta académica con nuevas carreras en ingeniería, ciencias sociales y administración.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    2010
                  </div>
                </div>
                <div className="flex-grow pt-2">
                  <h3 className="text-2xl font-bold text-purple-900 mb-2">Acreditación Internacional</h3>
                  <p className="text-gray-700">
                    Obtuvimos reconocimiento internacional y establecimos convenios con más de 50 universidades alrededor del mundo para programas de intercambio.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    2025
                  </div>
                </div>
                <div className="flex-grow pt-2">
                  <h3 className="text-2xl font-bold text-orange-900 mb-2">Transformación Digital</h3>
                  <p className="text-gray-700">
                    Implementamos nuestro sistema ERP académico de última generación, mejorando la experiencia educativa con tecnología de punta y servicios digitales integrados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="py-16 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">En Números</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { numero: '15,000+', label: 'Estudiantes Activos' },
              { numero: '850+', label: 'Docentes Calificados' },
              { numero: '45+', label: 'Programas Académicos' },
              { numero: '30,000+', label: 'Graduados Exitosos' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-5xl font-bold mb-2">{stat.numero}</div>
                <div className="text-blue-200 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instalaciones */}
      <section className="py-16 bg-stone-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-blue-950 mb-12 text-center">Nuestras Instalaciones</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                titulo: 'Laboratorios Especializados',
                descripcion: 'Equipados con tecnología de última generación para prácticas en ingeniería, ciencias y tecnología.',
                icono: '🔬'
              },
              {
                titulo: 'Biblioteca Digital',
                descripcion: 'Acceso a más de 500,000 recursos bibliográficos digitales y bases de datos académicas internacionales.',
                icono: '📚'
              },
              {
                titulo: 'Espacios Deportivos',
                descripcion: 'Canchas multiuso, gimnasio y áreas recreativas para el desarrollo integral de nuestros estudiantes.',
                icono: '⚽'
              },
              {
                titulo: 'Aulas Inteligentes',
                descripcion: 'Salones equipados con tecnología multimedia y conectividad para una experiencia de aprendizaje moderna.',
                icono: '💻'
              },
              {
                titulo: 'Centros de Investigación',
                descripcion: 'Espacios dedicados a la investigación científica y desarrollo de proyectos innovadores.',
                icono: '🔍'
              },
              {
                titulo: 'Cafeterías y Áreas Sociales',
                descripcion: 'Espacios cómodos y modernos para la convivencia y el esparcimiento estudiantil.',
                icono: '☕'
              }
            ].map((instalacion, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all">
                <div className="text-5xl mb-4">{instalacion.icono}</div>
                <h3 className="text-xl font-bold text-blue-950 mb-3">{instalacion.titulo}</h3>
                <p className="text-gray-600">{instalacion.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Acreditaciones */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-blue-950 mb-12 text-center">Certificaciones y Acreditaciones</h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {[
                'Acreditación Internacional por ABET',
                'Certificación ISO 9001:2015 en Gestión de Calidad',
                'Reconocimiento del Ministerio de Educación',
                'Miembro de la Red Internacional de Universidades',
                'Acreditación de Programas por Organismos Especializados',
                'Certificación en Responsabilidad Social Universitaria'
              ].map((cert, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    ✓
                  </div>
                  <span className="text-gray-800 font-medium">{cert}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-r from-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Únete a Nuestra Comunidad</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Forma parte de una institución que transforma vidas y construye el futuro
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="px-8 py-3 bg-white text-blue-900 font-semibold rounded-lg hover:bg-blue-50 transition-colors">
              Programas Académicos
            </button>
            <button className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-900 transition-colors">
              Contáctanos
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
