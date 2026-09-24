const $=id=>document.getElementById(id)
const n=v=>{if(v===null||v===undefined||v==='')return null;const x=Number(v);return Number.isFinite(x)?x:null}
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))
const money=v=>n(v)==null?'—':Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
const num=(v,d=2)=>n(v)==null?'—':Number(v).toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d})
const pct=v=>n(v)==null?'—':(Number(v)*100).toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})+'%'
const fraction=v=>{const x=n(v);return x==null?null:x/100}
const signPct=v=>n(v)==null?'—':(Number(v)*100).toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1,signDisplay:'always'})+' p.p.'
const median=values=>{const a=values.map(n).filter(v=>v!=null).sort((a,b)=>a-b);if(!a.length)return null;const m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2}
const today=()=>new Date().toISOString().slice(0,10)

let rows=[]
let rowMap=new Map()
let discoveryRows=[]
let discoveryPage=1
const DISCOVERY_PAGE_SIZE=20
let compareTickers=[]
let watchData=[]
let alertData=[]
let currentCompany=null
let defaultsInitialized=false

function api(section,options={}){
  if(typeof window.axivaPrivateApi!=='function')return Promise.reject(new Error('api_not_ready'))
  return window.axivaPrivateApi(section,options)
}
function toast(message){
  let el=document.querySelector('.toast')
  if(!el){el=document.createElement('div');el.className='toast';document.body.appendChild(el)}
  el.textContent=message;clearTimeout(el._t);el._t=setTimeout(()=>el.remove(),2600)
}
function gotoPage(page){
  const btn=document.querySelector('.nav-item[data-page="'+page+'"]')
  if(btn)btn.click()
}
document.querySelectorAll('[data-goto]').forEach(b=>b.addEventListener('click',()=>gotoPage(b.dataset.goto)))

