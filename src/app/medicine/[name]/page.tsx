import { getMedicineData } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import SearchBar from "@/components/ui/SearchBar";
import { 
  Pill, 
  AlertTriangle, 
  Activity, 
  Info, 
  ShieldAlert, 
  Clock, 
  ChevronLeft,
  ShoppingCart,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ExpandableText from "@/components/ui/ExpandableText";
import WhereToBuy from "@/components/ui/WhereToBuy";

export default async function MedicineResultPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const data = await getMedicineData(decodedName);

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <AlertTriangle className="h-16 w-16 text-warning mb-6" />
        <h1 className="text-3xl font-bold mb-4">Medicine Not Found</h1>
        <p className="text-slate-500 dark:text-slate-300 max-w-lg mb-8">
          We couldn't find information for "{decodedName}". Please check the spelling or try searching for a different brand or generic name.
        </p>
        <div className="w-full max-w-xl">
          <SearchBar />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      {/* Top Search Area & Back */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <Link href="/" className="inline-flex items-center text-sm text-slate-500 dark:text-slate-300 hover:text-primary transition-colors self-start md:self-auto">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Search
        </Link>
        <div className="w-full md:w-1/2">
          <SearchBar />
        </div>
      </div>

      {/* 1. About Medicine Card (Full Width) */}
      <Card className="w-full bg-gradient-to-br from-card to-blue-50/50 dark:to-blue-900/10 border-blue-100 dark:border-blue-900 overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            <div className="p-8 w-full space-y-4">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                <Pill className="mr-1.5 h-3 w-3" />
                {data.category}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  {data.brandName}
                </h1>
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-sm text-slate-600 dark:text-slate-200">
                <p><strong>Generic:</strong> {data.genericName}</p>
                <p><strong>Manufacturer:</strong> {data.manufacturer}</p>
              </div>
              <ExpandableText 
                text={data.description} 
                maxLength={250} 
                className="text-slate-700 dark:text-slate-100 mt-4 leading-relaxed"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Common Terms Highlight Box */}
      {data.uses.commonTerms && data.uses.commonTerms.length > 0 && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-emerald-800 dark:text-emerald-300 mb-3 flex items-center">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            General Uses (Common Terms)
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.uses.commonTerms.map((term, i) => (
              <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-800/40 text-emerald-700 dark:text-emerald-200 text-sm font-medium">
                {term}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 2x2 Dashboard Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Left Top: Uses */}
        <Card className="h-full border-green-100 dark:border-green-900">
          <CardHeader>
            <CardTitle className="text-green-600 dark:text-green-400">
              <Info className="h-5 w-5" />
              Uses & Indications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Primary Uses</h4>
              <ExpandableText text={data.uses.primary} asBullets className="text-slate-600 dark:text-slate-200" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Secondary Uses</h4>
              <ExpandableText text={data.uses.secondary} asBullets className="text-slate-600 dark:text-slate-200" />
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800">
              <h4 className="font-semibold text-green-800 dark:text-green-300 mb-1">Why Prescribed</h4>
              <p className="text-green-700 dark:text-green-400 text-xs">{data.uses.whyPrescribed}</p>
            </div>
          </CardContent>
        </Card>

        {/* Right Top: Dosage Guidance */}
        <Card className="h-full border-blue-100 dark:border-blue-900">
          <CardHeader>
            <CardTitle className="text-blue-600 dark:text-blue-400">
              <Clock className="h-5 w-5" />
              Dosage Guidance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-800 rounded-t-lg">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Age Group</th>
                    <th className="px-4 py-3">Amount of Tablets</th>
                    <th className="px-4 py-3 rounded-tr-lg">Time Gap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="bg-card">
                    <td className="px-4 py-3 font-medium">Child</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-200 capitalize">{data.dosage.child.amount}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-200 capitalize">{data.dosage.child.gap}</td>
                  </tr>
                  <tr className="bg-card">
                    <td className="px-4 py-3 font-medium">Adult</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-200 capitalize">{data.dosage.adult.amount}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-200 capitalize">{data.dosage.adult.gap}</td>
                  </tr>
                  <tr className="bg-card">
                    <td className="px-4 py-3 font-medium">Elderly</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-200 capitalize">{data.dosage.elderly.amount}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-200 capitalize">{data.dosage.elderly.gap}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-warning font-medium flex items-start mt-2">
              <AlertTriangle className="h-3 w-3 mr-1 mt-0.5 shrink-0" />
              Disclaimer: Always consult your doctor for precise dosage. Do not self-medicate.
            </p>
          </CardContent>
        </Card>

        {/* Left Bottom: Side Effects */}
        <Card className="h-full border-red-100 dark:border-red-900">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Side Effects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">Common Side Effects</h4>
              <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-200 space-y-1">
                {data.sideEffects.common.length > 0 
                  ? data.sideEffects.common.map((effect, i) => <li key={i}>{effect}</li>)
                  : <li>Information not provided.</li>}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Serious Side Effects</h4>
              <ul className="list-disc list-inside text-sm text-red-500/80 space-y-1">
                {data.sideEffects.serious.length > 0 
                  ? data.sideEffects.serious.map((effect, i) => <li key={i}>{effect}</li>)
                  : <li>Information not provided.</li>}
              </ul>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800">
              <h4 className="font-semibold text-red-800 dark:text-red-300 text-xs mb-1 uppercase tracking-wider">Emergency Symptoms</h4>
              <p className="text-red-700 dark:text-red-400 text-xs font-medium">
                Seek immediate help if you experience: {data.sideEffects.emergency.join(", ")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right Bottom: Precautions */}
        <Card className="h-full border-purple-100 dark:border-purple-900">
          <CardHeader>
            <CardTitle className="text-purple-600 dark:text-purple-400">
              <ShieldAlert className="h-5 w-5" />
              Precautions & Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 text-sm">
              {data.precautions.food !== "Not specified" && (
                <div className="space-y-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-100">Food / Alcohol:</span>
                  <ExpandableText text={data.precautions.food} maxLength={150} className="text-slate-500 dark:text-slate-300" />
                </div>
              )}
              {data.precautions.pregnancy !== "Not specified" && (
                <div className="space-y-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-100">Pregnancy:</span>
                  <ExpandableText text={data.precautions.pregnancy} maxLength={150} className="text-slate-500 dark:text-slate-300" />
                </div>
              )}
              {data.precautions.driving !== "Not specified" && (
                <div className="space-y-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-100">Driving / Machinery:</span>
                  <ExpandableText text={data.precautions.driving} maxLength={150} className="text-slate-500 dark:text-slate-300" />
                </div>
              )}
              {data.precautions.general !== "Not specified" && (
                <div className="space-y-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-100">General Warnings:</span>
                  <ExpandableText text={data.precautions.general} maxLength={200} asBullets className="text-slate-500 dark:text-slate-300" />
                </div>
              )}
              {data.precautions.food === "Not specified" && 
               data.precautions.pregnancy === "Not specified" && 
               data.precautions.driving === "Not specified" && 
               data.precautions.general === "Not specified" && (
                 <div className="text-slate-500 dark:text-slate-300 italic">No specific precautions provided.</div>
               )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Where to Buy Section */}
      <WhereToBuy medicineName={decodedName} />

    </div>
  );
}
