// Área do assinante: "Minha assinatura" (ver plano e cancelar).
// Regras: desistência em até 7 dias após o pagamento = reembolso integral e fim do acesso;
// depois disso, no Mensal encerra as próximas cobranças (acesso até o fim do mês pago);
// no Anual as 12 parcelas continuam e a renovação é encerrada ao fim da fidelidade.
// Após o fim do acesso de uma assinatura cancelada, a conta fica guardada por 30 dias e depois é apagada.
const API='https://zbtijblvkzkeposvkfob.supabase.co/functions/v1/invest-subscription'
const KEY='sb_publishable_1hWexWrd_y-m36-DaXF5Hw_p33Ginm_'
const $=id=>document.getElementById(id)
const fmtDate=v=>{if(!v)return '';const m=String(v).match(/^(\d{4})-(\d{2})-(\d{2})/);if(m&&String(v).length<=10)return `${m[3]}/${m[2]}/${m[1]}`;const d=new Date(v);return isNaN(d)?'':d.toLocaleDateString('pt-BR',{timeZone:'America/Sao_Paulo'})}
const money=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c])

function renewUrl(s){
  const email=window.axivaUserEmail||document.getElementById('userEmail')?.textContent||''
  return `/invest/assinar?plano=${s?.plan==='annual'?'anual':'mensal'}&email=${encodeURIComponent(email.trim())}`
}

async function call(action){
  const supabase=window.axivaSupabase
  const {data:{session}}=await supabase.auth.getSession()
  if(!session)throw new Error('Sua sessão expirou. Entre novamente.')
  const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json',apikey:KEY,Authorization:`Bearer ${session.access_token}`},body:JSON.stringify({action})})
  const d=await r.json().catch(()=>({}))
  if(!r.ok||d.error)throw new Error(d.error||'Não foi possível consultar sua assinatura agora.')
  return d
}

function render(s){
  const box=$('subscriptionContent')
  $('subscriptionStatus').textContent=''
  if(!s){
    box.innerHTML='<p>Não encontramos uma assinatura contratada pelo site para este e-mail. Se o seu acesso foi liberado pela equipe AXIVA, fale com a gente para alterações.</p>'
    return
  }
  const plan=s.plan==='annual'?'Plano Anual (12x de R$ 11,88)':'Plano Mensal (R$ 12,98 por mês)'
  const statusText={
    active:'Ativa',
    cancel_scheduled:`Cancelamento agendado: a renovação será encerrada em ${fmtDate(s.cancelEffectiveOn)}.`,
    cancelled:`Cancelada. Você tem acesso até ${fmtDate(s.accessUntil)}.`,
    refunded:'Cancelada com reembolso integral.',
    refund_pending:'Cancelada. O reembolso integral está sendo processado.'
  }[s.status]||s.status
  let rows=`<p><strong>${esc(plan)}</strong></p>
    <p>Forma de pagamento: cartão de crédito</p>
    <p>Situação: ${esc(statusText)}</p>
    ${s.firstPaidAt?`<p>Assinado em: ${fmtDate(s.firstPaidAt)}</p>`:''}
    ${s.status==='active'&&s.accessUntil?`<p>Período pago até: ${fmtDate(s.accessUntil)}</p>`:''}
    ${s.plan==='annual'&&s.fidelityUntil?`<p>Fidelidade até: ${fmtDate(s.fidelityUntil)}</p>`:''}`
  if(['cancelled','refunded','refund_pending'].includes(s.status)){
    if(s.purgeOn)rows+=`<p class="micro-note">Depois do fim do acesso, sua conta e seus dados (lista, alertas e estratégias) ficam guardados por 30 dias, até ${fmtDate(s.purgeOn)}, e então são apagados definitivamente.</p>`
    rows+=`<a class="sub-renew" href="${esc(renewUrl(s))}">Renovar plano</a>`
  }
  if(s.status==='cancel_scheduled'){
    rows+=`<p class="micro-note">Mudou de ideia? Você pode manter sua assinatura e ela seguirá renovando normalmente.</p><button id="subscriptionResumeBtn" class="sub-renew" type="button">Manter minha assinatura</button>`
  }
  if(s.status==='active'){
    const label=s.refundable?'Cancelar e receber reembolso':(s.plan==='annual'&&s.fidelityUntil?'Cancelar renovação':'Cancelar assinatura')
    const note=s.refundable?'Você está dentro do prazo de 7 dias: ao cancelar, devolvemos 100% do valor pago e o acesso é encerrado.':(s.plan==='annual'&&s.fidelityUntil?`Seu plano anual tem fidelidade até ${fmtDate(s.fidelityUntil)}. Ao cancelar, as parcelas até lá continuam e a renovação é encerrada nessa data.`:'Ao cancelar, as próximas cobranças são encerradas e você continua com acesso até o fim do período já pago.')
    rows+=`<p class="micro-note">${esc(note)}</p><button id="subscriptionCancelBtn" class="secondary" type="button">${esc(label)}</button>`
  }
  box.innerHTML=rows
  $('subscriptionCancelBtn')?.addEventListener('click',()=>cancel(s))
  $('subscriptionResumeBtn')?.addEventListener('click',resume)
}

