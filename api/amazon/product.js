import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

/*
  Config Vercel (Node runtime + region vicina + maxDuration già in vercel.json)
  Puoi anche spostare maxDuration qui se preferisci mantenere single‑source.
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
      // Amazon blocca HEAD spesso
      method: "GET",
    });
    const html = await res.text();

    const titleMatch = html.match(/id="productTitle"[^>]*>([^<]+)</);
    const offscreenMatch = html.match(/class="a-offscreen">([^<]+)</);
    let title = titleMatch ? titleMatch[1].trim() : "Prodotto non trovato";
    let rawPrice = offscreenMatch ? offscreenMatch[1].trim() : "0";

    // Normalizza prezzo
    let cleaned = rawPrice.replace(/[^\d.,]/g, "");
    if (cleaned.includes(".") && cleaned.includes(",")) {
      if (cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")) {
        cleaned = cleaned.replace(/\./g, "").replace(",", ".");
      } else {
        cleaned = cleaned.replace(/,/g, "");
      }
    } else if (cleaned.includes(",")) {
      const parts = cleaned.split(",");
      if (parts[parts.length - 1].length === 2) cleaned = parts.join(".");
      else cleaned = cleaned.replace(/,/g, "");
    } else if (cleaned.includes(".")) {
      const parts = cleaned.split(".");
      if (parts[parts.length - 1].length !== 2) cleaned = parts.join("");
    }

    const price = parseFloat(cleaned) || 0;

    return {
      title,
      price,
      specifications: [],
      imageUrl: undefined,
      _lightweight: true,
    };
  } catch {
    return null;
  }
}

class AmazonScraper {
  async scrapeProduct(url) {
    let page;
    try {
      const browser = await getBrowser();
      page = await browser.newPage();

      // Blocca risorse pesanti
      await page.setRequestInterception(true);
      page.on("request", (req) => {
        const type = req.resourceType();
        if (["image", "stylesheet", "font", "media"].includes(type)) {
          return req.abort();
        }
        req.continue();
      });

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

      // Accetta cookie banner se presente (Amazon EU)
      try {
        await page.evaluate(() => {
          const btn =
            document.querySelector("#sp-cc-accept") ||
            document.querySelector('input[name="accept"]');
          if (btn) (btn).click();
        });
      } catch {}

      await Promise.race([
        page.waitForSelector("#feature-bullets", { timeout: 4000 }),
        page.waitForSelector("#detailBullets_feature_div", { timeout: 4000 }),
        page.waitForSelector("#productDetails_techSpec_section_1", { timeout: 4000 }),
        page.waitForSelector("#productDetails_techSpec_section_2", { timeout: 4000 }),
        page.waitForTimeout(2000),
      ]);

      await page.waitForTimeout(600);

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

        let title =
          pickText(["#productTitle", ".product-title", "h1 span", ".a-size-large"]) ||
          "Prodotto non trovato";

        // Prezzo
        const priceSelectors = [
          ".a-price .a-offscreen",
          "#price_inside_buybox",
          ".a-price-range .a-price .a-offscreen",
          ".a-price-whole",
          '[data-testid="price-current"]',
        ];
        let rawPrice = "0";
        for (const sel of priceSelectors) {
          const el = document.querySelector(sel);
          const txt = el?.textContent?.trim();
          if (txt && txt.length > 0) {
            rawPrice = txt;
            break;
          }
        }
        let cleaned = rawPrice.replace(/[^\d.,]/g, "");
        if (cleaned.includes(".") && cleaned.includes(",")) {
          if (cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")) {
            cleaned = cleaned.replace(/\./g, "").replace(",", ".");
          } else {
            cleaned = cleaned.replace(/,/g, "");
          }
        } else if (cleaned.includes(",")) {
          const parts = cleaned.split(",");
          if (parts[parts.length - 1].length === 2) cleaned = parts.join(".");
          else cleaned = cleaned.replace(/,/g, "");
        } else if (cleaned.includes(".")) {
          const parts = cleaned.split(".");
          if (parts[parts.length - 1].length !== 2) cleaned = parts.join("");
        }
        const price = parseFloat(cleaned) || 0;

        // Specifiche
        const specs = [];
        document
          .querySelectorAll("#feature-bullets ul li span, #featurebullets_feature_div ul li span")
          .forEach((b) => {
            const txt = b.textContent?.trim();
            if (txt && txt.length > 10 && !/Visualizza|Mostra/i.test(txt) && specs.length < 8) {
              specs.push(txt);
            }
          });

        document
          .querySelectorAll("#detailBullets_feature_div li span.a-list-item")
          .forEach((li) => {
            if (specs.length >= 8) return;
            const txt = li.textContent?.replace(/\s+/g, " ").trim() || "";
            if (txt.includes(":") && txt.length > 6 && txt.length < 140) {
              specs.push(txt);
            }
          });

        document
          .querySelectorAll(
            "#productDetails_techSpec_section_1 tr, #productDetails_techSpec_section_2 tr, #productDetails_detailBullets_sections1 tr"
          )
          .forEach((row) => {
            if (specs.length >= 8) return;
            const label = row.querySelector("th, td:first-child")?.textContent?.trim();
            const value = row.querySelector("td:last-child")?.textContent?.trim();
            if (label && value && label.length < 50) {
              specs.push(`${label}: ${value}`);
            }
          });

        // Immagine
        let imageUrl = "";
        const img =
          document.querySelector("#landingImage") ||
          document.querySelector("#imgTagWrapperId img") ||
          document.querySelector(".a-dynamic-image");
        if (img) {
          const src = img.getAttribute("src") || "";
          const oldHires = img.getAttribute("data-old-hires") || "";
          const dynamic = img.getAttribute("data-a-dynamic-image") || "";
          if (src) imageUrl = src;
          else if (oldHires) imageUrl = oldHires;
          else if (dynamic) {
            try {
              const obj = JSON.parse(dynamic);
              const first = Object.keys(obj)[0];
              if (first) imageUrl = first;
            } catch {}
          }
        }

        return {
          title,
          price,
          specifications: specs.slice(0, 8),
          imageUrl,
        };
      });

      return productData;
    } catch (err) {
      console.error("[SCRAPER] Launch/Run error:", err?.message || err);
      // Fallback leggero anche se fallisce il launch
      const fallback = await lightweightFetch(url);
      if (fallback) {
        console.warn("[SCRAPER] Using lightweight fallback (launch/run failure)");
        return fallback;
      }
      throw err;
    } finally {
      if (page) {
        try {
          await page.close();
        } catch {}
      }
    }
  }
}

// Handler per Vercel
export default async function handler(req, res) {
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
    const isValidAmazonUrl =
      url &&
      (url.includes("amazon.") ||
        url.includes("amzn.") ||
        url.includes("a.co"));

    if (!isValidAmazonUrl) {
      return res.status(400).json({ error: "URL Amazon non valido" });
    }

    // Flag debug per bypass (facoltativo)
    if (process.env.AMAZON_SCRAPER_DEBUG === "1") {
      return res.json({
        title: "DEBUG MODE PRODUCT",
        price: 0,
        specifications: ["Debug spec A", "Debug spec B"],
        imageUrl: "",
        _debug: true,
      });
    }

    const scraper = new AmazonScraper();
    const productInfo = await scraper.scrapeProduct(url);
    res.json(productInfo);
  } catch (error) {
    console.error("[SCRAPER] Final error:", error?.message);
    res.status(500).json({ error: "Errore nel recupero dei dati" });
  }
}
