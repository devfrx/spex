/* Heuristic + dynamic scoring Amazon title normalizer */
import { ComponentCategory } from "@/interfaces/builds";

const BRAND_LIST = [
  "amd", "intel", "nvidia", "msi", "asus", "gigabyte", "asrock", "corsair", "kingston",
  "crucial", "samsung", "seagate", "western", "wd", "nzxt", "fractal", "be quiet!",
  "lian", "cooler", "evga", "thermaltake", "antec", "phanteks", "lenovo", "dell", "hp"
];

// Persistenza frequenze per stopwords dinamiche
const FREQ_KEY = "__title_token_freq__";
interface FreqMap { [token: string]: number; }
function loadFreq(): FreqMap {
  try {
    return JSON.parse(localStorage.getItem(FREQ_KEY) || "{}");
  } catch { return {}; }
}
function saveFreq(map: FreqMap) {
  try { localStorage.setItem(FREQ_KEY, JSON.stringify(map)); } catch { }
}
const freqCache = loadFreq();

function registerTokens(raw: string) {
  const toks = tokenize(raw);
  toks.forEach(t => {
    if (t.length < 3) return;
    freqCache[t] = (freqCache[t] || 0) + 1;
  });
  saveFreq(freqCache);
}

function tokenize(raw: string): string[] {
  return raw
    .toLowerCase()
    .replace(/[@™,®]/g, " ")
    .replace(/[^a-z0-9+\-./ ]/gi, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function isBrandToken(t: string): boolean {
  return BRAND_LIST.includes(t.replace(/[^a-z]/g, ""));
}

function pickBrand(tokens: string[]): string | null {
  if (tokens.length === 0) return null;
  // Prima word se brand
  if (isBrandToken(tokens[0])) return capitalize(tokens[0]);
  // Fallback: trova primo brand nel titolo
  const found = tokens.find(isBrandToken);
  return found ? capitalize(found) : null;
}

function capitalize(s: string) {
  return s.length < 2 ? s.toUpperCase() : s[0].toUpperCase() + s.slice(1);
}

function extractModelPatterns(tokens: string[], category?: ComponentCategory): string[] {
  const joined = tokens.join(" ");
  const found: string[] = [];

  // CPU
  if (category === ComponentCategory.CPU) {
    // Intel: prefer parts (family + number) e fallback generico
    const intelParts = joined.match(/\b(?:intel\s+)?(?:core(?:\s+processor)?\s+)?(i[3579])[\s-]?(\d{3,5}[A-Za-z]{0,2})\b/i);
    if (intelParts) {
      found.push((intelParts[1] + " " + intelParts[2]).replace(/\s+/g, " ").trim());
    } else {
      const intelAny = joined.match(/\b(?:intel\s+)?(?:core(?:\s+processor)?\s+)?(i[3579][\s-]?\d{3,5}[A-Za-z]{0,2})\b/i);
      if (intelAny) found.push(intelAny[1].replace(/\s+/g, " ").trim());
    }

    // Ryzen: supporta forme come "Ryzen 9 9900X" o "Ryzen 9900X"
    const ryzen = joined.match(/\b(Ryzen(?:\s*\d)?[\s-]?\d{3,4}[A-Za-z]{0,2})\b/i);
    if (ryzen) found.push(ryzen[1].replace(/\s+/g, " ").trim());

    // Compact cores/threads formato "16C/32T"
    const compactCT = joined.match(/(\d{1,2})\s*[Cc]\s*\/\s*(\d{1,3})\s*[Tt]/i);
    if (compactCT) found.push(`${compactCT[1]}C/${compactCT[2]}T`);

    // Cores e threads separati (fallback)
    const coresMatch = joined.match(/(\d{1,2})\s*(?:-?\s*cores?\b|core\b|\bC\b)/i);
    const threadsMatch = joined.match(/(\d{1,3})\s*(?:threads?|T)\b/i);
    if (coresMatch || threadsMatch) {
      const c = coresMatch ? `${coresMatch[1]}C` : null;
      const t = threadsMatch ? `${threadsMatch[1]}T` : null;
      const combo = [c, t].filter(Boolean).join("/");
      if (combo) found.push(combo);
    }

    // Frequenze: base/boost o il valore massimo trovato
    const baseBoost = joined.match(/(?:base[:\s]*)?(\d+(?:[.,]\d+)?)(?:\s*ghz)\s*(?:[\/\-to]+\s*(?:boost[:\s]*)?(\d+(?:[.,]\d+)?)(?:\s*ghz)?)?/i);
    if (baseBoost) {
      const base = baseBoost[1].replace(",", ".");
      const boost = baseBoost[2] ? baseBoost[2].replace(",", ".") : null;
      if (boost) found.push(`${base}GHz/${boost}GHz`);
      else found.push(`${base}GHz`);
    } else {
      const ghzAll = [...joined.matchAll(/(\d+(?:[.,]\d+)?)(?:\s*ghz)/gi)].map(m => m[1].replace(",", "."));
      if (ghzAll.length) {
        const maxGHz = ghzAll.reduce((a, b) => (parseFloat(a) > parseFloat(b) ? a : b));
        found.push(`${maxGHz}GHz`);
      }
    }
  }

  // GPU (estrazione estesa: modello completo, memoria, clock, bus)
  if (category === ComponentCategory.GPU) {
    // full-ish model: capture RTX/GTX/RX + optional variant + up to 4 trailing words (VENTUS 2X XS 8G OC)
    const gpuFull = joined.match(/\b((?:nvidia\s+)?(?:geforce|radeon)?\s*(?:rtx|gtx|rx)\s?\d{3,4}(?:\s*(?:super|ti|xt))?(?:\s+[A-Za-z0-9\-]+){0,4})/i);
    if (gpuFull) {
      found.push(gpuFull[1].replace(/\s+/g, " ").trim());
    } else {
      const g = joined.match(/\b(RTX|GTX|RX)\s?\d{3,4}(?:\s?(SUPER|TI|XT))?/i);
      if (g) found.push(g[0].replace(/\s+/g, " ").trim());
    }

    // Memoria: es. "8GB GDDR6", "8G", "12GB GDDR6X"
    const mem = joined.match(/(\d{1,2})\s*(GB|G)\s*(GDDR[46X]?|HBM2E?|LPDDR[34])?/i);
    if (mem) {
      const size = mem[1] + "GB";
      const type = mem[3] ? (" " + mem[3].toUpperCase()) : "";
      found.push((size + type).trim());
    } else {
      // fallback small form like "8G OC"
      const memShort = joined.match(/\b(\d{1,2})G\b/i);
      if (memShort) found.push(memShort[1] + "GB");
    }

    // Clock (MHz) - prendi il valore più alto trovato
    const mhzMatches = [...joined.matchAll(/(\d{3,5}(?:[.,]\d+)?)\s*mhz/gi)].map(m => m[1].replace(",", "."));
    if (mhzMatches.length) {
      const maxMHz = mhzMatches.reduce((a, b) => (parseFloat(a) > parseFloat(b) ? a : b));
      found.push(maxMHz + "MHz");
    }

    // Bus width es. "128-bit" o "128 bit"
    const bus = joined.match(/(\d{2,4})\s*-\s*bit|\b(\d{2,4})\s*bit\b/i);
    if (bus) {
      const w = (bus[1] || bus[2]);
      found.push(w + "bit");
    }
  }

  if (category === ComponentCategory.MOTHERBOARD) {
    // full model (brand + model words, stop at punctuation or long tail)
    const mbFull = joined.match(/\b(?:gigabyte|asus|msi|asrock|biostar|evga|foxconn|gigabyte|msi)\b[^\-\,\(]{1,40}/i);
    if (mbFull) found.push(mbFull[0].trim());

    // chipset (common families)
    const chipset = joined.match(/\b(X670E|X670|B650|B760|Z790|Z690|H610|B560|Z590|B460|H410|H510|Z490|B450|X470|Z390)\b/i);
    if (chipset) found.push(chipset[0].toUpperCase());

    // socket (LGA/AM)
    const socket = joined.match(/\b(LGA\d{3,4}|AM4|AM5)\b/i);
    if (socket) found.push(socket[0].toUpperCase());

    // memory type and optional max MHz ("DDR4", "DDR5", "7600 MHz")
    const memType = joined.match(/\b(DDR[45])\b/i);
    const memMHz = joined.match(/fino a\s*(\d{3,4})\s*mhz|(\d{3,4})\s*mhz/i);
    if (memType) {
      const mhz = memMHz ? ` ${(memMHz[1] || memMHz[2])}MHz` : "";
      found.push(memType[1].toUpperCase() + mhz);
    }

    // M.2 count (es. "1x M.2", "2x PCIe 4.0 M.2")
    const m2 = joined.match(/(\d)\s*x?\s*(?:pci[e\sa-z0-9]*\s*)?m\.2/i);
    if (m2) found.push(`${m2[1]}x M.2`);

    // PCIe / Gen
    const pcie = joined.match(/\b(PCIe\s*5\.0|PCIe\s*4\.0|PCI Express Gen \d|PCIe\s*\d)\b/i);
    if (pcie) found.push(pcie[0].replace(/pci express/ig, "PCIe"));

    // Networking / WiFi
    const wifi = joined.match(/\b(WIFI\s*6E|WIFI\s*6|WiFi\s*6E|WiFi\s*6)\b/i);
    if (wifi) found.push(wifi[0].toUpperCase());

    const lan = joined.match(/\b(Realtek|Intel)[^\.,]{0,30}\b(?:1Gb|GbE|2\.5G|2\.5Gb|10Gb)/i);
    if (lan) found.push((lan && lan[0] ? lan[0].trim() : ""));
  }

  // RAM
  if (category === ComponentCategory.MEMORY) {
    // totale kit (es. "32GB")
    const total = joined.match(/\b(\d{2,4}\s*GB)\b/i);
    if (total) found.push(total[1].toUpperCase().replace(/\s+/g, ""));

    // forma kit (es. "(2 x 16GB)" o "2x16GB")
    const kitMatch = joined.match(/\((\d+)\s*[x×]\s*(\d{1,4}\s*GB)\)/i) || joined.match(/\b(\d+)\s*[x×]\s*(\d{1,4}\s*GB)\b/i);
    if (kitMatch) found.push(`${kitMatch[1]}x${kitMatch[2].toUpperCase().replace(/\s+/g, "")}`);

    // tipo DDR
    const memType = joined.match(/\b(DDR[45])\b/i);
    if (memType) found.push(memType[1].toUpperCase());

    // frequenza (MT/s o MHz) - mantiene unità
    const freq = joined.match(/(\d{3,5})\s*(MT\/s|MTs|MHz)/i);
    if (freq) found.push(`${freq[1]}${freq[2].toUpperCase()}`);

    // CL latency (es. CL30)
    const cl = joined.match(/\bCL\s*([0-9]{1,2})\b/i);
    if (cl) found.push(`CL${cl[1]}`);

    // Profilo/overclock (EXPO / XMP)
    const profile = joined.match(/\b(EXPO|XMP)\b/i);
    if (profile) found.push(profile[1].toUpperCase());

    // RGB / colore / design
    const rgb = joined.match(/\b(RGB)\b/i);
    if (rgb) found.push("RGB");

    // Form factor (UDIMM / SO-DIMM)
    const form = joined.match(/\b(UDIMM|SO-DIMM|DIMM)\b/i);
    if (form) found.push(form[1].toUpperCase());

    // codice modello / SKU (token alfanumerico lungo)
    const longCodes = [...joined.matchAll(/\b([A-Z0-9\-]{6,})\b/ig)].map(m => m[1]);
    if (longCodes.length) {
      // prendi l'ultimo token lungo che sembra uno SKU
      const sku = longCodes.reverse().find(t => /[A-Z0-9]/.test(t));
      if (sku) found.push(sku.toUpperCase());
    }

    // costruiamo una sintesi compatta (se possibile)
    const compactParts = [];
    if (total) compactParts.push(total[1].toUpperCase().replace(/\s+/g, ""));
    if (kitMatch) compactParts.push(`${kitMatch[1]}x${kitMatch[2].toUpperCase().replace(/\s+/g, "")}`);
    if (memType) compactParts.push(memType[1].toUpperCase());
    if (freq) compactParts.push(`${freq[1]}${freq[2].toUpperCase()}`);
    if (cl) compactParts.push(`CL${cl[1]}`);
    if (compactParts.length) found.push(compactParts.join(" "));
  }

  // Storage
  if (category === ComponentCategory.STORAGE_PRIMARY || category === ComponentCategory.STORAGE_SECONDARY) {
    const st = joined.match(/\b(\d+(?:tb|gb))\b.*\b(nvme|ssd|m\.2)\b/i);
    if (st) found.push(st[1].toUpperCase() + " " + st[2].toUpperCase());
  }

  // PSU
  if (category === ComponentCategory.PSU) {
    const psu = joined.match(/\b(\d{3,4})w\b.*\b(80\+\s?(gold|bronze|platinum|titanium))\b/i);
    if (psu) found.push(psu[1] + "W " + psu[2].toUpperCase().replace(/\s+/g, ""));
  }

  // Case (heuristic: prime 2-3 token capitalizzati originali se non rumore)
  if (category === ComponentCategory.CASE) {
    const rawWords = joined.split(/\s+/);
    const candidate = rawWords.slice(0, 4).filter(w => /^[A-Za-z0-9-]{2,}$/.test(w)).join(" ");
    if (candidate.length > 4) found.push(candidate);
  }

  return Array.from(new Set(found));
}

const BASE_STOP = new Set([
  "for", "con", "per", "version", "versione", "nuovo", "new", "with", "and", "the", "di",
  "da", "per", "pc", "desktop", "gaming", "kit", "set", "original", "originale", "high",
  "alta", "prestazioni", "performance", "premium", "ufficiale", "official", "serie", "series"
]);

/* Dynamic scoring */
function scoreToken(token: string, category?: ComponentCategory): number {
  let score = 0;
  if (isBrandToken(token)) score += 8;
  if (/^\d{3,5}w$/.test(token)) score += 7;
  if (/^\d+(gb|tb)$/.test(token)) score += 9;
  if (/^ddr\d$/.test(token)) score += 8;
  if (/^\d{3,5}mhz$/.test(token)) score += 6;
  if (/^(rtx|gtx|rx)\d{3,4}(super|ti|xt)?$/.test(token)) score += 15;
  if (/^ryzen$/.test(token) || /^core$/.test(token)) score += 10;
  if (/^i[3579]-\d{3,5}[a-z]{0,2}$/.test(token)) score += 12;
  if (/^m\.2$/.test(token) || /^nvme$/.test(token)) score += 7;
  if (/^80\+(gold|bronze|platinum|titanium)$/.test(token)) score += 10;

  // Penalizza token troppo frequenti (dinamico)
  const freq = freqCache[token] || 0;
  if (freq > 10) score -= Math.min(6, Math.floor(freq / 25) + 2);

  if (BASE_STOP.has(token)) score -= 8;
  if (token.length <= 2) score -= 4;

  return score;
}

function postProcess(str: string): string {
  return str
    .replace(/\b(tb|gb)\b/gi, (m) => m.toUpperCase())
    .replace(/\bddr(\d)\b/gi, (m, d) => "DDR" + d)
    .replace(/\b(ryzen|core|intel|amd|nvidia)\b/gi, (m) => capitalize(m.toLowerCase()))
    .replace(/\b(rtx|gtx|rx)\b/gi, (m) => m.toUpperCase())
    .replace(/\b(m\.2|nvme)\b/gi, (m) => m.toUpperCase())
    .replace(/\b(80\+)(gold|bronze|platinum|titanium)\b/gi, (_, a, b) => a + b.toUpperCase())
    .replace(/\s+/g, " ")
    .trim();
}

export function shortenProductTitle(
  raw: string,
  category?: ComponentCategory,
  maxLen = 42
): string {
  if (!raw) return "Component";
  registerTokens(raw);

  const tokens = tokenize(raw);
  const brand = pickBrand(tokens);

  const modelPatterns = extractModelPatterns(tokens, category);

  // Scoring tokens
  const scored = tokens.map(t => ({
    t,
    s: scoreToken(t, category)
  }));

  // Se abbiamo pattern modello robusti, li usiamo come base
  let parts: string[] = [];
  if (brand) parts.push(brand);

  if (modelPatterns.length) {
    parts.push(...modelPatterns);
  } else {
    // Prendi top tokens distinti per punteggio > soglia
    const selected = scored
      .filter(o => o.s > 0)
      .sort((a, b) => b.s - a.s)
      .map(o => o.t)
      .slice(0, 6);

    parts.push(...selected.map(p => p.toUpperCase().startsWith("RTX") ? p.toUpperCase() : p));
  }

  // Rimuovi duplicati & stopwords finali
  const seen = new Set<string>();
  parts = parts
    .join(" ")
    .split(/\s+/)
    .filter(w => {
      const lw = w.toLowerCase();
      if (BASE_STOP.has(lw)) return false;
      if (seen.has(lw)) return false;
      seen.add(lw);
      return true;
    });

  let candidate = postProcess(parts.join(" "));

  // Aggiungi info dimensione / speed se manca e c'è spazio
  if (candidate.length < maxLen - 6) {
    const extra = tokens.find(t => /^\d{2,4}mhz$/.test(t) || /^\d+(gb|tb)$/.test(t));
    if (extra && !candidate.toLowerCase().includes(extra.toLowerCase())) {
      candidate += " " + postProcess(extra);
    }
  }

  // Abbreviazioni smart
  candidate = candidate
    .replace(/\bGigabyte\b/g, "Giga")
    .replace(/\bWestern Digital\b/gi, "WD")
    .replace(/\bSolid State Drive\b/gi, "SSD");

  if (candidate.length > maxLen) {
    const soft = candidate.slice(0, maxLen + 5);
    const cut = soft.slice(0, soft.lastIndexOf(" "));
    candidate = (cut.length >= maxLen * 0.6 ? cut : candidate.slice(0, maxLen)).trim() + "...";
  }

  return candidate || "Component";
}