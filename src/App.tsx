import React, { useEffect, useState } from 'react';
import { AppState } from './types/finance';
import { calcMonthTotals, makeDefaultState } from './utils/formatters';
import { Header } from './components/Header';
import { SegmentedNav } from './components/SegmentedNav';
import { MonthChips } from './components/MonthChips';
import { MonthlyHero } from './components/MonthlyHero';
import { MonthlyChart } from './components/MonthlyChart';
import { ExpenseGroups } from './components/ExpenseGroups';
import { AnnualView } from './components/AnnualView';
import { BackupAndTips } from './components/BackupAndTips';

const LS_KEY = 'financas-iphone-react-v2';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'monthly' | 'annual'>('monthly');
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.months) && parsed.groups && parsed.values) {
          return parsed;
        }
      }
    } catch (e) {}
    return makeDefaultState();
  });

  const [curMonthId, setCurMonthId] = useState<string>(() => state.months[0].id);

  /* Persistir no localStorage sempre que o estado mude */
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch (e) {}
  }, [state]);

  const handleSelectMonth = (monthId: string) => {
    setCurMonthId(monthId);
    if (activeView === 'annual') {
      setActiveView('monthly');
    }
  };

  const handleClearMonthValues = () => {
    const newValues = { ...state.values, [curMonthId]: {} };
    setState({ ...state, values: newValues });
  };

  const handleReplicateJan = () => {
    const firstMonthId = state.months[0].id;
    const janValues = { ...(state.values[firstMonthId] || {}) };
    const newValues: Record<string, Record<string, number>> = {};
    state.months.forEach((m) => {
      newValues[m.id] = { ...janValues };
    });
    setState({ ...state, values: newValues });
    alert(`Valores de ${state.months[0].name} replicados para os 12 meses do ano!`);
  };

  const handleClearAllData = () => {
    const defaultSt = makeDefaultState();
    setState(defaultSt);
    setCurMonthId(defaultSt.months[0].id);
    alert('Todos os dados foram resetados!');
  };

  const curTotals = calcMonthTotals(state, curMonthId);

  return (
    <div className="app">
      <Header />

      <SegmentedNav
        activeView={activeView}
        onChangeView={(view) => setActiveView(view)}
      />

      {activeView === 'monthly' && (
        <MonthChips
          months={state.months}
          curMonth={curMonthId}
          onSelectMonth={handleSelectMonth}
        />
      )}

      <main>
        {activeView === 'monthly' ? (
          <div id="viewMonthly">
            <MonthlyHero curMonthId={curMonthId} totals={curTotals} />

            <MonthlyChart
              state={state}
              curMonthId={curMonthId}
              onSelectMonth={handleSelectMonth}
            />

            <ExpenseGroups
              state={state}
              curMonthId={curMonthId}
              onUpdateState={(newState) => setState(newState)}
              onClearMonth={handleClearMonthValues}
            />
          </div>
        ) : (
          <AnnualView
            state={state}
            onSelectMonth={handleSelectMonth}
            onReplicateJan={handleReplicateJan}
            onClearAllData={handleClearAllData}
          />
        )}

        <BackupAndTips
          state={state}
          onRestoreState={(newState) => {
            setState(newState);
            setCurMonthId(newState.months[0].id);
          }}
        />
      </main>
    </div>
  );
};

export default App;
