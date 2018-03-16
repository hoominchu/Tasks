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
                    saveTaskInWindow(CTASKID);
                    deactivateTaskInWindow(CTASKID)
                    activateTaskInWindow(TASKS["lastAssignedId"]);
                }
            });
        }
        else {
            createTask(request.taskName, request.tabs, request.createFromCurrentTabs, {});
            if (request.activated) {
                saveTaskInWindow(CTASKID);
                deactivateTaskInWindow(CTASKID);
                activateTaskInWindow(TASKS["lastAssignedId"]);
            }
        }


    }

    if (request.type == "switch-task" && request.nextTaskId != "") {
        saveTaskInWindow(CTASKID);
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

    // if(request.type == "idle-time"){
    //   addIdleTime(request.url, request["idle-time"]);
    // }

    if(request.type =="archive-task"){
        archiveTask(request.taskId);
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
    if(windowId != backgroundPageId){
        //deactivateTaskInWindow(getKeyByValue(taskToWindow, windowId));
        console.log("Window Removed" + TASKS);
        console.log(TASKS);
        delete taskToWindow[getKeyByValue(taskToWindow, windowId)];
        // getIdsOfCurrentlyOpenTabs(windowId, function(ids){console.log(ids)});
    }
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

// chrome.tabs.onActivated.addListener(function(activeInfo){
//
//   // //Set the exit time for previous url
//   // if(tabIdToURL!= {} && activeTabId != 0){
//   //   var date = new Date();
//   //   updateExitTime(tabIdToURL[activeTabId], date.toString());
//   // }
//
//   activeTabId = activeInfo.tabId;
//
//   // chrome.tabs.get(activeTabId, function(tab){
//   //   if(tab.url){
//   //     if(TASKS[CTASKID].history.find((page) => page.url === tab.url)){
//   //       var date = new Date();
//   //       TASKS[CTASKID].history.find((page) => page.url === tab.url).timeVisited.push(date.toString());
//   //     }
//   //   }
//   // })
// });

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  if(removeInfo.isWindowClosing){
    //
    // var date = new Date();
    // if(tabIdToURL!= {}){
    //   updateExitTime(tabIdToURL[tabId], date.toString());
    // }
  }
  else {
        saveTaskInWindow(CTASKID);
    }
});

chrome.windows.onFocusChanged.addListener(function (newWindowId){
  if(newWindowId != chrome.windows.WINDOW_ID_NONE){
    chrome.windows.get(newWindowId, function(window){
        if(window.type == "normal"){
            if(getKeyByValue(taskToWindow, newWindowId)){
                //saveTaskInWindow(CTASKID);
                deactivateTaskInWindow(CTASKID);
                activateTaskInWindow(getKeyByValue(taskToWindow, newWindowId));
            }
        }
    });
  }
  else{
      deactivateTaskInWindow(getKeyByValue(taskToWindow, newWindowId));
      CTASKID = 0;
      chrome.storage.local.set({"CTASKID": 0});
  }

});

// Creates notification for suggested task.
chrome.runtime.onMessage.addListener(function (response, sender) {
    if (response.type == "task suggestion") {
        var probableTaskID = response["probable task id"];
        chrome.notifications.create({"type" : "basic",
            "iconUrl" : "images/logo_white_sails_no_text.png",
            "title" : "Task Suggestion : " + response["probable task"],
            "message" : "Looks like this page belongs to task " + response["probable task"],
            "buttons" : [{"title":"Add to task " + response["probable task"] + " and go to that task"},{"title":"Add to task " + response["probable task"] + " and stay on the current task"}],
            "isClickable" : true,
            "requireInteraction" : false}, function (notificationID) {
            // Respond to the user's clicking one of the buttons
            chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
                if (notifId === notificationID) {

                    // This button adds the current webpage to the suggested task and takes the user to the suggested task.
                    if (btnIdx === 0) {
                        // Logging that the suggestion is correct.
                        chrome.storage.local.get("Suggestions Log", function (resp) {
                            resp["Suggestions Log"]["Correct suggestions"]++;
                            updateStorage("Suggestions Log", resp);
                        });

                        // Call function to add to task and move to task.

                    }

                    // This button adds the current webpage to the suggested task and stays in the current task.
                    else if (btnIdx === 1){
                        // Logging that the suggestion is correct.
                        chrome.storage.local.get("Suggestions Log", function (resp) {
                            resp["Suggestions Log"]["Correct suggestions"]++;
                            updateStorage("Suggestions Log", resp);
                        });

                        // Call function to add to task but not move to task.
                    }
                }
            });

            // When the user clicks on close the current page is added to the current task.
            chrome.notifications.onClosed.addListener(function() {
                // Logging that the suggestion is incorrect.
                chrome.storage.local.get("Suggestions Log", function (resp) {
                    resp["Suggestions Log"]["Incorrect suggestions"]++;
                    updateStorage("Suggestions Log", resp);
                });
            });
        });
    }
});


