import SearchBar from "@/components/ui/SearchBar";
import { ShieldCheck, Stethoscope, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full px-4 text-center pb-20">
      <div className="w-full max-w-4xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pt-20">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <ShieldCheck className="mr-2 h-4 w-4" />
            AI-Powered Healthcare Intelligence
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            Understand Your <span className="text-primary">Medicines</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-300 max-w-2xl mx-auto">
            Get instant, accurate, and easy-to-understand educational information about any medication, its uses, dosages, and side effects.
          </p>
        </div>

        {/* Search Section */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 relative z-20">
          <SearchBar />
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 pt-16 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
          <div className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border shadow-sm">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mb-4">
              <Stethoscope className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Detailed Insights</h3>
            <p className="text-sm text-slate-500 dark:text-slate-300 text-center">Comprehensive breakdown of uses, interactions, and precautions.</p>
          </div>
          
          <div className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border shadow-sm">
            <div className="p-3 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Trusted Sources</h3>
            <p className="text-sm text-slate-500 dark:text-slate-300 text-center">Data aggregated from OpenFDA, RxNorm, and DailyMed.</p>
          </div>
          
          <div className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border shadow-sm">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 mb-4">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Smart Features</h3>
            <p className="text-sm text-slate-500 dark:text-slate-300 text-center">Voice search, OCR scanning, and AI chatbot assistance.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
