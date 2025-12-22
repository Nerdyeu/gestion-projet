import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, FolderKanban, Mail, CheckCircle2, AlertCircle } from 'lucide-react'
import { getTasks, getProjects, createTask, createProject, toggleTaskComplete } from '../services/api'
import DayDetailsModal from '../components/DayDetailsModal'
import { loginToMicrosoft, logoutFromMicrosoft, getCalendarEvents, isUserLoggedIn } from '../services/outlookService'

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [outlookConnected, setOutlookConnected] = useState(false)
  const [outlookEvents, setOutlookEvents] = useState([])

  useEffect(() => {
    fetchData()
    checkOutlookConnection()
  }, [])

  useEffect(() => {
    if (outlookConnected) {
      fetchOutlookEvents()
    }
  }, [outlookConnected, currentDate])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [tasksData, projectsData] = await Promise.all([
        getTasks(),
        getProjects()
      ])
      setTasks(tasksData || [])
      setProjects(projectsData || [])
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfWeek = new Date(year, month, 1).getDay() // 0 = Dimanche, 1 = Lundi, etc.

    const days = []

    // Jours du mois précédent
    const prevMonthDays = new Date(year, month, 0).getDate()
    const prevMonthStartDay = prevMonthDays - firstDayOfWeek + 1

    for (let i = prevMonthStartDay; i <= prevMonthDays; i++) {
      days.push({
        date: new Date(year, month - 1, i),
        isCurrentMonth: false
      })
    }

    // Jours du mois actuel
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      })
    }

    // Jours du mois suivant pour compléter 6 semaines (42 jours)
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      })
    }

    return days
  }

  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false
      const taskDate = new Date(task.dueDate)
      return taskDate.toDateString() === date.toDateString()
    })
  }

  const getProjectDeadlinesForDate = (date) => {
    return projects.filter(project => {
      if (!project.deadline) return false
      const deadlineDate = new Date(project.deadline)
      return deadlineDate.toDateString() === date.toDateString()
    })
  }

  const getOutlookEventsForDate = (date) => {
    return outlookEvents.filter(event => {
      if (!event.start || !event.start.dateTime) return false
      const eventDate = new Date(event.start.dateTime)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const handleDayClick = (date) => {
    setSelectedDate(date)
    setIsModalOpen(true)
  }

  const handleCreateTask = async (taskData) => {
    try {
      await createTask(taskData)
      await fetchData()
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error)
    }
  }

  const handleCreateProject = async (projectData) => {
    try {
      await createProject(projectData)
      await fetchData()
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error)
    }
  }

  const handleToggleTask = async (taskId, completed) => {
    try {
      await toggleTaskComplete(taskId, completed)
      await fetchData()
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error)
    }
  }

  const checkOutlookConnection = async () => {
    const isConnected = await isUserLoggedIn()
    setOutlookConnected(isConnected)
  }

  const fetchOutlookEvents = async () => {
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const events = await getCalendarEvents(startOfMonth, endOfMonth)
      setOutlookEvents(events)
    } catch (error) {
      console.error('Erreur lors de la récupération des événements Outlook:', error)
    }
  }

  const handleConnectOutlook = async () => {
    try {
      await loginToMicrosoft()
      setOutlookConnected(true)
      await fetchOutlookEvents()
    } catch (error) {
      console.error('Erreur lors de la connexion à Outlook:', error)
      alert('Erreur lors de la connexion à Microsoft. Veuillez réessayer.')
    }
  }

  const handleDisconnectOutlook = async () => {
    try {
      await logoutFromMicrosoft()
      setOutlookConnected(false)
      setOutlookEvents([])
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Haute': return 'bg-red-100 text-red-700 border-red-300'
      case 'Moyenne': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'Basse': return 'bg-green-100 text-green-700 border-green-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const days = getDaysInMonth(currentDate)
  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

  const upcomingEvents = tasks
    .filter(task => {
      if (!task.dueDate || task.completed) return false
      const dueDate = new Date(task.dueDate)
      const today = new Date()
      const sevenDays = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      return dueDate >= today && dueDate <= sevenDays
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <CalendarIcon className="text-purple-500 animate-pulse mx-auto mb-4" size={48} />
          <p className="text-gray-600">Chargement du calendrier...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Calendrier</h1>
        <p className="mt-2 text-gray-600">Visualisez vos échéances et tâches</p>
      </div>

      {/* Carte de connexion Outlook */}
      <div className="mb-6">
        <div className={`
          bg-white rounded-lg shadow-lg p-6 border-2 transition-all
          ${outlookConnected ? 'border-green-400' : 'border-blue-400'}
        `}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`
                p-3 rounded-full
                ${outlookConnected ? 'bg-green-100' : 'bg-blue-100'}
              `}>
                {outlookConnected ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : (
                  <Mail className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {outlookConnected ? 'Outlook connecté' : 'Synchronisation Outlook'}
                </h3>
                <p className="text-sm text-gray-600">
                  {outlookConnected
                    ? 'Vos événements Outlook sont synchronisés avec le calendrier'
                    : 'Connectez votre compte Outlook pour synchroniser vos événements'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {outlookConnected ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-700 font-medium">Actif</span>
                  </div>
                  <button
                    onClick={handleDisconnectOutlook}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                  >
                    Déconnecter
                  </button>
                </>
              ) : (
                <button
                  onClick={handleConnectOutlook}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Mail className="w-4 h-4" />
                  Se connecter
                </button>
              )}
            </div>
          </div>

          {!outlookConnected && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p>
                  Une fois connecté, vos réunions et événements Outlook apparaîtront automatiquement dans ce calendrier.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        <div className="w-full">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 capitalize">
                {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={goToToday}
                  className="px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Aujourd'hui
                </button>
                <button
                  onClick={previousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <table className="w-full border-collapse border-2 border-gray-400 table-fixed">
              <tbody>
                {Array.from({ length: 6 }).map((_, weekIndex) => (
                  <tr key={weekIndex} className="h-40">
                    {days.slice(weekIndex * 7, weekIndex * 7 + 7).map((day, dayIndex) => {
                      const dayTasks = getTasksForDate(day.date)
                      const dayProjects = getProjectDeadlinesForDate(day.date)
                      const dayOutlookEvents = getOutlookEventsForDate(day.date)
                      const hasEvents = dayTasks.length > 0 || dayProjects.length > 0 || dayOutlookEvents.length > 0
                      const dayName = weekDays[day.date.getDay()]

                      return (
                        <td
                          key={weekIndex * 7 + dayIndex}
                          onClick={() => handleDayClick(day.date)}
                          className={`
                            p-2 border border-gray-400 align-top transition-all cursor-pointer
                            ${day.isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-100 hover:bg-gray-200'}
                            ${isToday(day.date) ? 'bg-purple-100 border-purple-600 border-2 hover:bg-purple-200' : ''}
                          `}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`
                              text-[10px] font-bold uppercase
                              ${day.isCurrentMonth ? 'text-gray-600' : 'text-gray-400'}
                              ${isToday(day.date) ? 'text-purple-700' : ''}
                            `}>
                              {dayName}
                            </span>
                            <span className={`
                              text-lg font-bold
                              ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                              ${isToday(day.date) ? 'text-purple-700' : ''}
                            `}>
                              {day.date.getDate()}
                            </span>
                          </div>

                          <div className="space-y-1">
                            {dayTasks.slice(0, 3).map((task) => (
                              <div
                                key={task.id}
                                className={`
                                  text-[9px] px-1.5 py-1 rounded truncate font-medium
                                  ${task.completed ? 'bg-green-200 text-green-900 line-through' :
                                    task.priority === 'Haute' ? 'bg-red-200 text-red-900' :
                                    task.priority === 'Moyenne' ? 'bg-yellow-200 text-yellow-900' :
                                    'bg-blue-200 text-blue-900'}
                                `}
                                title={task.title}
                              >
                                {task.title}
                              </div>
                            ))}
                            {dayProjects.slice(0, 1).map((project) => (
                              <div
                                key={`project-${project.id}`}
                                className="text-[9px] px-1.5 py-1 rounded truncate bg-purple-200 text-purple-900 font-medium"
                                title={project.name}
                              >
                                {project.name}
                              </div>
                            ))}
                            {dayOutlookEvents.slice(0, 1).map((event, idx) => (
                              <div
                                key={`outlook-${idx}`}
                                className="text-[9px] px-1.5 py-1 rounded truncate bg-blue-100 text-blue-800 font-medium border border-blue-300"
                                title={event.subject}
                              >
                                📅 {event.subject}
                              </div>
                            ))}
                            {(dayTasks.length + dayProjects.length + dayOutlookEvents.length) > 5 && (
                              <div className="text-[9px] text-gray-600 font-bold">
                                +{dayTasks.length + dayProjects.length + dayOutlookEvents.length - 5}
                              </div>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-full grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock size={20} className="text-purple-600" />
              Échéances à venir
            </h3>
            <div className="space-y-3">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg border ${getPriorityColor(task.priority)}`}
                  >
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm mt-1 flex items-center gap-1">
                      <CalendarIcon size={14} />
                      {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-xs mt-1 flex items-center gap-1 opacity-75">
                      <FolderKanban size={12} />
                      {task.project?.name || 'Sans projet'}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">Aucune échéance à venir</p>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tâches avec échéance</span>
                <span className="font-bold text-gray-900">
                  {tasks.filter(t => t.dueDate && !t.completed).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Projets avec deadline</span>
                <span className="font-bold text-gray-900">
                  {projects.filter(p => p.deadline && p.status !== 'Terminé').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">En retard</span>
                <span className="font-bold text-red-600">
                  {tasks.filter(t => {
                    if (!t.dueDate || t.completed) return false
                    return new Date(t.dueDate) < new Date()
                  }).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal des détails du jour */}
      <DayDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        date={selectedDate}
        tasks={selectedDate ? getTasksForDate(selectedDate) : []}
        projects={selectedDate ? getProjectDeadlinesForDate(selectedDate) : []}
        onCreateTask={handleCreateTask}
        onCreateProject={handleCreateProject}
        onToggleTask={handleToggleTask}
      />
    </div>
  )
}
