type NewsItem = {
  id: number
  title: string
  date: string
  excerpt: string
}

type NewsListProps = {
  items: NewsItem[]
}

export default function NewsList({ items }: NewsListProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="grid gap-6">
      {items.map((item) => (
        <article key={item.id} className="group bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-stone-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 mb-3">
            <h3 className="font-bold text-xl text-blue-950 group-hover:text-blue-700 transition-colors">
              {item.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <time>{formatDate(item.date)}</time>
            </div>
          </div>
          <p className="text-gray-700 leading-relaxed">{item.excerpt}</p>
        </article>
      ))}
    </div>
  )
}
