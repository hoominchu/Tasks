window.onload = function () {
  chrome.storage.local.get("TASKS", function (taskObject) {
    if(taskObject["TASKS"]){
      console.log(taskObject["TASKS"])
      showTasks(taskObject["TASKS"]);

    }
  });
}

$("#downloadTasks").click(function(){
  chrome.runtime.sendMessage({
    "type": "download-tasks"
  });
});
