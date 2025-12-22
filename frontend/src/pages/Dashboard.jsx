import { FolderKanban, Users, CheckSquare, TrendingUp, ArrowUpRight, Clock, AlertCircle, CheckCircle2, Activity } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getStats, getProjects, getTasks } from '../services/api'

export default function Dashboard() {
  const [stats, setStats] = useState({
    projectsCount: 0,
    clientsCount: 0,
    tasksCount: 0
  })

  const [recentProjects, setRecentProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Récupérer projets et tâches
      const [projectsData, tasksData] = await Promise.all([
        getProjects().catch(err => {
          console.error('Erreur projets:', err)
          return []
        }),
        getTasks().catch(err => {
          console.error('Erreur tâches:', err)
          return []
        })
      ])

      // Calculer les statistiques localement
      const projectsEnCours = (projectsData || []).filter(p => p.status === 'En cours')
      const tachesEnCours = (tasksData || []).filter(t => !t.completed)

      setStats({
        projectsCount: projectsEnCours.length,
        clientsCount: 0, // Sera mis à jour si besoin
        tasksCount: tachesEnCours.length
      })

      setRecentProjects((projectsData || []).slice(0, 4))
      setTasks(tasksData || [])
    } catch (err) {
      console.error('Erreur lors du chargement du dashboard:', err)
      setError('Erreur lors du chargement des données')
      setStats({ projectsCount: 0, clientsCount: 0, tasksCount: 0 })
      setRecentProjects([])
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'Terminé': return 'green'
      case 'En cours': return 'blue'
      case 'En attente': return 'yellow'
      default: return 'gray'
    }
  }

  const overdueTasks = tasks.filter(task => {
    if (task.completed) return false
    if (!task.dueDate) return false
    return new Date(task.dueDate) < new Date()
  })

  const upcomingTasks = tasks.filter(task => {
    if (task.completed) return false
    if (!task.dueDate) return false
    const dueDate = new Date(task.dueDate)
    const today = new Date()
    const threeDay = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
    return dueDate >= today && dueDate <= threeDay
  })

  const statCards = [
    {
      name: 'Projets en cours',
      value: (stats?.projectsCount || 0).toString(),
      icon: FolderKanban,
      gradient: 'from-blue-500 to-cyan-500',
      lightBg: 'from-blue-50 to-cyan-50'
    },
    {
      name: 'Clients',
      value: (stats?.clientsCount || 0).toString(),
      icon: Users,
      gradient: 'from-green-500 to-emerald-500',
      lightBg: 'from-green-50 to-emerald-50'
    },
    {
      name: 'Tâches en cours',
      value: (stats?.tasksCount || 0).toString(),
      icon: CheckSquare,
      gradient: 'from-orange-500 to-yellow-500',
      lightBg: 'from-orange-50 to-yellow-50'
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="text-purple-500 animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Tableau de bord
            </h1>
            <p className="mt-2 text-gray-600">Bienvenue ! Voici un aperçu de vos activités</p>
          </div>
          <div className="hidden md:flex items-center space-x-2 text-sm">
            <Activity className="text-green-500 animate-pulse" size={20} />
            <span className="text-gray-600">Tout fonctionne normalement</span>
          </div>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-6">
          <div className="flex items-start">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={24} />
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">Erreur</h3>
              <p className="text-sm text-gray-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.name}
              className={`relative overflow-hidden bg-gradient-to-br ${stat.lightBg} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50 group`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  </div>
                  <div className={`bg-gradient-to-br ${stat.gradient} rounded-xl p-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={24} className="text-white" />
                  </div>
                </div>
              </div>
              <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projets récents */}
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <FolderKanban className="mr-2 text-blue-500" size={24} />
              Projets récents
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <div key={project.id} className="group hover:bg-gray-50 p-4 rounded-xl transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        <Users size={14} className="inline mr-1" />
                        {project.client?.name || 'Sans client'}
                      </p>
                    </div>
                    <span className={`
                      px-3 py-1 text-xs font-medium rounded-full
                      ${getStatusColor(project.status) === 'blue' ? 'bg-blue-100 text-blue-700' : ''}
                      ${getStatusColor(project.status) === 'green' ? 'bg-green-100 text-green-700' : ''}
                      ${getStatusColor(project.status) === 'yellow' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${getStatusColor(project.status) === 'gray' ? 'bg-gray-100 text-gray-700' : ''}
                    `}>
                      {project.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progression</span>
                      <span className="font-semibold text-gray-900">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${
                          getStatusColor(project.status) === 'blue' ? 'from-blue-500 to-cyan-500' :
                          getStatusColor(project.status) === 'green' ? 'from-green-500 to-emerald-500' :
                          'from-orange-500 to-yellow-500'
                        } transition-all duration-500`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Aucun projet</p>
            )}
          </div>
        </div>

        {/* Tâches importantes */}
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <CheckSquare className="mr-2 text-purple-500" size={24} />
              Tâches importantes
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {overdueTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-red-600 mb-2">En retard ({overdueTasks.length})</h3>
                {overdueTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="p-3 bg-red-50 rounded-lg mb-2 border border-red-200">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm font-medium text-red-900 flex-1">{task.title}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-200 text-red-800 font-medium ml-2">
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-xs text-red-700 flex items-center gap-1 mb-1">
                      <FolderKanban size={12} />
                      {task.project?.name || 'Sans projet'}
                    </p>
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <Clock size={12} />
                      Échéance : {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {upcomingTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-orange-600 mb-2">À venir ({upcomingTasks.length})</h3>
                {upcomingTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="p-3 bg-orange-50 rounded-lg mb-2 border border-orange-200">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm font-medium text-orange-900 flex-1">{task.title}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-200 text-orange-800 font-medium ml-2">
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-xs text-orange-700 flex items-center gap-1 mb-1">
                      <FolderKanban size={12} />
                      {task.project?.name || 'Sans projet'}
                    </p>
                    <p className="text-xs text-orange-600 flex items-center gap-1">
                      <Clock size={12} />
                      Échéance : {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {overdueTasks.length === 0 && upcomingTasks.length === 0 && (
              <p className="text-gray-500 text-center py-4">Aucune tâche importante</p>
            )}
          </div>
        </div>
      </div>

      {/* Alertes */}
      {(overdueTasks.length > 0 || upcomingTasks.length > 0) && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 rounded-xl p-6 shadow-lg">
          <div className="flex items-start">
            <AlertCircle className="text-orange-500 flex-shrink-0 mt-0.5" size={24} />
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">Attention requise</h3>
              <p className="text-sm text-gray-700 mt-1">
                {overdueTasks.length > 0 && (
                  <span>Vous avez <span className="font-bold">{overdueTasks.length} tâche(s) en retard</span></span>
                )}
                {overdueTasks.length > 0 && upcomingTasks.length > 0 && <span> et </span>}
                {upcomingTasks.length > 0 && (
                  <span><span className="font-bold">{upcomingTasks.length} tâche(s)</span> qui approchent de leur date limite</span>
                )}
                .
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
