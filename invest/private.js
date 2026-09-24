import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.116.0/+esm'

const SUPABASE_URL='https://zbtijblvkzkeposvkfob.supabase.co'
const SUPABASE_KEY='sb_publishable_1hWexWrd_y-m36-DaXF5Hw_p33Ginm_'
const PRIVATE_API=`${SUPABASE_URL}/functions/v1/invest-private-data`
const FIRST_ACCESS_API=`${SUPABASE_URL}/functions/v1/invest-first-access-check`
// Guardar o tipo do link antes de o cliente Auth limpar o fragmento da URL.
let recoveryMode=new URLSearchParams(location.hash.slice(1)).get('type')==='recovery' || new URLSearchParams(location.search).get('type')==='recovery'
const supabase=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})

const $=id=>document.getElementById(id)
const loginView=$('loginView'),appView=$('appView'),loginForm=$('loginForm'),loginMessage=$('loginMessage')
const emailInput=$('email'),passwordInput=$('password'),userEmail=$('userEmail'),accessChip=$('accessChip')
const selectionStatus=$('selectionStatus'),selectionWrap=$('selectionTableWrap')
let currentRole='subscriber'
let analysisRows=[]
let strategiesLoaded=false

const money=v=>v==null?'—':Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
const num=v=>v==null?'—':Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})
const pct=v=>v==null?'—':(Number(v)*100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'%'
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))
const n=v=>{const x=Number(v);return Number.isFinite(x)?x:null}

function showLogin(msg=''){loginView.classList.remove('hidden');appView.classList.add('hidden');$('resetView').classList.add('hidden');loginMessage.textContent=msg}
function showApp(){if(recoveryMode){showResetView();return}loginView.classList.add('hidden');$('resetView').classList.add('hidden');appView.classList.remove('hidden')}
function showResetView(){loginView.classList.add('hidden');appView.classList.add('hidden');$('resetView').classList.remove('hidden')}
// O link de recuperação cria uma sessão temporária; não significa que a senha já foi alterada.
supabase.auth.onAuthStateChange((event)=>{if(event==='PASSWORD_RECOVERY'){recoveryMode=true;showResetView()}})
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
    currentRole=me.access?.role||'subscriber'
    const plan=me.access?.plan||'assinante'
    accessChip.textContent=currentRole==='admin'?'Administrador':`Acesso ativo • ${plan==='annual'?'anual':plan}`
    $('adminNav').classList.toggle('hidden',currentRole!=='admin')
    showApp()
    await Promise.all([loadSelection(),loadAnalysisData(),loadStrategies()])
  }catch(e){
    await supabase.auth.signOut()
    showLogin(e.status===403?'Sua conta existe, mas o acesso à área exclusiva não está ativo.':'Não foi possível validar seu acesso. Tente novamente.')
  }
}