function resolveRow(value){
  const q=String(value||'').trim().toUpperCase()
  if(!q)return null
  if(rowMap.has(q))return rowMap.get(q)
  return rows.find(r=>String(r.ticker||'').toUpperCase().includes(q)||String(r.company_name||'').toUpperCase().includes(q))||null
}
function fillUniverseUI(){
  const dl=$('companyTickerList')
  if(dl)dl.innerHTML=rows.map(r=>'<option value="'+esc(r.ticker)+'">'+esc(r.company_name||'')+'</option>').join('')
  const sectors=[...new Set(rows.map(r=>r.sector).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'pt-BR'))
  const sel=$('advSector')
  if(sel)sel.innerHTML='<option value="">Todos os setores</option>'+sectors.map(s=>'<option value="'+esc(s)+'">'+esc(s)+'</option>').join('')
}
function renderOverview(){
  const sectors=new Set(rows.map(r=>r.sector).filter(Boolean)).size
  const valuation=rows.filter(r=>n(r.target_price)!=null).length
  const groups=rows.filter(r=>r.comparable_group).length
  const el=$('overviewStats')
  if(!el)return
  el.innerHTML=[
    ['Universo',rows.length,'ativos negociáveis na base atual'],
    ['Valuation completo',valuation,'com preço-alvo/histórico disponível'],
    ['Setores',sectors,'grupos econômicos na base'],
    ['Comparação relativa',groups,'ativos com grupo comparável']
  ].map(([a,b,c])=>'<div class="stat-mini"><span>'+a+'</span><strong>'+b+'</strong><small>'+c+'</small></div>').join('')
}
function setRange(id,value){
  const el=$(id);if(!el)return
  el.value=value
  el.dispatchEvent(new Event('input'))
}
function suiteDefaults(){
  setRange('pPl',35);setRange('pPvp',13.5);setRange('pRoe',0);setRange('pRoic',0);setRange('pDy',0)
  ;['privateTicker','advSector','advQuality','advDiscount','advGrowth','advDebt','advPrice','advEbit','advNet','advCurrentRatio','naturalQuery'].forEach(id=>{if($(id))$(id).value=''})
  document.querySelectorAll('.chip-btn').forEach(x=>x.classList.remove('active'))
}
function filterState(){
  return {
    ticker:String($('privateTicker')?.value||'').trim().toUpperCase(),
    sector:$('advSector')?.value||'',
    max_pl:n($('pPl')?.value),
    max_pvp:n($('pPvp')?.value),
    min_roe:fraction($('pRoe')?.value),
    min_roic:fraction($('pRoic')?.value),
    min_dy:fraction($('pDy')?.value),
    min_quality:n($('advQuality')?.value),
    min_discount:fraction($('advDiscount')?.value),
    min_revenue_growth_5y:fraction($('advGrowth')?.value),
    max_net_debt_to_equity:n($('advDebt')?.value),
    max_price:n($('advPrice')?.value),
    min_ebit_margin:fraction($('advEbit')?.value),
    min_net_margin:fraction($('advNet')?.value),
    min_current_ratio:n($('advCurrentRatio')?.value)
  }
}
function isActiveValue(key,v){
  if(v==null||v==='')return false
  const defaults={max_pl:35,max_pvp:13.5,min_roe:0,min_roic:0,min_dy:0}
  return key in defaults?Math.abs(Number(v)-defaults[key])>.000001:true
}
function rowMatches(r,c){
  if(c.ticker&&!String(r.ticker||'').toUpperCase().includes(c.ticker)&&!String(r.company_name||'').toUpperCase().includes(c.ticker))return false
  if(c.sector&&r.sector!==c.sector)return false
  const tests=[
    ['max_pl','pl','max'],['max_pvp','pvp','max'],['min_roe','roe','min'],['min_roic','roic','min'],['min_dy','dividend_yield','min'],
    ['min_quality','quality_score','min'],['min_discount','discount_pct','min'],['min_revenue_growth_5y','revenue_growth_5y','min'],
    ['max_net_debt_to_equity','net_debt_to_equity','max'],['max_price','current_price','max'],['min_ebit_margin','ebit_margin','min'],
    ['min_net_margin','net_margin','min'],['min_current_ratio','current_ratio','min']
  ]
  for(const [ck,rk,dir] of tests){
    if(!isActiveValue(ck,c[ck]))continue
    const rv=n(r[rk]);if(rv==null)return false
    if(dir==='min'&&rv<c[ck])return false
    if(dir==='max'&&rv>c[ck])return false
  }
  return true
}
function criteriaPills(c){
  const labels=[]
  if(c.ticker)labels.push(['Empresa',c.ticker])
  if(c.sector)labels.push(['Setor',c.sector])
  if(isActiveValue('max_pl',c.max_pl))labels.push(['P/L','≤ '+num(c.max_pl,1)])
  if(isActiveValue('max_pvp',c.max_pvp))labels.push(['P/VP','≤ '+num(c.max_pvp,1)])
  if(isActiveValue('min_roe',c.min_roe))labels.push(['ROE','≥ '+pct(c.min_roe)])
  if(isActiveValue('min_roic',c.min_roic))labels.push(['ROIC','≥ '+pct(c.min_roic)])
  if(isActiveValue('min_dy',c.min_dy))labels.push(['DY','≥ '+pct(c.min_dy)])
  if(c.min_quality!=null)labels.push(['Qualidade','≥ '+num(c.min_quality,0)])
  if(c.min_discount!=null)labels.push(['Desconto','≥ '+pct(c.min_discount)])
  if(c.min_revenue_growth_5y!=null)labels.push(['Cresc. 5a','≥ '+pct(c.min_revenue_growth_5y)])
  if(c.max_net_debt_to_equity!=null)labels.push(['Dív./PL','≤ '+num(c.max_net_debt_to_equity,1)])
  if(c.max_price!=null)labels.push(['Preço','≤ '+money(c.max_price)])
  if(c.min_ebit_margin!=null)labels.push(['Margem EBIT','≥ '+pct(c.min_ebit_margin)])
  if(c.min_net_margin!=null)labels.push(['Margem líquida','≥ '+pct(c.min_net_margin)])
  if(c.min_current_ratio!=null)labels.push(['Liq. corrente','≥ '+num(c.min_current_ratio,1)])
  return labels
}
function whyText(r,c){
  const a=[]
  if(isActiveValue('max_pl',c.max_pl))a.push('P/L '+num(r.pl)+' ≤ '+num(c.max_pl,1))
  if(isActiveValue('max_pvp',c.max_pvp))a.push('P/VP '+num(r.pvp)+' ≤ '+num(c.max_pvp,1))
  if(isActiveValue('min_roe',c.min_roe))a.push('ROE '+pct(r.roe)+' ≥ '+pct(c.min_roe))
  if(isActiveValue('min_roic',c.min_roic))a.push('ROIC '+pct(r.roic)+' ≥ '+pct(c.min_roic))
  if(isActiveValue('min_dy',c.min_dy))a.push('DY '+pct(r.dividend_yield)+' ≥ '+pct(c.min_dy))
  if(c.min_quality!=null)a.push('Qualidade '+num(r.quality_score,0)+' ≥ '+num(c.min_quality,0))
  if(c.min_discount!=null)a.push('Desconto '+pct(r.discount_pct)+' ≥ '+pct(c.min_discount))
  if(c.sector)a.push('Setor: '+c.sector)
  return a.length?a.join(' • '):'Compatível com os filtros atualmente abertos.'
}
function discoveryComplete(r){
  return [
    r.current_price,r.target_price,r.discount_pct,r.graham_price,
    r.pl,r.pvp,r.roe,r.roic,r.dividend_yield
  ].every(v=>n(v)!=null)
}
function sortDiscovery(list){
  return [...list].sort((a,b)=>{
    const ac=discoveryComplete(a)?1:0,bc=discoveryComplete(b)?1:0
    if(ac!==bc)return bc-ac
    return String(a.ticker||'').localeCompare(String(b.ticker||''),'pt-BR')
  })
}
function discoveryPager(totalPages,current){
  if(totalPages<=1)return ''
  const pages=[]
  const add=n=>{if(n>=1&&n<=totalPages&&!pages.includes(n))pages.push(n)}
  add(1);add(2);add(current-1);add(current);add(current+1);add(totalPages-1);add(totalPages)
  pages.sort((a,b)=>a-b)
  let html='<div class="discovery-pager" aria-label="Paginação das empresas">'
  html+='<button type="button" data-page="'+Math.max(1,current-1)+'" '+(current===1?'disabled':'')+'>‹ Anterior</button>'
  let prev=0
  for(const p of pages){
    if(prev&&p-prev>1)html+='<span class="pager-ellipsis">…</span>'
    html+='<button type="button" data-page="'+p+'" class="'+(p===current?'active':'')+'">Pag '+p+'</button>'
    prev=p
  }
  html+='<button type="button" data-page="'+Math.min(totalPages,current+1)+'" '+(current===totalPages?'disabled':'')+'>Próxima ›</button></div>'
  return html
}
function renderDiscovery(list,c,page=discoveryPage){
  const ordered=sortDiscovery(list)
  discoveryRows=ordered
  const status=$('analysisStatus'),wrap=$('analysisResults'),pills=$('activeCriteria'),explain=$('discoveryExplain')
  if(pills)pills.innerHTML=criteriaPills(c).map(([a,b])=>'<span class="criterion-pill"><strong>'+esc(a)+':</strong> '+esc(b)+'</span>').join('')||'<span class="criterion-pill">Sem filtros restritivos</span>'
  if(explain)explain.innerHTML=''
  if(!ordered.length){if(status)status.textContent='Nenhuma empresa encontrada com estes critérios.';if(wrap)wrap.classList.add('hidden');return}
  const totalPages=Math.max(1,Math.ceil(ordered.length/DISCOVERY_PAGE_SIZE))
  discoveryPage=Math.min(Math.max(1,page),totalPages)
  const startIndex=(discoveryPage-1)*DISCOVERY_PAGE_SIZE
  const shown=ordered.slice(startIndex,startIndex+DISCOVERY_PAGE_SIZE)
  const body=shown.map(r=>'<div class="analysis-row suite-result-row" data-ticker="'+esc(r.ticker)+'" tabindex="0"><div class="ticker"><b>'+esc(r.ticker)+'</b><span>'+esc(r.company_name||'')+'</span></div><div>'+money(r.current_price)+'</div><div>'+money(r.target_price)+'</div><div class="discount '+(n(r.discount_pct)>=0?'pos':'neg')+'">'+pct(r.discount_pct)+'</div><div>'+money(r.graham_price)+'</div><div>'+num(r.pl)+'</div><div>'+num(r.pvp)+'</div><div>'+pct(r.roe)+'</div><div>'+pct(r.roic)+'</div><div>'+pct(r.dividend_yield)+'</div></div>').join('')
  wrap.innerHTML='<div class="analysis-table"><div class="analysis-row private-head"><div>Empresa</div><div>Cotação</div><div>Preço-alvo</div><div>Desconto</div><div>Graham</div><div>P/L</div><div>P/VP</div><div>ROE</div><div>ROIC</div><div>DY</div></div>'+body+'</div>'+discoveryPager(totalPages,discoveryPage)
  wrap.classList.remove('hidden')
  const first=startIndex+1,last=startIndex+shown.length
  status.textContent=ordered.length+' empresa(s) encontrada(s) • exibindo '+first+'–'+last+' • página '+discoveryPage+' de '+totalPages+'. Empresas com dados completos aparecem primeiro.'
  wrap.querySelectorAll('.suite-result-row').forEach(el=>{
    const open=()=>openCompany(el.dataset.ticker)
    el.addEventListener('click',open);el.addEventListener('keydown',e=>{if(e.key==='Enter')open()})
  })
  wrap.querySelectorAll('.discovery-pager [data-page]').forEach(btn=>btn.addEventListener('click',()=>{
    const p=Number(btn.dataset.page);if(!Number.isFinite(p)||p===discoveryPage)return
    renderDiscovery(discoveryRows,c,p)
    wrap.scrollIntoView({behavior:'smooth',block:'start'})
  }))
}
function applyFilters(){
  const c=filterState()
  discoveryPage=1
  renderDiscovery(rows.filter(r=>rowMatches(r,c)),c,1)
}
function resetFilters(){
  suiteDefaults();discoveryPage=1;renderDiscovery(rows,filterState(),1);$('naturalFeedback').textContent='Filtros limpos. O universo completo está disponível para nova busca.'
}
window.axivaSuiteApplyFilters=applyFilters
window.axivaSuiteResetFilters=resetFilters

