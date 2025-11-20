import React, { useState } from 'react';
import { ScriptSegment } from '../types';
import { Button } from './Button';
import { Download, FileText, Printer, Wand2, X, Send } from 'lucide-react';
import { regenerateSegment } from '../services/geminiService';

interface ProductionScriptViewProps {
  script: ScriptSegment[];
  onUpdateScript: (newScript: ScriptSegment[]) => void;
  titleContext: string;
}

export const ProductionScriptView: React.FC<ProductionScriptViewProps> = ({ script, onUpdateScript, titleContext }) => {
  
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
  const [feedbackPrompt, setFeedbackPrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  const downloadCSV = () => {
    const headers = ['Scene', 'Visual Description', 'Narration'];
    const rows = script.map((s, i) => [
      `${i + 1}`,
      `"${s.visual.replace(/"/g, '""')}"`, 
      `"${s.narration.replace(/"/g, '""')}"`
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'production_script.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = (index: number, field: keyof ScriptSegment, value: string) => {
    const updatedScript = [...script];
    updatedScript[index] = {
      ...updatedScript[index],
      [field]: value
    };
    onUpdateScript(updatedScript);
  };

  const openRegenerateModal = (index: number) => {
    setRegeneratingIndex(index);
    setFeedbackPrompt('');
  };

  const closeRegenerateModal = () => {
    setRegeneratingIndex(null);
    setFeedbackPrompt('');
  };

  const submitRegeneration = async () => {
    if (regeneratingIndex === null || !feedbackPrompt.trim()) return;
    
    setIsRefining(true);
    try {
      const currentSegment = script[regeneratingIndex];
      const newSegment = await regenerateSegment(currentSegment, feedbackPrompt, titleContext);
      
      const updatedScript = [...script];
      updatedScript[regeneratingIndex] = newSegment;
      onUpdateScript(updatedScript);
      closeRegenerateModal();
    } catch (e) {
      console.error("Failed to regenerate", e);
      alert("Failed to regenerate segment. Try again.");
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="space-y-4 relative">
      {/* Action Bar */}
      <div className="flex justify-end gap-3 print:hidden">
        <Button variant="secondary" onClick={handlePrint} className="text-sm">
          <Printer size={16} />
          Print / PDF
        </Button>
        <Button variant="secondary" onClick={downloadCSV} className="text-sm">
          <Download size={16} />
          Export CSV
        </Button>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden print:border-0 print:shadow-none transition-colors">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse print:w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-750 border-b border-slate-200 dark:border-slate-700 print:bg-white print:border-black">
                <th className="p-4 w-16 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider print:text-black">#</th>
                <th className="p-4 w-1/2 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider print:text-black">Visual Production Notes</th>
                <th className="p-4 w-1/2 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider print:text-black">Narration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 print:divide-slate-300">
              {script.map((segment, index) => (
                <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors print:break-inside-avoid group">
                  <td className="p-4 text-slate-400 dark:text-slate-500 font-mono text-sm align-top pt-5 print:text-black relative">
                    {index + 1}
                    {/* Regeneration Button visible on hover */}
                    <div className="absolute top-3 right-2 print:hidden opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                         onClick={() => openRegenerateModal(index)}
                         className="p-1.5 bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-600 hover:text-white transition-colors dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-500 dark:hover:text-white"
                         title="Regenerate this segment with AI"
                       >
                         <Wand2 size={14} />
                       </button>
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <div className="flex items-start gap-3">
                      <div className="bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 p-2 rounded mt-1 flex-shrink-0 print:hidden">
                         <FileText size={14} />
                      </div>
                      <textarea
                        className="w-full min-h-[80px] bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-600 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 focus:bg-white dark:focus:bg-slate-800 rounded p-2 text-slate-700 dark:text-slate-300 text-sm leading-relaxed resize-y outline-none transition-all print:text-black print:border-none print:p-0"
                        value={segment.visual}
                        onChange={(e) => handleEdit(index, 'visual', e.target.value)}
                        spellCheck={false}
                      />
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <textarea
                        className="w-full min-h-[80px] bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-600 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 focus:bg-white dark:focus:bg-slate-800 rounded p-2 text-slate-800 dark:text-slate-200 text-base leading-relaxed border-l-4 border-indigo-100 dark:border-indigo-900 pl-4 resize-y outline-none transition-all print:text-black print:border-l-2 print:border-black print:p-0 print:pl-4"
                        value={segment.narration}
                        onChange={(e) => handleEdit(index, 'narration', e.target.value)}
                        spellCheck={false}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regeneration Modal/Overlay */}
      {regeneratingIndex !== null && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm print:hidden">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-md animate-in zoom-in-95 duration-200">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                   <Wand2 size={18} className="text-indigo-600 dark:text-indigo-400" />
                   Refine Scene {regeneratingIndex + 1}
                 </h3>
                 <button onClick={closeRegenerateModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                   <X size={20} />
                 </button>
               </div>
               
               <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                 How should I improve this specific scene? The AI will rewrite the visual and narration based on your feedback.
               </p>

               <textarea 
                  value={feedbackPrompt}
                  onChange={(e) => setFeedbackPrompt(e.target.value)}
                  placeholder="e.g., Make the visual more dramatic, switch to a drone shot, or make the joke funnier."
                  className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none mb-4 min-h-[100px]"
                  autoFocus
               />

               <div className="flex justify-end gap-2">
                 <Button variant="ghost" onClick={closeRegenerateModal}>Cancel</Button>
                 <Button variant="primary" onClick={submitRegeneration} isLoading={isRefining} disabled={!feedbackPrompt.trim()}>
                    <Send size={16} /> Regenerate
                 </Button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
