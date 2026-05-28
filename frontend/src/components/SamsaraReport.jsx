import { useState, useEffect, useCallback } from 'react'
import {
  Truck, Key, CheckCircle2, XCircle, RefreshCw, Download,
  ChevronDown, Calendar, Gauge, BarChart3, Settings2,
  Eye, EyeOff, AlertCircle, Fuel, Clock, MapPin, DollarSign
} from 'lucide-react'
const API_URL = import.meta.env.VITE_API_URL || ''

const QUICK_RANGES = [
  { label: "Aujourd'hui", days: 0 },
  { label: '7 derniers jours', days: 7 },
  { label: '30 derniers jours', days: 30 },
  { label: 'Ce mois-ci', days: null, thisMonth: true },
  { label: 'Mois dernier', days: null, lastMonth: true },
]

const METRIC_OPTIONS = [
  { key: 'fuelPercents', label: 'Carburant (%)', icon: Fuel, color: 'text-orange-500' },
  { key: 'obdOdometerMeters', label: 'Distance (km)', icon: MapPin, color: 'text-blue-500' },
  { key: 'obdEngineSeconds', label: 'Heures moteur', icon: Clock, color: 'text-green-500' },
]

function getDateRange(preset) {
  const now = new Date()
  if (preset.days === 0) {
    const d = now.toISOString().slice(0, 10)
    return { start: d, end: d }
  }
  if (preset.days) {
    const start = new Date(now)
    start.setDate(start.getDate() - preset.days)
    return { start: start.toISOString().slice(0, 10), end: now.toISOString().slice(0, 10) }
  }
  if (preset.thisMonth) {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    return { start: start.toISOString().slice(0, 10), end: now.toISOString().slice(0, 10) }
  }
  if (preset.lastMonth) {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const end = new Date(now.getFullYear(), now.getMonth(), 0)
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) }
  }
  return { start: now.toISOString().slice(0, 10), end: now.toISOString().slice(0, 10) }
}

