const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;

// 測試帳號
const RIOT_ID = "Velja#2203";
const REGION = "kr"; // tw kr euw na jp

app.get("/game", async (req, res) => {
  try {
    // Deeplol 格式：名字#tag -> 名字-tag
    const formatted = RIOT_ID.replace("#", "-");
    const encoded = encodeURIComponent(formatted);

    const url = `https://www.deeplol.gg/summoner/${REGION}/${encoded}`;

    console.log("Checking:", url);

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    const $ = cheerio.load(response.data);

    const bodyText = $("body").text();

    const keywords = [
      "Streamer",
      "Pro",
      "LCK",
      "LPL",
      "LEC",
      "LCS",
      "PCS",
      "T1",
      "GEN",
      "DK",
      "KT"
    ];

    let found = [];

    keywords.forEach(word => {
      if (bodyText.includes(word)) {
        found.push(word);
      }
    });

    found = [...new Set(found)];

    if (found.length === 0) {
      return res.send("這把目前沒撞到已標記選手/實況主 😴");
    }

    res.send(`🚨 本局撞車：${found.join("、")}`);
  } catch (err) {
    console.error(err.message);
    res.send("目前抓不到對戰資料");
  }
});

app.listen(PORT, () => {
  console.log(`running ${PORT}`);
});
