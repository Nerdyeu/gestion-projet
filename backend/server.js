import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

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
        projectId: parseInt(projectId),
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

    const updateData = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (priority !== undefined) updateData.priority = priority
    if (projectId !== undefined) updateData.projectId = parseInt(projectId)
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

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Quelque chose s\'est mal passÃ©!' })
})

// DÃ©marrage du serveur
app.listen(PORT, () => {
  console.log(`ðŸš€ Serveur dÃ©marrÃ© sur le port ${PORT}`)
  console.log(`ðŸ“ API disponible sur http://localhost:${PORT}/api`)
})

// Gestion de l'arrÃªt propre
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})


