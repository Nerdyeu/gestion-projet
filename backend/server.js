import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import os from 'os'
import { sendTaskCompletedEmail, sendProjectCompletedEmail } from './services/emailService.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const prisma = new PrismaClient()

// Utilisateur par défaut (sert de fallback si aucun utilisateur fourni)
const DEFAULT_USER = {
  name: 'Admin',
  email: 'admin@gestionpro.fr',
  password: 'password123', // À hasher en production
  role: 'admin'
}

const getDefaultUserId = async () => {
  const user = await prisma.user.upsert({
    where: { email: DEFAULT_USER.email },
    update: {},
    create: DEFAULT_USER
  })
  return user.id
}

// Middleware
app.use(cors())
app.use(express.json())

// Routes de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API fonctionne correctement' })
})

// Route statistiques
app.get('/api/stats', async (req, res) => {
  try {
    const [projectCount, clientCount, taskCount] = await Promise.all([
      prisma.project.count(),
      prisma.client.count(),
      prisma.task.count()
    ])
    res.json({
      projects: projectCount,
      clients: clientCount,
      tasks: taskCount
    })
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la rÃ©cupÃ©ration des statistiques' })
  }
})

// ===== ROUTES PROJETS =====
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        client: true,
        tasks: true
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(projects)
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la rÃ©cupÃ©ration des projets' })
  }
})

app.post('/api/projects', async (req, res) => {
  try {
    const { name, description, status, progress, deadline, clientId, userId } = req.body
    const parsedClientId = clientId === undefined || clientId === null || clientId === '' ? null : parseInt(clientId)
    const parsedUserId = userId === undefined || userId === null || userId === '' ? null : parseInt(userId)
    const parsedProgress = progress !== undefined ? parseInt(progress) : 0

    if (clientId && Number.isNaN(parsedClientId)) {
      return res.status(400).json({ error: 'clientId invalide' })
    }

    let targetUserId = !Number.isNaN(parsedUserId) ? parsedUserId : null
    if (targetUserId) {
      const existingUser = await prisma.user.findUnique({ where: { id: targetUserId } })
      if (!existingUser) {
        targetUserId = null
      }
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        status: status || 'En cours',
        progress: Number.isNaN(parsedProgress) ? 0 : parsedProgress,
        deadline: deadline ? new Date(deadline) : null,
        userId: targetUserId || await getDefaultUserId(),
        ...(parsedClientId !== null ? { clientId: parsedClientId } : {})
      },
      include: {
        client: true
      }
    })
    res.status(201).json(project)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur lors de la création du projet' })
  }
})
app.patch('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { clientId, progress, deadline, status, ...rest } = req.body
    const parsedClientId = clientId === undefined || clientId === null || clientId === '' ? null : parseInt(clientId)
    const parsedProgress = progress !== undefined ? parseInt(progress) : undefined

    if (clientId && Number.isNaN(parsedClientId)) {
      return res.status(400).json({ error: 'clientId invalide' })
    }

    const projectId = parseInt(id)

    // Si le statut passe à "Terminé", marquer toutes les tâches comme complètes et progression à 100%
    if (status === 'Terminé') {
      await prisma.task.updateMany({
        where: { projectId: projectId },
        data: { completed: true }
      })
    }

    // Récupérer l'ancien statut avant la mise à jour
    const oldProject = await prisma.project.findUnique({
      where: { id: projectId },
      select: { status: true }
    })

    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...rest,
        ...(status !== undefined ? {
          status,
          // Si terminé, forcer la progression à 100%
          ...(status === 'Terminé' ? { progress: 100 } : {})
        } : {}),
        ...(clientId !== undefined ? { clientId: parsedClientId } : {}),
        // N'appliquer la progression manuelle que si le statut n'est pas "Terminé"
        ...(progress !== undefined && status !== 'Terminé' ? { progress: Number.isNaN(parsedProgress) ? 0 : parsedProgress } : {}),
        ...(deadline !== undefined ? { deadline: deadline ? new Date(deadline) : null } : {})
      },
      include: { client: true, tasks: true }
    })

    // Envoyer un email si le projet vient d'être terminé
    if (status === 'Terminé' && oldProject.status !== 'Terminé') {
      const user = await prisma.user.findFirst({
        select: { email: true, name: true, projectNotifications: true }
      })

      if (user && user.projectNotifications) {
        console.log('🔔 Envoi notification email pour projet terminé...')
        sendProjectCompletedEmail(user.email, user.name, project).catch(console.error)
      }
    }

    res.json(project)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur lors de la mise à jour du projet' })
  }
})
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params
    const projectId = parseInt(id)

    // Supprimer d'abord toutes les tâches liées au projet
    await prisma.task.deleteMany({
      where: { projectId: projectId }
    })

    // Ensuite supprimer le projet
    await prisma.project.delete({
      where: { id: projectId }
    })

    res.json({ message: 'Projet supprimé' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur lors de la suppression du projet' })
  }
})

