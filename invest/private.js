import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.116.0/+esm'

const SUPABASE_URL='https://zbtijblvkzkeposvkfob.supabase.co'
const SUPABASE_KEY='sb_publishable_1hWexWrd_y-m36-DaXF5Hw_p33Ginm_'
const PRIVATE_API=`${SUPABASE_URL}/functions/v1/invest-private-data`
const FIRST_ACCESS_API=`${SUPABASE_URL}/functions/v1/invest-first-access-check`
const MACRO_API=`${SUPABASE_URL}/functions/v1/invest-macro-market`
// Guardar o tipo do link antes de o cliente Auth limpar o fragmento da URL.
let recoveryMode=new URLSearchParams(location.hash.slice(1)).get('type')==='recovery' || new URLSearchParams(location.search).get('type')==='recovery'
const supabase=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})
window.axivaSupabase=supabase

// Limite de 5 tentativas controlado no servidor (invest-login). Ao atingir o limite, é preciso redefinir a senha.
const INVEST_LOGIN_API=`${SUPABASE_URL}/functions/v1/invest-login`
try{localStorage.removeItem('axiva_invest_login_guard_v1')}catch{}
async function investLogin(email,password){
  try{
    const r=await fetch(INVEST_LOGIN_API,{method:'POST',headers:{'Content-Type':'application/json',apikey:SUPABASE_KEY},body:JSON.stringify({action:'login',email,password})})
    const data=await r.json().catch(()=>({}))
    if(data?.ok&&data.session?.access_token){
      const {error}=await supabase.auth.setSession(data.session)
      if(error)return {error:'Não foi possível entrar agora. Tente novamente em instantes.'}
      return {ok:true}
    }
    return {error:data?.error||'Não foi possível entrar agora. Tente novamente em instantes.'}
  }catch{return {error:'Não foi possível entrar agora. Tente novamente em instantes.'}}
}
async function resetInvestLoginAttempts(accessToken){
  try{await fetch(INVEST_LOGIN_API,{method:'POST',headers:{'Content-Type':'application/json',apikey:SUPABASE_KEY,Authorization:`Bearer ${accessToken}`},body:JSON.stringify({action:'reset'})})}catch{}
}

const $=id=>document.getElementById(id)
const loginView=$('loginView'),appView=$('appView'),loginForm=$('loginForm'),loginMessage=$('loginMessage')
const emailInput=$('email'),passwordInput=$('password'),userEmail=$('userEmail'),accessChip=$('accessChip')
const selectionStatus=$('selectionStatus'),selectionWrap=$('selectionTableWrap')
let currentRole='subscriber'
let accessValidated=false
let analysisRows=[]
let strategiesLoaded=false

const money=v=>v==null?'—':Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
const num=v=>v==null?'—':Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})
const pct=v=>v==null?'—':(Number(v)*100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'%'
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))
const n=v=>{if(v===null||v===undefined||v==='')return null;const x=Number(v);return Number.isFinite(x)?x:null}

function showLogin(msg=''){accessValidated=false;$('endedView')?.classList.add('hidden');loginView.classList.remove('hidden');appView.classList.add('hidden');$('resetView').classList.add('hidden');loginMessage.textContent=msg}
function showApp(){if(recoveryMode){showResetView();return}if(!accessValidated){showLogin('Faça login para acessar a área exclusiva.');return}loginView.classList.add('hidden');$('resetView').classList.add('hidden');$('endedView')?.classList.add('hidden');appView.classList.remove('hidden')}
function showResetView(){loginView.classList.add('hidden');appView.classList.add('hidden');$('resetView').classList.remove('hidden')}
// O link de recuperação cria uma sessão temporária; não significa que a senha já foi alterada.
supabase.auth.onAuthStateChange((event)=>{
  if(event==='PASSWORD_RECOVERY'){recoveryMode=true;accessValidated=false;showResetView();return}
  if(event==='SIGNED_OUT'){accessValidated=false;showLogin()}
})
$('resetForm').addEventListener('submit',async e=>{
  e.preventDefault()
  const pass=$('newPassword').value,confirmPass=$('confirmPassword').value
  const message=$('resetMessage'),btn=$('resetSubmit')
  if(pass.length<8){message.textContent='Use uma senha com pelo menos 8 caracteres.';return}
  if(pass!==confirmPass){message.textContent='As senhas informadas não são iguais.';return}
  btn.disabled=true;message.textContent='Salvando sua nova senha...'
  try{
    const {data:{session}}=await supabase.auth.getSession()
    if(!session){message.textContent='O link expirou. Solicite uma nova recuperação de senha.';return}
    const {error}=await supabase.auth.updateUser({password:pass})
    if(error){message.textContent='Não foi possível alterar a senha. Confira os requisitos ou solicite um novo link.';return}
    await resetInvestLoginAttempts(session.access_token)
    await supabase.auth.signOut()
    recoveryMode=false
    $('resetForm').reset()
    history.replaceState(null,'',location.pathname)
    showLogin('Senha alterada com sucesso. Entre usando sua nova senha.')
  }catch(e){message.textContent='Não foi possível alterar a senha agora. Tente novamente.'}
  finally{btn.disabled=false}
})

async function callPrivate(section,options={}){
  const {data:{session}}=await supabase.auth.getSession()
  if(!session?.access_token)throw Object.assign(new Error('not_authenticated'),{status:401})
  const params=new URLSearchParams({section})
  Object.entries(options.params||{}).forEach(([k,v])=>{if(v!=null&&v!=='')params.set(k,String(v))})
  const r=await fetch(`${PRIVATE_API}?${params.toString()}`,{
    method:options.method||'GET',
    headers:{Authorization:`Bearer ${session.access_token}`,apikey:SUPABASE_KEY,Accept:'application/json','Content-Type':'application/json'},
    body:options.body?JSON.stringify(options.body):undefined,
    cache:'no-store'
  })
  const j=await r.json().catch(()=>({}))
  if(!r.ok)throw Object.assign(new Error(j.error||`http_${r.status}`),{status:r.status})
  return j
}
window.axivaPrivateApi=callPrivate

