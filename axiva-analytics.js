/*
 * AXIVA — Aviso de cookies (LGPD) + Google Analytics 4 (G-8VW4GCQGYD).
 *
 * O Google Analytics só é carregado depois que o visitante clica em "Aceitar".
 * A escolha fica salva no navegador (localStorage), então o aviso não aparece de novo.
 *
 * Incluído apenas nas páginas públicas. Na página /invest/private (login + área do assinante),
 * use data-mode="login": mede só a tela de login e para de medir assim que a área privada abre.
 */
(function () {
  'use strict';
  var GA_ID = 'G-8VW4GCQGYD';
  var KEY = 'axiva_cookie_consent_v1';
  var script = document.currentScript;
  var loginMode = !!(script && script.getAttribute('data-mode') === 'login');

  function getChoice() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setChoice(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  // Endereço enviado ao Analytics sem dados sensíveis (e-mail, tokens, pedido etc.):
  // mantém só parâmetros de campanha e o plano escolhido.
  function cleanLocation() {
    var keep = /^(utm_[a-z_]+|gclid|gbraid|wbraid|fbclid|plano)$/;
    var out = new URLSearchParams();
    new URLSearchParams(location.search).forEach(function (v, k) { if (keep.test(k)) out.append(k, v); });
    var q = out.toString();
    return location.origin + location.pathname + (q ? '?' + q : '');
  }

  // Modo login: a área privada está aberta (ou recuperação de senha / assinatura encerrada)?
  function privateAreaOpen() {
    var ids = ['appView', 'resetView', 'endedView'];
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (el && !el.classList.contains('hidden')) return true;
    }
    return false;
  }

  function disableGa() { window['ga-disable-' + GA_ID] = true; }

  function loadGa() {
    if (window.__axivaGaLoaded) return;
    window.__axivaGaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { page_location: cleanLocation() });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  function startLoginMode() {
    var p = new URLSearchParams(location.search), h = new URLSearchParams(location.hash.slice(1));
    // Links de e-mail (definir/recuperar senha) nunca são medidos.
    if (p.get('type') === 'recovery' || h.get('type') === 'recovery' || p.get('token_hash') || h.get('access_token')) return;
    // Para de medir assim que qualquer tela da área privada aparecer.
    var watch = function () { if (privateAreaOpen()) disableGa(); };
    var obs = new MutationObserver(watch);
    ['appView', 'resetView', 'endedView'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) obs.observe(el, { attributes: true, attributeFilter: ['class'] });
    });
    // Espera a verificação de sessão: quem já está logado vai direto para a área privada e não é medido.
    setTimeout(function () {
      if (!privateAreaOpen()) loadGa();
    }, 2500);
  }

  function start() {
    if (loginMode) startLoginMode(); else loadGa();
  }

  function showBanner() {
    var css = document.createElement('style');
    css.textContent =
      '#axiva-cookie{position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;max-width:560px;margin:0 auto;' +
      'background:#111827;color:#f9fafb;border-radius:12px;padding:16px 18px;box-shadow:0 10px 30px rgba(0,0,0,.25);' +
      'font:14px/1.5 Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;display:flex;flex-wrap:wrap;gap:12px;align-items:center}' +
      '#axiva-cookie p{margin:0;flex:1 1 260px}' +
      '#axiva-cookie a{color:#93c5fd;text-decoration:underline}' +
      '#axiva-cookie .axc-btns{display:flex;gap:8px;flex:0 0 auto}' +
      '#axiva-cookie button{font:inherit;font-weight:600;border-radius:8px;padding:8px 16px;cursor:pointer;border:1px solid #4b5563}' +
      '#axiva-cookie .axc-no{background:transparent;color:#f9fafb}' +
      '#axiva-cookie .axc-yes{background:#f9fafb;color:#111827;border-color:#f9fafb}';
    document.head.appendChild(css);

    var box = document.createElement('div');
    box.id = 'axiva-cookie';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-live', 'polite');
    box.setAttribute('aria-label', 'Aviso de cookies');
    box.innerHTML =
      '<p>Usamos cookies do Google Analytics para entender como o site é usado e melhorá-lo. ' +
      'Você pode aceitar ou recusar. <a href="' + (location.pathname.indexOf('/invest') === 0 ? '/invest/privacidade' : '/privacidade') + '">Política de Privacidade</a></p>' +
      '<div class="axc-btns"><button type="button" class="axc-no">Recusar</button>' +
      '<button type="button" class="axc-yes">Aceitar</button></div>';
    document.body.appendChild(box);

    box.querySelector('.axc-yes').addEventListener('click', function () {
      setChoice('accepted'); box.remove(); start();
    });
    box.querySelector('.axc-no').addEventListener('click', function () {
      setChoice('rejected'); box.remove();
    });
    // Modo login: o aviso não aparece dentro da área privada.
    if (loginMode) {
      var hideIfPrivate = function () { if (privateAreaOpen() && box.parentNode) box.remove(); };
      var obs = new MutationObserver(hideIfPrivate);
      ['appView', 'resetView', 'endedView'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) obs.observe(el, { attributes: true, attributeFilter: ['class'] });
      });
      hideIfPrivate();
    }
  }

  function init() {
    var choice = getChoice();
    if (choice === 'accepted') start();
    else if (choice !== 'rejected') showBanner();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
