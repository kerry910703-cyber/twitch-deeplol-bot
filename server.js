const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

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
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "application/json",
        "Referer":
          `https://www.deeplol.gg/summoner/${REGION.toLowerCase()}/${RIOT_NAME}-${RIOT_TAG}/ingame`,
        "Origin": "https://www.deeplol.gg"
      }
    });

    const data = response.data;

    // debug 看實際拿到啥
    return res.json(data);

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
