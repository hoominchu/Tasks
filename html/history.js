chrome.storage.local.get("TASKS", function (taskObject) {
  if(taskObject["TASKS"]){
    var Tasks = taskObject["TASKS"];
    for(var task_id in Tasks){
      if(task_id != "lastAssignedId"){
        $("#tasks-list").append('<button type="button" class="btn btn-primary tasks" id="'+Tasks[task_id].id+'"> '+Tasks[task_id].name+'</button>');
      }
    }
    $(".tasks").click(function(){
      $("#urls-list").empty()
      var selectedTask = Tasks[$(this).attr('id')];
      console.log(selectedTask);
      for(var i = selectedTask.history.length-1; i>-1; i--){
        $("#urls-list").append('<li><a href="'+selectedTask.history[i].url+'">'+selectedTask.history[i].url+'</a></li>');
      }
    });
  }
});
