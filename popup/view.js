function showTasks(Tasks) {
    for (var task_id in Tasks) {
        if (task_id != "lastAssignedId" && Tasks[task_id].id!= 0 && !Tasks[task_id].archived) {
            appendTask(task_id, Tasks);
        }
    }
}

function appendTask(task_id, Tasks){
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

function changeLoginStatusMessage() {
    var email_var = "";
    var isSignedIn_var;
    chrome.storage.local.get("email", function(e){
        email_var = e["email"];
        console.log("Email is " + email_var);
    });
    chrome.storage.local.get("isSignedIn", function (loginStatus) {
        isSignedIn_var = loginStatus["isSignedIn"];
        if (isSignedIn_var) {
            document.getElementById("loginstatus").innerText = "Hello, " + email_var + "!";
        }
        else {
            document.getElementById("loginstatus").innerText = "You are not logged in.";
        }
    });
}
