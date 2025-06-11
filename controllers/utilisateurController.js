const Utilisateur = require("../models/Utilisateur");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../config/mailer");

const ADMIN_EMAILS = [
  "eleisawy19@gmail.com",
  "c_abbad@stu-digital-campus.fr",
  "n_dhaou@stu-digital-campus.fr",
  "n_hannachi@stu-digital-campus.fr",
];

// 🟢 Inscription
exports.inscription = async (req, res) => {
  const { nom, prenom, dateDeNaissance, email, motDePasse, avatar, codeParental } = req.body;


  try {
    let utilisateur = await Utilisateur.findOne({ email });
    if (utilisateur) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    const hash = await bcrypt.hash(motDePasse, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const role = ADMIN_EMAILS.includes(email.toLowerCase())
      ? "admin"
      : "utilisateur";

    utilisateur = new Utilisateur({
      nom,
      prenom,
      dateDeNaissance,
      avatar,
      email,
      motDePasse: hash,
      codeParental,        // <-- ici
      verificationToken,
      estVerifie: false,
      role,
    });

    await utilisateur.save();
    await sendVerificationEmail(email, verificationToken);

    res
      .status(201)
      .json({ message: "Inscription réussie. Vérifiez votre email." });
  } catch (error) {
    console.error("Erreur inscription :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔐 Connexion
exports.connexion = async (req, res) => {
  const { email, motDePasse } = req.body;

  try {
    const utilisateur = await Utilisateur.findOne({ email });
    if (!utilisateur)
      return res.status(400).json({ message: "Utilisateur non trouvé" });

    const estValide = await bcrypt.compare(motDePasse, utilisateur.motDePasse);
    if (!estValide)
      return res.status(400).json({ message: "Mot de passe incorrect" });

    if (!utilisateur.estVerifie) {
      return res.status(403).json({
        message: "Compte non vérifié. Veuillez vérifier votre email.",
      });
    }

    const token = jwt.sign(
      { id: utilisateur._id, role: utilisateur.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, utilisateur });
  } catch (error) {
    console.error("Erreur dans la connexion :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 📧 Vérifier le compte par email
exports.verifierCompte = async (req, res) => {
  const { token } = req.query;

  try {
    const utilisateur = await Utilisateur.findOne({ verificationToken: token });
    if (!utilisateur) {
      return res.status(400).json({ message: "Token invalide" });
    }

    utilisateur.estVerifie = true;
    utilisateur.verificationToken = undefined;
    await utilisateur.save();

    res.status(200).json({ message: "Compte vérifié avec succès" });
  } catch (error) {
    console.error("Erreur de vérification :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 📄 GET /profil - infos sécurisées de l'utilisateur
exports.getMonProfil = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.utilisateur.id).select(
      "-motDePasse -verificationToken"
    );

    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json(utilisateur);
  } catch (error) {
    console.error("Erreur récupération profil :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ✏️ PUT /me - Mise à jour du profil (avatar inclus)
exports.mettreAJourProfil = async (req, res) => {
  try {
    const champsAutorisés = [
      "nom",
      "prenom",
      "email",
      "avatar",
      "dateDeNaissance",
    ];
    const majDonnees = {};

    champsAutorisés.forEach((champ) => {
      if (req.body[champ] !== undefined) {
        majDonnees[champ] = req.body[champ];
      }
    });

    // 🧼 Nettoyage de l'avatar
    if (majDonnees.avatar?.startsWith("http")) {
      const filename = majDonnees.avatar.split("/").pop();
      majDonnees.avatar = `/avatars/${filename}`;
    }

    const utilisateurMisAJour = await Utilisateur.findByIdAndUpdate(
      req.utilisateur.id,
      majDonnees,
      { new: true }
    ).select("-motDePasse -verificationToken");

    if (!utilisateurMisAJour) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json(utilisateurMisAJour);
  } catch (error) {
    console.error("Erreur mise à jour profil :", error);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour" });
  }
};

// 🔐 PUT /me/password - Changer mot de passe
exports.changerMotDePasse = async (req, res) => {
  try {
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;

    if (!ancienMotDePasse || !nouveauMotDePasse) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    const utilisateur = await Utilisateur.findById(req.utilisateur.id);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const motDePasseValide = await bcrypt.compare(
      ancienMotDePasse,
      utilisateur.motDePasse
    );

    if (!motDePasseValide) {
      return res.status(403).json({ message: "Ancien mot de passe incorrect" });
    }

    const hash = await bcrypt.hash(nouveauMotDePasse, 10);
    utilisateur.motDePasse = hash;
    await utilisateur.save();

    res.json({ message: "Mot de passe mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur mot de passe :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔐 PUT /me/code-parent - Modifier le code parental
exports.modifierCodeParental = async (req, res) => {
  const { nouveauCode } = req.body;

  if (!nouveauCode || typeof nouveauCode !== "string") {
    return res.status(400).json({
      success: false,
      message: "Le code parental est requis et doit être une chaîne.",
    });
  }

  try {
    const utilisateur = await Utilisateur.findByIdAndUpdate(
      req.utilisateur.id,
      { codeParental: nouveauCode },
      { new: true }
    ).select("-motDePasse -verificationToken");

    if (!utilisateur) {
      return res
        .status(404)
        .json({ success: false, message: "Utilisateur non trouvé" });
    }

    res.status(200).json({
      success: true,
      message: "Code parental mis à jour avec succès",
      utilisateur,
    });
  } catch (error) {
    console.error("❌ Erreur modification code parental :", error.message);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la mise à jour du code parental",
    });
  }
};

// 🔐 Vérifie si le code parental est correct
exports.verifierCode = async (req, res) => {
  const { userId, code } = req.body;

  if (!userId || !code) {
    return res.status(400).json({ message: "userId et code requis" });
  }

  try {
    const utilisateur = await Utilisateur.findById(userId);

    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const codeValide = utilisateur.codeParental === code;

    if (codeValide) {
      res.status(200).json({ autorisé: true, message: "Code correct" });
    } else {
      res.status(401).json({ autorisé: false, message: "Code incorrect" });
    }
  } catch (error) {
    console.error("Erreur vérification code parental :", error.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ✅ Vérifie si l'utilisateur est autorisé (optionnel)
exports.estAutorisé = async (req, res) => {
  res.status(200).json({ autorisé: false });
};

// 🔄 Change le code parental (admin ou gestion externe)
exports.changerCode = async (req, res) => {
  const { userId, nouveauCode } = req.body;

  if (!userId || !nouveauCode) {
    return res.status(400).json({ message: "userId et nouveauCode requis" });
  }

  try {
    const utilisateur = await Utilisateur.findByIdAndUpdate(
      userId,
      { codeParental: nouveauCode },
      { new: true }
    ).select("-motDePasse -verificationToken");

    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json({
      message: "Code parental mis à jour avec succès",
      utilisateur,
    });
  } catch (error) {
    console.error("❌ Erreur changer code parental :", error.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
