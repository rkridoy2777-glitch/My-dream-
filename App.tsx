import React, { useState, useEffect } from 'react';
import { Layout, Menu, Github } from 'lucide-react';
import { CreateStory } from './components/CreateStory';
import { StoryView } from './components/StoryView';
import { HistorySidebar } from './components/HistorySidebar';
import { GeneratedStory, StoryParams, LoadingState } from './types';
import { generateStoryText, generateStoryImage, generateStorySpeech } from './services/geminiService';

const STORAGE_KEY = 'dreamweaver_stories';

export default function App() {
  const [stories, setStories] = useState<GeneratedStory[]>([]);
  const [currentStory, setCurrentStory] = useState<GeneratedStory | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>({ status: 'idle' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setStories(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse stories", e);
      }
    }
  }, []);

  // Save history on update
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
  }, [stories]);

  const handleCreateStory = async (params: StoryParams) => {
    setLoadingState({ status: 'generating_text', message: 'Crafting the narrative...' });
    
    try {
      // 1. Generate Text
      const textData = await generateStoryText(params);
      
      const storyId = Date.now().toString();
      const partialStory: GeneratedStory = {
        id: storyId,
        title: textData.title,
        content: textData.content,
        imagePrompt: textData.imagePrompt,
        timestamp: Date.now(),
        params
      };

      // Update UI with text immediately
      setCurrentStory(partialStory);
      setStories(prev => [partialStory, ...prev]);

      // 2. Generate Image
      setLoadingState({ status: 'generating_image', message: 'Visualizing the scene...' });
      const imageUrl = await generateStoryImage(textData.imagePrompt, params.artStyle);
      
      let updatedStory = { ...partialStory, imageUrl: imageUrl || undefined };
      setCurrentStory(updatedStory);
      setStories(prev => prev.map(s => s.id === storyId ? updatedStory : s));

      // 3. Generate Audio
      setLoadingState({ status: 'generating_audio', message: 'Summoning the narrator...' });
      const audioBase64 = await generateStorySpeech(textData.content);
      
      updatedStory = { ...updatedStory, audioBase64: audioBase64 || undefined };
      setCurrentStory(updatedStory);
      setStories(prev => prev.map(s => s.id === storyId ? updatedStory : s));

      setLoadingState({ status: 'complete' });

    } catch (error) {
      console.error(error);
      setLoadingState({ status: 'error', message: 'The magic fizzled. Please try again.' });
      setTimeout(() => setLoadingState({ status: 'idle' }), 3000);
    }
  };

  const handleDeleteStory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStories(prev => prev.filter(s => s.id !== id));
    if (currentStory?.id === id) {
      setCurrentStory(null);
    }
  };

  return (
    <div className="flex h-screen bg-dark overflow-hidden">
      {/* Sidebar */}
      <HistorySidebar 
        stories={stories}
        onSelect={(story) => {
          setCurrentStory(story);
          setIsSidebarOpen(false);
        }}
        onDelete={handleDeleteStory}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full w-full relative">
        
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-dark/80 backdrop-blur-md z-30">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="mr-4 lg:hidden text-slate-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold font-serif text-lg shadow-lg shadow-primary/25">
                D
              </div>
              <span className="text-xl font-serif font-bold text-white tracking-tight">DreamWeaver</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {loadingState.status !== 'idle' && loadingState.status !== 'complete' && loadingState.status !== 'error' && (
               <div className="flex items-center text-xs font-medium text-primary animate-pulse">
                 <span className="mr-2">{loadingState.message}</span>
                 <div className="flex gap-1">
                   <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                   <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                   <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
                 </div>
               </div>
             )}
             <a href="#" className="text-slate-500 hover:text-white transition-colors">
               <Github className="w-5 h-5" />
             </a>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative scrollbar-hide">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2" />
             <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] translate-y-1/2" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto h-full flex flex-col justify-center">
            {currentStory ? (
              <StoryView 
                story={currentStory} 
                onBack={() => setCurrentStory(null)} 
              />
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                 <CreateStory 
                   onSubmit={handleCreateStory}
                   isGenerating={loadingState.status !== 'idle' && loadingState.status !== 'complete' && loadingState.status !== 'error'}
                 />
                 
                 {loadingState.status === 'error' && (
                   <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                     {loadingState.message}
                   </div>
                 )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}