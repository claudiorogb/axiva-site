const fixCss=document.createElement('link');
fixCss.rel='stylesheet';
fixCss.href='/invest/v2-fixes.css?v=5';
document.head.appendChild(fixCss);

const MARKET_API='https://zbtijblvkzkeposvkfob.supabase.co/functions/v1/invest-market-strip';
const MACRO_API='https://zbtijblvkzkeposvkfob.supabase.co/functions/v1/invest-macro-market';
const PUBLIC_SNAPSHOT_API='https://zbtijblvkzkeposvkfob.supabase.co/rest/v1/invest_public_snapshot?select=ticker,company_name,current_price,day_change_pct,pl,pvp,dividend_yield,roe,roic,quality_score&order=ticker.asc&limit=500';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_1hWexWrd_y-m36-DaXF5Hw_p33Ginm_';

const fallbackMarket=[
{label:'Itaú PN',price:42.39,day_change_pct:.0009445100},{label:'B3 ON',price:17.35,day_change_pct:-.0011514105},{label:'WEG ON',price:51.02,day_change_pct:.0055183287},{label:'Ambev ON',price:15.73,day_change_pct:-.0088216761},{label:'Localiza ON',price:35.78,day_change_pct:.0053385783},{label:'Lojas Renner ON',price:11.20,day_change_pct:-.0008920607},{label:'PRIO ON',price:64.24,day_change_pct:.0051635112},{label:'Porto ON',price:49.81,day_change_pct:-.0045963229},{label:'Vivara ON',price:22.43,day_change_pct:.0013392857},{label:'Raia Drogasil ON',price:19.57,day_change_pct:.0015353122},{label:'BTG Pactual Units',price:60.22,day_change_pct:-.0042989418},{label:'CPFL Energia ON',price:44.91,day_change_pct:.0040241449}
];

let publicSnapshot=[];
let snapshotLoaded=false;

const fmtMoney=v=>v==null?'—':Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const fmtNum=(v,d=2)=>v==null?'—':Number(v).toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d});
const fmtPct=v=>v==null?'—':(Number(v)*100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'%';
function esc(s){return String(s??'').replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));}

async function fetchJSON(url,tries=3,headers={}){
  let last;
  for(let i=0;i<tries;i++){
    const ctrl=new AbortController();
    const timer=setTimeout(()=>ctrl.abort(),12000);
    try{
      const sep=url.includes('?')?'&':'?';
      const r=await fetch(url+sep+'_='+Date.now(),{cache:'no-store',mode:'cors',signal:ctrl.signal,headers:{Accept:'application/json',...headers}});
      clearTimeout(timer);
      if(!r.ok){const body=await r.text().catch(()=> '');throw new Error('HTTP '+r.status+' '+body.slice(0,180));}
      return await r.json();
    }catch(e){
      clearTimeout(timer);
      last=e;
      if(i<tries-1)await new Promise(res=>setTimeout(res,650*(i+1)));
    }
  }
  throw last;
}

function marketItem(r){
  const ch=Number(r.day_change_pct);
  const cls=!Number.isFinite(ch)||ch===0?'flat':ch>0?'up':'down';
  const arrow=!Number.isFinite(ch)||ch===0?'':ch>0?'▲':'▼';
  return `<div class="market-item"><span class="market-label">${esc(r.label||r.ticker)}</span><span class="market-price">${fmtMoney(r.price)}</span><span class="market-change ${cls}">${arrow}${arrow?' ':''}${fmtPct(Number.isFinite(ch)?ch:null)}</span></div>`;
}
function renderMarket(data){
  const base=Array.isArray(data)&&data.length?data:fallbackMarket;
  const expanded=[...base,...base];
  const html=expanded.map(marketItem).join('');
  document.getElementById('tickerA').innerHTML=html;
  document.getElementById('tickerB').innerHTML=html;
}
async function loadMarket(){
  try{const j=await fetchJSON(MARKET_API,3);renderMarket(j.data);}catch(e){console.error('AXIVA market error',e);renderMarket(fallbackMarket);}
}

