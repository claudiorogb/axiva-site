// A seleção é carregada pelo endpoint autenticado invest-private-data em private.js.
// Nenhum dado extra é exposto nem há acesso direto a tabelas do banco.
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const money = value => value == null ? '—' : Number(value).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const num = value => value == null ? '—' : Number(value).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const pct = value => value == null ? '—' : (Number(value)*100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'%';
const wrap=$('selectionTableWrap'),detail=$('selectionDetail'),page=$('selectionPage');
function openDetail(index){
  const company=window.axivaSelectionRows?.[index];
  if(!company||!wrap||!detail)return;
  const quality=company.quality_score==null?'—':`${Math.round(Number(company.quality_score))}/100`;
  const discount=pct(company.discount_pct);
  const metrics=[['Valor atual',money(company.current_price)],['Preço alvo',money(company.target_price)],['Desconto',discount],['Qualidade dos fundamentos',quality],['Preço Graham',money(company.graham_price)]];
  const indicators=[['P/L',num(company.pl)],['P/VP',num(company.pvp)],['DY',pct(company.dividend_yield)],['ROIC',pct(company.roic)],['ROE',pct(company.roe)]];
  detail.innerHTML=`<button class="detail-back" type="button">← Voltar para a lista</button>
    <div class="detail-hero"><h2>${esc(company.ticker)}</h2><strong>${esc(company.company_name||'')}</strong><span>Dados fundamentalistas</span></div>
    <div class="detail-metrics">${metrics.map(([label,value],i)=>`<div class="detail-metric ${i===2?'detail-discount':''}"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join('')}</div>
    <h3 class="detail-heading">Indicadores fundamentalistas</h3>
    <div class="detail-indicators"><div class="detail-indicator-head"><b>Indicador</b><b>Resultado</b></div>${indicators.map(([label,value])=>`<div class="detail-indicator"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join('')}</div>
    <h3 class="detail-heading">Resumo</h3><div class="detail-summary">Nota de fundamento: ${esc(quality)} | Desconto de ${esc(discount)} segundo nossa metodologia.</div>
    <footer class="detail-disclaimer">As informações apresentadas têm finalidade exclusivamente informativa e não constituem recomendação de compra ou venda de ativos. Consulte as <button class="detail-important-link" type="button">Informações Importantes</button>.</footer>`;
  wrap.classList.add('hidden');page.classList.add('detail-open');detail.classList.remove('hidden');
  detail.querySelector('.detail-back').addEventListener('click',()=>{
    detail.classList.add('hidden');page.classList.remove('detail-open');wrap.classList.remove('hidden');
    wrap.querySelector(`[data-selection-index="${index}"]`)?.focus();
  });
  detail.querySelector('.detail-important-link').addEventListener('click',()=>document.querySelector('.nav-item[data-page="important-info"]')?.click());
  detail.querySelector('.detail-back').focus();
}
wrap?.addEventListener('click',event=>{const row=event.target.closest('[data-selection-index]');if(row&&wrap.contains(row))openDetail(Number(row.dataset.selectionIndex));});
wrap?.addEventListener('keydown',event=>{if(!['Enter',' '].includes(event.key))return;const row=event.target.closest('[data-selection-index]');if(row&&wrap.contains(row)){event.preventDefault();openDetail(Number(row.dataset.selectionIndex));}});
