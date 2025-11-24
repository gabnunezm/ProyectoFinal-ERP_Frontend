import { useState } from 'react'
import { useAuth } from '../auth'
import GestionEstudiantes from './admin/GestionEstudiantes.tsx'
import GestionAsignaturas from './admin/GestionAsignaturas.tsx'
import GestionDocentes from './admin/GestionDocentes.tsx'

export default function PanelAdmin() {
  const auth = useAuth()
  const [activeModule, setActiveModule] = useState<'estudiantes' | 'asignaturas' | 'docentes'>('estudiantes')

  if (!auth.user) return <div className="p-6">Acceso no autorizado. Inicie sesión como administrador.</div>

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-blue-950">Panel Administrativo</h2>
            <p className="text-sm text-gray-600">Gestión del sistema académico</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-700 text-white flex items-center justify-center font-semibold">
              {(auth.user.nombre || auth.user.email || 'A').charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        <nav className="flex gap-2 border-b pb-4 mb-6">
          <button
            onClick={() => setActiveModule('estudiantes')}
            className={`px-4 py-2 rounded-t-lg font-medium ${
              activeModule === 'estudiantes'
                ? 'bg-blue-700 text-white'
                : 'bg-stone-100 text-gray-700 hover:bg-stone-200'
            }`}
          >
            Gestión de Estudiantes
          </button>
          <button
            onClick={() => setActiveModule('docentes')}
            className={`px-4 py-2 rounded-t-lg font-medium ${
              activeModule === 'docentes'
                ? 'bg-blue-700 text-white'
                : 'bg-stone-100 text-gray-700 hover:bg-stone-200'
            }`}
          >
            Gestión de Docentes
          </button>
          <button
            onClick={() => setActiveModule('asignaturas')}
            className={`px-4 py-2 rounded-t-lg font-medium ${
              activeModule === 'asignaturas'
                ? 'bg-blue-700 text-white'
                : 'bg-stone-100 text-gray-700 hover:bg-stone-200'
            }`}
          >
            Gestión de Asignaturas
          </button>
        </nav>

        <div>
          {activeModule === 'estudiantes' && <GestionEstudiantes />}
          {activeModule === 'docentes' && <GestionDocentes />}
          {activeModule === 'asignaturas' && <GestionAsignaturas />}
        </div>
      </div>
    </div>
  )
}
