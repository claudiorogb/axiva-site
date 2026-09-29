import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.116.0/+esm'

const SUPABASE_URL='https://zbtijblvkzkeposvkfob.supabase.co'
const SUPABASE_KEY='sb_publishable_1hWexWrd_y-m36-DaXF5Hw_p33Ginm_'
const PRIVATE_API=`${SUPABASE_URL}/functions/v1/invest-private-data`
const FIRST_ACCESS_API=`${SUPABASE_URL}/functions/v1/invest-first-access-check`
// Guardar o tipo do link antes de o cliente Auth limpar o fragmento da URL.
let recoveryMode=new URLSearchParams(location.hash.slice(1)).get('type')==='recovery' || new URLSearchParams(location.search).get('type')==='recovery'
const supabase=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})
window.axivaSupabase=supabase

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

function showLogin(msg=''){accessValidated=false;loginView.classList.remove('hidden');appView.classList.add('hidden');$('resetView').classList.add('hidden');loginMessage.textContent=msg}
function showApp(){if(recoveryMode){showResetView();return}if(!accessValidated){showLogin('Faça login para acessar a área exclusiva.');return}loginView.classList.add('hidden');$('resetView').classList.add('hidden');appView.classList.remove('hidden')}
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
    accessChip.textContent=currentRole==='admin'?'Administrador':`Plano ${plan==='annual'?'anual':plan}`
    $('adminNav').classList.toggle('hidden',currentRole!=='admin')
    accessValidated=true
    showApp()
    await Promise.all([loadSelection(),loadAnalysisData()])
  }catch(e){
    await supabase.auth.signOut()
    showLogin(e.status===403?'Sua conta existe, mas o acesso à área exclusiva não está ativo.':'Não foi possível validar seu acesso. Tente novamente.')
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


const educationTopics={
  'analisar-acao':{
    title:'Como analisar uma ação',
    intro:'Analisar uma ação significa entender primeiro a empresa e depois avaliar se o preço pago faz sentido diante dos fundamentos.',
    sections:[
      ['1. Entenda o negócio','Veja como a empresa ganha dinheiro, em quais mercados atua, quais são seus principais produtos, clientes, concorrentes e riscos. Um bom número isolado não compensa um negócio que você não entende.'],
      ['2. Observe rentabilidade e eficiência','ROE e ROIC ajudam a avaliar a capacidade de transformar capital em resultado. Compare com o histórico da própria empresa e com negócios semelhantes.'],
      ['3. Analise margens e crescimento','Margem EBIT e margem líquida mostram quanto da receita permanece após diferentes grupos de despesas. Crescimento de receita ajuda a entender se a operação está expandindo.'],
      ['4. Verifique endividamento e liquidez','Dívida deve ser analisada em conjunto com capacidade de geração de resultado e caixa. Empresas muito endividadas podem ficar mais vulneráveis em cenários adversos.'],
      ['5. Compare preço e valor','P/L, P/VP, múltiplos do setor, preço-alvo e outras técnicas de valuation ajudam a avaliar quanto o mercado está cobrando pelo negócio. Nenhum indicador deve ser usado sozinho.'],
      ['6. Compare com setor e histórico','Um múltiplo aparentemente alto ou baixo pode ser normal para determinado setor. A comparação com pares e com o próprio histórico adiciona contexto.'],
      ['7. Revise os riscos','Antes de decidir, considere governança, concentração de receita, regulação, ciclos econômicos, competição e o que pode fazer sua análise estar errada.']
    ]
  },
  valuation:{
    title:'Valuation',
    intro:'Valuation é o processo de estimar uma referência de valor para uma empresa ou ação a partir de seus resultados, patrimônio, geração de caixa, crescimento e outras premissas.',
    sections:[
      ['O que o valuation responde','Ele procura responder quanto um negócio pode valer de acordo com uma metodologia. O resultado não é uma cotação futura garantida.'],
      ['Principais abordagens','É possível usar fluxo de caixa descontado, múltiplos comparáveis, múltiplos históricos, valor patrimonial e outras metodologias. Cada abordagem tem vantagens e limitações.'],
      ['Como a AXIVA usa valuation','A AXIVA utiliza referências calculadas a partir de múltiplos históricos quando há dados suficientes e também apresenta Graham como uma referência adicional quando LPA e VPA são positivos.'],
      ['Por que o resultado muda','Mudanças em lucros, patrimônio, juros, risco, crescimento, múltiplos e preço de mercado alteram a relação entre preço e valor estimado.']
    ]
  },
  'preco-justo':{
    title:'Preço justo de uma ação',
    intro:'Preço justo é uma referência estimada de valor, não um preço que o mercado seja obrigado a atingir.',
    sections:[
      ['Preço de mercado x preço justo','O preço de mercado é o valor negociado naquele momento. O preço justo depende da metodologia e das premissas utilizadas na análise.'],
      ['Desconto','Quando a cotação está abaixo da referência de valor, existe desconto em relação àquela metodologia. Isso não significa que a ação necessariamente subirá.'],
      ['Ágio','Quando a cotação está acima da referência, há ágio em relação àquela metodologia. Uma empresa de alta qualidade pode negociar com ágio por longos períodos.'],
      ['Uso correto','Utilize preço justo junto com qualidade do negócio, rentabilidade, crescimento, endividamento, riscos e comparação com empresas semelhantes.']
    ]
  },
  roic:{
    title:'ROIC',
    intro:'ROIC significa Return on Invested Capital, ou retorno sobre o capital investido.',
    sections:[
      ['O que mede','Mostra a eficiência da empresa para gerar resultado operacional a partir do capital necessário para financiar suas operações.'],
      ['Como interpretar','Em geral, ROIC mais elevado e consistente indica melhor eficiência no uso do capital. A comparação deve considerar setor, ciclo do negócio e histórico da empresa.'],
      ['Por que é importante','Uma empresa que consegue reinvestir capital a retornos elevados pode criar valor ao longo do tempo, especialmente quando há oportunidades de crescimento.'],
      ['Limitação','O cálculo pode variar conforme a definição de capital investido e resultado operacional. Na metodologia AXIVA, o ROIC não é utilizado como trava para instituições financeiras.']
    ]
  },
  roe:{
    title:'ROE',
    intro:'ROE significa Return on Equity, ou retorno sobre o patrimônio líquido.',
    sections:[
      ['O que mede','Relaciona o resultado gerado pela empresa ao patrimônio líquido dos acionistas. É uma medida de rentabilidade sobre o capital próprio.'],
      ['Como interpretar','ROE elevado pode indicar boa rentabilidade, mas deve ser analisado junto com dívida, margens, crescimento e recorrência dos resultados.'],
      ['Atenção ao endividamento','Uma empresa muito alavancada pode apresentar ROE elevado porque possui uma base menor de patrimônio. Por isso, ROE não deve ser analisado isoladamente.']
    ]
  },
  pl:{
    title:'P/L',
    intro:'P/L é a relação entre o preço da ação e o lucro por ação.',
    sections:[
      ['O que significa','De forma simplificada, mostra quanto o mercado paga por cada unidade de lucro atual da empresa.'],
      ['P/L baixo','Pode indicar uma ação relativamente barata, mas também pode refletir risco, lucro temporariamente elevado ou expectativa de queda dos resultados.'],
      ['P/L alto','Pode refletir expectativa de crescimento, maior qualidade percebida ou simplesmente um preço elevado.'],
      ['Quando o lucro é negativo','P/L negativo perde grande parte da utilidade econômica e deve ser interpretado com cautela.']
    ]
  },
  pvp:{
    title:'P/VP',
    intro:'P/VP compara o preço da ação com o valor patrimonial por ação.',
    sections:[
      ['O que significa','P/VP 1 indica, matematicamente, que o mercado está precificando a ação aproximadamente pelo valor contábil do patrimônio por ação.'],
      ['Abaixo de 1','Não significa automaticamente oportunidade. O mercado pode estar atribuindo desconto ao patrimônio por baixa rentabilidade, riscos ou qualidade dos ativos.'],
      ['Acima de 1','Pode refletir expectativa de que a empresa gere retorno acima do valor contábil de seu patrimônio.'],
      ['Onde costuma ser mais útil','É especialmente relevante em negócios nos quais o patrimônio contábil tem forte relação com a atividade econômica, mas sua utilidade varia entre setores.']
    ]
  },
  dy:{
    title:'DY — Dividend Yield',
    intro:'Dividend Yield relaciona os proventos distribuídos ao acionista com o preço da ação.',
    sections:[
      ['Como é interpretado','Um DY de 6% indica que os proventos considerados no cálculo representam aproximadamente 6% do preço usado como referência.'],
      ['DY alto não é garantia','Dividendos podem variar. Distribuições extraordinárias ou queda forte da cotação podem elevar o indicador temporariamente.'],
      ['O que observar junto','Lucros, geração de caixa, endividamento, política de distribuição e capacidade de reinvestimento ajudam a avaliar a sustentabilidade dos dividendos.']
    ]
  },
  ebitda:{
    title:'EBITDA',
    intro:'EBITDA representa o resultado antes de juros, impostos, depreciação e amortização.',
    sections:[
      ['Para que serve','É usado como uma aproximação do desempenho operacional antes de efeitos financeiros, tributários e de itens contábeis de depreciação e amortização.'],
      ['O que ele não é','EBITDA não é fluxo de caixa. A empresa ainda precisa investir, pagar impostos, juros, capital de giro e outras obrigações.'],
      ['Como usar','É comum comparar EBITDA ao longo do tempo ou utilizar EV/EBITDA para comparar empresas do mesmo setor.']
    ]
  },
  'margem-ebit':{
    title:'Margem EBIT',
    intro:'Margem EBIT mostra quanto do faturamento permanece como resultado operacional antes do resultado financeiro e dos impostos sobre o lucro.',
    sections:[
      ['Cálculo conceitual','Margem EBIT = EBIT ÷ Receita líquida. Quanto maior a margem, maior a parcela da receita convertida em resultado operacional, mantendo-se as demais condições.'],
      ['Como interpretar','Observe a evolução ao longo do tempo e compare com empresas semelhantes. Margens estruturalmente diferentes são comuns entre setores.'],
      ['Por que pode mudar','Preços, custos, despesas operacionais, escala, mix de produtos, eficiência e ciclos econômicos podem alterar a margem EBIT.']
    ]
  }
}

function openEducationTopic(topic){
  if(!accessValidated){showLogin('Faça login para acessar a área exclusiva.');return}
  const item=educationTopics[topic]
  if(!item)return
  document.querySelector('.nav-item[data-page="education"]')?.click()
  const content=$('educationContent')
  if(!content)return
  content.innerHTML='<div class="education-article-head"><h2>'+esc(item.title)+'</h2><p>'+esc(item.intro)+'</p></div>'+
    '<div class="education-article-sections">'+item.sections.map(([title,body])=>'<article class="education-article-card"><h3>'+esc(title)+'</h3><p>'+esc(body)+'</p></article>').join('')+'</div>'+
    '<p class="education-disclaimer">Conteúdo educacional e informativo. Não constitui recomendação de compra ou venda de ativos.</p>'
  $('pageTitle').textContent=item.title.toUpperCase()
  window.scrollTo({top:0,behavior:'smooth'})
}

document.querySelectorAll('[data-education-topic]').forEach(btn=>btn.addEventListener('click',()=>openEducationTopic(btn.dataset.educationTopic)))
$('educationBackBtn')?.addEventListener('click',()=>document.querySelector('.nav-item[data-page="overview"]')?.click())

document.querySelectorAll('[data-header-page]').forEach(link=>link.addEventListener('click',()=>{
  document.querySelector('.nav-item[data-page="'+link.dataset.headerPage+'"]')?.click()
}))

document.querySelectorAll('.nav-item').forEach(btn=>btn.addEventListener('click',async()=>{
  if(!accessValidated){showLogin('Faça login para acessar a área exclusiva.');return}
  if(btn.id==='adminNav'&&currentRole!=='admin')return
  const previousPage=document.querySelector('.nav-item.active')?.dataset.page||null
  if(btn.dataset.page==='company'&&previousPage&&previousPage!=='company'){
    window.axivaCompanyOrigin=previousPage
    $('companyBackBtn')?.classList.remove('hidden')
  }
  document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));btn.classList.add('active')
  document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));$(btn.dataset.page+'Page')?.classList.add('active')
  const pageTitles={overview:'PÁGINA INICIAL',selection:'',analysis:'',company:'ANALISAR EMPRESA',compare:'',watch:'MINHA LISTA',alerts:'MEUS ALERTAS',strategies:'',education:'AXIVA EDUCAÇÃO',method:'METODOLOGIA',admin:'ADMINISTRAÇÃO'}
  const pageTitle=pageTitles[btn.dataset.page]
  $('pageTitle').textContent=pageTitle!==undefined?pageTitle:btn.textContent.trim()
  if(btn.dataset.page==='admin')await loadAdminUsers()
}))

const {data:{session}}=await supabase.auth.getSession()
if(recoveryMode){if(session)showResetView();else showLogin('Link inválido ou expirado. Solicite uma nova recuperação de senha.')}else if(session)await loadPrivateArea();else showLogin()
