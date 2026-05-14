import React from 'react';

interface Props {
  chineseMode: number;
  setChineseMode: (mode: number) => void;
  romanizationMode: number;
  setRomanizationMode: (mode: number) => void;
  t: any;
}

const Settings: React.FC<Props> = ({
  chineseMode, setChineseMode,
  romanizationMode, setRomanizationMode,
  t
}) => {
  return (
    <div className="animate-fade-in">
      <section className="settings-section card">
        <h2 className="section-title">{t.languageSettings}</h2>
        <p className="section-desc">{t.languageSettingsExplanation}</p>

        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name="chinese"
              checked={chineseMode === 0}
              onChange={() => setChineseMode(0)}
            />
            <span>{t.traditionalChinese}</span>
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="chinese"
              checked={chineseMode === 1}
              onChange={() => setChineseMode(1)}
            />
            <span>{t.simplifiedChinese}</span>
          </label>
        </div>
      </section>

      <section className="settings-section card">
        <h2 className="section-title">{t.romanizationSettings}</h2>

        <div className="radio-group">
          {[t.yale, t.jyutping, t.cantonesePinyin, t.cantoneseTransliterationScheme].map((label, idx) => (
            <label key={idx} className="radio-label">
              <input
                type="radio"
                name="romanization"
                checked={romanizationMode === idx}
                onChange={() => setRomanizationMode(idx)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="settings-section card info-section">
        <p>{t.creator}<a href="https://cyblocker.com" target="_blank" rel="noopener noreferrer" className="creator-link">cyblocker</a></p>
        <p>{t.version('1.0.0 (Web)')}</p>
      </section>

      <style>{`
        .settings-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .section-title {
          font-size: 1.25rem;
          color: var(--primary);
        }
        .section-desc {
          font-size: 0.9rem;
          color: var(--text-muted);
          font-style: italic;
        }
        .radio-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .radio-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          font-size: 1.1rem;
          padding: 0.5rem;
          border-radius: 8px;
          transition: background 0.2s;
        }
        .radio-label:hover {
          background: rgba(37, 99, 235, 0.05);
        }
        .radio-label input {
          width: 1.2rem;
          height: 1.2rem;
          accent-color: var(--primary);
        }
        .info-section {
          text-align: center;
          color: var(--text-muted);
          font-size: 0.9rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .creator-link {
          color: var(--primary);
          text-decoration: none;
          font-weight: 600;
        }
        .creator-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default Settings;
