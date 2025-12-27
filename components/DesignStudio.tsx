
import React, { useState, useRef } from 'react';
import { Palette, Download, Loader2, Sparkles, AlertCircle, Info, Drill, Box, Layers } from 'lucide-react';
import { generateDesignConcept, getDesignAdvice } from '../services/gemini';
import { DesignConcept } from '../types';

export const DesignStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [concept, setConcept] = useState<DesignConcept | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setConcept(null);
    setAdvice(null);

    try {
      const [imageUrl, adviceText] = await Promise.all([
        generateDesignConcept(prompt),
        getDesignAdvice(prompt)
      ]);

      if (imageUrl) {
        setConcept({
          id: Date.now().toString(),
          prompt,
          imageUrl,
          timestamp: Date.now()
        });
      }
      setAdvice(adviceText);
    } catch (err) {
      console.error("Studio Generation Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadPNG = () => {
    if (!concept) return;
    const link = document.createElement('a');
    link.href = concept.imageUrl;
    link.download = `cnc-bed-relief-${Date.now()}.png`;
    link.click();
  };

  /**
   * Generates a binary STL file from the grayscale heightmap
   */
  const exportSTL = async () => {
    if (!concept || exporting) return;
    setExporting(true);

    try {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = concept.imageUrl;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      const width = 128; // Optimized resolution for fast client-side mesh generation
      const height = 128;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height).data;

      // Binary STL creation
      const triangleCount = (width - 1) * (height - 1) * 2;
      const bufferSize = 84 + triangleCount * 50;
      const buffer = new ArrayBuffer(bufferSize);
      const view = new DataView(buffer);

      // Header (80 bytes)
      const header = "Artesian Sleep CNC Generated Relief Mesh";
      for (let i = 0; i < header.length; i++) view.setUint8(i, header.charCodeAt(i));
      
      // Triangle Count (4 bytes)
      view.setUint32(80, triangleCount, true);

      let offset = 84;
      const depthScale = 25; // Default max depth 25mm for bed reliefs

      for (let y = 0; y < height - 1; y++) {
        for (let x = 0; x < width - 1; x++) {
          const getZ = (px: number, py: number) => {
            const idx = (py * width + px) * 4;
            // Grayscale value (Red channel) scaled to depth
            return (imageData[idx] / 255) * depthScale;
          };

          // Define grid points
          const z00 = getZ(x, y);
          const z10 = getZ(x + 1, y);
          const z01 = getZ(x, y + 1);
          const z11 = getZ(x + 1, y + 1);

          const p00 = [x, y, z00];
          const p10 = [x + 1, y, z10];
          const p01 = [x, y + 1, z01];
          const p11 = [x + 1, y + 1, z11];

          // Triangle 1
          addTriangle(view, offset, p00, p10, p01);
          offset += 50;
          // Triangle 2
          addTriangle(view, offset, p10, p11, p01);
          offset += 50;
        }
      }

      const blob = new Blob([buffer], { type: 'application/sla' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bed-headboard-relief-${Date.now()}.stl`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("STL Export Failed:", err);
    } finally {
      setExporting(false);
    }
  };

  const addTriangle = (view: DataView, offset: number, p1: number[], p2: number[], p3: number[]) => {
    // Face Normal (0,0,0 as standard software recalculates normals)
    view.setFloat32(offset, 0, true);
    view.setFloat32(offset + 4, 0, true);
    view.setFloat32(offset + 8, 0, true);
    // Vertices
    let sub = offset + 12;
    [p1, p2, p3].forEach(p => {
      view.setFloat32(sub, p[0], true);
      view.setFloat32(sub + 4, p[1], true);
      view.setFloat32(sub + 8, p[2], true);
      sub += 12;
    });
    // Attribute byte count
    view.setUint16(sub, 0, true);
  };

  return (
    <div className="min-h-screen bg-stone-100 py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className="text-4xl font-bold text-stone-900 serif italic mb-4">Relief Design Studio</h1>
            <p className="text-stone-600 max-w-2xl mx-auto">
                Transform bed design concepts into production-ready 3D relief files.
                Generate high-contrast depth maps or direct 3D STL meshes for your CNC router.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Controls Side */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-stone-200 sticky top-24">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-amber-700 p-2 rounded shadow-md">
                  <Drill className="text-white" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-stone-800">Milling Parameters</h2>
              </div>

              <form onSubmit={handleGenerate} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <Palette size={16} />
                    Pattern Description
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. Victorian floral headboard with central sunburst and symmetrical deep-carved leaves..."
                    className="w-full h-44 p-4 rounded-lg border-2 border-stone-100 focus:border-amber-600 outline-none transition-all resize-none text-stone-800 font-medium placeholder:text-stone-300"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-amber-500 font-bold py-5 rounded-lg flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" />
                      CALCULATING DEPTH...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      GENERATE CNC RELIEF
                    </>
                  )}
                </button>
              </form>

              {advice && !loading && (
                <div className="mt-8 p-5 bg-stone-50 border-l-4 border-amber-600 rounded-r-lg">
                  <div className="flex items-center gap-2 text-amber-800 font-bold mb-2 text-xs uppercase tracking-widest">
                    <Info size={14} />
                    Technical Advice
                  </div>
                  <div className="text-sm text-stone-700 space-y-2 whitespace-pre-line leading-relaxed">
                    {advice}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Visualization Side */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-stone-300 rounded-xl aspect-square w-full flex items-center justify-center overflow-hidden border-8 border-white shadow-2xl relative group">
              {concept ? (
                <>
                  <img src={concept.imageUrl} alt="CNC Relief Heightmap" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/5 mix-blend-overlay"></div>
                  <div className="absolute top-4 right-4 bg-stone-900/80 text-amber-500 px-4 py-2 rounded-full text-[10px] font-bold backdrop-blur-md uppercase tracking-wider flex items-center gap-2 border border-white/10">
                    <Box size={14} />
                    Heightmap (Top-Down)
                  </div>
                </>
              ) : (
                <div className="text-center px-12 py-20">
                  <div className="w-24 h-24 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-400 border-4 border-dashed border-stone-300">
                    <Layers size={48} className="animate-pulse" />
                  </div>
                  <h3 className="text-stone-600 font-bold text-xl mb-2">Ready for Processing</h3>
                  <p className="text-stone-500 text-sm">Enter a design prompt to generate a milling-ready depth map.</p>
                </div>
              )}
              {loading && (
                <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-20">
                  <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-white font-bold tracking-[0.2em] text-xs">SYNTHESIZING GEOMETRY...</span>
                </div>
              )}
            </div>
            
            {concept && !loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <button 
                  onClick={downloadPNG}
                  className="bg-stone-900 hover:bg-stone-800 text-stone-100 py-5 rounded-lg font-bold transition-all shadow-lg flex items-center justify-center gap-3 active:scale-95 border border-white/5"
                >
                  <Download size={22} className="text-amber-500" />
                  DEPTH MAP (PNG)
                </button>
                <button 
                  onClick={exportSTL}
                  disabled={exporting}
                  className="bg-amber-700 hover:bg-amber-600 text-stone-100 py-5 rounded-lg font-bold transition-all shadow-lg flex items-center justify-center gap-3 active:scale-95 disabled:bg-stone-400"
                >
                  {exporting ? (
                    <>
                        <Loader2 className="animate-spin" size={22} />
                        MESHING STL...
                    </>
                  ) : (
                    <>
                        <Box size={22} />
                        3D RELIEF (STL)
                    </>
                  )}
                </button>
              </div>
            )}

            {concept && !loading && (
               <div className="bg-amber-50 p-4 rounded-lg flex items-start gap-4 border border-amber-100">
                  <AlertCircle className="text-amber-700 shrink-0 mt-0.5" size={20} />
                  <p className="text-xs text-amber-900 leading-relaxed">
                    <strong>Milling Tip:</strong> STL files are best for roughing paths and 3D toolpaths. For higher surface quality (0.01mm resolution), import the Depth Map PNG into your CAM software as a heightfield component.
                  </p>
               </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
