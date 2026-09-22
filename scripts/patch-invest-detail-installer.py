from pathlib import Path
p=Path('scripts/apply-invest-selection-details.py')
s=p.read_text(encoding='utf-8')
s=s.replace("assert js.count('  const body=rows.map(r=>')==1","assert js.count('  const body=rows.map(r=>{const d=')==1")
s=s.replace("js=js.replace('  const body=rows.map(r=>','  window.axivaSelectionRows=rows\\n  const body=rows.map((r,index)=>',1)","js=js.replace('  const body=rows.map(r=>{const d=','  window.axivaSelectionRows=rows\\n  const body=rows.map((r,index)=>{const d=',1)")
lines=s.splitlines()
for i,line in enumerate(lines):
    if line.startswith("old='<div class="):
        lines[i]="old='<div class=\"private-row\"><div>${r.position'"
    elif line.startswith("new='<div class="):
        lines[i]="new='<div class=\"private-row selection-clickable\" data-selection-index=\"${index}\" role=\"button\" tabindex=\"0\" aria-label=\"Ver detalhes de ${esc(r.ticker)}\"><div>${r.position'"
s='\n'.join(lines)+'\n'
assert 'rows.map(r=>{const d=' in s and 'selection-clickable' in s
p.write_text(s,encoding='utf-8')
print('PASS: seletor restrito ao ranking e aspas HTML corrigidas')
