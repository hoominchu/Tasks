"use strict";

// Setting up required variables. These should be used as they are across files.
// Local storage fields
var preferredAuthorsFieldName = "Preferred authors";
var totalFrequencyFieldName = "Total frequency";

//BEGINNING: Object Definitions

var tabIdToURL={};

var activeTabId = -1;

function Task(task_id, task_name, tabs, bookmarks, isActive) {
    this.id = task_id;
    this.name = task_name;
    this.tabs = tabs;
    this.bookmarks = bookmarks;
    this.history = [];
    this.active = isActive;
    this.activationTime = [];
    this.deactivationTime = [];
    this.likedPages = [];
    this.pages = {};
}

function Page(url, title, isLiked, isBookmarked){
  this.url = url;
  this.title = title;
  this.timeSpent = [];
  this.isLiked = isLiked;
  this.isBookmarked = isBookmarked;
  this.timeVisited = [];
  this.exitTimes = [];
  this.totalTimeSpent = {};
}

var engines = [
  {
    "engine": "Google",
    "mainUrl": "https://www.google.co.in/search?q=",
    "pageUrl": "&start=",
    "indexMarker": function(j){
      return j*10;
    },
    "selector": [{"class": "_Rm"}],
      "finalSelector": "innerText"
  },
  {
    "engine": "Yahoo",
    "mainUrl": "https://in.search.yahoo.com/search?p=",
    "pageUrl": "&b=",
    "indexMarker": function(j){
      return ((j*10)+1)
    },
    "selector": [{"class": "fz-ms fw-m fc-12th wr-bw"}],
      "finalSelector": "innerText"
  },

  {
    "engine": "Bing",
    "mainUrl": "https://www.bing.com/search?q=",
    "pageUrl": "&first=",
    "indexMarker": function(j){
      return j*10;
    },
    "selector": [{"class": "b_algo"}, {"tag": "h2"}, {"tag": "a"}],
    "finalSelector": "href"
  }

]

//ENDING: Object Definitions

//BEGINNING: Inititalising of variables

var TASKS = {lastAssignedId: -1};
var CTASKID = -1;

var currentTaskIsSet = !(CTASKID == -1);

chrome.storage.local.get("TASKS", function (taskObject) {
    if (taskObject["TASKS"]) {
        TASKS = taskObject["TASKS"];//On retreiving TASKS from chrome storage, one gets an object {TASKS: balhah}, to retreive the actual array call taskObject["TASKS"]
    }
});

chrome.storage.local.get("CTASKID", function (cTaskIdObject) {
    if (cTaskIdObject["CTASKID"]>-1) {
        CTASKID = cTaskIdObject["CTASKID"];
    }
});

chrome.storage.local.get(preferredAuthorsFieldName, function (prefAuthObj) {
    if (JSON.stringify(prefAuthObj) == "{}") {
        // Adding to the local storage if the field doesn't exist already.
        var o = {};
        o[preferredAuthorsFieldName] = {};
        o[preferredAuthorsFieldName]["metadata"] = {};
        o[preferredAuthorsFieldName]["metadata"][totalFrequencyFieldName] = 0;
        console.log(o)
        chrome.storage.local.set(o, function(){"init"});
    }
});

//ENDING: Inititalising of variables


//BEGINNING: Level 1 Helpers

function getTotalTimeSpent(Page){
  var timeSpent = Page.timeSpent;
  var hours = 0;
  var minutes = 0;
  var seconds = 0;
  for(var i = 0; i<timeSpent.length; i++){
    hours = hours + timeSpent[i]["hours"];
    minutes = minutes + timeSpent[i]["minutes"];
    seconds = seconds + timeSpent[i]["seconds"];
  }
  var t_timeSpent = {"hours": hours, "minutes": minutes, "seconds": seconds};
  return t_timeSpent;
}

function returnDuration(startingTime, endingTime) {
    var startingTime = new Date(startingTime);
    var endingTime = new Date(endingTime);
    var hours = endingTime.getHours() - startingTime.getHours();
    var minutes = Math.abs(endingTime.getMinutes() - startingTime.getMinutes());
    var seconds = Math.abs(endingTime.getSeconds() - startingTime.getSeconds());
    var duration = {
        "hours": hours,
        "minutes": minutes,
        "seconds": seconds
    }
    return duration;
}