const presets={
  valor:{pPl:12,pPvp:2,pRoe:12,pRoic:0,pDy:0,quality:'',discount:'',growth:'',debt:'',price:'',ebit:'',net:'',ratio:''},
  dividendos:{pPl:20,pPvp:4,pRoe:12,pRoic:0,pDy:6,quality:'',discount:'',growth:'',debt:'',price:'',ebit:'',net:'',ratio:''},
  qualidade:{pPl:35,pPvp:13.5,pRoe:0,pRoic:0,pDy:0,quality:70,discount:'',growth:'',debt:'',price:'',ebit:'',net:'',ratio:''},
  rentabilidade:{pPl:35,pPvp:13.5,pRoe:18,pRoic:15,pDy:0,quality:'',discount:'',growth:'',debt:'',price:'',ebit:'',net:'',ratio:''},
  desconto:{pPl:35,pPvp:13.5,pRoe:0,pRoic:0,pDy:0,quality:'',discount:15,growth:'',debt:'',price:'',ebit:'',net:'',ratio:''}
}
function applyPreset(name){
  suiteDefaults();const p=presets[name];if(!p)return
  setRange('pPl',p.pPl);setRange('pPvp',p.pPvp);setRange('pRoe',p.pRoe);setRange('pRoic',p.pRoic);setRange('pDy',p.pDy)
  $('advQuality').value=p.quality;$('advDiscount').value=p.discount;$('advGrowth').value=p.growth;$('advDebt').value=p.debt;$('advPrice').value=p.price;$('advEbit').value=p.ebit;$('advNet').value=p.net;$('advCurrentRatio').value=p.ratio
  document.querySelectorAll('.chip-btn').forEach(x=>x.classList.toggle('active',x.dataset.preset===name))
  applyFilters()
}
document.querySelectorAll('.chip-btn').forEach(b=>b.addEventListener('click',()=>applyPreset(b.dataset.preset)))

function parseNatural(){
  const raw=String($('naturalQuery').value||'').trim()
  if(!raw){$('naturalFeedback').textContent='Digite os critérios que procura.';return}
  suiteDefaults()
  const q=raw.toLowerCase().replace(/,/g,'.')
  const parsed=[]
  function metric(pattern,id,kind){
    const re=new RegExp('(?:'+pattern+')[^0-9]{0,25}(?:acima\\s+de|maior\\s+que|mínim[oa]?|>=|>)?\\s*([0-9]+(?:\\.[0-9]+)?)\\s*%?','i')
    const m=q.match(re);if(!m)return
    const val=Number(m[1]);if(!Number.isFinite(val))return
    if(id.startsWith('p'))setRange(id,val);else $(id).value=val
    parsed.push(kind+' '+val)
  }
  metric('p\\s*\\/\\s*l|\\bpl\\b','pPl','P/L')
  metric('p\\s*\\/\\s*vp|\\bpvp\\b','pPvp','P/VP')
  metric('\\broe\\b','pRoe','ROE')
  metric('\\broic\\b','pRoic','ROIC')
  metric('\\bdy\\b|dividend\\s*yield','pDy','DY')
  metric('qualidade|score','advQuality','Qualidade')
  metric('desconto','advDiscount','Desconto')
  const price=q.match(/pre[cç]o[^0-9]{0,25}(?:abaixo\s+de|menor\s+que|máximo|<=|<)\s*(?:r\$\s*)?([0-9]+(?:\.[0-9]+)?)/i)
  if(price){$('advPrice').value=price[1];parsed.push('Preço '+price[1])}
  const sector=[...new Set(rows.map(r=>r.sector).filter(Boolean))].find(s=>q.includes(String(s).toLowerCase()))
  if(sector){$('advSector').value=sector;parsed.push('Setor '+sector)}
  if(!parsed.length){$('naturalFeedback').textContent='Não consegui transformar a frase em critérios. Use termos como P/L, P/VP, ROE, ROIC, DY, qualidade, desconto ou preço.';return}
  $('naturalFeedback').textContent='Critérios identificados: '+parsed.join(' • ')+'. Confira os filtros abaixo.'
  applyFilters()
}
$('naturalApplyBtn')?.addEventListener('click',parseNatural)
$('naturalQuery')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();parseNatural()}})

function csvDownload(filename,headers,data){
  const quote=v=>'"'+String(v??'').replace(/"/g,'""')+'"'
  const content=[headers.map(quote).join(';'),...data.map(row=>row.map(quote).join(';'))].join('\n')
  const blob=new Blob(['\ufeff'+content],{type:'text/csv;charset=utf-8'})
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)
}
$('exportDiscoveryBtn')?.addEventListener('click',()=>{
  if(!discoveryRows.length){toast('Não há resultados para exportar.');return}
  csvDownload('axiva-descoberta-'+today()+'.csv',['Ticker','Empresa','Setor','Preço','Preço-alvo','Desconto','Qualidade','P/L','P/VP','DY','ROE','ROIC'],discoveryRows.map(r=>[r.ticker,r.company_name,r.sector,r.current_price,r.target_price,r.discount_pct,r.quality_score,r.pl,r.pvp,r.dividend_yield,r.roe,r.roic]))
})

$('saveCurrentStrategyBtn')?.addEventListener('click',()=>{
  $('strategyQuickSave')?.classList.remove('hidden')
  $('strategyQuickName')?.focus()
})
$('strategyQuickCancel')?.addEventListener('click',()=>{$('strategyQuickSave')?.classList.add('hidden');if($('strategyQuickName'))$('strategyQuickName').value=''})
$('strategyQuickConfirm')?.addEventListener('click',async()=>{
  const name=String($('strategyQuickName')?.value||'').trim()
  if(name.length<2){toast('Informe um nome para a estratégia.');return}
  const fs=filterState()
  const body={action:'create',name,sector:fs.sector||null,max_pl:isActiveValue('max_pl',fs.max_pl)?fs.max_pl:null,max_pvp:isActiveValue('max_pvp',fs.max_pvp)?fs.max_pvp:null,min_roe:isActiveValue('min_roe',fs.min_roe)?fs.min_roe:null,min_roic:isActiveValue('min_roic',fs.min_roic)?fs.min_roic:null,min_dy:isActiveValue('min_dy',fs.min_dy)?fs.min_dy:null,min_quality:fs.min_quality,min_discount:fs.min_discount,min_revenue_growth_5y:fs.min_revenue_growth_5y,max_net_debt_to_equity:fs.max_net_debt_to_equity,max_price:fs.max_price,min_ebit_margin:fs.min_ebit_margin,min_net_margin:fs.min_net_margin,min_current_ratio:fs.min_current_ratio}
  try{
    await api('user-strategies',{method:'POST',body})
    toast('Estratégia salva.')
    $('strategyQuickSave')?.classList.add('hidden')
    if($('strategyQuickName'))$('strategyQuickName').value=''
  }catch(e){toast('Não foi possível salvar esta estratégia agora.')}
})

