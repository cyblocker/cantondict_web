import { useState } from 'react';
import { createPortal } from 'react-dom';
import { lookupChar, parseExplanations } from '../lib/db';
import type { DataEntry } from '../lib/db';

interface Props {
  chineseMode: number;
  romanizationMode: number;
  t: any;
}

interface DisplayEntry extends DataEntry {
  parsedExplanations: string[];
}

interface ParaEntry {
  char: string;
  entries: DisplayEntry[];
  selectedIndex: number;
}

const ParagraphLookup = ({ chineseMode, romanizationMode, t }: Props) => {
  const [text, setText] = useState('');
  const [paraEntries, setParaEntries] = useState<ParaEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalEntry, setModalEntry] = useState<{index: number, entry: ParaEntry} | null>(null);

  const calculateScores = (entries: ParaEntry[], fullText: string) => {
    return entries.map((item, i) => {
      if (item.entries.length <= 1) return 0;

      let bestIdx = 0;
      let maxScore = -1000;

      item.entries.forEach((entry, j) => {
        let score = 0;
        const explanations = entry.explanations.split(',');
        let samples = '';

        explanations.forEach(exp => {
          if (exp.startsWith('$') || exp.startsWith('#')) score -= 20;
          else if (exp.startsWith('@')) score += 2;
          else if (exp.startsWith('%')) score += 100;
          else samples += ' ' + exp;
        });

        if (samples.length > 0) {
          if (i > 0 && samples.includes(fullText.substring(i - 1, i + 1))) score += 100;
          if (i + 1 < fullText.length && samples.includes(fullText.substring(i, i + 2))) score += 100;
          score += samples.length;
        }

        if (score > maxScore) {
          maxScore = score;
          bestIdx = j;
        }
      });
      return bestIdx;
    });
  };

  const handleLookup = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const chars = Array.from(text);
      const results: ParaEntry[] = [];

      for (const char of chars) {
        const entries = await lookupChar(char, chineseMode, romanizationMode);
        
        const displayEntries = await Promise.all(
          entries.map(async (entry) => ({
            ...entry,
            parsedExplanations: await parseExplanations(entry.explanations, chineseMode)
          }))
        );

        results.push({
          char,
          entries: displayEntries,
          selectedIndex: 0
        });
      }

      const bestIndices = calculateScores(results, text);
      results.forEach((item, i) => {
        item.selectedIndex = bestIndices[i];
      });

      setParaEntries(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCharClick = (index: number) => {
    const entry = paraEntries[index];
    if (entry.entries.length > 1) {
      setModalEntry({ index, entry });
    }
  };

  const selectPronunciation = (pronIdx: number) => {
    if (!modalEntry) return;
    const newEntries = [...paraEntries];
    newEntries[modalEntry.index].selectedIndex = pronIdx;
    setParaEntries(newEntries);
    setModalEntry(null);
  };

  return (
    <>
      <div className="animate-fade-in">
        <div className="search-container">
          <textarea 
            className="search-input"
            style={{ minHeight: '120px', resize: 'vertical' }}
            placeholder={t.lookupTextFieldHintText}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="btn-primary" onClick={handleLookup}>
            {t.lookupButton}
          </button>
        </div>

        {loading && <div className="text-center p-4">{t.loading}</div>}

        {paraEntries.length > 0 && (
          <div className="para-results card">
            <div className="para-wrap">
              {paraEntries.map((item, i) => (
                <div 
                  key={i} 
                  className={`para-char-unit ${item.entries.length > 1 ? 'has-multiple' : ''}`}
                  onClick={() => handleCharClick(i)}
                >
                  <span className="para-pron">
                    {item.entries.length > 0 ? (
                      `${item.entries[item.selectedIndex].consonant}${item.entries[item.selectedIndex].vowels}${item.entries[item.selectedIndex].tone}`
                    ) : ''}
                  </span>
                  <span className="para-char">{item.char}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {modalEntry && createPortal(
        <div className="modal-overlay" onClick={() => setModalEntry(null)}>
          <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>選擇讀音 - {modalEntry.entry.char}</h3>
              <button className="btn-close" onClick={() => setModalEntry(null)}>&times;</button>
            </div>
            <div className="modal-options">
              {modalEntry.entry.entries.map((entry, i) => (
                <button 
                  key={i} 
                  className={`modal-option ${modalEntry.entry.selectedIndex === i ? 'active' : ''}`}
                  onClick={() => selectPronunciation(i)}
                >
                  <span className="pron-text">{entry.consonant}{entry.vowels}{entry.tone}</span>
                  <div className="exp-mini-list">
                    {entry.parsedExplanations.map((exp, idx) => (
                      <span key={idx} className="exp-mini-item">{exp}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        .para-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 1.25rem 0.75rem;
          line-height: 1.2;
        }
        .para-char-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: default;
          padding: 4px;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .para-char-unit.has-multiple {
          cursor: pointer;
          background: rgba(var(--primary-rgb, 54, 166, 109), 0.1);
          box-shadow: 0 0 0 1px rgba(var(--primary-rgb, 54, 166, 109), 0.2);
          border-radius: 8px;
        }
        .para-char-unit.has-multiple:hover {
          background: rgba(var(--primary-rgb, 54, 166, 109), 0.2);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(var(--primary-rgb, 54, 166, 109), 0.15);
        }
        .para-pron {
          font-size: 0.8rem;
          color: var(--primary);
          height: 1.2rem;
          font-weight: 700;
          letter-spacing: -0.01em;
        }
        .para-char {
          font-size: 1.5rem;
          font-weight: 500;
        }
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999; /* Higher than nav-bar (10) and header (10) */
          padding: 1.5rem;
        }
        .modal-content {
          background: var(--surface);
          border-radius: 20px;
          width: 100%;
          max-width: 500px;
          max-height: 70vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          border: 1px solid var(--border);
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          background: var(--surface);
          z-index: 1;
        }
        .modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          color: var(--text);
        }
        .btn-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: var(--text-muted);
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        .btn-close:hover {
          background: var(--background);
          color: var(--text);
        }
        .modal-options {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .modal-option {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
          padding: 1.25rem;
          border: 1px solid var(--border);
          border-radius: 16px;
          background: var(--surface);
          cursor: pointer;
          text-align: left;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .modal-option:hover {
          border-color: var(--primary);
          background: rgba(37, 99, 235, 0.02);
          transform: scale(1.01);
        }
        .modal-option.active {
          border-color: var(--primary);
          background: rgba(37, 99, 235, 0.05);
          box-shadow: 0 0 0 1px var(--primary);
        }
        .pron-text {
          font-weight: 800;
          color: var(--primary);
          font-size: 1.1rem;
          min-width: 4.5rem;
          padding-top: 2px;
        }
        .exp-mini-list {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          flex: 1;
        }
        .exp-mini-item {
          font-size: 0.95rem;
          color: var(--text);
          line-height: 1.4;
        }
        @media (max-width: 600px) {
          .modal-overlay {
            align-items: flex-end;
            padding: 0;
          }
          .modal-content {
            border-radius: 24px 24px 0 0;
            max-height: 85vh;
          }
        }
      `}</style>
    </>
  );
};

export default ParagraphLookup;
