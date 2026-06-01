const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000;

const RIOT_ID = "Velja#2203";
const REGION = "kr";

app.get("/game", async (req, res) => {
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
      timeout: 30000
    });

    // 等頁面載入
    await new Promise(r => setTimeout(r, 3000));

    const text = await page.evaluate(() => {
      return document.body.innerText;
    });

    const found = [];

    const lines = text.split("\n");

    for (const line of lines) {
      const clean = line.trim();

      if (!clean) continue;

      if (clean.includes("PRO")) {
        found.push(clean);
      }

      if (clean.includes("STR")) {
        found.push(clean);
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
    return res.send("抓不到即時對戰");
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.listen(PORT, () => {
  console.log(`running ${PORT}`);
});