function mapSvg(){
  const data=rows.filter(r=>n(r.quality_score)!=null&&n(r.discount_pct)!=null)
  const shell=$('qualityPriceMap');if(!shell)return
  if(!data.length){shell.innerHTML='<div class="status">O mapa ficará disponível quando houver valuation calculado.</div>';return}
  const xs=data.map(r=>n(r.discount_pct)*100),xmin=Math.min(-20,...xs),xmax=Math.max(30,...xs)
  const W=900,H=300,pad={l:54,r:24,t:20,b:40}
  const sx=x=>pad.l+(x-xmin)/(xmax-xmin)*(W-pad.l-pad.r)
  const sy=y=>pad.t+(100-y)/100*(H-pad.t-pad.b)
  let grid=''
  for(let y=0;y<=100;y+=25)grid+='<line class="scatter-grid" x1="'+pad.l+'" y1="'+sy(y)+'" x2="'+(W-pad.r)+'" y2="'+sy(y)+'"/><text class="scatter-label" x="8" y="'+(sy(y)+3)+'">'+y+'</text>'
  const xTicks=[xmin,0,xmax].filter((v,i,a)=>a.indexOf(v)===i)
  xTicks.forEach(x=>grid+='<line class="scatter-grid" x1="'+sx(x)+'" y1="'+pad.t+'" x2="'+sx(x)+'" y2="'+(H-pad.b)+'"/><text class="scatter-label" text-anchor="middle" x="'+sx(x)+'" y="'+(H-15)+'">'+num(x,0)+'%</text>')
  const pts=data.map(r=>'<circle class="scatter-point" data-map-ticker="'+esc(r.ticker)+'" cx="'+sx(n(r.discount_pct)*100)+'" cy="'+sy(n(r.quality_score))+'" r="5"><title>'+esc(r.ticker)+' • Qualidade '+num(r.quality_score,0)+' • Desconto '+pct(r.discount_pct)+'</title></circle>').join('')
  shell.innerHTML='<svg class="scatter-svg" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Mapa de qualidade por desconto">'+grid+'<line class="scatter-axis" x1="'+pad.l+'" y1="'+(H-pad.b)+'" x2="'+(W-pad.r)+'" y2="'+(H-pad.b)+'"/><line class="scatter-axis" x1="'+pad.l+'" y1="'+pad.t+'" x2="'+pad.l+'" y2="'+(H-pad.b)+'"/>'+pts+'<text class="scatter-label" text-anchor="middle" x="'+(W/2)+'" y="'+(H-2)+'">Desconto / ágio em relação ao preço-alvo</text></svg><div class="scatter-tip">'+data.length+' ativos com valuation completo. Passe o cursor para identificar e clique para abrir o Raio-X.</div>'
  shell.querySelectorAll('[data-map-ticker]').forEach(p=>p.addEventListener('click',()=>openCompany(p.dataset.mapTicker)))
}

