var initialURL = window.location.href

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
                  var pageLiked = TASKS[CTASKID].history.find((page) => page.url === currentURL ).isLiked;
                  console.log(pageLiked)
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
