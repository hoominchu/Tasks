chrome.storage.local.get("TASKS", function (taskObject) {
  if(taskObject["TASKS"]) {
      var TASKS = taskObject["TASKS"];//On retreiving TASKS from chrome storage, one gets an object {TASKS: balhah}, to retreive the actual array call taskObject["TASKS"]
      chrome.storage.local.get("CTASKID", function (cTaskIdObject) {
          if (cTaskIdObject["CTASKID"]>-1) {
              var CTASKID = cTaskIdObject["CTASKID"];
              loadLikeButton();
              markLikedStatus(initialURL);
              loadDock();
          }
        });
    }
  });

function loadDock(){
    var dock = $('<div class="" style="width: 100%; height: 8em; background-color: #20454f"></div>');
    $('body').appendChild(dock);
}

  function loadLikeButton(){
    var likeButton = $('<div class="float" style="font-size:35px;"><i class="fa fa-thumbs-up likeButton"></i></div>');
    $('body').append(likeButton);
      $(".likeButton").click(function(){
          $(this).toggleClass("clicked");
          // return function(){
              chrome.runtime.sendMessage({
                  "type": "like-page",
                  "url": window.location.href
              });
          // }
      });
  }

  function markLikedStatus(url){
    chrome.storage.local.get("TASKS", function (taskObject) {
      if(taskObject["TASKS"]) {
          var TASKS = taskObject["TASKS"];//On retreiving TASKS from chrome storage, one gets an object {TASKS: balhah}, to retreive the actual array call taskObject["TASKS"]
          chrome.storage.local.get("CTASKID", function (cTaskIdObject) {
              if (cTaskIdObject["CTASKID"]>-1) {
                  var CTASKID = cTaskIdObject["CTASKID"];
                  var pageLiked = false;
                  if(TASKS[CTASKID].history.find((page) => page.url === url)){
                    var page = TASKS[CTASKID].history.find((page) => page.url === url);
                    if(page.isLiked){
                      pageLiked = true;
                    }
                  }
                if(pageLiked){
                  $(".likeButton").addClass("clicked");
                }
                else{
                  if($(".likeButton").hasClass("clicked")){
                    $(".likeButton").removeClass("clicked");
                  }
                }
              }
            });
          }
        });
  }

