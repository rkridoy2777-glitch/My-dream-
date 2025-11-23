import React, { useState } from 'react';
import { StoryGenre, ArtStyle, StoryParams } from '../types';
import { Button } from './Button';
import { Sparkles, Wand2, BookOpen, Palette } from 'lucide-react';

interface CreateStoryProps {
  onSubmit: (params: StoryParams) => void;
  isGenerating: boolean;
}

export const CreateStory: React.FC<CreateStoryProps> = ({ onSubmit, isGenerating }) => {
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState<StoryGenre>(StoryGenre.FANTASY);
  const [artStyle, setArtStyle] = useState<ArtStyle>(ArtStyle.THREE_D_RENDER);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onSubmit({ prompt, genre, artStyle });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-dark-lighter/50 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-white/5 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300 mb-3">
            Weave Your Tale
          </h2>
          <p className="text-slate-400">Describe your idea, and watch the magic unfold.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300 ml-1">
              Your Story Concept
            </label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-32 bg-dark/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                placeholder="E.g., A lonely robot who discovers a flower in a cyberpunk wasteland..."
                disabled={isGenerating}
              />
              <Sparkles className="absolute right-4 bottom-4 w-5 h-5 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Genre Selection */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-slate-300 ml-1">
                <BookOpen className="w-4 h-4 mr-2 text-primary" /> Genre
              </label>
              <div className="relative">
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value as StoryGenre)}
                  className="w-full bg-dark/50 border border-slate-700 rounded-xl p-3 px-4 text-white focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                  disabled={isGenerating}
                >
                  {Object.values(StoryGenre).map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* Art Style Selection */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-slate-300 ml-1">
                <Palette className="w-4 h-4 mr-2 text-secondary" /> Art Style
              </label>
              <div className="relative">
                <select
                  value={artStyle}
                  onChange={(e) => setArtStyle(e.target.value as ArtStyle)}
                  className="w-full bg-dark/50 border border-slate-700 rounded-xl p-3 px-4 text-white focus:ring-2 focus:ring-secondary appearance-none cursor-pointer"
                  disabled={isGenerating}
                >
                  {Object.values(ArtStyle).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full py-4 text-lg font-semibold tracking-wide"
            isLoading={isGenerating}
            icon={<Wand2 className="w-5 h-5" />}
          >
            {isGenerating ? 'Weaving Magic...' : 'Generate Story'}
          </Button>
        </form>
      </div>
    </div>
  );
};