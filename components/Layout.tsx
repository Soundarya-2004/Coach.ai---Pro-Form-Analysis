import React from 'react';
import { LogOut, Moon, Sun } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  userImage?: string;
  onLogout: () => void;
  darkMode: boolean;
  toggleTheme: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, userImage, onLogout, darkMode, toggleTheme }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans transition-colors duration-300">
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b-2 border-black dark:border-white transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black rounded-lg flex items-center justify-center font-black neo-shadow-sm transition-colors duration-300">
              C
            </div>
            <span className="font-black text-xl tracking-tight">Coach.ai</span>
          </div>
          
          <div className="flex items-center gap-4">
             <button 
               onClick={toggleTheme}
               className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
               aria-label="Toggle Theme"
             >
               {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>
             {userImage && <img src={userImage} alt="User" className="w-8 h-8 rounded-full border-2 border-black dark:border-white" />}
             <button onClick={onLogout} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors">
               <LogOut className="w-5 h-5" />
             </button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};