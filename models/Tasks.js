const mongoose = require("mongoose");

const commentaireSchema = new mongoose.Schema({
  auteur: {
    nom: String,
    prenom: String,
    email: String,
  },
  date: { type: Date, default: Date.now },
  contenu: String,
});

const sousTacheSchema = new mongoose.Schema({
  titre: String,
  statut: {
    type: String,
    enum: ["à faire", "en cours", "terminée", "annulée"],
    default: "à faire",
  },
  echeance: Date,
});

const historiqueSchema = new mongoose.Schema({
  champModifie: String,
  ancienneValeur: mongoose.Schema.Types.Mixed,
  nouvelleValeur: mongoose.Schema.Types.Mixed,
  date: { type: Date, default: Date.now },
});

const taskSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: String,
  dateCreation: { type: Date, default: Date.now },
  echeance: Date,
  statut: {
    type: String,
    enum: ["à faire", "en cours", "terminée", "annulée"],
    default: "à faire",
  },
  priorite: {
    type: String,
    enum: ["basse", "moyenne", "haute", "critique"],
    default: "moyenne",
  },
  auteur: {
    nom: String,
    prenom: String,
    email: String,
  },
  categorie: String,
  etiquettes: [String],
  sousTaches: [sousTacheSchema],
  commentaires: [commentaireSchema],
  historiqueModifications: [historiqueSchema],
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
