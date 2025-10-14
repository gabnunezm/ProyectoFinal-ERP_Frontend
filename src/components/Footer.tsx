export default function Footer() {
  return (
    <footer className="text-sm text-blue-900 py-6">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between">
        <div>© {new Date().getFullYear()} Universidad </div>
        <div>Contacto: contacto@universidad.edu | +1 (555) 123-4567</div>
      </div>
    </footer>
  )
}
