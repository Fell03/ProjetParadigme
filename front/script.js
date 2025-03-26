const apiUrl = "http://localhost:5000/tasks";

// **1. Charger les tâches avec filtres**
async function loadTasks() {
    const filterStatut = document.getElementById("filterStatut").value;
    let url = apiUrl;
    if (filterStatut) {
        url += `?statut=${filterStatut}`;
    }

    const response = await fetch(url);
    const tasks = await response.json();
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    tasks.forEach(task => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${task.titre} - ${task.statut}</span>
            <button onclick="editTask('${task._id}', '${task.titre}', '${task.description}', '${task.statut}')">✏️</button>
            <button onclick="deleteTask('${task._id}')">🗑</button>
            <button onclick="showSubtasks('${task._id}')">📂</button>
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

// **5. Afficher les sous-tâches**
async function showSubtasks(taskId) {
    const response = await fetch(`${apiUrl}/${taskId}`);
    const task = await response.json();
    alert(`Sous-tâches de ${task.titre} : \n` + task.sousTaches.map(sub => `- ${sub.titre} (${sub.statut})`).join("\n"));
}

// Charger les tâches au démarrage
loadTasks();
