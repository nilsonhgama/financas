import React from 'react';
import { MonthInfo } from '../types/finance';
import { monthName } from '../utils/formatters';

interface MonthChipsProps {
  months: MonthInfo[];
  curMonth: string;
  onSelectMonth: (monthId: string) => void;
}

export const MonthChips: React.FC<MonthChipsProps> = ({ months, curMonth, onSelectMonth }) => {
  return (
    <nav id="months" className="chips" aria-label="Escolher mês">
      {months.map((m) => (
        <button
          key={m.id}
          className="chip"
          data-m={m.id}
          aria-pressed={m.id === curMonth}
          onClick={() => onSelectMonth(m.id)}
        >
          {monthName(m.id).slice(0, 3)}
        </button>
      ))}
    </nav>
  );
};
