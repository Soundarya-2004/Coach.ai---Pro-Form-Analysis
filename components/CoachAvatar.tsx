import React, { useState, useEffect } from 'react';
import { Bot, RefreshCw, MessageSquare } from 'lucide-react';

const QUOTES = [
  "Consistency is the bridge between goals and accomplishment.",
  "Don't count the reps, make the reps count.",
  "Your only competition is who you were yesterday.",
  "Focus on your form, the speed will follow.",
  "Rest days are when your muscles grow. Respect them.",
  "Small progress is still progress.",
  "Discipline is doing what needs to be done.",
  "Sweat is just fat crying.",
  "The body achieves what the mind believes.",
  "Every workout is a deposit in the bank of health."
];

export const CoachAvatar: React.FC = () => {
  const [message, setMessage] = useState("");
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    setMessage(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, []);

  const refreshMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFading(true);
    setTimeout(() => {
      let newMsg = message;
      while (newMsg === message) {
        newMsg = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      }
      setMessage(newMsg);
      setIsFading(false);
    }, 200);
  };

  return (
    <div className="relative group bg-black dark:bg-white text-white dark:text-black p-5 rounded-xl border-2 border-black dark:border-white neo-shadow hover:translate-y-1 transition-all cursor-default">
      {/* Decorative circuitry lines */}
      <div className="absolute top-0 right-0 p-2 opacity-20">
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-white dark:bg-black rounded-full"></div>
          <div className="w-1 h-1 bg-white dark:bg-black rounded-full"></div>
          <div className="w-1 h-1 bg-white dark:bg-black rounded-full"></div>
        </div>
      </div>

      <div className="flex items-start gap-4">
        {/* Avatar Face */}
        <div className="shrink-0 relative">
           <div className="w-12 h-12 bg-white dark:bg-black border-2 border-white dark:border-black rounded-lg flex items-center justify-center overflow-hidden relative">
              <Bot className="w-8 h-8 text-black dark:text-white z-10" />
              {/* Scanline effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 dark:via-white/10 to-transparent animate-scan pointer-events-none"></div>
           </div>
           {/* Online indicator */}
           <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white dark:bg-black border-2 border-black dark:border-white rounded-full animate-pulse"></div>
        </div>

        {/* Message Bubble */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">AI COACH</span>
            <button 
              onClick={refreshMessage}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 dark:hover:bg-black/10 rounded"
              title="New tip"
            >
              <RefreshCw className="w-3 h-3 text-gray-400 dark:text-gray-600" />
            </button>
          </div>
          
          <div className={`transition-opacity duration-200 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
            <p className="font-mono text-sm leading-snug">
              <span className="text-gray-500 dark:text-gray-400 mr-2 text-lg">›</span>
              {message}
              <span className="animate-pulse ml-1">_</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};