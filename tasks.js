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
  updateStorage("TASKS",TASKS);
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
        updateStorage("TASKS",TASKS);

    }
    catch (err) {
        console.log(err.message);
    }
}

function saveTask(task_id) {
    if (TASKS[task_id]) {
        chrome.tabs.query({}, function (allTabs) {
            TASKS[task_id].tabs = allTabs;
            updateStorage("TASKS",TASKS);
        });
        chrome.bookmarks.getTree(function (bookmarks) {
            TASKS[task_id].bookmarks = bookmarks;
            updateStorage("TASKS",TASKS);
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
        updateStorage("TASKS",TASKS);
    }
    else if (currentTaskId == -1) {
        closeAllTabs(false, chrome.windows.WINDOW_ID_CURRENT)
    }
}

function deleteTask(task_id) {
    if (TASKS[task_id]) {
        delete TASKS[task_id];
        updateStorage("TASKS",TASKS);
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
