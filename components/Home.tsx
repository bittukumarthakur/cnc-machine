import React from 'react';
import { ArrowRight, Bed, Drill, Layers, ChevronDown } from 'lucide-react';
import { AppView } from '../types';

interface HomeProps {
  onNavigate: (view: AppView) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const scrollToDiscover = () => {
    const element = document.getElementById('discover-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-stone-50 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[100vh] w-full flex items-center overflow-hidden bg-stone-200">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=2400" 
            alt="Bright luxury wood interior" 
            className="w-full h-full object-cover object-center scale-105"
          />
          <div className="absolute inset-0 hero-gradient-light"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-[2px] w-12 bg-amber-700"></span>
              <span className="text-amber-800 font-bold tracking-[0.4em] uppercase text-[10px] md:text-xs">
                Est. 1984 &bull; Artisan Woodcraft
              </span>
            </div>
            
            <h1 className="text-6xl md:text-9xl text-stone-950 font-black leading-[0.9] mb-8 tracking-tighter drop-shadow-sm">
              The Art of <br/>
              <span className="italic serif text-amber-700">Deep Relief</span>
            </h1>
            
            <p className="text-stone-950 text-lg md:text-2xl mb-12 leading-relaxed font-bold max-w-2xl border-l-4 border-amber-600 pl-6 bg-white/10 backdrop-blur-[2px] py-2">
              Precision CNC design for high-end furniture. We synthesize intricate depth maps and geometry ready for the world's finest milling machines.
            </p>
            
            <div className="flex flex-wrap gap-6">
              <button 
                onClick={() => onNavigate('Studio')}
                className="bg-stone-900 hover:bg-black text-amber-500 px-10 py-5 rounded shadow-[0_20px_40px_rgba(0,0,0,0.15)] font-bold flex items-center justify-center gap-3 group transition-all transform hover:-translate-y-1"
              >
                OPEN RELIEF STUDIO
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>
              <button 
                onClick={() => onNavigate('Gallery')}
                className="bg-white border-2 border-stone-200 hover:border-amber-600 hover:bg-stone-50 text-stone-900 px-10 py-5 rounded font-bold transition-all shadow-sm"
              >
                THE MASTER COLLECTION
              </button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button 
          onClick={scrollToDiscover}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-stone-600 animate-bounce cursor-pointer flex flex-col items-center gap-2 hover:text-amber-700 transition-colors z-20 outline-none"
          aria-label="Scroll to content"
        >
            <span className="text-[10px] uppercase tracking-widest font-bold drop-shadow-md">Explore Craftsmanship</span>
            <ChevronDown size={20} className="drop-shadow-md" />
        </button>
      </section>

      {/* Value Proposition */}
      <section id="discover-section" className="py-32 bg-white text-stone-900 overflow-hidden relative border-y border-stone-100">
        <div className="absolute top-0 right-0 w-1/4 h-full bg-amber-50/50 blur-3xl rounded-full translate-x-1/2"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
            {[
              { 
                icon: Layers, 
                title: 'High-Fidelity Maps', 
                desc: 'Clean grayscale vector patterns optimized for specialized CNC software. Precision at every bit depth.' 
              },
              { 
                icon: Bed, 
                title: 'Furniture Heritage', 
                desc: 'Every design respects structural joinery and organic grain patterns for a lifelong finish.' 
              },
              { 
                icon: Drill, 
                title: 'Milling Protocol', 
                desc: 'Calculated toolpaths and STL meshes that account for material hardness and tool geometry.' 
              }
            ].map((feature, i) => (
              <div key={i} className="group cursor-default">
                <div className="w-16 h-16 bg-stone-50 border border-stone-100 flex items-center justify-center mb-8 rounded-2xl group-hover:border-amber-600 transition-all duration-500 shadow-sm text-amber-700">
                  <feature.icon className="group-hover:scale-110 transition-transform duration-500" size={32} strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-bold serif italic text-stone-900 mb-4">{feature.title}</h3>
                <p className="text-stone-700 leading-relaxed font-medium text-sm">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-32 bg-stone-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-24">
            <div className="flex-1 relative">
              <div className="absolute -inset-4 border border-amber-200 rounded-lg -z-10 translate-x-8 translate-y-8"></div>
              <div className="overflow-hidden rounded-lg shadow-2xl aspect-[4/3]">
                <img 
                  src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1200" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" 
                  alt="Detailed relief carving" 
                />
              </div>
              
              <div className="absolute -bottom-8 -right-8 bg-stone-900 text-amber-500 p-8 rounded-xl shadow-[0_25px_50px_rgba(0,0,0,0.3)] hidden md:block border border-stone-800">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <p className="text-[10px] uppercase tracking-[0.3em] font-black opacity-70">Quality Analysis</p>
                  </div>
                  <p className="text-2xl serif italic font-bold text-amber-500">"Texture is flawless"</p>
              </div>
            </div>
            
            <div className="flex-1 space-y-10">
              <div className="space-y-4">
                <span className="inline-block bg-amber-100 text-amber-900 px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">Legacy Collection</span>
                <h2 className="text-5xl md:text-7xl font-bold text-stone-900 serif leading-tight">
                  Crafting Legacies <br/>
                  <span className="text-amber-700 italic font-medium">in Fine Hardwood.</span>
                </h2>
              </div>
              
              <p className="text-stone-800 text-xl font-medium leading-relaxed max-w-xl">
                We believe a bed is more than furniture; it is the cornerstone of your home. We specialize in intricate oak reliefs, deep walnut textures, and bespoke mahogany frames.
              </p>
              
              <div className="grid grid-cols-2 gap-12 pt-4">
                 <div className="border-l-4 border-amber-600 pl-6">
                    <span className="block text-4xl font-black text-stone-900 tracking-tighter">150+</span>
                    <span className="text-xs text-stone-600 uppercase font-bold tracking-widest">Master Designs</span>
                 </div>
                 <div className="border-l-4 border-stone-300 pl-6">
                    <span className="block text-4xl font-black text-stone-900 tracking-tighter">0.02mm</span>
                    <span className="text-xs text-stone-600 uppercase font-bold tracking-widest">Milling Delta</span>
                 </div>
              </div>
              
              <div className="pt-8">
                <button 
                  onClick={() => onNavigate('Gallery')}
                  className="inline-flex items-center gap-3 text-stone-900 font-bold border-b-2 border-amber-700 pb-2 hover:gap-6 transition-all duration-300"
                >
                  BROWSE THE CATALOGUE <ArrowRight size={20} className="text-amber-700" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
