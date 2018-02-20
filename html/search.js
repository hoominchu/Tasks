var searchValue = "";

$("#search").click(function(){
  var searchValue = $("#searchValue").val();
  $("#main-content").append("<h2>"+searchValue+"</h2>");
  chrome.runtime.sendMessage({
    "type": "search",
    "query": searchValue
  });
});

chrome.runtime.onMessage.addListener(function(request, sender){
  if(request.type=="search-reply"){
    $("#searchResults").empty();
    for(var i = 0; i <request.urlsList.length; i++){
      engineName = Object.keys(request.urlsList[i])[0];
      var engineNameObject = $("<h2>"+engineName+"</h2>");
      $("#searchResults").append(engineNameObject);
      var list = $("<ol></ol>");
      for(var j = 0; j<request.urlsList[i][engineName].length; j++){
        var li = $("<li>"+request.urlsList[i][engineName][j]+"</li>");
        list.append(li);
      }
      $("#searchResults").append(list);
    }
  }
});
