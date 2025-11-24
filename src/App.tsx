import './index.css'
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import Home from './pages/Home.tsx'
import About from './pages/About.tsx'
import Usuarios from './pages/Usuarios.tsx'
import Portal from './pages/Portal'
import PortalDocente from './pages/PortalDocente'
import PanelAdmin from './pages/PanelAdmin'
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

function RequireTeacher({ children }: { children: React.ReactElement }) {
  const auth = useAuth()
  if (!auth.user) return <Navigate to="/" replace />
  const role = (auth.user.role ?? '')
  // accept 'docente', 'teacher', or admin
  if (role && (role === 'docente' || role === 'teacher' || role === '4' || role === 'admin')) return children
  // fallback: check token payload in case stored user is stale
  try {
    const token = localStorage.getItem('token')
    if (!token) return <Navigate to="/" replace />
    const parts = token.split('.')
    if (parts.length < 2) return <Navigate to="/" replace />
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    const tr = payload?.role_name ?? payload?.role ?? payload?.role_id ?? payload?.roleId
    if (tr && (String(tr) === 'docente' || String(tr) === 'teacher' || String(tr) === '4' || String(tr) === 'admin')) return children
  } catch (e) {
    // ignore and redirect
  }
  return <Navigate to="/" replace />
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
              <AuthorizedPanelAdminLink />
              <AuthorizedPortalLink />
              <AuthorizedDocenteLink />
            </div>
          </nav>

          <main className="container mx-auto p-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/usuarios" element={<RequireAdmin><Usuarios /></RequireAdmin>} />
              <Route path="/admin" element={<RequireAdmin><PanelAdmin /></RequireAdmin>} />
              <Route path="/portal" element={<RequireStudent><Portal /></RequireStudent>} />
              <Route path="/portal/docente" element={<RequireTeacher><PortalDocente /></RequireTeacher>} />
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

function AuthorizedPanelAdminLink() {
  const auth = useAuth()
  if (!auth.user) return null
  const role = (auth.user.role ?? '')
  if (!(role === 'admin' || role === '1')) return null
  return <Link to="/admin" className="text-stone-200/90">Panel Admin</Link>
}

function AuthorizedPortalLink() {
  const auth = useAuth()
  // show link when auth.user is student OR token payload indicates student role
  const authRole = auth.user ? (auth.user.role ?? '') : ''
  if (authRole && (authRole === 'user' || authRole === 'student' || authRole === '3')) return <Link to="/portal" className="text-stone-200/90">Portal</Link>
  try {
    const token = localStorage.getItem('token')
    if (!token) return null
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    const tr = payload?.role_name ?? payload?.role ?? payload?.role_id ?? payload?.roleId
    if (tr && (String(tr) === 'user' || String(tr) === 'student' || String(tr) === '3')) return <Link to="/portal" className="text-stone-200/90">Portal</Link>
  } catch (e) {
    // ignore
  }
  return null
}

function AuthorizedDocenteLink() {
  const auth = useAuth()
  // show link when auth.user is docente OR token payload indicates docente role
  const authRole = auth.user ? (auth.user.role ?? '') : ''
  if (authRole && (authRole === 'docente' || authRole === 'teacher' || authRole === '4' || authRole === 'admin')) return <Link to="/portal/docente" className="text-stone-200/90">Portal Docente</Link>
  try {
    const token = localStorage.getItem('token')
    if (!token) return null
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    const tr = payload?.role_name ?? payload?.role ?? payload?.role_id ?? payload?.roleId
    if (tr && (String(tr) === 'docente' || String(tr) === 'teacher' || String(tr) === '4' || String(tr) === 'admin')) return <Link to="/portal/docente" className="text-stone-200/90">Portal Docente</Link>
  } catch (e) {
    // ignore
  }
  return null
}

export default App