async function loadSelection(){
  $('selectionDetail').classList.add('hidden');$('selectionPage').classList.remove('detail-open');selectionStatus.classList.remove('hidden');selectionStatus.textContent='Carregando Seleção de Ações...';selectionWrap.classList.add('hidden')
  try{const j=await callPrivate('selection');renderSelection(Array.isArray(j.data)?j.data:[])}
  catch(e){selectionStatus.textContent=e.status===403?'Sua assinatura não está ativa.':'Não foi possível carregar os dados agora.'}
}
function renderSelection(rows){
  if(!rows.length){selectionStatus.textContent='Nenhuma empresa disponível na seleção atual.';return}
  window.axivaSelectionRows=rows
  const body=rows.map((r,index)=>{const d=n(r.discount_pct),dcls=d==null?'':d>=0?'pos':'neg';return `<div class="private-row selection-clickable" data-selection-index="${index}" role="button" tabindex="0" aria-label="Ver detalhes de ${esc(r.ticker)}"><div>${r.position??'—'}</div><div class="ticker"><b>${esc(r.ticker)}</b><span>${esc(r.company_name||'')}</span></div><div>${money(r.current_price)}</div><div>${money(r.target_price)}</div><div class="discount ${dcls}">${pct(r.discount_pct)}</div><div>${money(r.graham_price)}</div><div>${num(r.pl)}</div><div>${num(r.pvp)}</div><div>${pct(r.roe)}</div><div><span class="quality">${r.quality_score==null?'—':Math.round(Number(r.quality_score))}</span></div></div>`}).join('')
  selectionWrap.innerHTML=`<div class="private-table"><div class="private-row private-head"><div>#</div><div>Empresa</div><div>Cotação</div><div>Preço-alvo</div><div>Desconto</div><div>Graham</div><div>P/L</div><div>P/VP</div><div>ROE</div><div>Qualidade</div></div>${body}</div>`
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

async function loadStrategies(){
  $('strategiesStatus').classList.remove('hidden');$('strategiesContent').classList.add('hidden')
  try{const j=await callPrivate('strategies');renderStrategies(j);strategiesLoaded=true}
  catch(e){$('strategiesStatus').textContent='Não foi possível carregar as estratégias.'}
}
function criteriaText(s){
  const parts=[]
  if(s.max_pl!=null)parts.push(`P/L ≤ ${num(s.max_pl)}`);if(s.max_pvp!=null)parts.push(`P/VP ≤ ${num(s.max_pvp)}`);if(s.min_roe!=null)parts.push(`ROE ≥ ${pct(s.min_roe)}`);if(s.min_roic!=null)parts.push(`ROIC ≥ ${pct(s.min_roic)}`);if(s.min_dy!=null)parts.push(`DY ≥ ${pct(s.min_dy)}`);if(s.min_revenue_growth_5y!=null)parts.push(`Cresc. receita ≥ ${pct(s.min_revenue_growth_5y)}`)
  return parts.length?parts.join(' • '):'Critérios relativos ao grupo comparável.'
}
function renderStrategies(j){
  const defs=Array.isArray(j.strategies)?j.strategies:[],results=Array.isArray(j.results)?j.results:[],history=Array.isArray(j.history)?j.history:[]
  const cards=defs.map(s=>{const members=results.filter(r=>r.strategy_id===s.strategy_id);const rows=members.slice(0,30).map(r=>`<div class="strategy-company"><b>${esc(r.ticker)}</b><span>${esc(r.company_name||'')}</span><em>${num(r.pl)} P/L</em><em>${pct(r.roe)} ROE</em><em>${pct(r.dividend_yield)} DY</em></div>`).join('');return `<article class="strategy-card"><div class="strategy-card-head"><div><span>Versão ${s.current_version}</span><h3>${esc(s.name)}</h3></div><strong>${members.length} empresas</strong></div><p class="criteria">${criteriaText(s)}</p><div class="strategy-companies">${rows||'<div class="empty-mini">Nenhuma empresa atende aos critérios nesta atualização.</div>'}</div></article>`}).join('')
  const recent=history.slice(0,20).map(h=>`<div class="history-row"><span>${new Date(h.captured_at).toLocaleDateString('pt-BR')}</span><b>${esc(h.ticker)}</b><span>${esc(h.status|| (h.present?'Presente':'Fora'))}</span></div>`).join('')
  $('strategiesContent').innerHTML=`<div class="strategy-grid">${cards}</div><div class="history-card"><h3>Histórico recente</h3>${recent||'<p>Sem movimentações registradas.</p>'}</div>`
  $('strategiesStatus').classList.add('hidden');$('strategiesContent').classList.remove('hidden')
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

loginForm.addEventListener('submit',async e=>{e.preventDefault();loginMessage.textContent='Entrando...';const {error}=await supabase.auth.signInWithPassword({email:emailInput.value.trim(),password:passwordInput.value});if(error){loginMessage.textContent='E-mail ou senha inválidos.';return}loginMessage.textContent='';await loadPrivateArea()})

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
$('adminUserForm').addEventListener('submit',async e=>{e.preventDefault();const email=$('adminEmail').value.trim().toLowerCase(),role=$('adminRole').value,plan=$('adminPlan').value,ends=$('adminEnds').value;$('adminMessage').textContent='Liberando acesso...';try{await callPrivate('admin-users',{method:'POST',body:{action:'add',email,role,plan,ends_at:ends?`${ends}T23:59:59`:null}});$('adminMessage').textContent='Acesso liberado. O usuário já pode criar o primeiro acesso com este e-mail.';$('adminUserForm').reset();await loadAdminUsers()}catch(e){$('adminMessage').textContent='Não foi possível liberar o acesso.'}})

$('selectionMethodLink').addEventListener('click',e=>{e.preventDefault();document.querySelector('.nav-item[data-page="method"]')?.click()})

document.querySelectorAll('.nav-item').forEach(btn=>btn.addEventListener('click',async()=>{
  if(btn.id==='adminNav'&&currentRole!=='admin')return
  document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));btn.classList.add('active')
  document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));$(btn.dataset.page+'Page')?.classList.add('active')
  const pageTitles={overview:'VISÃO GERAL',selection:'AÇÕES SELECIONADAS',analysis:'DESCOBRIR EMPRESAS',company:'ANALISAR EMPRESA',compare:'COMPARAR EMPRESAS',watch:'ACOMPANHAR',simulate:'SIMULAR PREÇO',strategies:'ESTRATÉGIAS',method:'METODOLOGIA',admin:'ADMINISTRAÇÃO'}
  $('pageTitle').textContent=pageTitles[btn.dataset.page]||btn.textContent.trim()
  if(btn.dataset.page==='admin')await loadAdminUsers()
  if(btn.dataset.page==='strategies'&&!strategiesLoaded)await loadStrategies()
}))

const {data:{session}}=await supabase.auth.getSession()
if(recoveryMode){if(session)showResetView();else showLogin('Link inválido ou expirado. Solicite uma nova recuperação de senha.')}else if(session)await loadPrivateArea();else showLogin()