function formatNumber(val, decimals = 2) {
  if (val === null || val === undefined) return '—'
  return Number(val).toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export default function SamsaraReport() {
  // Config
  const [apiToken, setApiToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [configStatus, setConfigStatus] = useState(null) // null | 'configured' | 'unconfigured'
  const [maskedToken, setMaskedToken] = useState('')
  const [region, setRegion] = useState('US')
  const [savingConfig, setSavingConfig] = useState(false)
  const [testingConn, setTestingConn] = useState(false)
  const [connResult, setConnResult] = useState(null) // null | 'ok' | 'error'
  const [connDetails, setConnDetails] = useState(null)

  // Vehicles
  const [vehicles, setVehicles] = useState([])
  const [loadingVehicles, setLoadingVehicles] = useState(false)
  const [selectedVehicles, setSelectedVehicles] = useState([]) // [] = all
  const [vehicleDropdownOpen, setVehicleDropdownOpen] = useState(false)

  // Filters
  const today = new Date().toISOString().slice(0, 10)
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0, 10)
  })
  const [endDate, setEndDate] = useState(today)
  const [selectedMetrics, setSelectedMetrics] = useState(['fuelPercents', 'obdOdometerMeters', 'obdEngineSeconds'])
  const [fuelPrice, setFuelPrice] = useState('1.85')
  const [tankCapacity, setTankCapacity] = useState('80')

  // Report
  const [report, setReport] = useState(null)
  const [loadingReport, setLoadingReport] = useState(false)
  const [reportError, setReportError] = useState(null)
  const [sortKey, setSortKey] = useState('name')
  const [sortDir, setSortDir] = useState('asc')

  useEffect(() => {
    loadConfig()
  }, [])

  async function loadConfig() {
    try {
      const res = await fetch(`${API_URL}/api/samsara/config`)
      const data = await res.json()
      if (data.region) setRegion(data.region)
      if (data.configured) {
        setConfigStatus('configured')
        setMaskedToken(data.maskedToken)
      } else {
        setConfigStatus('unconfigured')
      }
    } catch {
      setConfigStatus('unconfigured')
    }
  }

  async function saveConfig() {
    if (!apiToken.trim()) return
    setSavingConfig(true)
    try {
      const res = await fetch(`${API_URL}/api/samsara/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiToken: apiToken.trim(), region })
      })
      if (res.ok) {
        await loadConfig()
        setApiToken('')
        setConnResult(null)
        setConnDetails(null)
      }
    } finally {
      setSavingConfig(false)
    }
  }

  async function changeRegion(newRegion) {
    setRegion(newRegion)
    if (configStatus === 'configured') {
      // Mettre à jour la région sur le serveur sans changer le token
      try {
        const tokenRes = await fetch(`${API_URL}/api/samsara/config`)
        const cfg = await tokenRes.json()
        if (cfg.configured) {
          // On a besoin du vrai token pour réenregistrer — on demande à l'utilisateur de re-saisir
          // Astuce : on fait juste un test avec la nouvelle région côté serveur via un endpoint dédié
        }
      } catch {}
    }
  }

  async function testConnection() {
    setTestingConn(true)
    setConnResult(null)
    setConnDetails(null)
    try {
      const res = await fetch(`${API_URL}/api/samsara/test`)
      const data = await res.json()
      setConnResult(res.ok ? 'ok' : 'error')
      setConnDetails(data)
      if (res.ok) loadVehicles()
    } catch (err) {
      setConnResult('error')
      setConnDetails({ error: err.message })
    } finally {
      setTestingConn(false)
    }
  }

  async function detectRegion() {
    setTestingConn(true)
    setConnResult(null)
    setConnDetails(null)
    try {
      const res = await fetch(`${API_URL}/api/samsara/detect-region`)
      const data = await res.json()
      if (data.workingRegion) {
        setRegion(data.workingRegion)
        setConnResult('ok')
        setConnDetails({
          region: data.workingRegion,
          message: `Région détectée : ${data.workingRegion}`,
          results: data.results,
          tokenLength: data.tokenLength,
          tokenPrefix: data.tokenPrefix
        })
        await loadConfig()
        loadVehicles()
      } else {
        setConnResult('error')
        setConnDetails({
          message: 'Token rejeté par les deux régions — le token est invalide ou révoqué',
          results: data.results,
          tokenLength: data.tokenLength,
          tokenPrefix: data.tokenPrefix
        })
      }
    } catch (err) {
      setConnResult('error')
      setConnDetails({ error: err.message })
    } finally {
      setTestingConn(false)
    }
  }

  const loadVehicles = useCallback(async () => {
    if (configStatus !== 'configured') return
    setLoadingVehicles(true)
    try {
      const res = await fetch(`${API_URL}/api/samsara/vehicles`)
      if (res.ok) {
        const data = await res.json()
        setVehicles(data.data || [])
      }
    } finally {
      setLoadingVehicles(false)
    }
  }, [configStatus])

  useEffect(() => {
    if (configStatus === 'configured') loadVehicles()
  }, [configStatus, loadVehicles])

  function applyQuickRange(preset) {
    const range = getDateRange(preset)
    setStartDate(range.start)
    setEndDate(range.end)
  }

  function toggleMetric(key) {
    setSelectedMetrics(prev =>
      prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key]
    )
  }

  function toggleVehicle(id) {
    setSelectedVehicles(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    )
  }

  async function generateReport() {
    if (!startDate || !endDate) return
    setLoadingReport(true)
    setReportError(null)
    setReport(null)
    try {
      const params = new URLSearchParams({ startDate, endDate, metrics: selectedMetrics.join(',') })
      if (selectedVehicles.length > 0) params.set('vehicleIds', selectedVehicles.join(','))
      const res = await fetch(`${API_URL}/api/samsara/fuel-report?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur inconnue')
      setReport(data)
    } catch (err) {
      setReportError(err.message)
    } finally {
      setLoadingReport(false)
    }
  }

  function sortData(data) {
    return [...data].sort((a, b) => {
      const valA = a[sortKey] ?? ''
      const valB = b[sortKey] ?? ''
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDir === 'asc' ? valA - valB : valB - valA
      }
      return sortDir === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA))
    })
  }

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  function exportCSV() {
    if (!report?.data?.length) return
    const price = parseFloat(fuelPrice) || 0
    const capacity = parseFloat(tankCapacity) || 0

    const headers = ['Véhicule', 'ID']
    if (selectedMetrics.includes('fuelPercents')) headers.push('Carburant début (%)', 'Carburant fin (%)', 'Consommation (%)', 'Consommation (L)', 'Coût estimé (€)')
    if (selectedMetrics.includes('obdOdometerMeters')) headers.push('Distance (km)')
    if (selectedMetrics.includes('obdEngineSeconds')) headers.push('Heures moteur')
    if (selectedMetrics.includes('obdOdometerMeters') && selectedMetrics.includes('fuelPercents')) headers.push('L/100km')

    const rows = sortData(report.data).map(v => {
      const liters = v.fuelDelta !== null && capacity > 0 ? (v.fuelDelta / 100) * capacity : null
      const cost = liters !== null ? liters * price : null
      const l100 = liters !== null && v.distanceKm > 0 ? (liters / v.distanceKm) * 100 : null
      const row = [v.name, v.id]
      if (selectedMetrics.includes('fuelPercents')) {
        row.push(v.fuelStart ?? '', v.fuelEnd ?? '', v.fuelDelta ?? '', liters?.toFixed(2) ?? '', cost?.toFixed(2) ?? '')
      }
      if (selectedMetrics.includes('obdOdometerMeters')) row.push(v.distanceKm ?? '')
      if (selectedMetrics.includes('obdEngineSeconds')) row.push(v.engineHours ?? '')
      if (selectedMetrics.includes('obdOdometerMeters') && selectedMetrics.includes('fuelPercents')) row.push(l100?.toFixed(2) ?? '')
      return row
    })

    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rapport-samsara-${startDate}-${endDate}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const showFuel = selectedMetrics.includes('fuelPercents')
  const showDist = selectedMetrics.includes('obdOdometerMeters')
  const showHours = selectedMetrics.includes('obdEngineSeconds')
  const priceVal = parseFloat(fuelPrice) || 0
  const capVal = parseFloat(tankCapacity) || 0

  const sortedData = report?.data ? sortData(report.data) : []

  const totals = sortedData.reduce((acc, v) => {
    const liters = v.fuelDelta !== null && capVal > 0 ? (v.fuelDelta / 100) * capVal : null
    return {
      distanceKm: acc.distanceKm + (v.distanceKm || 0),
      fuelDelta: acc.fuelDelta + (v.fuelDelta || 0),
      liters: liters !== null ? (acc.liters || 0) + liters : acc.liters,
      cost: liters !== null ? (acc.cost || 0) + liters * priceVal : acc.cost,
      engineHours: acc.engineHours + (v.engineHours || 0),
    }
  }, { distanceKm: 0, fuelDelta: 0, liters: null, cost: null, engineHours: 0 })

  function SortHeader({ label, col }) {
    return (
      <th
        className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 select-none"
        onClick={() => handleSort(col)}
      >
        <span className="flex items-center gap-1">
          {label}
          {sortKey === col && <span className="text-purple-500">{sortDir === 'asc' ? '↑' : '↓'}</span>}
        </span>
      </th>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Rapports Samsara
          </h1>
          <p className="text-slate-500 mt-1">Suivi de consommation et performance de flotte</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2">
          <Truck className="text-orange-500" size={20} />
          <span className="text-sm font-medium text-orange-700">Intégration Samsara</span>
        </div>
      </div>

      {/* Configuration API */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center">
            <Key className="text-white" size={18} />
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">Configuration API</h2>
            <p className="text-xs text-slate-500">Renseignez votre token Samsara Fleet API</p>
          </div>
          {configStatus === 'configured' && (
            <div className="ml-auto flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full">
              <CheckCircle2 size={13} /> Configuré — {maskedToken}
            </div>
          )}
          {configStatus === 'unconfigured' && (
            <div className="ml-auto flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-full">
              <AlertCircle size={13} /> Non configuré
            </div>
          )}
        </div>

        <div className="space-y-3">
          {/* Sélecteur de région */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Région de votre compte Samsara</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRegion('US')}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  region === 'US'
                    ? 'bg-orange-50 border-orange-300 text-orange-700 ring-2 ring-orange-200'
                    : 'bg-white border-gray-200 text-slate-600 hover:border-gray-300'
                }`}
              >
                🇺🇸 États-Unis (api.samsara.com)
              </button>
              <button
                type="button"
                onClick={() => setRegion('EU')}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  region === 'EU'
                    ? 'bg-orange-50 border-orange-300 text-orange-700 ring-2 ring-orange-200'
                    : 'bg-white border-gray-200 text-slate-600 hover:border-gray-300'
                }`}
              >
                🇪🇺 Europe (api.eu.samsara.com)
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Si vous êtes en Europe, sélectionnez Europe. Un mauvais choix donne 0 véhicule.
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-64">
              <input
                type={showToken ? 'text' : 'password'}
                value={apiToken}
                onChange={e => setApiToken(e.target.value)}
                placeholder="samsara_api_XXXXXXXXXXXXXXXXXXXXXXXXXX"
                className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent font-mono"
              />
              <button
                onClick={() => setShowToken(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button
              onClick={saveConfig}
              disabled={!apiToken.trim() || savingConfig}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingConfig ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
            {configStatus === 'configured' && (
              <>
                <button
                  onClick={testConnection}
                  disabled={testingConn}
                  className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw size={14} className={testingConn ? 'animate-spin' : ''} />
                  Tester
                </button>
                <button
                  onClick={detectRegion}
                  disabled={testingConn}
                  className="px-5 py-2.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-all flex items-center gap-2 disabled:opacity-50"
                  title="Teste votre token sur les deux régions pour identifier la bonne"
                >
                  <RefreshCw size={14} className={testingConn ? 'animate-spin' : ''} />
                  Détecter la région
                </button>
              </>
            )}
          </div>

          {configStatus === 'configured' && (
            <p className="text-xs text-slate-500">
              Pour changer le token, saisissez-en un nouveau et cliquez Sauvegarder. Utilisez "Détecter la région" si vous avez un doute.
            </p>
          )}
        </div>

        {connResult === 'ok' && (
          <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 size={15} /> Connexion Samsara réussie
            </div>
            {connDetails && (
              <p className="text-xs text-green-600 mt-1 ml-6">
                Région : {connDetails.region} · Véhicules détectés dans le test : {connDetails.vehiclesInResponse ?? 0}
              </p>
            )}
          </div>
        )}
        {connResult === 'error' && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 text-sm">
            <div className="flex items-center gap-2 text-red-700 font-medium">
              <XCircle size={15} /> {connDetails?.message || 'Connexion échouée'}
            </div>
            {connDetails?.details && (
              <pre className="text-xs text-red-600 mt-1 ml-6 whitespace-pre-wrap break-all">{connDetails.details}</pre>
            )}
            {connDetails?.results && (
              <div className="text-xs text-red-600 mt-2 ml-6 space-y-1">
                <p className="font-medium">Test sur les 2 régions :</p>
                <p>🇺🇸 US : {connDetails.results.US?.ok ? '✓ OK' : `✗ ${connDetails.results.US?.status || ''} ${connDetails.results.US?.message || ''}`}</p>
                <p>🇪🇺 EU : {connDetails.results.EU?.ok ? '✓ OK' : `✗ ${connDetails.results.EU?.status || ''} ${connDetails.results.EU?.message || ''}`}</p>
                {connDetails.tokenPrefix && <p className="text-slate-500 mt-1">Token utilisé : {connDetails.tokenPrefix} (longueur : {connDetails.tokenLength})</p>}
              </div>
            )}
            <p className="text-xs text-red-600 mt-2 ml-6">
              Le token est invalide ou révoqué côté Samsara. Régénérez-en un nouveau dans Samsara Cloud → Paramètres → Accès API → Tokens API → "Créer un token API".
            </p>
          </div>
        )}
      </div>

      {configStatus === 'configured' && (
        <>
          {/* Filtres */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Settings2 className="text-white" size={18} />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">Paramètres du rapport</h2>
                <p className="text-xs text-slate-500">Personnalisez les métriques et la période</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Période */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                  <Calendar size={14} /> Période
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {QUICK_RANGES.map(preset => (
                    <button
                      key={preset.label}
                      onClick={() => applyQuickRange(preset)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-slate-600 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 transition-all"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-slate-500 mb-1">Début</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      max={endDate}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-slate-500 mb-1">Fin</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      min={startDate}
                      max={today}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                  </div>
                </div>
              </div>

              {/* Véhicules */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                  <Truck size={14} /> Véhicules
                  {loadingVehicles && <RefreshCw size={12} className="animate-spin text-slate-400" />}
                </label>
                <div className="relative">
                  <button
                    onClick={() => setVehicleDropdownOpen(v => !v)}
                    className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-left hover:border-orange-300 transition-colors"
                  >
                    <span className="text-slate-700">
                      {selectedVehicles.length === 0
                        ? `Tous les véhicules (${vehicles.length})`
                        : `${selectedVehicles.length} véhicule(s) sélectionné(s)`}
                    </span>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${vehicleDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {vehicleDropdownOpen && vehicles.length > 0 && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-56 overflow-y-auto">
                      <div className="p-2 border-b border-gray-100">
                        <button
                          onClick={() => { setSelectedVehicles([]); setVehicleDropdownOpen(false) }}
                          className="w-full text-left px-3 py-1.5 text-sm text-orange-600 font-medium hover:bg-orange-50 rounded-lg"
                        >
                          Tous les véhicules
                        </button>
                      </div>
                      {vehicles.map(v => (
                        <label key={v.id} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedVehicles.includes(v.id)}
                            onChange={() => toggleVehicle(v.id)}
                            className="accent-orange-500"
                          />
                          <span className="text-sm text-slate-700">{v.name || v.id}</span>
                          {v.licensePlate && <span className="text-xs text-slate-400 ml-auto">{v.licensePlate}</span>}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {vehicles.length === 0 && !loadingVehicles && (
                  <button onClick={loadVehicles} className="mt-2 text-xs text-orange-500 hover:underline flex items-center gap-1">
                    <RefreshCw size={11} /> Recharger la liste
                  </button>
                )}
              </div>

              {/* Métriques */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                  <Gauge size={14} /> Métriques à inclure
                </label>
                <div className="flex flex-col gap-2">
                  {METRIC_OPTIONS.map(m => {
                    const Icon = m.icon
                    return (
                      <label key={m.key} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedMetrics.includes(m.key)}
                          onChange={() => toggleMetric(m.key)}
                          className="accent-orange-500 w-4 h-4"
                        />
                        <Icon size={15} className={m.color} />
                        <span className="text-sm text-slate-700 group-hover:text-slate-900">{m.label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Paramètres coût */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                  <DollarSign size={14} /> Calcul de coût (optionnel)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Prix carburant (€/L)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={fuelPrice}
                      onChange={e => setFuelPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Capacité réservoir (L)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={tankCapacity}
                      onChange={e => setTankCapacity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                  </div>
                </div>
                {capVal > 0 && showFuel && (
                  <p className="text-xs text-slate-500 mt-1.5">
                    1% de consommation = {(capVal / 100).toFixed(1)} L → {((capVal / 100) * priceVal).toFixed(2)} €
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={generateReport}
                disabled={loadingReport || selectedMetrics.length === 0}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <BarChart3 size={18} className={loadingReport ? 'animate-pulse' : ''} />
                {loadingReport ? 'Génération...' : 'Générer le rapport'}
              </button>
            </div>
          </div>

          {/* Erreur */}
          {reportError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
              <XCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-medium text-red-700">Erreur lors de la génération du rapport</p>
                <p className="text-sm text-red-600 mt-1">{reportError}</p>
              </div>
            </div>
          )}

          {/* Résultats */}
          {report && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    <BarChart3 className="text-orange-500" size={20} />
                    Résultats — {startDate} au {endDate}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {report.vehicleCount} véhicule(s) analysé(s)
                  </p>
                </div>
                <button
                  onClick={exportCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  <Download size={15} />
                  Exporter CSV
                </button>
              </div>

              {/* Cartes résumé */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 border-b border-gray-100">
                {showDist && (
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={14} className="text-blue-500" />
                      <span className="text-xs font-medium text-blue-700">Distance totale</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-800">{formatNumber(totals.distanceKm, 0)} <span className="text-sm font-normal">km</span></p>
                  </div>
                )}
                {showFuel && capVal > 0 && (
                  <div className="bg-orange-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Fuel size={14} className="text-orange-500" />
                      <span className="text-xs font-medium text-orange-700">Carburant total</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-800">
                      {totals.liters !== null ? formatNumber(totals.liters, 0) : '—'} <span className="text-sm font-normal">L</span>
                    </p>
                  </div>
                )}
                {showHours && (
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock size={14} className="text-green-500" />
                      <span className="text-xs font-medium text-green-700">Heures moteur</span>
                    </div>
                    <p className="text-2xl font-bold text-green-800">{formatNumber(totals.engineHours, 0)} <span className="text-sm font-normal">h</span></p>
                  </div>
                )}
                {showFuel && priceVal > 0 && capVal > 0 && totals.cost !== null && (
                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign size={14} className="text-purple-500" />
                      <span className="text-xs font-medium text-purple-700">Coût estimé</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-800">{formatNumber(totals.cost, 2)} <span className="text-sm font-normal">€</span></p>
                  </div>
                )}
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                {sortedData.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Truck size={40} className="mx-auto mb-3 opacity-30" />
                    <p>Aucune donnée disponible pour cette période</p>
                    <p className="text-sm mt-1">Vérifiez que vos véhicules remontent des données OBD</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <SortHeader label="Véhicule" col="name" />
                        {showFuel && <>
                          <SortHeader label="Carburant début" col="fuelStart" />
                          <SortHeader label="Carburant fin" col="fuelEnd" />
                          <SortHeader label="Consommation %" col="fuelDelta" />
                          {capVal > 0 && <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Litres</th>}
                          {capVal > 0 && priceVal > 0 && <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Coût (€)</th>}
                        </>}
                        {showDist && <SortHeader label="Distance (km)" col="distanceKm" />}
                        {showHours && <SortHeader label="Heures moteur" col="engineHours" />}
                        {showDist && showFuel && capVal > 0 && <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">L/100km</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {sortedData.map((v, i) => {
                        const liters = v.fuelDelta !== null && capVal > 0 ? (v.fuelDelta / 100) * capVal : null
                        const cost = liters !== null ? liters * priceVal : null
                        const l100 = liters !== null && v.distanceKm > 0 ? (liters / v.distanceKm) * 100 : null
                        return (
                          <tr key={v.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                            <td className="px-4 py-3 font-medium text-slate-800">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                                  <Truck size={13} className="text-orange-500" />
                                </div>
                                {v.name}
                              </div>
                            </td>
                            {showFuel && <>
                              <td className="px-4 py-3 text-slate-600">{v.fuelStart !== null ? `${formatNumber(v.fuelStart, 1)}%` : '—'}</td>
                              <td className="px-4 py-3 text-slate-600">{v.fuelEnd !== null ? `${formatNumber(v.fuelEnd, 1)}%` : '—'}</td>
                              <td className="px-4 py-3">
                                {v.fuelDelta !== null ? (
                                  <span className={`font-medium ${v.fuelDelta > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {v.fuelDelta > 0 ? '-' : '+'}{formatNumber(Math.abs(v.fuelDelta), 1)}%
                                  </span>
                                ) : '—'}
                              </td>
                              {capVal > 0 && <td className="px-4 py-3 text-slate-700 font-medium">{liters !== null ? `${formatNumber(liters, 1)} L` : '—'}</td>}
                              {capVal > 0 && priceVal > 0 && <td className="px-4 py-3 text-purple-700 font-medium">{cost !== null ? `${formatNumber(cost, 2)} €` : '—'}</td>}
                            </>}
                            {showDist && <td className="px-4 py-3 text-blue-700 font-medium">{v.distanceKm !== null ? `${formatNumber(v.distanceKm, 1)} km` : '—'}</td>}
                            {showHours && <td className="px-4 py-3 text-green-700">{v.engineHours !== null ? `${formatNumber(v.engineHours, 1)} h` : '—'}</td>}
                            {showDist && showFuel && capVal > 0 && <td className="px-4 py-3 text-slate-600">{l100 !== null ? `${formatNumber(l100, 1)} L/100` : '—'}</td>}
                          </tr>
                        )
                      })}
                    </tbody>
                    {/* Ligne totaux */}
                    <tfoot className="bg-slate-100 border-t-2 border-slate-200">
                      <tr className="font-semibold text-slate-700">
                        <td className="px-4 py-3">TOTAL</td>
                        {showFuel && <>
                          <td className="px-4 py-3">—</td>
                          <td className="px-4 py-3">—</td>
                          <td className="px-4 py-3">—</td>
                          {capVal > 0 && <td className="px-4 py-3">{totals.liters !== null ? `${formatNumber(totals.liters, 1)} L` : '—'}</td>}
                          {capVal > 0 && priceVal > 0 && <td className="px-4 py-3 text-purple-700">{totals.cost !== null ? `${formatNumber(totals.cost, 2)} €` : '—'}</td>}
                        </>}
                        {showDist && <td className="px-4 py-3 text-blue-700">{formatNumber(totals.distanceKm, 1)} km</td>}
                        {showHours && <td className="px-4 py-3 text-green-700">{formatNumber(totals.engineHours, 1)} h</td>}
                        {showDist && showFuel && capVal > 0 && <td className="px-4 py-3">—</td>}
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {configStatus === 'unconfigured' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <Truck size={48} className="mx-auto mb-4 text-amber-400" />
          <h3 className="text-lg font-semibold text-amber-800 mb-2">Connexion Samsara requise</h3>
          <p className="text-amber-700 text-sm max-w-md mx-auto">
            Renseignez votre token API Samsara dans la section configuration ci-dessus pour commencer à générer des rapports de consommation.
          </p>
          <p className="text-amber-600 text-xs mt-3">
            Token disponible dans votre compte Samsara → Paramètres → Accès API
          </p>
        </div>
      )}
    </div>
  )
}
