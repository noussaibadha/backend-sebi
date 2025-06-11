const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contactSchema = new Schema({
    prenom :{
        type: String, 
        required: [true, "Le prénom est obligatoire"],
        minlength: [2, "Le prénom doit contenir au moins 2 caractères"],
        maxlength: [75, "Le prénom doit contenir au maximum 75 caractères"],
    },
    nom: {
        type: String,
        required: [true, "Le nom est obligatoire"],
        minlength: [2, "Le nom doit contenir au moins 2 caractères"],
        maxlength: [75, "Le nom doit contenir au maximum 75 caractères"],
    },
    email: {
        type: String,
        required: [true, "L'email est obligatoire"],
        minlength: [5, "L'email doit contenir au moins 5 caractères"],
        maxlength: [100, "L'email doit contenir au maximum 100 caractères"],
    },
    message: {
        type: String,
        required: [true, "Le message est obligatoire"],
        minlength: [5, "Le message doit contenir au moins 5 caractères"],
        maxlength: [500, "Le message doit contenir au maximum 500 caractères"],
    },
    date: {
        type: Date,
        default: Date.now,
    },
});


const DataContact = mongoose.model("contact", contactSchema); 
module.exports = DataContact;
