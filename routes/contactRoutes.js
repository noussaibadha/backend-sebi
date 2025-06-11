const express = require("express");
const { contact, getTousLesMessages } = require("../controllers/contactController");

const router = express.Router();

router.post("/", contact);
router.get("/tous", getTousLesMessages); // ✅ Nouvelle route pour récupérer tous les messages

module.exports = router;
