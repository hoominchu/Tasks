var initialURL = window.location.href
var idleTime = 0;
$(document).ready(function () {
    //Increment the idle time counter every minute.
    var idleInterval = setInterval(timerIncrement, 60000); // 1 minute

    //Zero the idle timer on mouse movement.
    $(this).mousemove(function (e) {
        idleTime = 0;
    });

    $(this).keypress(function (e) {
        idleTime = 0;
    });
});

function timerIncrement() {
    idleTime = idleTime + 1;
    console.log(idleTime);
    chrome.runtime.sendMessage({
      "type": "idle-time",
      "url": window.location.href,
      "idle-time": idleTime
    });
}

loadLikeButton(initialURL);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  loadLikeButton(request.data.url);
});

function loadLikeButton(currentURL){
  chrome.storage.local.get("TASKS", function (taskObject) {
      if (taskObject["TASKS"]) {
          var TASKS = taskObject["TASKS"];//On retreiving TASKS from chrome storage, one gets an object {TASKS: balhah}, to retreive the actual array call taskObject["TASKS"]
          chrome.storage.local.get("CTASKID", function (cTaskIdObject) {
              if (cTaskIdObject["CTASKID"]>-1) {
                  var CTASKID = cTaskIdObject["CTASKID"];
                  if(TASKS[CTASKID].history.find((page) => page.url === currentURL)){
                    var pageLiked = (TASKS[CTASKID].history.find((page) => page.url === currentURL)).isLiked;
                  }
                  if(pageLiked){
                    var likeButton = $('<div class="float" style="font-size:35px;"><i class="fa fa-thumbs-up likeButton clicked"></i></div>')
                  }
                  else{
                    var likeButton = $('<div class="float" style="font-size:35px;"><i class="fa fa-thumbs-up likeButton" ></i></div>')
                  }
                  $('body').append(likeButton);
                  if(pageLiked){
                    $(".likeButton").toggleClass(".clicked");
                  }
                  $(".likeButton").click(function(){
                    $(this).toggleClass("clicked");
                    return function(){
                      chrome.runtime.sendMessage({
                        "type": "like-page",
                        "url": currentURL
                      });
                    }();
                  });
              }
          });
      }
  });
}
