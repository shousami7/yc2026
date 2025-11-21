"use client";

import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  MessageSquare,
  Scissors,
  LayoutGrid,
  ListVideo,
  Wand2,
  Download,
  Settings,
  MoreHorizontal,
  Sparkles,
  Image as ImageIcon,
  Mic,
  Send,
  Layers
} from 'lucide-react';

// Mock Data for "Broken Down" Scenes
const MOCK_SCENES = [
  { id: 1, time: '00:00', duration: '3s', thumbnail: '/api/placeholder/320/180', label: 'Intro' },
  { id: 2, time: '00:03', duration: '5s', thumbnail: '/api/placeholder/320/180', label: 'Talking Head' },
  { id: 3, time: '00:08', duration: '2s', thumbnail: '/api/placeholder/320/180', label: 'B-Roll City' },
  { id: 4, time: '00:10', duration: '4s', thumbnail: '/api/placeholder/320/180', label: 'Product Shot' },
  { id: 5, time: '00:14', duration: '3s', thumbnail: '/api/placeholder/320/180', label: 'Outro' },
];

const MOCK_CHAT = [
  { role: 'ai', text: 'I analyzed your footage. I found 5 distinct scenes. Do you want me to color grade the "City" shot to look more cinematic?' },
  { role: 'user', text: 'Yes, make it look like Cyberpunk 2077 style.' },
];

