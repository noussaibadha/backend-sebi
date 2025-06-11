const jwt = require("jsonwebtoken");

const verifierToken = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Accès refusé : token manquant" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.utilisateur = decoded; // On garde tout (id, role, etc.)
    next();
  } catch (error) {
    console.error("Erreur de vérification du token :", error);
    res.status(403).json({ message: "Token invalide" });
  }
};

const verifierAdmin = (req, res, next) => {
  if (!req.utilisateur || req.utilisateur.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Accès réservé aux administrateurs" });
  }
  next();
};

module.exports = {
  verifierToken,
  verifierAdmin,
};
