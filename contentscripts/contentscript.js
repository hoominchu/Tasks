var initialURL = window.location.href
var idleTime = 0;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  if(request.type == "reload-like-button"){
    markLikedStatus(request.data.url);
  }
  if(request.type == "page-liked-with-shortcut"){
    $(".likeButton").toggleClass("clicked");
  }
});
