const express = require("express");
const AmazonScraper = require("../services/amazonScraper");
const router = express.Router();

router.post("/product", async (req, res) => {
  try {
    const { url } = req.body;

    // Validazione migliorata per URL Amazon
    const isValidAmazonUrl =
      url &&
      (url.includes("amazon.") ||
        url.includes("amzn.") ||
        url.includes("a.co"));

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
});

module.exports = router;
