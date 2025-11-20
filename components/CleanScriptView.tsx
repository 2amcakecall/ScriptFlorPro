import React, { useState } from 'react';
import { ScriptSegment } from '../types';
import { Button } from './Button';
import { Copy, Check } from 'lucide-react';

interface CleanScriptViewProps {
  script: ScriptSegment[];
}

export const CleanScriptView: React.FC<CleanScriptViewProps> = ({ script }) => {
  const [copied, setCopied] = useState(false);

  const fullText = script.map(s => s.narration).join('\n\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
      <div className="absolute top-4 right-4 z-10">
        <Button variant="secondary" onClick={handleCopy} className="text-sm">
          {copied ? <Check size={16} className="text-green-600 dark:text-green-400" /> : <Copy size={16} />}
          {copied ? 'Copied' : 'Copy Text'}
        </Button>
      </div>
      
      <div className="p-8 max-w-3xl mx-auto">
        <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-6">Narration Script</h2>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          {script.map((segment, index) => (
            <p key={index} className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 mb-6">
              {segment.narration}
            </p>
          ))}
        </div>
        
        {/* Word count estimation footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 text-sm text-slate-400 flex justify-between items-center">
          <span>~{fullText.split(' ').length} words</span>
          <span>Optimized for Text-to-Speech</span>
        </div>
      </div>
    </div>
  );
};
