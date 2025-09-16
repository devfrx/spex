import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

class AmazonScraper {
  async scrapeProduct(url) {
    const browser = await puppeteer.launch({
      args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    try {
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      );

      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      await page.waitForTimeout(2000);

      const productData = await page.evaluate(() => {
        // Stesso codice di scraping del backend originale
        let title = "Prodotto non trovato";
        const titleSelectors = [
          "#productTitle",
          ".product-title", 
          "h1 span",
          ".a-size-large",
        ];

        for (const selector of titleSelectors) {
          const element = document.querySelector(selector);
          if (element && element.innerText) {
            title = element.innerText.trim();
            break;
          }
        }

        let price = 0;
        const priceSelectors = [
          ".a-price-whole",
          ".a-price .a-offscreen",
          "#price_inside_buybox",
          ".a-price-range .a-price .a-offscreen",
          '[data-testid="price-current"]',
        ];

        for (const selector of priceSelectors) {
          const priceElement = document.querySelector(selector);
          if (priceElement) {
            const priceText = priceElement.innerText || priceElement.textContent;
            const priceMatch = priceText.match(/[\d,]+\.?\d*/);
            if (priceMatch) {
              price = parseFloat(priceMatch[0].replace(",", ""));
              break;
            }
          }
        }

        const specs = [];
        
        // Feature bullets
        const featureBullets = document.querySelectorAll("#feature-bullets ul li span");
        featureBullets.forEach((bullet) => {
          const text = bullet.innerText?.trim();
          if (text && text.length > 10 && !text.includes("Visualizza") && !text.includes("Mostra")) {
            specs.push(text);
          }
        });

        // Technical details
        const techSpecs = document.querySelectorAll("#productDetails_techSpec_section_1 tr");
        techSpecs.forEach((row) => {
          const label = row.querySelector("td:first-child")?.innerText?.trim();
          const value = row.querySelector("td:last-child")?.innerText?.trim();
          if (label && value && label.length < 50) {
            specs.push(`${label}: ${value}`);
          }
        });

        let imageUrl = "";
        const imageSelectors = ["#landingImage", "#imgTagWrapperId img", ".a-dynamic-image"];
        
        for (const selector of imageSelectors) {
          const imageElement = document.querySelector(selector);
          if (imageElement && imageElement.src) {
            imageUrl = imageElement.src;
            break;
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
    } catch (error) {
      console.error("Errore durante lo scraping:", error);
      throw new Error("Impossibile recuperare i dati del prodotto");
    } finally {
      await browser.close();
    }
  }
}

// Handler per Vercel
export default async function handler(req, res) {
  // Cors headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;

    const isValidAmazonUrl = url && (url.includes("amazon.") || url.includes("amzn.") || url.includes("a.co"));

    if (!isValidAmazonUrl) {
      return res.status(400).json({ error: "URL Amazon non valido" });
    }

    const scraper = new AmazonScraper();
    const productInfo = await scraper.scrapeProduct(url);

    res.json(productInfo);
  } catch (error) {
    console.error("Errore scraping:", error);
    res.status(500).json({ error: "Errore nel recupero dei dati" });
  }
}