function returnPage(page, url){
  return page.url === url;
}

function updateExitTime(url, time){
  if(TASKS[CTASKID].history.find((page) => page.url === url)){
    TASKS[CTASKID].history.find((page) => page.url === url).exitTimes.push(time);
    var page = TASKS[CTASKID].history.find((page) => page.url === url);
    var duration = returnDuration(page.timeVisited[page.timeVisited.length-1], time);
    TASKS[CTASKID].history.find((page) => page.url === url).timeSpent.push(duration);
    TASKS[CTASKID].history.find((page) => page.url === url).totalTimeSpent = getTotalTimeSpent(TASKS[CTASKID].history.find((page) => page.url === url));
  }
}

//ENDING: Level 1 Helpers


//BEGINNING: Level 2 Helpers

function closeAllTabs(shouldPinnedClose, windowID) {

    if (windowID != null && !shouldPinnedClose) {
        chrome.tabs.query({"windowId": windowID}, function (allTabs) {
            for (var i = 0; i < allTabs.length; i++) {
                if (!allTabs[i].pinned) {
                    chrome.tabs.remove(allTabs[i].id);
                }
            }
        });
    }

    else if (windowID != null && shouldPinnedClose) {
        chrome.tabs.query({"windowId": windowID}, function (allTabs) {
            for (var i = 0; i < allTabs.length; i++) {
                chrome.tabs.remove(allTabs[i].id);
            }
        });
    }

    else if (windowID == null && !shouldPinnedClose) {
        chrome.tabs.query({}, function (allTabs) {
            for (var i = 0; i < allTabs.length; i++) {
                if (!allTabs[i].pinned) {
                    chrome.tabs.remove(allTabs[i].id);
                }
            }
        });
    }

    else {
        chrome.tabs.query({}, function (allTabs) {
            for (var i = 0; i < allTabs.length; i++) {
                chrome.tabs.remove(allTabs[i].id);
            }
        });
    }
}

function removeBookmarks() {
    chrome.bookmarks.getChildren("1", function (children) {
        for (var i = 0; i < children.length; i++) {
            chrome.bookmarks.removeTree(children[i].id)
        }
    });

    chrome.bookmarks.getChildren("2", function (children) {
        for (var i = 0; i < children.length; i++) {
            chrome.bookmarks.removeTree(children[i].id)
        }
    });
}

function createBookmarks(bookmarksNode, parentId){
  for(var i=0; i<bookmarksNode.length; i++){
    var bookmark = bookmarksNode[i];
    var isRootFolder = !(bookmark.id>2);
    var isFolder = (bookmark.url == null);
    var isParentRoot = !(bookmark.parentId>2);

    if(!isRootFolder && !isFolder && isParentRoot){
      chrome.bookmarks.create({"parentId":bookmark.parentId, "index": bookmark.index, "title": bookmark.title, "url":bookmark.url});
    }

    else if((!isRootFolder && !isFolder && !isParentRoot)){
      chrome.bookmarks.create({"parentId":parentId, "index": bookmark.index, "title": bookmark.title, "url":bookmark.url});
    }

    else if (!isRootFolder && isFolder){
      if(bookmark.children.length>0){
        var children = bookmark.children;
        chrome.bookmarks.create({"parentId":bookmark.parentId, "index": bookmark.index, "title": bookmark.title}, function(result){createBookmarks(children, result.id)});
      }
      else{
        chrome.bookmarks.create({"parentId":bookmark.parentId, "index": bookmark.index, "title": bookmark.title});
      }
    }

    else if (isRootFolder){
      if(bookmark.children.length > 0){
        createBookmarks(bookmark.children);
      }
    }
  }
}

function createBookmarks(bookmarksNode, parentId){
  for(var i =0; i<bookmarksNode.length; i++){
    var bookmark = bookmarksNode[i];
    var isFolder = (bookmark.url == null);
    var isRootFolder = !(bookmark.id>2);
    if(isRootFolder){
      createBookmarks(bookmark.children, bookmark.id);
    }
    else{
      if(isFolder){
        var children = bookmark.children;
        if(children.length>0){
          chrome.bookmarks.create({"parentId": parentId, "index": bookmark.index, "title": bookmark.title}, function(result){createBookmarks(children, result.id)});
        }
        else{
          chrome.bookmarks.create({"parentId": parentId, "index": bookmark.index, "title": bookmark.title});
        }
      }
      else{
        chrome.bookmarks.create({"parentId": parentId, "index": bookmark.index, "title": bookmark.title, "url": bookmark.url});
      }
    }
  }
}

