import { useState, useEffect } from 'react'
import { Plus, Mail, Phone, AlertCircle, Loader, Edit, Trash2 } from 'lucide-react'
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../services/api'
import ConfirmDialog from '../components/ConfirmDialog'

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, supplierId: null, supplierName: '' })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: ''
  })

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      const data = await getSuppliers().catch(err => {
        console.error('Erreur fournisseurs:', err)
        return []
      })
      setSuppliers(data || [])
      setError(null)
    } catch (err) {
      setError('Erreur lors du chargement des fournisseurs')
      console.error(err)
      setSuppliers([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateSupplier(editingId, formData)
      } else {
        await createSupplier(formData)
      }
      setFormData({ name: '', email: '', phone: '', category: '' })
      setShowModal(false)
      setEditingId(null)
      fetchSuppliers()
    } catch (err) {
      setError('Erreur lors de la sauvegarde')
    }
  }

  const handleEdit = (supplier) => {
    setEditingId(supplier.id)
    setFormData({
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone || '',
      category: supplier.category || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    const supplier = suppliers.find(s => s.id === id)
    setConfirmDialog({
      isOpen: true,
      supplierId: id,
      supplierName: supplier?.name || 'ce fournisseur'
    })
  }

  const confirmDelete = async () => {
    try {
      await deleteSupplier(confirmDialog.supplierId)
      fetchSuppliers()
    } catch (err) {
      setError('Erreur lors de la suppression')
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setFormData({ name: '', email: '', phone: '', category: '' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader className="animate-spin text-primary-600" size={40} />
          <p className="text-gray-600">Chargement des fournisseurs...</p>
        </div>
      </div>
    )
  }

  const categories = ['Informatique', 'Fournitures', 'Services', 'Autre']

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fournisseurs</h1>
          <p className="mt-2 text-gray-600">Gérez vos partenaires et fournisseurs</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus size={20} />
          Nouveau fournisseur
        </button>
      </div>

      {/* Erreur */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} className="text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {suppliers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Aucun fournisseur pour le moment</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus size={20} />
            Ajouter un fournisseur
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(supplier)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(supplier.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              {supplier.category && (
                <div className="mb-3">
                  <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                    {supplier.category}
                  </span>
                </div>
              )}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={16} />
                  {supplier.email}
                </div>
                {supplier.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={16} />
                    {supplier.phone}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de création/édition de fournisseur */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal} />
            
            <div className="relative bg-white rounded-lg max-w-lg w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingId ? 'Éditer le fournisseur' : 'Nouveau fournisseur'}
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
                    placeholder="Nom du fournisseur"
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
                    Catégorie
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
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
        onClose={() => setConfirmDialog({ isOpen: false, supplierId: null, supplierName: '' })}
        onConfirm={confirmDelete}
        title="Supprimer le fournisseur"
        message={`Êtes-vous sûr de vouloir supprimer "${confirmDialog.supplierName}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  )
}
