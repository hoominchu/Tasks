"use strict";

//Set up TASKS array. Set it to empty if it doesn't exist in chrome storage, otherwise retreive it from chrome storage.
var TASKS = {
  lastAssignedId: -1
}

var CTASKID = -1;

//Initialising TASKS and CTASKID
chrome.storage.local.get("TASKS", function(taskObject){
  if(taskObject["TASKS"]){
    TASKS = taskObject["TASKS"];  //On retreiving TASKS from chrome storage, one gets an object {TASKS: balhah}, to retreive the actual array call taskObject["TASKS"]
  }
});

chrome.storage.local.get("CTASKID", function(cTaskIdObject){
  if(cTaskIdObject["CTASKID"]){
    CTASKID = cTaskIdObject["CTASKID"];
  }
})

function Task(task_id, task_name, tabs) {
    this.id = task_id;
    this.name = task_name;
    this.tabs = tabs;
}

//Helper Methods

function createTask(taskName, tabs){
  var newTask = new Task(TASKS["lastAssignedId"]+1, taskName, tabs);
  TASKS[TASKS["lastAssignedId"]+1] = newTask;
  TASKS["lastAssignedId"] = TASKS["lastAssignedId"] + 1;
  chrome.storage.local.set({"TASKS": TASKS});
}

function activateTask(task_id){
  try {
    if(TASKS[task_id].tabs.length>0){
      for(var i = 0; i<TASKS[task_id].tabs.length; i++){
        chrome.tabs.create({"url": TASKS[task_id].tabs[i].url});
      }
    }
    else{
      chrome.tabs.create({"url": "about:blank"});
    }

    CTASKID = task_id;
    chrome.storage.local.set({"CTASKID": task_id});
  }
  catch(err){
    console.log(err.message);
  }
}

function saveTask(task_id){
  if(TASKS[task_id]){
    chrome.tabs.query({}, function(allTabs){
      TASKS[task_id].tabs = allTabs;
      chrome.storage.local.set({"TASKS": TASKS});
    });
  }
}

function deactivateTask(currentTaskId){

  saveTask(currentTaskId);

  chrome.tabs.query({}, function(allTabs){
    for(var i = 0; i<allTabs.length; i++){
      chrome.tabs.remove(allTabs[i].id);
    }
  });
}

function deleteTask(task_id){
  if(TASKS[task_id]){
    delete TASKS[task_id];
    chrome.storage.local.set({"TASKS": TASKS});
  }
}

//Saving Events
chrome.runtime.onMessage.addListener(function(request, sender){
  console.log(request);

  if(request.type == "create-task"){

    createTask(request.taskName, request.tabs);

    if(request.activated){
      deactivateTask(CTASKID);
      activateTask(TASKS["lastAssignedId"]);
    }
  }

  if(request.type == "switch-task" && request.nextTaskId!=""){
    deactivateTask(CTASKID);
    activateTask(request.nextTaskId);
  }

  if(request.type == "delete-task"){
    deleteTask(request.taskToRemove);
  }


});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
      if(changeInfo.title){
        saveTask(CTASKID);
      }
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo){
      if(!removeInfo.isWindowClosing){
        saveTask(CTASKID);
      }
});


// chrome.runtime.onMessage.addListener(function(request, sender){
//
// chrome.storage.sync.set({"currentMode":request});
//
//   if(request == "changeMode"){
//
//     //Save all the tabs
//     chrome.tabs.query({}, function(allTabs){
//       chrome.storage.sync.set({"allTabs": allTabs}, function(){
//         chrome.runtime.sendMessage("dataSaved");
//       });
//     });
//
//
//     chrome.tabs.query({}, function(allTabs){
//       for(var i = 0; i<allTabs.length; i++){
//         chrome.tabs.remove(allTabs[i].id);
//         console.log(allTabs[i].id);
//       }
//     });
//
//
//     chrome.storage.sync.get("allTabs", function(allTabsObject){
//       var allTabsArray = allTabsObject.allTabs;
//       //console.log(allTabsArray);
//       if(allTabsArray.length){
//         for(var i = 0; i<allTabsArray.length; i++){
//           chrome.tabs.create({"url": allTabsArray[i].url});
//         }
//       }
//       else{
//         chrome.tabs.create();
//       }
//     });
//
//   }
// });
