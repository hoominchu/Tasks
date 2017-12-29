function showTasks(Tasks){
    for (var task_id in Tasks) {
        if (task_id != "lastAssignedId") {

          var col = $("<div class='col-lg-4'></div>");

          if(Tasks[task_id].isActive){
            var card = $("<div>", {
                        "class": "card text-white bg-success mb-3 task",
                        "style": "max-width: 20rem; height:16em;",
                        "id": task_id
                      });
          }
          else{
            var card = $("<div>", {
                        "class": "card text-white bg-primary mb-3 task",
                        "style": "max-width: 20rem; height:16em;",
                        "id": task_id
                      });
          }

          var card_header = $("<div>", {"class": "card-header", "text": Tasks[task_id].name});
          var card_body = $("<div>", {"class": "card-body"});
          var card_thumbnail = $("<h1 class='text-center' style='font-size:500%; font-weight:bold'>"+Tasks[task_id].name.slice(0,4)+"</h1>")
          //var card_toolbar = $("<div>")
          //var renameButton = $("<button>", {"text": "Rename", "class":"btn rename round-corner", "type": "button", "id": "rename_"+Tasks[task_id].id});
          //var deleteButton = $("<button>", {"text": "Delete", "class":"btn btn-danger delete round-corner-right", "type": "button", "id": "delete_"+Tasks[task_id].id});

          //card_toolbar.append(renameButton);
          //card_toolbar.append(deleteButton);

          card_body.append(card_thumbnail);


          card.append(card_header);
          card.append(card_body);
          //card.append(card_toolbar);


          col.append(card);
          $("#tasks-container").append(col);
        }
    }
}
