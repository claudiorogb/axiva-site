/* Conteúdo informativo da área exclusiva AXIVA Invest. Carregar antes de private.js. */
(() => {
  const method = document.getElementById('methodPage');
  const admin = document.getElementById('adminPage');
  const nav = document.querySelector('.sidebar nav');
  if (!method || !admin || !nav) return;
  method.innerHTML = `
    <div class="intro member-intro"><div>
      <h2>Como funciona nossa seleção de Ações</h2>
      <p>Desenvolvemos essa seleção para identificar empresas que combinam bons fundamentos financeiros com preço de mercado atrativo em relação ao preço alvo estimado por nossa metodologia.</p>
      <p>O objetivo é evitar que uma empresa apareça bem posicionada apenas porque sua cotação está abaixo do preço estimado, quando seus fundamentos não apresentam bons números.</p>
    </div></div>
    <div class="member-content">
      <section class="member-block"><h3>1. Fundamentos</h3>
        <p>O primeiro passo é verificar se a empresa tem boa saúde financeira e operacional.</p>
        <p>Verificamos diferentes indicadores que ajudam a observar aspectos como:</p>
        <ul>
          <li><strong>Rentabilidade:</strong> capacidade da empresa de gerar retorno sobre o capital e sobre o patrimônio.</li>
          <li><strong>Eficiência:</strong> qualidade na utilização dos recursos empregados na operação.</li>
          <li><strong>Endividamento:</strong> nível de dívida e capacidade de suportar seus compromissos financeiros.</li>
          <li><strong>Valuation:</strong> relação entre o preço da ação e os resultados e patrimônio da empresa.</li>
          <li><strong>Dividendos:</strong> histórico e capacidade de geração de resultados distribuíveis aos acionistas.</li>
          <li><strong>Crescimento:</strong> evolução dos resultados e das receitas ao longo do tempo.</li>
          <li><strong>Comparação com o setor:</strong> determinados indicadores são analisados também em relação às características e referências do segmento em que a empresa atua.</li>
        </ul>
        <p>Isso nos permite identificar empresas com fundamentos mais consistentes e, ao mesmo tempo, evitar que distorções isoladas de um único indicador determinem se a empresa entra ou não em nossa seleção.</p>
      </section>
      <section class="member-block"><h3>2. Seleção das empresas</h3>
        <p>Após verificarmos os indicadores, são aplicados critérios fundamentalistas para verificar se a empresa apresenta características compatíveis com o perfil buscado por nós.</p>
        <p>Empresas com fundamentos considerados insuficientes podem ser eliminadas.</p>
        <p>Dessa forma, estar abaixo do preço alvo estimado por nossa metodologia não é suficiente para garantir que a empresa seja selecionada.</p>
      </section>
      <section class="member-block"><h3>3. Metodologia de Preço Alvo AXIVA</h3>
        <p>Buscamos estimar um preço de referência para uma ação com base na relação histórica entre os fundamentos da própria companhia e os múltiplos pelos quais o mercado tradicionalmente a avaliou.</p>
        <p>Para isso, são utilizados dois métodos complementares: P/L atual e histórico e P/VP atual e histórico.</p>
        <p>Os dois resultados são então combinados por meio de uma média aritmética simples, dando origem ao Preço Alvo AXIVA.</p>
        <p>O resultado não representa uma previsão de cotação futura. Trata-se de um preço de referência baseado no histórico de valuation da própria companhia, que deve ser analisado em conjunto com a qualidade e a sustentabilidade de seus fundamentos.</p>
      </section>
      <section class="member-block"><h3>4. Desconto</h3>
        <p>O preço alvo estimado não é tratado como garantia de que a ação atingirá determinado valor.</p>
        <p>Por isso, a metodologia considera também a margem de desconto existente entre o valor estimado e o preço de mercado.</p>
        <p>Quanto maior a diferença entre o valor de referência e a cotação, maior tende a ser a atratividade da empresa sob o ponto de vista do preço.</p>
      </section>
      <section class="member-block"><h3>5. Como selecionamos as empresas</h3>
        <p>Por fim, as duas principais dimensões são combinadas:</p>
        <p class="member-emphasis">Qualidade dos fundamentos + atratividade do preço</p>
        <p>Isso permite diferenciar uma empresa que apresenta apenas uma cotação baixa de outra que, além de estar descontada sob nossa metodologia, apresenta fundamentos mais consistentes.</p>
        <p>O resultado é uma classificação das empresas que melhor conciliam qualidade empresarial e oportunidade de preço dentro dos critérios utilizados pelo modelo.</p>
      </section>
      <section class="member-block"><h3>6. Como interpretar o resultado</h3>
        <p>Uma empresa estar no site AXIVA significa que a empresa apresentou uma combinação mais favorável entre os critérios analisados.</p>
        <p>Isso não significa que a empresa seja necessariamente a melhor ação do mercado, nem que seu preço irá subir ou que o valor apresentado pela metodologia AXIVA seja o mais correto do mercado. Incentivamos inclusive que nosso valor alvo seja confrontado com outros métodos para uma melhor avaliação por parte do investidor.</p>
        <p>Nossa seleção de ações deve ser utilizada como uma ferramenta de análise e comparação, ajudando o investidor a identificar empresas que merecem uma análise mais aprofundada.</p>
        <div class="member-highlight"><h4>Importante:</h4><p>Os valores apresentados são estimativas baseadas em dados e modelos de análise fundamentalista. Mudanças nos resultados das empresas, nas condições econômicas, nas perspectivas dos setores ou nas condições de mercado podem alterar significativamente essas avaliações. Todas as nossas avaliações são obtidas através de dados públicos disponibilizados pelas empresas listadas na B3.</p></div>
      </section>
      <section class="member-block"><h3>7. Como interpretar a Pontuação AXIVA</h3>
        <p>Cada empresa recebe uma pontuação AXIVA de 0 a 100, que representa seu grau de atratividade dentro do universo de empresas analisadas pela metodologia.</p>
        <p>É importante destacar que as empresas apresentadas já passaram pelos critérios mínimos de seleção definidos pela AXIVA. Portanto, uma pontuação mais baixa não significa necessariamente que a empresa tenha fundamentos ruins, mas que apresentou menor pontuação relativa no conjunto de critérios avaliados.</p>
        <p>Quanto maior a pontuação, mais favorável é a combinação entre fundamentos e valuation identificada pelo modelo.</p>
        <h4>Classificação da Pontuação:</h4>
        <ul>
          <li><strong>80–100 - Excepcional:</strong> Empresas que se destacam, reunindo fundamentos sólidos e elevada qualidade financeira.</li>
          <li><strong>70–79 - Excelente:</strong> Empresas com um conjunto muito consistente de fundamentos e valuation, apresentando elevado equilíbrio entre qualidade empresarial e preço de mercado.</li>
          <li><strong>60–69 - Muito Boa:</strong> Empresas que apresentam uma combinação bastante favorável de fundamentos e preço, com indicadores de qualidade e valuation que se destacam positivamente na análise.</li>
          <li><strong>50–59 - Boa:</strong> Empresas que reúnem fundamentos satisfatórios.</li>
          <li><strong>40–49 - Atrativa:</strong> Empresas que superaram os critérios de seleção da AXIVA e apresentam características que justificam atenção.</li>
          <li><strong>30–39 - Seletiva:</strong> Empresas que atenderam aos requisitos mínimos, mas apresentam uma combinação menos equilibrada de fundamentos, valuation e demais critérios.</li>
          <li><strong>0–29 - Baixa Atratividade:</strong> Empresas que, embora atendam aos critérios da metodologia, apresentam menor aderência ao conjunto de características buscadas pela AXIVA.</li>
        </ul>
        <p>A seleção AXIVA não deve ser interpretada isoladamente. Uma pontuação elevada não representa recomendação de compra, assim como uma pontuação menor não representa necessariamente uma empresa de baixa qualidade.</p>
        <p>O objetivo da pontuação é facilitar a comparação entre as empresas que atendem aos critérios da metodologia, indicando quais apresentam, segundo o modelo, a combinação mais favorável entre fundamentos e preço.</p>
        <p><strong>Nossa seleção possui caráter exclusivamente informativo e educacional e não constitui recomendação, indicação ou oferta de compra ou venda de ações.</strong></p>
      </section>
    </div>`;

  const faq = document.createElement('section');
  faq.id = 'faqPage'; faq.className = 'page';
  faq.innerHTML = `<div class="intro member-intro"><h2>Perguntas frequentes</h2></div><div class="member-content">
    <section class="member-block"><h3>Com que frequência as informações são atualizadas?</h3>
      <p>Nossa seleção é atualizada semanalmente e a nova versão fica disponível para consulta a partir de segunda-feira. As cotações das ações são atualizadas diariamente.</p>
      <p>A atualização semanal não significa que as empresas necessariamente sejam substituídas por novas. Os fundamentos das empresas podem permanecer estáveis entre uma atualização e outra, enquanto as cotações podem variar diariamente. Dessa forma, as informações refletem as condições mais recentes disponíveis para análise.</p></section>
    <section class="member-block"><h3>O que significa uma empresa estar acima de outra na tabela?</h3>
      <p>Significa que, no momento da atualização, essa empresa apresentou a melhor combinação entre qualidade dos fundamentos e atratividade dentro dos critérios utilizados.</p></section>
    <section class="member-block"><h3>O preço alvo AXIVA é uma previsão?</h3>
      <p>Não. O preço apresentado é uma estimativa de valor, calculada com base em critérios fundamentalistas. Ele serve como uma referência para comparar o valor estimado da empresa com sua cotação de mercado.</p>
      <p>O preço de mercado pode permanecer acima ou abaixo dessa estimativa e sofrer alterações por diversos fatores.</p></section>
    <section class="member-block"><h3>Por que uma empresa pode sair da tabela?</h3>
      <p>Uma empresa pode deixar de aparecer quando seus fundamentos, sua avaliação ou sua relação entre preço e valor estimado deixam de atender aos critérios estabelecidos pela metodologia.</p>
      <p>Isso significa que a composição da tabela pode mudar ao longo do tempo conforme os dados e as condições de mercado se alteram.</p></section>
    <section class="member-block"><h3>As ações selecionadas pela metodologia são uma recomendação de compra?</h3>
      <p>Não. Nossa seleção é uma ferramenta de análise e comparação, criada para identificar empresas que apresentam uma combinação favorável dentro da metodologia aplicada pela AXIVA.</p>
      <p>A presença ou a posição de uma empresa não constitui recomendação ou indicação de compra ou venda de ações. A decisão de investimento é de responsabilidade do próprio investidor.</p></section>
  </div>`;
  admin.before(faq);

  const info = document.createElement('section');
  info.id = 'important-infoPage'; info.className = 'page';
  info.innerHTML = `<div class="intro member-intro"><div><h2>Informações importantes</h2><p>As informações disponibilizadas pela AXIVA têm caráter exclusivamente informativo e educacional e não constituem recomendação, indicação, oferta ou solicitação para compra ou venda de ativos financeiros.</p></div></div><div class="member-content">
    <section class="member-block"><h3>1. Natureza das informações</h3>
      <p>Nossa seleção de ações tem como objetivo apresentar informações que possam auxiliar o investidor em seu processo de tomada de decisão. A decisão de realizar ou não qualquer investimento é de responsabilidade exclusiva do próprio investidor, que deve considerar seu perfil de investidor, objetivos, horizonte de investimento e tolerância ao risco.</p>
      <p>As informações apresentadas são baseadas em dados e fontes públicas disponíveis na data de sua elaboração e podem estar sujeitas a alterações, atrasos, inconsistências ou erros. A AXIVA não garante a exatidão, completude ou atualização permanente dessas informações.</p></section>
    <section class="member-block"><h3>2. Metodologia e análises</h3>
      <p>Os resultados apresentados são obtidos a partir da aplicação de critérios e metodologias de análise fundamentalista e valuation definidos pela AXIVA. Esses critérios podem ser alterados ou aprimorados ao longo do tempo em função de mudanças metodológicas, econômicas ou nas condições de mercado.</p>
      <p>A inclusão ou classificação de determinado ativo não significa que esse ativo seja adequado a todos os investidores ou que seu desempenho futuro esteja garantido.</p></section>
    <section class="member-block"><h3>3. Riscos e responsabilidade do investidor</h3>
      <p>Investimentos em renda variável envolvem riscos, inclusive a possibilidade de perda parcial ou total do capital investido. A utilização das informações disponibilizadas pela AXIVA ocorre por conta e risco do usuário.</p>
      <p>A AXIVA não garante resultados, rentabilidade ou desempenho futuro dos ativos apresentados e não se responsabiliza por decisões de investimento tomadas exclusivamente com base nas informações disponibilizadas.</p></section>
    <section class="member-block"><h3>4. Resultados passados</h3><p>Resultados, rentabilidades ou desempenhos passados não constituem garantia de resultados futuros.</p></section>
    <section class="member-block"><h3>5. Atualização</h3><p>As informações podem ser atualizadas periodicamente. A existência de determinada empresa ou ativo em nossa seleção em uma determinada data não implica recomendação de manutenção, compra ou venda desse ativo.</p></section>
  </div>`;
  admin.before(info);

  const adminNav = document.getElementById('adminNav');
  for (const [page,label] of [['faq','FAQ'],['important-info','Informações importantes']]) {
    if (nav.querySelector(`[data-page="${page}"]`)) continue;
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'nav-item'; button.dataset.page = page; button.textContent = label;
    nav.insertBefore(button, adminNav);
  }
  const style = document.createElement('style');
  style.textContent = `
    body:has(#methodPage.active) #pageTitle {display:none}
    .member-content {display:grid;gap:16px;max-width:100%}
    .member-intro {display:block}.member-intro h2 {font-size:clamp(24px,2vw,30px);margin:0 0 12px}
    .member-intro p {font-size:15px;line-height:1.75;max-width:1050px;margin:0 0 12px}
    .member-block {background:#fff;border:1px solid #dbe4ed;border-radius:18px;padding:24px 28px;box-shadow:0 10px 28px rgba(7,24,45,.05);min-width:0}
    .member-block h3 {font-size:21px;line-height:1.3;margin:0 0 14px;color:#07182d}
    .member-block h4 {font-size:16px;margin:18px 0 10px;color:#07182d}
    .member-block p,.member-block li {font-size:15px;line-height:1.8;color:#52667d}
    .member-block p {margin:0 0 14px}.member-block p:last-child {margin-bottom:0}
    .member-block ul {padding-left:23px;margin:0 0 16px}.member-block li {margin-bottom:9px}
    .member-block strong {color:#07182d}.member-emphasis {font-weight:900;color:#087c78!important}
    .member-highlight {border:1px solid #cce6e4;background:#f0fbfa;border-radius:14px;padding:16px 18px;margin-top:18px}
    .member-highlight h4 {margin:0 0 8px}
    @media(max-width:700px){.member-block{padding:18px 16px}.member-block h3{font-size:19px}.member-block p,.member-block li{font-size:14px}.member-intro p{font-size:14px}}
  `;
  document.head.append(style);
})();