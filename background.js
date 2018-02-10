"use strict";


//BEGINNING: Object Definitions

function Task(task_id, task_name, tabs, bookmarks, isActive) {
    this.id = task_id;
    this.name = task_name;
    this.tabs = tabs;
    this.bookmarks = bookmarks;
    this.history = [];
    this.active = isActive;
    this.activationTime = [];
    this.deactivationTime = [];
}

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
    if (cTaskIdObject["CTASKID"]) {
        CTASKID = cTaskIdObject["CTASKID"];
    }
});

//ENDING: Inititalising of variables


//BEGINNING: Level 1 Helpers

function returnDuration(startingTime, endingTime) {
    var startingTime = new Date(startingTime);
    var endingTime = new Date(endingTime);
    var hours = endingTime.getHours() - startingTime.getHours();
    var minutes = endingTime.getMinutes() - startingTime.getMinutes();
    var seconds = endingTime.getSeconds() - startingTime.getSeconds();
    var duration = {
        "hours": hours,
        "minutes": minutes,
        "seconds": seconds
    }
    return duration;
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

function createBookmarks(bookmarksNode) {
    for (var i = 0; i < bookmarksNode.length; i++) {
        var bookmark = bookmarksNode[i];
        if (bookmark.id > 2) {
            if (bookmark.url) {
                chrome.bookmarks.create({
                    "parentId": bookmark.parentId,
                    "index": bookmark.index,
                    "title": bookmark.title,
                    "url": bookmark.url
                });
            }
            else {
                chrome.bookmarks.create({
                    "parentId": bookmark.parentId,
                    "index": bookmark.index,
                    "title": bookmark.title
                });
            }
        }
        if (bookmark.children) {
            createBookmarks(bookmark.children);
        }
    }
}

function saveTasksToStorage() {
    chrome.storage.local.set({"TASKS": TASKS});
}

function addToHistory(url, taskId) {
    if (url != "chrome://newtab/" && url != "about:blank" && url) {
        TASKS[taskId].history.push(url);
    }
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
});

//ENDING: Stuff that calls the appropriate helper when a task is created/switched/deleted etc


//BEGINNING: Stuff that saves tabs of task

//Save a tab when the url is changed.
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

    if (changeInfo.title) {
        saveTask(CTASKID);
    }
    addToHistory(changeInfo.url, CTASKID)

});

//Save task when a tab is closed
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    if (!removeInfo.isWindowClosing) {
        saveTask(CTASKID);
    }
});

//ENDING: Stuff that saves tabs of task

// OAuth

function revokeToken() {

    chrome.identity.getAuthToken({ 'interactive': false },
        function(current_token) {
            if (!chrome.runtime.lastError) {

                // @corecode_begin removeAndRevokeAuthToken
                // @corecode_begin removeCachedAuthToken
                // Remove the local cached token
                chrome.identity.removeCachedAuthToken({ token: current_token },
                    function() {});
                // @corecode_end removeCachedAuthToken

                // Make a request to revoke token in the server
                var xhr = new XMLHttpRequest();
                xhr.open('GET', 'https://accounts.google.com/o/oauth2/revoke?token=' +
                    current_token);
                xhr.send();
                // @corecode_end removeAndRevokeAuthToken

                // Update the user interface accordingly

                $('#revoke').get(0).disabled = true;
                console.log('Token revoked and removed from cache. '+
                    'Check chrome://identity-internals to confirm.');
            }
        });
}

document.getElementById('login').addEventListener("click", function () {
    chrome.identity.getAuthToken({
        interactive: true
    }, function (token) {
        if (chrome.runtime.lastError) {
            alert(chrome.runtime.lastError.message);
            return;
        }
        var x = new XMLHttpRequest();
        x.open('GET', 'https://www.googleapis.com/oauth2/v2/userinfo?alt=json&access_token=' + token);
        x.onload = function () {
            alert(x.response);
        };
        x.send();
    });
});

document.getElementById('logout').addEventListener("click", function () {
    revokeToken();
});






