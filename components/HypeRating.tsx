import React from 'react';
import { ScriptAnalysis } from '../types';
import { Flame, TrendingUp, AlertCircle } from 'lucide-react';

interface HypeRatingProps {
  analysis: ScriptAnalysis;
}

export const HypeRating: React.FC<HypeRatingProps> = ({ analysis }) => {
  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-green-500 dark:text-green-400';
    if (score >= 7) return 'text-indigo-500 dark:text-indigo-400';
    if (score >= 5) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-red-500 dark:text-red-400';
  };

  const getProgressBarColor = (score: number) => {
     if (score >= 9) return 'bg-green-500';
     if (score >= 7) return 'bg-indigo-500';
     if (score >= 5) return 'bg-yellow-500';
     return 'bg-red-500';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 mb-8 transition-colors">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        
        {/* Score Circle */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center relative">
          <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-slate-100 dark:border-slate-700">
             <div 
                className={`absolute inset-0 rounded-full border-8 border-transparent border-t-current rotate-[-45deg] ${getScoreColor(analysis.score)}`} 
                style={{ borderRightColor: 'currentColor', opacity: analysis.score / 10 }}
             ></div>
             <div className="text-center z-10">
                <div className={`text-4xl font-black ${getScoreColor(analysis.score)}`}>{analysis.score}</div>
                <div className="text-xs text-slate-400 uppercase font-bold tracking-wide">Hype Score</div>
             </div>
          </div>
        </div>

        {/* Analysis Content */}
        <div className="flex-1 w-full">
           <div className="flex items-center gap-2 mb-3">
              <Flame className="text-orange-500" size={20} fill="currentColor" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{analysis.headline}</h3>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                 <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <TrendingUp size={14} /> Viral Factors
                 </h4>
                 <ul className="space-y-2">
                    {analysis.viralFactors.map((factor, idx) => (
                       <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"></span>
                          {factor}
                       </li>
                    ))}
                 </ul>
              </div>
              
              <div>
                 <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <AlertCircle size={14} /> Platform Tips
                 </h4>
                 <ul className="space-y-2">
                    {analysis.platformTips.map((tip, idx) => (
                       <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0"></span>
                          {tip}
                       </li>
                    ))}
                 </ul>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};