// function showStats(tasks, ctaskid) {
//       for(var i = 0; i<TASKS[0].activationTime.length; i++){
//         var date1 = new Date(TASKS[0].activationTime[i]);
//         var date2 = new Date(TASKS[0].deactivationTime[i]);
//         var timeDiff = Math.abs(date2.getTime() - date1.getTime());
//         var diffDays = Math.ceil(timeDiff / (1000 * 3600));
//         console.log("Minutes Difference " + diffDays)
//     }
//     console.log(ctaskid);
//     ctaskidString = ctaskid.toString();
//     $("#currentTask").text(tasks[ctaskidString].name);
//
//     function showTime() {
//         var lastActivation = tasks[ctaskidString].activationTime[tasks[ctaskidString].activationTime.length - 1];
//         var currentTime = new Date();
//
//         function returnDuration(endingTime, startingTime) {
//             var startingTime = new Date(startingTime);
//             var endingTime = new Date(endingTime);
//             var hours = Math.abs(endingTime.getHours() - startingTime.getHours());
//             var minutes = Math.abs(endingTime.getMinutes() - startingTime.getMinutes());
//             var seconds = Math.abs(endingTime.getSeconds() - startingTime.getSeconds());
//             var duration = {
//                 "hours": hours,
//                 "minutes": minutes,
//                 "seconds": seconds
//             };
//             return duration;
//         }
//
//         $("#time-hours").text(returnDuration(currentTime, lastActivation).hours + " hours");
//         $("#time-minutes").text(returnDuration(currentTime, lastActivation).minutes + " minutes");
//         $("#time-seconds").text(returnDuration(currentTime, lastActivation).seconds + " seconds");
//     }
//
//     setInterval(showTime, 1000);
//
// }

function showStats(tasks){
  var TASKS = tasks;
  var taskToTime = [];
  for(var taskId in tasks){
    if(taskId != "lastAssignedId"){
      var totalTime = 0;
      for(var i = 0; i<TASKS[taskId].deactivationTime.length; i++){
        var date1 = new Date(TASKS[taskId].activationTime[i]);
        var date2 = new Date(TASKS[taskId].deactivationTime[i]);
        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
        var timeDiffMins = Math.ceil(timeDiff / (1000 * 3600));
        totalTime = totalTime+timeDiffMins;
      }
      if(TASKS[taskId].deactivationTime.length < TASKS[taskId].activationTime.length){
        var currentTime = new Date();
        var lastActivatedTime = new Date(TASKS[taskId].activationTime[TASKS[taskId].activationTime.length]);
        var timeDiff = Math.abs(currentTime.getTime() - lastActivatedTime.getTime());
        var timeDiffMins = Math.ceil(timeDiff / (1000 * 3600));
        totalTime = totalTime+timeDiffMins;
      }
      taskToTime[taskId] = totalTime;
      console.log("Time Spent on " + tasks[taskId].name + " is " + totalTime + " minutes.");
    }
  }
}
