import React from 'react';
import { AppState } from '../types/finance';
import { calcMonthTotals, COMPACT, money, monthName } from '../utils/formatters';

interface MonthlyChartProps {
  state: AppState;
  curMonthId: string;
  onSelectMonth: (mId: string) => void;
}

export const MonthlyChart: React.FC<MonthlyChartProps> = ({ state, curMonthId, onSelectMonth }) => {
  const ms = state.months;
  const n = ms.length;
  const gw = Math.max(104, 320 / n);
  const W = gw * n;
  const top = 22;
  const ph = 120;
  const H = top + ph + 44;
  const bw = 26;
  const gap = 4;

  let maxV = 1;
  ms.forEach((m) => {
    const t = calcMonthTotals(state, m.id);
    maxV = Math.max(maxV, t.e, t.v + t.f);
  });

  const accBalance = ms.reduce((acc, m) => acc + calcMonthTotals(state, m.id).s, 0);

  return (
    <section className="card" aria-labelledby="chartTitle">
      <div className="card-head">
        <h2 id="chartTitle">Mês a mês</h2>
        <div className="acc">
          Saldo Acumulado
          <b className={accBalance >= 0 ? 'pos' : 'neg'}>{money(accBalance)}</b>
        </div>
      </div>

      <div className="chartwrap">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: W > 320 ? `${W}px` : '100%', maxWidth: W > 320 ? 'none' : '100%' }}
        >
          {ms.map((m, i) => {
            const t = calcMonthTotals(state, m.id);
            const cx = i * gw + gw / 2;
            const hE = (t.e / maxV) * ph;
            const hF = (t.f / maxV) * ph;
            const hV = (t.v / maxV) * ph;
            const base = top + ph;

            return (
              <g
                key={m.id}
                className={`col ${m.id === curMonthId ? 'sel' : ''}`}
                tabIndex={0}
                role="button"
                onClick={() => onSelectMonth(m.id)}
              >
                <rect className="hit" x={i * gw + 4} y={0} width={gw - 8} height={H} rx={12} />
                <rect className="b-in" x={cx - bw - gap / 2} y={base - hE} width={bw} height={hE} />
                <rect className="b-fix" x={cx + gap / 2} y={base - hF} width={bw} height={hF} />
                <rect className="b-var" x={cx + gap / 2} y={base - hF - hV} width={bw} height={hV} />
                <text className="t-val" x={cx - bw / 2 - gap / 2} y={base - hE - 5}>
                  {COMPACT.format(t.e)}
                </text>
                <text className="t-val" x={cx + bw / 2 + gap / 2} y={base - hF - hV - 5}>
                  {COMPACT.format(t.f + t.v)}
                </text>
                <text className="t-mon" x={cx} y={base + 19}>
                  {monthName(m.id).slice(0, 3)}
                </text>
                <text className={`t-sal ${t.s >= 0 ? 'pos' : 'neg'}`} x={cx} y={base + 37}>
                  {t.s >= 0 ? '+' : '−'}{money(Math.abs(t.s))}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="key">
        <span style={{ ['--c' as any]: 'var(--in)' }}><i></i>Entradas</span>
        <span style={{ ['--c' as any]: 'var(--fix)' }}><i></i>Fixas</span>
        <span style={{ ['--c' as any]: 'var(--var)' }}><i></i>Variáveis</span>
      </div>
    </section>
  );
};
