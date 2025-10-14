import './index.css'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home.tsx'
import About from './pages/About.tsx'
import NotFound from './pages/NotFound.tsx'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-stone-200">
        <nav className="bg-blue-900 shadow p-4">
          <div className="container mx-auto flex gap-4">
            <Link to="/" className="text-stone-200 font-medium">Inicio</Link>
            <Link to="/about" className="text-stone-200/90">Acerca</Link>
          </div>
        </nav>

        <main className="container mx-auto p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
