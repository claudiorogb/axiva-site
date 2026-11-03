import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const pages = ['crm/index.html', 'crm/o-que-e-crm/index.html', 'crm/funil-de-vendas/index.html', 'crm/follow-up-comercial/index.html', 'crm/prospeccao-b2b/index.html', 'crm/como-organizar-leads/index.html', 'crm/sobre/index.html']
const css = readFileSync('styles.css', 'utf8')

test('site do CRM: botão "Acessar CRM" no cabeçalho do celular leva ao login', () => {
  for (const f of pages) {
    const html = readFileSync(f, 'utf8')
    assert.equal((html.match(/<a class="btn btn-primary nav-login-mobile" href="https:\/\/crm\.axiva\.com\.br\/">Acessar CRM<\/a>/g) || []).length, 1, f)
    // o botão do computador continua
    assert.match(html, /Acessar AXIVA CRM<\/a>/, f)
  }
  const precos = readFileSync('crm/precos/index.html', 'utf8')
  assert.match(precos, /<a class="login-mobile" href="https:\/\/crm\.axiva\.com\.br\/">Acessar CRM<\/a>/)
})

test('botão só aparece em telas pequenas', () => {
  assert.match(css, /\.nav-login-mobile\{display:none\}/)
  assert.match(css, /@media\(max-width:900px\)\{\n\s+\.nav-inner \.nav-login-mobile\{display:inline-flex/)
})
