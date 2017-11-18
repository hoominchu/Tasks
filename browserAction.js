// document.getElementById("downloadData").addEventListener("click", function(){
//   chrome.runtime.sendMessage("sendTheFinalResult");
// });
//
// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
//   saveToDisk(JSON.stringify(request, null, 2), "manual");
// });

var TASKS;

chrome.storage.local.get("TASKS", function (taskObject) {
    if (taskObject["TASKS"]) {
        TASKS = taskObject["TASKS"];  //On retreiving TASKS from chrome storage, one gets an object {TASKS: balhah}, to retreive the actual array call taskObject["TASKS"]
        for (var task_id in TASKS) {
            if (task_id != "lastAssignedId") {
                var colElement = document.createElement("col-lg-2");
                var card = document.createElement("div");
                var cardBody = document.createElement("div");
                var cardTaskName = document.createElement("p");
                var buttonGroup = document.createElement("div");
                var openTaskButton = document.createElement("button");
                card.className = "card border-dark round-corner";
                cardBody.className = "card-body text-center";
                cardTaskName.innerText = TASKS[task_id].name;
                buttonGroup.className = "btn-group";
                openTaskButton.className = "btn btn-outline-primary round-corner task";
                openTaskButton.type = "button";
                openTaskButton.innerText = "Open Task";
                openTaskButton.id = TASKS[task_id].id;
                colElement.appendChild(card);
                card.appendChild(cardBody);
                cardBody.appendChild(cardTaskName);
                buttonGroup.appendChild(openTaskButton);
                card.appendChild(buttonGroup);
                // buttonGroup.style = "margin-bottom : 0.2em";

                document.getElementById("tasks").appendChild(colElement);

                // var openTaskButton = document.createElement("li");
                // openTaskButton.className = "btn btn-outline-primary round-corner task";
                // openTaskButton.type = "button";
                // openTaskButton.innerText = "Open Task";
                // openTaskButton.id = TASKS[task_id].id;
                // document.getElementById("tasks").appendChild(openTaskButton);


                // var li = document.createElement("li");
                // var cancelButton = document.createElement("p");
                // cancelButton.innerText = "Delete";
                // cancelButton.className = "delete"
                // li.innerText = TASKS[task_id].name;
                // li.id = TASKS[task_id].id;
                // li.className = "task";
                // li.appendChild(cancelButton);
                // document.getElementById("tasks").appendChild(li);
            }
        }
        for (var i = 0; i < document.getElementsByClassName("task").length; i++) {
            document.getElementsByClassName("task")[i].addEventListener("click", function (task) {
                return function (task) {
                    chrome.runtime.sendMessage(
                        {
                            "type": "switch-task",
                            "nextTaskId": task.srcElement.id
                        }
                    );
                }(task);
            });
            // document.getElementsByClassName("delete")[i].addEventListener("click", function (deleteButton) {
            //     return function (deleteButton) {
            //         chrome.runtime.sendMessage(
            //             {
            //                 "type": "delete-task",
            //                 "taskToRemove": deleteButton.srcElement.parentElement.id
            //             }
            //         );
            //     }(deleteButton);
            // });
        }
    }
});


document.getElementById("createTask").addEventListener("click", function () {
    chrome.runtime.sendMessage(
        {
            "type": "create-task",
            "taskName": document.getElementById("taskName").value,
            "tabs": [],
            "activated": true
        }
    );
});

// chrome.getElementById("work").addEventListener("click", function(){
//   chrome.runtime.sendMessage("work");
// });
//
// chrome.getElementById("play").addEventListener("click", function(){
//   chrome.runtime.sendMessage("play");
// });
