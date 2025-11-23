
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import VideoUploader from './components/VideoUploader';
import Editor from './components/Editor';
import UpgradeModal from './components/UpgradeModal';
import { PlansView, AboutView, PrivacyView, TermsView } from './components/StaticPages';
import { VideoClip, ProcessingState } from './types';
import { analyzeVideoContent } from './services/geminiService';
import { userService } from './services/userService';
import { Loader2, Sparkles, AlertTriangle, Search } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('home');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [processingState, setProcessingState] = useState<ProcessingState>({ status: 'IDLE' });
  const [activeSearchQuery, setActiveSearchQuery] = useState<string | undefined>(undefined);
  
  // Usage & Upgrade State
  const [usageCount, setUsageCount] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    setUsageCount(userService.getUsage());
  }, []);

  const handleFileSelect = async (file: File, searchQuery?: string) => {
    if (userService.hasReachedLimit()) {
      setShowUpgradeModal(true);
      return;
    }

    setVideoFile(file);
    setActiveSearchQuery(searchQuery);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    
    setProcessingState({ status: 'ANALYZING' });

    try {
      const detectedClips = await analyzeVideoContent(file, searchQuery);
      if (detectedClips.length === 0) {
        setProcessingState({ status: 'ERROR', message: "No matching clips found. Try a different video or query." });
      } else {
        setClips(detectedClips as VideoClip[]);
        setProcessingState({ status: 'COMPLETE' });
      }
    } catch (err) {
      console.error(err);
      setProcessingState({ status: 'ERROR', message: "Failed to analyze video. Please try again." });
    }
  };

  const handleReset = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoFile(null);
    setVideoUrl(null);
    setClips([]);
    setProcessingState({ status: 'IDLE' });
    setActiveSearchQuery(undefined);
  };

  const handleExportCheck = (): boolean => {
    if (userService.hasReachedLimit()) {
      setShowUpgradeModal(true);
      return false;
    }
    return true;
  };

  const handleExportSuccess = () => {
    const newCount = userService.incrementUsage();
    setUsageCount(newCount);
  };

  const handleUpgradeComplete = () => {
    setShowUpgradeModal(false);
    setUsageCount(userService.getUsage());
    setCurrentView('home'); // Go back home after upgrade
  };

  // View Rendering Logic
  const renderContent = () => {
    if (currentView === 'plans') return <PlansView onSelectPlan={() => setShowUpgradeModal(true)} />;
    if (currentView === 'about') return <AboutView />;
    if (currentView === 'privacy') return <PrivacyView />;
    if (currentView === 'terms') return <TermsView />;
    
    // HOME View
    if (processingState.status === 'IDLE') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden py-10">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-brand-600/20 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]"></div>
                </div>

                <div className="z-10 text-center mb-12 max-w-2xl px-4">
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
                    Turn Long Videos into <br/>
                    <span className="text-brand-400">Viral Shorts</span>
                    </h1>
                    <p className="text-lg text-gray-400 mb-8">
                    AI-powered clipper that finds the best moments, adds vertical formatting, 
                    and generates beautiful captions instantly.
                    </p>
                </div>

                <div className="z-10 w-full px-4">
                    <VideoUploader 
                    onFileSelect={handleFileSelect} 
                    onShowUpgrade={() => setShowUpgradeModal(true)}
                    usageCount={usageCount}
                    />
                </div>
            </div>
        );
    }

    if (processingState.status === 'ANALYZING') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative">
                <div className="absolute inset-0 bg-brand-500/20 blur-xl rounded-full"></div>
                <Loader2 size={64} className="text-brand-500 animate-spin relative z-10" />
            </div>
            <h2 className="text-2xl font-bold mt-8 text-white">Analyzing Content...</h2>
            <p className="text-gray-400 mt-2 max-w-md text-center">
                Gemini is watching your video, 
                {activeSearchQuery ? " searching for your requested moments, " : " identifying viral moments, "}
                and generating captions.
            </p>
            <div className="mt-8 flex gap-2 items-center text-sm text-brand-300 bg-brand-900/30 px-4 py-2 rounded-full border border-brand-500/30">
                {activeSearchQuery ? <Search size={16} /> : <Sparkles size={16} />}
                <span>{activeSearchQuery ? `Searching: "${activeSearchQuery}"` : 'Detecting "Aha!" moments'}</span>
            </div>
            </div>
        );
    }

    if (processingState.status === 'ERROR') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 min-h-[60vh]">
            <div className="p-4 bg-red-500/20 rounded-full mb-6 text-red-400">
                <AlertTriangle size={48} />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-white">Oops! Something went wrong.</h2>
            <p className="text-gray-400 mb-8">{processingState.message}</p>
            <button 
                onClick={handleReset}
                className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition"
            >
                Try Again
            </button>
            </div>
        );
    }

    if (processingState.status === 'COMPLETE' && videoUrl) {
        return (
            <Editor 
            videoUrl={videoUrl} 
            clips={clips} 
            onReset={handleReset}
            onExportCheck={handleExportCheck}
            onExportSuccess={handleExportSuccess}
            />
        );
    }

    return null;
  };

  return (
    <div className="min-h-screen w-full bg-dark-900 text-white flex flex-col font-sans">
      <Navbar 
        currentView={currentView} 
        onNavigate={(view) => {
            if (processingState.status !== 'IDLE' && processingState.status !== 'COMPLETE' && view !== 'home') {
                 // Prevent navigation during analysis if you want, or just allow it and reset
                 if(!window.confirm("Navigating away will cancel current analysis. Continue?")) return;
                 handleReset();
            }
            // If going home and already completed, keep state, otherwise simple nav
            setCurrentView(view);
        }}
        onOpenUpgrade={() => setShowUpgradeModal(true)}
      />
      
      <UpgradeModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgradeComplete={handleUpgradeComplete}
      />

      <main className="flex-1 flex flex-col">
         {renderContent()}
      </main>
    </div>
  );
};

export default App;
