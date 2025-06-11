const Avis = require("../models/Avis");

exports.getAvis = async (req, res, next) => {
    try {
      const avis = await Avis.find().populate("idUser", "nom avatar"); // 🔥 Récupère nom + avatar depuis User
      res.status(200).json({ success: true, data: avis });
    } catch (err) {
      next(err);
    }
  };
  
exports.createAvis = async (req, res, next) => {
  try {
    const newAvis = new Avis(req.body);
    await newAvis.save();
    res.status(201).json({ success: true, data: newAvis });
  } catch (err) {
    next(err);
  }
};
