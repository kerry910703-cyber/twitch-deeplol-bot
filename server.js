const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// ===== 改成你的 Riot ID =====
const RIOT_NAME = "Velja";
const RIOT_TAG = "2203";
const REGION = "KR";
// ===========================

// 先拿 realtime 資料
async function getRealtime() {
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

  // 被擋
  if (typeof response.data === "string") {
    throw new Error("Deeplol API 被擋（回 HTML）");
  }

  return response.data;
}

// 真正 ingame API
async function getIngameInfo() {
  const realtime = await getRealtime();

  if (!realtime.playing) {
    return {
      playing: false
    };
  }

  const me = realtime.participants_list.find(
    p =>
      p.riot_id_name?.toLowerCase() ===
        RIOT_NAME.toLowerCase() &&
      p.riot_id_tag_line === RIOT_TAG
  );

  if (!me) {
    throw new Error("找不到玩家資料");
  }

  const puuId =
    me.puu_id ||
    me?.summoner_data
      ?.summoner_basic_info_dict?.puu_id;

  if (!puuId) {
    throw new Error("找不到 puu_id");
  }

  // match_id
  const matchId =
    realtime.match_id ||
    "";

  const url =
    `https://b2c-api-cdn.deeplol.gg/ingame/ingame_info` +
    `?puu_id=${encodeURIComponent(puuId)}` +
    `&platform_id=${REGION}` +
    `&season=27` +
    `&match_id=${matchId}`;

  const response = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Accept": "application/json",
      "Referer":
        `https://www.deeplol.gg/summoner/${REGION.toLowerCase()}/${RIOT_NAME}-${RIOT_TAG}/ingame`
    }
  });

  return response.data;
}

// 測試
app.get("/debug", async (req, res) => {
  try {
    const data = await getIngameInfo();
    return res.json(data);
  } catch (err) {
    return res.send(`ERROR: ${err.message}`);
  }
});

// Nightbot
app.get("/game", async (req, res) => {
  try {
    const data = await getIngameInfo();

    if (!data.playing) {
      return res.send("😴 目前不在遊戲中");
    }

    const found = [];

    for (const p of data.participants_list || []) {
      const info =
        p?.summoner_data
          ?.summoner_basic_info_dict
          ?.pro_streamer_info_dict || {};

      const status =
        (info.status || "")
          .toLowerCase();

      if (
        status === "pro" ||
        status === "streamer"
      ) {
        const name =
          p.riot_id_name ||
          info.name ||
          "未知玩家";

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