function relativeText(value,med,kind){
  const v=n(value),m=n(med);if(v==null||m==null)return ['—','relative-neutral']
  if(kind==='return'){
    const pp=(v-m)*100,direction=pp>=0?'acima':'abaixo'
    const cls=Math.abs(pp)<.5?'relative-neutral':pp>0?'relative-good':'relative-alert'
    return [Math.abs(pp).toLocaleString('pt-BR',{maximumFractionDigits:1})+' p.p. '+direction,cls]
  }
  if(m===0)return ['—','relative-neutral']
  const d=(v-m)/Math.abs(m),direction=d>=0?'acima':'abaixo'
  const cls=Math.abs(d)<.05?'relative-neutral':d<0?'relative-good':'relative-alert'
  return [Math.abs(d*100).toLocaleString('pt-BR',{maximumFractionDigits:1})+'% '+direction,cls]
}
function qualityBreakdown(r){
  const cls=n(r.methodology_class),score=n(r.quality_score)
  if(cls==null||score==null)return '<div class="limited-data">A nota de Qualidade ainda não está disponível para este ativo porque o valuation/histórico necessário não foi concluído.</div>'
  const lines=[]
  const addGate=(label,pass,detail)=>lines.push('<div class="quality-line '+(pass?'pass':'fail')+'"><span>'+esc(label)+' <small>'+esc(detail)+'</small></span><b>'+(pass?'Atende':'Não atende')+'</b></div>')
  const pl=n(r.pl),eq=n(r.equity),roe=n(r.roe),roic=n(r.roic),liq=n(r.liquidity_2m),growth=n(r.revenue_growth_5y),ebit=n(r.ebit_margin),net=n(r.net_margin),debt=n(r.net_debt_to_equity),cr=n(r.current_ratio)
  addGate('P/L positivo',pl!=null&&pl>0,num(pl))
  addGate('Patrimônio positivo',eq!=null&&eq>0,money(eq))
  addGate('ROE acima de 10%',roe!=null&&roe>.10,pct(roe))
  if(cls!==1)addGate('ROIC acima de 10%',roic!=null&&roic>.10,pct(roic))
  addGate('Liquidez média ≥ R$ 300 mil',liq!=null&&liq>=300000,money(liq))
  addGate('Crescimento de receita 5a positivo',growth!=null&&growth>0,pct(growth))
  const gatesPass=(pl||0)>0&&(eq||0)>0&&(roe||0)>.10&&(liq||0)>=300000&&(growth||0)>0&&(cls===1||(roic||0)>.10)
  if(!gatesPass)return lines.join('')+'<div class="quality-total"><span>Nota final</span><strong>'+num(score,0)+'/100</strong></div><div class="micro-note">Uma trava mínima não foi atendida; pela metodologia atual, a nota é zerada.</div>'
  const contrib=[]
  const push=(name,points)=>contrib.push('<div class="quality-line"><span>'+esc(name)+'</span><b>+'+points+' pts</b></div>')
  if(cls===1){
    push('ROE',roe<=.15?25:roe<=.20?40:roe<=.25?50:60)
    push('Crescimento de receita 5a',growth<=.05?5:growth<=.10?10:growth<=.15?15:growth<=.20?20:25)
    push('Margem líquida',!net||net<=0?0:net<=.10?3:net<=.20?6:net<=.30?9:net<=.40?12:15)
  }else{
    push('ROIC',roic<=.15?10:roic<=.20?15:roic<=.30?20:25)
    push('ROE',roe<=.15?8:roe<=.20?12:roe<=.30?16:20)
    push('Margem EBIT',!ebit||ebit<=0?0:ebit<=.05?2:ebit<=.10?4:ebit<=.15?6:8)
    push('Margem líquida',!net||net<=0?0:net<=.05?2:net<=.10?4:net<=.15?5:net<=.20?6:7)
    push('Crescimento receita 5a',growth<=.03?3:growth<=.07?6:growth<=.10?9:growth<=.15?12:15)
    push('Dívida líquida / PL',debt==null?0:debt<0?15:debt<=.30?13:debt<=.60?10:debt<=1?6:debt<=1.5?3:0)
    push('Liquidez corrente',cr==null||cr<.80?0:cr<=1?3:cr<=1.30?6:cr<=2?10:8)
  }
  return lines.join('')+'<div class="micro-note">Travas mínimas atendidas. Pontos que formam a nota:</div>'+contrib.join('')+'<div class="quality-total"><span>Nota final</span><strong>'+num(score,0)+'/100</strong></div>'
}
function sectorStats(r){
  const peers=rows.filter(x=>x.is_reference_ticker===true&&x.sector&&x.sector===r.sector)
  const calc=(key,positiveOnly=false)=>{
    const values=peers.map(x=>n(x[key])).filter(v=>v!=null&&(!positiveOnly||v>0))
    const mean=values.length?values.reduce((sum,v)=>sum+v,0)/values.length:null
    return {median:median(values),mean,min:values.length?Math.min(...values):null,max:values.length?Math.max(...values):null,count:values.length}
  }
  return {peers,pl:calc('pl',true),pvp:calc('pvp',true),dy:calc('dividend_yield'),roe:calc('roe'),roic:calc('roic')}
}
function sectorPanel(r){
  const s=sectorStats(r)
  const items=[
    ['P/L',r.pl,s.pl.median,'valuation',false,'Mediana do setor'],
    ['P/VP',r.pvp,s.pvp.median,'valuation',false,'Mediana do setor'],
    ['DY',r.dividend_yield,s.dy.mean,'return',true,'Média do setor'],
    ['ROE',r.roe,s.roe.median,'return',true,'Mediana do setor'],
    ['ROIC',r.roic,s.roic.median,'return',true,'Mediana do setor']
  ]
  return '<div class="micro-note">Setor: <b>'+esc(r.sector||'—')+'</b> • '+s.peers.length+' empresas de referência. Cada emissor entra uma única vez.</div><div class="comparison-list">'+items.map(([label,val,ref,kind,isPct,refLabel])=>{
    const [rel,cls]=relativeText(val,ref,kind)
    return '<div class="comparison-row"><b>'+label+'</b><span>Empresa '+(isPct?pct(val):num(val))+'</span><span>'+refLabel+' '+(isPct?pct(ref):num(ref))+'</span><strong class="'+cls+'">'+rel+'</strong></div>'
  }).join('')+'</div>'
}
function autoSummary(r){
  const s=sectorStats(r),parts=[]
  const [plRel]=relativeText(r.pl,s.pl.median,'valuation');if(plRel!=='—')parts.push('P/L '+plRel+' da mediana do setor')
  const [roeRel]=relativeText(r.roe,s.roe.median,'return');if(roeRel!=='—')parts.push('ROE '+roeRel+' da mediana do setor')
  if(n(r.discount_pct)!=null)parts.push(n(r.discount_pct)>=0?'cotação '+pct(r.discount_pct)+' abaixo do preço-alvo AXIVA':'cotação '+pct(Math.abs(r.discount_pct))+' acima do preço-alvo AXIVA')
  if(n(r.quality_score)!=null)parts.push('Qualidade '+num(r.quality_score,0)+'/100')
  return parts.length?parts.join('. ')+'.':'Os dados disponíveis ainda não permitem formar um resumo completo de valuation e comparação.'
}
function safetyPanel(r){
  const items=[['Graham',n(r.graham_price),''],['Cotação',n(r.current_price),'current'],['Preço-alvo',n(r.target_price),'']].filter(x=>x[1]!=null&&x[1]>0)
  if(items.length<2)return '<div class="limited-data">Margem de segurança indisponível porque ainda não há referências suficientes de valuation para este ativo.</div>'
  const minV=Math.min(...items.map(x=>x[1]))*.88,maxV=Math.max(...items.map(x=>x[1]))*1.12
  return '<div class="safety-bar">'+items.map(([label,v,cls])=>'<div class="safety-marker '+cls+'" style="left:'+((v-minV)/(maxV-minV)*100)+'%"><span>'+esc(label)+' '+money(v)+'</span></div>').join('')+'</div><div class="micro-note">As referências são calculadas com os fundamentos e históricos disponíveis. Não representam previsão de preço futuro.</div>'
}
function historyPanel(r){
  const plHist=n(r.historical_pl_5y),pvpHist=n(r.historical_pvp_5y)
  if(plHist==null&&pvpHist==null)return '<div class="limited-data">Histórico de múltiplos ainda indisponível para este ativo. A AXIVA não preenche valores ausentes por estimativa.</div>'
  const box=(label,current,hist)=>{
    if(hist==null)return '<div class="history-box"><span>'+label+'</span><strong>Histórico indisponível</strong></div>'
    const d=current!=null&&hist!==0?(current-hist)/Math.abs(hist):null
    return '<div class="history-box"><span>'+label+' atual x média histórica</span><strong>'+num(current)+' x '+num(hist)+'</strong><small>'+(d==null?'—':Math.abs(d*100).toLocaleString('pt-BR',{maximumFractionDigits:1})+'% '+(d>=0?'acima':'abaixo')+' da média')+'</small></div>'
  }
  return '<div class="history-compare">'+box('P/L',n(r.pl),plHist)+box('P/VP',n(r.pvp),pvpHist)+'</div><div class="micro-note">Período histórico disponível: '+esc(r.history_period_start||'—')+'–'+esc(r.history_period_end||'—')+'.</div>'
}
function groupComparison(r){
  const items=[
    ['P/L',r.pl,r.median_pl,'valuation',false],
    ['P/VP',r.pvp,r.median_pvp,'valuation',false],
    ['DY',r.dividend_yield,r.median_dy,'return',true],
    ['ROE',r.roe,r.median_roe,'return',true],
    ['ROIC',r.roic,r.median_roic,'return',true]
  ]
  const groupPeers=rows.filter(x=>x.is_reference_ticker===true&&x.comparison_level===r.comparison_level&&x.comparable_group===r.comparable_group)
  const zeroDy=groupPeers.filter(x=>n(x.dividend_yield)===0).length
  const dyNote=n(r.median_dy)===0&&groupPeers.length
    ?'<div class="micro-note">DY mediano de 0,0%: '+zeroDy+' de '+groupPeers.length+' empresas de referência do grupo estão com DY de 0,0% na base atual.</div>'
    :''
  return '<div class="micro-note">Grupo: <b>'+esc(r.comparable_group||'—')+'</b> • '+esc(r.comparison_level||'comparação')+' • '+esc(r.comparable_count||'—')+' empresas.</div><div class="comparison-list">'+items.map(([label,val,med,kind,isPct])=>{
    const [rel,cls]=relativeText(val,med,kind)
    return '<div class="comparison-row"><b>'+label+'</b><span>Empresa '+(isPct?pct(val):num(val))+'</span><span>Mediana '+(isPct?pct(med):num(med))+'</span><strong class="'+cls+'">'+rel+'</strong></div>'
  }).join('')+'</div>'+dyNote
}
function changesHtml(payload,r){
  const prev=payload?.previous_snapshot
  const ch=payload?.changes||{}
  if(!prev)return '<div class="limited-data">A AXIVA começou a registrar snapshots comparáveis desta base. Ainda não existe um snapshot anterior suficiente para mostrar mudanças nos fundamentos; a comparação será formada automaticamente nas próximas atualizações.</div>'
  const items=[['Preço','current_price',money],['Preço-alvo','target_price',money],['Qualidade','quality_score',v=>num(v,0)],['P/L','pl',num],['P/VP','pvp',num],['DY','dividend_yield',pct],['ROE','roe',pct],['ROIC','roic',pct]]
  return '<div class="micro-note">Comparação com '+new Date(prev.captured_on+'T12:00:00').toLocaleDateString('pt-BR')+'.</div><div class="change-list">'+items.map(([label,key,fmt])=>{
    const delta=n(ch[key]),cls=delta==null?'':delta>0?'change-pos':delta<0?'change-neg':''
    return '<div class="change-item"><span>'+label+'</span><strong class="'+cls+'">'+(delta==null?'—':(delta>0?'+':'')+fmt(delta))+'</strong></div>'
  }).join('')+'</div>'
}
function priceSpark(prices){
  const p=(prices||[]).slice().reverse().filter(x=>n(x.price)!=null)
  if(p.length<2)return ''
  const vals=p.map(x=>n(x.price)),minV=Math.min(...vals),maxV=Math.max(...vals),W=700,H=150,pad=12
  const x=i=>pad+i/(p.length-1)*(W-pad*2),y=v=>maxV===minV?H/2:pad+(maxV-v)/(maxV-minV)*(H-pad*2)
  const pts=vals.map((v,i)=>x(i)+','+y(v)).join(' ')
  return '<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:150px" aria-label="Histórico recente de cotação"><polyline points="'+pts+'" fill="none" stroke="#0fa9a5" stroke-width="2"/></svg><div class="micro-note">'+p.length+' cotações recentes • faixa '+money(minV)+' a '+money(maxV)+'.</div>'
}
async function renderCompany(r){
  currentCompany=r
  $('companyTicker').value=r.ticker
  $('companyStatus').textContent='Carregando histórico e mudanças...'
  let payload=null
  try{payload=await api('company',{params:{ticker:r.ticker}})}catch(e){}
  const data=payload?.company||r
  currentCompany=data
  const ws=$('companyWorkspace');ws.classList.remove('hidden')
  const sector=sectorStats(data)
  const metric=(label,val,sub,tip='')=>'<div class="metric-mini"><span>'+label+(tip?' <span class="help-bubble tiny" data-tip="'+esc(tip)+'" tabindex="0">?</span>':'')+'</span><strong>'+val+'</strong><small>'+sub+'</small></div>'
  ws.innerHTML=
    '<div class="company-head-card"><div><span class="eyebrow">'+esc(data.ticker)+'</span><h2>'+esc(data.company_name||data.ticker)+'</h2><p>Setor: '+esc(data.sector||'Não informado')+'</p></div><div class="company-price"><strong>'+money(data.current_price)+'</strong><span>Cotação • '+(data.price_quoted_at?new Date(data.price_quoted_at).toLocaleString('pt-BR'):'data indisponível')+'</span></div></div>'+
    '<div class="metric-cards">'+
      metric('Preço-alvo',money(data.target_price),'AXIVA', 'Referência calculada por múltiplos históricos quando os dados necessários estão disponíveis.')+
      metric('Desconto / ágio',pct(data.discount_pct),n(data.discount_pct)>=0?'abaixo do preço-alvo':'acima do preço-alvo')+
      metric('Qualidade',n(data.quality_score)==null?'—':num(data.quality_score,0)+'/100','metodologia AXIVA')+
      metric('P/L',num(data.pl),'setor: '+num(sector.pl.median),'Preço dividido pelo lucro por ação.')+
      metric('ROE',pct(data.roe),'setor: '+pct(sector.roe.median),'Retorno sobre patrimônio líquido.')+
      metric('DY',pct(data.dividend_yield),'média do setor: '+pct(sector.dy.mean),'Dividend Yield com base nos dados fundamentalistas atuais.')+
      metric('Preço Graham',money(data.graham_price),'referência de Graham','Estimativa de valor baseada na fórmula de Benjamin Graham quando LPA e VPA válidos estão disponíveis.')+
    '</div>'+
    '<div class="insight-grid"><article class="insight-card"><h3>Resumo</h3><p class="auto-summary">'+esc(autoSummary(data))+'</p><div class="result-action-bar"><button class="mini-btn secondary" id="companyExportInline">Exportar análise</button><button class="mini-btn secondary" id="companyAddWatchInline">☆ Minha Lista</button></div></article><article class="insight-card"><h3>Margem de segurança</h3>'+safetyPanel(data)+'</article></div>'+
    '<div class="insight-grid"><article class="insight-card"><h3>Empresa x setor</h3>'+sectorPanel(data)+'</article><article class="insight-card"><h3>Qualidade: como a nota foi formada</h3><div class="quality-breakdown">'+qualityBreakdown(data)+'</div></article></div>'+
    '<div class="insight-grid single"><article class="insight-card"><h3>Empresa x próprio histórico</h3>'+historyPanel(data)+'</article></div>'
  $('companyStatus').classList.add('hidden')
  $('companyAddWatchInline')?.addEventListener('click',()=>addWatch(data.ticker))
  $('companyExportInline')?.addEventListener('click',()=>csvDownload('axiva-'+data.ticker+'-'+today()+'.csv',['Indicador','Valor'],[['Ticker',data.ticker],['Empresa',data.company_name],['Preço',data.current_price],['Preço-alvo',data.target_price],['Graham',data.graham_price],['Desconto',data.discount_pct],['Qualidade',data.quality_score],['P/L',data.pl],['P/VP',data.pvp],['DY',data.dividend_yield],['ROE',data.roe],['ROIC',data.roic],['Setor',data.sector]]))
}
function openCompany(ticker){
  const r=resolveRow(ticker);if(!r)return
  gotoPage('company');renderCompany(r)
}
$('companyLoadBtn')?.addEventListener('click',()=>{const r=resolveRow($('companyTicker').value);if(r)renderCompany(r);else $('companyStatus').textContent='Empresa não encontrada na base atual.'})
$('companyTicker')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('companyLoadBtn').click()}})
$('companyWatchBtn')?.addEventListener('click',()=>{const r=resolveRow($('companyTicker').value);if(r)addWatch(r.ticker)})

