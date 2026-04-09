import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { toPng, toSvg } from 'html-to-image';
import { Download, ZoomIn, ZoomOut, Maximize, Edit3, Check, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface FlowchartCanvasProps {
  code: string;
  onCodeChange?: (newCode: string) => void;
  isGenerating?: boolean;
}

export function FlowchartCanvas({ code, onCodeChange, isGenerating }: FlowchartCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editCode, setEditCode] = useState(code);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
      securityLevel: 'loose',
      flowchart: { htmlLabels: true, curve: 'basis' }
    });
  }, []);

  useEffect(() => {
    if (!code) {
      setSvgContent('');
      return;
    }

    const renderDiagram = async () => {
      try {
        setError(null);
        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, code);
        setSvgContent(svg);
        setEditCode(code);
      } catch (err: any) {
        console.error("Mermaid render error:", err);
        setError(err.message || "Failed to render flowchart. Check syntax.");
      }
    };

    renderDiagram();
  }, [code]);

  const handleDownloadPng = async () => {
    if (!containerRef.current) return;
    try {
      const dataUrl = await toPng(containerRef.current, { backgroundColor: 'transparent' });
      downloadFile(dataUrl, 'flowchart.png');
    } catch (err) {
      console.error('Failed to download PNG', err);
    }
  };

  const handleDownloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    downloadFile(url, 'flowchart.svg');
    URL.revokeObjectURL(url);
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => setScale(s => Math.min(s + 0.2, 3));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.2, 0.5));
  const handleResetZoom = () => setScale(1);

  const handleSaveEdit = () => {
    if (onCodeChange) {
      onCodeChange(editCode);
    }
    setIsEditing(false);
  };

  if (isGenerating) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 m-4 shadow-sm">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Generating your flowchart...</p>
      </div>
    );
  }

  if (!code && !isEditing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 m-4 shadow-sm">
        <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
          <Edit3 className="w-10 h-10 text-blue-500" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No Flowchart Yet</h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
          Enter a description or upload a file on the left to generate your first AI flowchart.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 m-4 shadow-sm overflow-hidden relative">
      {/* Toolbar */}
      <div className="h-14 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center space-x-2">
          <button onClick={handleZoomOut} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md text-gray-600 dark:text-gray-400 transition-colors" title="Zoom Out">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium text-gray-500 w-12 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={handleZoomIn} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md text-gray-600 dark:text-gray-400 transition-colors" title="Zoom In">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={handleResetZoom} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md text-gray-600 dark:text-gray-400 transition-colors" title="Reset Zoom">
            <Maximize className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <>
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Code</span>
              </button>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-2"></div>
              <button 
                onClick={handleDownloadPng}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>PNG</span>
              </button>
              <button 
                onClick={handleDownloadSvg}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>SVG</span>
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setIsEditing(false)}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button 
                onClick={handleSaveEdit}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Apply</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto relative bg-gray-50/50 dark:bg-[#121212]">
        {isEditing ? (
          <div className="absolute inset-0 p-4">
            <textarea
              value={editCode}
              onChange={(e) => setEditCode(e.target.value)}
              className="w-full h-full p-4 font-mono text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 dark:text-gray-100"
              spellCheck={false}
            />
          </div>
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center min-h-[500px] p-8"
            style={{ 
              backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          >
            {error ? (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg max-w-lg text-center border border-red-200 dark:border-red-800">
                <p className="font-medium mb-2">Render Error</p>
                <p className="text-sm font-mono break-words">{error}</p>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 rounded-md text-sm transition-colors"
                >
                  Edit Code to Fix
                </button>
              </div>
            ) : (
              <div 
                ref={containerRef}
                className="transition-transform duration-200 origin-center bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800"
                style={{ transform: `scale(${scale})` }}
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
