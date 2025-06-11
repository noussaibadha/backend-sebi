const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const avisSchema = new Schema({
    note: {
        type: Number,
        required: [true, "La note est obligatoire"],
        min: [0, "La note doit être comprise entre 0 et 5"],
        max: [5, "La note doit être comprise entre 0 et 5"],
    },
    commentaire: {
        type: String,
        required: [true, "Le commentaire est obligatoire"],
        minlength: [5, "Le commentaire doit contenir au moins 5 caractères"],
        maxlength: [500, "Le commentaire doit contenir au maximum 500 caractères"],
    },
    date: {
        type: Date,
        default: Date.now,
    },
    idUser: {
        type: mongoose.Schema.Types.ObjectId, // 🔥 Utilisation d'un ObjectId pour correspondre à un user
        ref: "User", // 🔗 Fait référence au modèle utilisateur (si tu en as un)
        required: [true, "L'ID de l'utilisateur est obligatoire"],
    },
    nomUser: {
        type: String,
        required: [true, "Le nom de l'utilisateur est obligatoire"],
        trim: true, // ✨ Supprime les espaces inutiles
    },
    avatarUser: {
        type: String,
        required: [true, "L'avatar de l'utilisateur est obligatoire"],
    },
});

const Avis = mongoose.model("Avis", avisSchema);
module.exports = Avis;
