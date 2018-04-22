function showTasks(Tasks) {
    for (var task_id in Tasks) {
        if (task_id != "lastAssignedId" && Tasks[task_id].id != 0 && !(Tasks[task_id].archived)) {
            setUpUnarchivedTasks(Tasks, task_id);
        }
        else if (task_id != "lastAssignedId" && Tasks[task_id].id != 0 && Tasks[task_id].archived) {
            setUpArchivedTasks(Tasks, task_id);
        }
    }
}

function setUpUnarchivedTasks(Tasks, task_id){
    var col = $("<div class='col-lg-3'></div>");

    if (Tasks[task_id].isActive) {
        var card = $("<div>", {
            "class": "card border-primary mb-3 task",
            "style": "max-width: 20rem; height:12em; border-radius:0.8em",
            "id": task_id
        });
    }
    else {
        var card = $("<div>", {
            "class": "card border-secondary mb-3 task",
            "style": "max-width: 20rem; height:12em; border-radius:0.8em",
            "id": task_id
        });
    }

    var card_header = $("<div>", {"class": "card-header", "text": Tasks[task_id].name});
    var card_body = $("<div>", {"class": "card-body text-dark"});
    var card_buttons = $("<div>", {"class": "btn-group"});
    var open_button = $("<button class='btn btn-outline-success btn-sm round-corner-left openTask' type='button' id='" + Tasks[task_id].id + "'>Open</button>");
    var rename_button = $("<button class='btn btn-outline-dark btn-sm renameTask' type='button' id='" + Tasks[task_id].id + "'>Rename</button>");
    var delete_button = $("<button class='btn btn-outline-danger btn-sm round-corner-right deleteTask' type='button' id='" + Tasks[task_id].id + "'>Delete</button>");
    var archive_button = $("<button class='btn btn-outline-dark btn-sm archiveTask' type='button' id='" + Tasks[task_id].id + "'>Archive</button>");

    card_buttons.append(open_button);
    card_buttons.append(rename_button);
    card_buttons.append(archive_button);
    card_buttons.append(delete_button);
    card_body.append(card_buttons);

    card.append(card_header);
    card.append(card_body);


    col.append(card);
    $("#tasks-container").append(col);
}

function setUpArchivedTasks(Tasks, task_id){
    var col = $("<div class='col-lg-3'></div>");

    if (Tasks[task_id].isActive) {
        var card = $("<div>", {
            "class": "card border-primary mb-3 task",
            "style": "max-width: 20rem; height:12em; border-radius:0.8em",
            "id": task_id
        });
    }
    else {
        var card = $("<div>", {
            "class": "card border-secondary mb-3 task",
            "style": "max-width: 20rem; height:12em; border-radius:0.8em",
            "id": task_id
        });
    }

    var card_header = $("<div>", {"class": "card-header", "text": Tasks[task_id].name});
    var card_body = $("<div>", {"class": "card-body text-dark"});
    var card_buttons = $("<div>", {"class": "btn-group"});
    var open_button = $("<button class='btn btn-outline-success btn-sm round-corner-left openTask' type='button' id='" + Tasks[task_id].id + "'>Open</button>");
    var rename_button = $("<button class='btn btn-outline-dark btn-sm round-corner renameTask' type='button' id='" + Tasks[task_id].id + "'>Rename</button>");
    var delete_button = $("<button class='btn btn-outline-danger btn-sm round-corner-right deleteTask' type='button' id='" + Tasks[task_id].id + "'>Delete</button>");
    var archive_button = $("<button class='btn btn-outline-dark btn-sm round-corner archiveTask' type='button' id='" + Tasks[task_id].id + "'>Unarchive</button>");

    // card_buttons.append(open_button);
    // card_buttons.append(rename_button);
    card_buttons.append(archive_button);
    card_buttons.append(delete_button);
    card_body.append(card_buttons);

    card.append(card_header);
    card.append(card_body);

    col.append(card);
    $("#archived-tasks").append(col);
}