async function loadPrivateArea(){
  try{
    const me=await callPrivate('me')
    userEmail.textContent=me.user?.email||''
    const overviewName=$('overviewUserName')
    if(overviewName){
      const metaName=me.user?.user_metadata?.full_name||me.user?.user_metadata?.name||''
      const emailName=(me.user?.email||'').split('@')[0].replace(/[._-]+/g,' ')
      const chosen=String(metaName||emailName||'investidor').trim()
      overviewName.textContent=chosen ? chosen.replace(/\b\w/g,ch=>ch.toUpperCase()) : 'investidor'
    }
    currentRole=me.access?.role||'subscriber'
    const plan=me.access?.plan||'assinante'
    accessChip.textContent=currentRole==='admin'?'Administrador':`Plano ${({annual:'anual',monthly:'mensal',quarterly:'trimestral',semiannual:'semestral'})[plan]||plan}`
    $('adminNav').classList.toggle('hidden',currentRole!=='admin')
    accessValidated=true
    showApp()
    await Promise.all([loadSelection(),loadAnalysisData(),loadOverviewStrategies(),loadOverviewMarket()])
  }catch(e){
    // Assinatura encerrada: a conta continua logada só para ver a situação e renovar o plano.
    if(e.status===403&&await showEndedView())return
    await supabase.auth.signOut()
    showLogin(e.status===403?'Sua conta existe, mas o acesso à área exclusiva não está ativo.':'Não foi possível validar seu acesso. Tente novamente.')
  }
}

const SUBSCRIPTION_API=`${SUPABASE_URL}/functions/v1/invest-subscription`
const brDay=v=>v?new Date(v).toLocaleDateString('pt-BR',{timeZone:'America/Sao_Paulo'}):''
// Tela para quem cancelou (ou teve o acesso encerrado): mostra até quando os dados ficam guardados,
// avisa nos 5 dias antes da exclusão e oferece "Renovar plano".
async function showEndedView(){
  try{
    const {data:{session}}=await supabase.auth.getSession()
    if(!session)return false
    const r=await fetch(SUBSCRIPTION_API,{method:'POST',headers:{'Content-Type':'application/json',apikey:SUPABASE_KEY,Authorization:`Bearer ${session.access_token}`},body:JSON.stringify({action:'status'})})
    const d=await r.json().catch(()=>({}))
    const s=d?.subscription||null
    const email=session.user?.email||''
    const plano=s?.plan==='annual'?'anual':'mensal'
    $('endedRenew').href=`/invest/assinar?plano=${plano}&email=${encodeURIComponent(email)}`
    if(s?.purgeOn){
      $('endedText').textContent=`Sua lista, alertas e estratégias ficam guardados até ${brDay(s.purgeOn)}. Renove seu plano para voltar a acessar normalmente, com tudo como estava.`
      const days=Math.ceil((new Date(s.purgeOn).getTime()-Date.now())/86400000)
      if(days<=5&&days>=0){
        $('endedBanner').textContent=`Atenção: ${days<=1?'falta 1 dia':`faltam ${days} dias`} para sua conta e todos os seus dados serem apagados definitivamente (em ${brDay(s.purgeOn)}). Renove seu plano para mantê-los.`
        $('endedBanner').classList.remove('hidden')
      }
    }else{
      $('endedText').textContent='Seu acesso à área exclusiva não está ativo no momento. Renove seu plano para voltar a acessar.'
    }
    accessValidated=false
    loginView.classList.add('hidden');appView.classList.add('hidden');$('resetView').classList.add('hidden')
    $('endedView').classList.remove('hidden')
    return true
  }catch{return false}
}
$('endedLogout').addEventListener('click',async()=>{$('endedView').classList.add('hidden');await supabase.auth.signOut()})


function renderOverviewHighlights(rows){
  const discountHost=$('overviewDiscounts'),qualityHost=$('overviewQuality')
  if(!discountHost&&!qualityHost)return
  const valid=Array.isArray(rows)?rows:[]
  const name=r=>esc(r.company_name||'')
  const rowHtml=(r,value)=>`<div class="ax-highlight-row"><div><b>${esc(r.ticker||'—')}</b><span>${name(r)}</span></div><strong>${value}</strong></div>`
  if(discountHost){
    const items=valid.filter(r=>n(r.discount_pct)!=null).sort((a,b)=>n(b.discount_pct)-n(a.discount_pct)).slice(0,3)
    discountHost.innerHTML=items.length?items.map(r=>rowHtml(r,pct(r.discount_pct))).join(''):'<div class="ax-home-empty">Nenhum dado disponível.</div>'
  }
  if(qualityHost){
    const items=valid.filter(r=>n(r.quality_score)!=null).sort((a,b)=>n(b.quality_score)-n(a.quality_score)).slice(0,3)
    qualityHost.innerHTML=items.length?items.map(r=>rowHtml(r,`${Math.round(Number(r.quality_score))}/100`)).join(''):'<div class="ax-home-empty">Nenhum dado disponível.</div>'
  }
}

async function loadOverviewStrategies(){
  const host=$('overviewStrategies')
  if(!host)return
  host.innerHTML='<div class="ax-home-loading">Carregando suas estratégias...</div>'
  try{
    const j=await callPrivate('user-strategies')
    const items=Array.isArray(j.data)?j.data:[]
    if(!items.length){host.innerHTML='<div class="ax-home-empty">Você ainda não criou nenhuma estratégia.</div>';return}
    host.innerHTML='<div class="ax-strategy-list">'+items.slice(0,4).map(s=>{
      const count=s.match_count??(Array.isArray(s.matches)?s.matches.length:0)
      return `<div class="ax-strategy-row"><b>${esc(s.name||'Estratégia')}</b><span>${Number(count)||0} empresas</span></div>`
    }).join('')+'</div>'
  }catch(e){
    host.innerHTML='<div class="ax-home-empty">Não foi possível carregar suas estratégias agora.</div>'
  }
}

