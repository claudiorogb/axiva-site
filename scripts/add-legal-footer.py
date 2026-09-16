from pathlib import Path

replacements = {
    'crm/index.html': (
        '<footer class="footer"><div class="container footer-inner"><span>© 2026 AXIVA CRM</span><div class="footer-links"><a href="/crm/o-que-e-crm">O que é CRM?</a><a href="/">Voltar para AXIVA</a></div></div></footer>',
        '<footer class="footer"><div class="container footer-inner"><span>© 2026 AXIVA CRM</span><div class="footer-links"><a href="/crm/o-que-e-crm">O que é CRM?</a><a href="/privacidade">Política de Privacidade</a><a href="/termos">Termos de Serviço</a><a href="/">Voltar para AXIVA</a></div></div></footer>'
    ),
    'index.html': (
        '<footer class="footer"><div class="container footer-inner"><span>© 2026 AXIVA</span><span>axiva.com.br</span></div></footer>',
        '<footer class="footer"><div class="container footer-inner"><span>© 2026 AXIVA</span><div class="footer-links"><a href="/privacidade">Política de Privacidade</a><a href="/termos">Termos de Serviço</a><span>axiva.com.br</span></div></div></footer>'
    ),
}
for filename, (before, after) in replacements.items():
    path = Path(filename)
    content = path.read_text(encoding='utf-8')
    if before not in content:
        if after in content:
            print(f'{filename}: links já presentes')
            continue
        raise SystemExit(f'Rodapé inesperado em {filename}; nenhuma alteração será aplicada')
    path.write_text(content.replace(before, after, 1), encoding='utf-8')
    print(f'{filename}: links incluídos')
