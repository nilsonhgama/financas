export interface FinanceItem {
  id: string;
  name: string;
}

export interface MonthInfo {
  id: string;   // e.g. "2026-01"
  name: string; // e.g. "Janeiro"
}

export type GroupKey = 'entradas' | 'fixas' | 'variaveis';

export interface GroupConfig {
  key: GroupKey;
  title: string;
  color: string;
}

export interface FinanceGroups {
  entradas: FinanceItem[];
  fixas: FinanceItem[];
  variaveis: FinanceItem[];
}

export type ValuesMap = Record<string, Record<string, number>>; // monthId -> itemId -> number

export interface AppState {
  year: number;
  months: MonthInfo[];
  groups: FinanceGroups;
  values: ValuesMap;
}

export interface MonthTotals {
  e: number; // entradas
  f: number; // fixas
  v: number; // variaveis
  s: number; // saldo
}