function formatOverviewMarketValue(item){
  const value=n(item?.value)
  if(value==null)return 'N/D'
  if(item.unit==='BRL')return value.toLocaleString('pt-BR',{style:'currency',currency:'BRL',minimumFractionDigits:3,maximumFractionDigits:3})
  if(item.unit==='PTS')return value.toLocaleString('pt-BR',{maximumFractionDigits:0})+' pts'
  if(item.key==='CDI'&&item.unit==='% a.d.'){
    const annual=(Math.pow(1+value/100,252)-1)*100
    return annual.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'%'
  }
  return value.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})
}
async function loadOverviewMarket(){
  const host=$('overviewMarket')
  if(!host)return
  try{
    const r=await fetch(`${MACRO_API}?_=${Date.now()}`,{cache:'no-store'})
    if(!r.ok)throw new Error(`http_${r.status}`)
    const j=await r.json()
    const rows=Array.isArray(j?.data)?j.data:[]
    const byKey=new Map(rows.map(item=>[String(item.key),item]))
    host.querySelectorAll('[data-market-key]').forEach(card=>{
      const item=byKey.get(card.dataset.marketKey)
      if(!item)return
      const strong=card.querySelector('strong'),small=card.querySelector('small')
      if(strong)strong.textContent=formatOverviewMarketValue(item)
      if(small){
        small.classList.remove('pos','neg')
        if(item.key==='CDI'){small.textContent='';return}
        const change=n(item.change_pct)
        if(change==null){small.textContent='N/D';return}
        small.textContent=(change*100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'%'
        if(change>0)small.classList.add('pos')
        if(change<0)small.classList.add('neg')
      }
    })
  }catch(e){
    host.querySelectorAll('small').forEach(el=>{if(!el.textContent||el.textContent==='—')el.textContent='N/D'})
  }
}

async function loadSelection(){
  selectionStatus.classList.remove('hidden');selectionStatus.textContent='Carregando Seleção de Ações...';selectionWrap.classList.add('hidden')
  try{const j=await callPrivate('selection');renderSelection(Array.isArray(j.data)?j.data:[])}
  catch(e){selectionStatus.textContent=e.status===403?'Sua assinatura não está ativa.':'Não foi possível carregar os dados agora.'}
}
function renderSelection(rows){
  if(!rows.length){selectionStatus.textContent='Nenhuma empresa disponível na seleção atual.';return}
  window.axivaSelectionRows=rows
  renderOverviewHighlights(rows)
  const body=rows.map((r,index)=>{const d=n(r.discount_pct),dcls=d==null?'':d>=0?'pos':'neg';return `<div class="private-row selection-clickable" data-selection-index="${index}" role="button" tabindex="0" aria-label="Ver detalhes de ${esc(r.ticker)}"><div class="ticker"><b>${esc(r.ticker)}</b><span>${esc(r.company_name||'')}</span></div><div>${money(r.current_price)}</div><div>${money(r.target_price)}</div><div class="discount ${dcls}">${pct(r.discount_pct)}</div><div>${money(r.graham_price)}</div><div><span class="quality">${r.quality_score==null?'—':Math.round(Number(r.quality_score))}</span></div></div>`}).join('')
  selectionWrap.innerHTML=`<div class="private-table"><div class="private-row private-head"><div>Empresa</div><div>Cotação</div><div>Preço-alvo</div><div>Desconto</div><div>Graham</div><div>Qualidade</div></div>${body}</div>`
  selectionStatus.classList.add('hidden');selectionWrap.classList.remove('hidden')
}

function slider(id,label,min,max,step,value,suffix=''){
  return `<div class="p-slider"><div><label for="${id}">${label}</label><output id="${id}Out">${formatSlider(value,suffix)}</output></div><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-suffix="${suffix}"></div>`
}
function formatSlider(v,suffix){const x=Number(v);return x.toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})+(suffix||'')}
function setupPrivateSliders(){
  $('privateSliders').innerHTML=slider('pPl','P/L máximo',0,35,.5,15)+slider('pPvp','P/VP máximo',0,13.5,.1,3)+slider('pRoe','ROE mínimo',0,75,.5,10,'%')+slider('pRoic','ROIC mínimo',0,80,.5,10,'%')+slider('pDy','DY mínimo',0,23,.25,0,'%')
  document.querySelectorAll('#privateSliders input[type=range]').forEach(el=>el.addEventListener('input',()=>{$(el.id+'Out').value=formatSlider(el.value,el.dataset.suffix||'')}))
}
async function loadAnalysisData(){
  setupPrivateSliders();$('analysisStatus').classList.remove('hidden');$('analysisStatus').textContent='Carregando base fundamentalista...'
  try{const j=await callPrivate('analysis');analysisRows=Array.isArray(j.data)?j.data:[];window.axivaAnalysisRows=analysisRows;$('analysisStatus').textContent=`${analysisRows.length} empresas disponíveis para análise.`;window.dispatchEvent(new CustomEvent('axiva:analysis-ready',{detail:{rows:analysisRows}}))}
  catch(e){$('analysisStatus').textContent='Não foi possível carregar a base fundamentalista.'}
}
function privateRowMeetsFilters(r,c){
  const pl=n(r.pl),pvp=n(r.pvp),roe=n(r.roe),roic=n(r.roic),dy=n(r.dividend_yield)
  return pl!=null&&pl<=c.plMax&&pvp!=null&&pvp<=c.pvpMax&&roe!=null&&roe>=c.roeMin&&roic!=null&&roic>=c.roicMin&&dy!=null&&dy>=c.dyMin
}
function applyPrivateFilters(){
  const ticker=$('privateTicker').value.trim().toUpperCase()
  const criteria={plMax:n($('pPl').value),pvpMax:n($('pPvp').value),roeMin:n($('pRoe').value)/100,roicMin:n($('pRoic').value)/100,dyMin:n($('pDy').value)/100}
  let rows
  if(ticker){
    const exact=analysisRows.filter(r=>String(r.ticker||'').toUpperCase()===ticker)
    rows=(exact.length?exact:analysisRows.filter(r=>String(r.ticker||'').toUpperCase().includes(ticker)||String(r.company_name||'').toUpperCase().includes(ticker))).slice(0,50)
    if(rows.length&&rows.some(r=>!privateRowMeetsFilters(r,criteria)))alert('essa empresa não atende aos critérios do filtro aplicado')
  }else{
    rows=analysisRows.filter(r=>privateRowMeetsFilters(r,criteria)).slice(0,50)
  }
  renderAnalysis(rows)
}
function renderAnalysis(rows){
  const wrap=$('analysisResults')
  if(!rows.length){$('analysisStatus').textContent='Nenhuma empresa encontrada com esses critérios.';wrap.classList.add('hidden');return}
  const body=rows.map(r=>`<div class="analysis-row"><div class="ticker"><b>${esc(r.ticker)}</b><span>${esc(r.company_name||'')}</span></div><div>${money(r.current_price)}</div><div>${money(r.target_price)}</div><div class="discount ${n(r.discount_pct)>=0?'pos':'neg'}">${pct(r.discount_pct)}</div><div>${money(r.graham_price)}</div><div>${num(r.pl)}</div><div>${num(r.pvp)}</div><div>${pct(r.roe)}</div><div>${pct(r.roic)}</div><div>${pct(r.dividend_yield)}</div></div>`).join('')
  wrap.innerHTML=`<div class="analysis-table"><div class="analysis-row private-head"><div>Empresa</div><div>Cotação</div><div>Preço-alvo</div><div>Desconto</div><div>Graham</div><div>P/L</div><div>P/VP</div><div>ROE</div><div>ROIC</div><div>DY</div></div>${body}</div>`
  $('analysisStatus').textContent=`${rows.length} empresa(s) encontrada(s).`;wrap.classList.remove('hidden')
}
function resetPrivateFilters(){
  $('privateTicker').value='';const vals={pPl:15,pPvp:3,pRoe:10,pRoic:10,pDy:0};Object.entries(vals).forEach(([id,v])=>{const el=$(id);el.value=v;el.dispatchEvent(new Event('input'))});$('analysisResults').classList.add('hidden');$('analysisStatus').textContent=`${analysisRows.length} empresas disponíveis para análise.`
}

