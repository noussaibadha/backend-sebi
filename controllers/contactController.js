const Contact = require("../models/Contact");

exports.contact = async (req, res) => {
  const { prenom, nom, email, message } = req.body;

  console.log("Requête reçue :", req.body);

  // ✅ Validation des champs requis
  if (!prenom || !nom || !email || !message) {
    return res.status(400).json({ 
      message: "Tous les champs sont requis (prenom, nom, email, message)" 
    });
  }

  try {
    let contact = new Contact({ prenom, nom, email, message });
    await contact.save();
    
    console.log("✅ Message de contact sauvegardé :", contact._id);
    res.status(201).json({ message: "Formulaire de contact envoyé avec succès" });
  } catch (error) {
    console.error("❌ Erreur lors de la sauvegarde :", error);
    
    // ✅ Gestion spécifique des erreurs de validation
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Erreur de validation", 
        errors: messages 
      });
    }
    
    res.status(500).json({ message: "Erreur serveur lors de l'enregistrement du message" });
  }
};

// ✅ Nouvelle fonction pour récupérer tous les messages
exports.getTousLesMessages = async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 }); // Tri par date décroissante
    console.log(`✅ ${messages.length} messages récupérés`);
    res.status(200).json(messages);
  } catch (error) {
    console.error("❌ Erreur récupération messages :", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des messages" });
  }
};
