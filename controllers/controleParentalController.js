const fs = require("fs");
const path = require("path");
const Utilisateur = require("../models/Utilisateur"); // ✅ AJOUT

// 🔐 Vérifie si le code saisi est correct
exports.verifierCode = async (req, res) => {
  const { userId, code } = req.body;

  console.log("🔐 Vérification reçue :", { userId, code });

  if (!userId || !code) {
    return res
      .status(400)
      .json({ success: false, message: "userId et code requis" });
  }

  try {
    const utilisateur = await Utilisateur.findById(userId);

    if (!utilisateur) {
      return res
        .status(404)
        .json({ success: false, message: "Utilisateur non trouvé" });
    }

    const codeValide = String(utilisateur.codeParental) === String(code);

    if (codeValide) {
      return res.status(200).json({
        success: true,
        autorisé: true,
        message: "Code correct",
      });
    } else {
      return res.status(200).json({
        success: false,
        autorisé: false,
        message: "Code incorrect",
      });
    }
  } catch (error) {
    console.error("❌ Erreur serveur :", error.message);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};

// 🔁 Vérifie si l'accès est encore valide
exports.estAutorisé = (req, res) => {
  const now = new Date();
  if (global.accèsAutoriséJusqu && now < global.accèsAutoriséJusqu) {
    return res.status(200).json({ autorisé: true });
  }
  return res.status(200).json({ autorisé: false });
};

// ✏️ Permet de changer dynamiquement le code parental
exports.changerCode = (req, res) => {
  const { nouveauCode } = req.body;

  if (!nouveauCode || typeof nouveauCode !== "string") {
    return res.status(400).json({
      success: false,
      message: "Code invalide. Il doit être une chaîne de caractères.",
    });
  }

  const dataPath = path.join(__dirname, "../data/code_parent.json");

  try {
    fs.writeFileSync(dataPath, JSON.stringify({ code: nouveauCode }, null, 2));
    console.log("✅ Nouveau code parent enregistré :", nouveauCode);
    return res.status(200).json({ success: true, message: "Code mis à jour" });
  } catch (err) {
    console.error("❌ Erreur écriture code_parent.json :", err.message);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'enregistrement",
    });
  }
};