import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'sprite-debug-log',
      configureServer(server) {
        server.middlewares.use('/debug-log', (req, res) => {
          if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }
          const chunks: Buffer[] = []
          req.on('data', (c: Buffer) => chunks.push(c))
          req.on('end', () => {
            try {
              const body = JSON.parse(Buffer.concat(chunks).toString())
              const dir = resolve(__dirname, 'debug-sprites')
              mkdirSync(dir, { recursive: true })
              const prefix = `${body.timestamp}_${body.name}`
              if (body.imageBase64) {
                const raw = body.imageBase64.startsWith('data:')
                  ? body.imageBase64.split(',')[1]
                  : body.imageBase64
                writeFileSync(resolve(dir, `${prefix}.png`), Buffer.from(raw, 'base64'))
              }
              writeFileSync(
                resolve(dir, `${prefix}.json`),
                JSON.stringify(body.rawResponse, null, 2),
              )
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ ok: true }))
            } catch (e) {
              console.error('[debug-log] Error:', e)
              res.statusCode = 500
              res.end()
            }
          })
        })
      },
    },
  ],
  base: './',
})
