export interface ScriptSegment {
  narration: string;
  visual: string;
}

export interface ScriptAnalysis {
  score: number;
  headline: string;
  viralFactors: string[];
  platformTips: string[];
}

export interface GeneratedContent {
  script: ScriptSegment[];
  analysis: ScriptAnalysis;
}

export type DurationType = 'short' | 'medium' | 'long' | 'custom';

export interface AdvancedConfig {
  audience: string;
  pacing: string;
  cta: string;
  keywords: string;
  speakerPersona: string;
  visualTheme: string;
  referenceStyle: string;
}

export interface GenerationConfig {
  title: string;
  duration: string;
  tone: string;
  platform: string;
  advanced: AdvancedConfig;
}

export enum ViewMode {
  CLEAN = 'CLEAN',
  PRODUCTION = 'PRODUCTION',
}