
import React, { useCallback, useState } from 'react';
import { UploadCloud, Film, AlertCircle, Lock, Crown, Search, Sparkles } from 'lucide-react';
import { userService } from '../services/userService';

interface VideoUploaderProps {
  onFileSelect: (file: File, searchQuery?: string) => void;
  onShowUpgrade: () => void;
  usageCount: number;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ onFileSelect, onShowUpgrade, usageCount }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'auto' | 'custom'>('auto');
  const [searchQuery, setSearchQuery] = useState('');

  const plan = userService.getPlanDetails();
  const limit = plan.limit;
  const isFree = userService.getPlanId() === 'free';
  const isLimitReached = usageCount >= limit;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    
    if (isLimitReached) {
      onShowUpgrade();
      return;
    }

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndPassFile(files[0]);
    }
  }, [isLimitReached, onShowUpgrade, mode, searchQuery]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLimitReached) {
        onShowUpgrade();
        return;
    }

    if (e.target.files && e.target.files.length > 0) {
      validateAndPassFile(e.target.files[0]);
    }
  };

  const validateAndPassFile = (file: File) => {
    // Check type
    if (!file.type.startsWith('video/')) {
      setError("Please upload a valid video file.");
      return;
    }
    // Check size (Max 200MB)
    if (file.size > 200 * 1024 * 1024) {
      setError("File is too large (Max 200MB).");
      return;
    }
    
    // Pass file and search query (if custom mode is active)
    onFileSelect(file, mode === 'custom' ? searchQuery : undefined);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
        {/* Usage Bar */}
        <div className="mb-6 bg-dark-800 rounded-lg p-4 border border-dark-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${!isFree ? 'bg-brand-500/20 text-brand-400' : 'bg-gray-700 text-gray-400'}`}>
                    {!isFree ? <Crown size={20} /> : <Lock size={20} />}
                </div>
                <div>
                    <h4 className="text-sm font-bold text-white">{plan.name}</h4>
                    <p className="text-xs text-gray-400">
                        {usageCount} / {limit} shorts created
                    </p>
                </div>
            </div>
            
            {isFree && (
                <button 
                    onClick={onShowUpgrade}
                    className="text-xs bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 rounded-md transition"
                >
                    Upgrade
                </button>
            )}
        </div>

        {/* Mode Toggles */}
        <div className="flex p-1 bg-dark-800 rounded-xl mb-6 border border-dark-700">
            <button 
                onClick={() => setMode('auto')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${mode === 'auto' ? 'bg-dark-700 text-brand-400 shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
                <Sparkles size={16} />
                Auto Viral Moments
            </button>
            <button 
                onClick={() => setMode('custom')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${mode === 'custom' ? 'bg-dark-700 text-brand-400 shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
                <Search size={16} />
                Custom Search
            </button>
        </div>

        {/* Custom Search Input */}
        {mode === 'custom' && (
            <div className="mb-6 animate-fade-in">
                <label className="block text-sm font-medium text-gray-400 mb-2">What moments are you looking for?</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="e.g. Find funny mistakes, or moments talking about pricing..."
                        className="w-full bg-dark-800 border border-dark-600 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-brand-500 outline-none transition"
                    />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    AI will specifically look for segments matching your description.
                </p>
            </div>
        )}

      <div 
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
          ${isDragging 
            ? 'border-brand-500 bg-brand-500/10 scale-[1.02]' 
            : 'border-brand-300/30 bg-dark-800/50 hover:border-brand-400 hover:bg-dark-800'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-brand-500/20 text-brand-400 mb-2">
            <UploadCloud size={48} />
          </div>
          <h3 className="text-2xl font-bold text-white">
            {mode === 'auto' ? 'Upload Video for Auto-Analysis' : 'Upload Video to Search'}
          </h3>
          <p className="text-gray-400 max-w-md">
            Drag and drop your MP4, MOV, or WEBM file here. 
            {mode === 'auto' ? " We'll find the viral hits." : " We'll find your specific moments."}
          </p>
          
          <label 
            onClick={(e) => {
                if(isLimitReached) {
                    e.preventDefault();
                    onShowUpgrade();
                }
            }}
            className={`
                mt-4 px-6 py-3 font-semibold rounded-lg cursor-pointer transition-colors shadow-lg
                ${isLimitReached 
                    ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' 
                    : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-900/50'}
            `}
          >
            {isLimitReached ? 'Limit Reached' : 'Browse Files'}
            <input 
              type="file" 
              className="hidden" 
              accept="video/*"
              onChange={handleFileInput}
              disabled={isLimitReached}
            />
          </label>
          
          <div className="mt-4 text-xs text-gray-500 flex items-center gap-2">
            <Film size={14} />
            <span>Supported formats: MP4, MOV, WEBM (Max 200MB)</span>
          </div>

          {error && (
            <div className="absolute -bottom-16 left-0 right-0 p-3 bg-red-500/10 border border-red-500/50 text-red-200 rounded-lg flex items-center justify-center gap-2 text-sm animate-fade-in">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoUploader;
