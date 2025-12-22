import { useState, useEffect } from 'react'
import { Plus, CheckSquare, Square, Clock, Trash2, AlertCircle, Loader } from 'lucide-react'
import { getTasks, getProjects, createTask, updateTask, deleteTask } from '../services/api'
import ConfirmDialog from '../components/ConfirmDialog'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, taskId: null, taskTitle: '' })
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    priority: 'Moyenne',
    dueDate: ''
  })

  // Charger les données
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [tasksData, projectsData] = await Promise.all([
        getTasks().catch(err => {
          console.error('Erreur tâches:', err)
          return []
        }),
        getProjects().catch(err => {
          console.error('Erreur projets:', err)
          return []
        })
      ])
      setTasks(tasksData || [])
      setProjects(projectsData || [])
      setError(null)
    } catch (err) {
      setError('Erreur lors du chargement des données')
      console.error(err)
      setTasks([])
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateTask(editingId, formData)
      } else {
        await createTask(formData)
      }
      setFormData({ title: '', description: '', projectId: '', priority: 'Moyenne', dueDate: '' })
      setShowModal(false)
      setEditingId(null)
      fetchData()
    } catch (err) {
      setError('Erreur lors de la sauvegarde')
    }
  }

  const handleEdit = (task) => {
    setEditingId(task.id)
    setFormData({
      title: task.title,
      description: task.description || '',
      projectId: task.projectId,
      priority: task.priority,
      dueDate: task.dueDate?.split('T')[0] || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    const task = tasks.find(t => t.id === id)
    setConfirmDialog({
      isOpen: true,
      taskId: id,
      taskTitle: task?.title || 'cette tâche'
    })
  }

  const confirmDelete = async () => {
    try {
      await deleteTask(confirmDialog.taskId)
      fetchData()
    } catch (err) {
      setError('Erreur lors de la suppression')
    }
  }

  const handleToggleComplete = async (task) => {
    try {
      await updateTask(task.id, { ...task, completed: !task.completed })
      fetchData()
    } catch (err) {
      setError('Erreur lors de la mise à jour')
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setFormData({ title: '', description: '', projectId: '', priority: 'Moyenne', dueDate: '' })
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Haute': return 'bg-red-100 text-red-700'
      case 'Moyenne': return 'bg-orange-100 text-orange-700'
      case 'Basse': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const incompleteTasks = tasks.filter(t => !t.completed)
  const completeTasks = tasks.filter(t => t.completed)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader className="animate-spin text-primary-600" size={40} />
          <p className="text-gray-600">Chargement des tâches...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tâches</h1>
          <p className="mt-2 text-gray-600">Planifiez et suivez vos tâches</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus size={20} />
          Nouvelle tâche
        </button>
      </div>

      {/* Erreur */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} className="text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">À faire</div>
          <div className="text-2xl font-bold text-gray-900">{incompleteTasks.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Terminées</div>
          <div className="text-2xl font-bold text-green-600">{completeTasks.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-2xl font-bold text-gray-900">{tasks.length}</div>
        </div>
      </div>

      {/* Tâches à faire */}
      {incompleteTasks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">À faire</h2>
          <div className="bg-white rounded-lg shadow">
            <div className="divide-y divide-gray-200">
              {incompleteTasks.map((task) => (
                <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className="mt-1 flex-shrink-0"
                    >
                      <Square className="text-gray-400" size={20} />
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{task.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">{task.project?.name || '-'}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString('fr-FR') : '-'}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(task)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tâches terminées */}
      {completeTasks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Terminées</h2>
          <div className="bg-white rounded-lg shadow">
            <div className="divide-y divide-gray-200">
              {completeTasks.map((task) => (
                <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className="mt-1 flex-shrink-0"
                    >
                      <CheckSquare className="text-green-500" size={20} />
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-500 line-through">{task.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">{task.project?.name || '-'}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString('fr-FR') : '-'}
                        </div>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Aucune tâche pour le moment</p>
        </div>
      )}

      {/* Modal de création/édition de tâche */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal} />
            
            <div className="relative bg-white rounded-lg max-w-lg w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingId ? 'Éditer la tâche' : 'Nouvelle tâche'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre de la tâche *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ex: Finaliser le design"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Projet *
                  </label>
                  <select
                    required
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un projet</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Description de la tâche..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priorité
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="Basse">Basse</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Haute">Haute</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date d'échéance
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    {editingId ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Dialog de confirmation de suppression */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, taskId: null, taskTitle: '' })}
        onConfirm={confirmDelete}
        title="Supprimer la tâche"
        message={`Êtes-vous sûr de vouloir supprimer la tâche "${confirmDialog.taskTitle}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  )
}
