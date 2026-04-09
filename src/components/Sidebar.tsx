import React, { useState, useRef } from 'react';
import { Upload, FileText, X, History, Settings, Cloud, Github, Image as ImageIcon, Play } from 'lucide-react';
import { FlowchartHistoryItem, UserSettings } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  onGenerate: (prompt: string, files: File[]) => void;
  isGenerating: boolean;
  history: FlowchartHistoryItem[];
  onSelectHistory: (item: FlowchartHistoryItem) => void;
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
}

export function Sidebar({ onGenerate, isGenerating, history, onSelectHistory, settings, onUpdateSettings }: SidebarProps) {
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'history' | 'settings'>('create');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredHistory = history.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && files.length === 0) return;
    onGenerate(prompt, files);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="w-80 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('create')}
          className={cn(
            "flex-1 py-3 text-sm font-medium transition-colors",
            activeTab === 'create' 
              ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400" 
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          )}
        >
          Create
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            "flex-1 py-3 text-sm font-medium transition-colors",
            activeTab === 'history' 
              ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400" 
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          )}
        >
          History
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={cn(
            "flex-1 py-3 text-sm font-medium transition-colors",
            activeTab === 'settings' 
              ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400" 
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          )}
        >
          Settings
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'create' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Describe your workflow
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="E.g., User logs in. If valid, show dashboard. If invalid, show error..."
                className="w-full h-32 p-3 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 dark:text-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1 text-right">Press Cmd/Ctrl + Enter to generate</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Upload context (Optional)
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <Upload className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Click or drag files here</p>
                <p className="text-xs text-gray-500 mt-1">Images, PDFs, Text</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  multiple 
                  accept="image/*,.pdf,.txt,.py,.js"
                />
              </div>

              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800">
                      <div className="flex items-center space-x-2 overflow-hidden">
                        {file.type.startsWith('image/') ? (
                          <ImageIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        )}
                        <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{file.name}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeFile(i)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isGenerating || (!prompt.trim() && files.length === 0)}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Generate Flowchart</span>
                </>
              )}
            </button>
          </form>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3 flex flex-col h-full">
            <div className="relative">
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {searchQuery ? "No matching history." : "No history yet."}
                  </p>
                </div>
              ) : (
                filteredHistory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSelectHistory(item)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
                  >
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate mb-1">
                      {item.title || "Untitled Flowchart"}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Appearance</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Theme</span>
                <select
                  value={settings.theme}
                  onChange={(e) => onUpdateSettings({ theme: e.target.value as 'light' | 'dark' })}
                  className="text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md px-2 py-1 text-gray-900 dark:text-white"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Cloud Sync (Mock)</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <Cloud className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Google Drive</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={settings.syncGoogleDrive}
                    onChange={(e) => onUpdateSettings({ syncGoogleDrive: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 bg-gray-100 border-gray-300"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <Cloud className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Dropbox</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={settings.syncDropbox}
                    onChange={(e) => onUpdateSettings({ syncDropbox: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 bg-gray-100 border-gray-300"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <Github className="w-4 h-4 text-gray-800 dark:text-gray-200" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">GitHub Gist</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={settings.syncGithub}
                    onChange={(e) => onUpdateSettings({ syncGithub: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 bg-gray-100 border-gray-300"
                  />
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Integrations</h3>
              <button 
                className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                onClick={() => alert("Canva integration coming soon!")}
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Export to Canva</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
