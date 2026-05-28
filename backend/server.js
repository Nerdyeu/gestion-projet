import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4001
const prisma = new PrismaClient()

const REGION_BASES = {
  US: 'https://api.samsara.com',
  EU: 'https://api.eu.samsara.com'
}

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' })
})

async function getSamsaraConfig() {
  const config = await prisma.samsaraConfig.findFirst()
  if (!config) return null
  return { token: config.apiToken, region: config.region || 'US' }
}

async function samsaraFetch(path, config, params = {}) {
  const base = REGION_BASES[config.region] || REGION_BASES.US
  const url = new URL(`${base}${path}`)
  Object.entries(params).forEach(([k, v]) => v && url.searchParams.set(k, v))
  console.log(`[Samsara] ${url.toString()}`)
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${config.token}`, 'Content-Type': 'application/json' }
  })
  const text = await res.text()
  let body
  try { body = JSON.parse(text) } catch { body = text }
  if (!res.ok) {
    console.error(`[Samsara] ${res.status} ${url.toString()} → ${text.slice(0, 300)}`)
    throw { status: res.status, message: typeof body === 'string' ? body : (body.message || JSON.stringify(body)) }
  }
  return body
}

app.get('/api/samsara/config', async (req, res) => {
  try {
    const config = await prisma.samsaraConfig.findFirst()
    if (!config) return res.json({ configured: false, region: 'US' })
    const token = config.apiToken
    const masked = token.length > 8 ? token.slice(0, 4) + '****' + token.slice(-4) : '****'
    res.json({ configured: true, maskedToken: masked, region: config.region || 'US' })
  } catch {
    res.status(500).json({ error: 'Erreur configuration' })
  }
})

app.post('/api/samsara/config', async (req, res) => {
  try {
    const { apiToken, region } = req.body
    if (!apiToken) return res.status(400).json({ error: 'Token API requis' })
    const r = region === 'EU' ? 'EU' : 'US'
    await prisma.samsaraConfig.upsert({
      where: { id: 1 },
      update: { apiToken, region: r },
      create: { id: 1, apiToken, region: r }
    })
    res.json({ configured: true, region: r })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur sauvegarde' })
  }
})

app.get('/api/samsara/test', async (req, res) => {
  try {
    const config = await getSamsaraConfig()
    if (!config) return res.status(400).json({ error: 'Non configuré' })
    const data = await samsaraFetch('/fleet/vehicles', config, { limit: '1' })
    res.json({
      success: true,
      region: config.region,
      vehiclesInResponse: data?.data?.length ?? 0,
      hasNextPage: !!data?.pagination?.hasNextPage
    })
  } catch (err) {
    res.status(err.status || 500).json({ error: 'Connexion échouée', details: err.message })
  }
})

// Endpoint de debug : voir la réponse brute Samsara
app.get('/api/samsara/debug/vehicles', async (req, res) => {
  try {
    const config = await getSamsaraConfig()
    if (!config) return res.status(400).json({ error: 'Non configuré' })
    const data = await samsaraFetch('/fleet/vehicles', config, { limit: '10' })
    res.json({
      region: config.region,
      baseUrl: REGION_BASES[config.region],
      rawResponse: data,
      vehicleCount: data?.data?.length ?? 0
    })
  } catch (err) {
    res.status(err.status || 500).json({ error: 'Erreur debug', details: err.message, status: err.status })
  }
})

app.get('/api/samsara/vehicles', async (req, res) => {
  try {
    const config = await getSamsaraConfig()
    if (!config) return res.status(400).json({ error: 'Non configuré' })
    let vehicles = []
    let cursor = null
    let pages = 0
    do {
      const params = { limit: '512' }
      if (cursor) params.after = cursor
      const data = await samsaraFetch('/fleet/vehicles', config, params)
      vehicles = vehicles.concat(data.data || [])
      cursor = data.pagination?.hasNextPage ? data.pagination.endCursor : null
      pages++
      if (pages > 50) break
    } while (cursor)
    console.log(`[Samsara] ${vehicles.length} véhicules récupérés (${pages} page(s))`)
    res.json({ data: vehicles })
  } catch (err) {
    res.status(err.status || 500).json({ error: 'Erreur véhicules', details: err.message })
  }
})

app.get('/api/samsara/fuel-report', async (req, res) => {
  try {
    const { startDate, endDate, vehicleIds, metrics } = req.query
    if (!startDate || !endDate) return res.status(400).json({ error: 'Dates requises' })

    const config = await getSamsaraConfig()
    if (!config) return res.status(400).json({ error: 'Non configuré' })

    const types = (metrics || 'fuelPercents,obdOdometerMeters,obdEngineSeconds')
    const startTime = new Date(startDate).toISOString()
    const endTime = new Date(endDate + 'T23:59:59').toISOString()

    let allData = []
    let cursor = null
    let pages = 0
    do {
      const params = { startTime, endTime, types, limit: '512' }
      if (vehicleIds) params.vehicleIds = vehicleIds
      if (cursor) params.after = cursor
      const data = await samsaraFetch('/fleet/vehicles/stats/history', config, params)
      allData = allData.concat(data.data || [])
      cursor = data.pagination?.hasNextPage ? data.pagination.endCursor : null
      pages++
      if (pages > 50) break
    } while (cursor)

    const report = allData.map(vehicle => {
      const result = { id: vehicle.id, name: vehicle.name || vehicle.id }

      if (vehicle.fuelPercents?.length >= 2) {
        const sorted = [...vehicle.fuelPercents].sort((a, b) => new Date(a.time) - new Date(b.time))
        result.fuelStart = sorted[0].value?.percentage ?? null
        result.fuelEnd = sorted[sorted.length - 1].value?.percentage ?? null
        result.fuelDelta = result.fuelStart !== null && result.fuelEnd !== null
          ? parseFloat((result.fuelStart - result.fuelEnd).toFixed(2))
          : null
        result.fuelReadings = vehicle.fuelPercents.length
      }

      if (vehicle.obdOdometerMeters?.length >= 2) {
        const sorted = [...vehicle.obdOdometerMeters].sort((a, b) => new Date(a.time) - new Date(b.time))
        const odomStart = sorted[0].value?.meters ?? null
        const odomEnd = sorted[sorted.length - 1].value?.meters ?? null
        result.distanceKm = odomStart !== null && odomEnd !== null
          ? parseFloat(((odomEnd - odomStart) / 1000).toFixed(2))
          : null
      }

      if (vehicle.obdEngineSeconds?.length >= 2) {
        const sorted = [...vehicle.obdEngineSeconds].sort((a, b) => new Date(a.time) - new Date(b.time))
        const secStart = sorted[0].value?.engineSeconds ?? null
        const secEnd = sorted[sorted.length - 1].value?.engineSeconds ?? null
        result.engineHours = secStart !== null && secEnd !== null
          ? parseFloat(((secEnd - secStart) / 3600).toFixed(2))
          : null
      }

      return result
    })

    res.json({ data: report, startDate, endDate, vehicleCount: report.length })
  } catch (err) {
    console.error('fuel-report error:', err)
    res.status(err.status || 500).json({ error: 'Erreur rapport', details: err.message })
  }
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`)
})

process.on('beforeExit', async () => { await prisma.$disconnect() })
