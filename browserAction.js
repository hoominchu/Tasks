window.onload = function () {
  chrome.storage.local.get("TASKS", function (taskObject) {
    showTasks(taskObject);


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
        document.getElementsByClassName("rename")[i].addEventListener("click", function (task) {
            return function (task) {
                // var foo = prompt("Give me input");
                document.getElementById(task.srcElement.id).style.display = "None";
                chrome.runtime.sendMessage(
                    {
                        "type": "rename-task",
                        "taskId": task.srcElement.id,
                        "newTaskName": "hjgjhg"
                    }
                );
            }(task);
        });
        document.getElementsByClassName("delete")[i].addEventListener("click", function (deleteButton) {
            return function (deleteButton) {
                document.getElementById(deleteButton.srcElement.parentElement.id).style.display = "None";
                chrome.runtime.sendMessage(
                    {
                        "type": "delete-task",
                        "taskToRemove": deleteButton.srcElement.parentElement.id
                    }
                );
            }(deleteButton);
        });
      }


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
});}



// chrome.getElementById("work").addEventListener("click", function(){
//   chrome.runtime.sendMessage("work");
// });
//
// chrome.getElementById("play").addEventListener("click", function(){
//   chrome.runtime.sendMessage("play");
// });
