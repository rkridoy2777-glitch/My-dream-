import React, { useEffect, useRef, useState } from 'react';
import { GeneratedStory } from '../types';
import { Play, Pause, Download, Volume2, Share2, ArrowLeft } from 'lucide-react';
import { Button } from './Button';
import { decodeAudioData, audioBufferToWav } from '../services/audioUtils';

interface StoryViewProps {
  story: GeneratedStory;
  onBack: () => void;
}

export const StoryView: React.FC<StoryViewProps> = ({ story, onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(story.audioUrl || null);

  useEffect(() => {
    // If we have base64 but no URL, create the URL
    const prepareAudio = async () => {
      if (!audioUrl && story.audioBase64) {
        try {
          const audioBuffer = await decodeAudioData(story.audioBase64);
          const wavBlob = audioBufferToWav(audioBuffer);
          const url = URL.createObjectURL(wavBlob);
          setAudioUrl(url);
        } catch (e) {
          console.error("Failed to decode audio", e);
        }
      }
    };
    prepareAudio();
    
    return () => {
      if (audioUrl && !story.audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [story.audioBase64, story.audioUrl]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center text-slate-400 hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="bg-dark-lighter rounded-3xl overflow-hidden shadow-2xl border border-white/5">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Visual Side */}
          <div className="relative h-[400px] md:h-auto bg-black">
            {story.imageUrl ? (
              <img 
                src={story.imageUrl} 
                alt={story.title} 
                className="w-full h-full object-cover opacity-90"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                <span className="italic">Visualizing...</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-lighter via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-dark-lighter" />
          </div>

          {/* Content Side */}
          <div className="p-8 md:p-10 flex flex-col relative">
            <div className="flex-1">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">
                {story.params.genre}
              </span>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6 leading-tight">
                {story.title}
              </h1>
              
              <div className="prose prose-invert prose-lg max-w-none text-slate-300 mb-8 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
                <p className="whitespace-pre-line leading-relaxed">
                  {story.content}
                </p>
              </div>
            </div>

            {/* Audio Player */}
            {audioUrl && (
              <div className="mt-auto pt-6 border-t border-white/5">
                 <audio 
                    ref={audioRef} 
                    src={audioUrl} 
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleEnded}
                    className="hidden"
                  />
                  
                  <div className="flex items-center gap-4 bg-black/20 rounded-xl p-3">
                    <button 
                      onClick={togglePlay}
                      className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-dark hover:scale-105 transition-all shadow-lg shadow-white/10 flex-shrink-0"
                    >
                      {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                    </button>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between text-xs text-slate-400 font-medium uppercase tracking-wide">
                        <span>Narrator</span>
                        <span>
                          {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} / 
                          {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
              </div>
            )}
            
            <div className="mt-6 flex gap-3">
                <Button variant="secondary" className="flex-1 text-xs" onClick={() => {
                   // Simple share mock
                   if(navigator.share) {
                       navigator.share({ title: story.title, text: story.content });
                   } else {
                       alert("Sharing not supported on this browser");
                   }
                }}>
                    <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
                {story.imageUrl && (
                    <a href={story.imageUrl} download={`story-${story.id}.png`} className="flex-1">
                        <Button variant="secondary" className="w-full text-xs">
                             <Download className="w-4 h-4 mr-2" /> Art
                        </Button>
                    </a>
                )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