async function loadAdminUsers(){
  if(currentRole!=='admin')return
  $('adminUsersStatus').classList.remove('hidden');$('adminUsersStatus').textContent='Carregando usuários...';$('adminUsers').innerHTML=''
  try{const j=await callPrivate('admin-users');renderAdminUsers(j)}catch(e){$('adminUsersStatus').textContent='Não foi possível carregar os usuários.'}
}
function userCard(u,type){
  const pending=type==='pending',status=u.status||'active',canDelete=String(u.email||'').toLowerCase()!==String(userEmail.textContent||'').toLowerCase()
  const plans=[['mensal','Mensal'],['trimestral','Trimestral'],['semestral','Semestral'],['anual','Anual']]
  if(u.role==='admin')plans.push(['admin','Admin'])
  const current=String(u.plan||'')
  if(current&&!plans.some(([value])=>value===current))plans.unshift([current,current])
  const select=`<label class="plan-editor-label">Plano <select class="plan-editor" aria-label="Plano de ${esc(u.email)}">${plans.map(([value,label])=>`<option value="${esc(value)}" ${value===current?'selected':''}>${esc(label)}</option>`).join('')}</select></label>`
  const identity=pending?`data-kind="pending" data-email="${esc(u.email)}"`:`data-kind="registered" data-user-id="${esc(u.user_id)}"`
  return `<div class="user-row"><div><b>${esc(u.email)}</b><span>${pending?'Aguardando primeiro acesso':'Conta criada'} • ${esc(u.role||'subscriber')} • ${esc(u.plan||'—')}</span></div><div><span class="user-status ${status}">${status==='active'?'Ativo':status}</span></div><div class="user-actions"><div class="plan-editor-group">${select}<button type="button" class="save-plan-btn" ${identity}>Salvar plano</button></div><button data-action="${status==='active'?'suspend':'activate'}" data-email="${esc(u.email)}">${status==='active'?'Suspender':'Ativar'}</button>${canDelete?`<button class="danger" data-action="delete" data-email="${esc(u.email)}">Excluir</button>`:''}</div></div>`
}
function renderAdminUsers(j){
  const active=Array.isArray(j.active)?j.active:[],pending=Array.isArray(j.pending)?j.pending:[]
  $('adminUsersStatus').classList.add('hidden')
  $('adminUsers').innerHTML=`<div class="user-group"><h4>Usuários ativos/cadastrados</h4>${active.map(u=>userCard(u,'active')).join('')||'<p class="muted">Nenhum usuário.</p>'}</div><div class="user-group"><h4>Aguardando primeiro acesso</h4>${pending.map(u=>userCard(u,'pending')).join('')||'<p class="muted">Nenhum acesso pendente.</p>'}</div>`
  document.querySelectorAll('.user-actions button[data-action]').forEach(btn=>btn.addEventListener('click',()=>adminAction(btn.dataset.action,btn.dataset.email)))
  document.querySelectorAll('.save-plan-btn').forEach(btn=>btn.addEventListener('click',()=>saveUserPlan(btn)))
}
async function saveUserPlan(btn){
  const select=btn.closest('.plan-editor-group')?.querySelector('.plan-editor')
  const plan=select?.value
  if(!plan)return
  const email=btn.dataset.email||btn.closest('.user-row')?.querySelector('b')?.textContent||''
  const previous=btn.closest('.user-row')?.querySelector('.plan-editor')?.getAttribute('data-saved-plan')||''
  const originalText=btn.textContent
  btn.disabled=true
  btn.textContent='Salvando...'
  $('adminMessage').textContent='Atualizando plano...'
  try{
    const {data:{session}}=await supabase.auth.getSession()
    if(!session?.access_token)throw new Error('Sessão expirada')
    const response=await fetch(`${SUPABASE_URL}/functions/v1/invest-admin-update-plan`,{
      method:'POST',
      headers:{Authorization:`Bearer ${session.access_token}`,apikey:SUPABASE_KEY,'Content-Type':'application/json'},
      body:JSON.stringify(btn.dataset.kind==='pending'?{kind:'pending',email,plan}:{kind:'registered',user_id:btn.dataset.userId,plan}),
      cache:'no-store'
    })
    if(!response.ok)throw new Error('Não foi possível salvar o plano')
    $('adminMessage').textContent=`Plano de ${email} atualizado para ${plan}.`
    await loadAdminUsers()
  }catch(e){$('adminMessage').textContent=e.message||'Não foi possível alterar o plano.'}
  finally{btn.disabled=false;btn.textContent=originalText}
}
async function adminAction(action,email){
  if(action==='delete'&&!confirm(`Excluir o acesso de ${email}? A conta será removida da área AXIVA Invest.`))return
  $('adminMessage').textContent='Atualizando...'
  try{await callPrivate('admin-users',{method:'POST',body:{action,email}});$('adminMessage').textContent='Alteração concluída.';await loadAdminUsers()}
  catch(e){$('adminMessage').textContent='Não foi possível concluir a alteração.'}
}

loginForm.addEventListener('submit',async e=>{
  e.preventDefault()
  loginMessage.textContent='Entrando...'
  const result=await investLogin(emailInput.value.trim(),passwordInput.value)
  if(!result.ok){loginMessage.textContent=result.error;return}
  loginMessage.textContent=''
  await loadPrivateArea()
})

