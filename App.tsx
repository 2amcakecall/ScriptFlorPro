import React, { useState, useEffect } from 'react';
import { generateScript } from './services/geminiService';
import { ScriptSegment, ScriptAnalysis, ViewMode, DurationType, AdvancedConfig } from './types';
import { Button } from './components/Button';
import { CleanScriptView } from './components/CleanScriptView';
import { ProductionScriptView } from './components/ProductionScriptView';
import { HypeRating } from './components/HypeRating';
import { Clapperboard, Wand2, Clock, AlertCircle, Settings2, Sun, Moon, ChevronDown, ChevronUp, HelpCircle, User, Sparkles, LayoutTemplate, ArrowLeft } from 'lucide-react';

const TONES = [
  'Professional & Authoritative',
  'Casual & Friendly',
  'Humorous & Witty',
  'Cinematic & Dramatic',
  'Educational & Clear',
  'Hype & Energetic'
];

const PLATFORMS = [
  'YouTube Video (16:9)',
  'YouTube Short / Reel / TikTok (9:16)',
  'LinkedIn Video',
  'TV Commercial / Ad Spot'
];

type AppState = 'splash' | 'generating' | 'editor';

const App: React.FC = () => {
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>('dark'); // Default to dark for splash impact
  
  // Navigation State
  const [appState, setAppState] = useState<AppState>('splash');

  // Core Data State
  const [title, setTitle] = useState('');
  const [durationType, setDurationType] = useState<DurationType>('short');
  const [customDuration, setCustomDuration] = useState('');
  const [tone, setTone] = useState(TONES[0]);
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  
  // Advanced Config State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedConfig, setAdvancedConfig] = useState<AdvancedConfig>({
    audience: '',
    pacing: '',
    cta: '',
    keywords: '',
    speakerPersona: '',
    visualTheme: '',
    referenceStyle: ''
  });

  // Modals
  const [showHelp, setShowHelp] = useState(false);

  // Results State
  const [script, setScript] = useState<ScriptSegment[] | null>(null);
  const [analysis, setAnalysis] = useState<ScriptAnalysis | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.CLEAN);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('scriptflow-theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('scriptflow-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setAppState('generating');
    setError(null);
    setScript(null);
    setAnalysis(null);

    let durationDesc = '';
    switch (durationType) {
      case 'short': durationDesc = 'Short form (30-60 seconds)'; break;
      case 'medium': durationDesc = 'Standard length (3-5 minutes)'; break;
      case 'long': durationDesc = 'Long form (8-10 minutes)'; break;
      case 'custom': durationDesc = customDuration || '5 minutes'; break;
    }

    try {
      const data = await generateScript(title, durationDesc, tone, platform, advancedConfig);
      setScript(data.script);
      setAnalysis(data.analysis);
      setAppState('editor');
    } catch (err) {
      setError('Failed to generate script. Please check your API connection and try again.');
      setAppState('splash');
    }
  };

  const updateAdvanced = (field: keyof AdvancedConfig, value: string) => {
    setAdvancedConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleBackToStudio = () => {
    setAppState('splash');
    // Keep data populated so they can tweak
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 overflow-x-hidden ${theme}`}>
      
      {/* Dynamic Background for Splash */}
      {appState === 'splash' && (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-[-10%] w-[70%] h-[70%] bg-indigo-400/20 dark:bg-indigo-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-[20%] right-[-10%] w-[70%] h-[70%] bg-purple-400/20 dark:bg-purple-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-[20%] w-[70%] h-[70%] bg-pink-400/20 dark:bg-pink-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
          <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/80 backdrop-blur-[1px]"></div>
        </div>
      )}

      {/* Editor Background */}
      {appState !== 'splash' && (
         <div className="fixed inset-0 z-0 bg-slate-50 dark:bg-slate-900 pointer-events-none"></div>
      )}
      
      {/* Header */}
      <header className={`relative z-40 transition-all border-b ${appState === 'splash' ? 'bg-transparent border-transparent py-6' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 sticky top-0'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 cursor-pointer" onClick={handleBackToStudio}>
            <Clapperboard size={appState === 'splash' ? 32 : 24} />
            <h1 className={`${appState === 'splash' ? 'text-2xl' : 'text-xl'} font-bold text-slate-900 dark:text-white tracking-tight`}>
              ScriptFlow <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">Pro</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3 no-print">
            {appState === 'editor' && (
              <button 
                onClick={handleBackToStudio}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors mr-4"
              >
                <ArrowLeft size={14} /> Back to Studio
              </button>
            )}

            <button onClick={() => setShowHelp(true)} className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
              <HelpCircle size={20} />
            </button>
            <button onClick={toggleTheme} className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>
            
            <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <User size={16} />
              </div>
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* --- SPLASH / STUDIO VIEW --- */}
        {appState === 'splash' && (
          <div className="max-w-3xl mx-auto animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center space-y-6 mb-12 pt-8">
              <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Viral</span> Videos
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
                The AI-powered production studio that turns simple ideas into production-ready scripts with cinematic direction.
              </p>
            </div>

            <form onSubmit={handleGenerate} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl shadow-indigo-500/10 border border-white/20 dark:border-slate-700 space-y-8">
              
              {/* Title Input */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2 ml-1 uppercase tracking-wide">Project Title</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <LayoutTemplate className="h-5 w-5 text-indigo-500 group-focus-within:text-indigo-600" />
                  </div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Why Mechanical Watches Are Making a Comeback"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-lg font-medium shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                   <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Tone</label>
                   <div className="relative">
                      <select 
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="w-full appearance-none px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none h-4 w-4" />
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Platform</label>
                   <div className="relative">
                      <select 
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="w-full appearance-none px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none h-4 w-4" />
                   </div>
                </div>
              </div>

              {/* Duration Tabs */}
              <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                 <div className="grid grid-cols-4 gap-2">
                    {(['short', 'medium', 'long', 'custom'] as DurationType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setDurationType(type)}
                        className={`py-2 rounded-lg text-sm font-semibold transition-all ${
                          durationType === type
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm ring-1 ring-black/5'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                 </div>
                 {durationType === 'custom' && (
                    <div className="mt-3 px-2 pb-1">
                      <input
                        type="text"
                        value={customDuration}
                        onChange={(e) => setCustomDuration(e.target.value)}
                        placeholder="Specific duration (e.g. 45s)"
                        className="w-full bg-transparent border-b-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 px-2 py-1 text-slate-900 dark:text-white outline-none"
                        autoFocus
                      />
                    </div>
                 )}
              </div>

              {/* Deep Customization Accordion */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between text-left text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <Settings2 size={18} /> Advanced Studio Settings
                  </span>
                  <span className={`transform transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`}>
                    <ChevronDown size={18} />
                  </span>
                </button>

                {showAdvanced && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5 animate-in slide-in-from-top-2">
                     <div className="space-y-4">
                        <div className="space-y-1">
                           <label className="text-xs font-bold text-slate-400 uppercase">Target Audience</label>
                           <input type="text" value={advancedConfig.audience} onChange={(e) => updateAdvanced('audience', e.target.value)} 
                             className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-sm focus:ring-1 focus:ring-indigo-500 outline-none dark:text-white" placeholder="Who is watching?" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-xs font-bold text-slate-400 uppercase">Speaker Persona</label>
                           <input type="text" value={advancedConfig.speakerPersona} onChange={(e) => updateAdvanced('speakerPersona', e.target.value)} 
                             className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-sm focus:ring-1 focus:ring-indigo-500 outline-none dark:text-white" placeholder="e.g. High Energy Gen Z" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-xs font-bold text-slate-400 uppercase">Content Keywords</label>
                           <input type="text" value={advancedConfig.keywords} onChange={(e) => updateAdvanced('keywords', e.target.value)} 
                             className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-sm focus:ring-1 focus:ring-indigo-500 outline-none dark:text-white" placeholder="Mandatory words/phrases" />
                        </div>
                     </div>
                     <div className="space-y-4">
                        <div className="space-y-1">
                           <label className="text-xs font-bold text-slate-400 uppercase">Visual Theme</label>
                           <input type="text" value={advancedConfig.visualTheme} onChange={(e) => updateAdvanced('visualTheme', e.target.value)} 
                             className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-sm focus:ring-1 focus:ring-indigo-500 outline-none dark:text-white" placeholder="e.g. Dark Aesthetic, Minimalist" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-xs font-bold text-slate-400 uppercase">Reference Style</label>
                           <input type="text" value={advancedConfig.referenceStyle} onChange={(e) => updateAdvanced('referenceStyle', e.target.value)} 
                             className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-sm focus:ring-1 focus:ring-indigo-500 outline-none dark:text-white" placeholder="e.g. Like MKBHD, Like Casey Neistat" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-xs font-bold text-slate-400 uppercase">Call to Action</label>
                           <input type="text" value={advancedConfig.cta} onChange={(e) => updateAdvanced('cta', e.target.value)} 
                             className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-sm focus:ring-1 focus:ring-indigo-500 outline-none dark:text-white" placeholder="How should it end?" />
                        </div>
                     </div>
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full py-5 text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl shadow-indigo-500/30 text-white border-0 transform hover:scale-[1.02] transition-all"
                disabled={!title.trim()}
              >
                <Wand2 size={22} /> Generate Script
              </Button>
            </form>
            
             {error && (
              <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center justify-center gap-3 text-red-700 dark:text-red-400">
                <AlertCircle size={20} />
                <p>{error}</p>
              </div>
            )}
          </div>
        )}

        {/* --- GENERATING STATE --- */}
        {appState === 'generating' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-700">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-indigo-200 dark:border-indigo-900 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 border-t-4 border-indigo-600 dark:border-indigo-400 rounded-full animate-spin"></div>
            </div>
            <h2 className="mt-8 text-2xl font-bold text-slate-900 dark:text-white">Synthesizing Vision...</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Analyzing viral patterns for {platform}</p>
          </div>
        )}

        {/* --- EDITOR / RESULTS VIEW --- */}
        {appState === 'editor' && script && analysis && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            
            {/* Hype Rating Component */}
            <div className="no-print">
               <HypeRating analysis={analysis} />
            </div>

            {/* Script Content */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 no-print">
              <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-lg inline-flex">
                <button
                  onClick={() => setViewMode(ViewMode.CLEAN)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === ViewMode.CLEAN
                      ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Clean Script
                </button>
                <button
                  onClick={() => setViewMode(ViewMode.PRODUCTION)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === ViewMode.PRODUCTION
                      ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Production Table
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                 <span className="text-xs font-bold px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full">
                   {tone}
                 </span>
                 <span className="text-xs font-bold px-3 py-1.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full">
                   {durationType === 'custom' ? customDuration : durationType}
                 </span>
              </div>
            </div>

            {/* Print Header */}
            <div className="hidden print:block mb-8">
              <h1 className="text-4xl font-bold text-black mb-2">{title}</h1>
              <div className="flex gap-6 text-sm text-gray-600 mb-6 border-b-2 border-black pb-4">
                 <span><strong>Date:</strong> {new Date().toLocaleDateString()}</span>
                 <span><strong>Format:</strong> {platform}</span>
                 <span><strong>Tone:</strong> {tone}</span>
              </div>
            </div>

            <div className="min-h-[400px]">
              {viewMode === ViewMode.CLEAN ? (
                <CleanScriptView script={script} />
              ) : (
                <ProductionScriptView script={script} onUpdateScript={setScript} titleContext={title} />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 no-print">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">ScriptFlow Studio Tips</h3>
              <button onClick={() => setShowHelp(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <Sparkles size={20} />
              </button>
            </div>
            
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <div>
                <h4 className="font-bold text-indigo-600 dark:text-indigo-400 mb-1">Hype Score?</h4>
                <p>The AI evaluates your script out of 10 based on hook strength, pacing, and platform retention triggers.</p>
              </div>
              <div>
                <h4 className="font-bold text-indigo-600 dark:text-indigo-400 mb-1">Refine & Perfect</h4>
                <p>In Production View, use the Magic Wand on any scene to rewrite it. You can ask for "more cinematic lighting" or "funnier dialogue".</p>
              </div>
              <div>
                <h4 className="font-bold text-indigo-600 dark:text-indigo-400 mb-1">Deep Customization</h4>
                <p>Use the Studio settings to define a "Speaker Persona" (e.g. "Casey Neistat style") to drastically change the voice of the script.</p>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
              <Button onClick={() => setShowHelp(false)} className="w-full">Let's Create</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;