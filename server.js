const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");
const imageRoutes = require("./routes/imageRoutes");
const controleRoutes = require("./routes/controleParentalRoutes");




dotenv.config();

// ✅ Connexion Mongoose (utilisateurs, authentification)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Mongoose connecté (utilisateurs)"))
  .catch((err) => {
    console.error("❌ Erreur Mongoose :", err);
    process.exit(1);
  });

const app = express();
app.use(cors());



app.use(express.json());
app.use("/api/images", imageRoutes);


app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const avatarRoutes = require("./routes/avatarRoutes");
app.use("/api/avatars", avatarRoutes);

app.use("/api/controle", controleRoutes);

// ✅ Ajouter les routes de contact
const contactRoutes = require("./routes/contactRoutes");
app.use("/api/contact", contactRoutes);



// ✅ Sert les fichiers statiques (ex: avatars dans /uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Connexion MongoClient pour les scores
MongoClient.connect(process.env.MONGO_URI)
  .then((client) => {
    const db = client.db();

    // ✅ Injecte db dans les routes scores
    const scoreRoutes = require("./routes/scoreRoutes");
    app.use(
      "/api/scores",
      (req, res, next) => {
        req.db = db;
        next();
      },
      scoreRoutes
    );

    

    // ✅ Autres routes (Mongoose)
    app.use("/api/utilisateurs", require("./routes/utilisateurRoutes"));
    app.use("/api/contact", require("./routes/contactRoutes"));
    app.use("/api/verification", require("./routes/utilisateurRoutes"));
    app.use("/api/tous", require("./routes/utilisateurRoutes"));
    app.use("/api/avatars", require("./routes/avatarRoutes"));



    // ✅ Lancement serveur
    const PORT = process.env.PORT || 8008;
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré : http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Erreur MongoClient (scores) :", err);
    process.exit(1);
  });
