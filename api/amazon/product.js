import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

/*
  Config Vercel (Node runtime + region vicina + maxDuration già in vercel.json)
*/
export const config = {
  runtime: "nodejs",
  regions: ["fra1"],
};

// Riusa il browser tra invocazioni (riduce cold start)
let browserPromise;

/**
 * Avvia (o riusa) un browser headless ottimizzato per Vercel
 */
async function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      args: [
        ...chromium.args,
        "--hide-scrollbars",
        "--disable-web-security",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  }
  return browserPromise;
}

/**
 * Fallback leggero: tenta un semplice fetch HTML e parse naive (title + prezzo)
 */
async function lightweightFetch(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0 Safari/537.36",
        "Accept-Language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      method: "GET",
    });
    const html = await res.text();

    const titleMatch = html.match(/id="productTitle"[^>]*>([^<]+)</);
    const offscreenMatch = html.match(/class="a-offscreen">([^<]+)</);
    let title = titleMatch ? titleMatch[1].trim() : "Prodotto non trovato";
    let rawPrice = offscreenMatch ? offscreenMatch[1].trim() : "0";

    // Normalizza prezzo
    const price = parsePrice(rawPrice);

    return {
      title,
      price,
      specifications: [],
      imageUrl: undefined,
      _lightweight: true,
    };
  } catch (error) {
    console.error("[LIGHTWEIGHT] Error:", error.message);
    return null;
  }
}

/**
 * Parsing avanzato dei prezzi con validazione
 */
function parsePrice(priceText) {
  if (!priceText) return 0;

  let cleaned = priceText.replace(/[^\d.,]/g, "");
  if (!cleaned) return 0;

  // Gestione formato misto (punto e virgola)
  if (cleaned.includes(".") && cleaned.includes(",")) {
    if (cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")) {
      // Formato europeo: 1.234,56
      cleaned = cleaned.replace(/\./g, "").replace(",", ".");
    } else {
      // Formato americano: 1,234.56
      cleaned = cleaned.replace(/,/g, "");
    }
  } else if (cleaned.includes(",")) {
    const parts = cleaned.split(",");
    if (parts[parts.length - 1].length === 2) {
      // Probabilmente decimali: 1234,56 -> 1234.56
      cleaned = parts.join(".");
    } else {
      // Probabilmente migliaia: 1,234 -> 1234
      cleaned = cleaned.replace(/,/g, "");
    }
  } else if (cleaned.includes(".")) {
    const parts = cleaned.split(".");
    if (parts[parts.length - 1].length !== 2) {
      // Probabilmente migliaia: 1.234 -> 1234
      cleaned = parts.join("");
    }
  }

  const price = parseFloat(cleaned);

  // Validazione range ragionevole (1€ - 50,000€)
  if (isNaN(price) || price < 1 || price > 50000) {
    console.warn(`[PRICE_PARSER] Prezzo sospetto: ${priceText} -> ${price}`);
    return 0;
  }

  return price;
}

