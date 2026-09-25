// A seleção é carregada pelo endpoint autenticado invest-private-data em private.js.
// Ao clicar em uma empresa, a navegação segue diretamente para o Raio-X em "Analisar empresa".
const $ = id => document.getElementById(id);
const wrap=$('selectionTableWrap');

function openCompanyFromSelection(index){
  const company=window.axivaSelectionRows?.[index];
  if(!company||!wrap)return;

  window.axivaCompanyOrigin='selection';
  $('companyBackBtn')?.classList.remove('hidden');

  const nav=document.querySelector('.nav-item[data-page="company"]');
  nav?.click();

  const input=$('companyTicker');
  if(input)input.value=company.ticker||'';
  $('companyLoadBtn')?.click();
}

wrap?.addEventListener('click',event=>{
  const row=event.target.closest('[data-selection-index]');
  if(row&&wrap.contains(row))openCompanyFromSelection(Number(row.dataset.selectionIndex));
});

wrap?.addEventListener('keydown',event=>{
  if(!['Enter',' '].includes(event.key))return;
  const row=event.target.closest('[data-selection-index]');
  if(row&&wrap.contains(row)){
    event.preventDefault();
    openCompanyFromSelection(Number(row.dataset.selectionIndex));
  }
});
