"use client";

import { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { useStore } from '../../store/useStore';
import { Button } from '../ui/Button';
import { X, Camera, Upload, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface ScannerModalProps {
  onClose: () => void;
}

export const ScannerModal = ({ onClose }: ScannerModalProps) => {
  const { addItem } = useStore();
  const [step, setStep] = useState<'barcode' | 'ocr' | 'confirm'>('barcode');
  const [scanning, setScanning] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    item_name: '',
    brand: '',
    category: 'Other',
    barcode: '',
    expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    quantity: '1',
    fridge: false,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef(new BrowserMultiFormatReader());
  const scanControls = useRef<any>(null);

  useEffect(() => {
    // Stop scanner and release camera on unmount
    return () => {
      try { scanControls.current?.stop(); } catch {}
    };
  }, []);

  const startScanning = async () => {
    setScanning(true);
    try {
      const video = videoRef.current;
      if (!video) { setScanning(false); return; }

      // decodeFromConstraints handles getUserMedia + video attachment internally
      // This avoids all stream conflicts from manual getUserMedia + decodeFromVideoDevice
      scanControls.current = await codeReader.current.decodeFromConstraints(
        { video: { facingMode: { ideal: 'environment' } } },
        video,
        async (result, err) => {
          if (result) {
            scanControls.current?.stop();
            setScanning(false);
            await handleBarcodeDetected(result.getText());
          }
          // scan errors fire constantly when no barcode visible — ignore them
        }
      );
    } catch (err: any) {
      const msg = String(err?.message || err || '');
      if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('notallowed')) {
        toast.error('Camera permission denied — please allow camera access in your browser settings.');
      } else if (msg.toLowerCase().includes('notfound') || msg.toLowerCase().includes('nodevice')) {
        toast.error('No camera found on this device.');
      } else {
        toast.error('Camera failed to start. Use the manual barcode entry below.');
        console.error('[Scanner]', err);
      }
      setScanning(false);
    }
  };

  const stopScanning = () => {
    try { scanControls.current?.stop(); } catch {}
    if (videoRef.current) { videoRef.current.srcObject = null; }
    setScanning(false);
  };


  const handleBarcodeDetected = async (barcode: string) => {
    setFormData(f => ({ ...f, barcode }));
    toast.loading('Looking up product...', { id: 'lookup' });
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await res.json();
      if (data.status === 1) {
        const p = data.product;
        setFormData(f => ({
          ...f,
          item_name: p.product_name || f.item_name,
          brand: p.brands || '',
          category: p.categories?.split(',')[0]?.trim() || 'Other',
        }));
        toast.success('Product found! Check the details.', { id: 'lookup' });
        setStep('ocr');
      } else {
        toast.error('Product not in database — fill in details manually.', { id: 'lookup' });
        setStep('ocr');
      }
    } catch {
      toast.error('Lookup failed. Please fill in manually.', { id: 'lookup' });
      setStep('ocr');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOcrLoading(true);
    toast.loading('Reading expiry date from image...', { id: 'ocr' });
    try {
      const Tesseract = (await import('tesseract.js')).default;
      const result = await Tesseract.recognize(file, 'eng');
      const text = result.data.text;
      const dateRegex = /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})\b/g;
      const dates = text.match(dateRegex);
      if (dates && dates.length > 0) {
        try {
          const parsed = new Date(dates[0].replace(/[\/\.]/g, '-'));
          if (!isNaN(parsed.getTime())) {
            setFormData(f => ({ ...f, expiry_date: parsed.toISOString().split('T')[0] }));
            toast.success(`Date detected: ${dates[0]}`, { id: 'ocr' });
          }
        } catch {}
      } else {
        toast.error('No date found — enter it manually.', { id: 'ocr' });
      }
    } catch {
      toast.error('OCR failed. Please enter date manually.', { id: 'ocr' });
    } finally {
      setOcrLoading(false);
      setStep('confirm');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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
        toast.error('Waking up secure server... Please try again.');
      } else {
        toast.error(msg || 'Failed to save item.');
      }
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { key: 'barcode', label: '1. Scan' },
    { key: 'ocr', label: '2. Expiry' },
    { key: 'confirm', label: '3. Confirm' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Smart Scanner</h3>
            <p className="text-xs text-gray-400 mt-0.5">Scan barcode → detect expiry → save</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Step tabs */}
        <div className="flex border-b border-gray-100">
          {steps.map(s => (
            <button
              key={s.key}
              onClick={() => setStep(s.key as any)}
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
              {!scanning ? (
                <button
                  onClick={startScanning}
                  className="w-full flex flex-col items-center justify-center gap-4 p-10 rounded-2xl bg-emerald-50 border-2 border-dashed border-emerald-200 hover:bg-emerald-100 transition-colors text-emerald-700"
                >
                  <Camera className="w-12 h-12" />
                  <span className="font-bold text-sm">Open Camera to Scan Barcode</span>
                </button>
              ) : (
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={stopScanning}
                    className="absolute top-3 right-3 p-2 bg-black/60 rounded-full text-white hover:bg-black/80"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-32 border-2 border-emerald-400 rounded-xl opacity-70" />
                  </div>
                  <p className="absolute bottom-3 left-0 right-0 text-center text-white text-xs font-medium">
                    Center barcode in the frame
                  </p>
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
                onClick={() => setStep('ocr')}
                className="w-full text-center text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Skip to expiry date step →
              </button>
            </div>
          )}

          {/* Step 2: OCR */}
          {step === 'ocr' && (
            <div className="space-y-6">
              {formData.item_name && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-emerald-800">{formData.item_name}</p>
                    {formData.brand && <p className="text-xs text-emerald-600">{formData.brand}</p>}
                  </div>
                </div>
              )}

              <label className="block w-full cursor-pointer">
                <div className="flex flex-col items-center gap-4 p-10 rounded-2xl border-2 border-dashed border-gray-200 hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-700 relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {ocrLoading ? (
                    <>
                      <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm font-medium text-emerald-600">Reading expiry date...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-10 h-10" />
                      <div className="text-center">
                        <p className="font-bold text-sm">Upload Expiry Label Photo</p>
                        <p className="text-xs text-gray-400 mt-1">We'll auto-detect the date using OCR</p>
                      </div>
                    </>
                  )}
                </div>
              </label>

              <button
                onClick={() => setStep('confirm')}
                className="w-full text-center text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Skip — I'll enter the date manually →
              </button>
            </div>
          )}

          {/* Step 3: Confirm / Manual */}
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
                    onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm"
                  >
                    {['Dairy','Meat','Vegetables','Fruits','Beverages','Snacks','Frozen Food','Bakery','Other'].map(c => (
                      <option key={c}>{c}</option>
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
                    onChange={e => setFormData(f => ({ ...f, expiry_date: e.target.value }))}
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
