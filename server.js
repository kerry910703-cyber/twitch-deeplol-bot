const express = require("express");
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

const app = express();
const PORT = process.env.PORT || 3000;

const RIOT_ID = "Velja#2203";
const REGION = "kr";

async function getPageText() {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless
  });

  try {
    const riotId = RIOT_ID.replace("#", "-");

    const url = `https://www.deeplol.gg/summoner/${REGION}/${riotId}/ingame`;

    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000
    });

    await new Promise(r => setTimeout(r, 5000));

    const text = await page.evaluate(() => {
      return document.body.innerText;
    });

    return text;
  } finally {
    await browser.close();
  }
}

// Debug
app.get("/debug", async (req, res) => {
  try {
    const text = await getPageText();

    res.type("text/plain");
    res.send(text.slice(0, 8000));
  } catch (err) {
    console.error(err);
    res.send(`ERROR: ${err.message}`);
  }
});

// Nightbot
app.get("/game", async (req, res) => {
  try {
    const text = await getPageText();

    const lines = text
      .split("\n")
      .map(x => x.trim())
      .filter(Boolean);

    const found = [];

    for (const line of lines) {
      if (
        line.includes("PRO") ||
        line.includes("STR")
      ) {
        found.push(line);
      }
    }

    const unique = [...new Set(found)];

    if (!unique.length) {
      return res.send("😴 這把沒撞到 PRO / STR");
    }

    return res.send(
      `🚨 本局撞車：${unique.slice(0, 8).join("、")}`
    );
  } catch (err) {
    console.error(err);
    return res.send(`ERROR: ${err.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`running ${PORT}`);
});
