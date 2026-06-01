const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

const RIOT_ID = "Velja#2203";
const REGION = "kr";

app.get("/debug", async (req, res) => {
  try {
    const riotId = RIOT_ID.replace("#", "-");

    const url =
      `https://www.deeplol.gg/summoner/${REGION}/${riotId}/ingame`;

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    const html = response.data;

    res.type("text/plain");
    res.send(html.slice(0, 8000));
  } catch (err) {
    res.send(`ERROR: ${err.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`running ${PORT}`);
});
