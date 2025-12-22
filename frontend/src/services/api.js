import axios from 'axios'

// Configuration de base pour Axios
const api = axios.create({
  // Use Vite env var when set, otherwise rely on local /api proxy
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Intercepteur pour ajouter le token JWT (quand l'authentification sera implémentée)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ========================================
// DASHBOARD / STATS
// ========================================

export const getStats = async () => {
  try {
    const response = await api.get('/stats')
    return response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    throw error
  }
}

// ========================================
// PROJETS
// ========================================

export const getProjects = async () => {
  try {
    const response = await api.get('/projects')
    return response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error)
    throw error
  }
}

export const createProject = async (projectData) => {
  try {
    const response = await api.post('/projects', projectData)
    return response.data
  } catch (error) {
    console.error('Erreur lors de la création du projet:', error)
    throw error
  }
}

export const updateProject = async (id, projectData) => {
  try {
    const response = await api.patch(`/projects/${id}`, projectData)
    return response.data
  } catch (error) {
    console.error('Erreur lors de la mise à jour du projet:', error)
    throw error
  }
}

export const deleteProject = async (id) => {
  try {
    await api.delete(`/projects/${id}`)
  } catch (error) {
    console.error('Erreur lors de la suppression du projet:', error)
    throw error
  }
}

// ========================================
// CLIENTS
// ========================================

export const getClients = async () => {
  try {
    const response = await api.get('/clients')
    return response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error)
    throw error
  }
}

export const createClient = async (clientData) => {
  try {
    const response = await api.post('/clients', clientData)
    return response.data
  } catch (error) {
    console.error('Erreur lors de la création du client:', error)
    throw error
  }
}

export const updateClient = async (id, clientData) => {
  try {
    const response = await api.patch(`/clients/${id}`, clientData)
    return response.data
  } catch (error) {
    console.error('Erreur lors de la mise à jour du client:', error)
    throw error
  }
}

export const deleteClient = async (id) => {
  try {
    await api.delete(`/clients/${id}`)
  } catch (error) {
    console.error('Erreur lors de la suppression du client:', error)
    throw error
  }
}

// ========================================
// FOURNISSEURS
// ========================================

export const getSuppliers = async () => {
  try {
    const response = await api.get('/suppliers')
    return response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des fournisseurs:', error)
    throw error
  }
}

export const createSupplier = async (supplierData) => {
  try {
    const response = await api.post('/suppliers', supplierData)
    return response.data
  } catch (error) {
    console.error('Erreur lors de la création du fournisseur:', error)
    throw error
  }
}

export const updateSupplier = async (id, supplierData) => {
  try {
    const response = await api.patch(`/suppliers/${id}`, supplierData)
    return response.data
  } catch (error) {
    console.error('Erreur lors de la mise à jour du fournisseur:', error)
    throw error
  }
}

export const deleteSupplier = async (id) => {
  try {
    await api.delete(`/suppliers/${id}`)
  } catch (error) {
    console.error('Erreur lors de la suppression du fournisseur:', error)
    throw error
  }
}

// ========================================
// TÂCHES
// ========================================

export const getTasks = async () => {
  try {
    const response = await api.get('/tasks')
    return response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches:', error)
    throw error
  }
}

export const createTask = async (taskData) => {
  try {
    const response = await api.post('/tasks', taskData)
    return response.data
  } catch (error) {
    console.error('Erreur lors de la création de la tâche:', error)
    throw error
  }
}

export const updateTask = async (id, taskData) => {
  try {
    const response = await api.patch(`/tasks/${id}`, taskData)
    return response.data
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la tâche:', error)
    throw error
  }
}

export const deleteTask = async (id) => {
  try {
    await api.delete(`/tasks/${id}`)
  } catch (error) {
    console.error('Erreur lors de la suppression de la tâche:', error)
    throw error
  }
}

export const toggleTaskComplete = async (id, completed) => {
  try {
    const response = await api.patch(`/tasks/${id}`, { completed })
    return response.data
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la tâche:', error)
    throw error
  }
}

// ========================================
// PARAMÈTRES UTILISATEUR
// ========================================

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/user/current')
    return response.data
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur actuel:', error)
    throw error
  }
}

export const getUserSettings = async (userId) => {
  try {
    const response = await api.get(`/user/${userId}/settings`)
    return response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error)
    throw error
  }
}

export const updateUserProfile = async (userId, profileData) => {
  try {
    const response = await api.patch(`/user/${userId}/profile`, profileData)
    return response.data
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error)
    throw error
  }
}

export const updateUserNotifications = async (userId, notificationData) => {
  try {
    const response = await api.patch(`/user/${userId}/notifications`, notificationData)
    return response.data
  } catch (error) {
    console.error('Erreur lors de la mise à jour des notifications:', error)
    throw error
  }
}

export const updateUserPassword = async (userId, passwordData) => {
  try {
    const response = await api.patch(`/user/${userId}/password`, passwordData)
    return response.data
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error)
    throw error
  }
}

export const updateUserAppearance = async (userId, appearanceData) => {
  try {
    const response = await api.patch(`/user/${userId}/appearance`, appearanceData)
    return response.data
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'apparence:', error)
    throw error
  }
}

export const updateUserGeneral = async (userId, generalData) => {
  try {
    const response = await api.patch(`/user/${userId}/general`, generalData)
    return response.data
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres généraux:', error)
    throw error
  }
}

// ========================================
// AUTHENTIFICATION (à implémenter)
// ========================================

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password })
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
    }
    return response.data
  } catch (error) {
    console.error('Erreur lors de la connexion:', error)
    throw error
  }
}

export const logout = () => {
  localStorage.removeItem('token')
}

// Export des fonctions
export default {
  getStats,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getClients,
  createClient,
  getSuppliers,
  createSupplier,
  getTasks,
  createTask,
  toggleTaskComplete,
  login,
  logout
}