/**
 * Utility per aspettare con Promise
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class AmazonScraper {
  async scrapeProduct(url) {
    const browser = await getBrowser();
    const page = await browser.newPage();

    // Injetta parsePrice PRIMA della navigazione
    await page.evaluateOnNewDocument(() => {
      window.parsePrice = function (priceText) {
        if (!priceText) return 0;

        let cleaned = priceText.replace(/[^\d.,]/g, "");
        if (!cleaned) return 0;

        if (cleaned.includes(".") && cleaned.includes(",")) {
          if (cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")) {
            cleaned = cleaned.replace(/\./g, "").replace(",", ".");
          } else {
            cleaned = cleaned.replace(/,/g, "");
          }
        } else if (cleaned.includes(",")) {
          const parts = cleaned.split(",");
          if (parts[parts.length - 1].length === 2) {
            cleaned = parts.join(".");
          } else {
            cleaned = cleaned.replace(/,/g, "");
          }
        } else if (cleaned.includes(".")) {
          const parts = cleaned.split(".");
          if (parts[parts.length - 1].length !== 2) {
            cleaned = parts.join("");
          }
        }

        const price = parseFloat(cleaned);
        return isNaN(price) || price < 1 || price > 50000 ? 0 : price;
      };
    });

    // Blocca risorse pesanti per velocizzare
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const type = req.resourceType();
      if (["image", "stylesheet", "font", "media"].includes(type)) {
        return req.abort();
      }
      req.continue();
    });

    try {
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0 Safari/537.36"
      );
      await page.setExtraHTTPHeaders({
        "Accept-Language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
      });

      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 20000,
      });

      await delay(800);

      const productData = await page.evaluate(() => {
        const pickText = (selectors) => {
          for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el && el.textContent) {
              const t = el.textContent.trim();
              if (t.length > 3) return t;
            }
          }
          return null;
        };

        // Estrazione titolo
        let title =
          pickText([
            "#productTitle",
            ".product-title",
            "h1 span",
            ".a-size-large",
          ]) || "Prodotto non trovato";

        // Selettori aggiornati per prezzi scontati e offerte
        const priceSelectors = [
          // Selettori specifici per prodotti con sconti pesanti
          ".a-price-deal .a-offscreen",
          ".a-price-strike .a-offscreen",
          ".a-price-savings .a-offscreen",
          ".apexPriceToPay .a-offscreen",
          ".a-price-to-pay .a-offscreen",

          // Selettori per layout di offerte speciali
          '[data-cy="price-recipe"] .a-offscreen',
          ".reinventPriceAccordionHeaderPillDivider + .a-price .a-offscreen",

          // Prezzi scontati (più priorità) - esistenti
          ".a-price.a-text-price.a-size-medium.apexPriceToPay .a-offscreen",
          ".a-price.a-text-price.a-size-medium.a-color-price .a-offscreen",
          ".a-price.a-text-normal .a-offscreen",
          ".a-price-current .a-offscreen",

          // Prezzi scontati (più priorità)
          ".a-price.a-text-price.a-size-medium.apexPriceToPay .a-offscreen",
          ".a-price.a-text-price.a-size-medium.a-color-price .a-offscreen",
          ".a-price.a-text-normal .a-offscreen",
          ".a-price-current .a-offscreen",

          // Prezzi standard
          "#priceblock_dealprice",
          "#priceblock_ourprice",
          ".a-price.a-price--base .a-offscreen",

          // Selettori generici come fallback
          ".a-price .a-offscreen",
          "#price_inside_buybox",
          ".a-price-range .a-price .a-offscreen",
          ".a-price-whole",
          '[data-testid="price-current"]',

          // Selettori per layout specifici
          ".a-section .a-price .a-offscreen",
          "[data-a-color='price'] .a-offscreen",
          ".a-text-price .a-offscreen",
        ];

        // Raccoglie tutti i prezzi trovati per debug e validazione
        const foundPrices = [];

        for (const selector of priceSelectors) {
          const elements = document.querySelectorAll(selector);
          elements.forEach((el) => {
            if (el && el.textContent) {
              const priceText = el.textContent.trim();

              if (priceText && priceText.length > 0) {
                console.log(
                  `[DEBUG] Found price text: "${priceText}" with selector: ${selector}`
                );

                const parsed = window.parsePrice
                  ? window.parsePrice(priceText)
                  : 0;
                if (parsed > 0 && parsed < 50000) {
                  foundPrices.push({
                    selector,
                    text: priceText,
                    parsed,
                  });
                }
              }
            }
          });
        }

        // Logica di selezione del prezzo migliore
        let bestPrice = 0;
        if (foundPrices.length > 0) {
          console.log(
            `[DEBUG] Found ${foundPrices.length} valid prices:`,
            foundPrices
          );

          // Prendi il primo prezzo valido (i selettori sono ordinati per priorità)
          bestPrice = foundPrices[0].parsed;
        } else {
          console.log(
            "[DEBUG] No prices found with selectors, trying fallback..."
          );

          // Fallback: cerca qualsiasi testo che assomiglia a un prezzo
          const allText = document.body.innerText || "";
          const priceMatches = allText.match(
            /€\s*[\d]{1,4}[.,][\d]{2}|[\d]{1,4}[.,][\d]{2}\s*€|€\s*[\d]{2,4}(?=[^\d])|[\d]{2,4}(?=\s*€)/g
          );

          if (priceMatches) {
            console.log(
              `[DEBUG] Fallback found price candidates:`,
              priceMatches
            );
            for (const match of priceMatches) {
              const parsed = window.parsePrice ? window.parsePrice(match) : 0;
              // Range più specifico per CPU premium
              if (parsed > 100 && parsed < 2000) {
                bestPrice = parsed;
                foundPrices.push({
                  selector: "fallback-text-search",
                  text: match,
                  parsed: parsed,
                });
                break;
              }
            }
          }
        }

        // Estrazione specifiche (resto del codice rimane uguale)
        const specs = [];

        // Feature bullets
        document
          .querySelectorAll(
            "#feature-bullets ul li span, .a-unordered-list .a-list-item"
          )
          .forEach((b) => {
            const txt = b.innerText?.trim();
            if (
              txt &&
              txt.length > 10 &&
              txt.length < 200 &&
              !/Visualizza|Mostra|Clicca|Scopri/i.test(txt) &&
              specs.length < 6
            ) {
              specs.push(txt);
            }
          });

        // Technical specifications table
        document
          .querySelectorAll(
            "#productDetails_techSpec_section_1 tr, #productDetails_detailBullets_sections1 tr"
          )
          .forEach((row) => {
            if (specs.length >= 8) return;
            const label = row
              .querySelector("td:first-child, th:first-child")
              ?.textContent?.trim();
            const value = row
              .querySelector("td:last-child")
              ?.textContent?.trim();
            if (label && value && label.length < 50 && value.length < 100) {
              specs.push(`${label}: ${value}`);
            }
          });

        // Estrazione immagine
        let imageUrl = "";
        const imageSelectors = [
          "#landingImage",
          "#imgTagWrapperId img",
          ".a-dynamic-image",
          "[data-old-hires]",
          ".a-spacing-small img",
        ];

        for (const sel of imageSelectors) {
          const el = document.querySelector(sel);
          if (el && el.src && el.src.startsWith("http")) {
            imageUrl = el.src;
            break;
          }
          if (el && el.getAttribute && el.getAttribute("data-old-hires")) {
            imageUrl = el.getAttribute("data-old-hires");
            break;
          }
        }

        return {
          title,
          price: bestPrice,
          specifications: specs,
          imageUrl,
          _debug: {
            foundPrices: foundPrices.map((p) => ({
              selector: p.selector,
              text: p.text,
              parsed: p.parsed,
            })),
          },
        };
      });

      return productData;
    } catch (err) {
      console.error("[SCRAPER] Puppeteer error:", err?.message);

      // Fallback leggero in caso di errore
      const fallback = await lightweightFetch(url);
      if (fallback) {
        console.warn("[SCRAPER] Using lightweight fallback");
        return fallback;
      }

      throw new Error("Impossibile recuperare i dati del prodotto");
    } finally {
      try {
        await page.close();
      } catch (closeError) {
        console.warn("[SCRAPER] Error closing page:", closeError.message);
      }
    }
  }
}

// Handler principale per Vercel
export default async function handler(req, res) {
  // Headers CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { url } = req.body || {};

    // Validazione URL Amazon migliorata
    const isValidAmazonUrl =
      url &&
      typeof url === "string" &&
      (url.includes("amazon.") ||
        url.includes("amzn.") ||
        url.includes("a.co")) &&
      (url.startsWith("http://") || url.startsWith("https://"));

    if (!isValidAmazonUrl) {
      return res.status(400).json({
        error: "URL Amazon non valido",
        received: url,
      });
    }

    // Flag debug per bypass (facoltativo)
    if (process.env.AMAZON_SCRAPER_DEBUG === "1") {
      return res.json({
        title: "DEBUG MODE PRODUCT",
        price: 99.99,
        specifications: ["Debug spec A", "Debug spec B"],
        imageUrl: "",
        _debug: true,
      });
    }

    console.log("[SCRAPER] Processing URL:", url);

    const scraper = new AmazonScraper();
    const productInfo = await scraper.scrapeProduct(url);

    console.log("[SCRAPER] Success:", {
      title: productInfo.title,
      price: productInfo.price,
      foundPrices: productInfo._debug?.foundPrices?.length || 0,
    });

    res.json(productInfo);
  } catch (error) {
    console.error("[SCRAPER] Final error:", error?.message || error);
    res.status(500).json({
      error: "Errore nel recupero dei dati",
      details: error?.message || "Unknown error",
    });
  }
}
