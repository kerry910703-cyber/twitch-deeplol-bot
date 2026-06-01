const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

/*
  改這裡
  每次只要更新 match_id 即可
*/
const API_URL =
  "https://b2c-api-cdn.deeplol.gg/ingame/ingame_info" +
  "?puu_id=v3qG__KqIOwFUaBawNX-V4EwtyJOOK4esqId0wUmnFsxPO4_k5_JejonOCnp6Ln4vYRzlKjtjeG7Ig" +
  "&platform_id=KR" +
  "&season=27" +
  "&match_id=8240653117";

app.get("/", (req, res) => {
  res.send("deeplol bot running");
});

app.get("/game", async (req, res) => {
  try {
    const response = await axios.get(API_URL, {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "application/json",
        "Referer":
          "https://www.deeplol.gg/"
      }
    });

    const data = response.data;

    if (!data?.playing) {
      return res.send(
        "😴 目前不在遊戲中"
      );
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
