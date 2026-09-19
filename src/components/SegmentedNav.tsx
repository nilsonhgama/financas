import React from 'react';

interface SegmentedNavProps {
  activeView: 'monthly' | 'annual';
  onChangeView: (view: 'monthly' | 'annual') => void;
}

export const SegmentedNav: React.FC<SegmentedNavProps> = ({ activeView, onChangeView }) => {
  return (
    <div className="segmented" role="tablist">
      <button
        id="tabMonth"
        className={`seg-btn ${activeView === 'monthly' ? 'active' : ''}`}
        type="button"
        role="tab"
        aria-selected={activeView === 'monthly'}
        onClick={() => onChangeView('monthly')}
      >
        📆 Mês a Mês
      </button>
      <button
        id="tabYear"
        className={`seg-btn ${activeView === 'annual' ? 'active' : ''}`}
        type="button"
        role="tab"
        aria-selected={activeView === 'annual'}
        onClick={() => onChangeView('annual')}
      >
        📊 Visão Anual
      </button>
    </div>
  );
};