function renderCompare(){
  const ws=$('compareWorkspace'),selected=compareTickers.map(t=>rowMap.get(t)).filter(Boolean)
  $('compareSelected').innerHTML=compareTickers.map(t=>'<span class="compare-chip">'+esc(t)+'<button type="button" data-remove-compare="'+esc(t)+'">×</button></span>').join('')
  document.querySelectorAll('[data-remove-compare]').forEach(b=>b.addEventListener('click',()=>{compareTickers=compareTickers.filter(x=>x!==b.dataset.removeCompare);renderCompare()}))
  if(selected.length<2){ws.innerHTML='<div class="status">Adicione pelo menos duas empresas.</div>';return}
  const metrics=[
    ['Empresa',r=>esc(r.company_name||'—')],['Cotação',r=>money(r.current_price)],['Preço-alvo',r=>money(r.target_price)],['Desconto',r=>pct(r.discount_pct)],['Qualidade',r=>n(r.quality_score)==null?'—':num(r.quality_score,0)+'/100'],['P/L',r=>num(r.pl)],['P/L grupo',r=>num(r.median_pl)],['P/VP',r=>num(r.pvp)],['P/VP grupo',r=>num(r.median_pvp)],['DY',r=>pct(r.dividend_yield)],['DY grupo',r=>pct(r.median_dy)],['ROE',r=>pct(r.roe)],['ROE grupo',r=>pct(r.median_roe)],['ROIC',r=>pct(r.roic)],['ROIC grupo',r=>pct(r.median_roic)],['Setor',r=>esc(r.sector||'—')]
  ]
  ws.innerHTML='<div class="compare-table" style="--compare-count:'+selected.length+'"><div class="compare-tr head"><div class="metric-label">Indicador</div>'+selected.map(r=>'<div><b>'+esc(r.ticker)+'</b></div>').join('')+'</div>'+metrics.map(([label,fn])=>'<div class="compare-tr"><div class="metric-label">'+label+'</div>'+selected.map(r=>'<div>'+fn(r)+'</div>').join('')+'</div>').join('')+'</div>'
}
$('compareAddBtn')?.addEventListener('click',()=>{const r=resolveRow($('compareTicker').value);if(!r){toast('Empresa não encontrada.');return}if(compareTickers.includes(r.ticker))return;if(compareTickers.length>=5){toast('Compare até cinco empresas por vez.');return}compareTickers.push(r.ticker);$('compareTicker').value='';renderCompare()})
$('compareTicker')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('compareAddBtn').click()}})
$('compareClearBtn')?.addEventListener('click',()=>{compareTickers=[];renderCompare()})
$('compareExportBtn')?.addEventListener('click',()=>{
  const selected=compareTickers.map(t=>rowMap.get(t)).filter(Boolean);if(selected.length<2){toast('Adicione pelo menos duas empresas.');return}
  csvDownload('axiva-comparacao-'+today()+'.csv',['Ticker','Empresa','Preço','Preço-alvo','Desconto','Qualidade','P/L','Mediana P/L','P/VP','Mediana P/VP','DY','Mediana DY','ROE','Mediana ROE','ROIC','Mediana ROIC','Setor'],selected.map(r=>[r.ticker,r.company_name,r.current_price,r.target_price,r.discount_pct,r.quality_score,r.pl,r.median_pl,r.pvp,r.median_pvp,r.dividend_yield,r.median_dy,r.roe,r.median_roe,r.roic,r.median_roic,r.sector]))
})