function saveTasksToStorage(){
  chrome.storage.local.set({"TASKS": TASKS});
}

function addToHistory(url, title, task_id){
  if(url!= "chrome://newtab/" && url!="about:blank" && url){
    if(TASKS[task_id].history.find((page) => page.url === url)){
      var date = new Date();
      TASKS[task_id].history.find((page) => page.url === url).timeVisited.push(date.toString())
    }
    else{
      var newPage = new Page(url, title)
      var date = new Date;
      newPage.timeVisited.push(date.toString());
      TASKS[task_id].history.push(newPage);
    }
  }
}

function likePage(url, task_id){
  var page = TASKS[task_id].history.find((page) => page.url === url );
  TASKS[task_id].history.find((page) => page.url === url ).isLiked = !(page.isLiked);
  saveTasksToStorage();
}

function getLikedPages(task_id){
  var likedPages = [];
  for(var i = 0; i<TASKS[task_id].history.length; i++){
    if(TASKS[task_id].history[i].isLiked){
      likedPages.push(TASKS[task_id].history[i]);
    }
  }
  return likedPages;
}


//ENDING: Level 2 Helpers


//BEGINNING: Level 3 Helpers

function createTask(taskName, tabs, createFromCurrentTabs, bookmarks) {
    if (createFromCurrentTabs) {
        var newTask = new Task(TASKS["lastAssignedId"] + 1, taskName, tabs, bookmarks);
        TASKS[TASKS["lastAssignedId"] + 1] = newTask;
        TASKS["lastAssignedId"] = TASKS["lastAssignedId"] + 1;
        saveTasksToStorage();
    }
    else {
        var emptyArray = [];
        var newTask = new Task(TASKS["lastAssignedId"] + 1, taskName, emptyArray, bookmarks);
        TASKS[TASKS["lastAssignedId"] + 1] = newTask;
        TASKS["lastAssignedId"] = TASKS["lastAssignedId"] + 1;
        saveTasksToStorage();
    }
}

function activateTask(task_id) {
    try {
        if (TASKS[task_id].tabs.length > 0) {
            for (var i = 0; i < TASKS[task_id].tabs.length; i++) {
                if (!TASKS[task_id].tabs[i].pinned) {
                    chrome.tabs.create({
                        "url": TASKS[task_id].tabs[i].url,
                        "pinned": TASKS[task_id].tabs[i].pinned,
                        "active": TASKS[task_id].tabs[i].active
                    });
                }
            }
        }
        else {
            chrome.tabs.create({"url": "about:blank"});
        }

        createBookmarks(TASKS[task_id].bookmarks);


        CTASKID = task_id;
        chrome.storage.local.set({"CTASKID": task_id});
        chrome.browserAction.setBadgeText({"text": TASKS[CTASKID].name.slice(0, 4)})
        var now = new Date();
        TASKS[task_id].activationTime.push(now.toString());
        TASKS[task_id].isActive = true;
        saveTasksToStorage();

    }
    catch (err) {
        console.log(err.message);
    }
}

function saveTask(task_id) {
    if (TASKS[task_id]) {
        chrome.tabs.query({}, function (allTabs) {
            TASKS[task_id].tabs = allTabs;
            saveTasksToStorage();
        });
        chrome.bookmarks.getTree(function (bookmarks) {
            TASKS[task_id].bookmarks = bookmarks;
            saveTasksToStorage();
        });
    }
}

function deactivateTask(currentTaskId) {
    if (TASKS[currentTaskId]) {
        saveTask(currentTaskId);
        closeAllTabs(false, chrome.windows.WINDOW_ID_CURRENT)
        removeBookmarks();
        var now = new Date();
        TASKS[currentTaskId].deactivationTime.push(now.toString());
        TASKS[currentTaskId].isActive = false;
        saveTasksToStorage();
    }
    else if (currentTaskId == -1) {
        closeAllTabs(false, chrome.windows.WINDOW_ID_CURRENT)
    }
}

