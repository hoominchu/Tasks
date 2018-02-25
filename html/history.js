var idOfSelectedTask = 0;

chrome.storage.local.get("TASKS", function (taskObject) {
  if(taskObject["TASKS"]){
    var Tasks = taskObject["TASKS"];
    console.log(Tasks)
    for(var task_id in Tasks){
      if(task_id != "lastAssignedId"){
        $("#tasks-list").append('<button type="button" class="btn btn-primary tasks" id="'+Tasks[task_id].id+'"> '+Tasks[task_id].name+'</button>');
      }
    }
    $(".tasks").click(function(){
      idOfSelectedTask = Tasks[$(this).attr('id')].id;
      $("#historyTable").empty()
      var selectedTask = Tasks[$(this).attr('id')];
      for(var i = selectedTask.history.length-1; i>-1; i--){
        createRow(selectedTask.history[i])
      }
    });
    };
});

function createRow(page){

    var tableRow = $('<tr></tr>')

    tableRow.append('<td><a href="'+page.url+'">'+page.title+'</a></td>');

    if(page.isLiked){
      tableRow.append('<td>Yes</td>');
    }
    else{
      tableRow.append('<td></td>')
    }

    var td = $('<td></td>')

    // if(page.totalTimeSpent.seconds>0){
    //   td.text(page.totalTimeSpent.seconds + " seconds")
    // }
    // if(page.totalTimeSpent.minutes>0){
    //   td.text(page.totalTimeSpent.minutes + " minutes")
    // }
    // if(page.totalTimeSpent.hours>0){
    //   td.text(page.totalTimeSpent.hours + " hours");
    // }
    if(!Number.isNaN(page.totalTimeSpent))
    td.text(page.totalTimeSpent+ " minutes")

    tableRow.append(td)
    tableRow.append('<td>' + page.timeVisited[page.timeVisited.length-1].slice(0,25) + '</td>')

    $("#historyTable").append(tableRow)
  }


var table = $("#table");

$('#title, #liked, #time, #lastVisit')
    .wrapInner('<span title="sort this column"/>')
    .each(function(){

        var th = $(this),
            thIndex = th.index(),
            inverse = false;

        th.click(function(){

            table.find('td').filter(function(){

                return $(this).index() === thIndex;

            }).sortElements(function(a, b){

                return $.text([a]) > $.text([b]) ?
                    inverse ? -1 : 1
                    : inverse ? 1 : -1;

            }, function(){

                // parentNode is the element we want to move
                return this.parentNode;

            });

            inverse = !inverse;

        });

    });

$("#openLikedPages").click(function(){
  chrome.runtime.sendMessage({
    "type": "open-liked-pages",
    "taskId": idOfSelectedTask
  });
});
