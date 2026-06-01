const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

const RIOT_NAME = "Velja";
const RIOT_TAG = "2203";
const REGION = "KR";

async function getRealtimeGame() {
  // 先拿 realtime 資料
  const realtimeUrl =
    `https://www.deeplol.gg/api/summoner-realtime` +
    `?platform_id=${REGION}` +
    `&riot_id_name=${encodeURIComponent(RIOT_NAME)}` +
    `&riot_id_tag_line=${encodeURIComponent(RIOT_TAG)}`;

  const realtime = await axios.get(realtimeUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  const data = realtime.data;

  if (!data.playing) {
    return { playing: false };
  }

  // Velja 本人資料
  const me = data.participants_list.find(
    p =>
      p.riot_id_name === RIOT_NAME &&
      p.riot_id_tag_line === RIOT_TAG
  );

  const puuId = me?.puu_id;

  if (!puuId) {
    throw new Error("找不到 puu_id");
  }

  // match_id 用第一場 recent match 推
  const matchId =
    me?.participant_info
      ?.summoner_info_dict
      ?.last_match_list?.[0]
      ?.match_id
      ?.replace("KR_", "") || "";

  // 真正 ingame API
  const ingameUrl =
    `https://b2c-api-cdn.deeplol.gg/ingame/ingame_info` +
    `?puu_id=${puuId}` +
    `&platform_id=${REGION}` +
    `&season=27` +
    `&match_id=${matchId}`;

  const ingame = await axios.get(ingameUrl);

  return ingame.data;
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

    if (!data) {
      return res.send("😴 不在遊戲中");
    }

    const found = [];

    // 掃所有玩家
    for (const p of data.participants_list || []) {
      const info =
        p?.summoner_data
          ?.summoner_basic_info_dict
          ?.pro_streamer_info_dict;

      const status = info?.status;

      if (
        status === "pro" ||
        status === "streamer"
      ) {
        found.push(
          `${p.riot_id_name}(${status.toUpperCase()})`
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
