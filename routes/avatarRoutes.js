const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.get("/", (req, res) => {
  const avatarsDir = path.join(__dirname, "../uploads/avatars");

  fs.readdir(avatarsDir, (err, files) => {
    if (err) {
      console.error("Erreur lecture avatars :", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }

    const avatarUrls = files.map(
      (file) => `${req.protocol}://${req.get("host")}/uploads/avatars/${file}`
    );

    res.json(avatarUrls);
  });
});

module.exports = router;