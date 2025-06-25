const axios = require("axios");
require("dotenv").config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const sendTelegramAlert = async (message) => {
  const response = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    chat_id: CHAT_ID,
    text: message,
    parse_mode: "Markdown",
  });
  return response.data;
};

module.exports = sendTelegramAlert;
