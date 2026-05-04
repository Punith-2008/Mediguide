"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Camera, X, Loader2, Upload } from "lucide-react";
import Tesseract from "tesseract.js";

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (text: string) => void;
}

// Heuristic to find the most likely medicine name from a block of noisy OCR text
function extractMedicineName(ocrText: string): string {
  const lines = ocrText
    .split('\n')
    .map(l => l.trim().replace(/[^a-zA-Z0-9\s]/g, '')) // Remove special chars
    .filter(l => l.length > 2 && l.length < 30); // Valid name length
    
  if (lines.length === 0) return ocrText.substring(0, 20);

  // Common noise words on medicine packaging
  const noisePatterns = [
    /manufactured/i, /mfg/i, /exp/i, /date/i, /mrp/i, /batch/i, 
    /dosage/i, /directed/i, /physician/i, /store/i, /children/i, 
    /keep/i, /warning/i, /caution/i, /private/i, /limited/i, /ltd/i
  ];

  // Try to find the first line that DOES NOT look like noise or a pure number
  for (const line of lines) {
    const isNoise = noisePatterns.some(p => p.test(line));
    const isMostlyNumbers = (line.match(/\d/g) || []).length > (line.length / 2);
    
    if (!isNoise && !isMostlyNumbers) {
      return line;
    }
  }

  // Fallback to the largest text or first line
  return lines[0];
}

export default function CameraScannerModal({ isOpen, onClose, onScanComplete }: CameraScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopStream();
    }
    return () => stopStream();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Unable to access camera. Please check permissions.");
      onClose();
    }
  };

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsProcessing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataUrl = canvas.toDataURL("image/png");

    try {
      const result = await Tesseract.recognize(imageDataUrl, 'eng', {
        logger: m => console.log(m)
      });
      
      const text = result.data.text.trim();
      const possibleName = extractMedicineName(text);
      
      onScanComplete(possibleName || "Scan failed");
      onClose();
    } catch (error) {
      console.error("OCR Error:", error);
      alert("Failed to process image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      const imageDataUrl = event.target?.result as string;
      if (!imageDataUrl) {
        setIsProcessing(false);
        return;
      }
      
      try {
        const result = await Tesseract.recognize(imageDataUrl, 'eng', {
          logger: m => console.log(m)
        });
        
        const text = result.data.text.trim();
        const possibleName = extractMedicineName(text);
        
        onScanComplete(possibleName || "Scan failed");
        onClose();
      } catch (error) {
        console.error("OCR Error:", error);
        alert("Failed to process image.");
      } finally {
        setIsProcessing(false);
      }
    };
    
    reader.onerror = () => {
      alert("Failed to read the file.");
      setIsProcessing(false);
    };
    
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative bg-card w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-border">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Scan Medicine Label
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video Area */}
        <div className="relative bg-black aspect-[3/4] sm:aspect-video flex items-center justify-center">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center text-white space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="animate-pulse">Processing image...</p>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Scanning Guide Overlay */}
          {!isProcessing && (
            <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40">
              <div className="w-full h-full border-2 border-primary/50 rounded-lg"></div>
            </div>
          )}
        </div>

        {/* Hidden Canvas and File Input for Image Processing */}
        <canvas ref={canvasRef} className="hidden" />
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileUpload} 
        />

        {/* Footer Actions */}
        <div className="p-4 bg-card flex flex-col gap-3">
          <button
            onClick={captureAndScan}
            disabled={isProcessing}
            className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>Processing...</>
            ) : (
              <>
                <Camera className="h-6 w-6" />
                Capture from Camera
              </>
            )}
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex items-center justify-center gap-2 w-full py-3 bg-secondary/10 text-secondary-foreground font-medium rounded-xl hover:bg-secondary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="h-5 w-5" />
            Upload from Device
          </button>
        </div>

      </div>
    </div>
  );
}
