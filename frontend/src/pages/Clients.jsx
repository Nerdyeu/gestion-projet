import { useState, useEffect } from 'react'
import { Plus, Mail, Phone, AlertCircle, Loader, Edit, Trash2 } from 'lucide-react'
import { getClients, createClient, updateClient, deleteClient } from '../services/api'
import ConfirmDialog from '../components/ConfirmDialog'

export default function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, clientId: null, clientName: '' })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const data = await getClients().catch(err => {
        console.error('Erreur clients:', err)
        return []
      })
      setClients(data || [])
      setError(null)
    } catch (err) {
      setError('Erreur lors du chargement des clients')
      console.error(err)
      setClients([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateClient(editingId, formData)
      } else {
        await createClient(formData)
      }
      setFormData({ name: '', email: '', phone: '', address: '' })
      setShowModal(false)
      setEditingId(null)
      fetchClients()
    } catch (err) {
      setError('Erreur lors de la sauvegarde')
    }
  }

  const handleEdit = (client) => {
    setEditingId(client.id)
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      address: client.address || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    const client = clients.find(c => c.id === id)
    setConfirmDialog({
      isOpen: true,
      clientId: id,
      clientName: client?.name || 'ce client'
    })
  }

  const confirmDelete = async () => {
    try {
      await deleteClient(confirmDialog.clientId)
      fetchClients()
    } catch (err) {
      setError('Erreur lors de la suppression')
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setFormData({ name: '', email: '', phone: '', address: '' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader className="animate-spin text-primary-600" size={40} />
          <p className="text-gray-600">Chargement des clients...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="mt-2 text-gray-600">Gérez votre portefeuille clients</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus size={20} />
          Nouveau client
        </button>
      </div>

      {/* Erreur */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} className="text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {clients.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Aucun client pour le moment</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus size={20} />
            Ajouter un client
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <div key={client.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(client)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={16} />
                  {client.email}
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={16} />
                    {client.phone}
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t">
                <span className="text-sm text-gray-500">{client.projects?.length || 0} projets actifs</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de création/édition de client */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal} />
            
            <div className="relative bg-white rounded-lg max-w-lg w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingId ? 'Éditer le client' : 'Nouveau client'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Nom du client"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="01 23 45 67 89"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Adresse du client"
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
        onClose={() => setConfirmDialog({ isOpen: false, clientId: null, clientName: '' })}
        onConfirm={confirmDelete}
        title="Supprimer le client"
        message={`Êtes-vous sûr de vouloir supprimer "${confirmDialog.clientName}" ? Cette action supprimera également tous les projets et tâches associés à ce client.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  )
}
