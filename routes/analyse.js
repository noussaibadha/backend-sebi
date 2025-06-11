const express = require("express");
const router = express.Router();
const { getDeviceStats } = require("../controllers/analyseController");

router.get("/devices", getDeviceStats);

module.exports = router;
