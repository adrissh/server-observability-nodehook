const express = require("express");
const app = express();
const port = 4000;
const telegramWebhookHandler = require("./src/handlers/telegramWebhookHandler");
app.use(express.json());

app.post("/webhook-telegram", telegramWebhookHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
