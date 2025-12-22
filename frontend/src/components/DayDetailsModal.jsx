import { X, Plus, Calendar, CheckCircle2, Circle } from 'lucide-react'
import { useState } from 'react'

const DayDetailsModal = ({ isOpen, onClose, date, tasks, projects, onCreateTask, onCreateProject, onToggleTask }) => {
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'Moyenne'
  })
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: ''
  })

  if (!isOpen) return null

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    await onCreateTask({
      ...taskForm,
      dueDate: date.toISOString()
    })
    setTaskForm({ title: '', description: '', priority: 'Moyenne' })
    setShowTaskForm(false)
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    await onCreateProject({
      ...projectForm,
      deadline: date.toISOString()
    })
    setProjectForm({ name: '', description: '' })
    setShowProjectForm(false)
  }

  const hasContent = tasks.length > 0 || projects.length > 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{formatDate(date)}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {tasks.length} tâche{tasks.length > 1 ? 's' : ''} • {projects.length} projet{projects.length > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tâches */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
                Tâches ({tasks.length})
              </h3>
              <button
                onClick={() => setShowTaskForm(!showTaskForm)}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Nouvelle tâche
              </button>
            </div>

            {/* Formulaire création tâche */}
            {showTaskForm && (
              <form onSubmit={handleCreateTask} className="bg-purple-50 p-4 rounded-lg mb-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre de la tâche *
                  </label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ex: Préparer la présentation"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows="2"
                    placeholder="Détails optionnels..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priorité
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Haute">Haute</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Basse">Basse</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Créer la tâche
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTaskForm(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}

            {/* Liste des tâches */}
            {tasks.length > 0 ? (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`
                      p-3 rounded-lg border-2 transition-all cursor-pointer
                      ${task.completed
                        ? 'bg-green-50 border-green-200'
                        : task.priority === 'Haute'
                        ? 'bg-red-50 border-red-200'
                        : task.priority === 'Moyenne'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-blue-50 border-blue-200'
                      }
                    `}
                    onClick={() => onToggleTask(task.id, !task.completed)}
                  >
                    <div className="flex items-start gap-3">
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`
                            text-xs px-2 py-1 rounded-full font-medium
                            ${task.priority === 'Haute'
                              ? 'bg-red-100 text-red-700'
                              : task.priority === 'Moyenne'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                            }
                          `}>
                            {task.priority}
                          </span>
                          {task.project && (
                            <span className="text-xs text-gray-600">
                              📁 {task.project.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !showTaskForm && (
                <p className="text-gray-500 text-center py-8">
                  Aucune tâche prévue ce jour
                </p>
              )
            )}
          </div>

          {/* Projets */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Projets ({projects.length})
              </h3>
              <button
                onClick={() => setShowProjectForm(!showProjectForm)}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Nouveau projet
              </button>
            </div>

            {/* Formulaire création projet */}
            {showProjectForm && (
              <form onSubmit={handleCreateProject} className="bg-purple-50 p-4 rounded-lg mb-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du projet *
                  </label>
                  <input
                    type="text"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ex: Refonte du site web"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows="2"
                    placeholder="Détails optionnels..."
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Créer le projet
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProjectForm(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}

            {/* Liste des projets */}
            {projects.length > 0 ? (
              <div className="space-y-2">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-3 rounded-lg border-2 border-purple-200 bg-purple-50"
                  >
                    <h4 className="font-medium text-gray-900">{project.name}</h4>
                    {project.description && (
                      <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`
                        text-xs px-2 py-1 rounded-full font-medium
                        ${project.status === 'Terminé'
                          ? 'bg-green-100 text-green-700'
                          : project.status === 'En cours'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                        }
                      `}>
                        {project.status}
                      </span>
                      <span className="text-xs text-gray-600">
                        {project.progress}% complété
                      </span>
                      {project.client && (
                        <span className="text-xs text-gray-600">
                          👤 {project.client.name}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !showProjectForm && (
                <p className="text-gray-500 text-center py-8">
                  Aucun projet avec échéance ce jour
                </p>
              )
            )}
          </div>

          {/* Message si vide */}
          {!hasContent && !showTaskForm && !showProjectForm && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Rien de prévu ce jour
              </h3>
              <p className="text-gray-600 mb-6">
                Créez une tâche ou planifiez un projet pour cette date
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Créer une tâche
                </button>
                <button
                  onClick={() => setShowProjectForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Créer un projet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DayDetailsModal
