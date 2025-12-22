import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Truck,
  CheckSquare,
  Calendar,
  Menu,
  X,
  Settings,
  HelpCircle,
  ChevronLeft,
  Sparkles
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Tableau de bord', path: '/', icon: LayoutDashboard, color: 'from-purple-500 to-pink-500' },
  { name: 'Gestion de projet', path: '/projects', icon: FolderKanban, color: 'from-blue-500 to-cyan-500' },
  { name: 'Gestion de tâche', path: '/tasks', icon: CheckSquare, color: 'from-green-500 to-emerald-500' },
  { name: 'Calendrier', path: '/calendar', icon: Calendar, color: 'from-orange-500 to-yellow-500' },
  { name: 'Gestion de client', path: '/clients', icon: Users, color: 'from-indigo-500 to-purple-500' },
  { name: 'Gestion de fournisseur', path: '/suppliers', icon: Truck, color: 'from-red-500 to-pink-500' },
]

const bottomNavigation = [
  { name: 'Paramètre', path: '/settings', icon: Settings, color: 'from-gray-500 to-slate-500' },
  { name: 'Support', path: '/support', icon: HelpCircle, color: 'from-teal-500 to-cyan-500' },
]

export default function Layout({ children }) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
        shadow-2xl transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'}
        w-72
      `}>
        <div className="flex flex-col h-full">
          {/* Logo et titre */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="text-white" size={22} />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Gestion Pro
                  </h1>
                  <p className="text-xs text-slate-400">Version 1.0</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation principale */}
          <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      group flex items-center px-3 py-3 rounded-xl transition-all duration-200
                      ${isActive
                        ? 'bg-gradient-to-r ' + item.color + ' shadow-lg shadow-purple-500/50 text-white'
                        : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                      }
                    `}
                  >
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-lg transition-all
                      ${isActive ? 'bg-white/20' : 'bg-slate-700/50 group-hover:bg-slate-700'}
                    `}>
                      <Icon size={20} />
                    </div>
                    {!sidebarCollapsed && (
                      <span className="ml-3 font-medium text-sm">{item.name}</span>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Séparateur */}
            <div className="my-4 border-t border-slate-700/50" />

            {/* Navigation du bas */}
            <div className="space-y-1">
              {bottomNavigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      group flex items-center px-3 py-3 rounded-xl transition-all duration-200
                      ${isActive
                        ? 'bg-gradient-to-r ' + item.color + ' shadow-lg text-white'
                        : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                      }
                    `}
                  >
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-lg transition-all
                      ${isActive ? 'bg-white/20' : 'bg-slate-700/50 group-hover:bg-slate-700'}
                    `}>
                      <Icon size={20} />
                    </div>
                    {!sidebarCollapsed && (
                      <span className="ml-3 font-medium text-sm">{item.name}</span>
                    )}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Bouton de collapse (desktop seulement) */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex items-center justify-center p-4 border-t border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
          >
            <ChevronLeft size={20} className={`transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        {/* Header mobile */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Gestion Pro
            </h1>
            <div className="w-10" />
          </div>
        </header>

        {/* Contenu de la page */}
        <main className="p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
