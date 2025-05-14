import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun, Zap, X, Check } from 'lucide-react';

interface TestResult {
  component: string;
  passed: boolean;
  notes: string;
}

export const DarkModeTestHelper: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [isExpanded, setIsExpanded] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [currentComponent, setCurrentComponent] = useState('');
  const [notes, setNotes] = useState('');

  const addResult = (passed: boolean) => {
    if (!currentComponent) return;
    
    setResults([
      ...results,
      {
        component: currentComponent,
        passed,
        notes: notes
      }
    ]);
    
    setCurrentComponent('');
    setNotes('');
  };

  const exportResults = () => {
    const data = JSON.stringify(results, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `dark-mode-test-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${isExpanded ? 'w-80' : 'w-auto'} rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-2">
          <Zap size={18} className="text-indigo-500 dark:text-indigo-400" />
          <span className="font-medium text-gray-800 dark:text-gray-200">Dark Mode Tester</span>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400"
        >
          {isExpanded ? <X size={16} /> : <span className="text-xs font-medium">Expand</span>}
        </button>
      </div>
      
      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Theme</label>
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-md ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800'}`}>
                {isDark ? <Moon size={16} /> : <Sun size={16} />}
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </span>
              <button
                onClick={toggleTheme}
                className="ml-auto px-2 py-1 text-xs font-medium rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-800/40"
              >
                Toggle
              </button>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Component Testing
            </label>
            <input
              type="text"
              value={currentComponent}
              onChange={(e) => setCurrentComponent(e.target.value)}
              placeholder="Component name"
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 mb-2"
            />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes about this component..."
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 mb-2 h-20 resize-none"
            />
            <div className="flex space-x-2">
              <button
                onClick={() => addResult(true)}
                className="flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-800/40"
              >
                <Check size={14} className="mr-1" /> Pass
              </button>
              <button
                onClick={() => addResult(false)}
                className="flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-800/40"
              >
                <X size={14} className="mr-1" /> Fail
              </button>
            </div>
          </div>
          
          {results.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Test Results
                </label>
                <button
                  onClick={exportResults}
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Export
                </button>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {results.map((result, index) => (
                  <div 
                    key={index} 
                    className={`text-xs p-2 rounded-md ${
                      result.passed 
                        ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}
                  >
                    <div className="font-medium">{result.component}</div>
                    <div className="mt-1 opacity-80">{result.notes || 'No notes'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DarkModeTestHelper; 