const express = require("express");
const { generateLeonardoImage, getLeonardoImage } = require("../controllers/imageController");
const router = express.Router();

router.post("/generate", generateLeonardoImage);
router.get("/:generationId", getLeonardoImage); // <- cette route est essentielle !

module.exports = router;
