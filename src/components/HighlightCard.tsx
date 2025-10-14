type HighlightCardProps = {
  title: string
  description: string
}

export default function HighlightCard({ title, description }: HighlightCardProps) {
  return (
    <div className="p-6 bg-stone-200 rounded shadow">
      <h3 className="font-bold text-lg text-blue-950">{title}</h3>
      <p className="mt-2 text-blue-900">{description}</p>
      <a className="mt-4 inline-block text-blue-700 font-medium">Ver más →</a>
    </div>
  )
}
