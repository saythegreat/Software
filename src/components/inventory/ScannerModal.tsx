"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { useStore } from '../../store/useStore';
import { Button } from '../ui/Button';
import { X, Camera, FlipHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

interface ScannerModalProps {
  onClose: () => void;
}

export const ScannerModal = ({ onClose }: ScannerModalProps) => {
  const { addItem } = useStore();
  const [step, setStep] = useState<'barcode' | 'confirm'>('barcode');
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  
  const [formData, setFormData] = useState({
    item_name: '',
    brand: '',
    category: 'Other',
    barcode: '',
    expiry_date: '', // Compulsory & empty initially
    quantity: '1',
    fridge: false,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const scanningRef = useRef(false);

  // Stop camera tracks and clean up resources
  const stopCamera = useCallback(() => {
    scanningRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    readerRef.current = null;
    setScanning(false);
    setCameraError('');
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const startReader = useCallback(async (stream: MediaStream) => {
    const video = videoRef.current;
    if (!video) return;

    video.srcObject = stream;
    video.setAttribute('playsinline', 'true');
    video.setAttribute('muted', 'true');
    video.muted = true;

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => {
        video.play().then(resolve).catch(reject);
      };
      video.onerror = reject;
      setTimeout(resolve, 2000);
    });

    if (!scanningRef.current) return;

    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    try {
      await reader.decodeFromVideoElement(video, (result, error, controls) => {
        if (!scanningRef.current) {
          controls.stop();
          return;
        }

        if (result) {
          controls.stop();
          stopCamera();
          handleBarcodeDetected(result.getText());
        }
      });
    } catch (err) {
      console.error('[Scanner] decodeFromVideoElement error:', err);
    }
  }, [stopCamera]); // eslint-disable-line react-hooks/exhaustive-deps

  const startScanning = async () => {
    setCameraError('');
    setScanning(true);
    scanningRef.current = true;

    await new Promise(r => setTimeout(r, 150));

    if (!videoRef.current) {
      setScanning(false);
      scanningRef.current = false;
      setCameraError('Video element not found. Please try again.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (!scanningRef.current) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      await startReader(stream);
    } catch (err: any) {
      scanningRef.current = false;
      setScanning(false);
      const msg = String(err?.message || err?.name || err || '').toLowerCase();

      if (msg.includes('permission') || msg.includes('notallowed') || msg.includes('denied')) {
        const errorMsg = 'Camera permission denied. Please allow camera access in settings.';
        setCameraError(errorMsg);
        toast.error(errorMsg);
      } else if (msg.includes('notfound') || msg.includes('nodevice')) {
        const errorMsg = 'No camera found on this device.';
        setCameraError(errorMsg);
        toast.error(errorMsg);
      } else {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          streamRef.current = stream;
          scanningRef.current = true;
          setScanning(true);
          await startReader(stream);
        } catch {
          const errorMsg = 'Camera failed to start. Enter details manually.';
          setCameraError(errorMsg);
          toast.error(errorMsg);
          setScanning(false);
        }
      }
    }
  };

  const switchCamera = async () => {
    const newFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newFacing);
    stopCamera();
    await new Promise(r => setTimeout(r, 200));
    setScanning(true);
    scanningRef.current = true;
    await new Promise(r => setTimeout(r, 150));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: newFacing } },
        audio: false,
      });
      streamRef.current = stream;
      await startReader(stream);
    } catch (err) {
      console.error('[Scanner] switch camera error:', err);
      setScanning(false);
    }
  };

  const handleBarcodeDetected = async (barcode: string) => {
    setFormData(f => ({ ...f, barcode }));
    toast.loading('Looking up product...', { id: 'lookup' });
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await res.json();
      if (data.status === 1) {
        const p = data.product;
        const apiCat = (p.categories?.split(',')[0]?.trim() || '').toLowerCase();
        let matchedCategory = 'Other';
        
        if (apiCat.includes('dairy') || apiCat.includes('milk') || apiCat.includes('cheese') || apiCat.includes('yogurt')) {
          matchedCategory = 'Dairy';
        } else if (apiCat.includes('meat') || apiCat.includes('chicken') || apiCat.includes('beef') || apiCat.includes('fish')) {
          matchedCategory = 'Meat';
        } else if (apiCat.includes('vegetable') || apiCat.includes('greens') || apiCat.includes('salad')) {
          matchedCategory = 'Vegetables';
        } else if (apiCat.includes('fruit')) {
          matchedCategory = 'Fruits';
        } else if (apiCat.includes('beverage') || apiCat.includes('drink') || apiCat.includes('juice') || apiCat.includes('soda')) {
          matchedCategory = 'Beverages';
        } else if (apiCat.includes('snack') || apiCat.includes('chip') || apiCat.includes('cookie') || apiCat.includes('candy') || apiCat.includes('chocolate')) {
          matchedCategory = 'Snacks';
        } else if (apiCat.includes('cooked') || apiCat.includes('meal') || apiCat.includes('ready')) {
          matchedCategory = 'Cooked';
        }

        setFormData(f => ({
          ...f,
          item_name: p.product_name || f.item_name,
          brand: p.brands || '',
          category: matchedCategory,
          expiry_date: '' // Keep expiry date empty so user has to enter it
        }));
        toast.success('Product found! Check the details.', { id: 'lookup' });
        setStep('confirm');
      } else {
        toast.error('Product not in database — enter details manually.', { id: 'lookup' });
        setStep('confirm');
      }
    } catch {
      toast.error('Lookup failed. Enter details manually.', { id: 'lookup' });
      setStep('confirm');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.expiry_date) {
      toast.error('Please select an expiry date.');
      return;
    }
    setSaving(true);
    try {
      await addItem({
        item_name: formData.item_name,
        category: formData.category,
        quantity: formData.quantity,
        expiry_date: formData.expiry_date,
        fridge: formData.fridge,
      });
      toast.success(`${formData.item_name} added to inventory!`);
      onClose();
    } catch (error: any) {
      const msg = error?.message || String(error);
      if (msg.includes('Failed to fetch')) {
        toast.error('Connection error. Please try again.');
      } else {
        toast.error(msg || 'Failed to save item.');
      }
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { key: 'barcode', label: '1. Scan Barcode' },
    { key: 'confirm', label: '2. Save & Confirm' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={cn(
          "bg-white w-full rounded-3xl shadow-2xl overflow-hidden border border-gray-100 transition-all duration-300",
          (step === 'barcode' && scanning) ? "max-w-2xl" : "max-w-lg"
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Smart Scanner</h3>
            <p className="text-xs text-gray-400 mt-0.5">Scan product barcode to save instantly</p>
          </div>
          <button
            onClick={() => { stopCamera(); onClose(); }}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Step tabs */}
        <div className="flex border-b border-gray-100">
          {steps.map(s => (
            <button
              key={s.key}
              onClick={() => { if (scanning) stopCamera(); setStep(s.key as any); }}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors border-b-2 ${
                step === s.key
                  ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Step 1: Barcode */}
          {step === 'barcode' && (
            <div className="space-y-6">
              {/* Camera area */}
              <div className={scanning ? 'block' : 'hidden'}>
                <div className="relative rounded-2xl overflow-hidden bg-black border border-gray-100 shadow-inner" style={{ aspectRatio: '16/9' }}>
                  <style>{`
                    @keyframes scan-laser {
                      0%, 100% { top: 8%; }
                      50% { top: 92%; }
                    }
                  `}</style>
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-[75%] h-[60%] max-w-[420px] max-h-[260px] border-2 border-emerald-400 rounded-2xl opacity-90 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-500 rounded-tl-lg" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-500 rounded-tr-lg" />
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-500 rounded-bl-lg" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-500 rounded-br-lg" />
                      
                      <div 
                        className="absolute left-0 right-0 h-[2px] bg-emerald-400 shadow-[0_0_8px_#34d399]" 
                        style={{
                          animation: 'scan-laser 2.5s ease-in-out infinite',
                          top: '8%'
                        }} 
                      />
                    </div>
                  </div>
                  <p className="absolute bottom-3 left-0 right-0 text-center text-white text-xs font-semibold drop-shadow tracking-wider uppercase">
                    Center barcode in the target frame
                  </p>
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={switchCamera}
                      className="p-2 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
                      title="Switch camera"
                    >
                      <FlipHorizontal className="w-4 h-4" />
                    </button>
                    <button
                      onClick={stopCamera}
                      className="p-2 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Open Camera button */}
              {!scanning && (
                <button
                  onClick={startScanning}
                  className="w-full flex flex-col items-center justify-center gap-4 p-10 rounded-2xl bg-emerald-50 border-2 border-dashed border-emerald-200 hover:bg-emerald-100 transition-colors text-emerald-700"
                >
                  <Camera className="w-12 h-12" />
                  <span className="font-bold text-sm">Open Camera to Scan Barcode</span>
                  <span className="text-xs text-emerald-500 font-medium">Uses device camera</span>
                </button>
              )}

              {/* Camera error message */}
              {cameraError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-medium text-center">
                  {cameraError}
                </div>
              )}

              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 font-bold uppercase">or type manually</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter barcode number..."
                  value={formData.barcode}
                  onChange={e => setFormData(f => ({ ...f, barcode: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && formData.barcode && handleBarcodeDetected(formData.barcode)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm text-center font-mono"
                />
                <Button
                  onClick={() => formData.barcode && handleBarcodeDetected(formData.barcode)}
                  className="w-full mt-3 bg-emerald-600 rounded-xl text-sm font-bold"
                >
                  Look Up Product
                </Button>
              </div>

              <button
                onClick={() => setStep('confirm')}
                className="w-full text-center text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Skip barcode scan — enter details manually →
              </button>
            </div>
          )}

          {/* Step 2: Confirm / Manual */}
          {step === 'confirm' && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.item_name}
                    onChange={e => setFormData(f => ({ ...f, item_name: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm"
                    placeholder="e.g. Greek Yogurt"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => {
                      setFormData(f => ({ ...f, category: e.target.value }));
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm"
                  >
                    {['Dairy','Meat','Vegetables','Fruits','Beverages','Snacks','Cooked','Other'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">Quantity</label>
                  <input
                    type="text"
                    value={formData.quantity}
                    onChange={e => setFormData(f => ({ ...f, quantity: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm"
                    placeholder="e.g. 500g, 2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.expiry_date}
                    onChange={e => {
                      setFormData(f => ({ ...f, expiry_date: e.target.value }));
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm [color-scheme:light]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.fridge}
                  onChange={e => setFormData(f => ({ ...f, fridge: e.target.checked }))}
                  className="w-5 h-5 accent-emerald-500"
                />
                <span className="text-sm font-medium text-gray-800">Store in Fridge ❄️</span>
              </label>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1 border-gray-200" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-emerald-600 text-white font-bold" isLoading={saving}>
                  Save Item
                </Button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
