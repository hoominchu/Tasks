window.onload = function () {

    chrome.storage.local.get("TASKS", function (taskObject) {

        if (taskObject["TASKS"]) {



            showTasks(taskObject["TASKS"]);

            funcOnClick("openTask", "class", function (element) {
                return function (element) {
                        chrome.runtime.sendMessage(
                            {
                                "type": "switch-task",
                                "nextTaskId": $(element.srcElement).closest(".card").attr("id"),
                            }
                        )(element);
                }

            });


            funcOnClick("archiveTask", "class", function (element) {
                return function (element) {
                    chrome.runtime.sendMessage(
                        {
                            "type": "archive-task",
                            "taskId": $(element.srcElement).closest(".card").attr("id")
                        }
                    );
                    location.reload();
                }(element);
            });

            funcOnClick("deleteTask", "class", function (element) {
                var Tasks = taskObject["TASKS"];
                if(Tasks[$(element.srcElement).closest(".card").attr("id")].isActive){
                    alert("Task is active. Can't delete.");
                }
                else{
                    return function (element) {
                        chrome.runtime.sendMessage(
                            {
                                "type": "delete-task",
                                "taskToRemove": $(element.srcElement).closest(".card").attr("id")
                            }
                        );
                        location.reload();
                    }(element);
                }

            });

            funcOnClick("renameTask", "class", function (element) {

                var renameElement = element;

                $('#renameModal').modal('show');

                funcOnClick("renameSubmit", "id", function (e) {
                    return function (element) {
                        chrome.runtime.sendMessage(
                            {
                                "type": "rename-task",
                                "taskId": $(renameElement.srcElement).closest(".card").attr("id"),
                                "newTaskName": $("#newNameForTask").val()
                            }
                        );
                        location.reload();

                    }(e);

                });
            })

        }
    });


};

document.getElementById("createTask").addEventListener("click", function(){
    var closeCurrentTask = confirm("Switch to the new task?")
    sendCreateTaskMessage(closeCurrentTask);
});

function sendCreateTaskMessage(closeCurrentTask) {
    chrome.tabs.query({}, function (tabs) {
        if(closeCurrentTask){
            chrome.runtime.sendMessage(
                {
                    "type": "create-task",
                    "taskName": document.getElementById("taskName").value,
                    "createFromCurrentTabs": document.getElementById("createFromCurrentTabs").checked,
                    "tabs": tabs,
                    "activated": true
                }
            );
        }
        else{
            chrome.runtime.sendMessage(
                {
                    "type": "create-task",
                    "taskName": document.getElementById("taskName").value,
                    "createFromCurrentTabs": document.getElementById("createFromCurrentTabs").checked,
                    "tabs": tabs,
                    "activated": false
                }
            );
        }
    });
}

function funcOnClick(classNameOrIdName, type, func) {
    if (type == "class") {
        for (var i = 0; i < document.getElementsByClassName(classNameOrIdName).length; i++) {
            document.getElementsByClassName(classNameOrIdName)[i].addEventListener("click", function (element) {
                func(element);
            });
        }
    }
    if (type == "id") {
        document.getElementById(classNameOrIdName).addEventListener("click", function (element) {
            func(element);
        });
    }

}


$("#downloadTasks").click(function () {
    chrome.runtime.sendMessage({
        "type": "download-tasks"
    });
});
