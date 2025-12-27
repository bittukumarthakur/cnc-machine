
import React from 'react';
import { ArrowRight, Bed, Drill, Layers } from 'lucide-react';
import { AppView } from '../types';

interface HomeProps {
  onNavigate: (view: AppView) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1505693419148-ad3097f98751?auto=format&fit=crop&q=80&w=1920" 
            alt="Hand-carved wooden bed" 
            className="w-full h-full object-cover brightness-[0.3]"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <span className="text-amber-500 font-bold tracking-[0.3em] uppercase text-xs mb-4 block">Bespoke Furniture Engineering</span>
            <h1 className="text-5xl md:text-8xl text-stone-100 font-bold leading-none mb-6">
              The Art of <span className="italic serif text-amber-600 block">Deep Relief</span>
            </h1>
            <p className="text-stone-300 text-lg md:text-2xl mb-10 leading-relaxed font-light max-w-xl">
              Specialized CNC design for luxury beds. We generate high-fidelity depth maps and relief patterns ready for your milling workflow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => onNavigate('Studio')}
                className="bg-amber-700 hover:bg-amber-600 text-stone-100 px-8 py-5 rounded shadow-2xl font-bold flex items-center justify-center gap-2 group transition-all"
              >
                Open Relief Studio
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>
              <button 
                onClick={() => onNavigate('Gallery')}
                className="bg-stone-800/50 backdrop-blur-sm border border-stone-600 hover:border-amber-500 text-stone-100 px-8 py-5 rounded font-bold transition-all"
              >
                The Master Collection
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-24 bg-[#1a1815] text-stone-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-4">
              <div className="text-amber-600 mb-6">
                <Layers size={48} strokeWidth={1} />
              </div>
              <h3 className="text-2xl font-bold serif italic text-stone-100">Precision Relief Maps</h3>
              <p className="text-stone-400 leading-relaxed font-light">
                Our AI studio generates high-contrast depth maps optimized for ArtCAM, Aspire, and other CNC software to ensure clean toolpaths.
              </p>
            </div>
            <div className="space-y-4">
              <div className="text-amber-600 mb-6">
                <Bed size={48} strokeWidth={1} />
              </div>
              <h3 className="text-2xl font-bold serif italic text-stone-100">Optimized for Furniture</h3>
              <p className="text-stone-400 leading-relaxed font-light">
                Every pattern is curated for bed headboards, side rails, and footboards, respecting structural integrity and wood grain aesthetics.
              </p>
            </div>
            <div className="space-y-4">
              <div className="text-amber-600 mb-6">
                <Drill size={48} strokeWidth={1} />
              </div>
              <h3 className="text-2xl font-bold serif italic text-stone-100">Milling-Ready Workflows</h3>
              <p className="text-stone-400 leading-relaxed font-light">
                Go from imagination to roughing pass in minutes. Our system identifies complex undercuts to prevent tool breakage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Bed Show */}
      <section className="py-20 bg-stone-50">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <img 
              src="https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1200" 
              className="rounded-lg shadow-2xl border-8 border-white" 
              alt="Carved Headboard" 
            />
          </div>
          <div className="flex-1 space-y-6">
            <h2 className="text-4xl font-bold text-stone-900 serif">Crafting Heirlooms <br/><span className="text-amber-700 italic">One Frame at a Time.</span></h2>
            <p className="text-stone-600 text-lg">
              We specialize in the hard stuff—massive oak headboards with intricate floral patterns, walnut footboards with geometric depth, and custom mahogany frames that tell a story.
            </p>
            <div className="flex gap-4">
               <div className="bg-amber-100 p-4 rounded-lg flex-1 border border-amber-200">
                  <span className="block text-2xl font-bold text-amber-900">150+</span>
                  <span className="text-sm text-amber-700 uppercase tracking-tighter">Patterns Generated</span>
               </div>
               <div className="bg-stone-100 p-4 rounded-lg flex-1 border border-stone-200">
                  <span className="block text-2xl font-bold text-stone-900">0.02mm</span>
                  <span className="text-sm text-stone-500 uppercase tracking-tighter">Precision Goal</span>
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
