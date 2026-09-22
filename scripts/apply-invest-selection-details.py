from pathlib import Path

htmlp=Path('invest/private.html')
html=htmlp.read_text(encoding='utf-8')
old='<div id="selectionTableWrap" class="table-wrap hidden"></div>'
assert html.count(old)==1
html=html.replace(old,old+'\n      <section id="selectionDetail" class="selection-detail hidden" aria-live="polite"></section>',1)
for a,b in [('/invest/private.js?v=7','/invest/private.js?v=8'),('/invest/private.css?v=8','/invest/private.css?v=9')]:
    assert html.count(a)==1
    html=html.replace(a,b,1)
htmlp.write_text(html,encoding='utf-8')

jsp=Path('invest/private.js')
js=jsp.read_text(encoding='utf-8')
assert js.count('  const body=rows.map(r=>')==1
js=js.replace('  const body=rows.map(r=>','  window.axivaSelectionRows=rows\n  const body=rows.map((r,index)=>',1)
old='<div class=\\"private-row\\"><div>${r.position'
new='<div class=\\"private-row selection-clickable\\" data-selection-index=\\"${index}\\" role=\\"button\\" tabindex=\\"0\\" aria-label=\\"Ver detalhes de ${esc(r.ticker)}\\"><div>${r.position'
assert js.count(old)==1,(js.count(old),old)
js=js.replace(old,new,1)
assert js.count("  selectionStatus.classList.remove('hidden');selectionStatus.textContent='Carregando Seleção de Ações...';selectionWrap.classList.add('hidden')")==1
js=js.replace("  selectionStatus.classList.remove('hidden');selectionStatus.textContent='Carregando Seleção de Ações...';selectionWrap.classList.add('hidden')","  $('selectionDetail').classList.add('hidden');$('selectionPage').classList.remove('detail-open');selectionStatus.classList.remove('hidden');selectionStatus.textContent='Carregando Seleção de Ações...';selectionWrap.classList.add('hidden')",1)
jsp.write_text(js,encoding='utf-8')

cssp=Path('invest/private.css')
css=cssp.read_text(encoding='utf-8')
assert '/* Detalhes das ações selecionadas */' not in css
css+='''
/* Detalhes das ações selecionadas */
#selectionPage .selection-clickable{cursor:pointer}#selectionPage .selection-clickable:hover{background:#103452}#selectionPage .selection-clickable:focus-visible{outline:3px solid #13beb8;outline-offset:-3px}
#selectionPage.detail-open .selection-intro,#selectionPage.detail-open #selectionStatus,#selectionPage.detail-open>.selection-disclaimer{display:none!important}
.selection-detail{display:grid;gap:22px;min-width:0}.detail-back{justify-self:start;border:1px solid #d5e2ef;background:#fff;border-radius:11px;padding:10px 14px;color:#27435e;font:inherit;font-size:13px;cursor:pointer}
.detail-hero{background:#fff;border:1px solid #d5e2ef;border-top:3px solid #13b8b2;border-radius:16px;padding:24px 16px;text-align:center;box-shadow:0 3px 12px rgba(7,24,45,.04)}.detail-hero h2{font-size:30px;margin:0 0 6px}.detail-hero strong,.detail-hero span{display:block}.detail-hero span{font-size:13px;color:#64758a;margin-top:6px}
.detail-metrics{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}.detail-metric{min-width:0;display:grid;place-content:center;gap:18px;text-align:center;background:#fff;border:1px solid #d5e2ef;border-radius:12px;padding:18px 10px}.detail-metric span{font-size:11px;color:#52667d}.detail-metric strong{font-size:19px;overflow-wrap:anywhere}.detail-discount{background:#effcfb;border-top:3px solid #12aba3}.detail-discount strong{color:#008c83}
.detail-heading{font-size:18px;margin:6px 0 -12px;border-left:3px solid #12aba3;padding-left:10px}.detail-indicators{background:#fff;border:1px solid #d5e2ef;border-radius:13px;overflow:hidden}.detail-indicator-head,.detail-indicator{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 16px;font-size:13px}.detail-indicator-head{background:#0c1b2b;color:#fff}.detail-indicator{border-top:1px solid #e7edf4}.detail-indicator span{color:#52667d}.detail-summary{background:#fff;border:1px solid #d5e2ef;border-left:3px solid #13b8b2;border-radius:12px;padding:18px 20px;font-size:14px;line-height:1.6;color:#405a73}.detail-disclaimer{font-size:12px;line-height:1.7;color:#61758b;margin-bottom:12px}.detail-important-link{border:0;background:transparent;padding:0;color:#087f86;text-decoration:underline;font:inherit;cursor:pointer}
@media(max-width:900px){.detail-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.detail-metric:last-child{grid-column:1/-1}}@media(max-width:480px){.selection-detail{gap:18px}.detail-hero h2{font-size:25px}.detail-metric{gap:10px;padding:14px 8px}.detail-metric strong{font-size:16px}.detail-indicator-head,.detail-indicator{padding:12px}}
'''
cssp.write_text(css,encoding='utf-8')

html=htmlp.read_text(encoding='utf-8')
assert html.count('/invest/selection-details.js?v=1')==0
anchor='<script type="module" src="/invest/private.js?v=8"></script>'
assert html.count(anchor)==1
html=html.replace(anchor,anchor+'\n<script type="module" src="/invest/selection-details.js?v=1"></script>',1)
htmlp.write_text(html,encoding='utf-8')
print('PASS: HTML, CSS e índice de linhas atualizados sem modificar backend ou dados de ranking')
