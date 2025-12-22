import { HelpCircle, Mail, MessageCircle, BookOpen, Phone } from 'lucide-react'

export default function Support() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Support et Aide</h1>
        <p className="text-gray-600 mt-1">Nous sommes là pour vous aider</p>
      </div>

      {/* Options de contact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
            <Mail className="text-primary-600" size={24} />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
          <p className="text-sm text-gray-600 mb-3">Envoyez-nous un email et nous vous répondrons sous 24h</p>
          <a href="mailto:support@gestionpro.com" className="text-primary-600 text-sm font-medium hover:underline">
            support@gestionpro.com
          </a>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
            <Phone className="text-primary-600" size={24} />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Téléphone</h3>
          <p className="text-sm text-gray-600 mb-3">Du lundi au vendredi de 9h à 18h</p>
          <a href="tel:+33123456789" className="text-primary-600 text-sm font-medium hover:underline">
            +33 1 23 45 67 89
          </a>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
            <MessageCircle className="text-primary-600" size={24} />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Chat en direct</h3>
          <p className="text-sm text-gray-600 mb-3">Discutez avec notre équipe en temps réel</p>
          <button className="text-primary-600 text-sm font-medium hover:underline">
            Démarrer le chat
          </button>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center mb-6">
          <HelpCircle className="text-primary-600 mr-3" size={28} />
          <h2 className="text-xl font-bold text-gray-900">Questions Fréquentes</h2>
        </div>

        <div className="space-y-4">
          <div className="border-b pb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Comment créer un nouveau projet ?</h3>
            <p className="text-gray-600 text-sm">
              Accédez à la page "Gestion de projet", cliquez sur le bouton "Nouveau Projet" et remplissez les informations requises.
            </p>
          </div>

          <div className="border-b pb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Comment ajouter des membres à un projet ?</h3>
            <p className="text-gray-600 text-sm">
              Ouvrez le projet concerné, cliquez sur "Gérer l'équipe" et sélectionnez les membres à ajouter.
            </p>
          </div>

          <div className="border-b pb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Comment suivre l'avancement des tâches ?</h3>
            <p className="text-gray-600 text-sm">
              Utilisez le tableau de bord pour avoir une vue d'ensemble, ou accédez à "Gestion de tâche" pour voir tous les détails.
            </p>
          </div>

          <div className="border-b pb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Comment gérer mes clients et fournisseurs ?</h3>
            <p className="text-gray-600 text-sm">
              Utilisez les sections "Gestion de client" et "Gestion de fournisseur" pour ajouter, modifier et suivre vos contacts.
            </p>
          </div>

          <div className="pb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Comment exporter mes données ?</h3>
            <p className="text-gray-600 text-sm">
              Accédez aux paramètres, section "Général", puis cliquez sur "Exporter les données". Vous pourrez choisir le format (CSV, PDF, Excel).
            </p>
          </div>
        </div>
      </div>

      {/* Formulaire de contact */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <BookOpen className="text-primary-600 mr-3" size={28} />
          <h2 className="text-xl font-bold text-gray-900">Contactez-nous</h2>
        </div>

        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="votre.email@exemple.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sujet
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Objet de votre message"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              rows="5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Décrivez votre problème ou votre question..."
            ></textarea>
          </div>

          <button
            type="submit"
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Envoyer le message
          </button>
        </form>
      </div>

      {/* Informations de version */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Gestion Pro v1.0.0</p>
        <p className="mt-1">© 2024 Tous droits réservés</p>
      </div>
    </div>
  )
}
