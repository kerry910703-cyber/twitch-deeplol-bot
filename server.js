const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000;

const RIOT_ID = "Velja#2203";
const REGION = "kr";

app.get("/debug", async (req, res) => {
  let browser;

  try {
    const riotId = RIOT_ID.replace("#", "-");

    const url =
      `https://www.deeplol.gg/summoner/${REGION}/${riotId}/ingame`;

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000
    });

    await new Promise(r => setTimeout(r, 5000));

    const text = await page.evaluate(() => {
      return document.body.innerText;
    });

    res.type("text/plain");
    res.send(text.slice(0, 5000));
  } catch (err) {
    res.send(`ERROR:\n${err.message}`);
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`running ${PORT}`);
});
