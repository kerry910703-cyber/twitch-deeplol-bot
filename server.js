const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

const PORT = process.env.PORT || 3000;

// 改你的 Riot ID
const RIOT_ID = "rrrrr#wywq";

app.get("/game", async (req, res) => {
  try {
    const encoded = encodeURIComponent(RIOT_ID);

    const url = `https://www.deeplol.gg/summoner/tw/${encoded}`;

    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const $ = cheerio.load(response.data);

    let players = [];

    $("body")
      .text()
      .split("\n")
      .forEach(line => {
        line = line.trim();

        // 抓可能是知名玩家的資訊
        if (
          line.includes("Streamer") ||
          line.includes("Pro") ||
          line.includes("LCK") ||
          line.includes("LPL") ||
          line.includes("LMS") ||
          line.includes("PCS")
        ) {
          players.push(line);
        }
      });

    players = [...new Set(players)].slice(0, 6);

    if (players.length === 0) {
      return res.send("這把目前沒撞到已標記選手/實況主 😴");
    }

    res.send(
      `🚨 本局撞車：${players.join("、")}`
    );
  } catch (err) {
    console.error(err.message);
    res.send("目前抓不到對戰資料");
  }
});

app.listen(PORT, () => {
  console.log(`running ${PORT}`);
});