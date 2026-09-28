(() => {
  const API = 'https://zbtijblvkzkeposvkfob.supabase.co/functions/v1/invest-commercial-demo';

  const brl = value => value == null ? '—' : Number(value).toLocaleString('pt-BR', {
    style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2
  });
  const num = value => value == null ? '—' : Number(value).toLocaleString('pt-BR', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  });
  const pct = value => value == null ? '—' : (Number(value) * 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  }) + '%';
  const pct1 = value => value == null ? '—' : (Number(value) * 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 1, maximumFractionDigits: 1
  }) + '%';

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el && value != null) el.textContent = value;
  };

  function setBadge(id, discount) {
    const el = document.getElementById(id);
    if (!el || discount == null) return;
    const d = Number(discount);
    if (!Number.isFinite(d)) return;
    if (d >= 0) {
      el.textContent = pct1(d) + ' de desconto';
      el.classList.remove('over');
    } else {
      el.textContent = pct1(Math.abs(d)) + ' acima do alvo';
      el.classList.add('over');
    }
  }

  function renderChart(prefix, history, target, height) {
    const line = document.getElementById(prefix + 'Line');
    const area = document.getElementById(prefix + 'Area');
    const targetLine = document.getElementById(prefix + 'TargetLine');
    if (!line || !area || !Array.isArray(history) || history.length < 2) return;

    const rows = history.slice(-12).filter(x => Number.isFinite(Number(x.price)));
    if (rows.length < 2) return;

    const prices = rows.map(x => Number(x.price));
    const targetN = Number(target);
    const values = Number.isFinite(targetN) ? [...prices, targetN] : prices;
    let min = Math.min(...values);
    let max = Math.max(...values);
    if (max === min) { max += 1; min -= 1; }
    const pad = (max - min) * 0.12;
    min -= pad; max += pad;

    const top = 10;
    const bottom = height - 8;
    const x = i => rows.length === 1 ? 0 : i * (300 / (rows.length - 1));
    const y = v => top + (max - v) * ((bottom - top) / (max - min));
    const points = prices.map((p, i) => x(i).toFixed(1) + ',' + y(p).toFixed(1)).join(' ');

    line.setAttribute('points', points);
    area.setAttribute('d', 'M' + points.replaceAll(' ', ' L') + ' L300,' + height + ' L0,' + height + ' Z');

    if (targetLine && Number.isFinite(targetN)) {
      const ty = y(targetN).toFixed(1);
      targetLine.setAttribute('y1', ty);
      targetLine.setAttribute('y2', ty);
    }
  }

  async function load() {
    try {
      const r = await fetch(API, { cache: 'no-store' });
      if (!r.ok) return;
      const j = await r.json();
      const rows = Array.isArray(j.data) ? j.data : [];
      const byTicker = new Map(rows.map(row => [String(row.ticker || '').toUpperCase(), row]));

      const rent = byTicker.get('RENT3');
      if (rent) {
        setText('rentCurrent', brl(rent.current_price));
        setText('rentTarget', brl(rent.target_price));
        setText('rentDiscount', pct1(Math.abs(Number(rent.discount_pct))));
        setText('rentDiscountLabel', Number(rent.discount_pct) >= 0 ? 'Desconto' : 'Acima do alvo');
        setText('rentQuality', rent.quality_score == null ? '—' : Math.round(Number(rent.quality_score)) + '/100');
        const rentDiscount = document.getElementById('rentDiscount');
        if (rentDiscount) rentDiscount.classList.toggle('pos', Number(rent.discount_pct) >= 0);
        setBadge('rentBadge', rent.discount_pct);
        renderChart('rent', j.history?.RENT3 || [], rent.target_price, 80);
      }

      const itub = byTicker.get('ITUB4');
      if (itub) {
        setText('itubCurrent', brl(itub.current_price));
        setText('itubTarget', brl(itub.target_price));
        setText('itubQuality', itub.quality_score == null ? '—' : Math.round(Number(itub.quality_score)) + '/100');
        setText('itubDyTop', pct(itub.dividend_yield));
        setText('itubPl', num(itub.pl));
        setText('itubPvp', num(itub.pvp));
        setText('itubDy', pct(itub.dividend_yield));
        setText('itubRoe', pct(itub.roe));
        setBadge('itubBadge', itub.discount_pct);
        renderChart('itub', j.history?.ITUB4 || [], itub.target_price, 110);
      }
    } catch (_) {
      // Mantém os valores de fallback da página se a fonte estiver temporariamente indisponível.
    }
  }

  load();
  window.setInterval(load, 5 * 60 * 1000);
})();