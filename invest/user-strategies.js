import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.116.0/+esm'

const SUPABASE_URL='https://zbtijblvkzkeposvkfob.supabase.co'
const SUPABASE_KEY='sb_publishable_1hWexWrd_y-m36-DaXF5Hw_p33Ginm_'
const PRIVATE_API=`${SUPABASE_URL}/functions/v1/invest-private-data`
const supabase=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})
const $=id=>document.getElementById(id)
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))
const num=v=>v==null?'—':Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})
const pct=v=>v==null?'—':(Number(v)*100).toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})+'%'
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

const defs=[
  {key:'max_pl',id:'sPl',label:'P/L máximo',min:0,max:35,step:.5,value:15,suffix:'',mode:'number'},
  {key:'max_pvp',id:'sPvp',label:'P/VP máximo',min:0,max:13.5,step:.1,value:3,suffix:'',mode:'number'},
  {key:'min_roe',id:'sRoe',label:'ROE mínimo',min:0,max:100,step:.5,value:15,suffix:'%',mode:'percent'},
  {key:'min_roic',id:'sRoic',label:'ROIC mínimo',min:0,max:100,step:.5,value:10,suffix:'%',mode:'percent'},
  {key:'min_dy',id:'sDy',label:'DY mínimo',min:0,max:30,step:.25,value:5,suffix:'%',mode:'percent'},
  {key:'min_quality',id:'sQuality',label:'Qualidade mínima',min:0,max:100,step:1,value:70,suffix:'/100',mode:'number'},
  {key:'min_ebit_margin',id:'sEbit',label:'Margem EBIT mínima',min:-50,max:80,step:.5,value:10,suffix:'%',mode:'percent'},
  {key:'min_net_margin',id:'sNet',label:'Margem líquida mínima',min:-50,max:80,step:.5,value:8,suffix:'%',mode:'percent'},
  {key:'min_current_ratio',id:'sCurrent',label:'Liquidez corrente mínima',min:0,max:5,step:.1,value:1.2,suffix:'',mode:'number'},
  {key:'max_net_debt_to_equity',id:'sDebt',label:'Dívida líquida / PL máxima',min:-3,max:5,step:.1,value:1,suffix:'',mode:'number'},
  {key:'min_revenue_growth_5y',id:'sGrowth',label:'Crescimento da receita 5 anos mínimo',min:-50,max:100,step:.5,value:5,suffix:'%',mode:'percent'},
  {key:'max_price',id:'sPrice',label:'Preço máximo',min:0,max:300,step:1,value:30,suffix:'',mode:'money'},
  {key:'min_discount',id:'sTargetGap',label:'Ágio / deságio vs Preço-alvo AXIVA',min:-100,max:100,step:1,value:0,suffix:'%',mode:'percent',help:'Valor positivo representa o percentual de desconto desejado em relação ao Preço-alvo AXIVA.'},
  {key:'min_graham_discount',id:'sGrahamGap',label:'Ágio / deságio vs Preço Graham',min:-100,max:100,step:1,value:0,suffix:'%',mode:'percent',help:'Valor positivo representa o percentual de desconto desejado em relação ao Preço Graham.'}
]

