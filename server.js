// Mini serveur local : sert index.html + proxy vers l'API Samsara.
// Aucune dépendance externe — Node.js >= 18 uniquement.
// Lancer : node server.js   puis ouvrir http://localhost:3000

import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = 3000

const server = http.createServer(async (req, res) => {
  // Proxy Samsara : /samsara-proxy/<region>/<path...>
  if (req.url.startsWith('/samsara-proxy/')) {
    try {
      const rest = req.url.replace('/samsara-proxy/', '')
      const firstSlash = rest.indexOf('/')
      const region = rest.slice(0, firstSlash).toLowerCase()
      const samsaraPath = rest.slice(firstSlash) // garde la query string intacte
      const base = region === 'eu' ? 'https://api.eu.samsara.com' : 'https://api.samsara.com'
      const targetUrl = base + samsaraPath
      const auth = req.headers['authorization'] || ''
      const authPreview = auth ? auth.slice(0, 14) + '...' + auth.slice(-6) : '(vide)'

      console.log(`\n>>> ${req.method} ${req.url}`)
      console.log(`    -> ${targetUrl}`)
      console.log(`    Authorization: ${authPreview}`)

      const r = await fetch(targetUrl, {
        method: req.method,
        headers: { 'Authorization': auth, 'Content-Type': 'application/json' }
      })
      const body = await r.text()
      console.log(`    <- ${r.status} ${r.statusText} (${body.length} octets)`)
      if (!r.ok) console.log(`    Réponse : ${body.slice(0, 300)}`)

      res.writeHead(r.status, {
        'Content-Type': r.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*'
      })
      res.end(body)
      return
    } catch (err) {
      console.error('Proxy error:', err)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Proxy error', details: err.message }))
      return
    }
  }

  // Sert index.html à la racine
  let filePath = req.url === '/' ? '/index.html' : req.url.split('?')[0]
  filePath = path.join(__dirname, filePath)
  if (!filePath.startsWith(__dirname)) { res.writeHead(403); res.end('Forbidden'); return }

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return }
    const ext = path.extname(filePath).toLowerCase()
    const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json' }
    res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' })
    res.end(data)
  })
})

server.listen(PORT, () => {
  console.log('\n  ╔══════════════════════════════════════╗')
  console.log('  ║   Samsara Reports — serveur local    ║')
  console.log('  ╠══════════════════════════════════════╣')
  console.log(`  ║   Ouvrez : http://localhost:${PORT}     ║`)
  console.log('  ╚══════════════════════════════════════╝\n')
})
