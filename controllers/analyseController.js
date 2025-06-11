const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const path = require("path");

const analyticsDataClient = new BetaAnalyticsDataClient({
  keyFilename: path.join(__dirname, "../config/analytics-credentials.json"),
});

const propertyId = "DDCL0V598Y";

exports.getDeviceStats = async (req, res) => {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "activeUsers" }],
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
    });

    res.json(
      response.rows.map((row) => ({
        device: row.dimensionValues[0].value,
        users: parseInt(row.metricValues[0].value),
      }))
    );
  } catch (err) {
    console.error("Erreur analytics :", err);
    res.status(500).json({ message: "Erreur récupération stats devices" });
  }
};