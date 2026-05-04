export interface MedicineData {
  brandName: string;
  genericName: string;
  manufacturer: string;
  category: string;
  description: string;
  uses: {
    primary: string;
    secondary: string;
    whyPrescribed: string;
    commonTerms: string[];
  };
  dosage: {
    child: { amount: string, gap: string };
    adult: { amount: string, gap: string };
    elderly: { amount: string, gap: string };
  };
  sideEffects: {
    common: string[];
    serious: string[];
    emergency: string[];
  };
  precautions: {
    food: string;
    pregnancy: string;
    driving: string;
    general: string;
  };
}

export async function getMedicineData(query: string): Promise<MedicineData | null> {
  try {
    // Map international/Indian names to US FDA standard names
    let normalizedQuery = query.toLowerCase().trim();
    
    // Remove common dosage forms from the query to improve search accuracy (like Google search)
    const dosageForms = [
      "tablet", "tablets", "syrup", "syrups", "ointment", "ointments", 
      "cream", "creams", "gel", "gels", "capsule", "capsules", 
      "drop", "drops", "injection", "injections", "suspension", "suspensions",
      "lotion", "lotions", "powder", "powders", "spray", "sprays",
      "pill", "pills", "liquid", "liquids", "solution", "solutions",
      "suppository", "suppositories", "patch", "patches", "inhaler", "inhalers"
    ];

    dosageForms.forEach(form => {
      const regex = new RegExp(`\\b${form}\\b`, 'g');
      normalizedQuery = normalizedQuery.replace(regex, '');
    });
    
    // Clean up any double spaces left behind
    normalizedQuery = normalizedQuery.replace(/\s+/g, ' ').trim();
    
    const nameMapping: Record<string, string> = {
      // Paracetamol / Acetaminophen
      "paracetamol": "acetaminophen",
      "dolo": "acetaminophen",
      "crocin": "acetaminophen",
      "calpol": "acetaminophen",
      "panadol": "acetaminophen",
      "tylenol": "acetaminophen",
      "fepanil": "acetaminophen",
      
      // Ibuprofen & NSAIDs
      "advil": "ibuprofen",
      "motrin": "ibuprofen",
      "brufen": "ibuprofen",
      "combiflam": "ibuprofen",
      "ecosprin": "aspirin",
      "disprin": "aspirin",
      "voltaren": "diclofenac",
      "voveran": "diclofenac",
      "zerodol": "aceclofenac",
      "nise": "nimesulide",
      "meftal": "mefenamic acid",
      "aleve": "naproxen",
      "naprosyn": "naproxen",
      
      // Gastric / Acidity
      "omez": "omeprazole",
      "prilosec": "omeprazole",
      "pan 40": "pantoprazole",
      "pantocid": "pantoprazole",
      "protonix": "pantoprazole",
      "zantac": "ranitidine",
      "aciloc": "ranitidine",
      "rantac": "ranitidine",
      "nexium": "esomeprazole",
      "sompraz": "esomeprazole",
      "digene": "magnesium hydroxide",
      "gelusil": "aluminum hydroxide",
      
      // Antibiotics
      "moxatag": "amoxicillin",
      "novamox": "amoxicillin",
      "augmentin": "amoxicillin", 
      "clavam": "amoxicillin",
      "zithromax": "azithromycin",
      "azithral": "azithromycin",
      "taxim": "cefotaxime",
      "taxim-o": "cefixime",
      "suprax": "cefixime",
      "cipro": "ciprofloxacin",
      "ciplox": "ciprofloxacin",
      "levaquin": "levofloxacin",
      "lcf": "levofloxacin",
      
      // Diabetes
      "glucophage": "metformin",
      "glyciphage": "metformin",
      "obimet": "metformin",
      "amaryl": "glimepiride",
      "daonil": "glibenclamide",
      
      // Allergies / Cold
      "zyrtec": "cetirizine",
      "cz": "cetirizine",
      "okacet": "cetirizine",
      "cetzine": "cetirizine",
      "xyzal": "levocetirizine",
      "allegra": "fexofenadine",
      "avil": "pheniramine",
      "benadryl": "diphenhydramine",
      "claritin": "loratadine",
      "vicks": "camphor",
      
      // Respiratory
      "singulair": "montelukast",
      "montair": "montelukast",
      "montek": "montelukast",
      "asthalin": "albuterol",
      "proventil": "albuterol",
      "ventolin": "albuterol",
      "salbutamol": "albuterol",
      "deriphyllin": "etofylline",
      
      // Thyroid & Hormones
      "synthroid": "levothyroxine",
      "thyronorm": "levothyroxine",
      "eltroxin": "levothyroxine",
      
      // Blood Pressure & Heart
      "norvasc": "amlodipine",
      "amlong": "amlodipine",
      "stamlo": "amlodipine",
      "lipitor": "atorvastatin",
      "atorva": "atorvastatin",
      "crestor": "rosuvastatin",
      "rosuvas": "rosuvastatin",
      "concor": "bisoprolol",
      "inderal": "propranolol",
      "ciar": "propranolol",
      
      // Vitamins & Supplements
      "vit c": "ascorbic acid",
      "vitamin c": "ascorbic acid",
      "limcee": "ascorbic acid",
      "celin": "ascorbic acid",
      "vit d3": "cholecalciferol",
      "vitamin d3": "cholecalciferol",
      "shelcal": "calcium carbonate",
      "supradyn": "multivitamin",
      "becosules": "vitamin b complex",
      
      // Others
      "betadine": "povidone iodine",
      "soframycin": "framycetin",
      "burnol": "silver sulfadiazine",
      "volini": "diclofenac",
      "moov": "diclofenac",
      "eno": "sodium bicarbonate"
    };
    
    let mappedQuery = normalizedQuery;
    const sortedKeys = Object.keys(nameMapping).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
      if (normalizedQuery.includes(key)) {
        mappedQuery = nameMapping[key];
        break;
      }
    }

    // ADVANCED SEARCH LOGIC: RxNorm Integration
    // Use the National Library of Medicine API to resolve spelling, common, or brand names to their exact concepts
    let resolvedBrandName = mappedQuery;
    let resolvedGenericName = "";
    
    try {
      // 1. Get approximate match (handles typos, misspellings, and maps brands)
      const rxNormRes = await fetch(`https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${encodeURIComponent(mappedQuery)}&maxEntries=1`);
      if (rxNormRes.ok) {
        const rxData = await rxNormRes.json();
        if (rxData.approximateGroup?.candidate?.length > 0) {
          const rxcui = rxData.approximateGroup.candidate[0].rxcui;
          resolvedBrandName = rxData.approximateGroup.candidate[0].name || resolvedBrandName;
          
          // 2. Resolve the generic ingredient for more accurate OpenFDA searches
          const relatedRes = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/related.json?tty=IN`);
          if (relatedRes.ok) {
            const relatedData = await relatedRes.json();
            // Optional chaining and fallback to safely get the name
            const concepts = relatedData.relatedGroup?.conceptGroup?.find((g: any) => g.tty === 'IN')?.conceptProperties;
            if (concepts && concepts.length > 0) {
              resolvedGenericName = concepts[0].name;
            }
          }
        }
      }
    } catch (e) {
      console.error("RxNorm API error (fallback to standard search):", e);
    }

    // Search URLs in priority order based on resolved terms
    const searchUrls = [];
    
    // Priority 1 & 2: If we found a generic ingredient, search OpenFDA by generic name
    if (resolvedGenericName) {
      const formattedGeneric = encodeURIComponent(`"${resolvedGenericName}"`);
      searchUrls.push(`https://api.fda.gov/drug/label.json?search=openfda.generic_name:${formattedGeneric}&limit=1`);
      searchUrls.push(`https://api.fda.gov/drug/label.json?search=openfda.substance_name:${formattedGeneric}&limit=1`);
    }

    // Priority 3: Search by the resolved brand name
    const formattedBrand = encodeURIComponent(`"${resolvedBrandName}"`);
    searchUrls.push(`https://api.fda.gov/drug/label.json?search=openfda.brand_name:${formattedBrand}&limit=1`);
    
    // Priority 4 & 5: Fallbacks using the direct mapped query
    const formattedMapped = encodeURIComponent(`"${mappedQuery}"`);
    searchUrls.push(`https://api.fda.gov/drug/label.json?search=openfda.generic_name:${formattedMapped}&limit=1`);
    searchUrls.push(`https://api.fda.gov/drug/label.json?search="${formattedMapped}"&limit=1`);

    let response;
    for (const url of searchUrls) {
      response = await fetch(url, { next: { revalidate: 3600 } });
      if (response.ok) {
        break;
      }
    }
    
    if (!response || !response.ok) {
      if (response && response.status === 404) return null;
      throw new Error("Failed to fetch medicine data");
    }

    const data = await response.json();
    if (!data.results || data.results.length === 0) return null;

    const result = data.results[0];
    const openfda = result.openfda || {};

    // Helper to safely extract first item from array or return default
    const getFirst = (arr: any[] | undefined, fallback = "Not available") => 
      (arr && arr.length > 0) ? arr[0] : fallback;

    // Helper to extract text from a section that might be an array
    const extractText = (section: string[] | undefined, fallback = "Information not provided.") => {
      if (!section || section.length === 0) return fallback;
      return section[0];
    };

    const extractDosageInfo = (text: string, isAdult: boolean) => {
      if (!text || text === "Information not provided." || text === "") {
        return { amount: isAdult ? "Consult physician" : "Consult pediatrician", gap: "As directed" };
      }
      const amountMatch = text.match(/(\d+(?:\.\d+)?\s*(?:tablet|capsule|mg|ml|drop)s?)/i);
      const gapMatch = text.match(/(every\s+\d+\s+(?:to\s+\d+\s+)?hours?|daily|twice\s+a\s+day|every\s+day)/i);
      
      return {
        amount: amountMatch ? amountMatch[1].toLowerCase() : (isAdult ? "Consult physician" : "Consult pediatrician"),
        gap: gapMatch ? gapMatch[1].toLowerCase() : "As directed"
      };
    };

    // Helper to determine common terms from complex text
    const extractCommonTerms = (generic: string, text: string) => {
      const lower = (generic + " " + text).toLowerCase();
      const terms: string[] = [];
      
      if (lower.includes('pain') || lower.includes('analgesic') || lower.includes('headache')) terms.push('Pain Relief');
      if (lower.includes('fever') || lower.includes('antipyretic')) terms.push('Fever Reduction');
      if (lower.includes('infection') || lower.includes('antibiotic') || lower.includes('bacteria')) terms.push('Treats Bacterial Infection');
      if (lower.includes('acid') || lower.includes('gerd') || lower.includes('heartburn') || lower.includes('ulcer')) terms.push('Reduces Stomach Acid');
      if (lower.includes('allergy') || lower.includes('histamine') || lower.includes('sneezing')) terms.push('Allergy Relief');
      if (lower.includes('cough')) terms.push('Cough Relief');
      if (lower.includes('diabet') || lower.includes('sugar') || lower.includes('glucose')) terms.push('Blood Sugar Control');
      if (lower.includes('blood pressure') || lower.includes('hypertension')) terms.push('Lowers Blood Pressure');
      if (lower.includes('cholesterol') || lower.includes('lipid')) terms.push('Cholesterol Management');
      if (lower.includes('fung') || lower.includes('yeast')) terms.push('Treats Fungal Infection');
      if (lower.includes('asthma') || lower.includes('bronch') || lower.includes('wheezing')) terms.push('Asthma / Breathing Aid');
      if (lower.includes('burn') || lower.includes('wound') || lower.includes('antiseptic')) terms.push('Wound & Burn Care');
      if (lower.includes('nausea') || lower.includes('vomit')) terms.push('Nausea Relief');
      if (lower.includes('inflam') || lower.includes('swell')) terms.push('Reduces Inflammation');
      if (lower.includes('vitamin') || lower.includes('supplement') || lower.includes('deficiency')) terms.push('Nutritional Supplement');
      
      if (terms.length === 0) terms.push('General Medical Treatment');
      return terms;
    };

    const combinedUsesText = extractText(result.indications_and_usage) + " " + extractText(result.purpose);

    // Determine the best display name (prefer OpenFDA generic name, then RxNorm generic name, then brand)
    const displayGenericName = getFirst(openfda.generic_name, getFirst(openfda.substance_name, resolvedGenericName || "Unknown generic name"));
    const displayBrandName = getFirst(openfda.brand_name, resolvedBrandName);

    return {
      brandName: displayBrandName,
      genericName: displayGenericName,
      manufacturer: getFirst(openfda.manufacturer_name, "Unknown manufacturer"),
      category: getFirst(openfda.route, "Oral").toLowerCase(),
      description: extractText(result.description, extractText(result.indications_and_usage)),
      uses: {
        primary: extractText(result.indications_and_usage),
        secondary: "Off-label uses not explicitly listed by FDA.",
        whyPrescribed: extractText(result.purpose),
        commonTerms: extractCommonTerms(displayGenericName, combinedUsesText),
      },
      dosage: {
        child: extractDosageInfo(extractText(result.pediatric_use, ""), false),
        adult: extractDosageInfo(extractText(result.dosage_and_administration, ""), true),
        elderly: extractDosageInfo(extractText(result.geriatric_use, ""), true),
      },
      sideEffects: {
        common: extractText(result.adverse_reactions).split(".").filter(Boolean).slice(0, 4).map(s => s.trim()),
        serious: extractText(result.warnings).split(".").filter(Boolean).slice(0, 3).map(s => s.trim()),
        emergency: ["Difficulty breathing", "Swelling of face/lips", "Severe skin reaction"],
      },
      precautions: {
        food: extractText(result.information_for_patients, "Not specified"),
        pregnancy: extractText(result.pregnancy, "Not specified"),
        driving: extractText(result.warnings_and_cautions, "Not specified"),
        general: extractText(result.warnings, "Not specified"),
      }
    };
  } catch (error) {
    console.error("Error fetching from OpenFDA:", error);
    return null;
  }
}
