"use strict";

//Set up TASKS array. Set it to empty if it doesn't exist in chrome storage, otherwise retreive it from chrome storage.
var TASKS = {
    lastAssignedId: -1
};

// function CustomTab(index, highlighted, active, pinned, audible, mutedInfo, url){
//   this.index = index,
//   this.highlighted = highlighted,
//   this.active = active,
//   this.pinned = pinned,
//   this.audible = audible,
//   this.mutedInfo = mutedInfo,
//   this.url = url
// }
//
// function createCustomFromChromeTab(chromeTab){
//   var customTab = new CustomTab(chromeTab.index, chromeTab.highlighted, chromeTab.active, chromeTab.pinned, chromeTab.audible, chromeTab.mutedInfo, chromeTab.url);
//   console.log(customTab);
//   return customTab;
// }

var CTASKID = -1;

//Initialising TASKS and CTASKID
chrome.storage.local.get("TASKS", function (taskObject) {
    if (taskObject["TASKS"]) {
        TASKS = taskObject["TASKS"];//On retreiving TASKS from chrome storage, one gets an object {TASKS: balhah}, to retreive the actual array call taskObject["TASKS"]
    }
});

chrome.storage.local.get("CTASKID", function (cTaskIdObject) {
    if (cTaskIdObject["CTASKID"]) {
        CTASKID = cTaskIdObject["CTASKID"];
    }
});

function Task(task_id, task_name, tabs, bookmarks) {
    this.id = task_id;
    this.name = task_name;
    this.tabs = tabs;
    this.bookmarks = bookmarks;
}

//Helper Methods

function createTask(taskName, tabs, createFromCurrentTabs, bookmarks) {
    if(createFromCurrentTabs){
      var newTask = new Task(TASKS["lastAssignedId"] + 1, taskName, tabs, bookmarks);
      TASKS[TASKS["lastAssignedId"] + 1] = newTask;
      TASKS["lastAssignedId"] = TASKS["lastAssignedId"] + 1;
      chrome.storage.local.set({"TASKS": TASKS});
    }
    else{
      var emptyArray = [];
      var newTask = new Task(TASKS["lastAssignedId"] + 1, taskName, emptyArray, bookmarks);
      TASKS[TASKS["lastAssignedId"] + 1] = newTask;
      TASKS["lastAssignedId"] = TASKS["lastAssignedId"] + 1;
      chrome.storage.local.set({"TASKS": TASKS});
    }
}

function createBookmarks(bookmarksNode){
  for(var i=0; i<bookmarksNode.length; i++){
    var bookmark = bookmarksNode[i];
    if(bookmark.id>2){
      if(bookmark.url){
        chrome.bookmarks.create({"parentId":bookmark.parentId, "index": bookmark.index, "title": bookmark.title, "url":bookmark.url});
      }
      else{
        chrome.bookmarks.create({"parentId":bookmark.parentId, "index": bookmark.index, "title": bookmark.title});
      }
    }
    if(bookmark.children){
      createBookmarks(bookmark.children);
    }
  }
}

function activateTask(task_id) {
    try {
        if (TASKS[task_id].tabs.length > 0) {
            for (var i = 0; i < TASKS[task_id].tabs.length; i++) {
                chrome.tabs.create({"url":TASKS[task_id].tabs[i].url, "pinned": TASKS[task_id].tabs[i].pinned, "active":TASKS[task_id].tabs[i].active});
            }
        }
        else {
            chrome.tabs.create({"url": "about:blank"});
        }

        createBookmarks(TASKS[task_id].bookmarks);

        CTASKID = task_id;
        chrome.storage.local.set({"CTASKID": task_id});
    }
    catch (err) {
        console.log(err.message);
    }
}

function backgroundTask(taskId){
  chrome.windows.create({})
}

function saveTask(task_id) {
    if (TASKS[task_id]) {
        chrome.tabs.query({}, function (allTabs) {
            TASKS[task_id].tabs = allTabs;
            chrome.storage.local.set({"TASKS": TASKS});
        });
        chrome.bookmarks.getTree(function(bookmarks){
          TASKS[task_id].bookmarks = bookmarks;
          chrome.storage.local.set({"TASKS": TASKS});
        });
    }
}

function deactivateTask(currentTaskId) {

    saveTask(currentTaskId);

    chrome.tabs.query({"windowId":chrome.windows.WINDOW_ID_CURRENT}, function (allTabs) {
        for (var i = 0; i < allTabs.length; i++) {
            chrome.tabs.remove(allTabs[i].id);
        }
    });

    chrome.bookmarks.getChildren("1", function (children){
      for(var i = 0; i<children.length; i++){
        chrome.bookmarks.removeTree(children[i].id)
      }
    });

    chrome.bookmarks.getChildren("2", function (children){
      for(var i = 0; i<children.length; i++){
        chrome.bookmarks.removeTree(children[i].id)
      }
    });

}

function deleteTask(task_id) {
    if (TASKS[task_id]) {
        delete TASKS[task_id];
        chrome.storage.local.set({"TASKS": TASKS});
    }
}

function renameTask(task_id, newName) {
    if (TASKS[task_id]) {
        TASKS[task_id].name = newName;
        chrome.storage.local.set({"TASKS": TASKS})
    }
}


//Context Menu Related Stuff

function refreshContextMenu(){
  chrome.contextMenus.removeAll(function(){
    chrome.contextMenus.create({"title": "Add to task", "id":"rootMenu", "contexts": ["link"]});
    for(var task_id in TASKS){
      if(task_id != "lastAssignedId" && task_id != CTASKID){
        chrome.contextMenus.create({"title": TASKS[task_id].name, "parentId": "rootMenu", "id": TASKS[task_id].id.toString(), "contexts": ["link"]});
      }
    }
  })
}

function addToTask(url, task_id){
  TASKS[task_id].tabs.push({"url": url});
}

chrome.contextMenus.onClicked.addListener(function(info, tab){
  if(info.parentMenuItemId == "rootMenu"){
    addToTask(info.linkUrl, info.menuItemId);
  }
});

//Saving Events
chrome.runtime.onMessage.addListener(function (request, sender) {
    console.log(request);

    refreshContextMenu();

    if (request.type == "create-task") {

      if(CTASKID == -1){
        chrome.bookmarks.getTree(function(bookmarks){
          createTask(request.taskName, request.tabs, request.createFromCurrentTabs, bookmarks);
          if (request.activated) {
              deactivateTask(CTASKID);
              activateTask(TASKS["lastAssignedId"]);
          }
        });
      }
      else{
        createTask(request.taskName, request.tabs, request.createFromCurrentTabs, request.bookmarks);
      }

        if (request.activated) {
            deactivateTask(CTASKID);
            activateTask(TASKS["lastAssignedId"]);
        }
    }

    if (request.type == "switch-task" && request.nextTaskId != "") {
        deactivateTask(CTASKID);
        activateTask(request.nextTaskId);
    }

    if (request.type == "rename-task") {
        renameTask(request.taskId, request.newTaskName);
    }

    if (request.type == "delete-task") {
        deleteTask(request.taskToRemove);
    }


});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.title) {
        saveTask(CTASKID);
    }
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    if (!removeInfo.isWindowClosing) {
        saveTask(CTASKID);
    }
});

chrome.commands.onCommand.addListener(function (command) {
    console.log('Command:', command);
});