// ===== ROUTES CLIENTS =====
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      include: {
        projects: true
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(clients)
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la rÃ©cupÃ©ration des clients' })
  }
})

app.post('/api/clients', async (req, res) => {
  try {
    const { name, email, phone, address } = req.body
    const client = await prisma.client.create({
      data: { name, email, phone, address }
    })
    res.status(201).json(client)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur lors de la crÃ©ation du client' })
  }
})

app.patch('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params
    const client = await prisma.client.update({
      where: { id: parseInt(id) },
      data: req.body
    })
    res.json(client)
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise Ã  jour du client' })
  }
})

app.delete('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params
    const clientId = parseInt(id)

    // Récupérer tous les projets du client
    const projects = await prisma.project.findMany({
      where: { clientId: clientId }
    })

    // Supprimer les tâches de chaque projet
    for (const project of projects) {
      await prisma.task.deleteMany({
        where: { projectId: project.id }
      })
    }

    // Supprimer les projets du client
    await prisma.project.deleteMany({
      where: { clientId: clientId }
    })

    // Supprimer le client
    await prisma.client.delete({
      where: { id: clientId }
    })

    res.json({ message: 'Client supprimé' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur lors de la suppression du client' })
  }
})

// ===== ROUTES FOURNISSEURS =====
app.get('/api/suppliers', async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { createdAt: 'desc' }
    })
    res.json(suppliers)
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la rÃ©cupÃ©ration des fournisseurs' })
  }
})

app.post('/api/suppliers', async (req, res) => {
  try {
    const { name, email, phone, category } = req.body
    const supplier = await prisma.supplier.create({
      data: { name, email, phone, category }
    })
    res.status(201).json(supplier)
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la crÃ©ation du fournisseur' })
  }
})

app.patch('/api/suppliers/:id', async (req, res) => {
  try {
    const { id } = req.params
    const supplier = await prisma.supplier.update({
      where: { id: parseInt(id) },
      data: req.body
    })
    res.json(supplier)
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise Ã  jour du fournisseur' })
  }
})

app.delete('/api/suppliers/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.supplier.delete({
      where: { id: parseInt(id) }
    })
    res.json({ message: 'Fournisseur supprimÃ©' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du fournisseur' })
  }
})

// ===== ROUTES TÃ‚CHES =====
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        project: {
          include: {
            client: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la rÃ©cupÃ©ration des tÃ¢ches' })
  }
})

app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, priority, projectId, dueDate } = req.body
    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'Moyenne',
        projectId: projectId ? parseInt(projectId) : null,
        dueDate: dueDate ? new Date(dueDate) : null
      },
      include: {
        project: {
          include: {
            client: true
          }
        }
      }
    })
    res.status(201).json(task)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur lors de la crÃ©ation de la tÃ¢che' })
  }
})

// Remplacement pour la route PATCH /api/tasks/:id

