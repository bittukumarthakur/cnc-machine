
import React from 'react';
import { Bed, Image, Palette, MessageSquare, Home as HomeIcon } from 'lucide-react';
import { AppView } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  const navItems = [
    { name: 'Home' as AppView, icon: HomeIcon },
    { name: 'Gallery' as AppView, icon: Image },
    { name: 'Studio' as AppView, icon: Palette },
    { name: 'LiveConsult' as AppView, icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navbar */}
      <nav className="bg-stone-900 text-stone-100 p-4 sticky top-0 z-50 shadow-xl border-b border-amber-900/30">
        <div className="container mx-auto flex justify-between items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => onNavigate('Home')}
          >
            <div className="bg-amber-700 p-1.5 rounded shadow-inner">
              <Bed size={24} className="text-stone-900" />
            </div>
            <span className="text-xl font-bold tracking-tight serif italic">ARTESIAN SLEEP</span>
          </div>
          
          <div className="hidden md:flex gap-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => onNavigate(item.name)}
                className={`text-sm font-medium transition-colors hover:text-amber-500 flex items-center gap-1.5 ${
                  currentView === item.name ? 'text-amber-500' : 'text-stone-300'
                }`}
              >
                <item.icon size={16} />
                {item.name === 'LiveConsult' ? 'Master Carver' : item.name}
              </button>
            ))}
          </div>

          <button 
            onClick={() => onNavigate('Studio')}
            className="bg-amber-700 hover:bg-amber-600 text-stone-100 px-5 py-2 rounded shadow-lg text-xs font-bold transition-transform active:scale-95 border border-amber-500/20 uppercase tracking-wider"
          >
            Design Relief
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-stone-950 text-stone-500 py-12 border-t border-stone-800">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h4 className="text-stone-100 font-bold mb-4 serif italic tracking-wide">ARTESIAN SLEEP</h4>
            <p className="text-sm leading-relaxed">
              Precision-carved heirloom beds. We merge classical furniture design with modern CNC relief technology to create the centerpieces of your home.
            </p>
          </div>
          <div>
            <h4 className="text-stone-100 font-bold mb-4">Design Resources</h4>
            <ul className="text-sm space-y-2">
              <li className="hover:text-amber-500 cursor-pointer" onClick={() => onNavigate('Gallery')}>Heirloom Gallery</li>
              <li className="hover:text-amber-500 cursor-pointer" onClick={() => onNavigate('Studio')}>Relief Generator</li>
              <li className="hover:text-amber-500 cursor-pointer" onClick={() => onNavigate('LiveConsult')}>Technical Consult</li>
            </ul>
          </div>
          <div>
            <h4 className="text-stone-100 font-bold mb-4">The Studio</h4>
            <p className="text-sm">Highlands Woodworking District</p>
            <p className="text-sm">contact@artesiansleep.com</p>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-8 pt-8 border-t border-stone-900 text-center text-xs">
          © 2024 Artesian Sleep Bespoke Beds. Milling-ready relief generation for the modern craftsman.
        </div>
      </footer>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-stone-900 border-t border-stone-800 flex justify-around p-3 z-50">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => onNavigate(item.name)}
            className={`flex flex-col items-center gap-1 ${
              currentView === item.name ? 'text-amber-500' : 'text-stone-400'
            }`}
          >
            <item.icon size={20} />
            <span className="text-[10px]">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