function deleteTask(task_id) {
    if (TASKS[task_id]) {
        delete TASKS[task_id];
        saveTasksToStorage();
    }
}

function renameTask(task_id, newName) {
    if (TASKS[task_id]) {
        TASKS[task_id].name = newName;
        saveTasksToStorage();
    }
}

function downloadTasks() {
    var tasks_JSON = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(TASKS, null, 2));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", tasks_JSON);
    downloadAnchorNode.setAttribute("download", "tasks.json");
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

//ENDING: Level 3 Helpers


//BEGINNING: Context Menu Related Stuff

function refreshContextMenu() {
    chrome.contextMenus.removeAll(function () {
        chrome.contextMenus.create({"title": "Add to task", "id": "rootMenu", "contexts": ["link"]});
        for (var task_id in TASKS) {
            if (task_id != "lastAssignedId" && task_id != CTASKID) {
                chrome.contextMenus.create({
                    "title": TASKS[task_id].name,
                    "parentId": "rootMenu",
                    "id": TASKS[task_id].id.toString(),
                    "contexts": ["link"]
                });
            }
        }
        chrome.contextMenus.create({"title": "Save to Sailboat", "id": "saveToSailboat", "contexts": ["link"]});

    })
}

function addToTask(url, task_id) {
    TASKS[task_id].tabs.push({"url": url});
}

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.parentMenuItemId == "rootMenu") {
        addToTask(info.linkUrl, info.menuItemId);
    }
});

//ENDING: Context Menu Related Stuff


//BEGINNING: Stuff that calls the appropriate helper when a task is created/switched/deleted etc

//everytime a user creates, switches, deletes etc a task,
//this part of the code is invoked first in the whole page

chrome.runtime.onMessage.addListener(function (request, sender) {

    refreshContextMenu();

    if (request.type == "create-task") {

        if (!currentTaskIsSet) {
            chrome.bookmarks.getTree(function (bookmarks) {
                createTask(request.taskName, request.tabs, request.createFromCurrentTabs, bookmarks);
                if (request.activated) {
                    deactivateTask(CTASKID);
                    activateTask(TASKS["lastAssignedId"]);
                }
            });
        }
        else {
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

    if (request.type == "download-tasks") {
        downloadTasks();
    }

    if(request.type == "like-page"){
      likePage(request.url, CTASKID);
    }

    if(request.type == "search"){
      returnUrlsList(request.query, engines, function(){
        chrome.runtime.sendMessage({
          "urlsList": urlsList,
          "type": "search-reply"
        });
    });
  }
});

//ENDING: Stuff that calls the appropriate helper when a task is created/switched/deleted etc


//BEGINNING: Stuff that saves tabs of task

//Save a tab when the url is changed.
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

    if (changeInfo.status== "complete") {
      if(tabIdToURL!= {}){
        var date = new Date();
        updateExitTime(tabIdToURL[tabId], date.toString())
      }
        tabIdToURL[tabId] = tab.url;
        saveTask(CTASKID);
        addToHistory(tab.url, tab.title, CTASKID);
    }
    chrome.tabs.sendMessage(tabId, {data:tab})

});

chrome.tabs.onActivated.addListener(function(activeInfo){

  //Set the exit time for previous url
  if(tabIdToURL!= {} && activeTabId != -1){
    var date = new Date();
    updateExitTime(tabIdToURL[activeTabId], date.toString());
  }

  activeTabId = activeInfo.tabId;

  chrome.tabs.get(activeTabId, function(tab){
    if(tab.url){
      if(TASKS[CTASKID].history.find((page) => page.url === tab.url)){
        var date = new Date();
        TASKS[CTASKID].history.find((page) => page.url === tab.url).timeVisited.push(date.toString())
      }
    }
  })
})

//Save task when a tab is closed
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  if(removeInfo.isWindowClosing){
    var date = new Date();
    if(tabIdToURL!= {}){
      updateExitTime(tabIdToURL[tabId], date.toString());
    }
  }
    if (!removeInfo.isWindowClosing) {
        saveTask(CTASKID);
    }
  });

//ENDING: Stuff that saves tabs of task

//BEGINNING: OAuth

