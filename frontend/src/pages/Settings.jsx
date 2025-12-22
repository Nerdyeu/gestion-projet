import { useState, useEffect } from 'react'
import { User, Bell, Lock, Palette, Globe, Save, CheckCircle2, AlertCircle } from 'lucide-react'
import {
  getCurrentUser,
  updateUserProfile,
  updateUserNotifications,
  updateUserPassword,
  updateUserAppearance,
  updateUserGeneral
} from '../services/api'
import { useTheme } from '../context/ThemeContext'

export default function Settings() {
  const { updateTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [userId, setUserId] = useState(null)

  // États pour chaque section
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: ''
  })

  const [notificationsData, setNotificationsData] = useState({
    emailNotifications: true,
    projectNotifications: true,
    taskNotifications: true
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [appearanceData, setAppearanceData] = useState({
    theme: 'Clair',
    primaryColor: 'blue'
  })

  const [generalData, setGeneralData] = useState({
    language: 'Français',
    timezone: 'Europe/Paris (GMT+1)'
  })

  const tabs = [
    { id: 'profile', name: 'Profil', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Sécurité', icon: Lock },
    { id: 'appearance', name: 'Apparence', icon: Palette },
    { id: 'general', name: 'Général', icon: Globe },
  ]

  // Charger les paramètres au montage
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const settings = await getCurrentUser()

      setUserId(settings.id)

      setProfileData({
        name: settings.name || '',
        email: settings.email || '',
        phone: settings.phone || ''
      })

      setNotificationsData({
        emailNotifications: settings.emailNotifications ?? true,
        projectNotifications: settings.projectNotifications ?? true,
        taskNotifications: settings.taskNotifications ?? true
      })

      setAppearanceData({
        theme: settings.theme || 'Clair',
        primaryColor: settings.primaryColor || 'blue'
      })

      setGeneralData({
        language: settings.language || 'Français',
        timezone: settings.timezone || 'Europe/Paris (GMT+1)'
      })
    } catch (error) {
      showMessage('Erreur lors du chargement des paramètres', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  // Sauvegarder le profil
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await updateUserProfile(userId, profileData)
      showMessage('Profil mis à jour avec succès')
    } catch (error) {
      showMessage('Erreur lors de la mise à jour du profil', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Sauvegarder les notifications
  const handleToggleNotification = async (field, value) => {
    try {
      const updatedData = { ...notificationsData, [field]: value }
      setNotificationsData(updatedData)
      await updateUserNotifications(userId, { [field]: value })
      showMessage('Préférences de notifications mises à jour')
    } catch (error) {
      showMessage('Erreur lors de la mise à jour', 'error')
      // Revenir à l'ancienne valeur en cas d'erreur
      setNotificationsData(notificationsData)
    }
  }

  // Changer le mot de passe
  const handleChangePassword = async (e) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('Les mots de passe ne correspondent pas', 'error')
      return
    }

    if (passwordData.newPassword.length < 6) {
      showMessage('Le mot de passe doit contenir au moins 6 caractères', 'error')
      return
    }

    try {
      setSaving(true)
      await updateUserPassword(userId, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      showMessage('Mot de passe changé avec succès')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      showMessage(error.response?.data?.error || 'Erreur lors du changement de mot de passe', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Sauvegarder l'apparence
  const handleSaveAppearance = async (field, value) => {
    try {
      const updatedData = { ...appearanceData, [field]: value }
      setAppearanceData(updatedData)
      await updateUserAppearance(userId, { [field]: value })

      // Mettre à jour le thème visuellement
      if (field === 'theme') {
        updateTheme(value, appearanceData.primaryColor)
      } else if (field === 'primaryColor') {
        updateTheme(appearanceData.theme, value)
      }

      showMessage('Apparence mise à jour')
    } catch (error) {
      showMessage('Erreur lors de la mise à jour', 'error')
      setAppearanceData(appearanceData)
    }
  }

  // Sauvegarder les paramètres généraux
  const handleSaveGeneral = async (field, value) => {
    try {
      const updatedData = { ...generalData, [field]: value }
      setGeneralData(updatedData)
      await updateUserGeneral(userId, { [field]: value })
      showMessage('Paramètres mis à jour')
    } catch (error) {
      showMessage('Erreur lors de la mise à jour', 'error')
      setGeneralData(generalData)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des paramètres...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-1">Gérez vos préférences et paramètres de l'application</p>
      </div>

      {/* Message de notification */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

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
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Votre nom"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="votre.email@exemple.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </form>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="font-medium text-gray-900">Notifications par email</h3>
                  <p className="text-sm text-gray-500">Recevoir des notifications par email</p>
                </div>
                <input
                  type="checkbox"
                  className="h-5 w-5 text-primary-600 rounded cursor-pointer"
                  checked={notificationsData.emailNotifications}
                  onChange={(e) => handleToggleNotification('emailNotifications', e.target.checked)}
                />
              </div>
              <div className="flex items-center justify-between py-3 border-t">
                <div>
                  <h3 className="font-medium text-gray-900">Notifications de projet</h3>
                  <p className="text-sm text-gray-500">Recevoir des notifications sur les projets</p>
                </div>
                <input
                  type="checkbox"
                  className="h-5 w-5 text-primary-600 rounded cursor-pointer"
                  checked={notificationsData.projectNotifications}
                  onChange={(e) => handleToggleNotification('projectNotifications', e.target.checked)}
                />
              </div>
              <div className="flex items-center justify-between py-3 border-t">
                <div>
                  <h3 className="font-medium text-gray-900">Notifications de tâches</h3>
                  <p className="text-sm text-gray-500">Recevoir des notifications sur les tâches</p>
                </div>
                <input
                  type="checkbox"
                  className="h-5 w-5 text-primary-600 rounded cursor-pointer"
                  checked={notificationsData.taskNotifications}
                  onChange={(e) => handleToggleNotification('taskNotifications', e.target.checked)}
                />
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  minLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {saving ? 'Enregistrement...' : 'Changer le mot de passe'}
              </button>
            </form>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thème
                </label>
                <select
                  value={appearanceData.theme}
                  onChange={(e) => handleSaveAppearance('theme', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
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
                  <button
                    type="button"
                    onClick={() => handleSaveAppearance('primaryColor', 'blue')}
                    className={`w-10 h-10 bg-blue-500 rounded-lg border-2 transition-all ${
                      appearanceData.primaryColor === 'blue' ? 'border-blue-700 ring-2 ring-blue-300' : 'border-transparent hover:border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveAppearance('primaryColor', 'green')}
                    className={`w-10 h-10 bg-green-500 rounded-lg border-2 transition-all ${
                      appearanceData.primaryColor === 'green' ? 'border-green-700 ring-2 ring-green-300' : 'border-transparent hover:border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveAppearance('primaryColor', 'purple')}
                    className={`w-10 h-10 bg-purple-500 rounded-lg border-2 transition-all ${
                      appearanceData.primaryColor === 'purple' ? 'border-purple-700 ring-2 ring-purple-300' : 'border-transparent hover:border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveAppearance('primaryColor', 'red')}
                    className={`w-10 h-10 bg-red-500 rounded-lg border-2 transition-all ${
                      appearanceData.primaryColor === 'red' ? 'border-red-700 ring-2 ring-red-300' : 'border-transparent hover:border-gray-300'
                    }`}
                  />
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
                <select
                  value={generalData.language}
                  onChange={(e) => handleSaveGeneral('language', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option>Français</option>
                  <option>English</option>
                  <option>Español</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuseau horaire
                </label>
                <select
                  value={generalData.timezone}
                  onChange={(e) => handleSaveGeneral('timezone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
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