async function load(){
  $('subscriptionStatus').textContent='Carregando sua assinatura...'
  $('subscriptionContent').innerHTML='';$('subscriptionMessage').textContent=''
  try{const d=await call('status');render(d.subscription)}
  catch(e){$('subscriptionStatus').textContent=e.message}
}

async function cancel(s){
  const question=s.refundable
    ?'Tem certeza que deseja cancelar sua assinatura?\n\nComo você está dentro do prazo de 7 dias, o valor pago será devolvido integralmente e o seu acesso será encerrado agora.'
    :(s.plan==='annual'&&s.fidelityUntil
      ?`Tem certeza que deseja cancelar a renovação do seu plano anual?\n\nAs parcelas até ${fmtDate(s.fidelityUntil)} continuam e o acesso segue normalmente até lá.`
      :'Tem certeza que deseja cancelar sua assinatura?\n\nAs próximas cobranças serão encerradas e você continua com acesso até o fim do período já pago.')
  if(!window.confirm(question))return
  const btn=$('subscriptionCancelBtn');if(btn){btn.disabled=true;btn.textContent='Cancelando...'}
  try{
    const d=await call('cancel')
    render(d.subscription)
    $('subscriptionMessage').textContent=d.refunded?'Assinatura cancelada e reembolso solicitado ao cartão. O estorno aparece na fatura conforme o prazo da operadora.'
      :d.refundPending?'Assinatura cancelada. Seu reembolso integral será processado e você será avisado por e-mail.'
      :d.scheduled?'Cancelamento da renovação agendado.'
      :'Assinatura cancelada. Não haverá novas cobranças.'
    if(d.refunded||d.refundPending)setTimeout(async()=>{await window.axivaSupabase.auth.signOut();location.reload()},8000)
  }catch(e){
    $('subscriptionMessage').textContent=e.message
    if(btn){btn.disabled=false;btn.textContent='Tentar novamente'}
  }
}

async function resume(){
  const btn=$('subscriptionResumeBtn');if(btn){btn.disabled=true;btn.textContent='Salvando...'}
  try{const d=await call('resume');render(d.subscription);$('subscriptionMessage').textContent='Pronto! Sua assinatura continua ativa.';showTopBanner(d.subscription)}
  catch(e){$('subscriptionMessage').textContent=e.message;if(btn){btn.disabled=false;btn.textContent='Manter minha assinatura'}}
}

// Aviso no topo da área logada para quem cancelou e ainda está no período pago.
function showTopBanner(s){
  let el=$('subscriptionTopBanner')
  const show=s&&['cancelled','refunded','refund_pending'].includes(s.status)&&s.accessUntil&&new Date(s.accessUntil).getTime()>Date.now()
  if(!show){el?.remove();return}
  if(!el){
    el=document.createElement('div');el.id='subscriptionTopBanner';el.className='sub-banner'
    const main=document.querySelector('#appView .main');const first=main?.querySelector('.page')
    if(!main)return
    main.insertBefore(el,first||null)
  }
  el.innerHTML=`<span>Sua assinatura foi cancelada. Você tem acesso até ${esc(fmtDate(s.accessUntil))}.</span><a href="${esc(renewUrl(s))}">Renovar plano</a>`
}

document.querySelector('.nav-item[data-page="subscription"]')?.addEventListener('click',()=>{setTimeout(load,0)})

// Ao entrar na área logada, verifica a situação da assinatura uma vez para exibir o aviso.
let checked=false
const watcher=setInterval(async()=>{
  const app=document.getElementById('appView')
  if(checked||!app||app.classList.contains('hidden'))return
  checked=true;clearInterval(watcher)
  try{const d=await call('status');showTopBanner(d.subscription)}catch{}
},1000)
setTimeout(()=>clearInterval(watcher),60000)
