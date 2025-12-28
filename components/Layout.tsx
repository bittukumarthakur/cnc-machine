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
    <div className="min-h-screen flex flex-col w-full bg-stone-950">
      {/* Top Navbar */}
      <nav className="bg-stone-950/80 backdrop-blur-xl text-stone-100 p-5 sticky top-0 z-50 border-b border-stone-800/50">
        <div className="container mx-auto flex justify-between items-center">
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => onNavigate('Home')}
          >
            <div className="bg-amber-600 p-2 rounded shadow-lg group-hover:rotate-6 transition-transform">
              <Bed size={24} className="text-stone-900" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight serif italic leading-none">ARTESIAN SLEEP</span>
              <span className="text-[8px] tracking-[0.4em] uppercase font-bold text-amber-500 mt-1">Bespoke CNC Studio</span>
            </div>
          </div>
          
          <div className="hidden lg:flex gap-10">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => onNavigate(item.name)}
                className={`text-[11px] uppercase tracking-[0.2em] font-bold transition-all hover:text-amber-500 flex items-center gap-2 ${
                  currentView === item.name ? 'text-amber-500' : 'text-stone-400'
                }`}
              >
                {item.name === 'LiveConsult' ? 'Expert Consult' : item.name}
              </button>
            ))}
          </div>

          <button 
            onClick={() => onNavigate('Studio')}
            className="hidden md:block bg-amber-600 hover:bg-amber-500 text-stone-950 px-6 py-2.5 rounded text-[10px] font-black transition-all transform hover:-translate-y-0.5 active:scale-95 shadow-lg uppercase tracking-widest"
          >
            Design Relief
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-stone-950 text-stone-500 py-20 border-t border-stone-900">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-stone-100 font-bold mb-6 serif italic tracking-widest text-2xl uppercase">ARTESIAN SLEEP</h4>
            <p className="text-sm leading-relaxed max-w-sm text-stone-400">
              Precision-carved heirloom beds for the discerning home. We merge classical furniture artistry with cutting-edge synthesis technology to create the centerpieces of your living space.
            </p>
          </div>
          <div>
            <h4 className="text-stone-100 font-bold mb-6 text-xs uppercase tracking-widest">Explore</h4>
            <ul className="text-xs space-y-4 font-bold">
              <li className="hover:text-amber-500 transition-colors cursor-pointer" onClick={() => onNavigate('Gallery')}>Master Collection</li>
              <li className="hover:text-amber-500 transition-colors cursor-pointer" onClick={() => onNavigate('Studio')}>Relief Lab</li>
              <li className="hover:text-amber-500 transition-colors cursor-pointer" onClick={() => onNavigate('LiveConsult')}>Master Carver AI</li>
            </ul>
          </div>
          <div>
            <h4 className="text-stone-100 font-bold mb-6 text-xs uppercase tracking-widest">Contact</h4>
            <p className="text-xs mb-2">Woodworking District, Highlands</p>
            <p className="text-xs font-bold text-amber-600">contact@artesiansleep.com</p>
          </div>
        </div>
        <div className="container mx-auto px-6 mt-16 pt-8 border-t border-stone-900 flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
          <p>© 2024 Artesian Sleep Bespoke Beds</p>
          <div className="flex gap-6">
            <span className="hover:text-stone-300 cursor-pointer">Terms</span>
            <span className="hover:text-stone-300 cursor-pointer">Privacy</span>
          </div>
        </div>
      </footer>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-stone-950 border-t border-stone-900 flex justify-around p-4 z-50 backdrop-blur-xl">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => onNavigate(item.name)}
            className={`flex flex-col items-center gap-1.5 transition-colors ${
              currentView === item.name ? 'text-amber-500' : 'text-stone-600'
            }`}
          >
            <item.icon size={20} strokeWidth={1.5} />
            <span className="text-[9px] uppercase font-bold tracking-tighter">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};