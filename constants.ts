import { ClipStyle, Template, VideoClip } from './types';

export const TEMPLATES: Template[] = [
  {
    id: ClipStyle.MODERN,
    name: "Modern Clean",
    previewColor: "bg-white",
    fontClass: "font-sans font-bold",
    containerClass: "bottom-20 left-4 right-4 text-center",
    textClass: "text-2xl text-white drop-shadow-md bg-black/50 px-2 py-1 rounded inline-block"
  },
  {
    id: ClipStyle.NEON,
    name: "Neon Vibes",
    previewColor: "bg-fuchsia-500",
    fontClass: "font-sans font-black italic tracking-wider",
    containerClass: "bottom-1/3 left-0 right-0 text-center",
    textClass: "text-3xl text-yellow-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] [text-shadow:_0_0_10px_rgb(255_0_255)] uppercase"
  },
  {
    id: ClipStyle.BOLD,
    name: "Bold Impact",
    previewColor: "bg-red-600",
    fontClass: "font-serif font-black",
    containerClass: "top-1/4 left-4 right-4 text-center",
    textClass: "text-4xl text-white bg-red-600 px-4 py-2 uppercase transform -rotate-2 inline-block shadow-lg"
  },
  {
    id: ClipStyle.MINIMAL,
    name: "Subtle",
    previewColor: "bg-gray-400",
    fontClass: "font-mono font-medium",
    containerClass: "bottom-10 left-10 right-10 text-center",
    textClass: "text-lg text-white/90 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm"
  },
  {
    id: ClipStyle.GAME,
    name: "Gamer",
    previewColor: "bg-green-500",
    fontClass: "font-sans font-extrabold",
    containerClass: "bottom-24 left-2 right-2 text-center",
    textClass: "text-2xl text-green-400 stroke-black stroke-2 [text-shadow:_2px_2px_0_#000]"
  }
];

export const MOCK_CLIPS_FALLBACK: VideoClip[] = [
  {
    id: '1',
    title: 'Mind-Blowing Fact',
    startTime: 15,
    endTime: 30,
    description: 'The speaker reveals a surprising statistic about space travel.',
    viralScore: 92,
    captions: [
      { text: "Did you know?", start: 0, end: 2 },
      { text: "Space is completely silent.", start: 2, end: 5 },
      { text: "Because there is no atmosphere...", start: 5, end: 9 },
      { text: "Sound has no way to travel!", start: 9, end: 12 },
      { text: "It's terrifying but cool.", start: 12, end: 15 }
    ]
  },
  {
    id: '2',
    title: 'Funny Mistake',
    startTime: 60,
    endTime: 75,
    description: 'A hilarious blooper happens during the demonstration.',
    viralScore: 88,
    captions: [
      { text: "Watch this closely...", start: 0, end: 3 },
      { text: "Wait for it...", start: 3, end: 5 },
      { text: "Oh no!", start: 5, end: 7 },
      { text: "I can't believe that just happened.", start: 7, end: 11 },
      { text: "Total fail!", start: 11, end: 14 }
    ]
  }
];