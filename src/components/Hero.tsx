type HeroProps = {
  title: string
  subtitle: string
}

export default function Hero({ title, subtitle }: HeroProps) {
  return (
    <section className="bg-gradient-to-r from-blue-950 to-blue-700 text-white py-16 px-6 rounded-lg">
      <div className="container mx-auto flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-extrabold">{title}</h1>
          <p className="mt-4 text-lg text-blue-200 max-w-xl">{subtitle}</p>
          <div className="mt-6 flex gap-3">
            <a href="#admisiones" className="bg-stone-200 text-blue-900 px-4 py-2 rounded-md font-semibold">Admisiones</a>
            <a href="#programas" className="border border-stone-200/40 px-4 py-2 rounded-md text-stone-200">Explorar programas</a>
          </div>
        </div>
        <div className="flex-1">
          <div className="bg-white/10 p-6 rounded-lg">
            <h3 className="font-semibold text-xl">Solicitud de información</h3>
            <p className="text-sm mt-2 text-blue-100">Déjanos tus datos y te contactaremos con más información sobre admisiones y becas.</p>
            <form className="mt-4 grid grid-cols-1 gap-3">
              <input className="px-3 py-2 rounded bg-white/10 placeholder-blue-100" placeholder="Nombre completo" />
              <input className="px-3 py-2 rounded bg-white/10 placeholder-blue-100" placeholder="Correo electrónico" />
              <button type="button" className="mt-2 bg-stone-200 text-blue-900 px-4 py-2 rounded font-medium">Enviar</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
