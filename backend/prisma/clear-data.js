import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Nettoyage de la base de données...')

  // Supprimer toutes les données
  await prisma.task.deleteMany()
  console.log('✅ Tâches supprimées')

  await prisma.project.deleteMany()
  console.log('✅ Projets supprimés')

  await prisma.client.deleteMany()
  console.log('✅ Clients supprimés')

  await prisma.supplier.deleteMany()
  console.log('✅ Fournisseurs supprimés')

  await prisma.user.deleteMany()
  console.log('✅ Utilisateurs supprimés')

  // Créer uniquement l'utilisateur admin de base
  const user = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@gestionpro.fr',
      password: 'password123',
      role: 'admin'
    }
  })

  console.log('✅ Utilisateur admin créé')
  console.log('🎉 Base de données nettoyée ! Prête pour vos propres données.')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du nettoyage:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
