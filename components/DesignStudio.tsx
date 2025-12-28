import React, { useState, useRef } from 'react';
import { Palette, Download, Loader2, Sparkles, Info, Drill, Box, Layers, FileCode, ImageIcon } from 'lucide-react';
import { generateDesignSVG, getDesignAdvice } from '../services/gemini';
import { DesignConcept } from '../types';

export const DesignStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setSvgContent(null);
    setAdvice(null);

    try {
      const [svg, adviceText] = await Promise.all([
        generateDesignSVG(prompt),
        getDesignAdvice(prompt)
      ]);

      if (svg) {
        setSvgContent(svg);
      }
      setAdvice(adviceText);
    } catch (err) {
      console.error("Studio Generation Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadSVG = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cnc-pattern-${Date.now()}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportSTL = async () => {
    if (!svgContent || !canvasRef.current || exporting) return;
    setExporting(true);

    try {
      // Step 1: Render SVG to Canvas to get height pixels
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = url;
      });

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      // Step 2: Get pixel data (assuming 64x64 for mesh complexity management)
      const meshSize = 64;
      const step = canvas.width / meshSize;
      const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      
      const heights: number[][] = [];
      for (let y = 0; y < meshSize; y++) {
        const row: number[] = [];
        for (let x = 0; x < meshSize; x++) {
          const px = Math.floor(x * step);
          const py = Math.floor(y * step);
          const idx = (py * canvas.width + px) * 4;
          // Grayscale average (R+G+B)/3
          const gray = (pixelData[idx] + pixelData[idx+1] + pixelData[idx+2]) / (3 * 255);
          row.push(gray);
        }
        heights.push(row);
      }

      // Step 3: Binary STL generation
      const depthScale = 20; // 20mm
      const gridScale = 3;   // 3mm
      const triangleCount = (meshSize - 1) * (meshSize - 1) * 2;
      const buffer = new ArrayBuffer(84 + triangleCount * 50);
      const view = new DataView(buffer);
      
      view.setUint32(80, triangleCount, true);
      let offset = 84;

      const addTri = (p1: number[], p2: number[], p3: number[]) => {
        [0,0,0].forEach(n => view.setFloat32(offset, n, true), offset += 12); // Normal
        [p1, p2, p3].forEach(p => {
          view.setFloat32(offset, p[0], true);
          view.setFloat32(offset + 4, p[1], true);
          view.setFloat32(offset + 8, p[2], true);
          offset += 12;
        });
        view.setUint16(offset, 0, true); offset += 2;
      };

      for (let y = 0; y < meshSize - 1; y++) {
        for (let x = 0; x < meshSize - 1; x++) {
          const z00 = heights[y][x] * depthScale;
          const z10 = heights[y][x+1] * depthScale;
          const z01 = heights[y+1][x] * depthScale;
          const z11 = heights[y+1][x+1] * depthScale;

          const p00 = [x * gridScale, y * gridScale, z00];
          const p10 = [(x+1) * gridScale, y * gridScale, z10];
          const p01 = [x * gridScale, (y+1) * gridScale, z01];
          const p11 = [(x+1) * gridScale, (y+1) * gridScale, z11];

          addTri(p00, p10, p01);
          addTri(p10, p11, p01);
        }
      }

      const stlBlob = new Blob([buffer], { type: 'application/sla' });
      const stlUrl = URL.createObjectURL(stlBlob);
      const link = document.createElement('a');
      link.href = stlUrl;
      link.download = `relief-mesh-${Date.now()}.stl`;
      link.click();
      URL.revokeObjectURL(stlUrl);
    } catch (err) {
      console.error("STL Export Failed:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className="text-4xl font-bold text-stone-900 serif italic mb-4">Artisan Pattern Studio</h1>
            <p className="text-stone-600 max-w-2xl mx-auto">
                Generate lightweight SVG depth patterns using Gemini 3 Flash. 
                Perfect for CNC carving without image generation costs.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-stone-200 sticky top-24">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-amber-700 p-2 rounded shadow-md">
                  <FileCode className="text-stone-900" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-stone-800 tracking-tight">Pattern Generator</h2>
              </div>

              <form onSubmit={handleGenerate} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-3 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Palette size={14} />
                    Describe your carving
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. Victorian roses with deep radial gradients, or a geometric interlaced Celtic knot..."
                    className="w-full h-44 p-4 rounded-lg border-2 border-stone-100 focus:border-stone-900 outline-none transition-all resize-none text-stone-800 font-medium placeholder:text-stone-300"
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
                      GENERATING SVG...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      CREATE DEPTH MAP
                    </>
                  )}
                </button>
              </form>

              {advice && !loading && (
                <div className="mt-8 p-5 bg-stone-50 border-l-4 border-amber-600 rounded-r-lg">
                  <div className="flex items-center gap-2 text-stone-500 font-bold mb-2 text-[10px] uppercase tracking-widest">
                    <Drill size={14} />
                    Carver's Guidance
                  </div>
                  <div className="text-sm text-stone-700 space-y-2 whitespace-pre-line leading-relaxed italic">
                    {advice}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-xl aspect-square w-full flex items-center justify-center overflow-hidden border-8 border-stone-200 shadow-2xl relative">
              {svgContent ? (
                <div 
                  className="w-full h-full flex items-center justify-center p-4 bg-stone-900"
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                />
              ) : (
                <div className="text-center px-12">
                  <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-300 border-4 border-dashed border-stone-200">
                    <ImageIcon size={48} />
                  </div>
                  <h3 className="text-stone-600 font-bold text-xl mb-2">Pattern Preview</h3>
                  <p className="text-stone-400 text-sm">A grayscale SVG representation of your relief will appear here.</p>
                </div>
              )}
              {loading && (
                <div className="absolute inset-0 bg-stone-900/90 backdrop-blur-sm flex flex-col items-center justify-center gap-6 z-20">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-amber-600/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <span className="text-amber-500 font-mono tracking-[0.3em] text-[10px]">VECTORIZING RELIEF...</span>
                </div>
              )}
            </div>
            
            {svgContent && !loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <button 
                  onClick={downloadSVG}
                  className="bg-stone-900 hover:bg-stone-800 text-stone-100 py-5 rounded-lg font-bold transition-all shadow-lg flex items-center justify-center gap-3 active:scale-95"
                >
                  <Download size={22} className="text-amber-500" />
                  PATTERN (SVG)
                </button>
                <button 
                  onClick={exportSTL}
                  disabled={exporting}
                  className="bg-amber-700 hover:bg-amber-600 text-stone-100 py-5 rounded-lg font-bold transition-all shadow-lg flex items-center justify-center gap-3 active:scale-95 disabled:bg-stone-400"
                >
                  {exporting ? (
                    <>
                        <Loader2 className="animate-spin" size={22} />
                        EXPORTING...
                    </>
                  ) : (
                    <>
                        <Box size={22} />
                        MESH RELIEF (STL)
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Hidden Processing Canvas */}
            <canvas 
              ref={canvasRef} 
              width={512} 
              height={512} 
              className="hidden"
            />

            {svgContent && !loading && (
               <div className="bg-stone-900 text-stone-400 p-6 rounded-lg flex items-start gap-4 border border-stone-800">
                  <Layers className="text-amber-600 shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-xs font-bold text-stone-200 mb-1 uppercase tracking-widest">Digital Heightmap</p>
                    <p className="text-[11px] leading-relaxed">
                      This SVG pattern encodes depth data through grayscale values. White elements are at the surface (20mm), while black elements are at the base (0mm). Use the SVG in your favorite CAM software like Vectric or ArtCAM.
                    </p>
                  </div>
               </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
