const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");

// ✅ Route leaderboard corrigée
router.get("/leaderboard", async (req, res) => {
  const { gameName } = req.query;
  const db = req.db;

  try {
    const scores = await db.collection("scores").aggregate([
      { $match: { gameName } },
      {
        $group: {
          _id: { userId: "$userId", level: "$level" },
          stars: { $max: "$stars" } // prend les meilleurs scores par niveau
        }
      },
      {
        $group: {
          _id: "$_id.userId",
          totalStars: { $sum: "$stars" }
        }
      },
      { $sort: { totalStars: -1 } },
      { $limit: 3 }
    ]).toArray();

    const users = db.collection("utilisateurs");

    const leaderboard = await Promise.all(
      scores.map(async (entry) => {
        const user = await users.findOne({ _id: entry._id });
        return {
          userId: entry._id,
          totalStars: entry.totalStars,
          prenom: user?.prenom || "Inconnu",
          avatar: user?.avatar || "/avatars/default.png",
        };
      })
    );

    res.status(200).json(leaderboard);
  } catch (err) {
    console.error("❌ Erreur leaderboard :", err);
    res.status(500).json({ error: "Erreur récupération leaderboard" });
  }
});




router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { gameName } = req.query;

  try {
    const scores = await req.db.collection("scores").find({
      userId: new ObjectId(userId),
      gameName,
    }).toArray();

    res.status(200).json(scores);
  } catch (err) {
    console.error("❌ Erreur récupération scores utilisateur :", err);
    res.status(500).json({ error: "Erreur récupération scores" });
  }
});



// Ajouter ou mettre à jour un score
router.post("/", async (req, res) => {
  const { userId, gameName, level, stars } = req.body;

  try {
    const existing = await req.db.collection("scores").findOne({
      userId: new ObjectId(userId),
      gameName,
      level,
    });

    if (existing) {
      // Met à jour uniquement si les nouvelles étoiles sont supérieures
      if (stars > existing.stars) {
        await req.db.collection("scores").updateOne(
          { _id: existing._id },
          { $set: { stars, updatedAt: new Date() } }
        );
      }
      return res.status(200).json({ success: true, updated: true });
    }

    // Si aucun score existant, on l’ajoute
    await req.db.collection("scores").insertOne({
      userId: new ObjectId(userId),
      gameName,
      level,
      stars,
      createdAt: new Date(),
    });

    res.status(201).json({ success: true });
  } catch (err) {
    console.error("❌ Erreur enregistrement score :", err);
    res.status(500).json({ error: "Erreur enregistrement score" });
  }
});

module.exports = router;
