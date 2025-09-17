/* Heuristic + dynamic scoring Amazon title normalizer */
import { ComponentCategory } from "@/interfaces/builds";

const BRAND_LIST = [
  "amd","intel","nvidia","msi","asus","gigabyte","asrock","corsair","kingston",
  "crucial","samsung","seagate","western","wd","nzxt","fractal","be quiet!",
  "lian","cooler","evga","thermaltake","antec","phanteks","lenovo","dell","hp"
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
  try { localStorage.setItem(FREQ_KEY, JSON.stringify(map)); } catch {}
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

/* Pattern estrazione per categorie */
function extractModelPatterns(tokens: string[], category?: ComponentCategory): string[] {
  const joined = tokens.join(" ");
  const found: string[] = [];

  // CPU
  if (category === ComponentCategory.CPU) {
    const m1 = joined.match(/\b(Ryzen\s+\d{3,5}X?(\s?(\d+)?))\b/i);
    if (m1) found.push(m1[1]);
    const m2 = joined.match(/\b(Core\s+i[3579]-\d{3,5}[A-Z]{0,2})\b/i);
    if (m2) found.push(m2[1]);
  }

  // GPU
  if (category === ComponentCategory.GPU) {
    const g = joined.match(/\b(RTX|GTX|RX)\s?\d{3,4}(?:\s?(SUPER|TI|XT))?/i);
    if (g) found.push(g[0].replace(/\s+/, " "));
  }

  // RAM
  if (category === ComponentCategory.MEMORY) {
    const r = joined.match(/\b(\d{2,4}gb)\b.*\b(ddr[3455])\b.*?(?:\b(\d{3,5})mhz\b)?/i);
    if (r) found.push([r[1], r[2], r[3] ? r[3] + "MHz" : ""].filter(Boolean).join(" "));
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
  "for","con","per","version","versione","nuovo","new","with","and","the","di",
  "da","per","pc","desktop","gaming","kit","set","original","originale","high",
  "alta","prestazioni","performance","premium","ufficiale","official","serie","series"
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