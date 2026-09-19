import React, { useState } from 'react';
import { AppState, GroupKey } from '../types/finance';
import { fmtIn, GROUPS_CONFIG, money, monthName, parseNum, uid } from '../utils/formatters';

interface ExpenseGroupsProps {
  state: AppState;
  curMonthId: string;
  onUpdateState: (newState: AppState) => void;
  onClearMonth: () => void;
}

export const ExpenseGroups: React.FC<ExpenseGroupsProps> = ({
  state,
  curMonthId,
  onUpdateState,
  onClearMonth
}) => {
  const [armedDelId, setArmedDelId] = useState<string | null>(null);
  const [armedClearMonth, setArmedClearMonth] = useState<boolean>(false);

  const monthValues = state.values[curMonthId] || {};

  const handleValueChange = (itemId: string, valStr: string) => {
    const numVal = parseNum(valStr);
    const newValues = {
      ...state.values,
      [curMonthId]: {
        ...(state.values[curMonthId] || {}),
        [itemId]: numVal
      }
    };
    onUpdateState({ ...state, values: newValues });
  };

  const handleNameChange = (groupKey: GroupKey, itemId: string, newName: string) => {
    const newGroups = { ...state.groups };
    newGroups[groupKey] = newGroups[groupKey].map((it) =>
      it.id === itemId ? { ...it, name: newName } : it
    );
    onUpdateState({ ...state, groups: newGroups });
  };

  const handleAddItem = (groupKey: GroupKey) => {
    const newItemId = uid();
    const newGroups = { ...state.groups };
    newGroups[groupKey] = [...newGroups[groupKey], { id: newItemId, name: '' }];
    onUpdateState({ ...state, groups: newGroups });
  };

  const handleRemoveItem = (groupKey: GroupKey, itemId: string) => {
    if (armedDelId !== itemId) {
      setArmedDelId(itemId);
      setTimeout(() => setArmedDelId(null), 3000);
      return;
    }

    const newGroups = { ...state.groups };
    newGroups[groupKey] = newGroups[groupKey].filter((i) => i.id !== itemId);

    const newValues = { ...state.values };
    Object.keys(newValues).forEach((mKey) => {
      if (newValues[mKey]) {
        delete newValues[mKey][itemId];
      }
    });

    setArmedDelId(null);
    onUpdateState({ ...state, groups: newGroups, values: newValues });
  };

  const handleClearMonthClick = () => {
    if (!armedClearMonth) {
      setArmedClearMonth(true);
      setTimeout(() => setArmedClearMonth(false), 3000);
      return;
    }
    setArmedClearMonth(false);
    onClearMonth();
  };

  return (
    <>
      <h2 className="sec-title">Lançamentos de {monthName(curMonthId)}</h2>
      <p className="sec-sub">Altere os valores abaixo para calcular na hora.</p>

      <section>
        {GROUPS_CONFIG.map((grp) => {
          const items = state.groups[grp.key] || [];
          const groupTotal = items.reduce(
            (acc, it) => acc + (monthValues[it.id] || 0),
            0
          );

          return (
            <section
              key={grp.key}
              className="group"
              style={{ ['--c' as any]: grp.color }}
            >
              <div className="g-head">
                <h2>{grp.title}</h2>
                <output>{money(groupTotal)}</output>
              </div>

              <ul className="rows">
                {items.map((it) => {
                  const val = monthValues[it.id] || 0;
                  const isArmed = armedDelId === it.id;

                  return (
                    <li key={it.id} className="row" data-id={it.id}>
                      <input
                        className="name"
                        type="text"
                        value={it.name}
                        placeholder="Nome do item"
                        autoComplete="off"
                        onChange={(e) => handleNameChange(grp.key, it.id, e.target.value)}
                      />
                      <label className="money">
                        <span className="cur">R$</span>
                        <input
                          className="val"
                          type="text"
                          inputMode="decimal"
                          value={fmtIn(val)}
                          placeholder="0"
                          autoComplete="off"
                          onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                          onBlur={(e) => {
                            e.target.value = fmtIn(parseNum(e.target.value));
                          }}
                          onChange={(e) => handleValueChange(it.id, e.target.value)}
                        />
                      </label>
                      <button
                        className={`del ${isArmed ? 'armed' : ''}`}
                        type="button"
                        aria-label="Remover item"
                        onClick={() => handleRemoveItem(grp.key, it.id)}
                      >
                        {isArmed ? 'Confirmar' : '×'}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <button
                className="add"
                type="button"
                onClick={() => handleAddItem(grp.key)}
              >
                + Adicionar item
              </button>
            </section>
          );
        })}
      </section>

      <div className="foot">
        <button
          className={`ghost ${armedClearMonth ? 'armed' : ''}`}
          type="button"
          onClick={handleClearMonthClick}
        >
          {armedClearMonth ? 'Confirmar Limpeza' : `Zerar valores de ${monthName(curMonthId)}`}
        </button>
      </div>
    </>
  );
};
