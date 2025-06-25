const axios = require("axios");

const fetchMemoryMetricFromPrometheus = async (target, options = {}) => {
  try {
    const percentageMemoryUsageURL = `http://127.0.0.1:9090/api/v1/query?query=(1 - (node_memory_MemAvailable_bytes{instance="${target}"}/ node_memory_MemTotal_bytes{instance="${target}"})) * 100`;
    const resposne = await axios.get(percentageMemoryUsageURL);
    const payload = resposne.data.data.result;
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
    resultData = parseFloat(resultData[0].value).toFixed(2);
    return resultData;
  } catch (error) {
    console.log(`Error when fetch data metric form prometheus , details : ${error}`);
  }
};

module.exports = fetchMemoryMetricFromPrometheus;
