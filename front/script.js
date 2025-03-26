const apiUrl = "http://localhost:5000/tasks";

// **1. Charger les tâches avec les commentaires**
async function loadTasks() {
    const filterStatut = document.getElementById("filterStatut").value;
    const filterPriorite = document.getElementById("filterPriorite").value;
    
    let url = apiUrl;
    const params = [];
    if (filterStatut) params.push(`statut=${filterStatut}`);
    if (filterPriorite) params.push(`priorite=${filterPriorite}`);
    if (params.length > 0) url += `?${params.join("&")}`;

    const response = await fetch(url);
    const tasks = await response.json();
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    tasks.forEach(task => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${task.titre} - ${task.statut} - ${task.priorite}</span>
            <button onclick="editTask('${task._id}', '${task.titre}', '${task.description}', '${task.statut}')">✏️</button>
            <button onclick="deleteTask('${task._id}')">🗑</button>
            <button onclick="addComment('${task._id}')">💬 Ajouter un commentaire</button>
            <button onclick="toggleDetails('${task._id}')">🔍 Détails</button>
            <div id="details-${task._id}" class="details-section" style="display: none;"></div>
        `;
        taskList.appendChild(li);
    });
}

// **2. Ajouter une tâche**
document.getElementById("taskForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const newTask = {
        titre: document.getElementById("titre").value,
        description: document.getElementById("description").value,
        statut: document.getElementById("statut").value
    };

    await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask)
    });

    e.target.reset();
    loadTasks();
});

// **3. Modifier une tâche**
async function editTask(id, titre, description, statut) {
    const newTitre = prompt("Nouveau titre :", titre);
    const newDescription = prompt("Nouvelle description :", description);
    const newStatut = prompt("Nouveau statut (à faire, en cours, terminée, annulée) :", statut);

    if (newTitre !== null && newStatut !== null) {
        await fetch(`${apiUrl}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ titre: newTitre, description: newDescription, statut: newStatut })
        });
        loadTasks();
    }
}

// **4. Supprimer une tâche**
async function deleteTask(id) {
    if (confirm("Voulez-vous vraiment supprimer cette tâche ?")) {
        await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
        loadTasks();
    }
}

// **5. Ajouter un commentaire**
async function addComment(taskId) {
    const contenu = prompt("Votre commentaire :");
    if (!contenu) return;

    await fetch(`${apiUrl}/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            auteur: { nom: "Utilisateur", prenom: "Test", email: "test@example.com" },
            contenu: contenu
        })
    });

    alert("Commentaire ajouté !");
    loadTasks();
}

// **6. Voir les commentaires sous la tâche**
async function toggleDetails(taskId) {
    const detailsSection = document.getElementById(`details-${taskId}`);

    if (detailsSection.style.display === "none") {
        const response = await fetch(`${apiUrl}/${taskId}`);
        const task = await response.json();

        let sousTachesHtml = `<h4>Sous-tâches :</h4>`;
        sousTachesHtml += task.sousTaches.length > 0 ? `<ul>` + 
            task.sousTaches.map(sub => 
                `<li>${sub.titre} - ${sub.statut} (Échéance : ${new Date(sub.echeance).toLocaleDateString()})</li>`
            ).join("") + `</ul>` : `<p>Aucune sous-tâche.</p>`;

        let commentairesHtml = `<h4>Commentaires :</h4>`;
        commentairesHtml += task.commentaires.length > 0 ? `<ul>` + 
            task.commentaires.map(comment => 
                `<li><strong>${comment.auteur.nom}</strong>: ${comment.contenu} (${new Date(comment.date).toLocaleString()})</li>`
            ).join("") + `</ul>` : `<p>Aucun commentaire.</p>`;

        detailsSection.innerHTML = sousTachesHtml + commentairesHtml;
        detailsSection.style.display = "block";
    } else {
        detailsSection.style.display = "none";
    }
}

// **7. Voir l'historique des modifications**
async function showHistory(taskId) {
    const response = await fetch(`${apiUrl}/${taskId}/history`);
    const history = await response.json();

    alert("Historique des modifications : \n" + history.map(
        h => `Champ : ${h.champModifie}, Avant : ${h.ancienneValeur}, Après : ${h.nouvelleValeur}, Date : ${new Date(h.date).toLocaleString()}`
    ).join("\n"));
}

// Charger les tâches au démarrage
loadTasks();
