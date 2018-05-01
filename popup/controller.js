window.onload = function () {

    // changeLoginStatusMessage();

    chrome.storage.local.get("TASKS", function (taskObject) {
      chrome.runtime.sendMessage({"type": "give me open tasks"});
      chrome.runtime.onMessage.addListener(function (request, sender) {
        if(request.type == "array of open tasks"){
          if (taskObject["TASKS"]) {
              showTasks(taskObject["TASKS"],request.openTasks);
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
            // document.getElementsByClassName("rename")[i].addEventListener("click", function (task) {
            //     return function (task) {
            //         $("#tasks").replaceWith('<form id="renameForm"><div class="form-group"><label for="newTaskName">What would you like to name the task?</label><input type="text" class="form-control round-corner" id="renameInput" aria-describedby="newNameForTask" placeholder="New Name"></div><button type="submit" class="btn btn-primary round-corner">Rename Task</button> <button class="btn btn-secondary round-corner" id="cancelButton">Cancel</button></form>');
            //         $("#cancelButton").click(function (cancel) {
            //             location.reload();
            //         });
            //         $("#renameForm").submit(function () {
            //             if ($("#renameInput").val() != "") {
            //                 chrome.runtime.sendMessage(
            //                     {
            //                         "type": "rename-task",
            //                         "taskId": task.srcElement.id,
            //                         "newTaskName": $("#renameInput").val()
            //                     }
            //                 );
            //             }
            //         });
            //     }(task);
            // });

            document.getElementsByClassName("add")[i].addEventListener("click", function (task) {
              return function (task) {
                addToTaskMessage(task.srcElement.id);
              }(task);
            });


            document.getElementsByClassName("closeTask")[i].addEventListener("click", function (closeButton) {
                return function (closeButton) {
                    // document.getElementById(deleteButton.srcElement.parentElement.id).style.display = "None";
                    chrome.runtime.sendMessage(
                        {
                            "type": "close-task",
                            "taskId": closeButton.srcElement.parentElement.id
                        }
                    );
                    location.reload();

                }(closeButton);
            });
        }


        document.getElementById("createTask").addEventListener("click", function () {
            sendCreateTaskMessage()
        });
      }
        });
      });

        $('#taskName').keypress(function (event) {
            if (event.which == '13' && !event.shiftKey) {
                sendCreateTaskMessage();
            }
        });

}

function addToTaskMessage(taskId){
  chrome.windows.getCurrent({"populate": true}, function (window) {
      console.log(window.tabs);
      var tabs = [];
      for (var i = 0; i < window.tabs.length; i++) {
          if (window.tabs[i].highlighted) {
              tabs.push(window.tabs[i]);
          }
      }

      //tabs array is now ready to use

      //remove tabs that were highlighted
      var tabIdsToClose = [];
      for(var j = 0; j<tabs.length; j++){
        tabIdsToClose.push(tabs[j].id)
      }
      chrome.tabs.remove(tabIdsToClose);

      chrome.runtime.sendMessage(
          {
              "type": "add-to-task",
              "taskId": taskId,
              "tabs": tabs,
          });
      location.reload();
  });
}

function sendCreateTaskMessage() {
    chrome.windows.getCurrent({"populate": true}, function (window) {
        console.log(window.tabs);
        var tabs = [];
        for (var i = 0; i < window.tabs.length; i++) {
            if (window.tabs[i].highlighted) {
                tabs.push(window.tabs[i]);
            }
        }
        //If the tabs contain only the active tab then just send an empty array
        if(tabs.length < 2){
          tabs = [];
        }

        //tabs array is now ready to use

        //remove tabs that were highlighted
        var tabIdsToClose = [];
        for(var j = 0; j<tabs.length; j++){
          tabIdsToClose.push(tabs[j].id)
        }
        chrome.tabs.remove(tabIdsToClose);

        chrome.runtime.sendMessage(
            {
                "type": "create-task",
                "taskName": document.getElementById("taskName").value,
                "tabs": tabs,
                "activated": document.getElementById("closeCurrent").checked
            });
        location.reload();
    });
}

$("#history").click(function () {
    chrome.tabs.create({"url": "html/history.html"});
});

$("#search_archive").click(function () {
    chrome.tabs.create({"url": "html/searchArchive.html"});
});

$("#index").click(function () {
    chrome.tabs.create({"url": "html/index.html"});
});

$("#settings").click(function () {
    chrome.tabs.create({"url": "html/settings.html"});
});

$("#pauseTasks").click(function(){
    chrome.runtime.sendMessage({
        "type": "switch-task",
        "nextTaskId": "0"
    });
});
