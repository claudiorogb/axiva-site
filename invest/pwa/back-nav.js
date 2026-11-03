/*
  AXIVA Invest — botão Voltar do celular volta à tela anterior em vez de sair do app.
  Cada tela do menu (.nav-item[data-page]) vira uma entrada no histórico do navegador;
  o Voltar do sistema reaplica a tela anterior. Voltar para a tela de origem desfaz o passo
  (sem acumular entradas). Só guarda o nome da tela no histórico; nenhum dado da conta.
*/
(function () {
  'use strict'

  var applying = false
  var initialized = false
  var current = null

  function activePage() {
    var el = document.querySelector('.nav-item.active[data-page]')
    return el ? el.getAttribute('data-page') : null
  }

  function commit() {
    var page = activePage()
    if (!page) return
    if (!initialized) {
      initialized = true
      current = page
      window.history.replaceState({ axivaInvestPage: page, prev: null }, '')
      return
    }
    if (page === current) return
    var previous = current
    current = page
    var state = window.history.state || {}
    if (state.prev === page) {
      // voltou para a tela de onde veio: desfaz o passo em vez de empilhar de novo
      window.history.back()
      return
    }
    window.history.pushState({ axivaInvestPage: page, prev: previous }, '')
  }

  // Qualquer troca de tela (clique no menu, links internos) passa por um .nav-item
  document.addEventListener('click', function (event) {
    if (applying) return
    var target = event.target && event.target.closest ? event.target.closest('.nav-item[data-page]') : null
    if (!target) return
    setTimeout(commit, 0) // depois de a página aplicar a troca
  })

  window.addEventListener('popstate', function (event) {
    var state = event.state
    if (!state || !state.axivaInvestPage) return
    var page = state.axivaInvestPage
    if (page === current) return
    var button = document.querySelector('.nav-item[data-page="' + page + '"]')
    if (!button) return
    applying = true
    try { button.click() } finally { applying = false }
    setTimeout(function () { current = activePage() || current }, 0)
  })

  function init() { commit() }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
  else init()
})()
