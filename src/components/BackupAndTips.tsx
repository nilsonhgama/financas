import React, { useState, useEffect } from 'react';
import { AppState } from '../types/finance';
import { calcMonthTotals, money } from '../utils/formatters';

interface BackupAndTipsProps {
  state: AppState;
  onRestoreState: (newState: AppState) => void;
}

const WA_PHONE_KEY = 'financas_wa_phone';

export const BackupAndTips: React.FC<BackupAndTipsProps> = ({ state, onRestoreState }) => {
  const [bkText, setBkText] = useState('');
  const [msg, setMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [waPhone, setWaPhone] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(WA_PHONE_KEY);
      if (saved) {
        setWaPhone(saved);
      }
    } catch (e) {}
  }, []);

  const handleGenerateBackup = () => {
    const txt = JSON.stringify(state);
    setBkText(txt);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(
        () => setMsg('Backup copiado para a área de transferência!'),
        () => setMsg('Backup gerado. Selecione o texto e copie.')
      );
    } else {
      setMsg('Backup gerado. Selecione o texto e copie.');
    }
  };

  const handleRestoreBackup = () => {
    try {
      const s = JSON.parse(bkText);
      if (s && Array.isArray(s.months) && s.groups && s.values) {
        onRestoreState(s);
        setMsg('Dados restaurados com sucesso!');
      } else {
        setMsg('Texto inválido. Cole o backup completo.');
      }
    } catch (e) {
      setMsg('Erro ao ler JSON do backup.');
    }
  };

  const handleOpenWhatsAppModal = () => {
    setShowModal(true);
  };

  const handleConfirmSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();

    let rawDigits = waPhone.replace(/\D/g, '');

    if (!rawDigits) {
      alert('Por favor, informe um número de telefone com DDD.');
      return;
    }

    if (rawDigits.length === 10 || rawDigits.length === 11) {
      rawDigits = '55' + rawDigits;
    }

    try {
      localStorage.setItem(WA_PHONE_KEY, waPhone);
    } catch (err) {}

    let report = `📊 *RELATÓRIO DE FINANÇAS ${state.year}*\n\n`;

    let totalEntradas = 0;
    let totalFixas = 0;
    let totalVariaveis = 0;

    state.months.forEach((m) => {
      const { e, f, v, s } = calcMonthTotals(state, m.id);
      if (e > 0 || f > 0 || v > 0) {
        report += `🗓 *${m.name}*\n`;
        report += `  • Entradas: ${money(e)}\n`;
        report += `  • Fixas: ${money(f)}\n`;
        report += `  • Variáveis: ${money(v)}\n`;
        report += `  👉 *Saldo:* ${money(s)}\n\n`;
      }
      totalEntradas += e;
      totalFixas += f;
      totalVariaveis += v;
    });

    const saldoAno = totalEntradas - totalFixas - totalVariaveis;
    report += `📈 *RESUMO ANUAL (${state.year})*\n`;
    report += `💰 Total Entradas: ${money(totalEntradas)}\n`;
    report += `📌 Total Fixas: ${money(totalFixas)}\n`;
    report += `🛒 Total Variáveis: ${money(totalVariaveis)}\n`;
    report += `⭐️ *Saldo Geral:* ${money(saldoAno)}\n\n`;

    report += `📦 *CÓDIGO DE BACKUP (para restaurar no app):*\n`;
    report += `${JSON.stringify(state)}`;

    const url = `https://wa.me/${rawDigits}?text=${encodeURIComponent(report)}`;
    window.open(url, '_blank');

    setShowModal(false);
    setMsg('Abrindo WhatsApp para enviar o relatório...');
  };

  return (
    <>
      <details className="backup">
        <summary>
          <span>Backup, WhatsApp & Restauração Rápida</span>
          <span className="arrow-icon">▼</span>
        </summary>
        <p>Copie o texto para guardar, envie um relatório no WhatsApp ou cole um backup anterior e toque em Restaurar.</p>
        <textarea
          className="bk"
          rows={4}
          spellCheck={false}
          aria-label="Texto do backup"
          value={bkText}
          onChange={(e) => setBkText(e.target.value)}
        />
        <div className="bk-actions" style={{ flexWrap: 'wrap', gap: '8px' }}>
          <button className="ghost" type="button" onClick={handleGenerateBackup}>
            Gerar backup
          </button>
          <button
            className="ghost"
            type="button"
            onClick={handleOpenWhatsAppModal}
            style={{ color: '#25D366', borderColor: 'rgba(37, 211, 102, 0.4)' }}
          >
            📲 Enviar WhatsApp
          </button>
          <button className="ghost" type="button" onClick={handleRestoreBackup}>
            Restaurar
          </button>
        </div>
        {msg && <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '8px', marginTop: '8px' }}>{msg}</p>}
      </details>


      {/* Modal dinâmico para o WhatsApp */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>📲 Enviar Relatório via WhatsApp</h3>
            <p>
              Digite o número do seu WhatsApp (com DDD). Ele ficará salvo <b>neste dispositivo</b> para envios futuros.
            </p>
            <form onSubmit={handleConfirmSendWhatsApp}>
              <input
                type="tel"
                className="modal-input"
                placeholder="Ex: (82) 99930-7581 ou 82999307581"
                value={waPhone}
                onChange={(e) => setWaPhone(e.target.value)}
                autoFocus
              />
              <div className="modal-actions">
                <button
                  type="button"
                  className="ghost"
                  onClick={() => setShowModal(false)}
                  style={{ height: '42px', padding: '0 16px' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-action primary"
                  style={{
                    height: '42px',
                    padding: '0 20px',
                    background: '#25D366',
                    borderColor: '#25D366'
                  }}
                >
                  🚀 Enviar no WhatsApp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};


