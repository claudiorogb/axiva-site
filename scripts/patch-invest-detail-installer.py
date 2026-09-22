from pathlib import Path
p=Path('scripts/apply-invest-selection-details.py')
s=p.read_text(encoding='utf-8')
s=s.replace("assert js.count('  const body=rows.map(r=>')==1","assert js.count('  const body=rows.map(r=>{const d=')==1")
s=s.replace("js=js.replace('  const body=rows.map(r=>','  window.axivaSelectionRows=rows\\n  const body=rows.map((r,index)=>',1)","js=js.replace('  const body=rows.map(r=>{const d=','  window.axivaSelectionRows=rows\\n  const body=rows.map((r,index)=>{const d=',1)")
assert "rows.map(r=>{const d=" in s
p.write_text(s,encoding='utf-8')
print('PASS: seletor restrito à tabela do ranking')
