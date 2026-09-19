import { AppState, GroupKey, MonthTotals } from '../types/finance';

export const MESES_NOMES = [
  'Janeiro','Fevereiro','Março','Abril','Maio',
  'Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
];

export const ANO_ATUAL = new Date().getFullYear();

export const GROUPS_CONFIG = [
  { key: 'entradas' as GroupKey,  title: 'Entradas',           color: 'var(--in)' },
  { key: 'fixas' as GroupKey,     title: 'Despesas Fixas',     color: 'var(--fix)' },
  { key: 'variaveis' as GroupKey, title: 'Despesas Variáveis', color: 'var(--var)' }
];

export const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

export const COMPACT = new Intl.NumberFormat('pt-BR', {
  notation: 'compact',
  maximumFractionDigits: 1
});

export function money(n: number): string {
  return BRL.format(Math.round(n * 100) / 100).replace(/\u00a0/g, ' ');
}

export function parseNum(s: string): number {
  s = String(s).replace(/[^\d.,-]/g, '');
  if (!s || s === '-') return 0;
  const c = s.indexOf(',') > -1, d = s.indexOf('.') > -1;
  if (c && d) s = s.replace(/\./g, '').replace(',', '.');
  else if (c) s = s.replace(',', '.');
  else if (d && /^-?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  const n = parseFloat(s);
  return isFinite(n) ? n : 0;
}

export function fmtIn(n: number): string {
  return n ? String(n).replace('.', ',') : '';
}

export function uid(): string {
  return 'i' + Math.random().toString(36).slice(2, 8);
}

export function monthName(mId: string): string {
  const parts = mId.split('-');
  const monthNum = parseInt(parts[1], 10);
  return MESES_NOMES[monthNum - 1] || 'Mês';
}

export function makeDefaultState(): AppState {
  const months = [];
  for (let i = 1; i <= 12; i++) {
    const mStr = (i < 10 ? '0' : '') + i;
    months.push({ id: `${ANO_ATUAL}-${mStr}`, name: MESES_NOMES[i - 1] });
  }

  return {
    year: ANO_ATUAL,
    months,
    groups: {
      entradas: [
        { id: 'e_sal', name: 'Salário Principal' },
        { id: 'e_ext', name: 'Renda Extra / Outros' }
      ],
      fixas: [
        { id: 'f_alu', name: 'Aluguel / Prestação' },
        { id: 'f_cond', name: 'Condomínio' },
        { id: 'f_int', name: 'Internet / Celular' }
      ],
      variaveis: [
        { id: 'v_mer', name: 'Supermercado' },
        { id: 'v_luz', name: 'Luz / Água' },
        { id: 'v_out', name: 'Outros Gastos' }
      ]
    },
    values: {}
  };
}

export function calcMonthTotals(state: AppState, mId: string): MonthTotals {
  const vMap = state.values[mId] || {};
  
  const sumGroup = (key: GroupKey) => {
    return (state.groups[key] || []).reduce((acc, item) => acc + (vMap[item.id] || 0), 0);
  };

  const e = sumGroup('entradas');
  const f = sumGroup('fixas');
  const v = sumGroup('variaveis');
  const s = e - f - v;

  return { e, f, v, s };
}
