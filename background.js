"use strict";

chrome.commands.onCommand.addListener(function(command){
  if(command == "like-page"){
    chrome.tabs.get(activeTabId, function(tab){
      likePage(tab.url ,"shortcut");
    })
  }
});


chrome.runtime.onMessage.addListener(function (request, sender) {

    //refreshContextMenu();

    if (request.type == "create-task") {

        if (CTASKID == 0) {

            chrome.bookmarks.getTree(function (bookmarks) {
                createTask(request.taskName, request.tabs, request.createFromCurrentTabs, bookmarks);
                if (request.activated) {
                    deactivateTaskInWindow(CTASKID)
                    activateTaskInWindow(TASKS["lastAssignedId"]);
                }
            });
        }
        else {
            createTask(request.taskName, request.tabs, request.createFromCurrentTabs, {});
            if (request.activated) {
                deactivateTaskInWindow(CTASKID);
                activateTaskInWindow(TASKS["lastAssignedId"]);
            }
        }


    }

    if (request.type == "switch-task" && request.nextTaskId != "") {
        deactivateTaskInWindow(CTASKID);
        activateTaskInWindow(request.nextTaskId);
    }

    if (request.type == "rename-task") {
        renameTask(request.taskId, request.newTaskName);
    }

    if (request.type == "delete-task") {
        deleteTask(request.taskToRemove);
    }

    if (request.type == "download-tasks") {
        downloadTasks();
    }

    if(request.type == "like-page"){
      likePage(request.url, CTASKID);
    }

    if(request.type == "idle-time"){
      addIdleTime(request.url, request["idle-time"]);
    }

    if(request.type =="pause-tasks"){
        CTASKID = 0;
        updateStorage("CTASKID", 0);
    }

    if(request.type == "open-liked-pages"){
      openLikedPages(request.taskId)
    }

    if(request.type == "search"){
      returnResults(request.query, engines, function () {
          chrome.storage.local.get(preferredDomainsFieldName, function (preferredDomainsObject) {
              chrome.storage.local.get(preferredAuthorsFieldName, function (preferredAuthorsObject) {
                  getSailboatResults(scrapedResultsList, preferredDomainsObject[preferredDomainsFieldName], preferredAuthorsObject[preferredAuthorsFieldName], function(){
                    chrome.runtime.sendMessage({
                      "type": "search-reply",
                      "finalResults": finalResults
                    });
                  });
                });
          });
      });
    }
});

chrome.windows.onRemoved.addListener(function(windowId){
    deactivateTaskInWindow(getKeyByValue(taskToWindow, windowId));
    delete taskToWindow[getKeyByValue(taskToWindow, windowId)];
    getIdsOfCurrentlyOpenTabs(windowId, function(ids){console.log(ids)});
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

    if (changeInfo.status== "complete") {
      if(tabIdToURL!= {}){
        var date = new Date();
        updateExitTime(tabIdToURL[tabId], date.toString())
      }
        tabIdToURL[tabId] = tab.url;
        saveTaskInWindow(CTASKID);
        addToHistory(tab.url, tab.title, CTASKID);
    }
    chrome.tabs.sendMessage(tabId, {"type": "reload-like-button", data:tab})

});

chrome.tabs.onActivated.addListener(function(activeInfo){

  //Set the exit time for previous url
  if(tabIdToURL!= {} && activeTabId != 0){
    var date = new Date();
    updateExitTime(tabIdToURL[activeTabId], date.toString());
  }

  activeTabId = activeInfo.tabId;

  chrome.tabs.get(activeTabId, function(tab){
    if(tab.url){
      if(TASKS[CTASKID].history.find((page) => page.url === tab.url)){
        var date = new Date();
        TASKS[CTASKID].history.find((page) => page.url === tab.url).timeVisited.push(date.toString());
      }
    }
  })
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  if(removeInfo.isWindowClosing){
    var date = new Date();
    if(tabIdToURL!= {}){
      updateExitTime(tabIdToURL[tabId], date.toString());
    }
  }
    if (!removeInfo.isWindowClosing) {
        saveTaskInWindow(CTASKID);
    }
  });

chrome.windows.onFocusChanged.addListener(function (newWindowId){
  if(newWindowId>backgroundPageId){
    chrome.windows.get(newWindowId, function(window){
        if(window.type == "normal"){
            if(getKeyByValue(taskToWindow, newWindowId)){
                deactivateTaskInWindow(CTASKID)
                activateTaskInWindow(getKeyByValue(taskToWindow, newWindowId));
            }
        }
    });
  }
});
