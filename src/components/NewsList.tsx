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
  return (
    <div className="mt-4 grid gap-4">
      {items.map((item) => (
        <article key={item.id} className="p-4 bg-stone-200 rounded shadow-sm">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg text-blue-900">{item.title}</h3>
            <time className="text-sm text-blue-700">{item.date}</time>
          </div>
          <p className="mt-2 text-blue-900">{item.excerpt}</p>
        </article>
      ))}
    </div>
  )
}
