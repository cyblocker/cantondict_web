import { useState, useEffect } from 'react';
import { Search, BookOpen, Settings as SettingsIcon } from 'lucide-react';
import { translations } from './lib/i18n';
import type { Language } from './lib/i18n';
import CharacterLookup from './components/CharacterLookup';
import ParagraphLookup from './components/ParagraphLookup';
import Settings from './components/Settings';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'char' | 'para' | 'settings'>('char');
  const [chineseMode, setChineseMode] = useState<number>(() => {
    const saved = localStorage.getItem('chineseMode');
    if (saved !== null) return parseInt(saved);
    return navigator.language.includes('zh-CN') ? 1 : 0;
  });
  const [romanizationMode, setRomanizationMode] = useState<number>(() => {
    const saved = localStorage.getItem('romanizationMode');
    return saved !== null ? parseInt(saved) : 0;
  });

  const lang: Language = chineseMode === 1 ? 'zh_Hans' : 'zh_Hant';
  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem('chineseMode', chineseMode.toString());
  }, [chineseMode]);

  useEffect(() => {
    localStorage.setItem('romanizationMode', romanizationMode.toString());
  }, [romanizationMode]);

  return (
    <div className="app-container">
      <header className="header">
        <h1>{t.title}</h1>
      </header>

      <main className="main-content">
        {activeTab === 'char' && (
          <CharacterLookup 
            chineseMode={chineseMode} 
            romanizationMode={romanizationMode} 
            t={t} 
          />
        )}
        {activeTab === 'para' && (
          <ParagraphLookup 
            chineseMode={chineseMode} 
            romanizationMode={romanizationMode} 
            t={t} 
          />
        )}
        {activeTab === 'settings' && (
          <Settings 
            chineseMode={chineseMode} 
            setChineseMode={setChineseMode}
            romanizationMode={romanizationMode}
            setRomanizationMode={setRomanizationMode}
            t={t} 
          />
        )}
      </main>

      <nav className="nav-bar">
        <button 
          className={`nav-item ${activeTab === 'char' ? 'active' : ''}`}
          onClick={() => setActiveTab('char')}
        >
          <Search size={24} />
          <span>{t.lookupChar}</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'para' ? 'active' : ''}`}
          onClick={() => setActiveTab('para')}
        >
          <BookOpen size={24} />
          <span>{t.lookupParagraph}</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <SettingsIcon size={24} />
          <span>{t.settings}</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