app.patch('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, priority, projectId, dueDate, completed } = req.body

    // Récupérer l'ancienne valeur de completed avant mise à jour
    const oldTask = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      select: { completed: true }
    })

    const updateData = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (priority !== undefined) updateData.priority = priority
    if (projectId !== undefined) updateData.projectId = projectId ? parseInt(projectId) : null
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
    if (completed !== undefined) updateData.completed = completed

    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        project: {
          include: {
            client: true
          }
        }
      }
    })

    // Si le statut de complétion a changé, mettre à jour la progression du projet
    if (completed !== undefined && task.projectId) {
      const allProjectTasks = await prisma.task.findMany({
        where: { projectId: task.projectId }
      })

      if (allProjectTasks.length > 0) {
        const completedCount = allProjectTasks.filter(t => t.completed).length
        const progressPercentage = Math.round((completedCount / allProjectTasks.length) * 100)

        await prisma.project.update({
          where: { id: task.projectId },
          data: { progress: progressPercentage }
        })
      }
    }

    // Envoyer un email si la tâche vient d'être terminée
    if (completed === true && oldTask.completed === false) {
      const user = await prisma.user.findFirst({
        select: { email: true, name: true, taskNotifications: true }
      })

      if (user && user.taskNotifications) {
        console.log('🔔 Envoi notification email pour tâche terminée...')
        sendTaskCompletedEmail(user.email, user.name, task).catch(console.error)
      }
    }

    res.json(task)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la tâche' })
  }
})

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.task.delete({
      where: { id: parseInt(id) }
    })
    res.json({ message: 'TÃ¢che supprimÃ©e' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de la tÃ¢che' })
  }
})

// ===== ROUTE STATS DASHBOARD =====
app.get('/api/stats', async (req, res) => {
  try {
    const [projectsCount, clientsCount, tasksCount] = await Promise.all([
      prisma.project.count({ where: { status: 'En cours' } }),
      prisma.client.count(),
      prisma.task.count({ where: { completed: false } })
    ])

    res.json({
      projectsCount,
      clientsCount,
      tasksCount
    })
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la rÃ©cupÃ©ration des statistiques' })
  }
})

// ===== ROUTES PARAMÈTRES UTILISATEUR =====

// Récupérer le premier utilisateur (utilisateur par défaut)
app.get('/api/user/current', async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        emailNotifications: true,
        projectNotifications: true,
        taskNotifications: true,
        theme: true,
        primaryColor: true,
        language: true,
        timezone: true
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'Aucun utilisateur trouvé' })
    }

    res.json(user)
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' })
  }
})

// Récupérer les paramètres d'un utilisateur
app.get('/api/user/:userId/settings', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        emailNotifications: true,
        projectNotifications: true,
        taskNotifications: true,
        theme: true,
        primaryColor: true,
        language: true,
        timezone: true
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    res.json(user)
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des paramètres' })
  }
})

// Mettre à jour le profil
app.patch('/api/user/:userId/profile', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId)
    const { name, email, phone } = req.body

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone })
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true
      }
    })

    res.json(user)
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error)
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' })
  }
})

// Mettre à jour les préférences de notifications
app.patch('/api/user/:userId/notifications', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId)
    const { emailNotifications, projectNotifications, taskNotifications } = req.body

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(projectNotifications !== undefined && { projectNotifications }),
        ...(taskNotifications !== undefined && { taskNotifications })
      },
      select: {
        emailNotifications: true,
        projectNotifications: true,
        taskNotifications: true
      }
    })

    res.json(user)
  } catch (error) {
    console.error('Erreur lors de la mise à jour des notifications:', error)
    res.status(500).json({ error: 'Erreur lors de la mise à jour des notifications' })
  }
})

