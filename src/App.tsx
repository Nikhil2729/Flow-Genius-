import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { FlowchartCanvas } from './components/FlowchartCanvas';
import { generateFlowchart } from './services/geminiService';
import { FlowchartHistoryItem, UserSettings, User } from './types';

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  autoSave: true,
  syncGoogleDrive: false,
  syncDropbox: false,
  syncGithub: false,
};

export default function App() {
  const [code, setCode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<FlowchartHistoryItem[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load data from local storage
  useEffect(() => {
    const savedHistory = localStorage.getItem('flowchartHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }

    const savedSettings = localStorage.getItem('flowchartSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        if (parsed.theme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      } catch (e) {
        console.error("Failed to parse settings");
      }
    }
  }, []);

  // Save settings
  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('flowchartSettings', JSON.stringify(updated));
    
    if (newSettings.theme) {
      if (newSettings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleGenerate = async (prompt: string, files: File[]) => {
    setIsGenerating(true);
    setError(null);
    try {
      const generatedCode = await generateFlowchart(prompt, files);
      setCode(generatedCode);
      
      // Save to history
      const newItem: FlowchartHistoryItem = {
        id: Date.now().toString(),
        title: prompt ? prompt.substring(0, 30) + (prompt.length > 30 ? '...' : '') : 'From File',
        code: generatedCode,
        createdAt: Date.now()
      };
      
      const newHistory = [newItem, ...history].slice(0, 50); // Keep last 50
      setHistory(newHistory);
      localStorage.setItem('flowchartHistory', JSON.stringify(newHistory));
      
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogin = () => {
    // Mock login since we don't have real auth set up
    setUser({
      name: "Demo User",
      email: "demo@example.com"
    });
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 font-sans">
      <TopBar user={user} onLogin={handleLogin} onLogout={handleLogout} />
      
      {error && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded relative shadow-md" role="alert">
          <span className="block sm:inline">{error}</span>
          <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
            <span className="sr-only">Close</span>
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          onGenerate={handleGenerate} 
          isGenerating={isGenerating}
          history={history}
          onSelectHistory={(item) => setCode(item.code)}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
        />
        
        <main className="flex-1 flex flex-col bg-gray-50 dark:bg-[#121212] relative">
          <FlowchartCanvas 
            code={code} 
            onCodeChange={setCode}
            isGenerating={isGenerating}
          />
        </main>
      </div>
    </div>
  );
}
