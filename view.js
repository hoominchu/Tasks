function showTasks(Tasks) {
    for (var task_id in Tasks) {
        if (task_id != "lastAssignedId") {
            var li = document.createElement("li");
            var taskName = document.createElement("button");
            taskName.innerText = Tasks[task_id].name;
            taskName.className = "btn btn-outline-primary round-corner-left task bold-text";
            taskName.id = Tasks[task_id].id;
            taskName.type = "button";
            // var openButton = document.createElement("button");
            // openButton.innerText = "Open Task";
            // openButton.className = "btn btn-outline-primary task";
            // openButton.type = "button";
            // openButton.id = Tasks[task_id].id;
            var renameButton = document.createElement("button");
            renameButton.innerText = "Rename";
            renameButton.className = "btn btn-outline-primary rename";
            renameButton.type = "button";
            renameButton.id = Tasks[task_id].id;
            var cancelButton = document.createElement("button");
            cancelButton.innerText = "Delete";
            cancelButton.className = "btn btn-outline-danger delete round-corner-right";
            cancelButton.type = "button";
            // li.innerText = Tasks[task_id].name + "  ";
            li.id = Tasks[task_id].id;
            li.className = "margin";
            li.appendChild(taskName);
            li.appendChild(renameButton);
            li.appendChild(cancelButton);
            document.getElementById("tasks").appendChild(li);
        }
    }
}