// Changer le mot de passe
app.patch('/api/user/:userId/password', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId)
    const { currentPassword, newPassword } = req.body

    // Récupérer l'utilisateur actuel
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    // Vérifier le mot de passe actuel (en production, utiliser bcrypt)
    if (user.password !== currentPassword) {
      return res.status(400).json({ error: 'Mot de passe actuel incorrect' })
    }

    // Mettre à jour le mot de passe (en production, hasher avec bcrypt)
    await prisma.user.update({
      where: { id: userId },
      data: { password: newPassword }
    })

    res.json({ message: 'Mot de passe changé avec succès' })
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error)
    res.status(500).json({ error: 'Erreur lors du changement de mot de passe' })
  }
})

// Mettre à jour les préférences d'apparence
app.patch('/api/user/:userId/appearance', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId)
    const { theme, primaryColor } = req.body

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(theme && { theme }),
        ...(primaryColor && { primaryColor })
      },
      select: {
        theme: true,
        primaryColor: true
      }
    })

    res.json(user)
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'apparence:', error)
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'apparence' })
  }
})

// Mettre à jour les paramètres généraux
app.patch('/api/user/:userId/general', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId)
    const { language, timezone } = req.body

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(language && { language }),
        ...(timezone && { timezone })
      },
      select: {
        language: true,
        timezone: true
      }
    })

    res.json(user)
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres généraux:', error)
    res.status(500).json({ error: 'Erreur lors de la mise à jour des paramètres généraux' })
  }
})

// ===== ROUTES SAMSARA =====

const SAMSARA_BASE = 'https://api.samsara.com'

async function getSamsaraToken() {
  const config = await prisma.samsaraConfig.findFirst()
  return config?.apiToken || null
}

async function samsaraFetch(path, token, params = {}) {
  const url = new URL(`${SAMSARA_BASE}${path}`)
  Object.entries(params).forEach(([k, v]) => v && url.searchParams.set(k, v))
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  })
  if (!res.ok) {
    const text = await res.text()
    throw { status: res.status, message: text }
  }
  return res.json()
}

app.get('/api/samsara/config', async (req, res) => {
  try {
    const config = await prisma.samsaraConfig.findFirst()
    if (!config) return res.json({ configured: false })
    const token = config.apiToken
    const masked = token.length > 8 ? token.slice(0, 4) + '****' + token.slice(-4) : '****'
    res.json({ configured: true, maskedToken: masked })
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération de la configuration' })
  }
})

app.post('/api/samsara/config', async (req, res) => {
  try {
    const { apiToken } = req.body
    if (!apiToken) return res.status(400).json({ error: 'Token API requis' })
    await prisma.samsaraConfig.upsert({
      where: { id: 1 },
      update: { apiToken },
      create: { id: 1, apiToken }
    })
    res.json({ message: 'Configuration sauvegardée', configured: true })
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la sauvegarde de la configuration' })
  }
})

app.get('/api/samsara/test', async (req, res) => {
  try {
    const token = await getSamsaraToken()
    if (!token) return res.status(400).json({ error: 'Samsara non configuré' })
    const data = await samsaraFetch('/fleet/vehicles', token, { limit: '1' })
    res.json({ success: true, message: 'Connexion Samsara réussie' })
  } catch (err) {
    res.status(err.status || 500).json({ error: 'Échec de connexion Samsara', details: err.message })
  }
})

app.get('/api/samsara/vehicles', async (req, res) => {
  try {
    const token = await getSamsaraToken()
    if (!token) return res.status(400).json({ error: 'Samsara non configuré' })
    let vehicles = []
    let cursor = null
    do {
      const params = { limit: '512' }
      if (cursor) params.after = cursor
      const data = await samsaraFetch('/fleet/vehicles', token, params)
      vehicles = vehicles.concat(data.data || [])
      cursor = data.pagination?.endCursor && data.pagination.hasNextPage ? data.pagination.endCursor : null
    } while (cursor)
    res.json({ data: vehicles })
  } catch (err) {
    res.status(err.status || 500).json({ error: 'Erreur lors de la récupération des véhicules', details: err.message })
  }
})

