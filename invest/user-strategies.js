import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.116.0/+esm'

const SUPABASE_URL='https://zbtijblvkzkeposvkfob.supabase.co'
const SUPABASE_KEY='sb_publishable_1hWexWrd_y-m36-DaXF5Hw_p33Ginm_'
const PRIVATE_API=`${SUPABASE_URL}/functions/v1/invest-private-data`
const supabase=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})
const $=id=>document.getElementById(id)
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))
const num=v=>v==null?'—':Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})
const pct=v=>v==null?'—':(Number(v)*100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'%'
const money=v=>v==null?'—':Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})

async function api(options={}){
  const {data:{session}}=await supabase.auth.getSession()
  if(!session?.access_token) throw new Error('not_authenticated')
  const r=await fetch(`${PRIVATE_API}?section=user-strategies`,{
    method:options.method||'GET',
    headers:{Authorization:`Bearer ${session.access_token}`,apikey:SUPABASE_KEY,'Content-Type':'application/json',Accept:'application/json'},
    body:options.body?JSON.stringify(options.body):undefined,
    cache:'no-store'
  })
  const j=await r.json().catch(()=>({}))
  if(!r.ok) throw Object.assign(new Error(j.error||`http_${r.status}`),{status:r.status})
  return j
}

function fmt(v,suffix=''){return Number(v).toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})+suffix}
function slider(id,label,min,max,step,value,suffix=''){
  return `<div class="p-slider"><div><label for="${id}">${label}</label><output id="${id}Out">${fmt(value,suffix)}</output></div><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-suffix="${suffix}"></div>`
}
function setup(){
  const host=$('strategySliders');if(!host)return
  host.innerHTML=slider('sPl','P/L máximo',0,35,.5,15)+slider('sPvp','P/VP máximo',0,13.5,.1,3)+slider('sRoe','ROE mínimo',0,75,.5,10,'%')+slider('sRoic','ROIC mínimo',0,80,.5,10,'%')+slider('sDy','DY mínimo',0,23,.25,0,'%')
  host.querySelectorAll('input[type=range]').forEach(el=>el.addEventListener('input',()=>{$(el.id+'Out').value=fmt(el.value,el.dataset.suffix||'')}))
}
function reset(){
  $('strategyName').value=''
  const vals={sPl:15,sPvp:3,sRoe:10,sRoic:10,sDy:0}
  Object.entries(vals).forEach(([id,v])=>{const el=$(id);if(el){el.value=v;el.dispatchEvent(new Event('input'))}})
  $('strategyMessage').textContent=''
}
function criteria(s){
  const parts=[]
  if(s.sector)parts.push(`Setor: ${s.sector}`)
  if(s.subsector)parts.push(`Subsetor: ${s.subsector}`)
  if(s.segment)parts.push(`Segmento: ${s.segment}`)
  if(s.max_pl!=null)parts.push(`P/L ≤ ${num(s.max_pl)}`)
  if(s.max_pvp!=null)parts.push(`P/VP ≤ ${num(s.max_pvp)}`)
  if(s.min_roe!=null)parts.push(`ROE ≥ ${pct(s.min_roe)}`)
  if(s.min_roic!=null)parts.push(`ROIC ≥ ${pct(s.min_roic)}`)
  if(s.min_dy!=null)parts.push(`DY ≥ ${pct(s.min_dy)}`)
  if(s.min_quality!=null)parts.push(`Qualidade ≥ ${num(s.min_quality)}`)
  if(s.min_discount!=null)parts.push(`Desconto ≥ ${pct(s.min_discount)}`)
  if(s.min_revenue_growth_5y!=null)parts.push(`Cresc. receita 5a ≥ ${pct(s.min_revenue_growth_5y)}`)
  if(s.max_net_debt_to_equity!=null)parts.push(`Dív./PL ≤ ${num(s.max_net_debt_to_equity)}`)
  if(s.max_price!=null)parts.push(`Preço ≤ ${money(s.max_price)}`)
  return parts.length?parts.join(' • '):'Critérios salvos.'
}
function render(items){
  const status=$('userStrategiesStatus'),wrap=$('userStrategiesContent')
  if(!Array.isArray(items)||!items.length){status.textContent='Você ainda não criou nenhuma estratégia.';wrap.innerHTML='';return}
  status.classList.add('hidden')
  wrap.innerHTML=`<div class="strategy-grid user-strategy-grid">${items.map(s=>{
    const matches=Array.isArray(s.matches)?s.matches:[]
    const rows=matches.slice(0,40).map(r=>`<div class="strategy-company"><b>${esc(r.ticker)}</b><span>${esc(r.company_name||'')}</span><em>${num(r.pl)} P/L</em><em>${pct(r.roe)} ROE</em><em>${pct(r.dividend_yield)} DY</em></div>`).join('')
    return `<article class="strategy-card user-strategy-card"><div class="strategy-card-head"><div><span>Minha estratégia</span><h3>${esc(s.name)}</h3></div><strong>${matches.length} empresas</strong></div><p class="criteria">${criteria(s)}</p><div class="strategy-companies">${rows||'<div class="empty-mini">Nenhuma empresa atende aos critérios nesta atualização.</div>'}</div><div class="strategy-card-actions"><button class="danger delete-user-strategy" data-id="${esc(s.id)}" data-name="${esc(s.name)}">Excluir estratégia</button></div></article>`
  }).join('')}</div>`
  wrap.querySelectorAll('.delete-user-strategy').forEach(btn=>btn.addEventListener('click',()=>remove(btn.dataset.id,btn.dataset.name)))
}
async function load(){
  const status=$('userStrategiesStatus');if(!status)return
  status.classList.remove('hidden');status.textContent='Carregando suas estratégias...'
  try{const j=await api();render(j.data||[])}catch(e){status.textContent=e.status===403?'Seu acesso à área exclusiva não está ativo.':'Não foi possível carregar suas estratégias.'}
}
async function save(e){
  e.preventDefault()
  const msg=$('strategyMessage'),name=$('strategyName').value.trim()
  if(name.length<2){msg.textContent='Informe um nome para a estratégia.';return}
  const body={action:'create',name,max_pl:Number($('sPl').value),max_pvp:Number($('sPvp').value),min_roe:Number($('sRoe').value)/100,min_roic:Number($('sRoic').value)/100,min_dy:Number($('sDy').value)/100}
  msg.textContent='Salvando estratégia...'
  try{await api({method:'POST',body});msg.textContent='Estratégia salva com sucesso.';reset();msg.textContent='Estratégia salva com sucesso.';await load()}
  catch(e){msg.textContent=e.message==='criteria_required'?'Defina ao menos um critério.':'Não foi possível salvar a estratégia.'}
}
async function remove(id,name){
  if(!id||!confirm(`Excluir a estratégia "${name}"?`))return
  const msg=$('strategyMessage');msg.textContent='Excluindo estratégia...'
  try{await api({method:'POST',body:{action:'delete',id}});msg.textContent='Estratégia excluída.';await load()}
  catch(e){msg.textContent='Não foi possível excluir a estratégia.'}
}

setup()
$('userStrategyForm')?.addEventListener('submit',save)
$('strategyResetBtn')?.addEventListener('click',reset)
document.querySelector('[data-page="strategies"]')?.addEventListener('click',load)
const {data:{session}}=await supabase.auth.getSession()
if(session)await load()
