import React, { useState } from 'react';
import { AppState } from '../types/finance';
import { calcMonthTotals, COMPACT, money, monthName } from '../utils/formatters';

interface AnnualViewProps {
  state: AppState;
  onSelectMonth: (mId: string) => void;
  onReplicateJan: () => void;
  onClearAllData: () => void;
}

export const AnnualView: React.FC<AnnualViewProps> = ({
  state,
  onSelectMonth,
  onReplicateJan,
  onClearAllData
}) => {
  const [armedClearAll, setArmedClearAll] = useState(false);

  let totIn = 0;
  let totFix = 0;
  let totVar = 0;
  let totOut = 0;
  let totBal = 0;

  const monthRows = state.months.map((m) => {
    const t = calcMonthTotals(state, m.id);
    const spent = t.f + t.v;
    totIn += t.e;
    totFix += t.f;
    totVar += t.v;
    totOut += spent;
    totBal += t.s;

    return {
      id: m.id,
      name: monthName(m.id),
      totals: t,
      spent
    };
  });

  const avgOut = totOut / 12;
  const avgBal = totBal / 12;

  const base = Math.max(totIn, totOut, 1);
  const pF = ((totFix / base) * 100).toFixed(1);
  const pV = ((totVar / base) * 100).toFixed(1);
  const pS = ((Math.max(totBal, 0) / base) * 100).toFixed(1);

  /* SVG Chart Data */
  const n = state.months.length;
  const gw = Math.max(80, 320 / n);
  const W = gw * n;
  const top = 20;
  const ph = 110;
  const H = top + ph + 36;
  const bw = 22;
  const gap = 4;

  let maxV = 1;
  state.months.forEach((m) => {
    const t = calcMonthTotals(state, m.id);
    maxV = Math.max(maxV, t.e, t.v + t.f);
  });

  const handleClearAllClick = () => {
    if (!armedClearAll) {
      setArmedClearAll(true);
      setTimeout(() => setArmedClearAll(false), 3000);
      return;
    }
    setArmedClearAll(false);
    onClearAllData();
  };

  return (
    <div id="viewAnnual">
      <section className="card">
        <div className="card-head">
          <h2>Resumo Geral do Ano ({state.year})</h2>
        </div>

        <div className="annual-grid">
          <div className="annual-stat">
            <label>Entradas Anuais</label>
            <span className="stat-val" style={{ color: 'var(--in)' }}>{money(totIn)}</span>
          </div>
          <div className="annual-stat">
            <label>Saídas Anuais</label>
            <span className="stat-val" style={{ color: 'var(--bad)' }}>{money(totOut)}</span>
          </div>
          <div className={`annual-stat ${totBal >= 0 ? 'pos' : 'neg'}`}>
            <label>Saldo Anual</label>
            <span className="stat-val">{money(totBal)}</span>
          </div>
          <div className="annual-stat">
            <label>Média Mensal Saída</label>
            <span className="stat-val">{money(avgOut)}</span>
          </div>
        </div>

        <div className="split" style={{ marginTop: '16px' }}>
          <span style={{ width: `${pF}%`, background: 'var(--fix)' }}></span>
          <span style={{ width: `${pV}%`, background: 'var(--var)' }}></span>
          <span style={{ width: `${pS}%`, background: 'var(--ok)' }}></span>
        </div>

        <ul className="legend">
          <li style={{ ['--c' as any]: 'var(--fix)' }}>
            <i></i>Fixas Anuais<b>{money(totFix)}</b>
          </li>
          <li style={{ ['--c' as any]: 'var(--var)' }}>
            <i></i>Variáveis Anuais<b>{money(totVar)}</b>
          </li>
          <li style={{ ['--c' as any]: 'var(--ok)' }}>
            <i></i>Média Saldo/Mês<b>{money(avgBal)}</b>
          </li>
        </ul>
      </section>

      {/* Gráfico Anual de 12 Meses */}
      <section className="card">
        <div className="card-head">
          <h2>Balanço dos 12 Meses</h2>
        </div>
        <div className="chartwrap">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            style={{ width: W > 320 ? `${W}px` : '100%', maxWidth: W > 320 ? 'none' : '100%' }}
          >
            {state.months.map((m, i) => {
              const t = calcMonthTotals(state, m.id);
              const cx = i * gw + gw / 2;
              const hE = (t.e / maxV) * ph;
              const hF = (t.f / maxV) * ph;
              const hV = (t.v / maxV) * ph;
              const b = top + ph;

              return (
                <g key={m.id} className="col" onClick={() => onSelectMonth(m.id)}>
                  <rect className="hit" x={i * gw} y={0} width={gw} height={H} />
                  <rect className="b-in" x={cx - bw - gap / 2} y={b - hE} width={bw} height={hE} />
                  <rect className="b-fix" x={cx + gap / 2} y={b - hF} width={bw} height={hF} />
                  <rect className="b-var" x={cx + gap / 2} y={b - hF - hV} width={bw} height={hV} />
                  <text className="t-mon" x={cx} y={b + 16}>
                    {monthName(m.id).slice(0, 3)}
                  </text>
                  <text className={`t-sal ${t.s >= 0 ? 'pos' : 'neg'}`} x={cx} y={b + 32}>
                    {t.s >= 0 ? '+' : '−'}{COMPACT.format(Math.abs(t.s))}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </section>

      {/* Tabela Detalhada Anual */}
      <section className="card">
        <div className="card-head">
          <h2>Detalhamento Mensal</h2>
        </div>
        <table className="annual-table">
          <thead>
            <tr>
              <th>Mês</th>
              <th style={{ textAlign: 'right' }}>Entrou</th>
              <th style={{ textAlign: 'right' }}>Saiu</th>
              <th style={{ textAlign: 'right' }}>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {monthRows.map((r) => (
              <tr key={r.id} onClick={() => onSelectMonth(r.id)}>
                <td><b>{r.name}</b></td>
                <td style={{ textAlign: 'right', color: 'var(--in)' }}>{money(r.totals.e)}</td>
                <td style={{ textAlign: 'right', color: 'var(--bad)' }}>{money(r.spent)}</td>
                <td style={{ textAlign: 'right' }}>
                  <span className={`sal-pill ${r.totals.s >= 0 ? 'pos' : 'neg'}`}>
                    {r.totals.s >= 0 ? '+' : ''}{money(r.totals.s)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="quick-tools">
        <button
          className="btn-action primary"
          type="button"
          onClick={onReplicateJan}
        >
          ⚡ Replicar valores de Jan para o Ano todo
        </button>
        <button
          className={`btn-action danger ${armedClearAll ? 'armed' : ''}`}
          type="button"
          onClick={handleClearAllClick}
        >
          {armedClearAll ? 'Confirmar Exclusão Geral' : '🗑️ Limpar / Apagar Todos os Dados'}
        </button>
      </div>
    </div>
  );
};
