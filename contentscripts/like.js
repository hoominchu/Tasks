// chrome.storage.local.get("TASKS", function (taskObject) {
//   if(taskObject["TASKS"]) {
//       var TASKS = taskObject["TASKS"];//On retreiving TASKS from chrome storage, one gets an object {TASKS: balhah}, to retreive the actual array call taskObject["TASKS"]
//       chrome.storage.local.get("CTASKID", function (cTaskIdObject) {
//           if (cTaskIdObject["CTASKID"]>-1) {
//               var CTASKID = cTaskIdObject["CTASKID"];
//               loadLikeButton();
//               markLikedStatus(initialURL);
//           }
//         });
//     }
//   });
//
//   function loadLikeButton(){
//     var likeButton = $('<div class="float btn-sailboat round-corner" id="sailboat-like-btn">Archive</div>');
//     $('body').append(likeButton);
//       $("#sailboat-like-btn").draggable();
//       $("#sailboat-like-btn").click(function(){
//           //$(this).toggleClass("btn-secondary");
//           $(this).toggleClass("btn-sailboat-primary");
//           // return function(){
//               chrome.runtime.sendMessage({
//                   "type": "like-page",
//                   "url": window.location.href
//               });
//           // }
//       });
//   }
//
//   function markLikedStatus(url){
//     chrome.storage.local.get("TASKS", function (taskObject) {
//       if(taskObject["TASKS"]) {
//           var TASKS = taskObject["TASKS"];//On retreiving TASKS from chrome storage, one gets an object {TASKS: balhah}, to retreive the actual array call taskObject["TASKS"]
//           chrome.storage.local.get("CTASKID", function (cTaskIdObject) {
//               if (cTaskIdObject["CTASKID"]>-1) {
//                   var CTASKID = cTaskIdObject["CTASKID"];
//                   var pageLiked = false;
//                   if(TASKS[CTASKID].history.find((page) => page.url === url)){
//                     var page = TASKS[CTASKID].history.find((page) => page.url === url);
//                     if(page.isLiked){
//                       pageLiked = true;
//                     }
//                   }
//                 if(pageLiked){
//                   $("#sailboat-like-btn").addClass("btn-sailboat-primary");
//                 }
//                 else{
//                   if($("#sailboat-like-btn").hasClass("btn-sailboat-secondary")){
//                     $("#sailboat-like-btn").removeClass("btn-sailboat-secondary");
//                   }
//                 }
//               }
//             });
//           }
//         });
//   }
