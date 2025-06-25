const sendTelegramAlert = require("../services/telegram");
const writeLog = require("../utils/writelogs");
const config = require("../config/config.json");

const fetchCpuMetricFromPrometheus = require("../services/fetchCpuMetric");
const fetchMemoryMetricFromPrometheus = require("../services/fetchMemoryMetric");
const messageTemplate = require("../utils/messageTemplate");

const messageServerDown = config.messages.serverDown;
const messageServerResolved = config.messages.resolved;
const messageMemoryFiring = config.messages.memoryUsageFiring;
const messageMemoryResolved = config.messages.memoryUsageResolved;
const messagecpuFiring = config.messages.cpuUsageFiring;
const messagecpuResolved = config.messages.cpuUsageResolved;

const telegramWebhookHandler = async (req, res) => {
  const alerts = req.body?.alerts;
  if (!Array.isArray(alerts) || alerts.length == 0) {
    console.warn("Received alert webhook, but no alerts found.");
    return res.status(400).json({ message: "No alerts in payload." });
  }

  // Ubah map menjadi async dan gunakan Promise.all
  const messageProcess = await Promise.all(
    alerts.map(async (element) => {
      const isFiring = element.status === "firing";
      const { instance, severity } = element.labels;
      const memoryUsage = element.annotations.memory_usage;
      const cpuUsage = element.annotations.cpu_usage;
      const descMemory = (element.annotations.description || "").trim();
      const descCpu = (element.annotations.description || "").trim();
      const cpuUsageAtResolved = await fetchCpuMetricFromPrometheus(instance);
      const memoryUsageAtResolved = await fetchMemoryMetricFromPrometheus(instance);

      const firingAt = new Date(element.startsAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
      const resolvedAt = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
      const description = isFiring ? `Instance ${instance} is *DOWN*!` : `Instance ${instance} is *UP* again.`;
      const icon = element.labels.severity === "critical" ? "🔥" : "⚠️";

      const alertType = element.labels.alert_type;
      const alertHandler = {
        "firing: memory": () => {
          return messageTemplate(messageMemoryFiring, {
            icon: icon,
            resource: instance,
            value: memoryUsage,
            severity: severity,
            description: descMemory,
            alertType: alertType,
            startsAt: firingAt,
          });
        },
        "resolved: memory": () => {
          return messageTemplate(messageMemoryResolved, {
            resource: instance,
            value: memoryUsageAtResolved,
            endsAt: resolvedAt,
          });
        },
        "firing: cpu": () => {
          return messageTemplate(messagecpuFiring, {
            icon: icon,
            resource: instance,
            value: cpuUsage,
            severity: severity,
            description: descCpu,
            alertType: alertType,
            startsAt: firingAt,
          });
        },
        "resolved: cpu": () => {
          return messageTemplate(messagecpuResolved, {
            resource: instance,
            value: cpuUsageAtResolved,
            endsAt: resolvedAt,
          });
        },
        "firing: server": () => {
          return messageTemplate(messageServerDown, {
            icon: icon,
            resource: instance,
            description: description,
            severity: severity,
            detected: firingAt,
          });
        },
        "resolved: server": () => {
          return messageTemplate(messageServerResolved, {
            resource: instance,
            description: description,
            severity: severity,
            detected: resolvedAt,
          });
        },
      };

      const key = `${element.status}: ${alertType}`;
      const message = (alertHandler[key] || (() => `Unknown alert type: ${key}`))();
      return message;
    })
  );
  const shortAlerts = (alerts || []).map((a) => ({
    status: a.status,
    instance: a.labels?.instance,
    alertType: a.labels?.alert_type,
    startsAt: a.startsAt,
    fingerprint: a.fingerprint, // log fingerprint jika ada
  }));

  console.log("Webhook received:", new Date().toISOString(), shortAlerts);

  // console.log(req.body);

  try {
    const finalMessage = messageProcess.join("\n\n----------------------------------\n\n");
    await sendTelegramAlert(finalMessage);
    res.status(200).json({
      status: "success",
      statusCode: 200,
    });
  } catch (err) {
    console.error("Failed to send alert to telegram:", err);
    writeLog(err.errors);
    res.status(500).json({ error: "Failed to send alert to telegram" });
  }
};

module.exports = telegramWebhookHandler;
