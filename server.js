const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// 改成你的 Riot ID
const RIOT_ID = "Velja#2203";
const REGION = "KR";

async function getRealtimeGame() {
  const [name, tag] = RIOT_ID.split("#");

  const url =
    `https://www.deeplol.gg/api/summoner-realtime` +
    `?platform_id=${REGION}` +
    `&summoner_name=${encodeURIComponent(name)}` +
    `&riot_id_tag_line=${encodeURIComponent(tag)}`;

  const response = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  return response.data;
}

// debug
app.get("/debug", async (req, res) => {
  try {
    const data = await getRealtimeGame();
    res.json(data);
  } catch (err) {
    res.send(`ERROR: ${err.message}`);
  }
});

// nightbot
app.get("/game", async (req, res) => {
  try {
    const data = await getRealtimeGame();

    if (!data.playing) {
      return res.send("😴 目前不在遊戲中");
    }

    const players =
      data.participants_list || [];

    const found = [];

    for (const p of players) {
      const info =
        p?.summoner_data
          ?.summoner_basic_info_dict
          ?.pro_streamer_info_dict;

      const status = info?.status;

      if (
        status === "pro" ||
        status === "streamer"
      ) {
        const name =
          p.riot_id_name || "未知玩家";

        found.push(
          `${name}(${status.toUpperCase()})`
        );
      }
    }

    const unique = [...new Set(found)];

    if (!unique.length) {
      return res.send(
        "😴 這把沒撞到 PRO / STR"
      );
    }

    return res.send(
      `🚨 本局撞車：${unique.join("、")}`
    );
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
