window.onload = function(){
  chrome.storage.local.get("TASKS", function (taskObject) {
  if(taskObject["TASKS"]){
    chrome.storage.local.get("CTASKID", function(ctaskidObject){
      var tasks = taskObject["TASKS"];
      var ctaskid = ctaskidObject["CTASKID"];
      showStats(tasks, ctaskid);
    });
  }
});
}
