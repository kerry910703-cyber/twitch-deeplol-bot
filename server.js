const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// 改你的帳號
const RIOT_NAME = "Velja";
const RIOT_TAG = "2203";
const REGION = "KR";

app.get("/game", async (req, res) => {
  try {
    const url =
      `https://www.deeplol.gg/api/summoner-realtime` +
      `?platform_id=${REGION}` +
      `&riot_id_name=${encodeURIComponent(RIOT_NAME)}` +
      `&riot_id_tag_line=${encodeURIComponent(RIOT_TAG)}`;

    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    // 直接把 API 原始結果吐出來
    return res.json(response.data);

  } catch (err) {
    console.error(err);
    return res.send(
      `ERROR: ${err.message}`
    );
  }
});

app.listen(PORT, () => {
  console.log(`running ${PORT}`);
});
