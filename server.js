const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;

// 改你的 Riot ID
const RIOT_ID = "Velja#2203";
const REGION = "kr";

app.get("/game", async (req, res) => {
  try {
    const riotId = RIOT_ID.replace("#", "-");

    const url = `https://www.deeplol.gg/summoner/${REGION}/${riotId}/ingame`;

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    const $ = cheerio.load(response.data);

    const found = [];

    // 掃整頁文字
    $("body *").each((_, el) => {
      const text = $(el).text().trim();

      if (!text) return;

      // 找 "名字 + PRO" 或 "名字 + STR"
      const proMatch = text.match(
        /([A-Za-z0-9._\-\s]+)\s*PRO/i
      );

      const strMatch = text.match(
        /([A-Za-z0-9._\-\s]+)\s*STR/i
      );

      if (proMatch?.[1]) {
        found.push(`${proMatch[1].trim()}(PRO)`);
      }

      if (strMatch?.[1]) {
        found.push(`${strMatch[1].trim()}(STR)`);
      }
    });

    // 去重複
    const unique = [...new Set(found)];

    if (unique.length === 0) {
      return res.send(
        "😴 這把沒撞到 PRO / STR"
      );
    }

    res.send(
      `🚨 本局撞車：${unique.join("、")}`
    );
  } catch (err) {
    console.error(err);

    res.send(
      "抓不到即時對戰（可能沒在遊戲中）"
    );
  }
});

app.listen(PORT, () => {
  console.log(`running ${PORT}`);
});
