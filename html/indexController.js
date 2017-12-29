window.onload = function () {
  chrome.storage.local.get("TASKS", function (taskObject) {
    if(taskObject["TASKS"]){
      console.log(taskObject["TASKS"])
      showTasks(taskObject["TASKS"]);
      for (var i = 0; i < document.getElementsByClassName("task").length; i++) {
          console.log("hello");
          document.getElementsByClassName("task")[i].addEventListener("click", function (task) {
              console.log($(task).closest(".card").attr("id"));
              return function (task) {
                  chrome.runtime.sendMessage(
                      {
                          "type": "switch-task",
                          "nextTaskId": $(task.srcElement).closest(".card").attr("id")
                      }
                  );
              }(task);
          });
        }

      document.getElementById("createTask").addEventListener("click", function () {
        sendCreateTaskMessage();
      });

    }
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

$("#downloadTasks").click(function(){
  chrome.runtime.sendMessage({
    "type": "download-tasks"
  });
});
