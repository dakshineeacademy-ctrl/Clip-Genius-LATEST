export enum ClipStyle {
  MODERN = 'MODERN',
  NEON = 'NEON',
  BOLD = 'BOLD',
  MINIMAL = 'MINIMAL',
  GAME = 'GAME'
}

export interface Caption {
  text: string;
  start: number; // Relative to clip start in seconds
  end: number;   // Relative to clip start in seconds
}

export interface VideoClip {
  id: string;
  title: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  description: string;
  viralScore: number; // 1-100
  captions: Caption[];
}

export interface Template {
  id: ClipStyle;
  name: string;
  previewColor: string;
  fontClass: string;
  containerClass: string;
  textClass: string;
}

export interface CustomCaptionStyle {
  textColor: string;
  backgroundColor: string;
  bgOpacity: number; // 0 to 100
  fontWeight: string; // '400', '700', '900'
}

export interface ProcessingState {
  status: 'IDLE' | 'UPLOADING' | 'ANALYZING' | 'COMPLETE' | 'ERROR';
  message?: string;
  progress?: number;
}