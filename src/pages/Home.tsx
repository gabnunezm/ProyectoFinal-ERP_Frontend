import Hero from '../components/Hero'
import HighlightCard from '../components/HighlightCard'
import NewsList from '../components/NewsList'
import Footer from '../components/Footer'

export default function Home() {
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
    <div className="space-y-12">
      <Hero
        title="Universidad"
        subtitle="Formamos profesionales preparados para los retos del siglo XXI mediante una docencia innovadora, investigación con impacto y vinculación con la comunidad."
      />

      <section id="programas" className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold text-blue-950">Áreas destacadas</h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <HighlightCard title="Admisiones" description="Información sobre requisitos, plazos y proceso de matrícula para todos los programas." />
          <HighlightCard title="Programas académicos" description="Ofrecemos programas de pregrado y posgrado en áreas como Ingeniería, Ciencias Sociales y Salud." />
          <HighlightCard title="Investigación" description="Líneas de investigación, grupos y proyectos con impacto local y global." />
        </div>
      </section>

      <section className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold text-blue-950">Últimas noticias</h2>
        <NewsList items={news} />
      </section>

      <section className="bg-blue-900/5 py-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h3 className="text-xl font-semibold">¿Listo para comenzar?</h3>
            <p className="text-blue-900">Solicita información o agenda una visita al campus.</p>
          </div>
          <div className="flex gap-3">
            <a className="bg-blue-700 text-white px-4 py-2 rounded">Solicitar info</a>
            <a className="border border-stone-200 px-4 py-2 rounded text-blue-900">Agenda visita</a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
