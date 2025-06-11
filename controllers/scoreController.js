const Score = require("../models/Score");

// ➕ Ajouter ou mettre à jour un score
exports.addOrUpdateScore = async (req, res) => {
  const { userId, gameName, level, stars } = req.body;

  try {
    const existing = await Score.findOne({ userId, gameName, level });

    if (existing) {
      if (stars > existing.stars) {
        existing.stars = stars;
        await existing.save();
      }
      return res.json(existing);
    }

    const newScore = await Score.create({ userId, gameName, level, stars });
    res.status(201).json(newScore);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'enregistrement du score" });
  }
};

// 📥 Récupérer les scores d’un utilisateur pour un jeu
exports.getScoresByUser = async (req, res) => {
  try {
    const { gameName } = req.query;
    const filter = { userId: req.params.userId };

    if (gameName) {
      filter.gameName = gameName;
    }

    const scores = await Score.find(filter);
    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des scores" });
  }
};
