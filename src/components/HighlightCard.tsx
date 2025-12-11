type HighlightCardProps = {
  title: string
  description: string
  onClick?: () => void
}

export default function HighlightCard({ title, description, onClick }: HighlightCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`group relative p-8 bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-100 overflow-hidden ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
      <div className="relative z-10">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="font-bold text-2xl text-blue-950 mb-3">{title}</h3>
        <p className="text-gray-700 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
