require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Task = require("../models/Tasks"); // Import du modèle

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/tasksDB";

// Connexion à MongoDB
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connecté"))
  .catch((err) => console.error("Erreur de connexion MongoDB :", err));

// **Routes CRUD**
// 1. Récupérer toutes les tâches
// app.get("/tasks", async (req, res) => {
//   try {
//     const tasks = await Task.find();
//     res.json(tasks);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

app.get("/tasks", async (req, res) => {
    try {
      let filter = {}; // Filtrage dynamique
  
      // **1. Filtres**
      if (req.query.statut) filter.statut = req.query.statut;
      if (req.query.priorite) filter.priorite = req.query.priorite;
      if (req.query.categorie) filter.categorie = req.query.categorie;
      if (req.query.etiquette)
        filter.etiquettes = { $in: [req.query.etiquette] }; // Recherche par étiquette
  
      // Filtrer par date d'échéance avant/après
      if (req.query.apres || req.query.avant) {
        filter.echeance = {};
        if (req.query.apres) filter.echeance.$gte = new Date(req.query.apres);
        if (req.query.avant) filter.echeance.$lte = new Date(req.query.avant);
      }
  
      // Recherche par mot-clé dans titre ou description
      if (req.query.q) {
        filter.$or = [
          { titre: { $regex: req.query.q, $options: "i" } },
          { description: { $regex: req.query.q, $options: "i" } },
        ];
      }
  
      // **2. Tri**
      let sort = {};
      if (req.query.tri) {
        sort[req.query.tri] = req.query.ordre === "desc" ? -1 : 1;
      }
  
      // Exécuter la requête avec les filtres et le tri
      const tasks = await Task.find(filter).sort(sort);
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });  

// 2. Récupérer une tâche par ID
app.get("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Tâche non trouvée" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Créer une nouvelle tâche
app.post("/tasks", async (req, res) => {
  try {
    const newTask = new Task(req.body);
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. Modifier une tâche existante
app.put("/tasks/:id", async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedTask)
      return res.status(404).json({ message: "Tâche non trouvée" });
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 5. Supprimer une tâche
app.delete("/tasks/:id", async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask)
      return res.status(404).json({ message: "Tâche non trouvée" });
    res.json({ message: "Tâche supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/tasks/:id/subtasks", async (req, res) => {
    try {
      const { titre, statut, echeance } = req.body;
      const task = await Task.findById(req.params.id);
  
      if (!task) return res.status(404).json({ message: "Tâche non trouvée" });
  
      // Ajouter la sous-tâche à la liste
      task.sousTaches.push({ titre, statut, echeance });
      await task.save();
  
      res.status(201).json(task);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

app.put("/tasks/:taskId/subtasks/:subtaskId", async (req, res) => {
    try {
      const { titre, statut, echeance } = req.body;
      const task = await Task.findById(req.params.taskId);
  
      if (!task) return res.status(404).json({ message: "Tâche non trouvée" });
  
      // Trouver la sous-tâche et la mettre à jour
      const subtask = task.sousTaches.id(req.params.subtaskId);
      if (!subtask) return res.status(404).json({ message: "Sous-tâche non trouvée" });
  
      if (titre) subtask.titre = titre;
      if (statut) subtask.statut = statut;
      if (echeance) subtask.echeance = echeance;
  
      await task.save();
      res.json(task);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});
   
app.delete("/tasks/:taskId/subtasks/:subtaskId", async (req, res) => {
    try {
      const task = await Task.findById(req.params.taskId);
      if (!task) return res.status(404).json({ message: "Tâche non trouvée" });
  
      // Supprimer la sous-tâche
      task.sousTaches = task.sousTaches.filter(
        (subtask) => subtask._id.toString() !== req.params.subtaskId
      );
  
      await task.save();
      res.json({ message: "Sous-tâche supprimée", task });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});
  
app.post("/tasks/:id/comments", async (req, res) => {
    try {
      const { auteur, contenu } = req.body;
      const task = await Task.findById(req.params.id);
  
      if (!task) return res.status(404).json({ message: "Tâche non trouvée" });
  
      // Ajouter le commentaire
      task.commentaires.push({ auteur, contenu, date: new Date() });
      await task.save();
  
      res.status(201).json(task);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});
  
app.delete("/tasks/:taskId/comments/:commentId", async (req, res) => {
    try {
      const task = await Task.findById(req.params.taskId);
      if (!task) return res.status(404).json({ message: "Tâche non trouvée" });
  
      // Supprimer le commentaire
      task.commentaires = task.commentaires.filter(
        (comment) => comment._id.toString() !== req.params.commentId
      );
  
      await task.save();
      res.json({ message: "Commentaire supprimé", task });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});
  


// **Démarrage du serveur**
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur http://localhost:${PORT}`);
});