function fmtDef(d,v){
  const x=Number(v)
  if(d.mode==='money')return x.toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0})
  return x.toLocaleString('pt-BR',{minimumFractionDigits:d.step<1?1:0,maximumFractionDigits:d.step<1?1:0})+(d.suffix||'')
}
function criterionCard(d){
  return `<div class="strategy-criterion" data-key="${d.key}">
    <div class="strategy-criterion-head">
      <label class="strategy-check"><input type="checkbox" id="${d.id}On"><span>${d.label}</span></label>
      <output id="${d.id}Out">${fmtDef(d,d.value)}</output>
    </div>
    <input id="${d.id}" type="range" min="${d.min}" max="${d.max}" step="${d.step}" value="${d.value}" disabled>
    ${d.help?'<small>'+d.help+'</small>':''}
  </div>`
}
function setup(){
  const host=$('strategySliders');if(!host)return
  host.classList.add('strategy-criteria-grid')
  host.innerHTML=defs.map(criterionCard).join('')
  defs.forEach(d=>{
    const check=$(d.id+'On'),range=$(d.id),out=$(d.id+'Out')
    check?.addEventListener('change',()=>{
      range.disabled=!check.checked
      range.closest('.strategy-criterion')?.classList.toggle('enabled',check.checked)
    })
    range?.addEventListener('input',()=>{out.value=fmtDef(d,range.value)})
  })
}
function reset(){
  $('strategyName').value=''
  defs.forEach(d=>{
    const check=$(d.id+'On'),range=$(d.id),out=$(d.id+'Out')
    if(check)check.checked=false
    if(range){range.value=d.value;range.disabled=true;range.closest('.strategy-criterion')?.classList.remove('enabled')}
    if(out)out.value=fmtDef(d,d.value)
  })
  $('strategyMessage').textContent=''
}
function criterionValue(d){
  const check=$(d.id+'On'),range=$(d.id)
  if(!check?.checked||!range)return null
  const x=Number(range.value)
  return d.mode==='percent'?x/100:x
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
  if(s.min_ebit_margin!=null)parts.push(`Margem EBIT ≥ ${pct(s.min_ebit_margin)}`)
  if(s.min_net_margin!=null)parts.push(`Margem líquida ≥ ${pct(s.min_net_margin)}`)
  if(s.min_current_ratio!=null)parts.push(`Liquidez corrente ≥ ${num(s.min_current_ratio)}`)
  if(s.max_net_debt_to_equity!=null)parts.push(`Dív./PL ≤ ${num(s.max_net_debt_to_equity)}`)
  if(s.min_revenue_growth_5y!=null)parts.push(`Cresc. receita 5a ≥ ${pct(s.min_revenue_growth_5y)}`)
  if(s.max_price!=null)parts.push(`Preço ≤ ${money(s.max_price)}`)
  if(s.min_discount!=null)parts.push(`Preço-alvo AXIVA: diferença ≥ ${pct(s.min_discount)}`)
  if(s.min_graham_discount!=null)parts.push(`Graham: diferença ≥ ${pct(s.min_graham_discount)}`)
  return parts.length?parts.join(' • '):'Critérios salvos.'
}
function render(items){
  const status=$('userStrategiesStatus'),wrap=$('userStrategiesContent')
  if(!Array.isArray(items)||!items.length){status.classList.remove('hidden');status.textContent='Você ainda não criou nenhuma estratégia.';wrap.innerHTML='';return}
  status.classList.add('hidden')
  wrap.innerHTML=`<div class="strategy-grid user-strategy-grid">${items.map(s=>{
    const matches=Array.isArray(s.matches)?s.matches:[]
    const rows=matches.slice(0,40).map(r=>`<div class="strategy-company"><b>${esc(r.ticker)}</b><span>${esc(r.company_name||'')}</span><em>${num(r.pl)} P/L</em><em>${pct(r.roe)} ROE</em><em>${pct(r.dividend_yield)} DY</em></div>`).join('')
    return `<article class="strategy-card user-strategy-card"><div class="strategy-card-head"><div><span>Minha estratégia</span><h3>${esc(s.name)}</h3></div><strong>${s.match_count??matches.length} empresas</strong></div><p class="criteria">${criteria(s)}</p><div class="strategy-companies">${rows||'<div class="empty-mini">Nenhuma empresa atende aos critérios nesta atualização.</div>'}</div><div class="strategy-card-actions"><button class="danger delete-user-strategy" data-id="${esc(s.id)}" data-name="${esc(s.name)}">Excluir estratégia</button></div></article>`
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
  const body={action:'create',name}
  defs.forEach(d=>{body[d.key]=criterionValue(d)})
  if(defs.every(d=>body[d.key]==null)){msg.textContent='Selecione pelo menos um parâmetro para a estratégia.';return}
  msg.textContent='Salvando estratégia...'
  try{await api({method:'POST',body});reset();msg.textContent='Estratégia salva com sucesso.';await load()}
  catch(e){msg.textContent=e.message==='criteria_required'?'Selecione pelo menos um parâmetro.':'Não foi possível salvar a estratégia.'}
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
