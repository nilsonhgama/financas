import React from 'react';
import { MonthTotals } from '../types/finance';
import { money, monthName } from '../utils/formatters';

interface MonthlyHeroProps {
  curMonthId: string;
  totals: MonthTotals;
}

export const MonthlyHero: React.FC<MonthlyHeroProps> = ({ curMonthId, totals }) => {
  const name = monthName(curMonthId).toLowerCase();
  const spent = totals.v + totals.f;
  const base = Math.max(totals.e, spent, 1);
  const pF = (totals.f / base) * 100;
  const pV = (totals.v / base) * 100;
  const pS = (Math.max(totals.s, 0) / base) * 100;
  const used = totals.e > 0 ? Math.round((spent / totals.e) * 100) : 0;

  return (
    <section className="hero" aria-live="polite">
      <p className="hero-label">{totals.s >= 0 ? 'Saldo' : 'Faltou'} em {name}</p>
      <p className={`hero-value ${totals.s < 0 ? 'neg' : ''}`}>
        {money(Math.abs(totals.s))}
      </p>
      <p className="hero-sub">
        Entrou {money(totals.e)} e saiu {money(spent)}
        {totals.e > 0 ? ` (${used}% da entrada)` : ''}.
      </p>
      <div className="split" role="img" aria-label="Divisão de gastos">
        <span style={{ width: `${pF}%`, background: 'var(--fix)' }}></span>
        <span style={{ width: `${pV}%`, background: 'var(--var)' }}></span>
        <span style={{ width: `${pS}%`, background: 'var(--ok)' }}></span>
      </div>
      <ul className="legend">
        <li style={{ ['--c' as any]: 'var(--fix)' }}>
          <i></i>Fixas<b>{money(totals.f)}</b>
        </li>
        <li style={{ ['--c' as any]: 'var(--var)' }}>
          <i></i>Variáveis<b>{money(totals.v)}</b>
        </li>
        <li style={{ ['--c' as any]: totals.s >= 0 ? 'var(--ok)' : 'var(--bad)' }}>
          <i></i>{totals.s >= 0 ? 'Saldo' : 'Falta'}<b>{money(Math.abs(totals.s))}</b>
        </li>
      </ul>
    </section>
  );
};
