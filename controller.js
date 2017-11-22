window.onload = function () {
  chrome.storage.local.get("TASKS", function (taskObject) {
    if(taskObject["TASKS"]){
      showTasks(taskObject["TASKS"]);

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
        document.getElementsByClassName("rename")[i].addEventListener("click", function (task) {
            return function (task) {
                $("#tasks").replaceWith('<form id="renameForm"><div class="form-group"><label for="newTaskName">What would you like to name the task?</label><input type="text" class="form-control" id="renameInput" aria-describedby="newNameForTask" placeholder="New Name"></div><button type="submit" class="btn btn-primary">Rename Task</button></form>');
                $("#renameForm").submit(function(){
                  chrome.runtime.sendMessage(
                      {
                          "type": "rename-task",
                          "taskId": task.srcElement.id,
                          "newTaskName":$("#renameInput").val()
                      }
                  );
                });
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
        chrome.tabs.query({}, function(tabs){
          chrome.runtime.sendMessage(
              {
                  "type": "create-task",
                  "taskName": document.getElementById("taskName").value,
                  "createFromCurrentTabs": document.getElementById("createFromCurrentTabs").checked,
                  "tabs": tabs,
                  "activated": true
              }
          );
        });
});
});}



// chrome.getElementById("work").addEventListener("click", function(){
//   chrome.runtime.sendMessage("work");
// });
//
// chrome.getElementById("play").addEventListener("click", function(){
//   chrome.runtime.sendMessage("play");
// });
