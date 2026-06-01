const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// ===== 改成你的帳號 =====
const RIOT_NAME = "Velja";
const RIOT_TAG = "2203";
const REGION = "KR";
// ======================

// 拿 Deeplol realtime API
async function getRealtimeGame() {
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

  return response.data;
}

// DEBUG：看實際 status
app.get("/game", async (req, res) => {
  try {
    const data = await getRealtimeGame();

    // 沒在遊戲
    if (!data.playing) {
      return res.send("😴 目前不在遊戲中");
    }

    const result = [];

    for (const p of data.participants_list || []) {
      const info =
        p?.summoner_data
          ?.summoner_basic_info_dict
          ?.pro_streamer_info_dict || {};

      result.push({
        name: p.riot_id_name,
        tag: p.riot_id_tag_line,
        status: info.status || "",
        info
      });
    }

    return res.json(result);

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