function setupHeroMacro(){
  const panel=document.querySelector('.hero-panel');
  if(!panel)return;
  panel.classList.add('macro-panel');
  panel.innerHTML=`<div class="panel-head"><strong>Mercado hoje</strong><span class="tag">AXIVA Invest</span></div><div class="macro-grid"><div class="macro-card" data-macro="BRL=X"><span class="macro-label">Dólar comercial</span><strong class="macro-value">—</strong><span class="macro-change flat">—</span></div><div class="macro-card" data-macro="EURBRL=X"><span class="macro-label">Euro</span><strong class="macro-value">—</strong><span class="macro-change flat">—</span></div><div class="macro-card" data-macro="^BVSP"><span class="macro-label">Ibovespa</span><strong class="macro-value">—</strong><span class="macro-change flat">—</span></div><div class="macro-card" data-macro="CDI"><span class="macro-label">CDI</span><strong class="macro-value">—</strong><span class="macro-change flat">—</span></div></div><div class="macro-foot">Atualização automática</div>`;
}
function macroValue(item){
  const v=Number(item.value);
  if(!Number.isFinite(v))return '—';
  if(item.unit==='BRL')return v.toLocaleString('pt-BR',{style:'currency',currency:'BRL',minimumFractionDigits:2,maximumFractionDigits:2});
  if(item.unit==='PTS')return v.toLocaleString('pt-BR',{maximumFractionDigits:0})+' pts';
  if(item.unit==='% a.d.')return v.toLocaleString('pt-BR',{minimumFractionDigits:4,maximumFractionDigits:4})+'% a.d.';
  return fmtNum(v);
}
function renderMacro(data){
  (Array.isArray(data)?data:[]).forEach(item=>{
    const key=String(item.key||'');
    const card=[...document.querySelectorAll('[data-macro]')].find(el=>el.getAttribute('data-macro')===key);
    if(!card)return;
    card.querySelector('.macro-value').textContent=macroValue(item);
    const change=card.querySelector('.macro-change');
    const ch=Number(item.change_pct);
    const finite=Number.isFinite(ch);
    const cls=!finite||ch===0?'flat':ch>0?'up':'down';
    const arrow=!finite||ch===0?'':ch>0?'▲':'▼';
    change.className='macro-change '+cls;
    change.textContent=!finite?'—':`${arrow}${arrow?' ':''}${fmtPct(ch)}`;
  });
}
async function loadMacro(){
  try{
    const j=await fetchJSON(MACRO_API,3);
    if(!Array.isArray(j.data))throw new Error('macro_data_invalid');
    renderMacro(j.data);
    try{localStorage.setItem('axiva_macro_cache',JSON.stringify(j.data));}catch(_){}
  }catch(e){
    console.error('AXIVA macro error',e);
    try{const cached=JSON.parse(localStorage.getItem('axiva_macro_cache')||'[]');if(Array.isArray(cached)&&cached.length)renderMacro(cached);}catch(_){}
  }
}

function setupStrategySection(){
  const analyzer=document.getElementById('analisador');
  if(!analyzer||document.getElementById('estrategias'))return;
  const section=document.createElement('section');
  section.className='strategy-section';
  section.id='estrategias';
  section.innerHTML=`
    <div class="container strategy-shell">
      <div class="strategy-top">
        <div class="strategy-copy">
          <div class="eyebrow">Estratégias</div>
          <h2>Monte <span>sua estratégia</span> e veja quais empresas atende aos seus critérios.</h2>
          <p>Defina regras como P/L, ROE, ROIC e DY, simule os resultados e entenda quais empresas se encaixam na sua lógica de análise.</p>
        </div>
        <div class="strategy-preview" aria-hidden="true">
          <div class="mini-criteria">
            <strong>Seus critérios</strong>
            <div><span>P/L máximo</span><i><b style="width:58%"></b></i><em>10,0</em></div>
            <div><span>ROE mínimo</span><i><b style="width:52%"></b></i><em>15,0%</em></div>
            <div><span>ROIC mínimo</span><i><b style="width:47%"></b></i><em>10,0%</em></div>
            <div><span>DY mínimo</span><i><b style="width:55%"></b></i><em>5,0%</em></div>
          </div>
          <div class="mini-result">
            <div class="mini-head"><span>Empresa</span><span>P/L</span><span>ROE</span><span>ROIC</span><span>DY</span></div>
            <div><b>PETR4</b><span>4,8</span><span>18,2%</span><span>12,4%</span><span>8,1%</span><mark>✓</mark></div>
            <div><b>ITUB4</b><span>7,1</span><span>21,3%</span><span>15,8%</span><span>6,9%</span><mark>✓</mark></div>
            <div><b>VALE3</b><span>5,9</span><span>16,7%</span><span>11,9%</span><span>7,4%</span><mark>✓</mark></div>
          </div>
        </div>
      </div>
      <div class="strategy-steps">
        <article><div class="strategy-icon filter-icon"><span></span><span></span><span></span></div><div><span class="step-badge">1</span><h3>Defina seus critérios</h3><p>Escolha filtros como P/L máximo, ROE mínimo, ROIC e dividend yield.</p></div></article>
        <article><div class="strategy-icon search-icon">⌕</div><div><span class="step-badge">2</span><h3>Veja as empresas compatíveis</h3><p>A plataforma mostra quais empresas atendem aos critérios definidos naquele momento.</p></div></article>
        <article><div class="strategy-icon chart-lock-icon">↗</div><div><span class="step-badge">3</span><h3>Acompanhe na área exclusiva</h3><p>Assinantes podem salvar estratégias e acompanhar entradas, saídas e histórico nas atualizações semanais.</p></div></article>
      </div>
      <div class="strategy-compare">
        <div class="compare-card public"><div class="compare-title"><span>◉</span><h3>Na área pública</h3></div><ul><li>Simulação da estratégia</li><li>Teste de critérios</li><li>Visualização das empresas compatíveis</li></ul></div>
        <div class="compare-arrow">›</div>
        <div class="compare-card exclusive"><div class="compare-title"><span>▣</span><h3>Na área exclusiva</h3></div><ul><li>Estratégias salvas</li><li>Atualização semanal automática</li><li>Histórico de entradas e saídas</li><li>Acompanhamento contínuo</li></ul></div>
      </div>
      <div class="strategy-cta"><a class="btn btn-primary" href="#area-exclusiva">Conhecer a área exclusiva →</a><p>Experimente a lógica na área pública. Acompanhe de verdade na área exclusiva.</p></div>
    </div>`;
  analyzer.parentNode.insertBefore(section,analyzer);
}

