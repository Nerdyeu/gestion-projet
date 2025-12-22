import { useState } from 'react'
import { User, Bell, Lock, Palette, Globe } from 'lucide-react'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', name: 'Profil', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Sécurité', icon: Lock },
    { id: 'appearance', name: 'Apparence', icon: Palette },
    { id: 'general', name: 'Général', icon: Globe },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-1">Gérez vos préférences et paramètres de l'application</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={18} className="mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
              <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                Enregistrer les modifications
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="font-medium text-gray-900">Notifications par email</h3>
                  <p className="text-sm text-gray-500">Recevoir des notifications par email</p>
                </div>
                <input type="checkbox" className="h-5 w-5 text-primary-600 rounded" defaultChecked />
              </div>
              <div className="flex items-center justify-between py-3 border-t">
                <div>
                  <h3 className="font-medium text-gray-900">Notifications de projet</h3>
                  <p className="text-sm text-gray-500">Recevoir des notifications sur les projets</p>
                </div>
                <input type="checkbox" className="h-5 w-5 text-primary-600 rounded" defaultChecked />
              </div>
              <div className="flex items-center justify-between py-3 border-t">
                <div>
                  <h3 className="font-medium text-gray-900">Notifications de tâches</h3>
                  <p className="text-sm text-gray-500">Recevoir des notifications sur les tâches</p>
                </div>
                <input type="checkbox" className="h-5 w-5 text-primary-600 rounded" defaultChecked />
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                Changer le mot de passe
              </button>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thème
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option>Clair</option>
                  <option>Sombre</option>
                  <option>Automatique</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur principale
                </label>
                <div className="flex space-x-3">
                  <button className="w-10 h-10 bg-blue-500 rounded-lg border-2 border-blue-600"></button>
                  <button className="w-10 h-10 bg-green-500 rounded-lg border-2 border-transparent hover:border-gray-300"></button>
                  <button className="w-10 h-10 bg-purple-500 rounded-lg border-2 border-transparent hover:border-gray-300"></button>
                  <button className="w-10 h-10 bg-red-500 rounded-lg border-2 border-transparent hover:border-gray-300"></button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Langue
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option>Français</option>
                  <option>English</option>
                  <option>Español</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuseau horaire
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option>Europe/Paris (GMT+1)</option>
                  <option>America/New_York (GMT-5)</option>
                  <option>Asia/Tokyo (GMT+9)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
