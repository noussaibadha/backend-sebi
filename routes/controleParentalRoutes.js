const express = require("express");
const router = express.Router();
const controle = require("../controllers/controleParentalController");

router.post("/verifier-code", controle.verifierCode);
router.get("/est-autorise", controle.estAutorisé);
router.post("/changer-code", controle.changerCode);
module.exports = router;