import './index.css'
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import Home from './pages/Home.tsx'
import About from './pages/About.tsx'
import Usuarios from './pages/Usuarios.tsx'
import Portal from './pages/Portal'
import NotFound from './pages/NotFound.tsx'
import { AuthProvider, useAuth } from './auth.tsx'

function RequireAdmin({ children }: { children: React.ReactElement }) {
  const auth = useAuth()
  if (!auth.user) return <Navigate to="/" replace />
  const role = (auth.user.role ?? '')
  if (!(role === 'admin' || role === '1')) return <Navigate to="/" replace />
  return children
}

function RequireStudent({ children }: { children: React.ReactElement }) {
  const auth = useAuth()
  if (!auth.user) return <Navigate to="/" replace />
  const role = (auth.user.role ?? '')
  // accept mapped 'user' role or explicit 'student' string or numeric '3'
  if (!(role === 'user' || role === 'student' || role === '3')) return <Navigate to="/" replace />
  return children
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-stone-200">
          <nav className="bg-blue-900 shadow p-4">
            <div className="container mx-auto flex gap-4">
              <Link to="/" className="text-stone-200 font-medium">Inicio</Link>
              <Link to="/about" className="text-stone-200/90">Acerca</Link>
              <AuthorizedUsuariosLink />
              <AuthorizedPortalLink />
            </div>
          </nav>

          <main className="container mx-auto p-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/usuarios" element={<RequireAdmin><Usuarios /></RequireAdmin>} />
              <Route path="/portal" element={<RequireStudent><Portal /></RequireStudent>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

function AuthorizedUsuariosLink() {
  const auth = useAuth()
  if (!auth.user) return null
  const role = (auth.user.role ?? '')
  if (!(role === 'admin' || role === '1')) return null
  return <Link to="/usuarios" className="text-stone-200/90">Usuarios</Link>
}

function AuthorizedPortalLink() {
  const auth = useAuth()
  if (!auth.user) return null
  const role = (auth.user.role ?? '')
  if (!(role === 'user' || role === 'student' || role === '3')) return null
  return <Link to="/portal" className="text-stone-200/90">Portal</Link>
}

export default App
