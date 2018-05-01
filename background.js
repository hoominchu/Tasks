"use strict";

chrome.commands.onCommand.addListener(function(command){
  if(command == "like-page"){
    chrome.tabs.get(activeTabId, function(tab){
      likePage(tab.url ,"shortcut");
    })
  }
});


chrome.runtime.onMessage.addListener(function (request, sender) {

    refreshContextMenu();

    if (request.type == "create-task") {

        if (CTASKID == 0) {

            chrome.bookmarks.getTree(function (bookmarks) {
                createTask(request.taskName, request.tabs, bookmarks);
                if (request.activated) {
                    saveTaskInWindow(CTASKID);
                    deactivateTaskInWindow(CTASKID)
                    activateTaskInWindow(TASKS["lastAssignedId"]);
                }
            });
        }
        else {
            createTask(request.taskName, request.tabs, {});
            if (request.activated) {
                saveTaskInWindow(CTASKID);
                deactivateTaskInWindow(CTASKID);
                activateTaskInWindow(TASKS["lastAssignedId"]);
            }
        }


    }

    if(request.type == "add-to-task"){
      addTabsToTask(request.taskId, request.tabs);
    }

    if (request.type == "switch-task" && request.nextTaskId != "") {
        saveTaskInWindow(CTASKID);
        deactivateTaskInWindow(CTASKID);
        activateTaskInWindow(request.nextTaskId);
    }

    if(request.type == "close-task"){
        closeTask(request.taskId);
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
      openLikedPages(request.taskId);
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

    if(request.type == "cluster"){
        clusterTabs();
    }
});
//if someone asks for open tasks give it to them
chrome.runtime.onMessage.addListener(function (request, sender) {
    if(request.type == "give me open tasks"){
        chrome.runtime.sendMessage({
          "type": "array of open tasks",
          "openTasks": Object.keys(taskToWindow)
        });
    }
  });

chrome.runtime.onMessage.addListener(function (request, sender) {
    if(request.type == "likePages"){
        likePages(request.urls, request.taskId);
    }
    if(request.type == "deletePages"){
        deleteFromHistory(request.urls, request.taskId);
    }
});

chrome.windows.onRemoved.addListener(function(windowId){
    if(windowId != backgroundPageId){
        // deactivateTaskInWindow(getKeyByValue(taskToWindow, windowId));
        //console.log("Window Removed" + TASKS);
        //console.log(TASKS);
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
        // console.log(tab);
        // chrome.tabs.get(tab.openerTabId, function(tab){
        //     console.log(tab.url);
        // });
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
    deactivateTaskInWindow(CTASKID);
    CTASKID = 0;
    chrome.windows.getCurrent(function(window){
      if(getKeyByValue(taskToWindow, window.id)){
        activateTaskInWindow(getKeyByValue(taskToWindow, window.id));
      }
      else{
        CTASKID = 0;
      }
    });
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
            else{
              chrome.browserAction.setBadgeText({"text": ""});
            }
        }
    });
  }
  else{
      if(getKeyByValue(taskToWindow, newWindowId)){
          deactivateTaskInWindow(getKeyByValue(taskToWindow, newWindowId));
          CTASKID = 0;
          chrome.storage.local.set({"CTASKID": 0});
      }
      else{
        chrome.browserAction.setBadgeText({"text": ""});
      }
  }

  // chrome.storage.local.get("Text Log", function(textLog){
  //   if(textLog["Text Log"]){
  //     for(var url in textLog["Text Log"]){
  //       // removeFromPageContentAndTextLog(url);
  //     }
  //   }
  // })

});

//If a window is created outside Task context then remove task Badge
chrome.windows.onCreated.addListener(function(window){
  if(!getKeyByValue(taskToWindow, window.id)){
    chrome.browserAction.setBadgeText({"text": ""});
  }
})


// Creates notification for suggested task.
chrome.runtime.onMessage.addListener(function (response, sender) {
    if (response.type == "task suggestion") {
        var probableTaskID = response["probable task id"];
        console.log("Notification should fire");
        var matchedTags = response["matched tags"];
        var matchedTagsString = "";
        for (var i = 0; i < matchedTags.length; i++) {
            matchedTagsString = matchedTagsString + matchedTags[i][0]+", ";
        }
        var fromPageURL = response["page url"];
        var fromPageTitle = response["page title"];
        var probableTask = response["probable task"];

        chrome.notifications.create({"type" : "basic",
            "iconUrl" : "images/logo_white_sails_no_text.png",
            "title" : "Task Suggestion : " + probableTask,
            "message" : matchedTagsString,
            "buttons" : [{"title":"See all matched tags"}], //,{"title":"Add to task " + probableTask + " and stay on the current task"}
            // "items":[{"title":"sdfs","message":"sdfawefar"},{"title":"erwq","message":"qweqwer"},{"title":"zxz","message":"vbcxvbx"}],
            "isClickable" : true,
            "requireInteraction" : false}, function (notificationID) {
            // Respond to the user's clicking one of the buttons
            chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
                if (notifId === notificationID) {

                    // This button adds the current webpage to the suggested task and takes the user to the suggested task.
                    if (btnIdx === 0) {
                        // // Logging that the suggestion is correct.
                        // chrome.storage.local.get("Suggestions Log", function (resp) {
                        //     resp["Suggestions Log"]["Correct suggestions"]++;
                        //     updateStorage("Suggestions Log", resp);
                        // });

                        // Call function to add to task and move to task.

                        // Redirecting to matchedTags.html and displaying all matched tags.
                        chrome.storage.local.set({
                            "Matched Tags": {
                                "type": "show matched tags",
                                "matched tags": matchedTags,
                                "from page URL": fromPageURL,
                                "from page title": fromPageTitle,
                                "probable task name": probableTask
                            }
                        }, function () {
                            chrome.tabs.create({"url": "html/matchedTags.html"})
                        });
                    }
                    // // This button adds the current webpage to the suggested task and stays in the current task.
                    // else if (btnIdx === 1){
                    //     // Logging that the suggestion is correct.
                    //     chrome.storage.local.get("Suggestions Log", function (resp) {
                    //         resp["Suggestions Log"]["Correct suggestions"]++;
                    //         updateStorage("Suggestions Log", resp);
                    //     });
                    //
                    //     // Call function to add to task but not move to task.
                    // }
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
