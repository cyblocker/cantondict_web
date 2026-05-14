import React, { useState } from 'react';
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

const CharacterLookup: React.FC<Props> = ({ chineseMode, romanizationMode, t }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{char: string, entries: DisplayEntry[]}[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearchedQuery(query.trim());
    try {
      const chars = Array.from(query.trim());
      const allResults = [];

      for (const char of chars) {
        const entries = await lookupChar(char, chineseMode, romanizationMode);
        const displayEntries = await Promise.all(
          entries.map(async (entry) => ({
            ...entry,
            parsedExplanations: await parseExplanations(entry.explanations, chineseMode)
          }))
        );
        if (displayEntries.length > 0) {
          allResults.push({ char, entries: displayEntries });
        }
      }
      setResults(allResults);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="search-container">
        <input 
          type="text" 
          className="search-input"
          placeholder={t.lookupTextFieldHintText}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn-primary" onClick={handleSearch}>
          {t.lookupButton}
        </button>
      </div>

      {loading && <div className="text-center p-4">{t.loading}</div>}

      <div className="results-list">
        {results.map((result, idx) => (
          <div key={idx} className="card">
            <div className="result-header">
              <div className="char-display">{result.char}</div>
              <div className="pronunciation-list">
                {result.entries.map((entry, eIdx) => (
                  <div key={eIdx} className="pronunciation-item">
                    <div className="pronunciation-text">
                      {entry.consonant}{entry.vowels}{entry.tone}
                    </div>
                    <div className="explanation-list">
                      {entry.parsedExplanations.map((exp, i) => (
                        <div key={i} className="explanation-item">{exp}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        {!loading && searchedQuery && query.trim() === searchedQuery && results.length === 0 && (
          <div className="text-center p-4 text-muted">{t.noResult}</div>
        )}
      </div>
    </div>
  );
};

export default CharacterLookup;