function sliderRow(id,label,min,max,step,value,suffix=''){
  return `<div class="slider-row"><div class="slider-meta"><label for="${id}">${label}</label><output id="${id}Out">${fmtSliderValue(value,suffix)}</output></div><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}" data-suffix="${suffix}"></div>`;
}
function fmtSliderValue(v,suffix){
  const n=Number(v);
  if(suffix==='%')return n.toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})+'%';
  return n.toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1});
}
function setupAnalyzerSliders(){
  const panel=document.getElementById('filterPanel');
  if(!panel)return;
  panel.innerHTML=`
    <div class="analyzer-controls">
      <div class="analyzer-ticker"><label for="ticker">Empresa / ticker</label><input id="ticker" type="text" placeholder="Ex.: ITUB4" autocomplete="off"></div>
      <div class="slider-grid">
        ${sliderRow('plMax','P/L máximo',0,40,0.5,15,'')}
        ${sliderRow('pvpMax','P/VP máximo',0,8,0.1,3,'')}
        ${sliderRow('roeMin','ROE mínimo',0,40,0.5,10,'%')}
        ${sliderRow('roicMin','ROIC mínimo',0,40,0.5,10,'%')}
        ${sliderRow('dyMin','DY mínimo',0,15,0.25,0,'%')}
      </div>
      <div class="analyzer-actions"><button class="btn btn-dark" id="searchBtn" type="button">Analisar</button><button class="btn analyzer-reset" id="resetBtn" type="button">Limpar filtros</button></div>
      <div class="filter-help"><span>Ajuste as barras e veja quais empresas atendem aos seus critérios.</span><span>Até 25 resultados por consulta.</span></div>
      <div class="results" id="results"><div class="empty">Ajuste seus critérios e clique em <b>Analisar</b>.</div></div>
    </div>`;

  panel.querySelectorAll('input[type="range"]').forEach(input=>{
    const sync=()=>{const out=document.getElementById(input.id+'Out');if(out)out.value=fmtSliderValue(input.value,input.dataset.suffix||'');};
    input.addEventListener('input',sync);sync();
  });
  document.getElementById('searchBtn')?.addEventListener('click',buscar);
  document.getElementById('resetBtn')?.addEventListener('click',resetFilters);
  document.getElementById('ticker')?.addEventListener('keydown',e=>{if(e.key==='Enter')buscar();});
}

function resetFilters(){
  const defaults={plMax:15,pvpMax:3,roeMin:10,roicMin:10,dyMin:0};
  document.getElementById('ticker').value='';
  Object.entries(defaults).forEach(([id,value])=>{
    const input=document.getElementById(id);if(!input)return;input.value=value;input.dispatchEvent(new Event('input'));
  });
  document.getElementById('results').innerHTML='<div class="empty">Ajuste seus critérios e clique em <b>Analisar</b>.</div>';
}

