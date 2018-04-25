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
    this.archived = false;
}

function createDefaultTask(){
  var task = new Task(0, "Default", {}, {}, true);
  TASKS[task.id] = task;
  chrome.windows.getCurrent(function(window){
      taskToWindow[0] = window.id;
  });
}

createDefaultTask();

function addToHistory(url, title, task_id){
  if(url!= "chrome://newtab/" && url!="about:blank" && url){
    if(TASKS[task_id].history.find((page) => page.url === url)) {
      var date = new Date();
      TASKS[task_id].history.find((page) => page.url === url).timeVisited.push(date.toString());
    }
    else{
      var newPage = new Page(url, title)
      var date = new Date;
      newPage.timeVisited.push(date.toString());
      TASKS[task_id].history.push(newPage);
    }
  }
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

function likePages(urls, task_id){
    for(var i = 0; i<urls.length; i++){
        TASKS[task_id].history[indexOfElementWithProperty(TASKS[task_id].history, "url", urls[i])].isLiked = !TASKS[task_id].history[indexOfElementWithProperty(TASKS[task_id].history, "url", urls[i])].isLiked;
    }
    updateStorage("TASKS", TASKS);
}

function deleteFromHistory(urls, task_id){
    for(var i =0; i<urls.length; i++){
        TASKS[task_id].history.splice(indexOfElementWithProperty(TASKS[task_id].history, "url", urls[i]), 1);
    }
    updateStorage("TASKS", TASKS);
}

function createTask(taskName, tabs, createFromCurrentTabs, bookmarks) {
    if (createFromCurrentTabs) {
        var newTask = new Task(TASKS["lastAssignedId"] + 1, taskName, tabs, bookmarks);
        TASKS[TASKS["lastAssignedId"] + 1] = newTask;
        TASKS["lastAssignedId"] = TASKS["lastAssignedId"] + 1;
        updateStorage("TASKS",TASKS);
    }
    else {
        var emptyArray = [];
        var newTask = new Task(TASKS["lastAssignedId"] + 1, taskName, emptyArray, bookmarks);
        TASKS[TASKS["lastAssignedId"] + 1] = newTask;
        TASKS["lastAssignedId"] = TASKS["lastAssignedId"] + 1;
        updateStorage("TASKS",TASKS);
    }
}

function addTabsToTask(taskId, tabs){
  TASKS[taskId].tabs = TASKS[taskId].tabs.concat(tabs);
  updateStorage("TASKS", TASKS);
  if(taskToWindow.hasOwnProperty(taskId)){
    //If there is a task that is not open but is in Task urls then open that
    chrome.windows.get(taskToWindow[taskId], {"populate":true}, function(window){
      var tabs = window.tabs;
      var openUrls = new Set();
      for(var i = 0; i<tabs.length; i++){
        openUrls.add(tabs[i].url);
      }
      var taskUrls = new Set();
      for(var j = 0;j<TASKS[taskId].tabs.length; j++){
        taskUrls.add(TASKS[taskId].tabs[j].url);
      }
      if(taskUrls.size > openUrls.size){
        taskUrls.forEach(function(url){
          if(!openUrls.has(url)){
            chrome.tabs.create({"windowId": window.id, "url":url, "selected": false});
          }
        });
      }
    });
  }

}



function activateTaskInWindow(task_id){
    try {

        //If the task is already open in some window, focus the window
        if(taskToWindow.hasOwnProperty(task_id)){
            chrome.windows.update(taskToWindow[task_id], {"focused": true});


        }
        //If not, then open all the urls from the task in a new window
        else{
            //If task has any urls, then open them in a new window and assign the new window to the task.
            if (TASKS[task_id].tabs.length > 0) {
                var urls = [];
                for (var i = 0; i < TASKS[task_id].tabs.length; i++) {
                    urls.push(TASKS[task_id].tabs[i].url);
                }
                chrome.windows.create({"url": urls}, function(window){
                    var taskId = task_id;
                    taskToWindow[taskId] = window.id;
                });
            }
            //If not, then just open a new page.
            else {
                chrome.windows.create({"url": "about:blank"}, function (window) {
                    var taskId = task_id;
                    taskToWindow[taskId] = window.id;
                });
            }

        }
        // createBookmarks(TASKS[task_id].bookmarks);

        //Set the badge text as new task name.
        chrome.browserAction.setBadgeText({"text": TASKS[task_id].name.slice(0, 4)});

        //Mark task as active.
        var now = new Date();
        TASKS[task_id].activationTime.push(now.toString());
        TASKS[task_id].isActive = true;

        //Set the CTASKID as the id of the task and update Storage.
        CTASKID = task_id;
        updateStorage("TASKS",TASKS);
        chrome.storage.local.set({"CTASKID": task_id});

    }
    catch (err) {
        console.log(err.message);
    }

}

//Run this when you want to save a task
function saveTaskInWindow(task_id){
    if(TASKS[task_id]){
        chrome.tabs.query({"windowId": taskToWindow[task_id]}, function(tabs){
            TASKS[task_id].tabs = tabs;
            updateStorage("TASKS", TASKS);
        });
        chrome.bookmarks.getTree(function (bookmarks) {
            TASKS[task_id].bookmarks = bookmarks;
            updateStorage("TASKS",TASKS);
        });
    }
}


//Run this when a task is closed
function deactivateTaskInWindow(task_id){
    if(taskToWindow.hasOwnProperty(task_id)){
        // saveTaskInWindow(task_id);
        // closeAllTabs(false, taskToWindow[task_id]);
        // removeBookmarks();
        var now = new Date();
        TASKS[task_id].deactivationTime.push(now.toString());
        TASKS[task_id].isActive = false;
        updateStorage("TASKS",TASKS);
    }
    //Set the badge text to nothing
    chrome.browserAction.setBadgeText({"text": ""});
}

function deleteTask(task_id) {
    if (TASKS[task_id]) {
        if(taskToWindow[task_id]){
            alert("This task is open. Please close it before deleting.");
        }
        else{
            var confirmation = confirm("Deleting a task will remove all the history and liked pages of the task. Are you sure you want to delete it ?");
            if(confirmation){
                delete TASKS[task_id];
                if(taskToWindow[task_id]){
                    chrome.windows.remove(taskToWindow[task_id]);
                    delete taskToWindow[task_id];
                }
                updateStorage("TASKS",TASKS);
            }
        }
    }
}

function renameTask(task_id, newName) {
    if (TASKS[task_id]) {
        TASKS[task_id].name = newName;
        updateStorage("TASKS",TASKS);
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

function addToTask(url, task_id) {
    TASKS[task_id].tabs.push({"url": url});
}

function archiveTask(task_id){
    if(task_id != CTASKID){
        TASKS[task_id].archived = !TASKS[task_id].archived;
        updateStorage("TASKS", TASKS);
    }
    else{
        alert("Can't archive an open task. Please switch before archiving.")
    }

}

function openLikedPages(task_id){
  var likedPages = getLikedPages(task_id);
  var likedPagesUrls = [];
  for(var i = 0; i<likedPages.length; i++){
    likedPagesUrls.push(likedPages[i].url);
  }
  openTabs(likedPagesUrls);
}

function closeTask(taskId){
    chrome.windows.remove(taskToWindow["taskId"])
}
