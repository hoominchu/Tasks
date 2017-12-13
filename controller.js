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
                $("#tasks").replaceWith('<form id="renameForm"><div class="form-group"><label for="newTaskName">What would you like to name the task?</label><input type="text" class="form-control round-corner" id="renameInput" aria-describedby="newNameForTask" placeholder="New Name"></div><button type="submit" class="btn btn-primary round-corner">Rename Task</button> <button class="btn btn-secondary round-corner" id="cancelButton">Cancel</button></form>');
                $("#cancelButton").click(function(cancel){
                  location.reload();
                });
                $("#renameForm").submit(function(){
                  if($("#renameInput").val() != ""){
                    chrome.runtime.sendMessage(
                        {
                            "type": "rename-task",
                            "taskId": task.srcElement.id,
                            "newTaskName":$("#renameInput").val()
                        }
                    );
                  }
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
      sendCreateTaskMessage();
    });

    $('#taskName').keypress(function(event) {
      if (event.which == '13' && !event.shiftKey) {
        sendCreateTaskMessage();
       }
    });
  });
}

function sendCreateTaskMessage(){
  chrome.tabs.query({}, function(tabs){
    chrome.bookmarks.getTree(function(bookmarks){
      chrome.runtime.sendMessage(
          {
              "type": "create-task",
              "taskName": document.getElementById("taskName").value,
              "createFromCurrentTabs": document.getElementById("createFromCurrentTabs").checked,
              "tabs": tabs,
              "bookmarks": bookmarks,
              "activated": true
          }
      );
    });
  });
}

$("#history").click(function(){
  chrome.tabs.create({"url": "history.html"});
});

// chrome.getElementById("work").addEventListener("click", function(){
//   chrome.runtime.sendMessage("work");
// });
//
// chrome.getElementById("play").addEventListener("click", function(){
//   chrome.runtime.sendMessage("play");
// });
