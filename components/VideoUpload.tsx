import React, { useCallback, useState } from 'react';
import { Upload, X, Film, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface VideoUploadProps {
  onFileSelect: (file: File) => void;
  onCancel: () => void;
  isAnalyzing: boolean;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({ onFileSelect, onCancel, isAnalyzing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateAndUpload = (file: File) => {
    setError(null);
    if (!file.type.startsWith('video/')) {
      setError("Please upload a video file.");
      return;
    }
    // Limit to 50MB for this demo to prevent browser crash with base64
    // In production with File API, this can be higher.
    if (file.size > 50 * 1024 * 1024) {
      setError("For this browser demo, please use videos under 50MB.");
      return;
    }
    onFileSelect(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-white/10 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-black w-full max-w-xl p-8 rounded-2xl border-2 border-black dark:border-white neo-shadow relative animate-fade-in-up transition-colors duration-300">
        <button 
          onClick={onCancel}
          disabled={isAnalyzing}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors dark:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-black mb-2 dark:text-white">Upload Workout</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Let Gemini analyze your technique.</p>

        {isAnalyzing ? (
          <div className="text-center py-12 space-y-6">
            <div className="inline-block relative">
              <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-800 border-t-black dark:border-t-white rounded-full animate-spin"></div>
            </div>
            <div>
              <h3 className="text-xl font-bold animate-pulse dark:text-white">Analyzing Form...</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Our AI coach is reviewing frame-by-frame.</p>
              <p className="text-xs text-gray-400 mt-4">This might take a minute.</p>
            </div>
          </div>
        ) : (
          <div 
            className={`border-4 border-dashed rounded-xl p-10 text-center transition-all ${
              dragActive 
                ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-900 scale-[1.02]' 
                : 'border-gray-300 dark:border-gray-700'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Film className="w-10 h-10 text-gray-800 dark:text-gray-200" />
            </div>
            
            <h3 className="text-xl font-bold mb-2 dark:text-white">Drag video here</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">or click to browse</p>
            
            <input 
              type="file" 
              accept="video/*"
              className="hidden" 
              id="video-upload"
              onChange={handleChange}
            />
            <label htmlFor="video-upload">
              <Button variant="primary" as="span" className="cursor-pointer">
                Select Video
              </Button>
            </label>

            {error && (
              <div className="mt-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-bold">{error}</span>
              </div>
            )}
            
            <p className="mt-4 text-xs text-gray-400">Supported formats: MP4, MOV, WEBM</p>
          </div>
        )}
      </div>
    </div>
  );
};