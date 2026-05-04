"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Mic, Camera, Clock, X } from "lucide-react";
import CameraScannerModal from "./CameraScannerModal";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const router = useRouter();

  const suggestions = [
    "Aspirin", "Ibuprofen", "Amoxicillin", "Paracetamol", "Lisinopril", "Dolo"
  ];

  useEffect(() => {
    const saved = localStorage.getItem("mediguide_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  }, []);

  const saveToHistory = (term: string) => {
    if (!term.trim()) return;
    const newHistory = [term, ...history.filter(h => h.toLowerCase() !== term.toLowerCase())].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem("mediguide_history", JSON.stringify(newHistory));
  };

  const clearHistory = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHistory([]);
    localStorage.removeItem("mediguide_history");
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      saveToHistory(query.trim());
      router.push(`/medicine/${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    saveToHistory(suggestion);
    setShowSuggestions(false);
    router.push(`/medicine/${encodeURIComponent(suggestion)}`);
  };

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice search is not supported in this browser.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
      
      // Auto-submit voice search exactly like Google Voice Search
      if (transcript.trim()) {
        saveToHistory(transcript.trim());
        router.push(`/medicine/${encodeURIComponent(transcript.trim())}`);
        setShowSuggestions(false);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleCameraScan = () => {
    setIsCameraOpen(true);
  };

  const handleScanComplete = (text: string) => {
    setQuery(text);
    if (text && text !== "Scan failed") {
      saveToHistory(text.trim());
      router.push(`/medicine/${encodeURIComponent(text.trim())}`);
      setShowSuggestions(false);
    }
  };

  const filteredSuggestions = suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="relative flex items-center w-full">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(e.target.value.length > 0 || history.length > 0);
          }}
          onFocus={() => setShowSuggestions(query.length > 0 || history.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className={`w-full pl-12 pr-24 py-4 rounded-full border bg-card text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg transition-all ${isListening ? 'border-red-400 dark:border-red-500 shadow-md ring-2 ring-red-400/20' : 'border-border'}`}
          placeholder={isListening ? "Listening..." : "Search medicine..."}
        />
        
        <div className="absolute inset-y-0 right-2 flex items-center space-x-1">
          <button 
            type="button" 
            onClick={handleVoiceSearch}
            className={`p-2 transition-colors rounded-full ${isListening ? 'text-red-500 bg-red-50 dark:bg-red-900/20 animate-pulse' : 'text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            aria-label="Voice Search"
            title="Voice Search"
          >
            <Mic className="h-5 w-5" />
          </button>
          <button 
            type="button" 
            onClick={handleCameraScan}
            className="p-2 text-slate-400 hover:text-primary transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Camera Scan"
            title="Camera Scan"
          >
            <Camera className="h-5 w-5" />
          </button>
        </div>
      </form>

      {/* Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-xl shadow-lg z-10 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="p-2 max-h-[60vh] overflow-y-auto">
            
            {/* Recent Searches */}
            {history.length > 0 && query.length === 0 && (
              <div className="mb-2">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Recent Searches</span>
                  <button 
                    onMouseDown={clearHistory}
                    className="text-xs text-slate-400 hover:text-primary transition-colors"
                  >
                    Clear
                  </button>
                </div>
                {history.map((h, index) => (
                  <button
                    key={`history-${index}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSuggestionClick(h);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-center space-x-3 transition-colors"
                  >
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>{h}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Quick Suggestions */}
            {(query.length > 0 || history.length === 0) && (
              <>
                <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Quick Suggestions
                </div>
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={`suggestion-${index}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSuggestionClick(suggestion);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-center space-x-3 transition-colors"
                    >
                      <Search className="h-4 w-4 text-slate-400" />
                      <span>{suggestion}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">No suggestions found</div>
                )}
              </>
            )}
            
          </div>
        </div>
      )}

      {/* Camera Scanner Modal */}
      <CameraScannerModal 
        isOpen={isCameraOpen} 
        onClose={() => setIsCameraOpen(false)} 
        onScanComplete={handleScanComplete} 
      />
    </div>
  );
}
