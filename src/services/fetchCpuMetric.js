const axios = require("axios");

const fetchCpuMetricFromPrometheus = async (target, options = {}) => {
  try {
    const percentageCpuUsageURL = `http://127.0.0.1:9090/api/v1/query?query=instance:cpu_usage_percent{instance="${target}"}`;
    const response = await axios.get(percentageCpuUsageURL);
    const payload = response.data.data.result;
    let resultData = [];
    payload.forEach((element) => {
      const instance = element.metric.instance;
      const value = element.value[1];
      resultData.push({
        instance,
        value,
      });
    });

    if (options.debug) {
      return resultData; // Return all data for debugging
    }
    if (!resultData.length) return null;
    return parseFloat(resultData[0].value).toFixed(2);
  } catch (err) {
    console.log(err);
  }
};

module.exports = fetchCpuMetricFromPrometheus;