// function revokeToken() {
//
//     chrome.identity.getAuthToken({ 'interactive': false },
//         function(current_token) {
//             if (!chrome.runtime.lastError) {
//
//                 // @corecode_begin removeAndRevokeAuthToken
//                 // @corecode_begin removeCachedAuthToken
//                 // Remove the local cached token
//                 chrome.identity.removeCachedAuthToken({ token: current_token },
//                     function() {});
//                 // @corecode_end removeCachedAuthToken
//
//                 // Make a request to revoke token in the server
//                 var xhr = new XMLHttpRequest();
//                 xhr.open('GET', 'https://accounts.google.com/o/oauth2/revoke?token=' +
//                     current_token);
//                 xhr.send();
//                 // @corecode_end removeAndRevokeAuthToken
//
//                 // Update the user interface accordingly
//
//                 $('#revoke').get(0).disabled = true;
//                 console.log('Token revoked and removed from cache. '+
//                     'Check chrome://identity-internals to confirm.');
//             }
//         });
// }
//
// document.getElementById('login').addEventListener("click", function () {
//     chrome.identity.getAuthToken({
//         interactive: true
//     }, function (token) {
//         if (chrome.runtime.lastError) {
//             alert(chrome.runtime.lastError.message);
//             return;
//         }
//         var x = new XMLHttpRequest();
//         x.open('GET', 'https://www.googleapis.com/oauth2/v2/userinfo?alt=json&access_token=' + token);
//         x.onload = function () {
//             alert(x.response);
//         };
//         x.send();
//     });
// });
//
// document.getElementById('logout').addEventListener("click", function () {
//     revokeToken();
// });

//ENDING: OAuth

//BEGINNING: SCRAPER STUFF

//Level 1 Helper Methods

function httpGetAsync(theUrl, callback, engine){

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText, engine);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous
    xmlHttp.send(null);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function returnQuery(selectorDict){
  var query = "";

  for (var i = 0; i < selectorDict.length; i++) {
     var tagName, className, idName, attributeName, attributeValue;

    if (selectorDict[i]["tag"] != null) {
         tagName = selectorDict[i]["tag"];
     } else {
         tagName = null;
     }
     if (selectorDict[i]["class"] != null) {
         className = selectorDict[i]["class"];
     } else {
         className = null;
     }
     if (selectorDict[i]["id"] != null) {
         idName = selectorDict[i]["id"];
     } else {
         idName = null;
     }
     if (selectorDict[i]["attribute"] != null) {
         attributeName = selectorDict[i]["attribute"];
     } else {
         attributeName = null;
     }
     if (selectorDict[i]["value"] != null) {
         attributeValue = selectorDict[i]["value"];
     } else {
         attributeValue = null;
     }

     //Creating query for querySelector
     if (tagName != null) {
         query = query + tagName;
     }

     if (className != null) {
         var classes = className.replace(/\s/g, ".");
         query = query + "." + classes;
     }

     if (idName != null) {
         query = query + "#" + idName;
     }

     if (attributeName != null) {
         query = query + "[" + attributeName + "='" + attributeValue + "']";
     }

     if ((i + 1) < selectorDict.length) {
         query = query + " ";
     }
 }
 return query;

}

function extractUrls(engine, htmlString){
  var urls = [];
  var parser = new DOMParser();
  var doc = parser.parseFromString(htmlString, "text/html");
  var urlObjects = doc.querySelectorAll(returnQuery(engine.selector));
  for(var i =0; i<urlObjects.length; i++){
    urls.push(urlObjects[i][engine.finalSelector])
  }
  return urls;
}

var urlsList = [];

function returnUrlsList(query, engines, callback){
  for(var i = 0; i < engines.length; i++){
    for(var j = 0; j < 10; j++){
      setInterval(httpGetAsync(engines[i].mainUrl+query+engines[i].pageUrl+engines[i].indexMarker(j), function(response, engine){
        var engineName = engine["engine"];
        var urls = extractUrls(engine, response);
        var temp = {};
        temp[engineName] = urls;
        urlsList.push(temp);
        if(urlsList.length>2){
          callback();
        }
      }, engines[i]), getRandomInt(30000, 60000));
    }
  }
}

//ENDING: SCRAPER STUFF

//BEGINNING: REORDERING OF SEARCH RESULTS


// console.log(getLikedPages(CTASKID))