app.get('/api/samsara/fuel-report', async (req, res) => {
  try {
    const { startDate, endDate, vehicleIds, metrics } = req.query
    if (!startDate || !endDate) return res.status(400).json({ error: 'Dates de début et fin requises' })

    const token = await getSamsaraToken()
    if (!token) return res.status(400).json({ error: 'Samsara non configuré' })

    const requestedMetrics = metrics ? metrics.split(',') : ['fuelPercents', 'obdOdometerMeters', 'obdEngineSeconds']
    const types = requestedMetrics.join(',')

    const startTime = new Date(startDate).toISOString()
    const endTime = new Date(endDate).toISOString()

    let allData = []
    let cursor = null
    do {
      const params = { startTime, endTime, types, limit: '512' }
      if (vehicleIds) params.vehicleIds = vehicleIds
      if (cursor) params.after = cursor
      const data = await samsaraFetch('/fleet/vehicles/stats/history', token, params)
      allData = allData.concat(data.data || [])
      cursor = data.pagination?.endCursor && data.pagination.hasNextPage ? data.pagination.endCursor : null
    } while (cursor)

    // Agrégation par véhicule
    const report = allData.map(vehicle => {
      const result = { id: vehicle.id, name: vehicle.name || 'Véhicule inconnu' }

      if (vehicle.fuelPercents?.length >= 2) {
        const sorted = [...vehicle.fuelPercents].sort((a, b) => new Date(a.time) - new Date(b.time))
        result.fuelStart = sorted[0].value?.percentage ?? null
        result.fuelEnd = sorted[sorted.length - 1].value?.percentage ?? null
        result.fuelDelta = result.fuelStart !== null && result.fuelEnd !== null
          ? parseFloat((result.fuelStart - result.fuelEnd).toFixed(2))
          : null
        result.fuelReadings = vehicle.fuelPercents.length
      }

      if (vehicle.obdOdometerMeters?.length >= 2) {
        const sorted = [...vehicle.obdOdometerMeters].sort((a, b) => new Date(a.time) - new Date(b.time))
        const odomStart = sorted[0].value?.meters ?? null
        const odomEnd = sorted[sorted.length - 1].value?.meters ?? null
        result.distanceMeters = odomStart !== null && odomEnd !== null ? odomEnd - odomStart : null
        result.distanceKm = result.distanceMeters !== null ? parseFloat((result.distanceMeters / 1000).toFixed(2)) : null
        result.odometerReadings = vehicle.obdOdometerMeters.length
      }

      if (vehicle.obdEngineSeconds?.length >= 2) {
        const sorted = [...vehicle.obdEngineSeconds].sort((a, b) => new Date(a.time) - new Date(b.time))
        const secStart = sorted[0].value?.engineSeconds ?? null
        const secEnd = sorted[sorted.length - 1].value?.engineSeconds ?? null
        const deltaSeconds = secStart !== null && secEnd !== null ? secEnd - secStart : null
        result.engineHours = deltaSeconds !== null ? parseFloat((deltaSeconds / 3600).toFixed(2)) : null
      }

      return result
    })

    res.json({ data: report, startDate, endDate, vehicleCount: report.length })
  } catch (err) {
    console.error('Samsara fuel-report error:', err)
    res.status(err.status || 500).json({ error: 'Erreur lors de la génération du rapport', details: err.message })
  }
})

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Quelque chose s\'est mal passÃ©!' })
})

// DÃ©marrage du serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`ðŸš€ Serveur dÃ©marrÃ© sur le port ${PORT}`)
  console.log(`ðŸ“ API disponible sur http://localhost:${PORT}/api`)
})

// Gestion de l'arrÃªt propre
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

// Fonction pour obtenir l'adresse IP locale
function getLocalIPAddress() {
  const networkInterfaces = os.networkInterfaces()

  for (const name of Object.keys(networkInterfaces)) {
    for (const net of networkInterfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address
      }
    }
  }
  return null
}