export default function VideoEditorUI() {
  const [viewMode, setViewMode] = useState('grid'); // 'timeline' or 'grid'
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedScene, setSelectedScene] = useState<any>(null);
  const [chatInput, setChatInput] = useState('');

  // Simulate cursor-like interaction
  const handleSceneClick = (scene: any) => {
    setSelectedScene(scene);
  };

  return (
    <div className="flex h-screen w-full bg-[#09090b] text-gray-300 font-sans overflow-hidden selection:bg-blue-500/30">

      {/* LEFT SIDEBAR: Tools */}
      <div className="w-16 flex flex-col items-center py-4 border-r border-zinc-800 bg-zinc-950/50 gap-6">
        <div className="p-2 bg-blue-600 rounded-lg text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]">
          <Sparkles size={24} />
        </div>
        <nav className="flex flex-col gap-6">
          <ToolButton icon={<Layers size={20} />} label="Media" active />
          <ToolButton icon={<Scissors size={20} />} label="Edit" />
          <ToolButton icon={<ImageIcon size={20} />} label="Stock" />
          <ToolButton icon={<Mic size={20} />} label="Audio" />
        </nav>
        <div className="mt-auto flex flex-col gap-4">
          <ToolButton icon={<Settings size={20} />} label="Settings" />
        </div>
      </div>

      {/* CENTER: Player & Editor */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">Project_001.mp4</span>
            <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">1080p</span>
          </div>
          <button className="flex items-center gap-2 bg-white text-black px-4 py-1.5 rounded-full text-sm font-medium hover:bg-gray-200 transition">
            <Download size={16} /> Export
          </button>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative">

          {/* Video Player Container */}
          <div className="flex-1 bg-black relative flex items-center justify-center p-8 pattern-grid">
             {/* Simulated Player */}
            <div className="aspect-video w-full max-w-4xl bg-zinc-900 rounded-lg shadow-2xl border border-zinc-800 relative group overflow-hidden">
              {selectedScene ? (
                 <div className="absolute inset-0 flex items-center justify-center flex-col">
                   <img src={selectedScene.thumbnail} alt="frame" className="w-full h-full object-cover opacity-50" />
                   <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                     <div className="text-center">
                        <h3 className="text-xl text-white font-medium mb-2">Editing Scene: {selectedScene.label}</h3>
                        <p className="text-zinc-400 text-sm">Apply AI edits to this specific segment</p>
                     </div>
                   </div>
                 </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                  <Play size={48} fill="currentColor" />
                </div>
              )}

              {/* Player Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent flex items-end px-4 pb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-full flex items-center gap-4 text-white">
                  <SkipBack size={20} className="cursor-pointer hover:text-blue-400"/>
                  <button onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? <Pause size={24} /> : <Play size={24} fill="currentColor"/>}
                  </button>
                  <SkipForward size={20} className="cursor-pointer hover:text-blue-400"/>
                  <div className="flex-1 h-1 bg-zinc-600 rounded-full overflow-hidden mx-4">
                    <div className="w-1/3 h-full bg-blue-500"></div>
                  </div>
                  <span className="text-xs font-mono">00:04 / 00:17</span>
                </div>
              </div>
            </div>
          </div>

          {/* Editor/Timeline Area */}
          <div className="h-1/3 border-t border-zinc-800 bg-zinc-950 flex flex-col">

            {/* Toolbar for Editor */}
            <div className="h-10 border-b border-zinc-800 flex items-center px-4 gap-4">
              <div className="flex bg-zinc-900 rounded-md p-0.5 border border-zinc-800">
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`p-1.5 rounded ${viewMode === 'timeline' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
                >
                  <ListVideo size={16} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
              <div className="h-4 w-[1px] bg-zinc-800"></div>
              <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                {viewMode === 'grid' ? 'AI Scene Decomposition' : 'Timeline'}
              </span>
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-y-auto p-4">
              {viewMode === 'grid' ? (
                /* FRAME GRID MODE (The "Break into pics" feature) */
                <div className="grid grid-cols-5 gap-3">
                  {MOCK_SCENES.map((scene) => (
                    <div
                      key={scene.id}
                      onClick={() => handleSceneClick(scene)}
                      className={`group relative aspect-video bg-zinc-900 rounded-lg overflow-hidden border-2 cursor-pointer transition-all hover:scale-105 ${selectedScene?.id === scene.id ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-zinc-800 hover:border-zinc-600'}`}
                    >
                      <img src={scene.thumbnail} alt={scene.label} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 flex justify-between items-center backdrop-blur-sm">
                        <span className="text-[10px] font-medium text-white truncate">{scene.label}</span>
                        <span className="text-[9px] font-mono text-zinc-400">{scene.duration}</span>
                      </div>

                      {/* Hover Edit Button */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <button className="bg-blue-600 text-white p-1.5 rounded-md shadow-lg transform translate-y-2 group-hover:translate-y-0 transition">
                          <Wand2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add New / Ghost Frame */}
                  <div className="aspect-video border border-dashed border-zinc-800 rounded-lg flex items-center justify-center text-zinc-600 hover:bg-zinc-900/50 cursor-pointer hover:border-zinc-600 transition">
                    <span className="text-xs flex flex-col items-center gap-2">
                      <MoreHorizontal size={16} />
                      Analyze More
                    </span>
                  </div>
                </div>
              ) : (
                /* STANDARD TIMELINE MODE */
                <div className="relative h-full flex flex-col justify-center">
                   {/* Timestamps */}
                   <div className="flex justify-between text-[10px] font-mono text-zinc-600 mb-2 px-1">
                      <span>00:00</span><span>00:05</span><span>00:10</span><span>00:15</span><span>00:20</span>
                   </div>
                   {/* Tracks */}
                   <div className="space-y-2">
                      {/* Video Track */}
                      <div className="h-12 bg-zinc-900 rounded border border-zinc-800 relative overflow-hidden flex">
                         {MOCK_SCENES.map((scene, i) => (
                            <div key={i} className="h-full border-r border-zinc-950 bg-zinc-800 relative group" style={{width: `${parseInt(scene.duration) * 5}%`}}>
                               <img src={scene.thumbnail} className="w-full h-full object-cover opacity-40" alt={scene.label} />
                               <span className="absolute left-1 top-1 text-[9px] text-white truncate px-1 bg-black/50 rounded">{scene.label}</span>
                            </div>
                         ))}
                      </div>
                      {/* Audio Track */}
                      <div className="h-8 bg-zinc-900/50 rounded border border-zinc-800 relative flex items-center px-2">
                         <div className="w-full h-4" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%233f3f46\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 20h4v-4H0v4zm8 8h4v-20H8v20zm8-12h4v4h-4v-4zm8 8h4v-12h-4v12zm8-16h4v20h-4V8z\'/%3E%3C/g%3E%3C/svg%3E")'}}></div>
                      </div>
                   </div>

                   {/* Playhead */}
                   <div className="absolute top-0 bottom-0 left-1/4 w-0.5 bg-blue-500 z-10 shadow-[0_0_10px_rgba(59,130,246,0.8)]">
                      <div className="absolute -top-3 -left-1.5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-blue-500"></div>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: AI Chat (The "Cursor" part) */}
      <div className="w-80 border-l border-zinc-800 bg-zinc-950 flex flex-col">

        {/* Chat Header */}
        <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/20">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
            <Sparkles size={16} className="text-blue-500" />
            AI Copilot
          </div>
          <button className="text-zinc-500 hover:text-white">
             <MoreHorizontal size={16} />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {MOCK_CHAT.map((msg, idx) => (
             <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'ai' ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-zinc-300'}`}>
                   {msg.role === 'ai' ? <Sparkles size={12} /> : <span className="text-[10px]">You</span>}
                </div>
                <div className={`text-sm p-3 rounded-lg max-w-[85%] ${msg.role === 'ai' ? 'bg-zinc-900 border border-zinc-800 text-zinc-300' : 'bg-blue-600/10 border border-blue-500/20 text-blue-100'}`}>
                   {msg.text}
                </div>
             </div>
          ))}

          {/* Context Indicator */}
          {selectedScene && (
             <div className="mx-4 mt-4 p-2 bg-zinc-900 border border-blue-500/30 rounded text-xs flex items-center gap-2 text-zinc-400">
                <img src={selectedScene.thumbnail} className="w-8 h-8 rounded object-cover opacity-70" alt={selectedScene.label} />
                <span>Context: <strong>{selectedScene.label}</strong> ({selectedScene.time})</span>
             </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-zinc-800">
          <div className="relative">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask to edit, cut, or enhance..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-3 pr-10 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none h-24 placeholder:text-zinc-600 text-white"
            />
            <button className="absolute bottom-3 right-3 p-1.5 bg-blue-600 hover:bg-blue-500 rounded text-white transition">
              <Send size={14} />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2">
             <span className="text-[10px] text-zinc-500 flex items-center gap-1">
               <span className="w-3 h-3 border border-zinc-600 rounded flex items-center justify-center">⌘</span>
               <span>+</span>
               <span className="w-3 h-3 border border-zinc-600 rounded flex items-center justify-center">K</span>
               <span>to generate edits</span>
             </span>
          </div>
        </div>

      </div>
    </div>
  );
}

// Helper Component for Sidebar Tools
function ToolButton({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button className={`flex flex-col items-center gap-1 group relative ${active ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}>
       <div className={`p-2 rounded-lg transition-all ${active ? 'bg-blue-500/10' : 'hover:bg-zinc-800'}`}>
         {icon}
       </div>
       <span className="text-[10px] font-medium">{label}</span>
       {active && <div className="absolute right-0 top-2 bottom-2 w-0.5 bg-blue-500 rounded-l"></div>}
    </button>
  );
}
