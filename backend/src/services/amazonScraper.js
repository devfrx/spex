const puppeteer = require("puppeteer");

class AmazonScraper {
  async scrapeProduct(url) {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
      ],
    });
    const page = await browser.newPage();

    try {
      // Set user agent per evitare detection
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      );

      // Naviga all'URL (gli URL abbreviati si espandono automaticamente)
      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // Aspetta che la pagina si carichi completamente
      await page.waitForTimeout(2000);

      const productData = await page.evaluate(() => {
        // Estrai il titolo con selettori multipli
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

        // Estrai il prezzo con selettori multipli
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
            const priceText = (
              priceElement.innerText ||
              priceElement.textContent ||
              ""
            ).trim();

            // Mantieni solo cifre, punti e virgole
            let cleaned = priceText.replace(/[^\d.,]/g, "");

            /*
              Casi:
              - "1.359,00"  -> formato EU (punto = migliaia, virgola = decimale)
              - "1,359.00"  -> formato US (virgola = migliaia, punto = decimale)
              - "1359,00"   -> EU senza separatore migliaia
              - "1359.00"   -> US senza separatore migliaia
              - "1.359"     -> probabile 1359 (niente decimali visibili)
            */
            if (cleaned.includes(".") && cleaned.includes(",")) {
              if (cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")) {
                // Formato EU
                cleaned = cleaned.replace(/\./g, "").replace(",", ".");
              } else {
                // Formato US
                cleaned = cleaned.replace(/,/g, "");
              }
            } else if (cleaned.includes(",")) {
              // Solo virgola: se le ultime 2 cifre dopo la virgola => decimali
              const parts = cleaned.split(",");
              if (parts[parts.length - 1].length === 2) {
                cleaned = parts.join(".");
              } else {
                cleaned = cleaned.replace(/,/g, "");
              }
            } else if (cleaned.includes(".")) {
              // Solo punto: se ultimo blocco ha 2 cifre => decimali, altrimenti è migliaia
              const parts = cleaned.split(".");
              if (parts[parts.length - 1].length !== 2) {
                cleaned = parts.join(""); // trattiamo i punti come separatori migliaia
              }
            }

            const parsed = parseFloat(cleaned);
            if (!isNaN(parsed) && parsed > 0) {
              price = parsed;
              break;
            }
          }
        }

        // Estrai le specifiche
        const specs = [];

        // Feature bullets
        const featureBullets = document.querySelectorAll(
          "#feature-bullets ul li span"
        );
        featureBullets.forEach((bullet) => {
          const text = bullet.innerText?.trim();
          if (
            text &&
            text.length > 10 &&
            !text.includes("Visualizza") &&
            !text.includes("Mostra")
          ) {
            specs.push(text);
          }
        });

        // Technical details table
        const techSpecs = document.querySelectorAll(
          "#productDetails_techSpec_section_1 tr"
        );
        techSpecs.forEach((row) => {
          const label = row.querySelector("td:first-child")?.innerText?.trim();
          const value = row.querySelector("td:last-child")?.innerText?.trim();
          if (label && value && label.length < 50) {
            specs.push(`${label}: ${value}`);
          }
        });

        // Immagine prodotto
        let imageUrl = "";
        const imageSelectors = [
          "#landingImage",
          "#imgTagWrapperId img",
          ".a-dynamic-image",
        ];

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
          specifications: specs.slice(0, 8), // Limita a 8 specifiche
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

module.exports = AmazonScraper;