async function addWatch(ticker){
  try{await api('watchlist',{method:'POST',body:{action:'add',ticker}});toast(ticker+' adicionado à Minha Lista.');await loadWatch()}
  catch(e){toast('Não foi possível adicionar à lista.')}
}
async function removeWatch(ticker){
  try{await api('watchlist',{method:'POST',body:{action:'delete',ticker}});await loadWatch()}
  catch(e){toast('Não foi possível remover da lista.')}
}
function renderWatch(){
  const el=$('watchlistContent')
  if(!watchData.length){el.innerHTML='<div class="empty-state">Sua lista está vazia. Adicione uma empresa para começar.</div>';return}
  el.innerHTML=watchData.map(r=>{
    const day=n(r.day_change_pct)
    return '<div class="watch-row"><div><b>'+esc(r.ticker)+'</b><span>'+esc(r.company_name||'')+'</span></div><div><span>Cotação</span><b>'+money(r.current_price)+'</b></div><div><span>Dia</span><b class="watch-change '+(day>0?'change-pos':day<0?'change-neg':'')+'">'+(day==null?'—':pct(day))+'</b></div><div><span>Desconto</span><b>'+pct(r.discount_pct)+'</b></div><div class="compact-actions"><button class="mini-btn secondary" data-watch-open="'+esc(r.ticker)+'">Analisar</button><button class="mini-btn danger" data-watch-remove="'+esc(r.ticker)+'">Remover</button></div></div>'
  }).join('')
  el.querySelectorAll('[data-watch-open]').forEach(b=>b.addEventListener('click',()=>openCompany(b.dataset.watchOpen)))
  el.querySelectorAll('[data-watch-remove]').forEach(b=>b.addEventListener('click',()=>removeWatch(b.dataset.watchRemove)))
}
async function loadWatch(){
  try{const j=await api('watchlist');watchData=Array.isArray(j.data)?j.data:[];$('watchlistStatus').textContent=watchData.length+' empresa(s) na sua lista.';renderWatch();renderOverviewFollow()}
  catch(e){$('watchlistStatus').textContent='Não foi possível carregar sua lista.'}
}
$('watchAddBtn')?.addEventListener('click',()=>{const r=resolveRow($('watchTicker').value);if(r){$('watchTicker').value='';addWatch(r.ticker)}else toast('Empresa não encontrada.')})
function alertFmt(metric,v){
  if(['discount_pct','roe','roic','dividend_yield'].includes(metric))return pct(v)
  if(metric==='price')return money(v)
  if(metric==='quality_score')return num(v,0)
  return num(v)
}
function renderAlerts(){
  const el=$('alertsContent')
  if(!alertData.length){el.innerHTML='<div class="empty-state">Nenhum alerta criado.</div>';return}
  const labels={price:'Preço',discount_pct:'Desconto',pl:'P/L',pvp:'P/VP',roe:'ROE',roic:'ROIC',dividend_yield:'DY',quality_score:'Qualidade'}
  el.innerHTML=alertData.map(a=>'<div class="alert-row"><div><b>'+esc(a.ticker)+' • '+esc(labels[a.metric]||a.metric)+'</b><span>Atual '+alertFmt(a.metric,a.current_value)+' • '+(a.operator==='gte'?'≥ ':'≤ ')+alertFmt(a.metric,a.threshold)+'</span></div><span class="alert-status '+(!a.active?'off':a.triggered?'hit':'wait')+'">'+(!a.active?'Pausado':a.triggered?'Atingido':'Aguardando')+'</span><div class="compact-actions"><button class="mini-btn secondary" data-alert-toggle="'+a.id+'" data-active="'+(!a.active)+'">'+(a.active?'Pausar':'Ativar')+'</button><button class="mini-btn danger" data-alert-delete="'+a.id+'">Excluir</button></div></div>').join('')
  el.querySelectorAll('[data-alert-toggle]').forEach(b=>b.addEventListener('click',()=>toggleAlert(b.dataset.alertToggle,b.dataset.active==='true')))
  el.querySelectorAll('[data-alert-delete]').forEach(b=>b.addEventListener('click',()=>deleteAlert(b.dataset.alertDelete)))
}
async function loadAlerts(){
  try{const j=await api('alerts');alertData=Array.isArray(j.data)?j.data:[];$('alertsStatus').textContent=alertData.filter(a=>a.triggered&&a.active).length+' condição(ões) atingida(s) agora.';renderAlerts();renderOverviewFollow()}
  catch(e){$('alertsStatus').textContent='Não foi possível carregar os alertas.'}
}
function updateAlertHint(){
  const metric=$('alertMetric')?.value
  const percent=['discount_pct','roe','roic','dividend_yield'].includes(metric)
  const quality=metric==='quality_score'
  if($('alertThreshold')){
    $('alertThreshold').placeholder=percent?'Ex.: 15 para 15%':quality?'Ex.: 70':'Ex.: 30,00'
    $('alertThreshold').step=quality?'1':'.01'
  }
  if($('alertValueHint'))$('alertValueHint').textContent=percent?'Informe o percentual como número inteiro. Ex.: 15 para 15%.':quality?'Informe uma nota entre 0 e 100.':'Para preço e múltiplos, informe o valor numérico mostrado na plataforma.'
}
$('alertMetric')?.addEventListener('change',updateAlertHint)
updateAlertHint()