async function loadPublicSnapshot(){
  try{
    const rows=await fetchJSON(PUBLIC_SNAPSHOT_API,3,{apikey:SUPABASE_PUBLISHABLE_KEY});
    if(!Array.isArray(rows)||!rows.length)throw new Error('snapshot_empty');
    publicSnapshot=rows;
    snapshotLoaded=true;
    try{localStorage.setItem('axiva_public_snapshot',JSON.stringify(rows));}catch(_){}
  }catch(e){
    console.error('AXIVA snapshot error',e);
    try{
      const cached=JSON.parse(localStorage.getItem('axiva_public_snapshot')||'[]');
      if(Array.isArray(cached)&&cached.length){publicSnapshot=cached;snapshotLoaded=true;}
    }catch(_){}
  }
}

function n(v){const x=Number(v);return Number.isFinite(x)?x:null;}
function buscar(){
  const panel=document.getElementById('filterPanel');
  const out=document.getElementById('results');
  if(!snapshotLoaded||!publicSnapshot.length){
    out.innerHTML='<div class="empty"><b>Os dados ainda estão carregando.</b><br>Tente novamente em alguns segundos.</div>';
    loadPublicSnapshot();
    return;
  }
  panel.classList.add('loading');
  const ticker=document.getElementById('ticker').value.trim().toUpperCase();
  const plMax=n(document.getElementById('plMax').value);
  const pvpMax=n(document.getElementById('pvpMax').value);
  const roeMin=n(document.getElementById('roeMin').value)/100;
  const roicMin=n(document.getElementById('roicMin').value)/100;
  const dyMin=n(document.getElementById('dyMin').value)/100;
  const rows=publicSnapshot.filter(r=>{
    const tickerOk=!ticker||String(r.ticker||'').toUpperCase().includes(ticker)||String(r.company_name||'').toUpperCase().includes(ticker);
    const pl=n(r.pl),pvp=n(r.pvp),roe=n(r.roe),roic=n(r.roic),dy=n(r.dividend_yield);
    return tickerOk&&(pl==null||pl<=plMax)&&(pvp==null||pvp<=pvpMax)&&(roe==null||roe>=roeMin)&&(roic==null||roic>=roicMin)&&(dy==null||dy>=dyMin);
  }).slice(0,25);
  renderResults(rows);
  panel.classList.remove('loading');
}

function renderResults(rows){
  const out=document.getElementById('results');
  if(!rows.length){out.innerHTML='<div class="empty">Nenhuma empresa encontrada com esses critérios.</div>';return;}
  const body=rows.map(r=>{
    const ch=n(r.day_change_pct);
    const cls=ch==null||ch===0?'flat':ch>0?'up':'down';
    const arrow=ch==null||ch===0?'':ch>0?'▲':'▼';
    return `<div class="analysis-row"><div class="company-cell"><b>${esc(r.ticker)}</b><span>${esc(r.company_name||'')}</span></div><div>${fmtMoney(r.current_price)}</div><div class="${cls}">${arrow}${arrow?' ':''}${fmtPct(ch)}</div><div>${fmtNum(r.pl)}</div><div>${fmtNum(r.pvp)}</div><div>${fmtPct(r.roe)}</div><div>${fmtPct(r.roic)}</div><div>${fmtPct(r.dividend_yield)}</div><div><span class="quality-pill">${r.quality_score==null?'—':Math.round(Number(r.quality_score))}</span></div><div><span class="locked-value">R$ 00,00</span></div><div><span class="locked-value">R$ 00,00</span></div></div>`;
  }).join('');
  out.innerHTML=`<div class="analysis-table"><div class="analysis-row analysis-head"><div>Empresa</div><div>Cotação</div><div>Variação</div><div>P/L</div><div>P/VP</div><div>ROE</div><div>ROIC</div><div>DY</div><div>Qualidade</div><div>Preço-alvo</div><div>Graham</div></div>${body}</div><div class="analysis-premium-note">Preço-alvo e Graham ficam disponíveis na área exclusiva para assinantes.</div>`;
}

function applyTextFixes(){
  const h2=document.querySelector('#metodologia .section-head h2');
  if(h2)h2.textContent='Você não precisa analisar centenas de empresas.';
}

window.addEventListener('DOMContentLoaded',async()=>{
  setupHeroMacro();
  setupStrategySection();
  setupAnalyzerSliders();
  applyTextFixes();
  renderMarket(fallbackMarket);
  loadMarket();
  loadMacro();
  await loadPublicSnapshot();
  setInterval(loadMarket,120000);
  setInterval(loadMacro,120000);
  setInterval(loadPublicSnapshot,300000);
});
