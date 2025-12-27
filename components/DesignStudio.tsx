
import React, { useState, useRef } from 'react';
import { Palette, Download, Loader2, Sparkles, AlertCircle, Info, Drill, Box } from 'lucide-react';
import { generateDesignConcept, getDesignAdvice } from '../services/gemini';
import { DesignConcept } from '../types';

export const DesignStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [concept, setConcept] = useState<DesignConcept | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadRelief = () => {
    if (!concept) return;
    const link = document.createElement('a');
    link.href = concept.imageUrl;
    link.download = `relief-heightmap-${Date.now()}.png`;
    link.click();
  };

  /**
   * Generates a binary STL file from the heightmap data
   */
  const exportSTL = async () => {
    if (!concept || exporting) return;
    setExporting(true);

    try {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = concept.imageUrl;
      
      await new Promise((resolve) => (img.onload = resolve));

      const canvas = document.createElement('canvas');
      const width = 256; // Reduced resolution for performance and stability
      const height = 256;
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
      const header = "Artesian Sleep CNC Generated Relief";
      for (let i = 0; i < header.length; i++) view.setUint8(i, header.charCodeAt(i));
      
      // Triangle Count (4 bytes)
      view.setUint32(80, triangleCount, true);

      let offset = 84;
      const depthScale = 20; // Max carving depth in mm

      for (let y = 0; y < height - 1; y++) {
        for (let x = 0; x < width - 1; x++) {
          const getZ = (px: number, py: number) => {
            const idx = (py * width + px) * 4;
            // Use luminosity formula or just red channel for grayscale
            return (imageData[idx] / 255) * depthScale;
          };

          const p1 = [x, y, getZ(x, y)];
          const p2 = [x + 1, y, getZ(x + 1, y)];
          const p3 = [x, y + 1, getZ(x, y + 1)];
          const p4 = [x + 1, y + 1, getZ(x + 1, y + 1)];

          // Triangle 1
          addTriangle(view, offset, p1, p2, p3);
          offset += 50;
          // Triangle 2
          addTriangle(view, offset, p2, p4, p3);
          offset += 50;
        }
      }

      const blob = new Blob([buffer], { type: 'application/sla' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `3d-relief-model-${Date.now()}.stl`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("STL Generation Failed:", err);
    } finally {
      setExporting(false);
    }
  };

  const addTriangle = (view: DataView, offset: number, p1: number[], p2: number[], p3: number[]) => {
    // Normal (zeros)
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
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-stone-900 serif italic mb-4">Relief Pattern Engine v2.0</h1>
            <p className="text-stone-600 max-w-2xl mx-auto">
                Generate high-fidelity depth maps and export direct-to-milling STL files. 
                Optimized for ArtCAM, Aspire, Fusion 360, and high-frequency CNC spindles.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Controls Side */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-stone-200">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-amber-700 p-2 rounded">
                  <Drill className="text-white" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-stone-800">Job Parameters</h2>
              </div>

              <form onSubmit={handleGenerate} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-3 uppercase tracking-wider">Pattern Description</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. Intricate Baroque headboard pattern with blooming peonies and central symmetrical curves..."
                    className="w-full h-44 p-4 rounded-lg border-2 border-stone-100 focus:border-amber-600 outline-none transition-all resize-none text-stone-800 font-medium"
                    required
                  />
                  <div className="mt-2 flex items-start gap-2 text-xs text-stone-500 bg-stone-50 p-3 rounded italic">
                    <Info size={14} className="shrink-0 text-amber-600" />
                    Our system uses 2.5D synthesis to ensure no undercuts, protecting your carving bits.
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-amber-500 font-bold py-5 rounded-lg flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" />
                      GENERATING GEOMETRY...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      GENERATE MILLING RELIEF
                    </>
                  )}
                </button>
              </form>

              {advice && !loading && (
                <div className="mt-10 p-5 bg-stone-900 text-stone-100 rounded-lg shadow-inner border-l-4 border-amber-600">
                  <div className="flex items-center gap-2 text-amber-500 font-bold mb-3 uppercase text-xs tracking-widest">
                    <AlertCircle size={16} />
                    Milling Specification
                  </div>
                  <div className="text-sm space-y-2 whitespace-pre-line leading-relaxed text-stone-300">
                    {advice}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Visualization Side */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-stone-300 rounded-xl aspect-square lg:h-[600px] w-full flex items-center justify-center overflow-hidden border-8 border-white shadow-2xl relative group">
              {concept ? (
                <>
                  <img src={concept.imageUrl} alt="CNC Relief Heightmap" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
                  <div className="absolute top-4 left-4 bg-stone-900/90 text-amber-500 px-3 py-1.5 rounded-full text-[10px] font-bold backdrop-blur-md uppercase tracking-wider flex items-center gap-2 border border-amber-500/30">
                    <Box size={12} />
                    High-Res Depth Map
                  </div>
                </>
              ) : (
                <div className="text-center px-12">
                  <div className="w-24 h-24 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-400 border-4 border-dashed border-stone-400">
                    <Layers className="animate-pulse" size={48} />
                  </div>
                  <h3 className="text-stone-600 font-bold text-xl mb-2">Awaiting Job Parameters</h3>
                  <p className="text-stone-500 text-sm">Design your relief to see the milling-ready depth map here.</p>
                </div>
              )}
              {loading && (
                <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-md flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin shadow-lg"></div>
                  <div className="text-center">
                    <span className="text-white font-bold tracking-[0.2em] text-xs block mb-1">ANALYZING VOXELS...</span>
                    <span className="text-amber-500/80 text-[10px] uppercase font-mono tracking-widest">Applying Surface Textures</span>
                  </div>
                </div>
              )}
            </div>
            
            {concept && !loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={downloadRelief}
                  className="bg-stone-900 hover:bg-stone-800 text-amber-500 py-5 rounded-lg font-bold transition-all shadow-lg flex items-center justify-center gap-3 active:scale-95 border border-amber-500/20"
                >
                  <Download size={22} />
                  EXPORT DEPTH MAP (PNG)
                </button>
                <button 
                  onClick={exportSTL}
                  disabled={exporting}
                  className="bg-amber-700 hover:bg-amber-600 text-stone-100 py-5 rounded-lg font-bold transition-all shadow-lg flex items-center justify-center gap-3 active:scale-95 disabled:bg-stone-400"
                >
                  {exporting ? (
                    <>
                        <Loader2 className="animate-spin" size={22} />
                        BUILDING MESH...
                    </>
                  ) : (
                    <>
                        <Box size={22} />
                        EXPORT 3D RELIEF (STL)
                    </>
                  )}
                </button>
              </div>
            )}
            
            {concept && !loading && (
               <div className="bg-stone-200/50 p-4 rounded-lg flex items-center gap-4 border border-stone-300">
                  <div className="bg-white p-2 rounded shadow-sm">
                    <Info className="text-amber-700" size={20} />
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    <strong>Tip:</strong> STL files are exported at 256x256 resolution to ensure compatibility with most mobile and desktop CAM browsers. For higher fidelity, use the Depth Map PNG in Aspire's "Import Component" menu.
                  </p>
               </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

const Layers: React.FC<{className?: string, size?: number}> = ({className, size=24}) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
    </svg>
);
