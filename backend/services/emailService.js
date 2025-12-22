import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

// Configuration du transporteur d'email avec Gmail
// Utilise l'email de l'utilisateur depuis la base de données
function getTransporter(userEmail) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: userEmail,  // Utilise l'email de l'utilisateur depuis la BD
      pass: process.env.SMTP_PASS,
    },
  })

  console.log('📧 Service email initialisé avec Gmail')
  console.log(`   Compte: ${userEmail}`)

  return transporter
}

// Envoyer une notification pour une tâche terminée
export async function sendTaskCompletedEmail(userEmail, userName, task) {
  try {
    const transport = getTransporter(userEmail)

    const info = await transport.sendMail({
      from: `"${userName}" <${userEmail}>`,
      to: userEmail,
      subject: `✅ Tâche terminée: ${task.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Tâche terminée</h2>
          <p>Bonjour ${userName},</p>
          <p>La tâche suivante a été marquée comme terminée:</p>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">${task.title}</h3>
            ${task.description ? `<p style="color: #6b7280;">${task.description}</p>` : ''}
            <p style="color: #6b7280;">
              <strong>Priorité:</strong> ${task.priority}<br>
              ${task.project ? `<strong>Projet:</strong> ${task.project.name}<br>` : ''}
              <strong>Date de complétion:</strong> ${new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            Ceci est une notification automatique de votre application de gestion de projet.
          </p>
        </div>
      `,
    })

    console.log('📧 Email envoyé avec succès:', info.messageId)
    console.log('📬 Destinataire:', userEmail)

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error)
    return { success: false, error: error.message }
  }
}

// Envoyer une notification pour un projet terminé
export async function sendProjectCompletedEmail(userEmail, userName, project) {
  try {
    const transport = getTransporter(userEmail)

    const info = await transport.sendMail({
      from: `"${userName}" <${userEmail}>`,
      to: userEmail,
      subject: `🎉 Projet terminé: ${project.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Projet terminé</h2>
          <p>Bonjour ${userName},</p>
          <p>Félicitations! Le projet suivant a été marqué comme terminé:</p>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">${project.name}</h3>
            ${project.description ? `<p style="color: #6b7280;">${project.description}</p>` : ''}
            <p style="color: #6b7280;">
              <strong>Statut:</strong> ${project.status}<br>
              <strong>Progression:</strong> ${project.progress}%<br>
              ${project.client ? `<strong>Client:</strong> ${project.client.name}<br>` : ''}
              <strong>Date de complétion:</strong> ${new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>

          <p style="color: #22c55e; font-weight: bold; font-size: 18px;">
            🎉 Excellent travail!
          </p>

          <p style="color: #6b7280; font-size: 14px;">
            Ceci est une notification automatique de votre application de gestion de projet.
          </p>
        </div>
      `,
    })

    console.log('📧 Email envoyé avec succès:', info.messageId)
    console.log('📬 Destinataire:', userEmail)

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error)
    return { success: false, error: error.message }
  }
}
