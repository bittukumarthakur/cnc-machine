
import React, { useState } from 'react';

const CATEGORIES = ['All', 'Headboards', 'Footboards', 'Side Rails', 'Custom'];

const ITEMS = [
  { id: '1', title: 'The Royal Oak Relief', category: 'Headboards', image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=800' },
  { id: '2', title: 'Geometric Minimalist', category: 'Footboards', image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=800' },
  { id: '3', title: 'Mahogany Vine Pattern', category: 'Headboards', image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&q=80&w=800' },
  { id: '4', title: 'Art Deco Frame Set', category: 'Side Rails', image: 'https://images.unsplash.com/photo-1615529328331-f8917597711f?auto=format&fit=crop&q=80&w=800' },
  { id: '5', title: 'Custom Family Crest', category: 'Custom', image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&q=80&w=800' },
  { id: '6', title: 'Modern Slat Deep-Carve', category: 'Headboards', image: 'https://images.unsplash.com/photo-1616594197247-b69566203851?auto=format&fit=crop&q=80&w=800' },
];

export const Gallery: React.FC = () => {
  const [filter, setFilter] = useState('All');

  const filteredItems = filter === 'All' 
    ? ITEMS 
    : ITEMS.filter(item => item.category === filter);

  return (
    <div className="bg-stone-100 min-h-screen py-16 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-stone-900 mb-4 serif italic tracking-tight">The Master Collection</h1>
          <p className="text-stone-600 max-w-2xl mx-auto text-lg">
            Witness the fusion of digital design and organic wood. These are our proudest CNC milling accomplishments in the world of luxury bedding.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-8 py-3 rounded text-xs font-bold transition-all uppercase tracking-widest ${
                  filter === cat 
                    ? 'bg-amber-700 text-white shadow-lg ring-2 ring-amber-500 ring-offset-2' 
                    : 'bg-white text-stone-600 hover:bg-stone-200 border border-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredItems.map(item => (
            <div key={item.id} className="group relative overflow-hidden rounded-xl bg-white shadow-md border border-stone-200">
              <div className="aspect-[4/5] overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                <span className="text-amber-500 text-xs font-bold tracking-[0.2em] uppercase mb-2">{item.category}</span>
                <h3 className="text-stone-100 text-2xl font-bold serif italic mb-4">{item.title}</h3>
                <div className="w-12 h-0.5 bg-amber-600 group-hover:w-full transition-all duration-500 mb-6"></div>
                <button className="text-white text-sm font-semibold flex items-center gap-2 hover:text-amber-500 transition-colors">
                  View Milling Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
