import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Démarrage du seeding...')

  // Nettoyer la base de données
  await prisma.task.deleteMany()
  await prisma.project.deleteMany()
  await prisma.client.deleteMany()
  await prisma.supplier.deleteMany()
  await prisma.user.deleteMany()

  // Créer un utilisateur par défaut
  const user = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@gestionpro.fr',
      password: 'password123', // À hasher en production
      role: 'admin'
    }
  })

  console.log('✅ Utilisateur créé')

  // Créer des clients
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        name: 'Entreprise Alpha',
        email: 'contact@alpha.fr',
        phone: '+33 1 23 45 67 89',
        address: '123 Rue de Paris, 75001 Paris'
      }
    }),
    prisma.client.create({
      data: {
        name: 'Startup Beta',
        email: 'hello@beta.io',
        phone: '+33 6 12 34 56 78',
        address: '456 Avenue des Champs, 69000 Lyon'
      }
    }),
    prisma.client.create({
      data: {
        name: 'Groupe Gamma',
        email: 'info@gamma.com',
        phone: '+33 4 56 78 90 12',
        address: '789 Boulevard du Tech, 31000 Toulouse'
      }
    }),
    prisma.client.create({
      data: {
        name: 'Tech Delta',
        email: 'support@delta.tech',
        phone: '+33 9 87 65 43 21',
        address: '321 Rue Innovation, 44000 Nantes'
      }
    })
  ])

  console.log(`✅ ${clients.length} clients créés`)

  // Créer des fournisseurs
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        name: 'TechSupply Co.',
        email: 'contact@techsupply.fr',
        phone: '+33 1 11 22 33 44',
        category: 'Informatique'
      }
    }),
    prisma.supplier.create({
      data: {
        name: 'Office Plus',
        email: 'ventes@officeplus.fr',
        phone: '+33 2 22 33 44 55',
        category: 'Fournitures'
      }
    }),
    prisma.supplier.create({
      data: {
        name: 'Cloud Services Pro',
        email: 'info@cloudpro.io',
        phone: '+33 3 33 44 55 66',
        category: 'Services Cloud'
      }
    })
  ])

  console.log(`✅ ${suppliers.length} fournisseurs créés`)

  // Créer des projets
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'Refonte site web',
        description: 'Refonte complète du site web corporate',
        status: 'En cours',
        progress: 75,
        deadline: new Date('2025-03-15'),
        clientId: clients[0].id,
        userId: user.id
      }
    }),
    prisma.project.create({
      data: {
        name: 'Application mobile',
        description: 'Développement application mobile iOS/Android',
        status: 'En cours',
        progress: 45,
        deadline: new Date('2025-04-30'),
        clientId: clients[1].id,
        userId: user.id
      }
    }),
    prisma.project.create({
      data: {
        name: 'Dashboard Analytics',
        description: 'Création dashboard de visualisation de données',
        status: 'En cours',
        progress: 90,
        deadline: new Date('2025-02-28'),
        clientId: clients[2].id,
        userId: user.id
      }
    }),
    prisma.project.create({
      data: {
        name: 'API REST',
        description: 'Développement API RESTful pour intégrations',
        status: 'En cours',
        progress: 30,
        deadline: new Date('2025-05-15'),
        clientId: clients[3].id,
        userId: user.id
      }
    }),
    prisma.project.create({
      data: {
        name: 'Migration Cloud',
        description: 'Migration infrastructure vers le cloud',
        status: 'Terminé',
        progress: 100,
        deadline: new Date('2025-01-15'),
        clientId: clients[0].id,
        userId: user.id
      }
    })
  ])

  console.log(`✅ ${projects.length} projets créés`)

  // Créer des tâches
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Finaliser le design',
        description: 'Compléter toutes les maquettes des pages principales',
        priority: 'Haute',
        completed: false,
        dueDate: new Date('2025-02-10'),
        projectId: projects[0].id
      }
    }),
    prisma.task.create({
      data: {
        title: 'Intégration API',
        description: 'Connecter le frontend aux endpoints backend',
        priority: 'Haute',
        completed: true,
        dueDate: new Date('2025-01-25'),
        projectId: projects[0].id
      }
    }),
    prisma.task.create({
      data: {
        title: 'Tests utilisateurs',
        description: 'Organiser session de tests avec 10 utilisateurs',
        priority: 'Moyenne',
        completed: false,
        dueDate: new Date('2025-03-01'),
        projectId: projects[0].id
      }
    }),
    prisma.task.create({
      data: {
        title: 'Setup projet React Native',
        description: 'Initialiser le projet et configurer navigation',
        priority: 'Haute',
        completed: true,
        dueDate: new Date('2025-01-15'),
        projectId: projects[1].id
      }
    }),
    prisma.task.create({
      data: {
        title: 'Authentification utilisateur',
        description: 'Implémenter login/register avec JWT',
        priority: 'Haute',
        completed: false,
        dueDate: new Date('2025-02-20'),
        projectId: projects[1].id
      }
    }),
    prisma.task.create({
      data: {
        title: 'Push notifications',
        description: 'Configurer Firebase Cloud Messaging',
        priority: 'Moyenne',
        completed: false,
        dueDate: new Date('2025-03-15'),
        projectId: projects[1].id
      }
    }),
    prisma.task.create({
      data: {
        title: 'Graphiques interactifs',
        description: 'Créer visualisations avec Chart.js',
        priority: 'Haute',
        completed: true,
        dueDate: new Date('2025-01-30'),
        projectId: projects[2].id
      }
    }),
    prisma.task.create({
      data: {
        title: 'Optimisation performance',
        description: 'Améliorer temps de chargement des données',
        priority: 'Moyenne',
        completed: false,
        dueDate: new Date('2025-02-15'),
        projectId: projects[2].id
      }
    }),
    prisma.task.create({
      data: {
        title: 'Documentation API',
        description: 'Rédiger documentation Swagger/OpenAPI',
        priority: 'Basse',
        completed: false,
        dueDate: new Date('2025-04-01'),
        projectId: projects[3].id
      }
    }),
    prisma.task.create({
      data: {
        title: 'Endpoints CRUD',
        description: 'Créer endpoints pour toutes les entités',
        priority: 'Haute',
        completed: false,
        dueDate: new Date('2025-03-10'),
        projectId: projects[3].id
      }
    })
  ])

  console.log(`✅ ${tasks.length} tâches créées`)
  console.log('🎉 Seeding terminé avec succès!')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
