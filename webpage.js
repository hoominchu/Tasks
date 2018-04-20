function Page(url, title, isLiked, isBookmarked){
  this.url = url;
  this.title = title;
  this.timeSpent = [];
  this.isLiked = isLiked;
  this.isBookmarked = isBookmarked;
  this.timeVisited = [];
  this.exitTimes = [];
  this.totalTimeSpent = 0;
  this.idleTime = 0;
  this.parentTabs = [];
}

function addIdleTime(url, idleTime){
  TASKS[CTASKID].history.find((page) => page.url === url).idleTime = idleTime;
}

function getTotalTimeSpent(Page){
  var timeSpent = Page.timeSpent;
  var idleTime = Page.idleTime;
  t_timeSpent = 0
  for(var i = 0; i<timeSpent.length; i++){
    t_timeSpent = t_timeSpent + timeSpent[i]
  }
  actualTimeSpent = t_timeSpent;
  return actualTimeSpent;
}

function returnPage(page, url){
  return page.url === url;
}

function updateExitTime(url, time){
    var pageIndex = indexOfElementWithProperty(TASKS[CTASKID].history, "url", url);
    if(pageIndex != -1){
        var page = TASKS[CTASKID].history[pageIndex];
        page.exitTimes.push(time);
        var duration = returnDuration(page.timeVisited[page.timeVisited.length-1], time);
        page.timeSpent.push(duration);
        page.totalTimeSpent = getTotalTimeSpent(page);
  }
}

function likePage(url, method){
  var page = TASKS[CTASKID].history[indexOfElementWithProperty(TASKS[CTASKID].history, "url", url)];
  page.isLiked = !(page.isLiked);
  if(method == "shortcut"){
    chrome.tabs.sendMessage(activeTabId, {
      "type":"page-liked-with-shortcut"
    });
  }
  updatePreferredDomain(url);
  updateStorage("TASKS",TASKS);
}
