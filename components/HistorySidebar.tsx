import React from 'react';
import { GeneratedStory } from '../types';
import { Clock, Trash2, ChevronRight } from 'lucide-react';

interface HistorySidebarProps {
  stories: GeneratedStory[];
  onSelect: (story: GeneratedStory) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ stories, onSelect, onDelete, isOpen, onClose }) => {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={`fixed top-0 left-0 h-full w-80 bg-dark border-r border-white/5 transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:block`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-serif font-bold text-white flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary" />
              Library
            </h3>
            <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
            {stories.length === 0 ? (
              <div className="text-center text-slate-500 mt-10">
                <p>No stories yet.</p>
                <p className="text-sm">Create your first tale!</p>
              </div>
            ) : (
              stories.map((story) => (
                <div 
                  key={story.id}
                  onClick={() => onSelect(story)}
                  className="group relative bg-dark-lighter/50 hover:bg-dark-lighter p-4 rounded-xl cursor-pointer border border-transparent hover:border-primary/30 transition-all"
                >
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
                      {story.imageUrl ? (
                        <img src={story.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary to-secondary opacity-50" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">
                        {story.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 truncate">
                        {new Date(story.timestamp).toLocaleDateString()} • {story.params.genre}
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => onDelete(story.id, e)}
                    className="absolute top-2 right-2 p-1.5 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete story"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};