$('alertForm')?.addEventListener('submit',async e=>{
  e.preventDefault();const r=resolveRow($('alertTicker').value);if(!r){toast('Empresa não encontrada.');return}
  const metric=$('alertMetric').value,operator=$('alertOperator').value
  let threshold=n($('alertThreshold').value);if(threshold==null)return
  if(['discount_pct','roe','roic','dividend_yield'].includes(metric))threshold/=100
  try{await api('alerts',{method:'POST',body:{action:'create',ticker:r.ticker,metric,operator,threshold}});e.target.reset();toast('Alerta criado.');await loadAlerts()}
  catch(err){toast('Não foi possível criar o alerta.')}
})
async function toggleAlert(id,active){try{await api('alerts',{method:'POST',body:{action:'toggle',id,active}});await loadAlerts()}catch(e){toast('Não foi possível alterar o alerta.')}}
async function deleteAlert(id){try{await api('alerts',{method:'POST',body:{action:'delete',id}});await loadAlerts()}catch(e){toast('Não foi possível excluir o alerta.')}}
function renderOverviewFollow(){
  const el=$('overviewStats');if(!el||!rows.length)return
  const cards=el.querySelectorAll('.stat-mini')
  if(cards.length>=4){
    cards[3].querySelector('span').textContent='Acompanhamento'
    cards[3].querySelector('strong').textContent=watchData.length
    cards[3].querySelector('small').textContent=(alertData.filter(a=>a.triggered&&a.active).length)+' alertas atingidos'
  }
}

function simulate(){
  const r=resolveRow($('simTicker').value),price=n($('simPrice').value),ws=$('simWorkspace')
  if(!r||price==null||price<=0){ws.innerHTML='<div class="status">Informe uma empresa válida e um preço hipotético maior que zero.</div>';return}
  const lpa=n(r.lpa),vpa=n(r.vpa),current=n(r.current_price),dy=n(r.dividend_yield)
  const dividendCash=current!=null&&dy!=null?current*dy:null
  const simPL=lpa!=null&&lpa>0?price/lpa:null,simPVP=vpa!=null&&vpa>0?price/vpa:null,simDY=dividendCash!=null?dividendCash/price:null
  const marginTarget=n(r.target_price)>0?(n(r.target_price)-price)/n(r.target_price):null
  const marginGraham=n(r.graham_price)>0?(n(r.graham_price)-price)/n(r.graham_price):null
  const item=(label,value,sub)=>'<div class="sim-result"><span>'+label+'</span><strong>'+value+'</strong><small>'+sub+'</small></div>'
  ws.innerHTML='<div class="sim-result-grid">'+item('Preço simulado',money(price),'atual '+money(current))+item('P/L simulado',num(simPL),'atual '+num(r.pl))+item('P/VP simulado',num(simPVP),'atual '+num(r.pvp))+item('DY estimado',pct(simDY),'mantendo proventos implícitos atuais')+item('Margem p/ preço-alvo',pct(marginTarget),'referência AXIVA')+'</div><div class="suite-card" style="margin-top:10px"><div class="comparison-list"><div class="comparison-row"><b>Preço-alvo</b><span>'+money(r.target_price)+'</span><span>Preço hipotético '+money(price)+'</span><strong>'+pct(marginTarget)+'</strong></div><div class="comparison-row"><b>Graham</b><span>'+money(r.graham_price)+'</span><span>Preço hipotético '+money(price)+'</span><strong>'+pct(marginGraham)+'</strong></div></div><div class="micro-note">Simulação estática: LPA, VPA e proventos implícitos são mantidos constantes. Alterações futuras nos fundamentos mudam os resultados.</div></div>'
}
$('simRunBtn')?.addEventListener('click',simulate)
$('simTicker')?.addEventListener('change',()=>{const r=resolveRow($('simTicker').value);if(r&&n(r.current_price)!=null)$('simPrice').value=Number(r.current_price).toFixed(2)})

function setRows(data){
  rows=Array.isArray(data)?data:[]
  rowMap=new Map(rows.map(r=>[String(r.ticker||'').toUpperCase(),r]))
  fillUniverseUI();renderOverview();mapSvg()
  if(!defaultsInitialized){suiteDefaults();defaultsInitialized=true}
  renderDiscovery(rows,filterState())
  loadWatch();loadAlerts()
}
window.addEventListener('axiva:analysis-ready',e=>setRows(e.detail?.rows||[]))
if(Array.isArray(window.axivaAnalysisRows)&&window.axivaAnalysisRows.length)setRows(window.axivaAnalysisRows)

document.querySelectorAll('.nav-item[data-page="watch"]').forEach(b=>b.addEventListener('click',()=>{loadWatch();loadAlerts()}))