$('firstAccessBtn').addEventListener('click',async()=>{
  const email=emailInput.value.trim().toLowerCase(),password=passwordInput.value
  if(!email){loginMessage.textContent='Informe o e-mail previamente autorizado pela AXIVA.';return}
  if(!password||password.length<8){loginMessage.textContent='Crie uma senha com pelo menos 8 caracteres.';return}
  loginMessage.textContent='Verificando autorização...'
  try{
    const check=await fetch(FIRST_ACCESS_API,{method:'POST',headers:{'Content-Type':'application/json',apikey:SUPABASE_KEY},body:JSON.stringify({email})})
    const auth=await check.json().catch(()=>({authorized:false}))
    if(!auth.authorized){loginMessage.textContent='Este e-mail ainda não foi liberado pelo administrador da AXIVA.';return}
  }catch(e){loginMessage.textContent='Não foi possível validar a autorização agora.';return}
  loginMessage.textContent='Criando seu acesso...'
  const {data,error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:`${location.origin}/invest/private`}})
  if(error){loginMessage.textContent=/already registered|already exists|user already/i.test(error.message||'')?'Esse e-mail já possui uma conta. Use Entrar ou Esqueci minha senha.':'Não foi possível criar o primeiro acesso agora.';return}
  if(data.session){loginMessage.textContent='';await loadPrivateArea();return}
  loginMessage.textContent='Conta criada. Verifique seu e-mail para confirmar o acesso e depois entre normalmente.'
})

