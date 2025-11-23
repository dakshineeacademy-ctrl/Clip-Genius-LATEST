
import React, { useState, useEffect } from 'react';
import { VideoClip, Template, ClipStyle, CustomCaptionStyle } from '../types';
import { TEMPLATES } from '../constants';
import Player from './Player';
import { Download, Sparkles, Wand2, Scissors, Share2, AlertCircle, Type, Palette, Droplets, Twitter, Facebook, Linkedin, Copy, Check, X, MessageCircle } from 'lucide-react';

interface EditorProps {
  videoUrl: string;
  clips: VideoClip[];
  onReset: () => void;
  onExportCheck: () => boolean;
  onExportSuccess: () => void;
}

const Editor: React.FC<EditorProps> = ({ videoUrl, clips, onReset, onExportCheck, onExportSuccess }) => {
  const [selectedClipId, setSelectedClipId] = useState<string>(clips[0]?.id || "");
  const [selectedTemplateId, setSelectedTemplateId] = useState<ClipStyle>(ClipStyle.MODERN);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Share State
  const [showShareModal, setShowShareModal] = useState(false);
  const [lastExportedBlob, setLastExportedBlob] = useState<Blob | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Custom Style State
  const [customStyle, setCustomStyle] = useState<CustomCaptionStyle>({
    textColor: '#ffffff',
    backgroundColor: '#000000',
    bgOpacity: 50, // Default 50%
    fontWeight: '800' // Default Bold
  });

  const currentClip = clips.find(c => c.id === selectedClipId) || null;
  const currentTemplate = TEMPLATES.find(t => t.id === selectedTemplateId) || TEMPLATES[0];

  // Reset export blob when clip changes
  useEffect(() => {
    setLastExportedBlob(null);
  }, [selectedClipId]);

  // Helper: Hex to RGBA string
  const hexToRgba = (hex: string, alphaPercent: number) => {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alphaPercent / 100})`;
  };

  // Helper: Get Font Family based on Template ID for export
  const getFontFamily = (templateId: ClipStyle) => {
    switch(templateId) {
        case ClipStyle.BOLD: return 'serif';
        case ClipStyle.MINIMAL: return 'monospace';
        case ClipStyle.NEON: 
        case ClipStyle.GAME:
        case ClipStyle.MODERN:
        default: return 'sans-serif';
    }
  };

  // Helper to draw captions on canvas matching the CSS styles + Custom Overrides
  const drawCaption = (ctx: CanvasRenderingContext2D, time: number, clip: VideoClip, template: Template) => {
    const relativeTime = time - clip.startTime;
    const activeCaption = clip.captions.find(c => relativeTime >= c.start && relativeTime <= c.end);
    
    if (!activeCaption) return;
    const text = activeCaption.text;

    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let x = w / 2;
    let y = h * 0.75; // Default bottom position

    // Common override styles
    const fontStr = `${customStyle.fontWeight} ${template.id === ClipStyle.NEON ? 'italic' : ''} ${template.id === ClipStyle.MODERN ? '60px' : template.id === ClipStyle.MINIMAL ? '45px' : template.id === ClipStyle.BOLD ? '80px' : '70px'} ${getFontFamily(template.id)}`;
    ctx.font = fontStr;

    // Background Color with Opacity
    const bgColor = hexToRgba(customStyle.backgroundColor, customStyle.bgOpacity);
    const textColor = customStyle.textColor;

    switch (template.id) {
      case ClipStyle.MODERN:
        const metrics = ctx.measureText(text);
        const padding = 30;
        
        ctx.fillStyle = bgColor;
        // Draw rounded rect approximation
        ctx.fillRect(x - metrics.width/2 - padding, y - 50, metrics.width + padding*2, 100);
        
        ctx.fillStyle = textColor;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 10;
        ctx.fillText(text, x, y);
        ctx.shadowBlur = 0;
        break;

      case ClipStyle.NEON:
        y = h * 0.7;
        // Neon typically doesn't have a bg box, but if user requests opacity > 0, we can apply it
        if (customStyle.bgOpacity > 0) {
             const m = ctx.measureText(text.toUpperCase());
             ctx.fillStyle = bgColor;
             ctx.fillRect(x - m.width/2 - 10, y - 50, m.width + 20, 100);
        }

        ctx.shadowColor = '#d946ef'; // Fuchsia Glow (Hardcoded style of template)
        ctx.shadowBlur = 30;
        ctx.fillStyle = textColor; // User Override
        ctx.fillText(text.toUpperCase(), x, y);
        ctx.shadowBlur = 0;
        
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#a21caf';
        ctx.strokeText(text.toUpperCase(), x, y);
        break;

      case ClipStyle.BOLD:
        y = h * 0.3; // Top
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-2 * Math.PI / 180); // -2 deg rotation
        
        const mBold = ctx.measureText(text.toUpperCase());
        
        ctx.fillStyle = bgColor; // User Override (Default Red in template, but now custom)
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 20;
        ctx.fillRect(-mBold.width/2 - 30, -60, mBold.width + 60, 120);
        
        ctx.fillStyle = textColor;
        ctx.shadowBlur = 0;
        ctx.fillText(text.toUpperCase(), 0, 0);
        ctx.restore();
        break;

      case ClipStyle.MINIMAL:
        y = h * 0.85;
        const mMin = ctx.measureText(text);
        
        ctx.fillStyle = bgColor;
        ctx.fillRect(x - mMin.width/2 - 20, y - 40, mMin.width + 40, 80);
        
        ctx.fillStyle = textColor;
        ctx.fillText(text, x, y);
        break;

      case ClipStyle.GAME:
         y = h * 0.8;
         if (customStyle.bgOpacity > 0) {
            const m = ctx.measureText(text);
            ctx.fillStyle = bgColor;
            ctx.fillRect(x - m.width/2 - 10, y - 50, m.width + 20, 100);
         }

         ctx.lineWidth = 8;
         ctx.lineJoin = 'round';
         ctx.strokeStyle = '#000000';
         ctx.strokeText(text, x, y);
         
         ctx.fillStyle = textColor;
         ctx.fillText(text, x, y);
         
         ctx.shadowColor = '#000';
         ctx.shadowOffsetX = 4;
         ctx.shadowOffsetY = 4;
         ctx.shadowBlur = 0;
         ctx.fillText(text, x, y);
         ctx.shadowColor = 'transparent';
         break;
    }
  };

  const handleExport = async () => {
    // 1. Check Usage Limit
    if (!onExportCheck()) return;

    if (!currentClip || !videoUrl) return;
    
    // Stop preview if playing
    setIsPlaying(false);
    setIsExporting(true);
    setExportProgress(0);

    const canvas = document.createElement('canvas');
    // Shorts resolution
    canvas.width = 1080;
    canvas.height = 1920; 
    const ctx = canvas.getContext('2d');
    if(!ctx) return;

    // Create a detached video element for rendering
    const exportVid = document.createElement('video');
    exportVid.src = videoUrl;
    exportVid.crossOrigin = "anonymous";
    exportVid.muted = false; // We want audio
    exportVid.playsInline = true;

    // Load metadata
    await new Promise((resolve) => {
        exportVid.onloadedmetadata = () => resolve(true);
    });

    // Setup Audio Context for mixing
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const actx = new AudioContext();
    const source = actx.createMediaElementSource(exportVid);
    const dest = actx.createMediaStreamDestination();
    
    source.connect(dest);
    source.connect(actx.destination); // Let user hear the export process

    // Create stream from canvas + audio
    const stream = canvas.captureStream(30); // 30 FPS
    if (dest.stream.getAudioTracks().length > 0) {
        stream.addTrack(dest.stream.getAudioTracks()[0]);
    }

    const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
    });
    
    const chunks: Blob[] = [];
    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    
    recorder.onstop = () => {
        // Create Blob
        const blob = new Blob(chunks, { type: 'video/webm' });
        setLastExportedBlob(blob); // Save for sharing

        // Download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ClipGenius_${currentClip.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Cleanup
        setIsExporting(false);
        actx.close();
        exportVid.remove();
        canvas.remove();

        // 2. Increment Usage Count
        onExportSuccess();

        // Optional: Open share modal after export
        // setShowShareModal(true); 
    };

    // Prepare Video
    exportVid.currentTime = currentClip.startTime;
    
    recorder.start();
    
    try {
      await exportVid.play();
    } catch (e) {
      console.error("Export play failed", e);
      setIsExporting(false);
      return;
    }

    // Render Loop
    const renderFrame = () => {
        // Check if finished or cancelled
        if (exportVid.paused || exportVid.ended || exportVid.currentTime >= currentClip.endTime) {
            recorder.stop();
            exportVid.pause();
            return;
        }

        // Update Progress
        const progress = ((exportVid.currentTime - currentClip.startTime) / (currentClip.endTime - currentClip.startTime)) * 100;
        setExportProgress(Math.min(progress, 100));

        // 1. Clear Canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Draw Video (Cover Logic for 9:16)
        const vidRatio = exportVid.videoWidth / exportVid.videoHeight;
        const canvasRatio = canvas.width / canvas.height;
        let drawW, drawH, drawX, drawY;

        if (vidRatio > canvasRatio) {
            // Video is wider than canvas (landscape -> portrait)
            drawH = canvas.height;
            drawW = drawH * vidRatio;
            drawX = (canvas.width - drawW) / 2;
            drawY = 0;
        } else {
            drawW = canvas.width;
            drawH = drawW / vidRatio;
            drawX = 0;
            drawY = (canvas.height - drawH) / 2;
        }
        ctx.drawImage(exportVid, drawX, drawY, drawW, drawH);

        // 3. Draw Overlays
        drawCaption(ctx, exportVid.currentTime, currentClip, currentTemplate);

        requestAnimationFrame(renderFrame);
    };

    renderFrame();
  };

  const handleNativeShare = async () => {
    if (!lastExportedBlob) return;
    
    const file = new File([lastExportedBlob], `clipgenius_short.webm`, { type: 'video/webm' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({
                files: [file],
                title: 'My Viral Short',
                text: 'Check out this short video I created with ClipGenius AI!'
            });
        } catch (err) {
            console.error("Share failed", err);
        }
    } else {
        alert("Your browser does not support direct file sharing. Please download the file.");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://clipgenius.ai/share/demo-clip-id"); // Mock URL
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      
      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-dark-800 border border-dark-600 w-full max-w-md rounded-2xl p-6 relative shadow-2xl">
                <button 
                    onClick={() => setShowShareModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
                >
                    <X size={20} />
                </button>
                
                <h3 className="text-2xl font-bold text-white mb-2">Share your Short</h3>
                <p className="text-gray-400 mb-6 text-sm">Spread your content across platforms.</p>

                {/* Video File Share */}
                {lastExportedBlob ? (
                     <div className="mb-6">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Video File</label>
                        <button 
                            onClick={handleNativeShare}
                            className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition"
                        >
                            <Share2 size={18} />
                            Share Video File (Mobile)
                        </button>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            Best for mobile apps (TikTok, Instagram, WhatsApp)
                        </p>
                     </div>
                ) : (
                    <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3 text-yellow-200 text-sm">
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <p>Export your video first to enable file sharing. Currently sharing app link only.</p>
                    </div>
                )}

                {/* Social Links */}
                <div className="mb-6">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Share Link</label>
                    <div className="grid grid-cols-4 gap-2">
                        <button className="flex flex-col items-center gap-2 p-3 bg-dark-700 rounded-lg hover:bg-dark-600 transition text-gray-300 hover:text-white">
                            <Twitter size={20} className="text-[#1DA1F2]" />
                            <span className="text-[10px]">Twitter</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 p-3 bg-dark-700 rounded-lg hover:bg-dark-600 transition text-gray-300 hover:text-white">
                            <Facebook size={20} className="text-[#1877F2]" />
                            <span className="text-[10px]">Facebook</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 p-3 bg-dark-700 rounded-lg hover:bg-dark-600 transition text-gray-300 hover:text-white">
                            <Linkedin size={20} className="text-[#0A66C2]" />
                            <span className="text-[10px]">LinkedIn</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 p-3 bg-dark-700 rounded-lg hover:bg-dark-600 transition text-gray-300 hover:text-white">
                            <MessageCircle size={20} className="text-[#25D366]" />
                            <span className="text-[10px]">WhatsApp</span>
                        </button>
                    </div>
                </div>

                {/* Direct Link */}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Direct Link</label>
                    <div className="flex items-center gap-2 bg-dark-900 border border-dark-600 rounded-lg p-1.5 pl-3">
                        <input 
                            readOnly 
                            value="https://clipgenius.ai/share/demo-clip-id" 
                            className="bg-transparent border-none outline-none text-gray-400 text-sm flex-1"
                        />
                        <button 
                            onClick={handleCopyLink}
                            className="p-2 bg-dark-700 hover:bg-dark-600 text-white rounded-md transition"
                        >
                            {isCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                        </button>
                    </div>
                </div>

            </div>
        </div>
      )}

      {/* Export Overlay */}
      {isExporting && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-8 backdrop-blur-sm">
           <div className="w-full max-w-md space-y-6 text-center">
             <div className="relative w-24 h-24 mx-auto">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle className="text-gray-700 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                  <circle 
                    className="text-brand-500 stroke-current transition-all duration-200 ease-linear" 
                    strokeWidth="8" 
                    strokeLinecap="round" 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="transparent" 
                    strokeDasharray="251.2" 
                    strokeDashoffset={251.2 - (251.2 * exportProgress) / 100}
                    transform="rotate(-90 50 50)"
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xl">
                  {Math.round(exportProgress)}%
                </div>
             </div>
             <h3 className="text-2xl font-bold text-white">Rendering Short...</h3>
             <p className="text-gray-400">Please wait while we bake your video with captions.</p>
             <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm bg-yellow-400/10 p-3 rounded-lg border border-yellow-400/20">
                <AlertCircle size={16} />
                <span>Audio is playing for synchronization.</span>
             </div>
           </div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-dark-700 bg-dark-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <Scissors size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">ClipGenius <span className="text-brand-400 text-sm font-normal">Editor</span></h1>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={onReset}
                disabled={isExporting}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition disabled:opacity-50"
            >
                Start Over
            </button>
            <button
                onClick={() => setShowShareModal(true)}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 border border-dark-600 bg-dark-700 text-white font-medium rounded-lg hover:bg-dark-600 transition disabled:opacity-50"
            >
                <Share2 size={18} />
                Share
            </button>
            <button 
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-2 px-6 py-2 bg-white text-dark-900 font-bold rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
            >
                <Download size={18} />
                Export Short
            </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Clips List */}
        <aside className="w-80 bg-dark-800 border-r border-dark-700 flex flex-col overflow-hidden hidden md:flex">
          <div className="p-4 border-b border-dark-700">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={14} className="text-brand-400" />
              AI Detected Moments
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {clips.map((clip) => (
              <div 
                key={clip.id}
                onClick={() => {
                  setSelectedClipId(clip.id);
                  setIsPlaying(true);
                }}
                className={`
                  p-4 rounded-xl cursor-pointer border transition-all duration-200
                  ${selectedClipId === clip.id 
                    ? 'bg-brand-900/30 border-brand-500 ring-1 ring-brand-500' 
                    : 'bg-dark-700 border-transparent hover:border-dark-600 hover:bg-dark-600'}
                `}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`
                    text-xs font-bold px-2 py-0.5 rounded
                    ${clip.viralScore > 90 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}
                  `}>
                    Score: {clip.viralScore}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    {Math.round(clip.endTime - clip.startTime)}s
                  </span>
                </div>
                <h3 className="font-semibold text-white mb-1 line-clamp-1">{clip.title}</h3>
                <p className="text-xs text-gray-400 line-clamp-2">{clip.description}</p>
              </div>
            ))}
          </div>
        </aside>

        {/* Center: Preview */}
        <main className="flex-1 bg-dark-900 p-8 flex items-center justify-center relative">
          <div className="absolute top-4 text-center">
            <p className="text-sm text-gray-500 mb-1">Previewing: <span className="text-white font-medium">{currentClip?.title}</span></p>
          </div>
          <Player 
            videoUrl={videoUrl}
            clip={currentClip}
            template={currentTemplate}
            customStyle={customStyle}
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
          />
        </main>

        {/* Right Sidebar: Customization */}
        <aside className="w-80 bg-dark-800 border-l border-dark-700 flex flex-col overflow-y-auto z-10">
          <div className="p-4 border-b border-dark-700">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Wand2 size={14} className="text-brand-400" />
              Styles & Captions
            </h2>
          </div>
          
          <div className="p-6 space-y-6">

             {/* Live Style Preview Box */}
             <div>
                <label className="text-sm font-medium text-gray-300 mb-3 block">Live Style Preview</label>
                <div className="w-full h-32 bg-dark-900 rounded-lg border border-dark-600 relative overflow-hidden flex items-center justify-center shadow-inner">
                    {/* Abstract Background to simulate video contrast */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/20 to-blue-900/20"></div>
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
                    
                    {/* Render the styled text using currentTemplate classes + inline overrides */}
                    <div className="relative z-10 p-4 text-center">
                      <span 
                        className={currentTemplate.textClass}
                        style={{
                            color: customStyle.textColor,
                            backgroundColor: hexToRgba(customStyle.backgroundColor, customStyle.bgOpacity),
                            fontWeight: customStyle.fontWeight
                        }}
                      >
                        Viral Caption
                      </span>
                    </div>
                </div>
            </div>

            {/* Template Selection */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-3 block">Caption Templates</label>
              <div className="grid grid-cols-2 gap-3">
                {TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`
                      relative h-20 rounded-lg overflow-hidden border-2 transition-all group
                      ${selectedTemplateId === tpl.id ? 'border-brand-500 scale-105 shadow-lg shadow-brand-900/20' : 'border-dark-600 opacity-70 hover:opacity-100'}
                    `}
                  >
                    <div className={`absolute inset-0 ${tpl.previewColor} opacity-20`}></div>
                    <div className="absolute inset-0 flex items-center justify-center p-2">
                      <span className={`text-sm ${tpl.fontClass} text-white truncate max-w-full px-1`}>
                        Abc
                      </span>
                    </div>
                    <div className="absolute bottom-1 left-0 right-0 text-[10px] text-center text-gray-300 bg-black/40">
                        {tpl.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Fine-Tuning Controls */}
            <div className="bg-dark-700/30 rounded-xl p-4 border border-dark-600 space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Fine Tuning</h3>
                
                {/* Row 1: Text Color & Font Weight */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400 flex items-center gap-1">
                            <Palette size={12} /> Text Color
                        </label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="color" 
                                value={customStyle.textColor}
                                onChange={(e) => setCustomStyle({...customStyle, textColor: e.target.value})}
                                className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0"
                            />
                            <span className="text-xs font-mono text-gray-400">{customStyle.textColor}</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400 flex items-center gap-1">
                            <Type size={12} /> Weight
                        </label>
                        <select 
                            value={customStyle.fontWeight}
                            onChange={(e) => setCustomStyle({...customStyle, fontWeight: e.target.value})}
                            className="w-full bg-dark-900 border border-dark-600 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-brand-500"
                        >
                            <option value="300">Light</option>
                            <option value="400">Normal</option>
                            <option value="600">Semibold</option>
                            <option value="800">Bold</option>
                            <option value="900">Black</option>
                        </select>
                    </div>
                </div>

                {/* Row 2: BG Color & Opacity */}
                <div className="space-y-3 pt-2 border-t border-dark-600/50">
                    <div className="flex justify-between items-center">
                        <label className="text-xs text-gray-400 flex items-center gap-1">
                            <Droplets size={12} /> Background
                        </label>
                        <input 
                                type="color" 
                                value={customStyle.backgroundColor}
                                onChange={(e) => setCustomStyle({...customStyle, backgroundColor: e.target.value})}
                                className="w-5 h-5 rounded cursor-pointer bg-transparent border-none p-0"
                        />
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Opacity</span>
                            <span>{customStyle.bgOpacity}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={customStyle.bgOpacity}
                            onChange={(e) => setCustomStyle({...customStyle, bgOpacity: parseInt(e.target.value)})}
                            className="w-full h-1 bg-dark-600 rounded-lg appearance-none cursor-pointer accent-brand-500"
                        />
                    </div>
                </div>
            </div>

            <div className="p-4 bg-dark-700/50 rounded-xl border border-dark-600">
                <h3 className="text-sm font-medium text-white mb-2">Caption Timeline</h3>
                <div className="space-y-2">
                    {currentClip?.captions.slice(0, 3).map((cap, i) => (
                        <div key={i} className="flex justify-between text-xs text-gray-400 italic border-l-2 border-dark-500 pl-2">
                            <span>"{cap.text}"</span>
                            <span className="text-gray-600 font-mono">{cap.start}s</span>
                        </div>
                    ))}
                    <div className="text-xs text-gray-600 pl-2">...</div>
                </div>
            </div>

            <div>
                <button 
                    onClick={() => setShowShareModal(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 border border-dark-600 rounded-lg text-gray-300 hover:bg-dark-700 hover:text-white transition group"
                >
                    <Share2 size={16} className="group-hover:text-brand-400 transition-colors" />
                    Social Optimization
                </button>
            </div>

          </div>
        </aside>
      </div>
    </div>
  );
};

export default Editor;
