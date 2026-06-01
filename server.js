const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000;

// 改成你的 Riot ID
const RIOT_ID = "Velja#2203";
const REGION = "kr";

// DEBUG：看實際抓到什麼
app.get("/debug", async (req, res) => {
  let browser;

  try {
    const riotId = RIOT_ID.replace("#", "-");

    const url =
      `https://www.deeplol.gg/summoner/${REGION}/${riotId}/ingame`;

    browser = await puppeteer.launch({
      headless: true,
      executablePath:
        "/opt/render/.cache/puppeteer/chrome/linux-148.0.7778.97/chrome-linux64/chrome",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage"
      ]
    });

    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000
    });

    // 等 Deeplol 載完
    await new Promise(r => setTimeout(r, 5000));

    const text = await page.evaluate(() => {
      return document.body.innerText;
    });

    res.type("text/plain");
    res.send(text.slice(0, 8000));

  } catch (err) {
    console.error(err);
    res.send(`ERROR:\n${err.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

// 正式 Nightbot 用
app.get("/game", async (req, res) => {
  let browser;

  try {
    const riotId = RIOT_ID.replace("#", "-");

    const url =
      `https://www.deeplol.gg/summoner/${REGION}/${riotId}/ingame`;

    browser = await puppeteer.launch({
      headless: true,
      executablePath:
        "/opt/render/.cache/puppeteer/chrome/linux-148.0.7778.97/chrome-linux64/chrome",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage"
      ]
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
      return res.send(
        "😴 這把沒撞到 PRO / STR"
      );
    }

    res.send(
      `🚨 本局撞車：${unique
        .slice(0, 8)
        .join("、")}`
    );

  } catch (err) {
    console.error(err);
    res.send(`ERROR: ${err.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.listen(PORT, () => {
  console.log(`running ${PORT}`);
});
