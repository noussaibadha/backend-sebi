const express = require("express");
const router = express.Router();
const { getAvis, createAvis } = require("../controllers/avisController");

router.get("/", getAvis); // Récupérer tous les avis
router.post("/", createAvis); // Ajouter un nouvel avis

module.exports = router;
