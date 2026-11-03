import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

const manifest = JSON.parse(readFileSync('invest/manifest.webmanifest', 'utf8'))
const swFull = readFileSync('invest/sw.js', 'utf8')
const sw = swFull.replace(/\/\*[\s\S]*?\*\//g, '')
const install = readFileSync('invest/pwa/pwa-install.js', 'utf8')
const html = readFileSync('invest/private.html', 'utf8')
const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'))

test('manifesto do Invest: nome, escopo restrito a /invest/ e cores da marca', () => {
  assert.equal(manifest.name, 'AXIVA Invest')
  assert.equal(manifest.start_url, '/invest/private')
  assert.equal(manifest.scope, '/invest/')
  assert.equal(manifest.display, 'standalone')
  assert.equal(manifest.theme_color, '#0B192C')
  for (const icon of manifest.icons) assert.ok(existsSync(icon.src.slice(1)), icon.src)
})

test('service worker só usa tela offline e nunca guarda dados da conta', () => {
  assert.match(sw, /request\.mode !== 'navigate'/)
  assert.match(sw, /origin !== self\.location\.origin/)
  assert.doesNotMatch(sw, /cache\.put|\.put\(/)
  assert.doesNotMatch(sw, /supabase|Authorization|apikey|localStorage|indexedDB|postMessage|push|sync/i)
  // URL limpa: com cleanUrls, /invest/offline.html redireciona e não serve em navegação
  assert.match(sw, /const OFFLINE_URL = '\/invest\/offline'/)
  assert.equal((sw.match(/addAll/g) || []).length, 1)
})

test('aviso de instalação não usa HTML dinâmico', () => {
  assert.doesNotMatch(install, /innerHTML|outerHTML|insertAdjacentHTML|eval\(|new Function|document\.write/)
})

test('private.html liga o PWA sem remover o que já existia', () => {
  assert.match(html, /<link rel="manifest" href="\/invest\/manifest\.webmanifest">/)
  assert.match(html, /data-sw="\/invest\/sw\.js" data-scope="\/invest\/"/)
  assert.match(html, /\/invest\/private\.js\?v=29/)
  assert.match(html, /axiva-analytics\.js\?v=2" data-mode="login"/)
})

test('vercel.json: SW sem cache longo e regras anteriores preservadas', () => {
  const sources = vercel.headers.map((h) => h.source)
  assert.ok(sources.includes('/invest/sw.js') && sources.includes('/invest/manifest.webmanifest') && sources.includes('/crm-funil-real.svg'))
  assert.equal(vercel.cleanUrls, true)
  assert.ok(vercel.rewrites.some((r) => r.source === '/invest'))
})
