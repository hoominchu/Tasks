var globalStopwords = ["like", "search", "privacy policy", "contact us", "log in", "facebook", "twitter"];


function clusterTabs(){
    chrome.tabs.query({}, function(tabs){
        chrome.storage.local.get("Text Log", function(textLog){
            textLog = textLog["Text Log"];
            chrome.storage.local.get("Stopwords for websites", function(stopwords){
              var stopwords = stopwords["Stopwords for websites"];
              var urls = [];
              for(var i = 0; i<tabs.length; i++){
                urls.push(tabs[i].url);
              }
              clusterUrls(urls, textLog, stopwords, function(clusters){clusterPrinter(clusters);});
            });

        });

    });
}

function clusterUrls(urls, tagsDict, stopWords, callback){
  var weightsTable = []
  var urlsToCluster = [];
  for(var i = 0; i<urls.length; i++){
      if(tagsDict[urls[i]]){
          urlsToCluster.push(urls[i]);
      }
  }
  weightsTable = jaccardTable(urlsToCluster, tagsDict, stopWords);
  var clusters = jLouvain().nodes(urlsToCluster).edges(weightsTable);
  var result = clusters();
  callback(result);
}

function clusterPrinter(clusters){
  var clusterNumbers = new Set(Object.values(clusters));
  for(var i = 0 ; i<clusterNumbers.size; i++){
    console.log("Cluster Number " + i);
    for(var j = 0; j<Object.keys(clusters).length; j++){
      if(clusters[Object.keys(clusters)[j]] == i){
        console.log(Object.keys(clusters)[j]);
      }
    }
  }
}

function jaccardTable(urls, textLog, stopwords) {
    var table = [];
    for (var i = 0; i < urls.length; i++) {
        for (var j = 0; j < urls.length; j++) {
            if (i != j) {
                var firstUrlDomain = getDomainFromURL(urls[i]);
                var secondUrlDomain = getDomainFromURL(urls[j]);
                if (textLog[urls[i]] && textLog[urls[j]]) {
                    var firstUrlTags = (stopwords[firstUrlDomain]["urlsRead"].length > 1) ? (_.difference((_.difference(Object.keys(textLog[urls[i]]), globalStopwords)), stopwords[firstUrlDomain]["stopwords"])) : (_.difference(Object.keys(textLog[urls[i]]), globalStopwords));
                    var secondUrlTags = (stopwords[secondUrlDomain]["urlsRead"].length > 1) ? (_.difference((_.difference(Object.keys(textLog[urls[j]]), globalStopwords)), stopwords[secondUrlDomain]["stopwords"])) : (_.difference(Object.keys(textLog[urls[j]]), globalStopwords));
                    var jScore = getJaccardScores(firstUrlTags, secondUrlTags);
                    console.log("-------------------------------------------------------------------------------------------------");
                    console.log("URL1: " + urls[i] + " URL2: " + urls[j] + " score: " + jScore);
                    console.log("");
                    console.log(_.intersection(firstUrlTags, secondUrlTags));
                    console.log("-------------------------------------------------------------------------------------------------")
                    var temp = {
                        "source": urls[i],
                        "target": urls[j],
                        "weight": jScore
                    }
                    table.push(temp);
                }
                else {
                    var temp = {
                        "source": urls[i],
                        "target": urls[j],
                        "weight": 0
                    }
                    // console.log("URLs not in textLog.");
                    //table.push(temp);
                }
            }

        }
    }
    return table;
}
