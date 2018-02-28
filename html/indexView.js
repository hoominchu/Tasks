function showTasks(Tasks) {
    for (var task_id in Tasks) {
        if (task_id != "lastAssignedId" && Tasks[task_id].id != 0) {

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

            card_buttons.append(open_button);
            card_buttons.append(rename_button);
            card_buttons.append(delete_button);
            var card_thumbnail = $("<h1 class='text-center' style='font-size:500%; font-weight:bold'>" + Tasks[task_id].name.slice(0, 4) + "</h1>");
            //var card_toolbar = $("<div>")
            //var renameButton = $("<button>", {"text": "Rename", "class":"btn rename round-corner", "type": "button", "id": "rename_"+Tasks[task_id].id});
            //var deleteButton = $("<button>", {"text": "Delete", "class":"btn btn-danger delete round-corner-right", "type": "button", "id": "delete_"+Tasks[task_id].id});

            //card_toolbar.append(renameButton);
            //card_toolbar.append(deleteButton);

            // card_body.append(card_thumbnail);
            card_body.append(card_buttons);

            card.append(card_header);
            card.append(card_body);
            //card.append(card_toolbar);


            col.append(card);
            $("#tasks-container").append(col);
        }
    }
}
