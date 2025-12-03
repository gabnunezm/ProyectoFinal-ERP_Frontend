import './index.css'
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import Home from './pages/Home.tsx'
import About from './pages/About.tsx'
import Admisiones from './pages/Admisiones.tsx'
import Usuarios from './pages/Usuarios.tsx'
import Portal from './pages/Portal'
import PortalDocente from './pages/PortalDocente'
import PanelAdmin from './pages/PanelAdmin'
import PagoEstudiante from './pages/PagoEstudiante'
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
        <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
          {/* Modern University Navbar */}
          <nav className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 shadow-lg border-b border-blue-700/50 sticky top-0 z-50 backdrop-blur-sm">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between py-4">
                {/* Logo & Brand */}
                <Link to="/" className="flex items-center gap-3 group">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-blue-900" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                    </svg>
                  </div>
                  <div className="hidden md:block">
                    <div className="text-white font-bold text-xl leading-tight">Universidad</div>
                    <div className="text-blue-200 text-xs">Portal Académico</div>
                  </div>
                </Link>

                {/* Navigation Links */}
                <div className="flex items-center gap-1">
                  <Link to="/" className="px-4 py-2 text-white font-medium rounded-lg hover:bg-white/10 transition-all flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="hidden sm:inline">Inicio</span>
                  </Link>
                  <Link to="/about" className="px-4 py-2 text-blue-100 font-medium rounded-lg hover:bg-white/10 hover:text-white transition-all flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="hidden sm:inline">Acerca</span>
                  </Link>
                  <PublicAdmisionesLink />
                  <AuthorizedUsuariosLink />
                  <AuthorizedPanelAdminLink />
                  <AuthorizedPortalLink />
                  <AuthorizedPagosLink />
                  <AuthorizedDocenteLink />
                  <UserMenuButton />
                </div>
              </div>
            </div>
          </nav>

          <main className="container mx-auto p-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/admisiones" element={<Admisiones />} />
              <Route path="/usuarios" element={<RequireAdmin><Usuarios /></RequireAdmin>} />
              <Route path="/admin" element={<RequireAdmin><PanelAdmin /></RequireAdmin>} />
              <Route path="/portal" element={<RequireStudent><Portal /></RequireStudent>} />
              <Route path="/pagos" element={<RequireStudent><PagoEstudiante /></RequireStudent>} />
              <Route path="/portal/docente" element={<RequireTeacher><PortalDocente /></RequireTeacher>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

function PublicAdmisionesLink() {
  const auth = useAuth()
  // Solo mostrar si NO hay usuario autenticado
  if (auth.user) return null
  
  return (
    <Link to="/admisiones" className="px-4 py-2 text-blue-100 font-medium rounded-lg hover:bg-white/10 hover:text-white transition-all flex items-center gap-2">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span className="hidden sm:inline">Admisiones</span>
    </Link>
  )
}

function AuthorizedUsuariosLink() {
  const auth = useAuth()
  if (!auth.user) return null
  const role = (auth.user.role ?? '')
  if (!(role === 'admin' || role === '1')) return null
  return (
    <Link to="/usuarios" className="px-4 py-2 text-blue-100 font-medium rounded-lg hover:bg-white/10 hover:text-white transition-all flex items-center gap-2">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <span className="hidden lg:inline">Usuarios</span>
    </Link>
  )
}

function AuthorizedPanelAdminLink() {
  const auth = useAuth()
  if (!auth.user) return null
  const role = (auth.user.role ?? '')
  if (!(role === 'admin' || role === '1')) return null
  return (
    <Link to="/admin" className="px-4 py-2 text-blue-100 font-medium rounded-lg hover:bg-white/10 hover:text-white transition-all flex items-center gap-2">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <span className="hidden lg:inline">Panel Admin</span>
    </Link>
  )
}

function AuthorizedPortalLink() {
  const auth = useAuth()
  // show link when auth.user is student OR token payload indicates student role
  const authRole = auth.user ? (auth.user.role ?? '') : ''
  if (authRole && (authRole === 'user' || authRole === 'student' || authRole === '3')) return (
    <Link to="/portal" className="px-4 py-2 text-blue-100 font-medium rounded-lg hover:bg-white/10 hover:text-white transition-all flex items-center gap-2">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      <span className="hidden lg:inline">Mi Portal</span>
    </Link>
  )
  try {
    const token = localStorage.getItem('token')
    if (!token) return null
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    const tr = payload?.role_name ?? payload?.role ?? payload?.role_id ?? payload?.roleId
    if (tr && (String(tr) === 'user' || String(tr) === 'student' || String(tr) === '3')) return (
      <Link to="/portal" className="px-4 py-2 text-blue-100 font-medium rounded-lg hover:bg-white/10 hover:text-white transition-all flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <span className="hidden lg:inline">Mi Portal</span>
      </Link>
    )
  } catch (e) {
    // ignore
  }
  return null
}

function AuthorizedPagosLink() {
  const auth = useAuth()
  // show link when auth.user is student OR token payload indicates student role
  const authRole = auth.user ? (auth.user.role ?? '') : ''
  if (authRole && (authRole === 'user' || authRole === 'student' || authRole === '3')) return (
    <Link to="/pagos" className="px-4 py-2 text-blue-100 font-medium rounded-lg hover:bg-white/10 hover:text-white transition-all flex items-center gap-2">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
      <span className="hidden lg:inline">Mis Pagos</span>
    </Link>
  )
  try {
    const token = localStorage.getItem('token')
    if (!token) return null
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    const tr = payload?.role_name ?? payload?.role ?? payload?.role_id ?? payload?.roleId
    if (tr && (String(tr) === 'user' || String(tr) === 'student' || String(tr) === '3')) return (
      <Link to="/pagos" className="px-4 py-2 text-blue-100 font-medium rounded-lg hover:bg-white/10 hover:text-white transition-all flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <span className="hidden lg:inline">Mis Pagos</span>
      </Link>
    )
  } catch (e) {
    // ignore
  }
  return null
}

function AuthorizedDocenteLink() {
  const auth = useAuth()
  // muestra el link cuando auth.user es docente O el token indica rol docente (excluyendo admin)
  const authRole = auth.user ? (auth.user.role ?? '') : ''
  if (authRole && (authRole === 'docente' || authRole === 'teacher' || authRole === '4')) return (
    <Link to="/portal/docente" className="px-4 py-2 text-blue-100 font-medium rounded-lg hover:bg-white/10 hover:text-white transition-all flex items-center gap-2">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      <span className="hidden lg:inline">Portal Docente</span>
    </Link>
  )
  try {
    const token = localStorage.getItem('token')
    if (!token) return null
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    const tr = payload?.role_name ?? payload?.role ?? payload?.role_id ?? payload?.roleId
    if (tr && (String(tr) === 'docente' || String(tr) === 'teacher' || String(tr) === '4')) return (
      <Link to="/portal/docente" className="px-4 py-2 text-blue-100 font-medium rounded-lg hover:bg-white/10 hover:text-white transition-all flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span className="hidden lg:inline">Portal Docente</span>
      </Link>
    )
  } catch (e) {
    // ignore
  }
  return null
}

function UserMenuButton() {
  const auth = useAuth()
  if (!auth.user) return null
  
  const displayName = (auth.user.nombre && auth.user.nombre.toString().trim()) ? auth.user.nombre : (auth.user.email ?? 'Usuario')
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Confirmar logout
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      auth.logout()
    }
  }
  
  return (
    <div className="ml-2 pl-2 border-l border-blue-700/50 flex items-center gap-3">
      <div className="hidden md:flex flex-col items-end">
        <span className="text-white text-sm font-medium">{displayName}</span>
        <span className="text-blue-300 text-xs capitalize">{auth.user.role || 'Usuario'}</span>
      </div>
      <button
        onClick={handleLogout}
        type="button"
        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all font-medium"
        title="Cerrar sesión"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {initials}
        </div>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  )
}

export default App
