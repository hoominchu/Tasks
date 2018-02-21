var engines = [

  {
    "engine": "Yahoo",
    "mainUrl": "https://in.search.yahoo.com/search?p=",
    "pageUrl": "&b=",
    "indexMarker": function(j){
      return ((j*10)+1)
    },
    "selector": [{"class": "fz-ms fw-m fc-12th wr-bw"}],
      "finalSelector": "innerText"
  },

  {
    "engine": "Bing",
    "mainUrl": "https://www.bing.com/search?q=",
    "pageUrl": "&first=",
    "indexMarker": function(j){
      return j*10;
    },
    "selector": [{"class": "b_algo"}, {"tag": "h2"}, {"tag": "a"}],
    "finalSelector": "href"
  }

]

// This function takes results object which contains results from Google, Bing, Yahoo etc., preferredDomains object and preferredAuthors object.
// Returns array of re-ordered (in descending order of computed weights) results with result object. Fields of result object are -- URL, Engine and Weight.
function getSailboatResults(results, preferredDomains, preferredAuthors) {

    var sailboatResults = [];

    for (var i = 0; i < results.length; i++) {
        var resultObj = {};
        var resObjTemp = results[i];
        var link = resObjTemp["url"];
        var engine = resObjTemp["engine"];
        var domain = getDomainFromURL(link);
        // var authorName = getAuthors(link);
        // var authorUniqueID = authorName + ", " + domain;
        var finalWeight = 0;

        var domainWeight = 0;
        var authorWeight = 0;

        if (preferredDomains[domain]) {
            domainWeight = getDomainWeight(domain,preferredDomains);
        }

        // if (preferredAuthors[authorUniqueID]) {
        //     authorWeight = getAuthorWeight(authorName, domain, preferredAuthors);
        // }

        // Computing final weight for a result. computeFinalWeight can be edited
        finalWeight = domainWeight;//computeFinalWeight(domainWeight, authorWeight);
        resultObj["URL"] = link;
        resultObj["Engine"] = engine;
        resultObj["Weight"] = finalWeight;

        sailboatResults.push(resultObj);
    }

    // Sorting sailboatResults in descending order of weight
    var awesomeResult = sailboatResults.sort(function (a, b) {
        return b["Weight"] - a["Weight"];
    });

    return awesomeResult;
}


// This function adds the weights given. But computeFinalWeight function can be done in other ways as well.
function computeFinalWeight(wt1, wt2) {

    var returnValue = wt1 + wt2;
    return returnValue;
}

function httpGetAsync(theUrl, callback, engine){

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText, engine);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous
    xmlHttp.send(null);
}

function extractUrls(engine, htmlString){
  var urls = [];
  var parser = new DOMParser();
  var doc = parser.parseFromString(htmlString, "text/html");
  var urlObjects = doc.querySelectorAll(returnQuery(engine.selector));
  for(var i =0; i<urlObjects.length; i++){
    urls.push(urlObjects[i][engine.finalSelector])
  }
  return urls;
}

var urlsList = [];

function returnUrlsList(query, engines, callback){
  for(var i = 0; i < engines.length; i++){
    for(var j = 0; j < 1; j++){
      setInterval(httpGetAsync(engines[i].mainUrl+query+engines[i].pageUrl+engines[i].indexMarker(j), function(response, engine){
        var engineName = engine["engine"];
        var urls = extractUrls(engine, response);
        for(var k = 0; k<urls.length; k++){
          var temp = {};
          temp["url"] = urls[k];
          temp["engine"] = engineName;
          urlsList.push(temp);
        }
        if(urlsList.length>10)
        {
          // console.log(urlsList);
          callback();
        }
      }, engines[i]), getRandomInt(30000, 60000));
    }
  }
}

returnUrlsList("Steve", engines, function(){
  chrome.storage.local.get(preferredDomainsFieldName, function (preferredDomainsObject) {
    chrome.storage.local.get(preferredAuthorsFieldName, function(preferredAuthorsObject){
        console.log(urlsList);
      console.log(getSailboatResults(urlsList, preferredDomainsObject[preferredDomainsFieldName], preferredAuthorsObject[preferredAuthorsFieldName]));
    })
  })});
