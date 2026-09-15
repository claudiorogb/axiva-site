import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.116.0/+esm'

const SUPABASE_URL='https://zbtijblvkzkeposvkfob.supabase.co'
const SUPABASE_KEY='sb_publishable_1hWexWrd_y-m36-DaXF5Hw_p33Ginm_'
const PRIVATE_API=`${SUPABASE_URL}/functions/v1/invest-private-data`
const supabase=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})

const loginView=document.getElementById('loginView')
const appView=document.getElementById('appView')
const loginForm=document.getElementById('loginForm')
const loginMessage=document.getElementById('loginMessage')
const emailInput=document.getElementById('email')
const passwordInput=document.getElementById('password')
const userEmail=document.getElementById('userEmail')
const accessChip=document.getElementById('accessChip')
const selectionStatus=document.getElementById('selectionStatus')
const selectionWrap=document.getElementById('selectionTableWrap')

const money=v=>v==null?'—':Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
const num=v=>v==null?'—':Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})
const pct=v=>v==null?'—':(Number(v)*100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'%'
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))

function showLogin(msg=''){
  loginView.classList.remove('hidden');appView.classList.add('hidden');loginMessage.textContent=msg
}
function showApp(){loginView.classList.add('hidden');appView.classList.remove('hidden')}

async function callPrivate(section){
  const {data:{session}}=await supabase.auth.getSession()
  if(!session?.access_token)throw new Error('not_authenticated')
  const r=await fetch(`${PRIVATE_API}?section=${encodeURIComponent(section)}`,{
    headers:{Authorization:`Bearer ${session.access_token}`,apikey:SUPABASE_KEY,Accept:'application/json'},
    cache:'no-store'
  })
  const j=await r.json().catch(()=>({}))
  if(!r.ok){const e=new Error(j.error||`http_${r.status}`);e.status=r.status;throw e}
  return j
}

async function loadPrivateArea(){
  try{
    const me=await callPrivate('me')
    userEmail.textContent=me.user?.email||''
    const role=me.access?.role||'subscriber'
    const plan=me.access?.plan||'assinante'
    accessChip.textContent=role==='admin'?'Administrador':`Acesso ativo • ${plan}`
    showApp()
    await loadSelection()
  }catch(e){
    if(e.status===403){await supabase.auth.signOut();showLogin('Sua conta existe, mas o acesso à área exclusiva não está ativo.')}else{await supabase.auth.signOut();showLogin('Não foi possível validar seu acesso. Tente novamente.')}
  }
}

async function loadSelection(){
  selectionStatus.classList.remove('hidden');selectionStatus.textContent='Carregando Seleção de Ações...';selectionWrap.classList.add('hidden')
  try{
    const j=await callPrivate('selection')
    renderSelection(Array.isArray(j.data)?j.data:[])
  }catch(e){selectionStatus.textContent=e.status===403?'Sua assinatura não está ativa.':'Não foi possível carregar os dados agora.'}
}

function renderSelection(rows){
  if(!rows.length){selectionStatus.textContent='Nenhuma empresa disponível na seleção atual.';return}
  const html=rows.map(r=>{
    const d=Number(r.discount_pct)
    const dcls=Number.isFinite(d)?(d>=0?'pos':'neg'):''
    return `<div class="private-row"><div>${r.position??'—'}</div><div class="ticker"><b>${esc(r.ticker)}</b><span>${esc(r.company_name||'')}</span></div><div>${money(r.current_price)}</div><div>${money(r.target_price)}</div><div class="discount ${dcls}">${pct(r.discount_pct)}</div><div>${money(r.graham_price)}</div><div>${num(r.pl)}</div><div>${num(r.pvp)}</div><div>${pct(r.roe)}</div><div><span class="quality">${r.quality_score==null?'—':Math.round(Number(r.quality_score))}</span></div></div>`
  }).join('')
  selectionWrap.innerHTML=`<div class="private-table"><div class="private-row private-head"><div>#</div><div>Empresa</div><div>Cotação</div><div>Preço-alvo</div><div>Desconto</div><div>Graham</div><div>P/L</div><div>P/VP</div><div>ROE</div><div>Qualidade</div></div>${html}</div>`
  selectionStatus.classList.add('hidden');selectionWrap.classList.remove('hidden')
}

loginForm.addEventListener('submit',async e=>{
  e.preventDefault();loginMessage.textContent='Entrando...'
  const {error}=await supabase.auth.signInWithPassword({email:emailInput.value.trim(),password:passwordInput.value})
  if(error){loginMessage.textContent='E-mail ou senha inválidos.';return}
  loginMessage.textContent='';await loadPrivateArea()
})

document.getElementById('firstAccessBtn').addEventListener('click',async()=>{
  const email=emailInput.value.trim()
  const password=passwordInput.value
  if(!email){loginMessage.textContent='Informe o e-mail autorizado para criar seu primeiro acesso.';return}
  if(!password || password.length<8){loginMessage.textContent='Crie uma senha com pelo menos 8 caracteres.';return}
  loginMessage.textContent='Criando seu acesso...'
  const {data,error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:`${location.origin}/invest/private`}})
  if(error){
    if(/already registered|already exists|user already/i.test(error.message||''))loginMessage.textContent='Esse e-mail já possui uma conta. Use Entrar ou Esqueci minha senha.'
    else loginMessage.textContent='Não foi possível criar o primeiro acesso agora.'
    return
  }
  if(data.session){loginMessage.textContent='';await loadPrivateArea();return}
  loginMessage.textContent='Conta criada. Verifique seu e-mail para confirmar o acesso e depois entre normalmente.'
})

document.getElementById('forgotBtn').addEventListener('click',async()=>{
  const email=emailInput.value.trim()
  if(!email){loginMessage.textContent='Informe seu e-mail para solicitar a redefinição da senha.';return}
  const redirectTo=`${location.origin}/invest/private`
  const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo})
  loginMessage.textContent=error?'Não foi possível solicitar a redefinição agora.':'Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.'
})

document.getElementById('logoutBtn').addEventListener('click',async()=>{await supabase.auth.signOut();showLogin()})

document.querySelectorAll('.nav-item').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));btn.classList.add('active')
  document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'))
  const id=btn.dataset.page+'Page';document.getElementById(id)?.classList.add('active')
  document.getElementById('pageTitle').textContent=btn.textContent.trim()
}))

const {data:{session}}=await supabase.auth.getSession()
if(session)await loadPrivateArea();else showLogin()
