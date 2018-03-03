var searchValue = "";
var currentSearchResultsLength = 0;

$("#searchButton").click(function(){
  var searchValue = $("#searchValue").val();
  $("#logo-large-search-page").remove();
  $("#search-bar-large-center").css({"margin-top" : "40px"});
  // $("#main-content").append("<h2>"+searchValue+"</h2>");
  chrome.runtime.sendMessage({
    "type": "search",
    "query": searchValue
  });
});

chrome.runtime.onMessage.addListener(function(request, sender){
  if(request.type=="search-reply"){
      if(request.finalResults.length>currentSearchResultsLength){
          $("#searchResults").empty();
          showSearchResults(request.finalResults);
          currentSearchResultsLength = request.finalResults.length;
      }
    }
  });

  function showSearchResults(results) {
      for (var i = 0; i<results.length; i++) {

          var resultCard = document.createElement("div");
          resultCard.className = "search-result-card";

          // Setting up variables from result object
          var url = results[i]["URL"];
          var engine = results[i]["Engine"];
          var weight = results[i]["Weight"];
          var title = results[i]["Title"];
          var snippet = results[i]["Desc"];

          // Creating elements to be displayed
          var resultTitleElem = document.createElement("h4");
          // resultTitleElem.className = "search-result-title";
          var resultTitleLinkElem = document.createElement("a");
          resultTitleLinkElem.setAttribute("href",url);
          resultTitleLinkElem.innerText = title;
          resultTitleElem.appendChild(resultTitleLinkElem);

          var engineElem = document.createElement("span");
          engineElem.className = "badge badge-pill badge-light";
          engineElem.innerText = engine;

          var weightElem = document.createElement("div");
          weightElem.className = "search-result-weight";
          weightElem.innerText = weight;

          var linkElem = document.createElement("p");
          linkElem.className = "search-result-link text-success";
          linkElem.innerText = url;

          var snippetElem = document.createElement("p");
          snippetElem.className = "search-result-snippet text-muted";
          snippetElem.innerText = snippet;

          // Adding all the components to result card
          resultCard.appendChild(resultTitleElem);
          resultCard.appendChild(engineElem);
          // resultCard.appendChild(weightElem);
          resultCard.appendChild(linkElem);
          resultCard.appendChild(snippetElem);

          document.getElementById("searchResults").appendChild(resultCard);
      }
  }