$('forgotBtn').addEventListener('click',async()=>{const email=emailInput.value.trim();if(!email){loginMessage.textContent='Informe seu e-mail para solicitar a redefinição da senha.';return}const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${location.origin}/invest/private`});loginMessage.textContent=error?'Não foi possível solicitar a redefinição agora.':'Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.'})
$('logoutBtn').addEventListener('click',async()=>{await supabase.auth.signOut();showLogin()})
$('privateAnalyzeBtn').addEventListener('click',()=>window.axivaSuiteApplyFilters?window.axivaSuiteApplyFilters():applyPrivateFilters())
$('privateResetBtn').addEventListener('click',()=>window.axivaSuiteResetFilters?window.axivaSuiteResetFilters():resetPrivateFilters())
$('privateTicker').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();window.axivaSuiteApplyFilters?window.axivaSuiteApplyFilters():applyPrivateFilters()}})
$('refreshUsersBtn').addEventListener('click',loadAdminUsers)
$('appLinkForm').addEventListener('submit',async e=>{
  e.preventDefault()
  const email=$('appLinkEmail').value.trim().toLowerCase(),btn=$('appLinkBtn'),msg=$('appLinkMessage')
  btn.disabled=true;msg.textContent='Enviando...'
  try{
    const {data:{session}}=await supabase.auth.getSession()
    if(!session?.access_token)throw new Error('Sessão expirada. Entre novamente.')
    const response=await fetch(`${SUPABASE_URL}/functions/v1/invest-send-app-link`,{
      method:'POST',
      headers:{Authorization:`Bearer ${session.access_token}`,apikey:SUPABASE_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({email}),
      cache:'no-store'
    })
    if(!response.ok){
      const detail=await response.json().catch(()=>({}))
      throw new Error(detail.error==='invalid_email'?'Informe um e-mail válido.':'Não foi possível enviar o e-mail agora.')
    }
    msg.textContent=`Link enviado para ${email}.`
    $('appLinkForm').reset()
  }catch(err){msg.textContent=err.message||'Não foi possível enviar o e-mail.'}
  finally{btn.disabled=false}
})
$('adminUserForm').addEventListener('submit',async e=>{e.preventDefault();const email=$('adminEmail').value.trim().toLowerCase(),role=$('adminRole').value,plan=$('adminPlan').value,ends=$('adminEnds').value;$('adminMessage').textContent='Liberando acesso...';try{await callPrivate('admin-users',{method:'POST',body:{action:'add',email,role,plan,ends_at:ends?`${ends}T23:59:59`:null}});$('adminMessage').textContent='Acesso liberado. O usuário já pode criar o primeiro acesso com este e-mail.';$('adminUserForm').reset();await loadAdminUsers()}catch(e){$('adminMessage').textContent='Não foi possível liberar o acesso.'}})

$('selectionMethodLink').addEventListener('click',e=>{e.preventDefault();document.querySelector('.nav-item[data-page="method"]')?.click()})



const educationTopics=window.AXIVA_EDUCATION_CONTENT||{}
const educationMeta={
  'analisar-acao':{title:'Como analisar uma ação',category:'Fundamentos',description:'Um roteiro completo, do negócio ao valuation, para estudar uma empresa com método e sem atalhos.',level:'Essencial',minutes:11,featured:true,icon:'◎'},
  'valuation':{title:'Valuation',category:'Valuation',description:'Entenda como estimar valor e por que nenhuma metodologia deve ser tratada como certeza.',level:'Essencial',minutes:8,icon:'◇'},
  'preco-justo':{title:'Preço justo de uma ação',category:'Valuation',description:'Preço de mercado, valor estimado, desconto, ágio e margem de segurança.',level:'Essencial',minutes:7,icon:'⊙'},
  'roic':{title:'ROIC',category:'Rentabilidade',description:'Como avaliar o retorno gerado sobre o capital investido no negócio.',level:'Essencial',minutes:6,icon:'↗'},
  'roe':{title:'ROE',category:'Rentabilidade',description:'Como interpretar o retorno sobre o patrimônio dos acionistas.',level:'Essencial',minutes:5,icon:'R'},
  'pl':{title:'P/L',category:'Valuation',description:'O que a relação entre preço e lucro realmente diz — e o que não diz.',level:'Essencial',minutes:5,icon:'P'},
  'pvp':{title:'P/VP',category:'Valuation',description:'Como interpretar preço em relação ao patrimônio e em quais setores ele é mais útil.',level:'Essencial',minutes:5,icon:'V'},
  'dy':{title:'Dividend Yield (DY)',category:'Dividendos',description:'Como interpretar dividendos em relação ao preço e avaliar a sustentabilidade dos proventos.',level:'Essencial',minutes:6,icon:'%'},
  'ebitda':{title:'EBITDA',category:'Resultados',description:'O que mede, para que serve e por que EBITDA não deve ser confundido com fluxo de caixa.',level:'Intermediário',minutes:6,icon:'E'},
  'margem-ebit':{title:'Margem EBIT',category:'Resultados',description:'Como interpretar eficiência operacional, tendência de margens e comparação entre empresas.',level:'Intermediário',minutes:5,icon:'M'},
  'margem-liquida':{title:'Margem líquida',category:'Resultados',description:'Quanto de cada R$ 100 vendidos vira lucro no fim, e como comparar empresas do mesmo setor.',level:'Essencial',minutes:6,icon:'ML'},
  'formula-de-graham':{title:'Fórmula de Graham',category:'Valuation',description:'De onde vem o valor de Graham, como calcular com um exemplo e quais são os limites da fórmula.',level:'Intermediário',minutes:5,icon:'G'},
  'lpa-e-vpa':{title:'LPA e VPA',category:'Valuation',description:'Os dois números por ação que estão por trás do P/L e do P/VP, explicados com contas simples.',level:'Iniciante',minutes:5,icon:'LP'},
  'divida-liquida-ebitda':{title:'Dívida líquida/EBITDA',category:'Resultados',description:'O indicador mais usado para medir endividamento, com exemplo, limites e cuidados por setor.',level:'Intermediário',minutes:5,icon:'DL'},
  'payout':{title:'Payout',category:'Dividendos',description:'Como calcular o payout, por que 100% pode ser perigoso e o que a empresa faz com o lucro que fica.',level:'Essencial',minutes:4,icon:'PO'},
  'fluxo-de-caixa-livre':{title:'Fluxo de caixa livre',category:'Resultados',description:'Por que lucro e caixa são coisas diferentes e como calcular o dinheiro que sobra para o acionista.',level:'Intermediário',minutes:5,icon:'FC'},
  'valor-de-mercado-e-liquidez':{title:'Valor de mercado e liquidez',category:'Fundamentos',description:'O que é valor de mercado, o que significa large cap e small cap e por que liquidez importa na hora de vender.',level:'Iniciante',minutes:5,icon:'VM'},
  'bancos-e-seguradoras':{title:'Bancos e seguradoras',category:'Empresas',description:'Os indicadores certos para bancos e seguradoras, e por que EBITDA e dívida líquida não servem para eles.',level:'Intermediário',minutes:5,icon:'BK'},
  'o-que-e-uma-acao':{title:'O que é uma ação',category:'Primeiros passos',description:'O básico para quem está começando: o que você compra quando compra uma ação, como ganha dinheiro e quais são os riscos.',level:'Iniciante',minutes:5,icon:'A'},
  'on-pn-units':{title:'ON, PN e Units',category:'Primeiros passos',description:'Entenda o número no final do código da ação, a diferença entre ordinárias, preferenciais e units e o que é tag along.',level:'Iniciante',minutes:5,icon:'ON'},
  'como-comecar-a-investir':{title:'Como começar a investir',category:'Primeiros passos',description:'Do primeiro passo à primeira ordem de compra: corretora, custos, tipos de ordem e como começar com pouco.',level:'Iniciante',minutes:5,icon:'1'},
  'perfil-de-investidor':{title:'Perfil de investidor',category:'Primeiros passos',description:'Conservador, moderado ou arrojado: o que significa cada perfil e como suas metas e prazos entram nessa conta.',level:'Iniciante',minutes:5,icon:'PI'},
  'reserva-de-emergencia':{title:'Reserva de emergência',category:'Primeiros passos',description:'Quanto guardar, onde deixar o dinheiro e por que a reserva vem antes de comprar a primeira ação.',level:'Iniciante',minutes:5,icon:'RE'},
  'renda-fixa-x-variavel':{title:'Renda fixa e renda variável',category:'Primeiros passos',description:'O que muda entre títulos de renda fixa e ações, como funciona o imposto regressivo e por que misturar os dois.',level:'Iniciante',minutes:5,icon:'RF'},
  'juros-compostos':{title:'Juros compostos',category:'Primeiros passos',description:'A diferença entre juros simples e compostos, a regra dos 72 e quanto o hábito de investir todo mês pode render em 30 anos.',level:'Iniciante',minutes:5,icon:'JC'},
  'inflacao-selic-e-bolsa':{title:'Inflação, Selic e bolsa',category:'Primeiros passos',description:'O que é a Selic, como ela afeta a bolsa, o que é juro real e por que ficar parado no dinheiro custa caro.',level:'Iniciante',minutes:5,icon:'IS'},
  'proventos':{title:'Proventos',category:'Dividendos',description:'O que cada evento significa, quando você tem direito a receber e o que acontece com o preço e com a sua posição.',level:'Iniciante',minutes:6,icon:'PV'},
  'imposto-de-renda-em-acoes':{title:'Imposto de renda em ações',category:'Impostos',description:'A isenção de R$ 20 mil, a alíquota sobre o lucro, day trade, DARF e como compensar prejuízos, com exemplos.',level:'Intermediário',minutes:6,icon:'IR'},
  'tributacao-de-dividendos-2026':{title:'Tributação de dividendos em 2026',category:'Impostos',description:'O que a Lei 15.270/2025 mudou, quem sofre retenção na fonte e como isso afeta o investidor comum.',level:'Intermediário',minutes:6,icon:'T6'},
  'diversificacao':{title:'Diversificação',category:'Estratégia',description:'Como espalhar o risco entre empresas, setores e tipos de investimento, e por que diversificar demais também atrapalha.',level:'Essencial',minutes:5,icon:'DV'},
  'risco-e-volatilidade':{title:'Risco e volatilidade',category:'Estratégia',description:'A diferença entre oscilação e perda permanente, quanto uma queda precisa subir para voltar e os principais tipos de risco.',level:'Essencial',minutes:5,icon:'RV'},
  'buy-and-hold-x-trading':{title:'Buy and hold e trading',category:'Estratégia',description:'Comprar e manter a longo prazo ou operar com frequência: custos, impostos, tempo exigido e o que mostram os estudos.',level:'Intermediário',minutes:5,icon:'BH'},
  'analise-fundamentalista-x-tecnica':{title:'Análise fundamentalista e técnica',category:'Estratégia',description:'Uma olha a empresa, a outra olha o gráfico. Veja o que cada uma faz, onde cada uma ajuda e onde falha.',level:'Iniciante',minutes:4,icon:'AF'},
  'aportes-regulares':{title:'Aportes regulares e preço médio',category:'Estratégia',description:'Como funciona o preço médio, por que investir todo mês reduz o peso do momento da compra e quando isso não ajuda.',level:'Iniciante',minutes:5,icon:'AP'},
  'erros-do-iniciante':{title:'Erros comuns do iniciante',category:'Estratégia',description:'Os tropeços mais frequentes de quem começa na bolsa, com exemplos do dia a dia e o que fazer no lugar.',level:'Iniciante',minutes:5,icon:'!'},
  'vieses-comportamentais':{title:'Vieses comportamentais',category:'Estratégia',description:'Manada, ancoragem, aversão à perda e outros atalhos mentais que levam a decisões ruins, com exemplos práticos.',level:'Intermediário',minutes:5,icon:'VC'},
  'setores-ciclicas-defensivas':{title:'Setores, cíclicas e defensivas',category:'Empresas',description:'Como diferenciar negócios que sentem a economia dos que resistem melhor, e por que isso muda a leitura dos indicadores.',level:'Iniciante',minutes:4,icon:'SE'},
  'resultados-trimestrais':{title:'Resultados trimestrais e site de RI',category:'Empresas',description:'Onde encontrar ITR, DFP e release, o que olhar primeiro e como entender a reação do preço depois do balanço.',level:'Intermediário',minutes:5,icon:'RT'},
  'governanca-e-segmentos-de-listagem':{title:'Governança e segmentos de listagem',category:'Empresas',description:'O que é governança, o que significam os segmentos da B3 e que sinais olhar para saber se a empresa trata bem seus acionistas.',level:'Intermediário',minutes:5,icon:'GV'},
  'etfs':{title:'ETFs',category:'Outros ativos',description:'O que é um ETF, como ele replica um índice, quais as vantagens, os custos e como é o imposto.',level:'Iniciante',minutes:4,icon:'ET'},
  'fiis':{title:'Fundos imobiliários (FIIs)',category:'Outros ativos',description:'O que são os FIIs, tipos de fundo, como os rendimentos mensais funcionam e quais indicadores olhar, como P/VP e DY.',level:'Intermediário',minutes:5,icon:'FI'},
  'bdrs-e-investimento-no-exterior':{title:'BDRs e investimento no exterior',category:'Outros ativos',description:'Como comprar empresas estrangeiras pela B3 com BDRs, como investir diretamente lá fora e quais são os riscos e os custos.',level:'Intermediário',minutes:5,icon:'BD'}
}
const educationOrder=['o-que-e-uma-acao','on-pn-units','como-comecar-a-investir','perfil-de-investidor','reserva-de-emergencia','renda-fixa-x-variavel','juros-compostos','inflacao-selic-e-bolsa','analisar-acao','valor-de-mercado-e-liquidez','valuation','preco-justo','pl','pvp','lpa-e-vpa','formula-de-graham','roic','roe','ebitda','margem-ebit','margem-liquida','fluxo-de-caixa-livre','divida-liquida-ebitda','dy','payout','proventos','imposto-de-renda-em-acoes','tributacao-de-dividendos-2026','diversificacao','risco-e-volatilidade','aportes-regulares','buy-and-hold-x-trading','analise-fundamentalista-x-tecnica','erros-do-iniciante','vieses-comportamentais','bancos-e-seguradoras','setores-ciclicas-defensivas','resultados-trimestrais','governanca-e-segmentos-de-listagem','etfs','fiis','bdrs-e-investimento-no-exterior']
const educationCategories=['Todos','Primeiros passos','Fundamentos','Valuation','Rentabilidade','Resultados','Dividendos','Impostos','Estratégia','Empresas','Outros ativos']
let educationFilter='Todos'

function educationCard(topic,compact=false){
  const m=educationMeta[topic],item=educationTopics[topic]
  if(!m||!item)return ''
  return '<button type="button" class="axedu-card'+(compact?' axedu-card-compact':'')+'" data-education-topic="'+topic+'">'+
    '<strong>'+esc(m.title)+'</strong>'+
    '<span class="axedu-card-description">'+esc(m.description)+'</span>'+
    '<span class="axedu-card-meta">'+m.minutes+' min de leitura <i></i> '+m.level+'</span>'+
  '</button>'
}

function featuredEducationCard(){
  const topic='analisar-acao',m=educationMeta[topic]
  return '<button type="button" class="axedu-featured" data-education-topic="'+topic+'">'+
    '<span class="axedu-featured-copy">'+
      '<span class="axedu-featured-tags"><b>Comece por aqui</b></span>'+
      '<strong>'+m.title+'</strong>'+
      '<span class="axedu-featured-desc">'+m.description+'</span>'+
      '<span class="axedu-featured-stats"><span><small>Jornada</small><b>11 etapas</b></span><span><small>Leitura</small><b>'+m.minutes+' min</b></span><span><small>Nível</small><b>'+m.level+'</b></span></span>'+
      '<span class="axedu-featured-cta">Começar a jornada →</span>'+
    '</span>'+
    '<span class="axedu-featured-art" aria-hidden="true"><i class="axedu-ring r1"></i><i class="axedu-ring r2"></i><i class="axedu-bar b1"></i><i class="axedu-bar b2"></i><i class="axedu-bar b3"></i><i class="axedu-line"></i></span>'+
  '</button>'
}

function renderEducationHomePreview(){
  const el=$('educationHomePreview')
  if(!el)return
  el.innerHTML=featuredEducationCard()+
    '<div class="axedu-home-mini-grid">'+['valuation','roic','roe'].map(t=>educationCard(t,true)).join('')+'</div>'
}

function renderEducationLibrary(filter=educationFilter){
  if(!accessValidated){showLogin('Faça login para acessar a área exclusiva.');return}
  educationFilter=filter
  const content=$('educationContent')
  if(!content)return
  const visible=educationOrder.filter(t=>!educationMeta[t].featured&&(filter==='Todos'||educationMeta[t].category===filter))
  const showFeatured=filter==='Todos'||educationMeta['analisar-acao'].category===filter
  const total=educationOrder.reduce((sum,t)=>sum+educationMeta[t].minutes,0)
  content.innerHTML=
    '<div class="axedu-library">'+
      '<button type="button" class="axedu-back" data-education-overview>← Voltar para Página Inicial</button>'+
      '<header class="axedu-library-head"><h2>AXIVA Educação</h2><p>Aprenda a interpretar os principais indicadores e conceitos usados na análise de ações.</p>'+
        '<dl><div><dt>Conteúdos</dt><dd>'+educationOrder.length+'</dd></div><div><dt>Temas</dt><dd>'+(educationCategories.length-1)+'</dd></div><div><dt>Leitura total</dt><dd>'+total+' min</dd></div></dl>'+
      '</header>'+
      '<div class="axedu-filters">'+educationCategories.map(f=>'<button type="button" data-education-filter="'+f+'" class="'+(f===filter?'active':'')+'">'+f+' <span>'+educationOrder.filter(t=>f==='Todos'||educationMeta[t].category===f).length+'</span></button>').join('')+'</div>'+
      '<div class="axedu-library-list">'+(showFeatured?featuredEducationCard():'')+
        (visible.length?'<div class="axedu-library-grid">'+visible.map(t=>educationCard(t)).join('')+'</div>':'<div class="axedu-empty">Nenhum conteúdo nesta categoria.</div>')+
      '</div>'+
      '<aside class="axedu-disclaimer"><b>i</b><p><strong>Conteúdo de caráter exclusivamente informativo e educacional.</strong> Não constitui recomendação de compra, venda ou manutenção de ativos. Os exemplos são ilustrativos e rentabilidade passada não é garantia de resultados futuros.</p></aside>'+
    '</div>'
  $('pageTitle').textContent=''
  window.scrollTo({top:0,behavior:'smooth'})
}

function openEducationTopic(topic){
  if(!accessValidated){showLogin('Faça login para acessar a área exclusiva.');return}
  const item=educationTopics[topic],m=educationMeta[topic]
  if(!item||!m)return
  document.querySelector('.nav-item[data-page="education"]')?.click()
  const content=$('educationContent')
  if(!content)return
  const isJourney=topic==='analisar-acao'
  content.innerHTML=
    '<div class="axedu-article">'+
      '<button type="button" class="axedu-back" data-education-library>← Voltar para AXIVA Educação</button>'+
      '<details class="axedu-mobile-toc"><summary>'+(isJourney?'Sua jornada':'Nesta página')+'</summary><div>'+item.toc+'</div></details>'+
      '<div class="axedu-article-grid">'+
        '<article class="axedu-article-main">'+
          '<header class="axedu-article-head"><h2>'+esc(item.title)+'</h2><p>'+esc(item.intro)+'</p>'+
            '<ul><li>◷ Leitura: '+m.minutes+' min</li><li>◉ Nível '+m.level.toLowerCase()+'</li>'+(isJourney?'<li>≡ 11 etapas</li>':'')+'</ul>'+
          '</header>'+
          '<div class="axedu-article-body">'+item.article+'</div>'+
        '</article>'+
        '<aside class="axedu-article-toc">'+item.toc+'</aside>'+
      '</div>'+
      '<aside class="axedu-disclaimer"><b>i</b><p><strong>Conteúdo de caráter exclusivamente informativo e educacional.</strong> Não constitui recomendação de compra, venda ou manutenção de ativos.</p></aside>'+
    '</div>'
  $('pageTitle').textContent=''
  window.scrollTo({top:0,behavior:'smooth'})
}


document.querySelector('.nav-item[data-page="education"]')?.addEventListener('click',()=>renderEducationLibrary())
document.querySelectorAll('[data-education-topic]').forEach(btn=>btn.addEventListener('click',()=>openEducationTopic(btn.dataset.educationTopic)))


$('educationContent')?.addEventListener('click',e=>{
  const topic=e.target.closest('[data-education-topic]')
  if(topic){e.preventDefault();openEducationTopic(topic.dataset.educationTopic);return}
  const filter=e.target.closest('[data-education-filter]')
  if(filter){renderEducationLibrary(filter.dataset.educationFilter);return}
  if(e.target.closest('[data-education-library]')){renderEducationLibrary();return}
  if(e.target.closest('[data-education-overview]')||e.target.closest('[data-education-home]')){
    e.preventDefault()
    document.querySelector('.nav-item[data-page="overview"]')?.click()
  }
})

document.querySelectorAll('[data-header-page]').forEach(link=>link.addEventListener('click',()=>{
  document.querySelector('.nav-item[data-page="'+link.dataset.headerPage+'"]')?.click()
}))

document.querySelectorAll('.nav-item').forEach(btn=>btn.addEventListener('click',async()=>{
  if(btn.hasAttribute('data-axiva-install'))return // "Instalar no celular" não é uma página
  if(!accessValidated){showLogin('Faça login para acessar a área exclusiva.');return}
  if(btn.id==='adminNav'&&currentRole!=='admin')return
  const previousPage=document.querySelector('.nav-item.active')?.dataset.page||null
  if(btn.dataset.page==='company'&&previousPage&&previousPage!=='company'){
    window.axivaCompanyOrigin=previousPage
    $('companyBackBtn')?.classList.remove('hidden')
  }
  document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));btn.classList.add('active')
  document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));$(btn.dataset.page+'Page')?.classList.add('active')
  const pageTitles={overview:'PÁGINA INICIAL',selection:'',analysis:'',company:'ANALISAR EMPRESA',compare:'',watch:'MINHA LISTA',alerts:'MEUS ALERTAS',strategies:'',education:'',method:'METODOLOGIA',subscription:'MINHA ASSINATURA',admin:'ADMINISTRAÇÃO'}
  const pageTitle=pageTitles[btn.dataset.page]
  $('pageTitle').textContent=pageTitle!==undefined?pageTitle:btn.textContent.trim()
  if(btn.dataset.page==='admin')await loadAdminUsers()
}))

// Link do e-mail "Defina sua senha" (?token_hash=...&type=recovery): valida o código aqui mesmo,
// sem depender do redirecionamento do Supabase.
const recoveryHash=new URLSearchParams(location.search).get('token_hash')
if(recoveryHash&&recoveryMode){
  const {error}=await supabase.auth.verifyOtp({token_hash:recoveryHash,type:'recovery'})
  history.replaceState(null,'',location.pathname+'?type=recovery')
  if(error){await supabase.auth.signOut().catch(()=>{})}
}
const {data:{session}}=await supabase.auth.getSession()
if(recoveryMode){if(session)showResetView();else showLogin('Link inválido ou expirado. Solicite uma nova recuperação de senha.')}else if(session)await loadPrivateArea();else showLogin()
